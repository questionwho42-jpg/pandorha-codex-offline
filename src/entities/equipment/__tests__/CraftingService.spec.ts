import { beforeEach, describe, expect, it } from "vitest";
import { DiceService } from "$lib/shared/dice";
import {
	createDeterministicDiceClock,
	createSequentialDiceRollIdProvider,
	SequenceDiceRng,
} from "$lib/shared/dice/testing/SequenceDiceRng";
import { fail, type Result } from "$lib/shared/lib/result";
import { ResolutionService } from "$lib/shared/resolution";
import { CraftingService } from "../domain/CraftingService";
import type {
	CharacterCraftedItemRecord,
	NewCharacterCraftedItemRecord,
	NewCraftingRecipeRecord,
} from "../model/craftingSchema";
import type { CraftingFailure } from "../model/craftingTypes";
import { InMemoryCraftingRepository } from "./InMemoryCraftingRepository";

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
			characterMaterials: { "metal-ore": 1 }, // Espada requer 3 metal-ore e 1 ironwood (ironwood ausente cai no ?? 0)
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("INSUFFICIENT_MATERIALS");
			expect(result.error.message).toContain("metal-ore");
			expect(result.error.message).toContain("ironwood");
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
			expect(data.craftedItemRecord?.label).toBe(
				"Espada Longa Afiada Reforçado Rúnica",
			);
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
		setupDiceService([0.2]);

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

	it("deve falhar se os materiais da receita estiverem em JSON inválido", async () => {
		setupDiceService([0.5]);
		const recipeCorrupted: NewCraftingRecipeRecord = {
			id: "recipe-corrupted",
			label: "Item Corrompido",
			targetEquipmentId: "longsword",
			difficultyClass: 12,
			copperCost: 500,
			materialsRequiredJson: "{ invalid json }",
		};
		await repository.saveRecipe(recipeCorrupted);

		const result = await service.craftItem({
			characterId: "char-123",
			recipeId: "recipe-corrupted",
			characterLevel: 2,
			mentalAptitude: 3,
			artificeTalentBonus: 1,
			itemBonus: 0,
			characterGoldCopper: 1000,
			characterMaterials: {},
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("CORRUPTED_CRAFTING_RECORD");
		}
	});

	it("deve falhar se o item base da receita não existir no catálogo oficial", async () => {
		setupDiceService([0.5]);
		const recipeNoEquipment: NewCraftingRecipeRecord = {
			id: "recipe-no-eq",
			label: "Item Sem Equipamento",
			targetEquipmentId: "non-existent-eq-id",
			difficultyClass: 12,
			copperCost: 500,
			materialsRequiredJson: JSON.stringify([]),
		};
		await repository.saveRecipe(recipeNoEquipment);

		const result = await service.craftItem({
			characterId: "char-123",
			recipeId: "recipe-no-eq",
			characterLevel: 2,
			mentalAptitude: 3,
			artificeTalentBonus: 1,
			itemBonus: 0,
			characterGoldCopper: 1000,
			characterMaterials: {},
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("RECIPE_NOT_FOUND");
			expect(result.error.message).toContain("não existe no catálogo");
		}
	});

	it("deve retornar erro se a resolução global do teste de Artífice falhar", async () => {
		const mockFailResolutionService = {
			resolveGlobalTest: () =>
				fail({
					code: "RESOLUTION_FAILED",
					message: "Falha de teste simulada",
				}),
		} as unknown as ResolutionService;

		const localService = new CraftingService(
			repository,
			mockFailResolutionService,
		);

		const result = await localService.craftItem({
			characterId: "char-123",
			recipeId: "recipe-longsword",
			characterLevel: 2,
			mentalAptitude: 3,
			artificeTalentBonus: 1,
			itemBonus: 0,
			characterGoldCopper: 1000,
			characterMaterials: { "metal-ore": 5, ironwood: 2 },
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("RESOLUTION_FAILED");
		}
	});

	it("deve retornar erro se a gravação do item artesanal forjado no banco SQLite falhar", async () => {
		setupDiceService([0.5]);

		class SaveFailureCraftingRepository extends InMemoryCraftingRepository {
			public override async saveCraftedItem(
				_item: NewCharacterCraftedItemRecord,
			): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
				return fail({
					code: "CRAFTING_REPOSITORY_WRITE_FAILED",
					message: "Erro simulado de gravação de item",
				});
			}
		}

		const localRepository = new SaveFailureCraftingRepository();
		// Copiar as receitas cadastradas para o novo repositório
		const recipes = await repository.findAllRecipes();
		if (recipes.success) {
			for (const r of recipes.data) {
				await localRepository.saveRecipe(r);
			}
		}

		const localService = new CraftingService(
			localRepository,
			resolutionService,
		);

		const result = await localService.craftItem({
			characterId: "char-123",
			recipeId: "recipe-longsword",
			characterLevel: 2,
			mentalAptitude: 3,
			artificeTalentBonus: 1,
			itemBonus: 0,
			characterGoldCopper: 1000,
			characterMaterials: { "metal-ore": 5, ironwood: 2 },
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("CRAFTING_REPOSITORY_WRITE_FAILED");
			expect(result.error.message).toContain("Erro simulado de gravação");
		}
	});
});
