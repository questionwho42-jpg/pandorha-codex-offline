import { describe, expect, it } from "vitest";
import { CAMP_ACTIVITY_CATALOG } from "$lib/entities/camp-activity";
import type {
	CampAssignmentRecord,
	CampSessionRecord,
} from "$lib/entities/camp-session";
import {
	type ClockRecord,
	ClockService,
	InMemoryClockRepository,
} from "$lib/entities/clock";
import type { Result } from "$lib/shared/lib/result";
import { CampHourService } from "../domain/CampHourService";
import type { CampHourFailure, CampHourResult } from "../model/campHourTypes";

const TEST_TIMESTAMP = "2026-05-19T12:15:00.000Z";

describe("CampHourService", () => {
	it("resolves one planned hour with one action per character", async () => {
		const result = await createService().resolveHour({
			session: buildSession(),
			assignments: [
				buildAssignment({ characterId: "character-1", activityId: "watch" }),
				buildAssignment({
					id: "assignment-2",
					characterId: "character-2",
					activityId: "cook-meal",
				}),
			],
			activities: CAMP_ACTIVITY_CATALOG,
			resolvedAt: TEST_TIMESTAMP,
		});
		const hour = expectCampHourSuccess(result);

		expect(hour.session).toMatchObject({
			id: "camp-session-1",
			currentHour: 1,
			danger: 1,
			status: "resolved",
			updatedAt: TEST_TIMESTAMP,
		});
		expect(hour.watchCoverageMaintained).toBe(true);
		expect(hour.advancedClock).toBeNull();
		expect(hour.events.map((event) => event.type)).toEqual([
			"camp-action-registered",
			"camp-action-registered",
			"camp-watch-covered",
			"camp-danger-increased",
			"camp-hour-resolved",
		]);
	});

	it("advances the shared fortify perimeter clock deterministically", async () => {
		const result = await createService([buildClock()]).resolveHour({
			session: buildSession({ fortifyClockId: "fortify-perimeter" }),
			assignments: [
				buildAssignment({
					characterId: "character-1",
					activityId: "fortify-perimeter",
				}),
				buildAssignment({
					id: "assignment-2",
					characterId: "character-2",
					activityId: "fortify-perimeter",
				}),
			],
			activities: CAMP_ACTIVITY_CATALOG,
			resolvedAt: TEST_TIMESTAMP,
		});
		const hour = expectCampHourSuccess(result);

		expect(hour.advancedClock).toMatchObject({
			id: "fortify-perimeter",
			currentSlices: 2,
			status: "active",
		});
		expect(hour.events.map((event) => event.message)).toContain(
			"Fortificar perímetro avançou 2 fatias.",
		);
	});

	it("marks the shared clock complete when the exact limit is reached", async () => {
		const result = await createService([
			buildClock({ currentSlices: 3 }),
		]).resolveHour({
			session: buildSession({ fortifyClockId: "fortify-perimeter" }),
			assignments: [
				buildAssignment({
					characterId: "character-1",
					activityId: "fortify-perimeter",
				}),
			],
			activities: CAMP_ACTIVITY_CATALOG,
			resolvedAt: TEST_TIMESTAMP,
		});
		const hour = expectCampHourSuccess(result);

		expect(hour.advancedClock).toMatchObject({
			currentSlices: 4,
			status: "completed",
		});
	});

	it("rejects duplicated character assignments in the same hour", async () => {
		const failure = expectCampHourFailure(
			await createService().resolveHour({
				session: buildSession(),
				assignments: [
					buildAssignment({ characterId: "character-1", activityId: "watch" }),
					buildAssignment({
						id: "assignment-2",
						characterId: "character-1",
						activityId: "repair-equipment",
					}),
				],
				activities: CAMP_ACTIVITY_CATALOG,
				resolvedAt: TEST_TIMESTAMP,
			}),
		);

		expect(failure.code).toBe("DUPLICATE_CAMP_CHARACTER_ASSIGNMENT");
	});

	it("rejects sessions that are not in planning state", async () => {
		const failure = expectCampHourFailure(
			await createService().resolveHour({
				session: buildSession({ status: "resolved" }),
				assignments: [buildAssignment()],
				activities: CAMP_ACTIVITY_CATALOG,
				resolvedAt: TEST_TIMESTAMP,
			}),
		);

		expect(failure.code).toBe("CAMP_SESSION_NOT_PLANNING");
	});

	it("rejects invalid session, assignment and activity relationships", async () => {
		const wrongSessionFailure = expectCampHourFailure(
			await createService().resolveHour({
				session: buildSession(),
				assignments: [buildAssignment({ sessionId: "other-session" })],
				activities: CAMP_ACTIVITY_CATALOG,
				resolvedAt: TEST_TIMESTAMP,
			}),
		);
		const wrongHourFailure = expectCampHourFailure(
			await createService().resolveHour({
				session: buildSession(),
				assignments: [buildAssignment({ hour: 2 })],
				activities: CAMP_ACTIVITY_CATALOG,
				resolvedAt: TEST_TIMESTAMP,
			}),
		);
		const unknownActivityFailure = expectCampHourFailure(
			await createService().resolveHour({
				session: buildSession(),
				assignments: [buildAssignment({ activityId: "sleep" })],
				activities: CAMP_ACTIVITY_CATALOG,
				resolvedAt: TEST_TIMESTAMP,
			}),
		);

		expect(wrongSessionFailure.code).toBe("CAMP_ASSIGNMENT_SESSION_MISMATCH");
		expect(wrongHourFailure.code).toBe("CAMP_ASSIGNMENT_HOUR_MISMATCH");
		expect(unknownActivityFailure.code).toBe("UNKNOWN_CAMP_ACTIVITY");
	});

	it("rejects fortify perimeter without a valid clock", async () => {
		const missingClockFailure = expectCampHourFailure(
			await createService().resolveHour({
				session: buildSession({ fortifyClockId: null }),
				assignments: [
					buildAssignment({
						characterId: "character-1",
						activityId: "fortify-perimeter",
					}),
				],
				activities: CAMP_ACTIVITY_CATALOG,
				resolvedAt: TEST_TIMESTAMP,
			}),
		);
		const clockFailure = expectCampHourFailure(
			await createService([
				buildClock({ currentSlices: 4, status: "completed" }),
			]).resolveHour({
				session: buildSession({ fortifyClockId: "fortify-perimeter" }),
				assignments: [
					buildAssignment({
						characterId: "character-1",
						activityId: "fortify-perimeter",
					}),
				],
				activities: CAMP_ACTIVITY_CATALOG,
				resolvedAt: TEST_TIMESTAMP,
			}),
		);

		expect(missingClockFailure.code).toBe("MISSING_CAMP_CLOCK");
		expect(clockFailure.code).toBe("CAMP_CLOCK_ADVANCE_FAILED");
	});

	it("rejects invalid input before resolving activity effects", async () => {
		const failure = expectCampHourFailure(
			await createService().resolveHour({
				session: { ...buildSession(), id: "" },
				assignments: [],
				activities: CAMP_ACTIVITY_CATALOG,
				resolvedAt: "invalid",
			}),
		);

		expect(failure.code).toBe("INVALID_CAMP_HOUR_INPUT");
	});
});

