import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const technicalId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(120);
const sequence = z.number().int().min(1).max(10_000);
const quantity = z.number().int().min(0).max(999);
const isoTimestamp = z.string().trim().datetime({ offset: true });

export const inventoryEventTypeSchema = z.enum([
	"inventory-item-added",
	"inventory-quantity-set",
	"inventory-item-removed",
]);

export const inventoryCatalogKindSchema = z.enum(["equipment", "consumable"]);

export const inventoryEvents = sqliteTable("inventory_events", {
	id: text("id").primaryKey(),
	characterId: text("character_id").notNull(),
	sequence: integer("sequence").notNull(),
	type: text("type").notNull(),
	entryId: text("entry_id").notNull(),
	catalogKind: text("catalog_kind").notNull(),
	catalogItemId: text("catalog_item_id").notNull(),
	quantity: integer("quantity").notNull(),
	createdAt: text("created_at").notNull(),
});

export const inventoryEventInsertSchema = createInsertSchema(
	inventoryEvents,
).extend({
	id: technicalId,
	characterId: technicalId,
	sequence,
	type: inventoryEventTypeSchema,
	entryId: technicalId,
	catalogKind: inventoryCatalogKindSchema,
	catalogItemId: technicalId,
	quantity,
	createdAt: isoTimestamp,
});

export const inventoryEventSelectSchema = createSelectSchema(
	inventoryEvents,
).extend({
	id: technicalId,
	characterId: technicalId,
	sequence,
	type: inventoryEventTypeSchema,
	entryId: technicalId,
	catalogKind: inventoryCatalogKindSchema,
	catalogItemId: technicalId,
	quantity,
	createdAt: isoTimestamp,
});

export const inventoryEventLedgerSchema = z
	.array(inventoryEventSelectSchema)
	.max(10_000);

export const inventoryCharacterIdSchema = technicalId;

export type InventoryEventRecord = z.infer<typeof inventoryEventSelectSchema>;
export type NewInventoryEventRecord = z.infer<
	typeof inventoryEventInsertSchema
>;
export type InventoryCatalogKind = z.infer<typeof inventoryCatalogKindSchema>;
