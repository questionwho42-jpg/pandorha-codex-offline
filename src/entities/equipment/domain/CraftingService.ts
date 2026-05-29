import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { ResolutionService } from "$lib/shared/resolution";
import type { CharacterCraftedItemRecord } from "../model/craftingSchema";
import type { CraftingFailure } from "../model/craftingTypes";
import { OFFICIAL_EQUIPMENT } from "../model/equipmentCatalog";
import {
	BaseCraftedEquipment,
	type ICraftedEquipment,
	ReinforcedEquipmentDecorator,
	RunicEquipmentDecorator,
	SharpEquipmentDecorator,
} from "./CraftingQualityDecorators";
import type { CraftingRepository } from "./CraftingRepository";

export interface CraftingMaterialInput {
	readonly materialId:
		| "ether-ore"
		| "ironwood"
		| "mystic-essence"
		| "metal-ore";
	readonly quantity: number;
}

export interface CraftInput {
	readonly characterId: string;
	readonly recipeId: string;
	readonly characterLevel: number;
	readonly mentalAptitude: number;
	readonly artificeTalentBonus: number;
	readonly itemBonus: number;
	readonly characterGoldCopper: number; // ouro convertido em cobre ou cobre direto
	readonly characterMaterials: Readonly<Record<string, number>>;
}

export interface CraftResult {
	readonly degree:
		| "success"
		| "criticalSuccess"
		| "successWithCost"
		| "failure";
	readonly craftedItemRecord?: CharacterCraftedItemRecord;
	readonly decoratedItem?: ICraftedEquipment;
	readonly goldSpent: number;
	readonly materialsSpent: Record<string, number>;
	readonly diceTotal: number;
	readonly margin: number;
}

export class CraftingService {
	public constructor(
		private readonly repository: CraftingRepository,
		private readonly resolutionService: ResolutionService,
	) {}

	/**
	 * Realiza a forja de um item com base em rolagens ativas de Artífice e recursos.
	 */
	public async craftItem(
		input: CraftInput,
	): Promise<Result<CraftResult, CraftingFailure>> {
		// 1. Buscar a receita de forja
		const recipeResult = await this.repository.findRecipeById(input.recipeId);
		if (!recipeResult.success) {
			return fail({
				code: "RECIPE_NOT_FOUND",
				message: `A receita de forja com ID ${input.recipeId} não foi localizada no catálogo.`,
			});
		}
		const recipe = recipeResult.data;

		// 2. Validar se possui moedas (cobre) suficiente
		if (input.characterGoldCopper < recipe.copperCost) {
			return fail({
				code: "INSUFFICIENT_GOLD",
				message: `Cobre insuficiente para forja. Necessário: ${recipe.copperCost}, Disponível: ${input.characterGoldCopper}.`,
			});
		}

		// 3. Validar se possui matérias-primas suficientes
		let requiredMaterials: readonly CraftingMaterialInput[] = [];
		try {
			requiredMaterials = JSON.parse(recipe.materialsRequiredJson);
		} catch (_error) {
			return fail({
				code: "CORRUPTED_CRAFTING_RECORD",
				message:
					"As matérias-primas da receita estão no formato JSON inválido.",
			});
		}

		const missingMaterials: string[] = [];
		for (const mat of requiredMaterials) {
			const owned = input.characterMaterials[mat.materialId] ?? 0;
			if (owned < mat.quantity) {
				missingMaterials.push(
					`${mat.materialId} (Falta: ${mat.quantity - owned})`,
				);
			}
		}

		if (missingMaterials.length > 0) {
			return fail({
				code: "INSUFFICIENT_MATERIALS",
				message: `Materiais insuficientes para forjar: ${missingMaterials.join(", ")}`,
			});
		}

		// 4. Buscar o item de equipamento base a partir do catálogo oficial
		const baseEquipment = OFFICIAL_EQUIPMENT.find(
			(eq) => eq.id === recipe.targetEquipmentId,
		);
		if (!baseEquipment) {
			return fail({
				code: "RECIPE_NOT_FOUND",
				message: `O item base com ID ${recipe.targetEquipmentId} não existe no catálogo de equipamentos oficiais.`,
			});
		}

		// 5. Executar o teste global de Artífice (eixo mental) via ResolutionService
		const resolutionInput = {
			reason: `Forja ativa de ${recipe.label}`,
			level: input.characterLevel,
			axisValue: input.mentalAptitude,
			applicationValue: input.artificeTalentBonus,
			itemBonus: input.itemBonus,
			dc: recipe.difficultyClass,
		};

		const testResult =
			this.resolutionService.resolveGlobalTest(resolutionInput);
		if (!testResult.success) {
			return fail({
				code: "RESOLUTION_FAILED",
				message: `A rolagem de teste de Artífice falhou: ${testResult.error.message}`,
			});
		}

		const roll = testResult.data;
		const degree = roll.degree;

		// 6. Tratar o resultado do teste de acordo com os graus de sucesso de Pandorha
		const materialsSpent: Record<string, number> = {};
		let goldSpent = 0;

		if (degree === "failure") {
			// Perde metade dos materiais requeridos no fogo da fornalha, mas mantém o ouro de taxa da bigorna
			for (const mat of requiredMaterials) {
				materialsSpent[mat.materialId] = Math.ceil(mat.quantity / 2);
			}

			return ok({
				degree: "failure",
				goldSpent: 0,
				materialsSpent,
				diceTotal: roll.total,
				margin: roll.margin,
			});
		}

		// Nos casos de sucesso, todo o custo em cobre e materiais é consumido
		goldSpent = recipe.copperCost;
		for (const mat of requiredMaterials) {
			materialsSpent[mat.materialId] = mat.quantity;
		}

		// Instanciar o item base concretizado
		const baseItem = new BaseCraftedEquipment({
			id: `crafted-${recipe.targetEquipmentId}-${Date.now()}`,
			label: baseEquipment.label,
			kind: baseEquipment.kind as "weapon" | "armor" | "shield",
			slotCost: baseEquipment.slotCost,
			priceCopper: baseEquipment.priceCopper,
			durabilityCurrent: baseEquipment.durabilityCurrent,
			durabilityMax: baseEquipment.durabilityMax,
			mechanicalSummary: baseEquipment.mechanicalSummary,
			runeSlots: baseEquipment.runeSlots,
		});

		let decoratedItem: ICraftedEquipment = baseItem;
		let isSharp = 0;
		let isReinforced = 0;
		let isRunic = 0;
		let durabilityCurrent: number = baseEquipment.durabilityCurrent;

		if (degree === "criticalSuccess") {
			// SUCESSO CRÍTICO: O item é forjado com qualidade lendária englobando os 3 Decoradores!
			isSharp = 1;
			isReinforced = 1;
			isRunic = 1;

			decoratedItem = new RunicEquipmentDecorator(
				new ReinforcedEquipmentDecorator(new SharpEquipmentDecorator(baseItem)),
			);
		} else if (degree === "successWithCost") {
			// SUCESSO COM CUSTO: Durabilidade atual reduzida pela metade
			durabilityCurrent = Math.max(
				1,
				Math.floor(baseEquipment.durabilityMax / 2),
			);
		}

		// Persistir o item artesanal forjado na tabela do banco SQLite
		const newItemRecord = {
			id: baseItem.id,
			characterId: input.characterId,
			equipmentId: baseEquipment.id,
			label: decoratedItem.label,
			isSharp,
			isReinforced,
			isRunic,
			durabilityCurrent,
			durabilityMax: baseEquipment.durabilityMax,
			isEquipped: 0,
			createdAt: new Date().toISOString(),
		};

		const saveResult = await this.repository.saveCraftedItem(newItemRecord);
		if (!saveResult.success) {
			return fail({
				code: "CRAFTING_REPOSITORY_WRITE_FAILED",
				message: `Erro ao persistir o item artesanal no banco de dados SQLite: ${saveResult.error.message}`,
			});
		}

		return ok({
			degree,
			craftedItemRecord: saveResult.data,
			decoratedItem,
			goldSpent,
			materialsSpent,
			diceTotal: roll.total,
			margin: roll.margin,
		});
	}

