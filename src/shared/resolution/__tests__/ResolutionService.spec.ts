import { describe, expect, it } from "vitest";
import { DiceService } from "$lib/shared/dice";
import {
	createDeterministicDiceClock,
	createSequentialDiceRollIdProvider,
	SequenceDiceRng,
} from "$lib/shared/dice/testing/SequenceDiceRng";
import type { Result } from "$lib/shared/lib/result";
import { ResolutionService } from "../domain/ResolutionService";
import type {
	ResolutionFailure,
	ResolutionResult,
} from "../model/resolutionTypes";

describe("ResolutionService", () => {
	it("resolves a regular success when total reaches DC", () => {
		const service = createService([0.45]);

		const result = service.resolveGlobalTest({
			reason: "teste de atletismo",
			level: 2,
			axisValue: 3,
			applicationValue: 2,
			itemBonus: 1,
			dc: 18,
		});
		const resolution = expectResolutionSuccess(result);

		expect(resolution).toMatchObject({
			degree: "success",
			total: 18,
			margin: 0,
			level: 2,
			axisValue: 3,
			applicationValue: 2,
			itemBonus: 1,
			dc: 18,
			isNaturalSuccess: false,
			isNaturalFailure: false,
		});
		expect(resolution.dice.auditEntry.reason).toBe("teste de atletismo");
	});

	it("resolves a critical success by margin +10", () => {
		const service = createService([0.45]);

		const result = service.resolveGlobalTest({
			reason: "golpe perfeito",
			level: 5,
			axisValue: 4,
			applicationValue: 3,
			itemBonus: 2,
			dc: 14,
		});
		const resolution = expectResolutionSuccess(result);

		expect(resolution.dice.naturalRoll).toBe(10);
		expect(resolution.total).toBe(24);
		expect(resolution.margin).toBe(10);
		expect(resolution.degree).toBe("criticalSuccess");
		expect(resolution.isNaturalSuccess).toBe(false);
		expect(resolution.isNaturalFailure).toBe(false);
	});

	it("resolves success with cost when the result misses DC by up to four", () => {
		const service = createService([0.3]);

		const result = service.resolveGlobalTest({
			reason: "salto arriscado",
			level: 1,
			axisValue: 2,
			applicationValue: 1,
			itemBonus: 0,
			dc: 12,
		});
		const resolution = expectResolutionSuccess(result);

		expect(resolution.dice.naturalRoll).toBe(7);
		expect(resolution.total).toBe(11);
		expect(resolution.margin).toBe(-1);
		expect(resolution.degree).toBe("successWithCost");
	});

	it("resolves failure when the result misses DC by five or more", () => {
		const service = createService([0.2]);

		const result = service.resolveGlobalTest({
			reason: "abrir fechadura",
			level: 1,
			axisValue: 1,
			applicationValue: 1,
			itemBonus: 0,
			dc: 20,
		});
		const resolution = expectResolutionSuccess(result);

		expect(resolution.dice.naturalRoll).toBe(5);
		expect(resolution.total).toBe(8);
		expect(resolution.margin).toBe(-12);
		expect(resolution.degree).toBe("failure");
	});

	it("natural 20 guarantees at least success but does not become critical without margin +10", () => {
		const service = createService([0.95]);

		const result = service.resolveGlobalTest({
			reason: "ataque dificil",
			level: 1,
			axisValue: 1,
			applicationValue: 1,
			itemBonus: 0,
			dc: 35,
		});
		const resolution = expectResolutionSuccess(result);

		expect(resolution.dice.naturalRoll).toBe(20);
		expect(resolution.total).toBe(23);
		expect(resolution.margin).toBe(-12);
		expect(resolution.degree).toBe("success");
		expect(resolution.isNaturalSuccess).toBe(true);
	});

	it("natural 1 forces a failure even if modifiers would reach DC", () => {
		const service = createService([0]);

		const result = service.resolveGlobalTest({
			reason: "defesa desesperada",
			level: 10,
			axisValue: 6,
			applicationValue: 6,
			itemBonus: 5,
			dc: 20,
		});
		const resolution = expectResolutionSuccess(result);

		expect(resolution.dice.naturalRoll).toBe(1);
		expect(resolution.total).toBe(28);
		expect(resolution.margin).toBe(8);
		expect(resolution.degree).toBe("failure");
		expect(resolution.isNaturalFailure).toBe(true);
	});

	it("rejects invalid global test input", () => {
		const service = createService([0.45]);

		const result = service.resolveGlobalTest({
			reason: "",
			level: 1,
			axisValue: 1,
			applicationValue: 1,
			itemBonus: 0,
			dc: 10,
		});
		const failure = expectResolutionFailure(result);

		expect(failure.code).toBe("INVALID_RESOLUTION_INPUT");
		expect(failure.details?.issues).toContain(
			"reason: Too small: expected string to have >=1 characters",
		);
	});

	it("propagates dice failures as typed resolution failures", () => {
		const service = createService([Number.NaN]);

		const result = service.resolveGlobalTest({
			reason: "rng quebrado",
			level: 1,
			axisValue: 1,
			applicationValue: 1,
			itemBonus: 0,
			dc: 10,
		});
		const failure = expectResolutionFailure(result);

		expect(failure.code).toBe("DICE_ROLL_FAILED");
		expect(failure.details?.diceFailureCode).toBe("INVALID_RNG_VALUE");
	});
});

function createService(sequence: readonly number[]): ResolutionService {
	const diceService = new DiceService(
		new SequenceDiceRng(sequence),
		createSequentialDiceRollIdProvider("resolution-roll"),
		createDeterministicDiceClock("2026-05-05T23:50:00.000Z"),
	);

	return new ResolutionService(diceService);
}

function expectResolutionSuccess(
	result: Result<ResolutionResult, ResolutionFailure>,
): ResolutionResult {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectResolutionFailure(
	result: Result<ResolutionResult, ResolutionFailure>,
): ResolutionFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}
