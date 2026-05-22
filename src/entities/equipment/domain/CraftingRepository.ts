import type { Result } from "$lib/shared/lib/result";
import type {
	CharacterCraftedItemRecord,
	CraftingRecipeRecord,
	NewCharacterCraftedItemRecord,
	NewCraftingRecipeRecord,
} from "../model/craftingSchema";
import type { CraftingFailure } from "../model/craftingTypes";

export interface CraftingRepository {
	saveRecipe(
		recipe: NewCraftingRecipeRecord,
	): Promise<Result<CraftingRecipeRecord, CraftingFailure>>;

	findAllRecipes(): Promise<
		Result<readonly CraftingRecipeRecord[], CraftingFailure>
	>;

	findRecipeById(
		id: string,
	): Promise<Result<CraftingRecipeRecord, CraftingFailure>>;

	saveCraftedItem(
		item: NewCharacterCraftedItemRecord,
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>>;

	findCraftedItemsByCharacterId(
		characterId: string,
	): Promise<Result<readonly CharacterCraftedItemRecord[], CraftingFailure>>;

	deleteCraftedItem(id: string): Promise<Result<void, CraftingFailure>>;

	updateCraftedItemEquipStatus(
		id: string,
		isEquipped: number,
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>>;
}
