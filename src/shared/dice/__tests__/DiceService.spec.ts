import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PANDORHA_RULES } from "$lib/shared/game-rules";
import type { Result } from "$lib/shared/lib/result";
import { DiceService } from "../domain/DiceService";
import type { DiceFailure, DiceRollResult } from "../model/diceTypes";
import {
	createDeterministicDiceClock,
	createSequentialDiceRollIdProvider,
	SequenceDiceRng,
} from "../testing/SequenceDiceRng";

describe("DiceService", () => {
	it("rolls a deterministic d20 result with audit metadata", () => {
		const service = createService([0.45]);

		const result = service.rollD20({ reason: "teste global" });
		const roll = expectDiceSuccess(result);

		expect(roll).toEqual({
			naturalRoll: 10,
			sides: PANDORHA_RULES.DICE.D20_SIDES,
			isNaturalCritical: false,
			isNaturalFailure: false,
			auditEntry: {
				rollId: "roll-1",
				reason: "teste global",
				sides: PANDORHA_RULES.DICE.D20_SIDES,
				naturalRoll: 10,
				createdAt: "2026-05-05T23:00:00.000Z",
			},
		});
	});

	it("marks natural 20 as a critical roll", () => {
		const service = createService([0.95]);

		const result = service.rollD20({ reason: "ataque" });
		const roll = expectDiceSuccess(result);

		expect(roll.naturalRoll).toBe(PANDORHA_RULES.DICE.NATURAL_CRITICAL);
		expect(roll.isNaturalCritical).toBe(true);
		expect(roll.isNaturalFailure).toBe(false);
	});

	it("marks natural 1 as a natural failure", () => {
		const service = createService([0]);

		const result = service.rollD20({ reason: "resistência" });
		const roll = expectDiceSuccess(result);

		expect(roll.naturalRoll).toBe(PANDORHA_RULES.DICE.NATURAL_FAILURE);
		expect(roll.isNaturalCritical).toBe(false);
		expect(roll.isNaturalFailure).toBe(true);
	});

	it("rolls a generic die with deterministic audit metadata", () => {
		const service = createService([0.5]);

		const result = service.rollDie({ sides: 6, reason: "dano" });
		const roll = expectDiceSuccess(result);

		expect(roll.naturalRoll).toBe(4);
		expect(roll.sides).toBe(6);
		expect(roll.isNaturalCritical).toBe(false);
		expect(roll.auditEntry).toMatchObject({
			rollId: "roll-1",
			reason: "dano",
			sides: 6,
			naturalRoll: 4,
		});
	});

	it("rejects invalid die sides", () => {
		const service = createService([0.5]);

		const result = service.rollDie({ sides: 1, reason: "dado inválido" });
		const failure = expectDiceFailure(result);

		expect(failure.code).toBe("INVALID_DIE_SIDES");
	});

	it("rejects invalid d20 roll reason", () => {
		const service = createService([0.5]);

		const result = service.rollD20({ reason: "" });
		const failure = expectDiceFailure(result);

		expect(failure.code).toBe("INVALID_DICE_REASON");
		expect(failure.details?.issues).toContain(
			"reason: Too small: expected string to have >=1 characters",
		);
	});

	it("rejects invalid generic die roll reason", () => {
		const service = createService([0.5]);

		const result = service.rollDie({ sides: 20, reason: "" });
		const failure = expectDiceFailure(result);

		expect(failure.code).toBe("INVALID_DICE_REASON");
	});

	it.each([
		-0.01,
		1,
		Number.NaN,
		Number.POSITIVE_INFINITY,
	])("rejects invalid RNG value %s", (rngValue) => {
		const service = createService([rngValue]);

		const result = service.rollD20({ reason: "rng inválido" });
		const failure = expectDiceFailure(result);

		expect(failure.code).toBe("INVALID_RNG_VALUE");
	});

	it("assigns deterministic ids and timestamps to multiple rolls", () => {
		const service = createService([0, 0.45, 0.95]);

		const first = expectDiceSuccess(service.rollD20({ reason: "primeiro" }));
		const second = expectDiceSuccess(service.rollD20({ reason: "segundo" }));
		const third = expectDiceSuccess(service.rollD20({ reason: "terceiro" }));

		expect([first.naturalRoll, second.naturalRoll, third.naturalRoll]).toEqual([
			1, 10, 20,
		]);
		expect([
			first.auditEntry.rollId,
			second.auditEntry.rollId,
			third.auditEntry.rollId,
		]).toEqual(["roll-1", "roll-2", "roll-3"]);
		expect(third.auditEntry.createdAt).toBe("2026-05-05T23:00:02.000Z");
	});

	it("does not use Math.random directly inside src", () => {
		const srcRoot = path.join(
			fileURLToPath(new URL("../../../../", import.meta.url)),
			"src",
		);
		const forbiddenPattern = ["Math", "random("].join(".");

		const offenders = listSourceFiles(srcRoot).filter((filePath) =>
			readFileSync(filePath, "utf8").includes(forbiddenPattern),
		);

		expect(offenders).toEqual([]);
	}, 20000);
});

function createService(sequence: readonly number[]): DiceService {
	return new DiceService(
		new SequenceDiceRng(sequence),
		createSequentialDiceRollIdProvider("roll"),
		createDeterministicDiceClock("2026-05-05T23:00:00.000Z"),
	);
}

function expectDiceSuccess(
	result: Result<DiceRollResult, DiceFailure>,
): DiceRollResult {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectDiceFailure(
	result: Result<DiceRollResult, DiceFailure>,
): DiceFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

function listSourceFiles(root: string): readonly string[] {
	const entries = readdirSync(root);
	const files: string[] = [];

	for (const entry of entries) {
		const fullPath = path.join(root, entry);
		const stats = statSync(fullPath);
		if (stats.isDirectory()) {
			files.push(...listSourceFiles(fullPath));
			continue;
		}

		if (fullPath.endsWith(".ts") || fullPath.endsWith(".svelte")) {
			files.push(fullPath);
		}
	}

	return files;
}
