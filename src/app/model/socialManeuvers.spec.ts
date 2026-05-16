import { describe, expect, it } from "vitest";
import type { CharacterRecord } from "$lib/entities/character";
import type { SocialTarget } from "$lib/features/social/model-api";
import { createSocialSession } from "./socialSession";

describe("Social Maneuvers in socialSession", () => {
	const mockPlayer = {
		id: "player-1",
		name: "Bargainer",
		backgroundId: "merchant",
		level: 1,
		physical: 10,
		mental: 14,
		social: 16,
		conflict: 10,
		interaction: 14,
		resistance: 10,
	} as unknown as CharacterRecord;

	const createMockTarget = (): SocialTarget => ({
		id: "npc-1",
		label: "Comerciante",
		tier: 1,
		mentalStat: 10,
		resistanceStat: 10,
		attitude: "neutral",
		patience: { baseValue: 20, currentValue: 20 },
		persuasion: { totalSegments: 2, completedSegments: 0 },
		fatigueCounters: {},
	});

	it("should apply Venomous Flattery (+2 bonus margin)", () => {
		const session = createSocialSession(mockPlayer, createMockTarget());

		// Dano esperado: margin 2 -> Basic: 2, Venomous Flattery: 2 + 2 = 4
		session.submitArgument("Social + Interação", 2, "venomous_flattery");

		expect(session.target.patience.currentValue).toBe(16); // 20 - 4
	});

	it("should apply Group Sense (generates favor on high margin)", () => {
		const session = createSocialSession(mockPlayer, createMockTarget());

		// Group sense at margin 2 should generate 1 Minor Favor and add it to the table
		session.submitArgument("Social + Interação", 2, "group_sense");

		expect(session.conflictState.bargainOffers).toHaveLength(1);
		expect(session.conflictState.bargainOffers[0]?.type).toBe("favor");
		expect(session.target.patience.currentValue).toBe(18); // 20 - 2
	});

	it("should not generate favor if Group Sense margin < 2", () => {
		const session = createSocialSession(mockPlayer, createMockTarget());

		session.submitArgument("Social + Interação", 1, "group_sense");

		expect(session.conflictState.bargainOffers).toHaveLength(0);
	});

	it("should apply Mystic Charm (temporarily sets attitude to friendly)", () => {
		const session = createSocialSession(mockPlayer, createMockTarget());

		session.submitArgument("Social + Interação", 2, "mystic_charm");

		expect(session.target.attitude).toBe("friendly");
	});
});
