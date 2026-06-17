import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const technicalId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(120);
const traitSelectionSequenceSchema = z.union([
	z.literal(1),
	z.literal(2),
	z.literal(3),
]);
const isoTimestamp = z.string().trim().datetime({ offset: true });

export const characterTraitSelections = sqliteTable(
	"character_trait_selections",
	{
		id: text("id").primaryKey(),
		characterId: text("character_id").notNull(),
		sequence: integer("sequence").notNull(),
		traitId: text("trait_id").notNull(),
		createdAt: text("created_at").notNull(),
	},
);

export const characterTraitSelectionInsertSchema = createInsertSchema(
	characterTraitSelections,
).extend({
	id: technicalId,
	characterId: technicalId,
	sequence: traitSelectionSequenceSchema,
	traitId: technicalId,
	createdAt: isoTimestamp,
});

export const characterTraitSelectionSelectSchema = createSelectSchema(
	characterTraitSelections,
).extend({
	id: technicalId,
	characterId: technicalId,
	sequence: traitSelectionSequenceSchema,
	traitId: technicalId,
	createdAt: isoTimestamp,
});

export const characterTraitSelectionLedgerSchema = z
	.array(characterTraitSelectionSelectSchema)
	.max(10_000);

export type CharacterTraitSelectionRecord = z.infer<
	typeof characterTraitSelectionSelectSchema
>;
export type NewCharacterTraitSelectionRecord = z.infer<
	typeof characterTraitSelectionInsertSchema
>;
export type CharacterTraitSelectionSequence = z.infer<
	typeof traitSelectionSequenceSchema
>;
