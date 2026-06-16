import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { type RefinementCtx, z } from "zod/v4";

const technicalId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(120);
const sequence = z.number().int().min(1).max(10_000);
const isoTimestamp = z.string().trim().datetime({ offset: true });

export const equipmentLoadoutEventTypeSchema = z.enum([
	"equipment-loadout-slot-equipped",
	"equipment-loadout-slot-cleared",
]);

export const equipmentLoadoutEventSlotSchema = z.enum([
	"mainHand",
	"offHand",
	"armor",
]);

export const equipmentLoadoutEvents = sqliteTable("equipment_loadout_events", {
	id: text("id").primaryKey(),
	characterId: text("character_id").notNull(),
	sequence: integer("sequence").notNull(),
	type: text("type").notNull(),
	slot: text("slot").notNull(),
	inventoryEntryId: text("inventory_entry_id"),
	createdAt: text("created_at").notNull(),
});

export const equipmentLoadoutEventInsertSchema = createInsertSchema(
	equipmentLoadoutEvents,
)
	.extend({
		id: technicalId,
		characterId: technicalId,
		sequence,
		type: equipmentLoadoutEventTypeSchema,
		slot: equipmentLoadoutEventSlotSchema,
		inventoryEntryId: technicalId.nullable(),
		createdAt: isoTimestamp,
	})
	.superRefine(validateInventoryEntryContract);

export const equipmentLoadoutEventSelectSchema = createSelectSchema(
	equipmentLoadoutEvents,
)
	.extend({
		id: technicalId,
		characterId: technicalId,
		sequence,
		type: equipmentLoadoutEventTypeSchema,
		slot: equipmentLoadoutEventSlotSchema,
		inventoryEntryId: technicalId.nullable(),
		createdAt: isoTimestamp,
	})
	.superRefine(validateInventoryEntryContract);

export const equipmentLoadoutEventLedgerSchema = z
	.array(equipmentLoadoutEventSelectSchema)
	.max(10_000);

export type EquipmentLoadoutEventRecord = z.infer<
	typeof equipmentLoadoutEventSelectSchema
>;
export type NewEquipmentLoadoutEventRecord = z.infer<
	typeof equipmentLoadoutEventInsertSchema
>;
export type EquipmentLoadoutEventSlot = z.infer<
	typeof equipmentLoadoutEventSlotSchema
>;

function validateInventoryEntryContract(
	event: {
		readonly type: z.infer<typeof equipmentLoadoutEventTypeSchema>;
		readonly inventoryEntryId: string | null;
	},
	context: RefinementCtx,
): void {
	if (
		event.type === "equipment-loadout-slot-equipped" &&
		event.inventoryEntryId === null
	) {
		context.addIssue({
			code: "custom",
			path: ["inventoryEntryId"],
			message: "Equipped loadout events require an inventory entry id.",
		});
	}

	if (
		event.type === "equipment-loadout-slot-cleared" &&
		event.inventoryEntryId !== null
	) {
		context.addIssue({
			code: "custom",
			path: ["inventoryEntryId"],
			message: "Cleared loadout events must not carry an inventory entry id.",
		});
	}
}
