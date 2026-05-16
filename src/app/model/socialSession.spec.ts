import { describe, expect, it } from "vitest";
import type { CharacterRecord } from "$lib/entities/character";
import type {
	BargainOffer,
	SocialTarget,
} from "$lib/features/social/model-api";
import { createSocialSession } from "./socialSession";

describe("socialSession", () => {
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

	const mockTarget: SocialTarget = {
		id: "npc-1",
		label: "Comerciante",
		tier: 1,
		mentalStat: 10,
		resistanceStat: 10,
		attitude: "neutral",
		patience: { baseValue: 20, currentValue: 20 },
		persuasion: { totalSegments: 2, completedSegments: 0 },
		fatigueCounters: {},
	};

	it("should apply bargain offer bonus to argument margin", () => {
		const session = createSocialSession(mockPlayer, mockTarget);

		// Oferta de 200 ouro = +2 de margem
		const offer: BargainOffer = {
			id: "offer-1",
			type: "gold",
			valueInGold: 200,
			description: "Saco de Ouro",
		};

		session.addBargainOffer(offer);
		expect(session.conflictState.bargainOffers).toHaveLength(1);

		// Com margem base 2, +2 do bônus, a margem efetiva será 4.
		// Dano mental base = 4.
		session.submitArgument("Social + Interação", 2);

		expect(session.conflictState.currentRound).toBe(2);
		expect(session.target.patience.currentValue).toBe(16); // 20 - 4
	});
});
