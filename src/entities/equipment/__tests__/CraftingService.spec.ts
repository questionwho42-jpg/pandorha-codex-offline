import { beforeEach, describe, expect, it } from "vitest";
import { DiceService } from "$lib/shared/dice";
import {
	createDeterministicDiceClock,
	createSequentialDiceRollIdProvider,
	SequenceDiceRng,
} from "$lib/shared/dice/testing/SequenceDiceRng";
import { ResolutionService } from "$lib/shared/resolution";
import { InMemoryCraftingRepository } from "./InMemoryCraftingRepository";
import { CraftingService } from "../domain/CraftingService";
import type { NewCraftingRecipeRecord } from "../model/craftingSchema";

describe("CraftingService (TDD - Forja Tática e Economia de Artífice)", () => {
	let repository: InMemoryCraftingRepository;
	let resolutionService: ResolutionService;
	let service: CraftingService;

	// Helper para criar o DiceService determinístico
	function setupDiceService(sequence: readonly number[]): void {
		const diceService = new DiceService(
			new SequenceDiceRng(sequence),
			createSequentialDiceRollIdProvider("crafting-test"),
			createDeterministicDiceClock("2026-05-17T16:50:00.000Z"),
		);
		resolutionService = new ResolutionService(diceService);
		service = new CraftingService(repository, resolutionService);
	}

	beforeEach(async () => {
		repository = new InMemoryCraftingRepository();

		// Cadastrar receitas oficiais de teste no repositório fake
		const recipeLongsword: NewCraftingRecipeRecord = {
			id: "recipe-longsword",
			label: "Espada Longa de Ferro-Árvore",
			targetEquipmentId: "longsword",
			difficultyClass: 12,
			copperCost: 500,
			materialsRequiredJson: JSON.stringify([
				{ materialId: "metal-ore", quantity: 3 },
				{ materialId: "ironwood", quantity: 1 },
			]),
		};

		const recipeDagger: NewCraftingRecipeRecord = {
			id: "recipe-dagger",
			label: "Adaga Éter-Afiada",
			targetEquipmentId: "dagger",
			difficultyClass: 10,
			copperCost: 200,
			materialsRequiredJson: JSON.stringify([
				{ materialId: "ether-ore", quantity: 2 },
			]),
		};

		await repository.saveRecipe(recipeLongsword);
		await repository.saveRecipe(recipeDagger);
	});

	it("deve retornar erro ao tentar forjar uma receita inexistente", async () => {
		setupDiceService([0.5]); // Rola 11 natural

		const result = await service.craftItem({
			characterId: "char-123",
			recipeId: "recipe-invalid",
			characterLevel: 2,
			mentalAptitude: 3,
			artificeTalentBonus: 1,
			itemBonus: 0,
			characterGoldCopper: 1000,
			characterMaterials: { "metal-ore": 5, ironwood: 2 },
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("RECIPE_NOT_FOUND");
		}
	});

	it("deve retornar erro quando o personagem não possui cobre suficiente", async () => {
		setupDiceService([0.5]);

		const result = await service.craftItem({
			characterId: "char-123",
			recipeId: "recipe-longsword",
			characterLevel: 2,
			mentalAptitude: 3,
			artificeTalentBonus: 1,
			itemBonus: 0,
			characterGoldCopper: 100, // Custo da espada longa é 500
			characterMaterials: { "metal-ore": 5, ironwood: 2 },
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("INSUFFICIENT_GOLD");
		}
	});

	it("deve retornar erro quando o personagem não possui materiais suficientes", async () => {
		setupDiceService([0.5]);

		const result = await service.craftItem({
			characterId: "char-123",
			recipeId: "recipe-longsword",
			characterLevel: 2,
			mentalAptitude: 3,
			artificeTalentBonus: 1,
			itemBonus: 0,
			characterGoldCopper: 1000,
			characterMaterials: { "metal-ore": 1, ironwood: 2 }, // Espada requer 3 metal-ore
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("INSUFFICIENT_MATERIALS");
			expect(result.error.message).toContain("metal-ore");
		}
	});

	it("deve forjar um item lendário com Sucesso Crítico (rola 20 natural) e consumir todo ouro e materiais", async () => {
		// 0.95 rascunha 20 natural no d20
		setupDiceService([0.95]);

		const result = await service.craftItem({
			characterId: "char-123",
			recipeId: "recipe-longsword",
			characterLevel: 2,
			mentalAptitude: 3,
			artificeTalentBonus: 2,
			itemBonus: 0,
			characterGoldCopper: 1000,
			characterMaterials: { "metal-ore": 5, ironwood: 2 },
		});

		expect(result.success).toBe(true);
		if (result.success) {
			const data = result.data;
			expect(data.degree).toBe("criticalSuccess");
			expect(data.goldSpent).toBe(500);
			expect(data.materialsSpent).toEqual({
				"metal-ore": 3,
				ironwood: 1,
			});

			// O item deve ser criado e possuir todas as decorações combinadas
			expect(data.craftedItemRecord).toBeDefined();
			expect(data.craftedItemRecord?.label).toBe("Espada Longa Afiada Reforçado Rúnica");
			expect(data.craftedItemRecord?.isSharp).toBe(1);
			expect(data.craftedItemRecord?.isReinforced).toBe(1);
			expect(data.craftedItemRecord?.isRunic).toBe(1);
			expect(data.decoratedItem?.getDamageBonus()).toBe(1);
			expect(data.decoratedItem?.getCriticalMarginBonus()).toBe(2);
			expect(data.decoratedItem?.getSlotCost()).toBe(1); // Reduzido de 2 para 1
			expect(data.decoratedItem?.getRuneSlotsCount()).toBe(2); // Base era 1, com runica vai para 2
		}
	});

	it("deve forjar um item normal com Sucesso (rola 10 natural, total 16 vs DC 12)", async () => {
		// 0.45 rascunha 10 natural no d20. Total = 10 + 2 (level) + 3 (aptitude) + 1 (talent) = 16 (DC 12)
		setupDiceService([0.45]);

		const result = await service.craftItem({
			characterId: "char-123",
			recipeId: "recipe-longsword",
			characterLevel: 2,
			mentalAptitude: 3,
			artificeTalentBonus: 1,
			itemBonus: 0,
			characterGoldCopper: 1000,
			characterMaterials: { "metal-ore": 5, ironwood: 2 },
		});

		expect(result.success).toBe(true);
		if (result.success) {
			const data = result.data;
			expect(data.degree).toBe("success");
			expect(data.goldSpent).toBe(500);
			expect(data.craftedItemRecord?.label).toBe("Espada Longa");
			expect(data.craftedItemRecord?.isSharp).toBe(0);
			expect(data.craftedItemRecord?.isReinforced).toBe(0);
			expect(data.craftedItemRecord?.isRunic).toBe(0);
			expect(data.craftedItemRecord?.durabilityCurrent).toBe(100);
		}
	});

	it("deve forjar um item com complicação (Sucesso com Custo) e reduzir durabilidade inicial pela metade (rola 5 natural, total 11 vs DC 12, margem -1)", async () => {
		// 0.20 rascunha 5 natural. Total = 5 + 2 (level) + 3 (aptitude) + 1 (talent) = 11. DC 12. Margem = -1 (Sucesso com Custo)
		setupDiceService([0.20]);

		const result = await service.craftItem({
			characterId: "char-123",
			recipeId: "recipe-longsword",
			characterLevel: 2,
			mentalAptitude: 3,
			artificeTalentBonus: 1,
			itemBonus: 0,
			characterGoldCopper: 1000,
			characterMaterials: { "metal-ore": 5, ironwood: 2 },
		});

		expect(result.success).toBe(true);
		if (result.success) {
			const data = result.data;
			expect(data.degree).toBe("successWithCost");
			expect(data.goldSpent).toBe(500);
			expect(data.craftedItemRecord?.durabilityCurrent).toBe(50); // Reduzido de 100 para 50!
			expect(data.craftedItemRecord?.durabilityMax).toBe(100);
		}
	});

	it("deve falhar na forja (rola 1 natural) e destruir 50% dos materiais requeridos sem cobrar taxa de ouro da bigorna", async () => {
		// 0 rascunha 1 natural (Falha Crítica/Normal dependendo do total)
		setupDiceService([0.0]);

		const result = await service.craftItem({
			characterId: "char-123",
			recipeId: "recipe-longsword",
			characterLevel: 2,
			mentalAptitude: 1,
			artificeTalentBonus: 0,
			itemBonus: 0,
			characterGoldCopper: 1000,
			characterMaterials: { "metal-ore": 5, ironwood: 2 },
		});

		expect(result.success).toBe(true); // O servico responde com sucesso de operacao mas grau de falha
		if (result.success) {
			const data = result.data;
			expect(data.degree).toBe("failure");
			expect(data.goldSpent).toBe(0); // Não gasta o ouro da taxa da bigorna
			expect(data.materialsSpent).toEqual({
				"metal-ore": 2, // 3 / 2 = 1.5 -> arredonda para cima (Ceil) = 2
				ironwood: 1, // 1 / 2 = 0.5 -> arredonda para cima = 1
			});
			expect(data.craftedItemRecord).toBeUndefined(); // Nenhum item criado
		}
	});
});
