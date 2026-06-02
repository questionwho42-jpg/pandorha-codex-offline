import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const technicalId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);
const visibleLabel = z.string().trim().min(1).max(120);
const visibleText = z.string().trim().min(1).max(240);
const sourceFile = z.string().trim().min(1).max(180);
const ruleText = z.string().trim().min(1).max(1000);
const appealModifier = z.number().int().min(-4).max(4);

export const dialogueChoiceTagSchema = z.enum([
	"persuade",
	"bargain",
	"threaten",
]);

export const dialogueChoices = sqliteTable("dialogue_choices", {
	id: text("id").primaryKey(),
	label: text("label").notNull(),
	visibleText: text("visible_text").notNull(),
	tag: text("tag").notNull(),
	appealModifier: integer("appeal_modifier").notNull(),
	sourceFile: text("source_file").notNull(),
	summary: text("summary").notNull(),
});

export const dialogueChoiceInsertSchema = createInsertSchema(
	dialogueChoices,
).extend({
	id: technicalId,
	label: visibleLabel,
	visibleText,
	tag: dialogueChoiceTagSchema,
	appealModifier,
	sourceFile,
	summary: ruleText,
});

export const dialogueChoiceSelectSchema = createSelectSchema(
	dialogueChoices,
).extend({
	id: technicalId,
	label: visibleLabel,
	visibleText,
	tag: dialogueChoiceTagSchema,
	appealModifier,
	sourceFile,
	summary: ruleText,
});

export const dialogueChoiceIdSchema = technicalId;

export type DialogueChoiceId = z.infer<typeof dialogueChoiceIdSchema>;
export type DialogueChoiceTag = z.infer<typeof dialogueChoiceTagSchema>;
export type NewDialogueChoiceRecord = z.infer<
	typeof dialogueChoiceInsertSchema
>;
export type DialogueChoiceRecord = z.infer<typeof dialogueChoiceSelectSchema>;
