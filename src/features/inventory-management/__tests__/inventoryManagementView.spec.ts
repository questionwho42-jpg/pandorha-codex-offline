import { describe, expect, it } from "vitest";
import type { InventoryManagementSnapshot } from "../model/inventoryManagementTypes";
import {
	createInventoryManagementView,
	mapInventoryStateDescription,
	mapInventoryStateLabel,
} from "../model/inventoryManagementView";

describe("createInventoryManagementView", () => {
	it("creates pt-BR labels for carried entries and equipped loadout", () => {
		const view = createInventoryManagementView(buildSnapshot());

		expect(view.itemCountLabel).toBe("2 itens");
		expect(view.slotUsageLabel).toBe("3/10 slots");
		expect(view.stateLabel).toBe("Normal");
		expect(view.movementLabel).toBe("Sem penalidade de movimento");
		expect(view.entries).toEqual([
			expect.objectContaining({
				entryId: "entry-equipment",
				categoryLabel: "Equipamento",
				equipActionLabel: "Equipar arma",
				equipSlot: "mainHand",
				equippedSlot: "mainHand",
				isEquipped: true,
				quantityLabel: "1 unidade",
			}),
			expect.objectContaining({
				entryId: "entry-consumable",
				categoryLabel: "Consumivel",
				equipActionLabel: null,
				equipSlot: null,
				equippedSlot: null,
				isEquipped: false,
				quantityLabel: "3 unidades",
			}),
		]);
		expect(view.loadoutSlots).toEqual([
			expect.objectContaining({
				entry: expect.objectContaining({ entryId: "entry-equipment" }),
				label: "Arma",
				slot: "mainHand",
			}),
			expect.objectContaining({
				emptyLabel: "Nenhum escudo equipado",
				entry: null,
				label: "Escudo",
				slot: "offHand",
			}),
			expect.objectContaining({
				emptyLabel: "Nenhuma armadura vestida",
				entry: null,
				label: "Armadura",
				slot: "armor",
			}),
		]);
		expect(
			createInventoryManagementView({
				...buildSnapshot(),
				entries: buildSnapshot().entries.slice(0, 1),
			}).itemCountLabel,
		).toBe("1 item");
	});

	it("maps shield and armor entries to their equip actions", () => {
		const view = createInventoryManagementView({
			...buildSnapshot(),
			entries: [
				{
					characterId: "session-character-1",
					entryId: "entry-shield",
					catalogKind: "equipment",
					catalogItemId: "round-shield",
					equipmentKind: "shield",
					quantity: 1,
					lastSequence: 1,
					label: "Escudo Redondo",
					slotCost: 1,
				},
				{
					characterId: "session-character-1",
					entryId: "entry-armor",
					catalogKind: "equipment",
					catalogItemId: "leather-armor",
					equipmentKind: "armor",
					quantity: 1,
					lastSequence: 2,
					label: "Armadura de Couro",
					slotCost: 1,
				},
			],
			loadout: {
				mainHand: null,
				offHand: {
					slot: "offHand",
					entryId: "entry-shield",
					catalogItemId: "round-shield",
					label: "Escudo Redondo",
					slotCost: 1,
				},
				armor: {
					slot: "armor",
					entryId: "entry-armor",
					catalogItemId: "leather-armor",
					label: "Armadura de Couro",
					slotCost: 1,
				},
			},
		});

		expect(view.entries).toEqual([
			expect.objectContaining({
				entryId: "entry-shield",
				equipActionLabel: "Equipar escudo",
				equipSlot: "offHand",
				equippedSlot: "offHand",
				isEquipped: true,
			}),
			expect.objectContaining({
				entryId: "entry-armor",
				equipActionLabel: "Vestir armadura",
				equipSlot: "armor",
				equippedSlot: "armor",
				isEquipped: true,
			}),
		]);
		expect(view.loadoutSlots[1]?.entry?.entryId).toBe("entry-shield");
		expect(view.loadoutSlots[2]?.entry?.entryId).toBe("entry-armor");
	});

	it("labels the potion belt stack as quick-access belt copy", () => {
		const view = createInventoryManagementView({
			...buildSnapshot(),
			entries: [
				{
					characterId: "session-character-1",
					entryId: "entry-potion-belt",
					catalogKind: "consumable",
					catalogItemId: "potion-belt-stack",
					quantity: 5,
					lastSequence: 1,
					label: "Cinto de Pocoes",
					slotCost: 1,
				},
			],
		});

		expect(view.entries[0]).toMatchObject({
			categoryLabel: "Cinto de Po\u00e7\u00f5es",
			entryId: "entry-potion-belt",
			quantityLabel: "5 unidades",
		});
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
		loadout: {
			mainHand: {
				slot: "mainHand",
				entryId: "entry-equipment",
				catalogItemId: "longsword",
				label: "Espada Longa",
				slotCost: 2,
			},
			offHand: null,
			armor: null,
		},
		entries: [
			{
				characterId: "session-character-1",
				entryId: "entry-equipment",
				catalogKind: "equipment",
				catalogItemId: "longsword",
				equipmentKind: "weapon",
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
