import { describe, expect, it } from "vitest";
import type { CampSessionRecord } from "$lib/entities/camp-session";
import { CampHourTransitionService } from "../domain/CampHourTransitionService";

const TEST_TIMESTAMP = "2026-06-26T22:25:00.000Z";

describe("CampHourTransitionService", () => {
	it("prepares the next hour from a resolved session", () => {
		const service = new CampHourTransitionService();
		const session = buildSession();

		const result = service.prepareNextHour({
			session,
			preparedAt: TEST_TIMESTAMP,
		});

		expect(result).toEqual({
			success: true,
			data: {
				...session,
				currentHour: 2,
				status: "planning",
				updatedAt: TEST_TIMESTAMP,
			},
		});
	});

	it("rejects invalid transition input", () => {
		const service = new CampHourTransitionService();

		const result = service.prepareNextHour({
			session: buildSession(),
			preparedAt: "invalid-date",
		});

		expect(result).toMatchObject({
			success: false,
			error: { code: "INVALID_CAMP_HOUR_TRANSITION_INPUT" },
		});
	});

	it("rejects a session that is still being planned", () => {
		const service = new CampHourTransitionService();

		const result = service.prepareNextHour({
			session: buildSession({ status: "planning" }),
			preparedAt: TEST_TIMESTAMP,
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "CAMP_SESSION_NOT_RESOLVED",
				message: "Camp session must be resolved before preparing another hour.",
				details: { sessionId: "camp-session-1" },
			},
		});
	});

	it("rejects a transition beyond the 24-hour schema boundary", () => {
		const service = new CampHourTransitionService();

		const result = service.prepareNextHour({
			session: buildSession({ currentHour: 24 }),
			preparedAt: TEST_TIMESTAMP,
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "CAMP_HOUR_LIMIT_REACHED",
				message: "Camp session reached the supported hour limit.",
				details: { currentHour: 24, sessionId: "camp-session-1" },
			},
		});
	});
});

function buildSession(
	patch: Partial<CampSessionRecord> = {},
): CampSessionRecord {
	return {
		id: "camp-session-1",
		currentHour: 1,
		danger: 3,
		status: "resolved",
		fortifyClockId: "fortify-perimeter",
		createdAt: "2026-06-26T21:00:00.000Z",
		updatedAt: "2026-06-26T22:00:00.000Z",
		...patch,
	};
}
