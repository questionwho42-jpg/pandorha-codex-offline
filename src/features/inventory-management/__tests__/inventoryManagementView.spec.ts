import { describe, expect, it } from "vitest";
import type { InventoryManagementSnapshot } from "../model/inventoryManagementTypes";
import {
	createInventoryManagementView,
	mapInventoryStateDescription,
	mapInventoryStateLabel,
} from "../model/inventoryManagementView";

describe("createInventoryManagementView", () => {
	it("creates pt-BR labels for carried equipment and consumables", () => {
		const view = createInventoryManagementView(buildSnapshot());

		expect(view.itemCountLabel).toBe("2 itens");
		expect(view.slotUsageLabel).toBe("3/10 slots");
		expect(view.stateLabel).toBe("Normal");
		expect(view.movementLabel).toBe("Sem penalidade de movimento");
		expect(view.entries).toEqual([
			expect.objectContaining({
				entryId: "entry-equipment",
				categoryLabel: "Equipamento",
				quantityLabel: "1 unidade",
			}),
			expect.objectContaining({
				entryId: "entry-consumable",
				categoryLabel: "Consumível",
				quantityLabel: "3 unidades",
			}),
		]);
		expect(
			createInventoryManagementView({
				...buildSnapshot(),
				entries: buildSnapshot().entries.slice(0, 1),
			}).itemCountLabel,
		).toBe("1 item");
	});

	it("maps every capacity state to visible feedback", () => {
		expect(mapInventoryStateLabel("normal")).toBe("Normal");
		expect(mapInventoryStateLabel("slowed")).toBe("Lento");
		expect(mapInventoryStateLabel("immobilized")).toBe("Imobilizado");
		expect(mapInventoryStateDescription("normal")).toContain("limite");
		expect(mapInventoryStateDescription("slowed")).toContain("Lento");
		expect(mapInventoryStateDescription("immobilized")).toContain("5 slots");
		expect(
			createInventoryManagementView({
				...buildSnapshot(),
				capacity: {
					excessSlots: 1,
					movementPenaltyMeters: -3,
					slotLimit: 10,
					state: "slowed",
					usedSlots: 11,
				},
			}).movementLabel,
		).toBe("-3m de deslocamento");
		expect(
			createInventoryManagementView({
				...buildSnapshot(),
				capacity: {
					excessSlots: 6,
					movementPenaltyMeters: 0,
					slotLimit: 10,
					state: "immobilized",
					usedSlots: 16,
				},
			}).movementLabel,
		).toBe("Velocidade 0");
	});
});

function buildSnapshot(): InventoryManagementSnapshot {
	return {
		characterId: "session-character-1",
		capacity: {
			excessSlots: 0,
			movementPenaltyMeters: 0,
			slotLimit: 10,
			state: "normal",
			usedSlots: 3,
		},
		entries: [
			{
				characterId: "session-character-1",
				entryId: "entry-equipment",
				catalogKind: "equipment",
				catalogItemId: "longsword",
				quantity: 1,
				lastSequence: 1,
				label: "Espada Longa",
				slotCost: 2,
			},
			{
				characterId: "session-character-1",
				entryId: "entry-consumable",
				catalogKind: "consumable",
				catalogItemId: "rope-stack",
				quantity: 3,
				lastSequence: 2,
				label: "Corda",
				slotCost: 1,
			},
		],
	};
}
