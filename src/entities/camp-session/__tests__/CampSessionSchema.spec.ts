import { describe, expect, it } from "vitest";
import {
	campAssignmentSelectSchema,
	campSessionSelectSchema,
} from "../model/campSessionSchema";

const TEST_TIMESTAMP = "2026-05-15T21:18:00.000Z";

describe("Camp session schemas", () => {
	it("accepts the minimum persisted camp session shape", () => {
		expect(
			campSessionSelectSchema.safeParse({
				id: "camp-session-1",
				currentHour: 1,
				danger: 0,
				status: "planning",
				fortifyClockId: "fortify-perimeter",
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
			}).success,
		).toBe(true);
	});

	it("accepts one persisted assignment per character and hour", () => {
		expect(
			campAssignmentSelectSchema.safeParse({
				id: "assignment-1",
				sessionId: "camp-session-1",
				characterId: "character-1",
				activityId: "watch",
				hour: 1,
				createdAt: TEST_TIMESTAMP,
			}).success,
		).toBe(true);
	});

	it("rejects invalid persisted session and assignment inputs", () => {
		expect(
			campSessionSelectSchema.safeParse({
				id: "",
				currentHour: 0,
				danger: -1,
				status: "night",
				fortifyClockId: "",
				createdAt: "invalid",
				updatedAt: "invalid",
			}).success,
		).toBe(false);
		expect(
			campAssignmentSelectSchema.safeParse({
				id: "",
				sessionId: "",
				characterId: "",
				activityId: "",
				hour: 0,
				createdAt: "invalid",
			}).success,
		).toBe(false);
	});
});
