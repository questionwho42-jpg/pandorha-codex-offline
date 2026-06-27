import { describe, expect, it } from "vitest";
import type { CampSessionRecord } from "$lib/entities/camp-session";
import { createCampSession } from "./campSession";

describe("createCampSession", () => {
	it("exposes the bounded next-hour transition", () => {
		const session = createCampSession();

		const result = session.prepareNextHour({
			session: buildResolvedSession(),
			preparedAt: "2026-06-26T22:30:00.000Z",
		});

		expect(result).toMatchObject({
			success: true,
			data: {
				currentHour: 2,
				danger: 2,
				status: "planning",
			},
		});
	});
});

function buildResolvedSession(): CampSessionRecord {
	return {
		id: "camp-session-1",
		currentHour: 1,
		danger: 2,
		status: "resolved",
		fortifyClockId: "fortify-perimeter",
		createdAt: "2026-06-26T21:00:00.000Z",
		updatedAt: "2026-06-26T22:00:00.000Z",
	};
}
