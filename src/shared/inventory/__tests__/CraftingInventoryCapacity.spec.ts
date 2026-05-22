import { describe, expect, it } from "vitest";
import {
	BaseCraftedEquipment,
	ReinforcedEquipmentDecorator,
} from "$lib/entities/equipment/domain/CraftingQualityDecorators";
import { InventoryCapacityService } from "../domain/InventoryCapacityService";

describe("Crafting Inventory Capacity Integration (Integração de Carga Física e Forja)", () => {
	it("deve validar que um item Reforçado reduz o peso de carga de inventário e evita penalidades de movimento", () => {
		const service = new InventoryCapacityService();

		// Cenário A: Personagem carrega uma armadura de placas mundana (peso 2) e outros itens, estourando a carga limite
		const baseArmor = new BaseCraftedEquipment({
			id: "plate-armor",
			label: "Armadura de Placas",
			kind: "armor",
			slotCost: 2,
			priceCopper: 200000,
			durabilityCurrent: 100,
			durabilityMax: 100,
			mechanicalSummary: "+5 CA",
			runeSlots: 1,
		});

		// Atributos de força reduzidos do personagem
		const physicalAttr = 1;
		const resistanceAttr = 1;

		// Carga com armadura normal (base)
		const capacityNormal = service.calculateCapacity({
			physical: physicalAttr,
			resistance: resistanceAttr,
			items: [
				{
					id: baseArmor.id,
					label: baseArmor.label,
					slotCost: baseArmor.getSlotCost(),
				},
				{ id: "iron-shield", label: "Escudo Grande", slotCost: 2 },
				{ id: "rations", label: "Rações Extras", slotCost: 5 }, // Total 9 slots. Limite para físico 1 + resist 1 + base 6 = 8 slots!
			],
		});

		expect(capacityNormal.success).toBe(true);
		if (capacityNormal.success) {
			expect(capacityNormal.data.usedSlots).toBe(9);
			expect(capacityNormal.data.slotLimit).toBe(8);
			expect(capacityNormal.data.excessSlots).toBe(1);
			expect(capacityNormal.data.state).toBe("slowed"); // Lentificado!
			expect(capacityNormal.data.movementPenaltyMeters).toBeLessThan(0); // Penalidade de movimento aplicada!
		}

		// Cenário B: Personagem troca para a armadura de placas forjada com qualidade Reforçada (peso reduzido de 2 para 1)
		const reinforcedArmor = new ReinforcedEquipmentDecorator(baseArmor);

		const capacityReinforced = service.calculateCapacity({
			physical: physicalAttr,
			resistance: resistanceAttr,
			items: [
				{
					id: reinforcedArmor.id,
					label: reinforcedArmor.label,
					slotCost: reinforcedArmor.getSlotCost(),
				}, // Peso passa a ser 1!
				{ id: "iron-shield", label: "Escudo Grande", slotCost: 2 },
				{ id: "rations", label: "Rações Extras", slotCost: 5 }, // Total 8 slots. Limite = 8 slots!
			],
		});

		expect(capacityReinforced.success).toBe(true);
		if (capacityReinforced.success) {
			expect(capacityReinforced.data.usedSlots).toBe(8);
			expect(capacityReinforced.data.slotLimit).toBe(8);
			expect(capacityReinforced.data.excessSlots).toBe(0);
			expect(capacityReinforced.data.state).toBe("normal"); // Carga normal!
			expect(capacityReinforced.data.movementPenaltyMeters).toBe(0); // Nenhuma penalidade de movimento!
		}
	});
});
