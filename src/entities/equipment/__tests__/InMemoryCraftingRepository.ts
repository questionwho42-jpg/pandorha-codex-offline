import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CraftingRepository } from "../domain/CraftingRepository";
import type {
	CharacterCraftedItemRecord,
	CraftingRecipeRecord,
	NewCharacterCraftedItemRecord,
	NewCraftingRecipeRecord,
} from "../model/craftingSchema";
import type { CraftingFailure } from "../model/craftingTypes";

export class InMemoryCraftingRepository implements CraftingRepository {
	private readonly recipes = new Map<string, CraftingRecipeRecord>();
	private readonly items = new Map<string, CharacterCraftedItemRecord>();

	public async saveRecipe(
		recipe: NewCraftingRecipeRecord,
	): Promise<Result<CraftingRecipeRecord, CraftingFailure>> {
		const record: CraftingRecipeRecord = { ...recipe };
		this.recipes.set(record.id, record);
		return ok(record);
	}

	public async findAllRecipes(): Promise<
		Result<readonly CraftingRecipeRecord[], CraftingFailure>
	> {
		return ok(Array.from(this.recipes.values()));
	}

	public async findRecipeById(
		id: string,
	): Promise<Result<CraftingRecipeRecord, CraftingFailure>> {
		const recipe = this.recipes.get(id);
		if (!recipe) {
			return fail({
				code: "RECIPE_NOT_FOUND",
				message: `Receita com ID ${id} não encontrada no repositório.`,
			});
		}
		return ok(recipe);
	}

	public async saveCraftedItem(
		item: NewCharacterCraftedItemRecord,
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		const record: CharacterCraftedItemRecord = { ...item };
		this.items.set(record.id, record);
		return ok(record);
	}

	public async findCraftedItemsByCharacterId(
		characterId: string,
	): Promise<Result<readonly CharacterCraftedItemRecord[], CraftingFailure>> {
		const matches = Array.from(this.items.values()).filter(
			(item) => item.characterId === characterId,
		);
		return ok(matches);
	}

	public async deleteCraftedItem(
		id: string,
	): Promise<Result<void, CraftingFailure>> {
		const existed = this.items.delete(id);
		if (!existed) {
			return fail({
				code: "CRAFTING_REPOSITORY_WRITE_FAILED",
				message: `Item artesanal com ID ${id} não pôde ser excluído ou não existe.`,
			});
		}
		return ok(undefined);
	}

	public async updateCraftedItemEquipStatus(
		id: string,
		isEquipped: number,
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		const item = this.items.get(id);
		if (!item) {
			return fail({
				code: "ITEM_NOT_FOUND",
				message: `Item artesanal com ID ${id} não foi localizado em memória para equipar/desequipar.`,
			});
		}
		const updated = { ...item, isEquipped };
		this.items.set(id, updated);
		return ok(updated);
	}

	public async updateCraftedItemDurability(
		id: string,
		durabilityCurrent: number,
		durability: "mint" | "damaged" | "broken",
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		const item = this.items.get(id);
		if (!item) {
			return fail({
				code: "ITEM_NOT_FOUND",
				message: `Item artesanal com ID ${id} não foi localizado em memória para atualizar durabilidade.`,
			});
		}
		const updated = { ...item, durabilityCurrent, durability };
		this.items.set(id, updated);
		return ok(updated);
	}

	public async updateCraftedItem(
		item: CharacterCraftedItemRecord,
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		if (!this.items.has(item.id)) {
			return fail({
				code: "ITEM_NOT_FOUND",
				message: `Item artesanal com ID ${item.id} não foi localizado em memória para atualização.`,
			});
		}
		const updated = { ...item };
		this.items.set(item.id, updated);
		return ok(updated);
	}
}
