import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CraftingRepository } from "../domain/CraftingRepository";
import {
	characterCraftedItems,
	characterCraftedItemSelectSchema,
	craftingRecipes,
	craftingRecipeSelectSchema,
	type CharacterCraftedItemRecord,
	type CraftingRecipeRecord,
	type NewCharacterCraftedItemRecord,
	type NewCraftingRecipeRecord,
} from "../model/craftingSchema";
import type { CraftingFailure } from "../model/craftingTypes";

/**
 * Interface genérica do Drizzle para permitir o bootstrap de queries no SQLite offline.
 */
export interface CraftingDrizzleDatabase {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic types
	insert(table: any): any;
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic types
	select(): any;
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic types
	delete(table: any): any;
}

export class DrizzleCraftingRepository implements CraftingRepository {
	public constructor(private readonly db: CraftingDrizzleDatabase) {}

	public async saveRecipe(
		recipe: NewCraftingRecipeRecord,
	): Promise<Result<CraftingRecipeRecord, CraftingFailure>> {
		try {
			const rows = await this.db.insert(craftingRecipes).values(recipe).returning();
			const parsed = craftingRecipeSelectSchema.safeParse(rows[0]);

			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_CRAFTING_RECORD",
					message: "Drizzle retornou uma receita inválida após inserção.",
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "CRAFTING_REPOSITORY_WRITE_FAILED",
				message: `Falha ao salvar receita no SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	public async findAllRecipes(): Promise<Result<readonly CraftingRecipeRecord[], CraftingFailure>> {
		try {
			const rows = await this.db.select().from(craftingRecipes);
			const records: CraftingRecipeRecord[] = [];

			for (const row of rows) {
				const parsed = craftingRecipeSelectSchema.safeParse(row);
				if (parsed.success) {
					records.push(parsed.data);
				}
			}

			return ok(records);
		} catch (error: unknown) {
			return fail({
				code: "CRAFTING_REPOSITORY_READ_FAILED",
				message: `Falha ao listar receitas no SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	public async findRecipeById(
		id: string,
	): Promise<Result<CraftingRecipeRecord, CraftingFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(craftingRecipes)
				.where(eq(craftingRecipes.id, id));

			if (rows.length === 0) {
				return fail({
					code: "RECIPE_NOT_FOUND",
					message: `Receita com ID ${id} não foi encontrada.`,
				});
			}

			const parsed = craftingRecipeSelectSchema.safeParse(rows[0]);
			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_CRAFTING_RECORD",
					message: "Receita corrompida ou inválida no banco de dados.",
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "CRAFTING_REPOSITORY_READ_FAILED",
				message: `Falha ao buscar receita por ID no SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	public async saveCraftedItem(
		item: NewCharacterCraftedItemRecord,
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		try {
			const rows = await this.db
				.insert(characterCraftedItems)
				.values(item)
				.returning();

			const parsed = characterCraftedItemSelectSchema.safeParse(rows[0]);
			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_CRAFTING_RECORD",
					message: "Drizzle retornou um item artesanal inválido após inserção.",
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "CRAFTING_REPOSITORY_WRITE_FAILED",
				message: `Falha ao salvar item artesanal no SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	public async findCraftedItemsByCharacterId(
		characterId: string,
	): Promise<Result<readonly CharacterCraftedItemRecord[], CraftingFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(characterCraftedItems)
				.where(eq(characterCraftedItems.characterId, characterId));

			const records: CharacterCraftedItemRecord[] = [];
			for (const row of rows) {
				const parsed = characterCraftedItemSelectSchema.safeParse(row);
				if (parsed.success) {
					records.push(parsed.data);
				}
			}

			return ok(records);
		} catch (error: unknown) {
			return fail({
				code: "CRAFTING_REPOSITORY_READ_FAILED",
				message: `Falha ao buscar itens artesanais por personagem no SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	public async deleteCraftedItem(
		id: string,
	): Promise<Result<void, CraftingFailure>> {
		try {
			await this.db
				.delete(characterCraftedItems)
				.where(eq(characterCraftedItems.id, id));

			return ok(undefined);
		} catch (error: unknown) {
			return fail({
				code: "CRAFTING_REPOSITORY_WRITE_FAILED",
				message: `Falha ao deletar item artesanal no SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}
}
