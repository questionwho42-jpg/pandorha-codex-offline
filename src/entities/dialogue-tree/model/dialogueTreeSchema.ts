import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const technicalId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(120);
const visibleLabel = z.string().trim().min(1).max(120);
const visibleText = z.string().trim().min(1).max(320);
const blockedReason = z.string().trim().min(1).max(160);
const sourceFile = z.string().trim().min(1).max(180);
const ruleText = z.string().trim().min(1).max(1000);
const sortOrder = z.number().int().min(0).max(99);
const minimumMentalHp = z.number().int().min(0).max(999);

export const dialogueNodeKindSchema = z.enum(["start", "response"]);

export const dialogueNodes = sqliteTable("dialogue_nodes", {
	id: text("id").primaryKey(),
	npcId: text("npc_id").notNull(),
	label: text("label").notNull(),
	bodyText: text("body_text").notNull(),
	kind: text("kind").notNull(),
	sourceFile: text("source_file").notNull(),
	summary: text("summary").notNull(),
});

export const dialogueOptions = sqliteTable("dialogue_options", {
	id: text("id").primaryKey(),
	nodeId: text("node_id").notNull(),
	label: text("label").notNull(),
	visibleText: text("visible_text").notNull(),
	choiceId: text("choice_id").notNull(),
	nextNodeId: text("next_node_id").notNull(),
	minimumMentalHp: integer("minimum_mental_hp"),
	blockedReason: text("blocked_reason"),
	sortOrder: integer("sort_order").notNull(),
	sourceFile: text("source_file").notNull(),
	summary: text("summary").notNull(),
});

export const dialogueNodeInsertSchema = createInsertSchema(
	dialogueNodes,
).extend({
	id: technicalId,
	npcId: technicalId,
	label: visibleLabel,
	bodyText: visibleText,
	kind: dialogueNodeKindSchema,
	sourceFile,
	summary: ruleText,
});

export const dialogueNodeSelectSchema = createSelectSchema(
	dialogueNodes,
).extend({
	id: technicalId,
	npcId: technicalId,
	label: visibleLabel,
	bodyText: visibleText,
	kind: dialogueNodeKindSchema,
	sourceFile,
	summary: ruleText,
});

export const dialogueOptionInsertSchema = createInsertSchema(
	dialogueOptions,
).extend({
	id: technicalId,
	nodeId: technicalId,
	label: visibleLabel,
	visibleText,
	choiceId: technicalId,
	nextNodeId: technicalId,
	minimumMentalHp: minimumMentalHp.optional(),
	blockedReason: blockedReason.optional(),
	sortOrder,
	sourceFile,
	summary: ruleText,
});

export const dialogueOptionSelectSchema = createSelectSchema(
	dialogueOptions,
).extend({
	id: technicalId,
	nodeId: technicalId,
	label: visibleLabel,
	visibleText,
	choiceId: technicalId,
	nextNodeId: technicalId,
	minimumMentalHp: minimumMentalHp.optional(),
	blockedReason: blockedReason.optional(),
	sortOrder,
	sourceFile,
	summary: ruleText,
});

export const dialogueNodeIdSchema = technicalId;
export const dialogueOptionIdSchema = technicalId;
export const dialogueNpcIdSchema = technicalId;

export type DialogueNodeId = z.infer<typeof dialogueNodeIdSchema>;
export type DialogueOptionId = z.infer<typeof dialogueOptionIdSchema>;
export type DialogueNpcId = z.infer<typeof dialogueNpcIdSchema>;
export type NewDialogueNodeRecord = z.infer<typeof dialogueNodeInsertSchema>;
export type DialogueNodeRecord = z.infer<typeof dialogueNodeSelectSchema>;
export type NewDialogueOptionRecord = z.infer<
	typeof dialogueOptionInsertSchema
>;
export type DialogueOptionRecord = z.infer<typeof dialogueOptionSelectSchema>;
