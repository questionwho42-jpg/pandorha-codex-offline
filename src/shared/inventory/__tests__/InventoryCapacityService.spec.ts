import { describe, expect, it } from "vitest";
import { PANDORHA_RULES } from "$lib/shared/game-rules";
import type { Result } from "$lib/shared/lib/result";
import { InventoryCapacityService } from "../domain/InventoryCapacityService";
import type {
	InventoryCapacityFailure,
	InventoryCapacityResult,
} from "../model/inventoryCapacityTypes";

type InventoryCapacitySuccess = Extract<
	Result<InventoryCapacityResult, InventoryCapacityFailure>,
	{ readonly success: true }
>;

type InventoryCapacityFailureResult = Extract<
	Result<InventoryCapacityResult, InventoryCapacityFailure>,
	{ readonly success: false }
>;

describe("InventoryCapacityService", () => {
	it("calculates the slot limit from physical, resistance, and the base addition", () => {
		const result = createService().calculateCapacity({
			physical: 2,
			resistance: 3,
			items: [],
		});

		expect(expectCapacitySuccess(result)).toMatchObject({
			slotLimit: 2 + 3 + PANDORHA_RULES.LOGISTICS.BASE_SLOTS_ADDITION,
			usedSlots: 0,
			excessSlots: 0,
			state: "normal",
			movementPenaltyMeters: 0,
		});
	});

	it("sums carried item slot costs", () => {
		const result = createService().calculateCapacity({
			physical: 2,
			resistance: 2,
			items: [
				{ id: "longsword", label: "Espada Longa", slotCost: 2 },
				{ id: "round-shield", label: "Escudo Redondo", slotCost: 1 },
				{ id: "gold-coins-stack", label: "Moedas de Ouro", slotCost: 0 },
			],
		});

		expect(expectCapacitySuccess(result)).toMatchObject({
			slotLimit: 10,
			usedSlots: 3,
			excessSlots: 0,
			state: "normal",
		});
	});

	it("marks the inventory as normal when used slots are equal to the limit", () => {
		const result = createService().calculateCapacity({
			physical: 1,
			resistance: 1,
			items: [{ id: "training-load", label: "Carga de Treino", slotCost: 8 }],
		});

		expect(expectCapacitySuccess(result)).toMatchObject({
			slotLimit: 8,
			usedSlots: 8,
			excessSlots: 0,
			state: "normal",
		});
	});

	it("marks the inventory as slowed when used slots exceed the limit", () => {
		const result = createService().calculateCapacity({
			physical: 1,
			resistance: 1,
			items: [{ id: "heavy-pack", label: "Mochila Pesada", slotCost: 9 }],
		});

		expect(expectCapacitySuccess(result)).toMatchObject({
			slotLimit: 8,
			usedSlots: 9,
			excessSlots: 1,
			state: "slowed",
			movementPenaltyMeters: PANDORHA_RULES.LOGISTICS.SLOWED_PENALTY_METERS,
		});
	});

	it("marks the inventory as immobilized above limit plus overload threshold", () => {
		const result = createService().calculateCapacity({
			physical: 1,
			resistance: 1,
			items: [{ id: "crushing-load", label: "Carga Excessiva", slotCost: 14 }],
		});

		expect(expectCapacitySuccess(result)).toMatchObject({
			slotLimit: 8,
			usedSlots: 14,
			excessSlots: 6,
			state: "immobilized",
			movementPenaltyMeters: 0,
		});
	});

	it("adds an already resolved slot bonus to the limit", () => {
		const result = createService().calculateCapacity({
			physical: 1,
			resistance: 1,
			slotBonusTotal: 2,
			items: [{ id: "training-load", label: "Carga de Treino", slotCost: 10 }],
		});

		expect(expectCapacitySuccess(result)).toMatchObject({
			slotLimit: 10,
			usedSlots: 10,
			excessSlots: 0,
			state: "normal",
		});
	});

	it("rejects invalid input with a typed failure", () => {
		const result = createService().calculateCapacity({
			physical: "forte",
			resistance: 1,
			items: [],
		});

		expect(expectCapacityFailure(result)).toMatchObject({
			code: "INVALID_INVENTORY_CAPACITY_INPUT",
		});
	});

	it("reports a root validation issue when the whole input is invalid", () => {
		const failure = expectCapacityFailure(
			createService().calculateCapacity(null),
		);

		expect(failure).toMatchObject({
			code: "INVALID_INVENTORY_CAPACITY_INPUT",
		});
		expect(failure.details?.issues).toContain(
			"root: Invalid input: expected object, received null",
		);
	});

	it("rejects invalid carried item data", () => {
		const service = createService();

		expect(
			expectCapacityFailure(
				service.calculateCapacity({
					physical: 1,
					resistance: 1,
					items: [{ id: "invalid item", label: "Item", slotCost: 1 }],
				}),
			),
		).toMatchObject({ code: "INVALID_INVENTORY_CAPACITY_INPUT" });
		expect(
			expectCapacityFailure(
				service.calculateCapacity({
					physical: 1,
					resistance: 1,
					items: [{ id: "valid-item", label: "", slotCost: 1 }],
				}),
			),
		).toMatchObject({ code: "INVALID_INVENTORY_CAPACITY_INPUT" });
		expect(
			expectCapacityFailure(
				service.calculateCapacity({
					physical: 1,
					resistance: 1,
					items: [{ id: "valid-item", label: "Item", slotCost: -1 }],
				}),
			),
		).toMatchObject({ code: "INVALID_INVENTORY_CAPACITY_INPUT" });
	});
});

function createService(): InventoryCapacityService {
	return new InventoryCapacityService();
}

function expectCapacitySuccess(
	result: Result<InventoryCapacityResult, InventoryCapacityFailure>,
): InventoryCapacityResult {
	expect(result.success).toBe(true);
	return (result as InventoryCapacitySuccess).data;
}

function expectCapacityFailure(
	result: Result<InventoryCapacityResult, InventoryCapacityFailure>,
): InventoryCapacityFailure {
	expect(result.success).toBe(false);
	return (result as InventoryCapacityFailureResult).error;
}
