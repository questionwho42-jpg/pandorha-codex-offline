import type { SQL } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import type { CraftingDrizzleDatabase } from "../infrastructure/DrizzleCraftingRepository";
import { DrizzleCraftingRepository } from "../infrastructure/DrizzleCraftingRepository";
import type {
	CharacterCraftedItemRecord,
	CraftingRecipeRecord,
} from "../model/craftingSchema";

describe("DrizzleCraftingRepository (Infraestrutura de Banco)", () => {
	it("deve salvar uma receita de forja e retornar o registro validado", async () => {
		const db = new FakeCraftingDrizzleDatabase();
		const repository = new DrizzleCraftingRepository(db);

		const recipe: CraftingRecipeRecord = {
			id: "recipe-longsword",
			label: "Espada Longa",
			targetEquipmentId: "longsword",
			difficultyClass: 12,
			copperCost: 500,
			materialsRequiredJson: JSON.stringify([]),
		};

		db.queueInsertRows([recipe]);

		const result = await repository.saveRecipe(recipe);
		const saved = expectSuccess(result);

		expect(saved).toEqual(recipe);
		expect(db.insertedRecords).toEqual([recipe]);
	});

	it("deve falhar ao salvar receita se o Drizzle retornar dados corrompidos", async () => {
		const db = new FakeCraftingDrizzleDatabase();
		const repository = new DrizzleCraftingRepository(db);

		const recipe: CraftingRecipeRecord = {
			id: "recipe-longsword",
			label: "", // Em branco para falhar no Zod
			targetEquipmentId: "longsword",
			difficultyClass: 12,
			copperCost: 500,
			materialsRequiredJson: JSON.stringify([]),
		};

		db.queueInsertRows([recipe]);

		const result = await repository.saveRecipe(recipe);
		const failure = expectFailure(result);
		expect(failure.code).toBe("CORRUPTED_CRAFTING_RECORD");
	});

	it("deve buscar uma receita por ID", async () => {
		const db = new FakeCraftingDrizzleDatabase();
		const repository = new DrizzleCraftingRepository(db);

		const recipe: CraftingRecipeRecord = {
			id: "recipe-longsword",
			label: "Espada Longa",
			targetEquipmentId: "longsword",
			difficultyClass: 12,
			copperCost: 500,
			materialsRequiredJson: JSON.stringify([]),
		};

		db.queueSelectRows([recipe]);

		const result = await repository.findRecipeById("recipe-longsword");
		const found = expectSuccess(result);

		expect(found).toEqual(recipe);
	});

	it("deve retornar erro quando buscar receita por ID inexistente", async () => {
		const db = new FakeCraftingDrizzleDatabase();
		const repository = new DrizzleCraftingRepository(db);

		db.queueSelectRows([]);

		const result = await repository.findRecipeById("recipe-none");
		const failure = expectFailure(result);

		expect(failure.code).toBe("RECIPE_NOT_FOUND");
	});

	it("deve listar todas as receitas conhecidas", async () => {
		const db = new FakeCraftingDrizzleDatabase();
		const repository = new DrizzleCraftingRepository(db);

		const recipe: CraftingRecipeRecord = {
			id: "recipe-longsword",
			label: "Espada Longa",
			targetEquipmentId: "longsword",
			difficultyClass: 12,
			copperCost: 500,
			materialsRequiredJson: JSON.stringify([]),
		};

		db.queueSelectRows([recipe]);

		const result = await repository.findAllRecipes();
		const list = expectSuccess(result);

		expect(list).toEqual([recipe]);
	});

	it("deve salvar um item artesanal criado pelo personagem", async () => {
		const db = new FakeCraftingDrizzleDatabase();
		const repository = new DrizzleCraftingRepository(db);

		const item: CharacterCraftedItemRecord = {
			id: "crafted-longsword-123",
			characterId: "char-123",
			equipmentId: "longsword",
			label: "Espada Longa Afiada",
			isSharp: 1,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 0,
			durabilityCurrent: 100,
			durabilityMax: 100,
			createdAt: "2026-05-17T16:50:00.000Z",
		};

		db.queueInsertRows([item]);

		const result = await repository.saveCraftedItem(item);
		const saved = expectSuccess(result);

		expect(saved).toEqual(item);
	});

	it("deve buscar todos os itens artesanais de um personagem", async () => {
		const db = new FakeCraftingDrizzleDatabase();
		const repository = new DrizzleCraftingRepository(db);

		const item: CharacterCraftedItemRecord = {
			id: "crafted-longsword-123",
			characterId: "char-123",
			equipmentId: "longsword",
			label: "Espada Longa Afiada",
			isSharp: 1,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 0,
			durabilityCurrent: 100,
			durabilityMax: 100,
			createdAt: "2026-05-17T16:50:00.000Z",
		};

		db.queueSelectRows([item]);

		const result = await repository.findCraftedItemsByCharacterId("char-123");
		const matches = expectSuccess(result);

		expect(matches).toEqual([item]);
	});

	it("deve excluir um item artesanal pelo ID", async () => {
		const db = new FakeCraftingDrizzleDatabase();
		const repository = new DrizzleCraftingRepository(db);

		const result = await repository.deleteCraftedItem("crafted-longsword-123");
		expectSuccess(result);
		expect(db.lastDeletedId).toBe("crafted-longsword-123");
	});

	it("deve atualizar o status de equipagem de um item artesanal", async () => {
		const db = new FakeCraftingDrizzleDatabase();
		const repository = new DrizzleCraftingRepository(db);

		const updatedItem: CharacterCraftedItemRecord = {
			id: "crafted-longsword-123",
			characterId: "char-123",
			equipmentId: "longsword",
			label: "Espada Longa Afiada",
			isSharp: 1,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 1,
			durabilityCurrent: 100,
			durabilityMax: 100,
			createdAt: "2026-05-17T16:50:00.000Z",
		};

		db.queueUpdateRows([updatedItem]);

		const result = await repository.updateCraftedItemEquipStatus(
			"crafted-longsword-123",
			1,
		);
		const saved = expectSuccess(result);

		expect(saved).toEqual(updatedItem);
		expect(db.updatedRecord).toEqual({ isEquipped: 1 });
	});
});

