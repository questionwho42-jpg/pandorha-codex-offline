import { describe, expect, it } from "vitest";
import type { CharacterRecord } from "../../model/characterSchema";
import { LimitBreakService } from "../LimitBreakService";

const TEST_CHARACTER: CharacterRecord = {
	id: "kael-1",
	name: "Kael de Almar",
	concept: "Vanguarda protetor da caravana",
	ancestryId: "human",
	classId: "vanguarda",
	backgroundId: "abrigo-da-fe",
	level: 1,
	experiencePoints: 0,
	tensionMeter: 0,
	physical: 3,
	mental: 1,
	social: 2,
	conflict: 2,
	interaction: 1,
	resistance: 3,
	createdAt: "2026-06-03T06:10:12Z",
	updatedAt: "2026-06-03T06:10:12Z",
};

describe("LimitBreakService", () => {
	const service = new LimitBreakService();

	describe("accumulateTension", () => {
		it("should add 30 tension on massive_damage trigger", () => {
			const result = service.accumulateTension(
				TEST_CHARACTER,
				"massive_damage",
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.tensionMeter).toBe(30);
				expect(result.data.updatedAt).not.toBe(TEST_CHARACTER.updatedAt);
			}
		});

		it("should add 40 tension on adjacent_ally_down trigger", () => {
			const result = service.accumulateTension(
				TEST_CHARACTER,
				"adjacent_ally_down",
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.tensionMeter).toBe(40);
			}
		});

		it("should add 30 tension on lethal_precision trigger", () => {
			const result = service.accumulateTension(
				TEST_CHARACTER,
				"lethal_precision",
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.tensionMeter).toBe(30);
			}
		});

		it("should cap tension accumulation at 100", () => {
			const highTensionChar: CharacterRecord = {
				...TEST_CHARACTER,
				tensionMeter: 90,
			};
			const result = service.accumulateTension(
				highTensionChar,
				"massive_damage",
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.tensionMeter).toBe(100);
			}
		});

		it("should respect existing tension starting values and accumulate on top of them", () => {
			const existingTensionChar: CharacterRecord = {
				...TEST_CHARACTER,
				tensionMeter: 20,
			};
			const result = service.accumulateTension(
				existingTensionChar,
				"lethal_precision",
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.tensionMeter).toBe(50);
			}
		});

		it("should default to 0 tension when character.tensionMeter is undefined", () => {
			const noTensionChar = {
				...TEST_CHARACTER,
				tensionMeter: undefined,
			} as unknown as CharacterRecord;
			const result = service.accumulateTension(
				noTensionChar,
				"lethal_precision",
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.tensionMeter).toBe(30);
			}
		});
	});

	describe("consumeLimitBreak", () => {
		it("should reset tension to 0", () => {
			const fullTensionChar: CharacterRecord = {
				...TEST_CHARACTER,
				tensionMeter: 100,
			};
			const result = service.consumeLimitBreak(fullTensionChar);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.tensionMeter).toBe(0);
				expect(result.data.updatedAt).not.toBe(fullTensionChar.updatedAt);
			}
		});
	});
});
