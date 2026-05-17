import { describe, expect, it } from "vitest";
import {
	BaseCraftedEquipment,
	ReinforcedEquipmentDecorator,
	RunicEquipmentDecorator,
	SharpEquipmentDecorator,
} from "../domain/CraftingQualityDecorators";

describe("Crafting Quality Decorators (Padrão Decorator)", () => {
	it("deve criar um equipamento base e expor propriedades padrão sem modificações", () => {
		const baseSword = new BaseCraftedEquipment({
			id: "short-sword-01",
			label: "Espada Curta de Treino",
			kind: "weapon",
			slotCost: 2,
			priceCopper: 1500,
			durabilityCurrent: 40,
			durabilityMax: 40,
			mechanicalSummary: "1d6, Versátil",
			runeSlots: 0,
		});

		expect(baseSword.label).toBe("Espada Curta de Treino");
		expect(baseSword.getDamageBonus()).toBe(0);
		expect(baseSword.getCriticalMarginBonus()).toBe(0);
		expect(baseSword.getDefenseBonus()).toBe(0);
		expect(baseSword.getRuneSlotsCount()).toBe(0);
		expect(baseSword.getSlotCost()).toBe(2);
	});

	it("deve aplicar qualidade Afiada (Sharp) e conceder bonus de dano e margem critica", () => {
		const baseSword = new BaseCraftedEquipment({
			id: "short-sword-01",
			label: "Espada Curta",
			kind: "weapon",
			slotCost: 2,
			priceCopper: 1500,
			durabilityCurrent: 40,
			durabilityMax: 40,
			mechanicalSummary: "1d6, Versátil",
			runeSlots: 0,
		});

		const sharpSword = new SharpEquipmentDecorator(baseSword);

		expect(sharpSword.label).toBe("Espada Curta Afiada");
		expect(sharpSword.getDamageBonus()).toBe(1);
		expect(sharpSword.getCriticalMarginBonus()).toBe(2);
		expect(sharpSword.getSlotCost()).toBe(2); // Inalterado
	});

	it("deve aplicar qualidade Reforçada (Reinforced) e reduzir slots e aumentar defesa se for protetor", () => {
		const baseShield = new BaseCraftedEquipment({
			id: "iron-shield",
			label: "Escudo de Ferro",
			kind: "shield",
			slotCost: 3,
			priceCopper: 3000,
			durabilityCurrent: 50,
			durabilityMax: 50,
			mechanicalSummary: "+1 Defesa",
			runeSlots: 0,
		});

		const reinforcedShield = new ReinforcedEquipmentDecorator(baseShield);

		expect(reinforcedShield.label).toBe("Escudo de Ferro Reforçada");
		expect(reinforcedShield.getSlotCost()).toBe(2); // Reduzido em 1 (base era 3)
		expect(reinforcedShield.getDefenseBonus()).toBe(1); // +1 de defesa por ser escudo
	});

	it("deve aplicar qualidade Rúnica (Runic) e adicionar slot de runa", () => {
		const baseArmor = new BaseCraftedEquipment({
			id: "leather-armor",
			label: "Armadura de Couro",
			kind: "armor",
			slotCost: 2,
			priceCopper: 2500,
			durabilityCurrent: 30,
			durabilityMax: 30,
			mechanicalSummary: "Defesa leve",
			runeSlots: 1,
		});

		const runicArmor = new RunicEquipmentDecorator(baseArmor);

		expect(runicArmor.label).toBe("Armadura de Couro Rúnico"); // Kind armor é masculino/feminino idiomático
		expect(runicArmor.getRuneSlotsCount()).toBe(2); // Base era 1, com runica vai para 2
	});

	it("deve compor múltiplos decoradores em cascata e somar todos os efeitos (efeito cebola)", () => {
		const baseSword = new BaseCraftedEquipment({
			id: "epic-blade",
			label: "Espada Longa de Ferro-Árvore",
			kind: "weapon",
			slotCost: 3,
			priceCopper: 10000,
			durabilityCurrent: 60,
			durabilityMax: 60,
			mechanicalSummary: "1d8, 2 mãos",
			runeSlots: 1,
		});

		// Embrulhando com Afiada, depois Reforçada, depois Rúnica
		const fullyUpgradedSword = new RunicEquipmentDecorator(
			new ReinforcedEquipmentDecorator(new SharpEquipmentDecorator(baseSword)),
		);

		// Espera-se que todos os sufixos sejam acumulados de forma elegante ou tratados
		expect(fullyUpgradedSword.label).toContain("Afiada");
		expect(fullyUpgradedSword.label).toContain("Reforçado");
		expect(fullyUpgradedSword.label).toContain("Rúnica");

		expect(fullyUpgradedSword.getDamageBonus()).toBe(1); // Afiada
		expect(fullyUpgradedSword.getCriticalMarginBonus()).toBe(2); // Afiada
		expect(fullyUpgradedSword.getSlotCost()).toBe(2); // Reforçada (base era 3)
		expect(fullyUpgradedSword.getRuneSlotsCount()).toBe(2); // Rúnica (base era 1)
		expect(fullyUpgradedSword.getDefenseBonus()).toBe(0); // Não concede bônus de defesa a armas
	});
});
