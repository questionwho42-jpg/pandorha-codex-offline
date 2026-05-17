import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { characters } from "$lib/entities/character/model/characterSchema";

const notBlankText = z.string().trim().min(1);
const recipeIdSchema = notBlankText.regex(/^[a-z][a-z0-9-]*$/).max(80);
const visibleLabel = notBlankText.max(120);
const difficultyVal = z.number().int().min(5).max(30);
const priceVal = z.number().int().min(0).max(1_000_000);
const flagVal = z.number().int().min(0).max(1); // 0 ou 1 para boolean no SQLite

// Estrutura Zod para validação do array de materiais requeridos
export const craftingMaterialRequirementSchema = z.object({
	materialId: z.enum(["ether-ore", "ironwood", "mystic-essence", "metal-ore"]),
	quantity: z.number().int().min(1).max(100),
});

export const craftingMaterialsListSchema = z.array(craftingMaterialRequirementSchema);

// Tabela de Receitas de Forja Conhecidas
export const craftingRecipes = sqliteTable("crafting_recipes", {
	id: text("id").primaryKey(),
	label: text("label").notNull(),
	targetEquipmentId: text("target_equipment_id").notNull(),
	difficultyClass: integer("difficulty_class").notNull(),
	copperCost: integer("copper_cost").notNull(),
	materialsRequiredJson: text("materials_required_json").notNull(), // Array JSON validado
});

// Tabela de Itens Forjados Customizados
export const characterCraftedItems = sqliteTable("character_crafted_items", {
	id: text("id").primaryKey(),
	characterId: text("character_id")
		.notNull()
		.references(() => characters.id, { onDelete: "cascade" }),
	equipmentId: text("equipment_id").notNull(),
	label: text("label").notNull(),
	isSharp: integer("is_sharp").notNull(), // 0 ou 1 (Decorator Afiada)
	isReinforced: integer("is_reinforced").notNull(), // 0 ou 1 (Decorator Reforçada)
	isRunic: integer("is_runic").notNull(), // 0 ou 1 (Decorator Rúnica)
	durabilityCurrent: integer("durability_current").notNull(),
	durabilityMax: integer("durability_max").notNull(),
	createdAt: text("created_at").notNull(),
});

export const craftingRecipeInsertSchema = createInsertSchema(craftingRecipes).extend({
	id: recipeIdSchema,
	label: visibleLabel,
	targetEquipmentId: notBlankText,
	difficultyClass: difficultyVal,
	copperCost: priceVal,
	materialsRequiredJson: z.string(),
});

export const craftingRecipeSelectSchema = createSelectSchema(craftingRecipes).extend({
	id: recipeIdSchema,
	label: visibleLabel,
	targetEquipmentId: notBlankText,
	difficultyClass: difficultyVal,
	copperCost: priceVal,
	materialsRequiredJson: z.string(),
});

export const characterCraftedItemInsertSchema = createInsertSchema(characterCraftedItems).extend({
	id: notBlankText,
	characterId: notBlankText,
	equipmentId: notBlankText,
	label: visibleLabel,
	isSharp: flagVal,
	isReinforced: flagVal,
	isRunic: flagVal,
	durabilityCurrent: z.number().int().min(0).max(100),
	durabilityMax: z.number().int().min(1).max(100),
	createdAt: notBlankText,
});

export const characterCraftedItemSelectSchema = createSelectSchema(characterCraftedItems).extend({
	id: notBlankText,
	characterId: notBlankText,
	equipmentId: notBlankText,
	label: visibleLabel,
	isSharp: flagVal,
	isReinforced: flagVal,
	isRunic: flagVal,
	durabilityCurrent: z.number().int().min(0).max(100),
	durabilityMax: z.number().int().min(1).max(100),
	createdAt: notBlankText,
});

export type CraftingRecipeRecord = z.infer<typeof craftingRecipeSelectSchema>;
export type NewCraftingRecipeRecord = z.infer<typeof craftingRecipeInsertSchema>;

export type CharacterCraftedItemRecord = z.infer<typeof characterCraftedItemSelectSchema>;
export type NewCharacterCraftedItemRecord = z.infer<typeof characterCraftedItemInsertSchema>;
