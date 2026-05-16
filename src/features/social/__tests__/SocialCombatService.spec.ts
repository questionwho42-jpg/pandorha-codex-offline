import { describe, expect, it } from "vitest";
import { SocialCombatService } from "../domain/SocialCombatService";
import type { SocialAction, SocialTarget } from "../model-api";

describe("SocialCombatService", () => {
	const clock = { now: () => "2026-05-14T00:00:00.000Z" };
	const service = new SocialCombatService(clock);

	const baseTarget: SocialTarget = {
		id: "npc-1",
		label: "Merchant",
		tier: 1,
		mentalStat: 10,
		resistanceStat: 10,
		attitude: "neutral",
		patience: { baseValue: 21, currentValue: 21 },
		persuasion: { totalSegments: 3, completedSegments: 0 },
		fatigueCounters: {},
	};

	const baseAction: SocialAction = {
		id: "action-1",
		type: "persuasion",
		baseAxis: "Social + Interacao",
		dc: 15,
		performerId: "pc-1",
		targetId: "npc-1",
	};

	it("applies an argument successfully and reduces patience", () => {
		const result = service.applyArgument(baseTarget, baseAction, 5);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.target.patience.currentValue).toBe(16);
			expect(result.data.events).toHaveLength(1);
			expect(result.data.isBroken).toBe(false);
			expect(result.data.target.fatigueCounters["Social + Interacao"]).toBe(1);
		}
	});

	it("fails if target is already broken", () => {
		const brokenTarget = {
			...baseTarget,
			patience: { baseValue: 21, currentValue: 0 },
		};
		const result = service.applyArgument(brokenTarget, baseAction, 5);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("TARGET_BROKEN");
		}
	});

	it("applies fatigue penalty on repeated axis", () => {
		const fatiguedTarget = {
			...baseTarget,
			fatigueCounters: {
				"Social + Interacao": 1, // Will apply -2 penalty to the margin
			},
		};
		// Margin of 5 - 2 (fatigue) = 3 effective damage
		const result = service.applyArgument(fatiguedTarget, baseAction, 5);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.target.patience.currentValue).toBe(18); // 21 - 3
			expect(result.data.target.fatigueCounters["Social + Interacao"]).toBe(2);
		}
	});

	it("breaks target when patience reaches zero", () => {
		const targetNearBreak = {
			...baseTarget,
			patience: { baseValue: 21, currentValue: 3 },
		};
		const result = service.applyArgument(targetNearBreak, baseAction, 5);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.target.patience.currentValue).toBe(0);
			expect(result.data.isBroken).toBe(true);
		}
	});

	it("prevents negative damage when fatigue is too high", () => {
		const highlyFatiguedTarget = {
			...baseTarget,
			fatigueCounters: {
				"Social + Interacao": 5, // -10 penalty
			},
		};
		const result = service.applyArgument(highlyFatiguedTarget, baseAction, 5);
		expect(result.success).toBe(true);
		if (result.success) {
			// Effective damage is Math.max(0, 5 - 10) = 0
			expect(result.data.target.patience.currentValue).toBe(21);
		}
	});
});
