import { describe, expect, it } from "vitest";
import { fail, type Result } from "$lib/shared/lib/result";
import { BaseCharacterStats } from "../../character/domain/StatusEffectDecorator";
import type { CharacterRecord } from "../../character/model/characterSchema";
import { InventoryService } from "../domain/InventoryService";
import type { CharacterCraftedItemRecord } from "../model/craftingSchema";
import type { CraftingFailure } from "../model/craftingTypes";
import { InMemoryCraftingRepository } from "./InMemoryCraftingRepository";

describe("InventoryService - Testes de Regras do Inventário Tático", () => {
	it("deve equipar e desequipar itens alterando o estado de equipagem", async () => {
		const repo = new InMemoryCraftingRepository();
		const service = new InventoryService(repo);

		// Criar e salvar item artesanal em memória
		const itemRecord = {
			id: "crafted-longsword-1",
			characterId: "char-1",
			equipmentId: "longsword", // slotCost: 2
			label: "Espada Longa de Teste",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 0,
			durabilityCurrent: 100,
			durabilityMax: 100,
			createdAt: new Date().toISOString(),
		};
		await repo.saveCraftedItem(itemRecord);

		// Equipar
		const equipRes = await service.equipItem("crafted-longsword-1");
		expect(equipRes.success).toBe(true);
		if (equipRes.success) {
			expect(equipRes.data.isEquipped).toBe(1);
		}

		// Desequipar
		const unequipRes = await service.unequipItem("crafted-longsword-1");
		expect(unequipRes.success).toBe(true);
		if (unequipRes.success) {
			expect(unequipRes.data.isEquipped).toBe(0);
		}
	});

	it("deve computar o peso total de itens equipados e aplicar dinamicamente o decorador de sobrecarga", async () => {
		const repo = new InMemoryCraftingRepository();
		const service = new InventoryService(repo);

		// Item 1: Espada Longa (slotCost: 2) -> Equipado
		await repo.saveCraftedItem({
			id: "crafted-longsword-1",
			characterId: "char-1",
			equipmentId: "longsword",
			label: "Espada Longa de Teste",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 1,
			durabilityCurrent: 100,
			durabilityMax: 100,
			createdAt: new Date().toISOString(),
		});

		// Item 2: Armadura de Placas (slotCost: 2) -> Equipado
		await repo.saveCraftedItem({
			id: "crafted-plate-1",
			characterId: "char-1",
			equipmentId: "plate-armor",
			label: "Placas de Teste",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 1,
			durabilityCurrent: 100,
			durabilityMax: 100,
			createdAt: new Date().toISOString(),
		});

		// Item 3: Adaga (slotCost: 1) -> Desequipado no inventário
		await repo.saveCraftedItem({
			id: "crafted-dagger-1",
			characterId: "char-1",
			equipmentId: "dagger",
			label: "Adaga de Teste",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 0,
			durabilityCurrent: 100,
			durabilityMax: 100,
			createdAt: new Date().toISOString(),
		});

		// Criar personagem base
		// Limite = Físico (1) + Resistência (1) + 6 = 8 slots
		const character: CharacterRecord = {
			id: "char-1",
			name: "Aventureiro Teste",
			concept: "Guerreiro",
			ancestryId: "human",
			classId: "vanguard",
			backgroundId: "solitary",
			level: 1,
			experiencePoints: 0,
			physical: 1,
			mental: 1,
			social: 1,
			conflict: 1,
			interaction: 1,
			resistance: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		const baseStats = new BaseCharacterStats(character, {
			id: "vanguard",
			baseHp: 10,
		});

		const stateRes = await service.getCharacterInventoryState(
			"char-1",
			baseStats,
		);
		expect(stateRes.success).toBe(true);
		if (stateRes.success) {
			const state = stateRes.data;
			// Peso total equipado = longsword (2) + plate-armor (2) = 4 slots
			expect(state.equippedWeight).toBe(4);
			expect(state.decoratedStats.currentCarryWeight).toBe(4);
			expect(state.decoratedStats.encumbranceState).toBe("light"); // 4 <= limite 8
			expect(state.decoratedStats.movementSpeedBase).toBe(6); // velocidade reduzida devido a Placas (-3m)
		}
	});

	it("deve aplicar penalidades corretas de sobrecarga se o peso total equipado exceder o limite", async () => {
		const repo = new InMemoryCraftingRepository();
		const service = new InventoryService(repo);

		// Item 1: Armadura de Placas (slotCost: 2) -> Equipado
		await repo.saveCraftedItem({
			id: "crafted-plate-1",
			characterId: "char-1",
			equipmentId: "plate-armor",
			label: "Placas 1",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 1,
			durabilityCurrent: 100,
			durabilityMax: 100,
			createdAt: new Date().toISOString(),
		});

		// Item 2: Placas 2 (slotCost: 2) -> Equipado
		await repo.saveCraftedItem({
			id: "crafted-plate-2",
			characterId: "char-1",
			equipmentId: "plate-armor",
			label: "Placas 2",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 1,
			durabilityCurrent: 100,
			durabilityMax: 100,
			createdAt: new Date().toISOString(),
		});

		// Item 3: Placas 3 (slotCost: 2) -> Equipado
		await repo.saveCraftedItem({
			id: "crafted-plate-3",
			characterId: "char-1",
			equipmentId: "plate-armor",
			label: "Placas 3",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 1,
			durabilityCurrent: 100,
			durabilityMax: 100,
			createdAt: new Date().toISOString(),
		});

		// Item 4: Placas 4 (slotCost: 2) -> Equipado
		await repo.saveCraftedItem({
			id: "crafted-plate-4",
			characterId: "char-1",
			equipmentId: "plate-armor",
			label: "Placas 4",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 1,
			durabilityCurrent: 100,
			durabilityMax: 100,
			createdAt: new Date().toISOString(),
		});

		// Criar personagem fraco
		// Limite = Físico (0) + Resistência (0) + 6 = 6 slots
		const character: CharacterRecord = {
			id: "char-1",
			name: "Aventureiro Fraco",
			concept: "Guerreiro",
			ancestryId: "human",
			classId: "vanguard",
			backgroundId: "solitary",
			level: 1,
			experiencePoints: 0,
			physical: 0,
			mental: 1,
			social: 1,
			conflict: 1,
			interaction: 1,
			resistance: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		const baseStats = new BaseCharacterStats(character, {
			id: "vanguard",
			baseHp: 10,
		});

		// Peso total = 8. Limite = 6. Excede o limite em 2 -> encumbered.
		const stateRes = await service.getCharacterInventoryState(
			"char-1",
			baseStats,
		);
		expect(stateRes.success).toBe(true);
		if (stateRes.success) {
			const state = stateRes.data;
			expect(state.equippedWeight).toBe(8);
			expect(state.decoratedStats.encumbranceState).toBe("encumbered");
			expect(state.decoratedStats.movementSpeedBase).toBe(3); // 9 - 3 (Placas) - 3 (Sobrecarga) = 3m
		}
	});

	it("deve retornar erro se a busca pelos itens artesanais no repositório falhar", async () => {
		class FailureCraftingRepository extends InMemoryCraftingRepository {
			public override async findCraftedItemsByCharacterId(
				_characterId: string,
			): Promise<
				Result<readonly CharacterCraftedItemRecord[], CraftingFailure>
			> {
				return fail({
					code: "CRAFTING_REPOSITORY_WRITE_FAILED",
					message: "Erro simulado ao buscar itens",
				});
			}
		}

		const repo = new FailureCraftingRepository();
		const service = new InventoryService(repo);

		const character: CharacterRecord = {
			id: "char-1",
			name: "Aventureiro Teste",
			concept: "Guerreiro",
			ancestryId: "human",
			classId: "vanguard",
			backgroundId: "solitary",
			level: 1,
			experiencePoints: 0,
			physical: 1,
			mental: 1,
			social: 1,
			conflict: 1,
			interaction: 1,
			resistance: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		const baseStats = new BaseCharacterStats(character, {
			id: "vanguard",
			baseHp: 10,
		});

		const result = await service.getCharacterInventoryState(
			"char-1",
			baseStats,
		);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("CRAFTING_REPOSITORY_WRITE_FAILED");
			expect(result.error.message).toBe("Erro simulado ao buscar itens");
		}
	});

	it("deve tratar o peso de itens ausentes no catálogo oficial de equipamentos como 1 slot", async () => {
		const repo = new InMemoryCraftingRepository();
		const service = new InventoryService(repo);

		// Equipando um item com equipmentId desconhecido/não cadastrado no catálogo oficial
		await repo.saveCraftedItem({
			id: "crafted-unknown-item-1",
			characterId: "char-1",
			equipmentId: "unknown-equipment-id",
			label: "Artefato Desconhecido",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 1,
			durabilityCurrent: 50,
			durabilityMax: 50,
			createdAt: new Date().toISOString(),
		});

		const character: CharacterRecord = {
			id: "char-1",
			name: "Aventureiro Teste",
			concept: "Guerreiro",
			ancestryId: "human",
			classId: "vanguard",
			backgroundId: "solitary",
			level: 1,
			experiencePoints: 0,
			physical: 1,
			mental: 1,
			social: 1,
			conflict: 1,
			interaction: 1,
			resistance: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		const baseStats = new BaseCharacterStats(character, {
			id: "vanguard",
			baseHp: 10,
		});

		const result = await service.getCharacterInventoryState(
			"char-1",
			baseStats,
		);
		expect(result.success).toBe(true);
		if (result.success) {
			// Item desconhecido deve somar peso default = 1
			expect(result.data.equippedWeight).toBe(1);
		}
	});

	it("deve recalcular a CA e penalidades na cebola de atributos ao equipar armadura e escudo pelo InventoryService", async () => {
		const repo = new InMemoryCraftingRepository();
		const service = new InventoryService(repo);

		// Armadura de Couro (slotCost: 1) -> Equipado
		await repo.saveCraftedItem({
			id: "crafted-leather-1",
			characterId: "char-1",
			equipmentId: "leather-armor",
			label: "Couro Batido",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 1,
			durabilityCurrent: 100,
			durabilityMax: 100,
			createdAt: new Date().toISOString(),
		});

		// Escudo Redondo (slotCost: 1) -> Equipado
		await repo.saveCraftedItem({
			id: "crafted-shield-1",
			characterId: "char-1",
			equipmentId: "round-shield",
			label: "Broquel",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 1,
			durabilityCurrent: 100,
			durabilityMax: 100,
			createdAt: new Date().toISOString(),
		});

		const character: CharacterRecord = {
			id: "char-1",
			name: "Aventureiro Defensivo",
			concept: "Guerreiro",
			ancestryId: "human",
			classId: "vanguard",
			backgroundId: "solitary",
			level: 1,
			experiencePoints: 0,
			physical: 3,
			mental: 1,
			social: 1,
			conflict: 1,
			interaction: 1,
			resistance: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		const baseStats = new BaseCharacterStats(character, {
			id: "vanguard",
			baseHp: 10,
		});

		const result = await service.getCharacterInventoryState(
			"char-1",
			baseStats,
		);
		expect(result.success).toBe(true);
		if (result.success) {
			const stats = result.data.decoratedStats;
			// CA = 10 + Nível: 1 + Couro: 2 + Físico: 3 + Escudo: 1 = 17
			expect(stats.armorClass).toBe(17);
			expect(stats.movementSpeedBase).toBe(9); // sem penalidade
			expect(stats.stealthPenalty).toBe(0);
		}
	});
});
