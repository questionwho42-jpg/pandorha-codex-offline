import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);
const catalogId = notBlankText.regex(/^[a-z][a-z0-9-]*$/).max(80);
const visibleLabel = notBlankText.max(120);
const sourceFile = notBlankText.max(180);
const ruleText = notBlankText.max(1000);
const slotCost = z.number().int().min(0).max(20);
const priceCopper = z.number().int().min(0).max(1_000_000);
const runeSlots = z.number().int().min(0).max(4);
const durability = z.number().int().min(0).max(100);
const stackQuantity = z.number().int().min(1).max(100);

export const equipmentKindSchema = z.enum(["weapon", "armor", "shield"]);
export const equipmentQualityTierSchema = z.enum([
	"mundane",
	"masterwork",
	"enchanted",
	"legendary",
]);
export const consumableKindSchema = z.enum([
	"adventuring-item",
	"potion-belt",
	"currency",
]);

export const equipment = sqliteTable("equipment", {
	id: text("id").primaryKey(),
	label: text("label").notNull(),
	kind: text("kind").notNull(),
	sourceFile: text("source_file").notNull(),
	slotCost: integer("slot_cost").notNull(),
	priceCopper: integer("price_copper").notNull(),
	qualityTier: text("quality_tier").notNull(),
	runeSlots: integer("rune_slots").notNull(),
	durabilityCurrent: integer("durability_current").notNull(),
	durabilityMax: integer("durability_max").notNull(),
	mechanicalSummary: text("mechanical_summary").notNull(),
});

export const consumables = sqliteTable("consumables", {
	id: text("id").primaryKey(),
	label: text("label").notNull(),
	kind: text("kind").notNull(),
	sourceFile: text("source_file").notNull(),
	quantity: integer("quantity").notNull(),
	maxQuantityPerStack: integer("max_quantity_per_stack").notNull(),
	slotCostPerStack: integer("slot_cost_per_stack").notNull(),
});

export const equipmentInsertSchema = createInsertSchema(equipment).extend({
	id: catalogId,
	label: visibleLabel,
	kind: equipmentKindSchema,
	sourceFile,
	slotCost,
	priceCopper,
	qualityTier: equipmentQualityTierSchema,
	runeSlots,
	durabilityCurrent: durability,
	durabilityMax: durability,
	mechanicalSummary: ruleText,
});

export const equipmentSelectSchema = createSelectSchema(equipment).extend({
	id: catalogId,
	label: visibleLabel,
	kind: equipmentKindSchema,
	sourceFile,
	slotCost,
	priceCopper,
	qualityTier: equipmentQualityTierSchema,
	runeSlots,
	durabilityCurrent: durability,
	durabilityMax: durability,
	mechanicalSummary: ruleText,
});

export const consumableInsertSchema = createInsertSchema(consumables).extend({
	id: catalogId,
	label: visibleLabel,
	kind: consumableKindSchema,
	sourceFile,
	quantity: stackQuantity,
	maxQuantityPerStack: stackQuantity,
	slotCostPerStack: slotCost,
});

export const consumableSelectSchema = createSelectSchema(consumables).extend({
	id: catalogId,
	label: visibleLabel,
	kind: consumableKindSchema,
	sourceFile,
	quantity: stackQuantity,
	maxQuantityPerStack: stackQuantity,
	slotCostPerStack: slotCost,
});

export const equipmentIdSchema = catalogId;
export const consumableIdSchema = catalogId;

export type EquipmentRecord = z.infer<typeof equipmentSelectSchema>;
export type NewEquipmentRecord = z.infer<typeof equipmentInsertSchema>;
export type EquipmentId = z.infer<typeof equipmentIdSchema>;

export type ConsumableRecord = z.infer<typeof consumableSelectSchema>;
export type NewConsumableRecord = z.infer<typeof consumableInsertSchema>;
export type ConsumableId = z.infer<typeof consumableIdSchema>;
