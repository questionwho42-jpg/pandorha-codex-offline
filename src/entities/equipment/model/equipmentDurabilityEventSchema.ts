import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const technicalId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(120);
const sequence = z.number().int().min(1).max(10_000);
const isoTimestamp = z.string().trim().datetime({ offset: true });

export const equipmentDurabilityConditionSchema = z.enum([
	"intact",
	"damaged",
	"broken",
]);

export const equipmentDurabilityEventTypeSchema = z.enum([
	"equipment-durability-condition-set",
]);

export const equipmentDurabilityEvents = sqliteTable(
	"equipment_durability_events",
	{
		id: text("id").primaryKey(),
		characterId: text("character_id").notNull(),
		sequence: integer("sequence").notNull(),
		inventoryEntryId: text("inventory_entry_id").notNull(),
		type: text("type").notNull(),
		condition: text("condition").notNull(),
		createdAt: text("created_at").notNull(),
	},
);

export const equipmentDurabilityEventInsertSchema = createInsertSchema(
	equipmentDurabilityEvents,
).extend({
	id: technicalId,
	characterId: technicalId,
	sequence,
	inventoryEntryId: technicalId,
	type: equipmentDurabilityEventTypeSchema,
	condition: equipmentDurabilityConditionSchema,
	createdAt: isoTimestamp,
});

export const equipmentDurabilityEventSelectSchema = createSelectSchema(
	equipmentDurabilityEvents,
).extend({
	id: technicalId,
	characterId: technicalId,
	sequence,
	inventoryEntryId: technicalId,
	type: equipmentDurabilityEventTypeSchema,
	condition: equipmentDurabilityConditionSchema,
	createdAt: isoTimestamp,
});

export const equipmentDurabilityEventLedgerSchema = z
	.array(equipmentDurabilityEventSelectSchema)
	.max(10_000);

export type EquipmentDurabilityCondition = z.infer<
	typeof equipmentDurabilityConditionSchema
>;
export type EquipmentDurabilityEventRecord = z.infer<
	typeof equipmentDurabilityEventSelectSchema
>;
export type NewEquipmentDurabilityEventRecord = z.infer<
	typeof equipmentDurabilityEventInsertSchema
>;