function createService(clocks: readonly ClockRecord[] = []): CampHourService {
	return new CampHourService(
		new ClockService(new InMemoryClockRepository({ records: clocks })),
	);
}

function buildSession(
	patch: Partial<CampSessionRecord> = {},
): CampSessionRecord {
	return {
		id: "camp-session-1",
		currentHour: 1,
		danger: 0,
		status: "planning",
		fortifyClockId: "fortify-perimeter",
		createdAt: TEST_TIMESTAMP,
		updatedAt: TEST_TIMESTAMP,
		...patch,
	};
}

function buildAssignment(
	patch: Partial<CampAssignmentRecord> = {},
): CampAssignmentRecord {
	return {
		id: "assignment-1",
		sessionId: "camp-session-1",
		characterId: "character-1",
		activityId: "watch",
		hour: 1,
		createdAt: TEST_TIMESTAMP,
		...patch,
	};
}

function buildClock(patch: Partial<ClockRecord> = {}): ClockRecord {
	return {
		id: "fortify-perimeter",
		label: "Fortificar perímetro",
		currentSlices: 0,
		maxSlices: 4,
		status: "active",
		source: "camp",
		createdAt: TEST_TIMESTAMP,
		updatedAt: TEST_TIMESTAMP,
		...patch,
	};
}

function expectCampHourSuccess(
	result: Result<CampHourResult, CampHourFailure>,
): CampHourResult {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectCampHourFailure(
	result: Result<CampHourResult, CampHourFailure>,
): CampHourFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}