	/**
	 * Dismantles a custom crafted item, deleting it from the database and recovering 50% of its recipe materials.
	 */
	public async dismantleCraftedItem(
		characterId: string,
		itemId: string,
	): Promise<
		Result<{ materialsRecovered: Record<string, number> }, CraftingFailure>
	> {
		const itemsResult =
			await this.repository.findCraftedItemsByCharacterId(characterId);
		if (!itemsResult.success) {
			return fail(itemsResult.error);
		}

		const item = itemsResult.data.find((it) => it.id === itemId);
		if (!item) {
			return fail({
				code: "ITEM_NOT_FOUND",
				message: `Item artesanal com ID ${itemId} nao foi localizado para o personagem ${characterId}.`,
			});
		}

		const recipesResult = await this.repository.findAllRecipes();
		if (!recipesResult.success) {
			return fail(recipesResult.error);
		}

		const recipe = recipesResult.data.find(
			(r) => r.targetEquipmentId === item.equipmentId,
		);
		if (!recipe) {
			return fail({
				code: "RECIPE_NOT_FOUND",
				message: `Nao foi encontrada nenhuma receita de forja para o equipamento ${item.equipmentId}.`,
			});
		}

		let requiredMaterials: readonly CraftingMaterialInput[] = [];
		try {
			requiredMaterials = JSON.parse(recipe.materialsRequiredJson);
		} catch (_error) {
			return fail({
				code: "CORRUPTED_CRAFTING_RECORD",
				message:
					"As materias-primas da receita estao no formato JSON invalido.",
			});
		}

		const materialsRecovered: Record<string, number> = {};
		for (const mat of requiredMaterials) {
			materialsRecovered[mat.materialId] = Math.max(
				1,
				Math.floor(mat.quantity / 2),
			);
		}

		const deleteResult = await this.repository.deleteCraftedItem(itemId);
		if (!deleteResult.success) {
			return fail(deleteResult.error);
		}

		return ok({ materialsRecovered });
	}

	/**
	 * Recycles/Scraps a standard non-crafted equipment item to recover 1 unit of its base material.
	 */
	public scrapEquipment(
		equipmentId: string,
	): Result<{ materialRecovered: string }, CraftingFailure> {
		const baseEquipment = OFFICIAL_EQUIPMENT.find(
			(eq) => eq.id === equipmentId,
		);
		if (!baseEquipment) {
			return fail({
				code: "RECIPE_NOT_FOUND",
				message: `O equipamento ${equipmentId} nao existe no catalogo oficial.`,
			});
		}

		// Determine base material: wood for staves/bows, metal for swords/axes/shields/armors, essence/ore for magical items
		let material = "metal-ore";
		const idLower = baseEquipment.id.toLowerCase();
		if (
			idLower.includes("cajado") ||
			idLower.includes("staff") ||
			idLower.includes("arco") ||
			idLower.includes("bow") ||
			idLower.includes("bastao") ||
			idLower.includes("club")
		) {
			material = "ironwood";
		} else if (
			idLower.includes("anel") ||
			idLower.includes("ring") ||
			idLower.includes("relic") ||
			idLower.includes("gema") ||
			idLower.includes("tomo") ||
			idLower.includes("scroll")
		) {
			material = "mystic-essence";
		}

		return ok({ materialRecovered: material });
	}
}
