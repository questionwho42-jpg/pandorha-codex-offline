import { describe, expect, it } from "vitest";
import {
	applyMentalDamage,
	calculateFatiguePenalty,
	calculatePatience,
	calculateTrackSegments,
} from "../domain/DispositionCalculator";
import type { SocialTarget } from "../model-api";

describe("DispositionCalculator", () => {
	const baseTarget: SocialTarget = {
		id: "npc-1",
		label: "Guard",
		tier: 2,
		mentalStat: 12,
		resistanceStat: 14,
		attitude: "neutral",
		patience: { baseValue: 0, currentValue: 0 },
		persuasion: { totalSegments: 0, completedSegments: 0 },
		fatigueCounters: {},
	};

	it("calculates initial patience reserve correctly for neutral attitude", () => {
		const reserve = calculatePatience(baseTarget);
		// Mental(12) + Res(14) + Tier(2) + Neutral(0) = 28
		expect(reserve).toBe(28);
	});

	it("applies attitude modifiers to patience reserve", () => {
		expect(calculatePatience({ ...baseTarget, attitude: "friendly" })).toBe(30); // +2
		expect(calculatePatience({ ...baseTarget, attitude: "skeptical" })).toBe(
			26,
		); // -2
		expect(calculatePatience({ ...baseTarget, attitude: "hostile" })).toBe(24); // -4
		expect(
			calculatePatience({ ...baseTarget, attitude: "declared_enemy" }),
		).toBe(20); // -8
	});

	it("calculates persuasion track total segments", () => {
		// Complexity = 2 (Medium), Tier = 2
		const track = calculateTrackSegments(baseTarget, 2);
		expect(track).toBe(4);
	});

	it("applies mental damage to patience reserve", () => {
		const targetWithPatience = {
			...baseTarget,
			patience: { baseValue: 28, currentValue: 28 },
		};
		// Margin of success = 5
		const result = applyMentalDamage(targetWithPatience, 5);
		expect(result.patience.currentValue).toBe(23);
	});

	it("prevents patience from dropping below zero", () => {
		const targetWithPatience = {
			...baseTarget,
			patience: { baseValue: 28, currentValue: 4 },
		};
		const result = applyMentalDamage(targetWithPatience, 10);
		expect(result.patience.currentValue).toBe(0);
	});

	it("calculates fatigue penalty based on action axis", () => {
		const targetWithFatigue = {
			...baseTarget,
			fatigueCounters: {
				"Social + Interacao": 2, // Used twice before
			},
		};
		const penalty = calculateFatiguePenalty(
			targetWithFatigue,
			"Social + Interacao",
		);
		expect(penalty).toBe(-4); // -2 per previous attempt
	});

	it("returns zero fatigue penalty for new action axis", () => {
		const targetWithFatigue = {
			...baseTarget,
			fatigueCounters: {
				"Social + Interacao": 2,
			},
		};
		const penalty = calculateFatiguePenalty(
			targetWithFatigue,
			"Mental + Negociacao",
		);
		expect(penalty).toBe(0);
	});
});
