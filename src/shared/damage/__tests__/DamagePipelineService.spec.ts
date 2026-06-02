import { describe, expect, it } from "vitest";
import { DamagePipelineService } from "../domain/DamagePipelineService";
import type {
	DamagePipelineFailure,
	DamagePipelineInput,
	DamagePipelineResult,
} from "../model/damageTypes";

describe("DamagePipelineService", () => {
	it("sums base dice, matrix, and modifiers before defenses", () => {
		const service = new DamagePipelineService();

		const damage = expectDamageSuccess(
			service.calculateDamage(
				createDamageInput({
					baseDiceTotal: 7,
					matrixValue: 3,
					extraModifierTotal: 2,
				}),
			),
		);

		expect(damage.baseDamage).toBe(12);
		expect(damage.afterCritical).toBe(12);
		expect(damage.afterReduction).toBe(12);
		expect(damage.finalDamage).toBe(12);
		expect(damage.appliedAffinities).toEqual([]);
	});

	it("doubles damage on a critical hit before fixed damage reduction", () => {
		const service = new DamagePipelineService();

		const damage = expectDamageSuccess(
			service.calculateDamage(
				createDamageInput({
					baseDiceTotal: 5,
					matrixValue: 4,
					extraModifierTotal: 1,
					isCriticalHit: true,
					damageReduction: 3,
				}),
			),
		);

		expect(damage.baseDamage).toBe(10);
		expect(damage.afterCritical).toBe(20);
		expect(damage.afterReduction).toBe(17);
		expect(damage.finalDamage).toBe(17);
	});

	it("clamps fixed damage reduction at zero", () => {
		const service = new DamagePipelineService();

		const damage = expectDamageSuccess(
			service.calculateDamage(
				createDamageInput({
					baseDiceTotal: 2,
					matrixValue: 1,
					extraModifierTotal: 0,
					damageReduction: 10,
				}),
			),
		);

		expect(damage.baseDamage).toBe(3);
		expect(damage.afterReduction).toBe(0);
		expect(damage.finalDamage).toBe(0);
	});

	it("halves matching resistance damage and rounds down", () => {
		const service = new DamagePipelineService();

		const damage = expectDamageSuccess(
			service.calculateDamage(
				createDamageInput({
					baseDiceTotal: 9,
					affinities: [{ damageType: "fire", kind: "resistance" }],
				}),
			),
		);

		expect(damage.afterReduction).toBe(9);
		expect(damage.finalDamage).toBe(4);
		expect(damage.appliedAffinities).toEqual(["resistance"]);
	});

	it("adds deterministic vulnerability bonus damage", () => {
		const service = new DamagePipelineService();

		const damage = expectDamageSuccess(
			service.calculateDamage(
				createDamageInput({
					baseDiceTotal: 9,
					vulnerabilityBonusDamage: 4,
					affinities: [{ damageType: "fire", kind: "vulnerability" }],
				}),
			),
		);

		expect(damage.afterReduction).toBe(9);
		expect(damage.finalDamage).toBe(13);
		expect(damage.appliedAffinities).toEqual(["vulnerability"]);
	});

	it("sets matching immunity damage to zero", () => {
		const service = new DamagePipelineService();

		const damage = expectDamageSuccess(
			service.calculateDamage(
				createDamageInput({
					baseDiceTotal: 12,
					vulnerabilityBonusDamage: 6,
					affinities: [
						{ damageType: "fire", kind: "immunity" },
						{ damageType: "fire", kind: "vulnerability" },
					],
				}),
			),
		);

		expect(damage.afterReduction).toBe(12);
		expect(damage.finalDamage).toBe(0);
		expect(damage.appliedAffinities).toEqual(["immunity", "vulnerability"]);
	});

	it("cancels matching resistance and vulnerability", () => {
		const service = new DamagePipelineService();

		const damage = expectDamageSuccess(
			service.calculateDamage(
				createDamageInput({
					baseDiceTotal: 10,
					vulnerabilityBonusDamage: 6,
					affinities: [
						{ damageType: "fire", kind: "resistance" },
						{ damageType: "fire", kind: "vulnerability" },
					],
				}),
			),
		);

		expect(damage.afterReduction).toBe(10);
		expect(damage.finalDamage).toBe(10);
		expect(damage.appliedAffinities).toEqual(["resistance", "vulnerability"]);
	});

	it("ignores affinities from other damage types", () => {
		const service = new DamagePipelineService();

		const damage = expectDamageSuccess(
			service.calculateDamage(
				createDamageInput({
					damageType: "fire",
					baseDiceTotal: 10,
					affinities: [
						{ damageType: "cold", kind: "resistance" },
						{ damageType: "radiant", kind: "immunity" },
					],
				}),
			),
		);

		expect(damage.finalDamage).toBe(10);
		expect(damage.appliedAffinities).toEqual([]);
	});

	it("returns typed failure for invalid input", () => {
		const service = new DamagePipelineService();

		const failure = expectDamageFailure(
			service.calculateDamage({
				damageType: "invalid damage type",
				baseDiceTotal: -1,
				matrixValue: 0,
				extraModifierTotal: 0,
				isCriticalHit: false,
				damageReduction: -3,
				vulnerabilityBonusDamage: 0,
				affinities: [],
			}),
		);

		expect(failure.code).toBe("INVALID_DAMAGE_INPUT");
		expect(failure.details?.issues).toContain(
			"damageType: Invalid string: must match pattern /^[a-z][a-z0-9-]*$/",
		);
		expect(failure.details?.issues).toContain(
			"baseDiceTotal: Too small: expected number to be >=0",
		);
	});
});

function createDamageInput(
	overrides: Partial<DamagePipelineInput> = {},
): DamagePipelineInput {
	return {
		damageType: "fire",
		baseDiceTotal: 4,
		matrixValue: 0,
		extraModifierTotal: 0,
		isCriticalHit: false,
		damageReduction: 0,
		vulnerabilityBonusDamage: 0,
		affinities: [],
		...overrides,
	};
}

function expectDamageSuccess(
	result: ReturnType<DamagePipelineService["calculateDamage"]>,
): DamagePipelineResult {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectDamageFailure(
	result: ReturnType<DamagePipelineService["calculateDamage"]>,
): DamagePipelineFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}
