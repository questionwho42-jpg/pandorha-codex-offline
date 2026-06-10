import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { PANDORHA_RULES } from "$lib/shared/game-rules";
import { DiceService } from "../domain/DiceService";
import {
	createDeterministicDiceClock,
	createSequentialDiceRollIdProvider,
	SequenceDiceRng,
} from "../testing/SequenceDiceRng";

describe("DiceService Property-Based Tests", () => {
	it("should calculate naturalRoll in range [1, sides] for any valid RNG value in [0, 1)", () => {
		fc.assert(
			fc.property(
				fc.double({
					min: 0,
					max: 1,
					minExcluded: false,
					maxExcluded: true,
					noNaN: true,
				}),
				fc.integer({ min: 2, max: 1000 }),
				(rngValue, sides) => {
					const rng = new SequenceDiceRng([rngValue]);
					const idProvider = createSequentialDiceRollIdProvider("roll");
					const clock = createDeterministicDiceClock(
						"2026-06-10T00:00:00.000Z",
					);
					const service = new DiceService(rng, idProvider, clock);

					const result = service.rollDie({ sides, reason: "property-test" });

					expect(result.success).toBe(true);
					if (result.success) {
						expect(result.data.naturalRoll).toBeGreaterThanOrEqual(1);
						expect(result.data.naturalRoll).toBeLessThanOrEqual(sides);
						expect(result.data.sides).toBe(sides);
					}
				},
			),
		);
	});

	it("should return INVALID_RNG_VALUE for any RNG value outside [0, 1)", () => {
		// Geramos valores inválidos para o RNG (estritamente < 0 ou >= 1, ou NaN/Infinity)
		const invalidRngArbitrary = fc
			.oneof(
				fc.double({ min: 1, max: 1000000, noNaN: true }),
				fc.double({
					min: -1000000,
					max: 0,
					minExcluded: true,
					maxExcluded: true,
					noNaN: true,
				}),
				fc.constant(Number.NaN),
				fc.constant(Number.POSITIVE_INFINITY),
				fc.constant(Number.NEGATIVE_INFINITY),
			)
			.filter((v) => !Object.is(v, -0));

		fc.assert(
			fc.property(invalidRngArbitrary, (rngValue) => {
				const rng = new SequenceDiceRng([rngValue]);
				const idProvider = createSequentialDiceRollIdProvider("roll");
				const clock = createDeterministicDiceClock("2026-06-10T00:00:00.000Z");
				const service = new DiceService(rng, idProvider, clock);

				const result = service.rollD20({ reason: "property-test-fail" });

				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.code).toBe("INVALID_RNG_VALUE");
				}
			}),
		);
	});

	it("should correctly identify critical hits (natural 20) and failures (natural 1) on d20", () => {
		fc.assert(
			fc.property(
				fc.double({
					min: 0,
					max: 1,
					minExcluded: false,
					maxExcluded: true,
					noNaN: true,
				}),
				(rngValue) => {
					const rng = new SequenceDiceRng([rngValue]);
					const idProvider = createSequentialDiceRollIdProvider("roll");
					const clock = createDeterministicDiceClock(
						"2026-06-10T00:00:00.000Z",
					);
					const service = new DiceService(rng, idProvider, clock);

					const result = service.rollD20({ reason: "property-test-d20" });

					expect(result.success).toBe(true);
					if (result.success) {
						const roll = result.data;
						const expectedRoll =
							Math.floor(rngValue * PANDORHA_RULES.DICE.D20_SIDES) + 1;

						expect(roll.naturalRoll).toBe(expectedRoll);

						if (expectedRoll === PANDORHA_RULES.DICE.NATURAL_CRITICAL) {
							expect(roll.isNaturalCritical).toBe(true);
							expect(roll.isNaturalFailure).toBe(false);
						} else if (expectedRoll === PANDORHA_RULES.DICE.NATURAL_FAILURE) {
							expect(roll.isNaturalCritical).toBe(false);
							expect(roll.isNaturalFailure).toBe(true);
						} else {
							expect(roll.isNaturalCritical).toBe(false);
							expect(roll.isNaturalFailure).toBe(false);
						}
					}
				},
			),
		);
	});
});