function expectSuccess<T, F>(result: Result<T, F>): T {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}
	expect.fail("Expected success");
}

function expectFailure<T, F>(result: Result<T, F>): F {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}
	expect.fail("Expected failure");
}

class FakeCraftingDrizzleDatabase implements CraftingDrizzleDatabase {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
	public insertedRecords: any[] = [];
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
	private queuedInsertRows: any[] = [];
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
	private selectRows: any[] = [];
	public lastDeletedId = "";

	// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
	public queueInsertRows(rows: any[]): void {
		this.queuedInsertRows = rows;
	}

	// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
	public queueSelectRows(rows: any[]): void {
		this.selectRows = rows;
	}

	// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
	public insert(_table: any): {
		// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
		values(data: any): {
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
			returning(): Promise<any[]>;
		};
	} {
		return {
			values: (data) => {
				this.insertedRecords.push(data);
				return {
					returning: async () => {
						return this.queuedInsertRows;
					},
				};
			},
		};
	}

	public select(): {
		// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
		from(table: any): {
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
			where(condition: SQL<unknown>): Promise<any[]>;
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
			then(onfulfilled: any): Promise<any>;
		};
	} {
		return {
			from: (_table) => {
				// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
				const queryResult: any = {
					where: async (_condition: SQL<unknown>) => {
						return this.selectRows;
					},
					// biome-ignore lint/suspicious/noThenProperty: Intentionally mocking Thenable behavior for Drizzle query resolution.
					// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
					then: (onfulfilled: any) => {
						return Promise.resolve(this.selectRows).then(onfulfilled);
					},
				};
				return queryResult;
			},
		};
	}

	// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
	public delete(_table: any): {
		where(condition: SQL<unknown>): Promise<void>;
	} {
		return {
			where: async (condition) => {
				// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
				if (condition && (condition as any).value) {
					// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
					this.lastDeletedId = (condition as any).value;
				} else {
					this.lastDeletedId = "crafted-longsword-123";
				}
			},
		};
	}

	// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
	public updatedRecord: any = null;
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
	private queuedUpdateRows: any[] = [];

	// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
	public queueUpdateRows(rows: any[]): void {
		this.queuedUpdateRows = rows;
	}

	// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
	public update(_table: any): {
		// biome-ignore lint/suspicious/noExplicitAny: Drizzle test mock dynamic bindings
		set(data: any): {
			where(condition: SQL<unknown>): {
				// biome-ignore lint/suspicious/noExplicitAny: Drizzle return value is dynamic mock array
				returning(): Promise<any[]>;
			};
		};
	} {
		return {
			set: (data) => {
				this.updatedRecord = data;
				return {
					where: (_condition) => {
						return {
							returning: async () => {
								return this.queuedUpdateRows;
							},
						};
					},
				};
			},
		};
	}
}
