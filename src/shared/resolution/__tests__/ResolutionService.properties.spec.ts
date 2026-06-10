import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { DiceService } from "$lib/shared/dice";
import {
	createDeterministicDiceClock,
	createSequentialDiceRollIdProvider,
	SequenceDiceRng,
} from "$lib/shared/dice/testing/SequenceDiceRng";
import { ResolutionService } from "../domain/ResolutionService";

describe("ResolutionService Property-Based Tests", () => {
	// Arbitrário para gerar entradas totalmente compatíveis com o globalTestInputSchema
	const testInputArbitrary = fc.record({
		reason: fc
			.string({ minLength: 1, maxLength: 50 })
			.filter((s) => s.trim().length > 0),
		level: fc.integer({ min: 0, max: 100 }),
		axisValue: fc.integer({ min: -100, max: 100 }),
		applicationValue: fc.integer({ min: -100, max: 100 }),
		itemBonus: fc.integer({ min: -100, max: 100 }),
		dc: fc.integer({ min: 1, max: 200 }),
	});

	it("should always result in failure if natural roll is 1, regardless of modifiers or DC", () => {
		fc.assert(
			fc.property(testInputArbitrary, (input) => {
				// RNG = 0 resulta em rolagem natural = 1
				const service = createService([0]);
				const result = service.resolveGlobalTest(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.degree).toBe("failure");
					expect(result.data.isNaturalFailure).toBe(true);
				}
			}),
		);
	});

	it("should always result in success or criticalSuccess if natural roll is 20, regardless of modifiers or DC", () => {
		fc.assert(
			fc.property(testInputArbitrary, (input) => {
				// RNG = 0.95 resulta em rolagem natural = 20
				const service = createService([0.95]);
				const result = service.resolveGlobalTest(input);

				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.degree).toMatch(/^(?:success|criticalSuccess)$/);
					expect(result.data.isNaturalSuccess).toBe(true);
				}
			}),
		);
	});

	it("should always resolve to criticalSuccess if margin is 10 or more and natural roll is not 1", () => {
		fc.assert(
			fc.property(
				fc.record({
					reason: fc
						.string({ minLength: 1, maxLength: 50 })
						.filter((s) => s.trim().length > 0),
					level: fc.integer({ min: 10, max: 50 }),
					axisValue: fc.integer({ min: 10, max: 50 }),
					applicationValue: fc.integer({ min: 10, max: 50 }),
					itemBonus: fc.integer({ min: 10, max: 50 }),
				}),
				(modifiers) => {
					// Inicializa o service por caso de teste (naturalRoll = 3)
					const service = createService([0.1]);

					const naturalRoll = 3;
					const total =
						naturalRoll +
						modifiers.level +
						modifiers.axisValue +
						modifiers.applicationValue +
						modifiers.itemBonus;
					// dc = total - 10 garante margem = 10
					const dc = total - 10;

					// O Zod schema exige que o dc esteja no intervalo [1, 200]
					if (dc < 1 || dc > 200) {
						return; // Pula este caso
					}

					const input = {
						...modifiers,
						dc,
					};

					const result = service.resolveGlobalTest(input);
					expect(result.success).toBe(true);
					if (result.success) {
						expect(result.data.margin).toBeGreaterThanOrEqual(10);
						expect(result.data.degree).toBe("criticalSuccess");
					}
				},
			),
		);
	});
});

function createService(sequence: readonly number[]): ResolutionService {
	const diceService = new DiceService(
		new SequenceDiceRng(sequence),
		createSequentialDiceRollIdProvider("resolution-roll"),
		createDeterministicDiceClock("2026-06-10T00:00:00.000Z"),
	);

	return new ResolutionService(diceService);
}
