import { describe, expect, it } from "vitest";
import { DiceService } from "$lib/shared/dice";
import {
	createDeterministicDiceClock,
	createSequentialDiceRollIdProvider,
	SequenceDiceRng,
} from "$lib/shared/dice/testing/SequenceDiceRng";
import { ResolutionService } from "$lib/shared/resolution";
import { SocialAppealResolutionService } from "../domain/SocialAppealResolutionService";
import type {
	SocialAppealResolutionFailure,
	SocialAppealResolutionResult,
} from "../model/socialAppealResolutionTypes";

describe("SocialAppealResolutionService", () => {
	it("turns a regular social success into mental damage and persuasion progress", () => {
		const service = createService([0.45]);

		const result = service.resolveAppealOutcome({
			reason: "argumento social",
			level: 2,
			social: 3,
			interaction: 2,
			itemBonus: 1,
			dc: 18,
		});
		const appeal = expectAppealSuccess(result);

		expect(appeal.resolution).toMatchObject({
			degree: "success",
			total: 18,
			dc: 18,
			axisValue: 3,
			applicationValue: 2,
		});
		expect(appeal.outcome).toEqual({
			kind: "success",
			mentalDamage: 3,
			persuasionProgress: 1,
		});
		expect(appeal.summary).toBe("Apelo bem-sucedido: a negociação avançou.");
	});

	it("turns a critical social success into a stronger outcome", () => {
		const service = createService([0.45]);

		const result = service.resolveAppealOutcome({
			reason: "argumento perfeito",
			level: 5,
			social: 4,
			interaction: 3,
			itemBonus: 2,
			dc: 14,
		});
		const appeal = expectAppealSuccess(result);

		expect(appeal.resolution.degree).toBe("criticalSuccess");
		expect(appeal.outcome).toEqual({
			kind: "success",
			mentalDamage: 5,
			persuasionProgress: 2,
		});
	});

	it("keeps success with cost as progress with reduced impact", () => {
		const service = createService([0.3]);

		const result = service.resolveAppealOutcome({
			reason: "apelo arriscado",
			level: 1,
			social: 2,
			interaction: 1,
			itemBonus: 0,
			dc: 12,
		});
		const appeal = expectAppealSuccess(result);

		expect(appeal.resolution.degree).toBe("successWithCost");
		expect(appeal.outcome).toEqual({
			kind: "success",
			mentalDamage: 1,
			persuasionProgress: 1,
		});
		expect(appeal.summary).toBe(
			"Apelo com custo: houve progresso, mas com pouco impacto.",
		);
	});

	it("turns a failed social test into patience damage", () => {
		const service = createService([0.2]);

		const result = service.resolveAppealOutcome({
			reason: "argumento fraco",
			level: 1,
			social: 1,
			interaction: 1,
			itemBonus: 0,
			dc: 20,
		});
		const appeal = expectAppealSuccess(result);

		expect(appeal.resolution.degree).toBe("failure");
		expect(appeal.outcome).toEqual({
			kind: "failure",
			patienceDamage: 2,
		});
	});

	it("returns typed failure for invalid input", () => {
		const service = createService([0.45]);

		const result = service.resolveAppealOutcome({
			reason: "",
			level: 1,
			social: 1,
			interaction: 1,
			itemBonus: 0,
			dc: 20,
		});
		const failure = expectAppealFailure(result);

		expect(failure.code).toBe("INVALID_SOCIAL_APPEAL_RESOLUTION_INPUT");
	});

	it("returns typed failure when resolution cannot roll dice", () => {
		const service = createService([1]);

		const result = service.resolveAppealOutcome({
			reason: "rng quebrado",
			level: 1,
			social: 1,
			interaction: 1,
			itemBonus: 0,
			dc: 10,
		});
		const failure = expectAppealFailure(result);

		expect(failure).toMatchObject({
			code: "SOCIAL_APPEAL_RESOLUTION_FAILED",
			details: { resolutionFailureCode: "DICE_ROLL_FAILED" },
		});
	});
});

function createService(
	sequence: readonly number[],
): SocialAppealResolutionService {
	const diceService = new DiceService(
		new SequenceDiceRng(sequence),
		createSequentialDiceRollIdProvider("social-roll"),
		createDeterministicDiceClock("2026-05-20T15:00:00.000Z"),
	);
	return new SocialAppealResolutionService(new ResolutionService(diceService));
}

function expectAppealSuccess(
	result: ReturnType<SocialAppealResolutionService["resolveAppealOutcome"]>,
): SocialAppealResolutionResult {
	expect(result.success).toBe(true);
	if (!result.success) {
		expect.fail(`Expected success, got ${result.error.code}`);
	}
	return result.data;
}

function expectAppealFailure(
	result: ReturnType<SocialAppealResolutionService["resolveAppealOutcome"]>,
): SocialAppealResolutionFailure {
	expect(result.success).toBe(false);
	if (result.success) {
		expect.fail("Expected failure, got success.");
	}
	return result.error;
}
