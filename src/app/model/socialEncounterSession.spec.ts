import { describe, expect, it, vi } from "vitest";
import { createSocialEncounterSession } from "./socialEncounterSession";

describe("createSocialEncounterSession", () => {
	it("creates deterministic training inputs for social encounter UI", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-20T14:00:00.000Z"));
		const session = createSocialEncounterSession();

		const startInput = session.createStartInput("training-broker");
		const appealInput = session.createAppealInput({
			id: "social-encounter-primary",
			npcId: "training-broker",
			actorId: "session-party",
			status: "active",
			attitude: "skeptical",
			mentalHpCurrent: 8,
			mentalHpMax: 8,
			patienceCurrent: 6,
			patienceMax: 6,
			persuasionProgress: 0,
			persuasionTarget: 3,
			events: [],
			log: [],
			createdAt: "2026-05-20T14:00:00.000Z",
			updatedAt: "2026-05-20T14:00:00.000Z",
		});

		expect(session.npcs.map((npc) => npc.id)).toContain("training-broker");
		expect(startInput).toEqual({
			id: "social-encounter-primary",
			actorId: "session-party",
			npcId: "training-broker",
			requestComplexity: 2,
			createdAt: "2026-05-20T14:00:00.000Z",
		});
		expect(appealInput.command).toMatchObject({
			id: "social-appeal-1",
			type: "social-appeal",
			source: "training-social-ui",
		});
		expect(appealInput.outcome).toEqual({
			kind: "success",
			mentalDamage: 3,
			persuasionProgress: 1,
		});
		vi.useRealTimers();
	});
});
