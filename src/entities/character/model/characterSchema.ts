import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);
const characterName = notBlankText.max(80);
const characterConcept = notBlankText.max(280);
const level = z.number().int().min(1).max(20);
const aptitudeValue = z.number().int().min(1).max(6);

export const characters = sqliteTable("characters", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	concept: text("concept").notNull(),
	ancestryId: text("ancestry_id").notNull(),
	classId: text("class_id").notNull(),
	backgroundId: text("background_id").notNull(),
	level: integer("level").notNull(),
	physical: integer("physical").notNull(),
	mental: integer("mental").notNull(),
	social: integer("social").notNull(),
	conflict: integer("conflict").notNull(),
	interaction: integer("interaction").notNull(),
	resistance: integer("resistance").notNull(),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const characterInsertSchema = createInsertSchema(characters).extend({
	id: notBlankText,
	name: characterName,
	concept: characterConcept,
	ancestryId: notBlankText,
	classId: notBlankText,
	backgroundId: notBlankText,
	level,
	physical: aptitudeValue,
	mental: aptitudeValue,
	social: aptitudeValue,
	conflict: aptitudeValue,
	interaction: aptitudeValue,
	resistance: aptitudeValue,
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export const characterSelectSchema = createSelectSchema(characters).extend({
	id: notBlankText,
	name: characterName,
	concept: characterConcept,
	ancestryId: notBlankText,
	classId: notBlankText,
	backgroundId: notBlankText,
	level,
	physical: aptitudeValue,
	mental: aptitudeValue,
	social: aptitudeValue,
	conflict: aptitudeValue,
	interaction: aptitudeValue,
	resistance: aptitudeValue,
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export const characterCreateInputSchema = characterInsertSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export type CharacterRecord = z.infer<typeof characterSelectSchema>;
export type NewCharacterRecord = z.infer<typeof characterInsertSchema>;
export type CharacterCreateInput = z.infer<typeof characterCreateInputSchema>;
