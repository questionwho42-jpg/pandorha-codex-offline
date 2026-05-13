import { describe, expect, it } from "vitest";
import type { InventoryCapacityResult } from "$lib/shared/inventory";
import {
	createInventoryReadOnlyView,
	mapInventoryStateDescription,
	mapInventoryStateLabel,
} from "../model/inventoryReadOnlyView";

const baseCapacity: InventoryCapacityResult = {
	excessSlots: 0,
	movementPenaltyMeters: 0,
	slotLimit: 10,
	state: "normal",
	usedSlots: 4,
};

describe("createInventoryReadOnlyView", () => {
	it("creates pt-BR labels for normal capacity", () => {
		const view = createInventoryReadOnlyView({
			capacity: baseCapacity,
			items: [
				{
					id: "longsword",
					label: "Espada Longa",
					categoryLabel: "Equipamento",
					slotCost: 2,
				},
			],
		});

		expect(view.itemCountLabel).toBe("1 item");
		expect(view.slotUsageLabel).toBe("4/10 slots");
		expect(view.stateLabel).toBe("Normal");
		expect(view.movementLabel).toBe("Sem penalidade de movimento");
	});

	it("creates labels for slowed capacity", () => {
		const view = createInventoryReadOnlyView({
			capacity: {
				...baseCapacity,
				excessSlots: 1,
				movementPenaltyMeters: -3,
				state: "slowed",
				usedSlots: 11,
			},
			items: [
				{
					id: "longsword",
					label: "Espada Longa",
					categoryLabel: "Equipamento",
					slotCost: 2,
				},
				{
					id: "rope-stack",
					label: "Corda",
					categoryLabel: "Consumível",
					slotCost: 1,
				},
			],
		});

		expect(view.itemCountLabel).toBe("2 itens");
		expect(view.slotUsageLabel).toBe("11/10 slots");
		expect(view.stateLabel).toBe("Lento");
		expect(view.movementLabel).toBe("-3m de deslocamento");
	});

	it("creates labels for immobilized capacity", () => {
		const view = createInventoryReadOnlyView({
			capacity: {
				...baseCapacity,
				excessSlots: 6,
				state: "immobilized",
				usedSlots: 16,
			},
			items: [],
		});

		expect(view.stateLabel).toBe("Imobilizado");
		expect(view.movementLabel).toBe("Velocidade 0");
	});

	it("maps every inventory state to user-facing text", () => {
		expect(mapInventoryStateLabel("normal")).toBe("Normal");
		expect(mapInventoryStateLabel("slowed")).toBe("Lento");
		expect(mapInventoryStateLabel("immobilized")).toBe("Imobilizado");
		expect(mapInventoryStateDescription("normal")).toContain("limite");
		expect(mapInventoryStateDescription("slowed")).toContain("Lento");
		expect(mapInventoryStateDescription("immobilized")).toContain("5 slots");
	});
});
