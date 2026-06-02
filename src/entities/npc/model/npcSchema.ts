import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const technicalId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);
const visibleLabel = z.string().trim().min(1).max(120);
const sourceFile = z.string().trim().min(1).max(180);
const ruleText = z.string().trim().min(1).max(1000);
const tierValue = z.number().int().min(1).max(4);
const socialCounter = z.number().int().min(1).max(999);

export const npcRoleSchema = z.enum(["broker", "captain", "informant"]);

export const npcAttitudeSchema = z.enum([
	"friendly",
	"neutral",
	"skeptical",
	"hostile",
]);

export const npcs = sqliteTable("npcs", {
	id: text("id").primaryKey(),
	label: text("label").notNull(),
	role: text("role").notNull(),
	factionId: text("faction_id").notNull(),
	tier: integer("tier").notNull(),
	mentalHp: integer("mental_hp").notNull(),
	patience: integer("patience").notNull(),
	attitude: text("attitude").notNull(),
	sourceFile: text("source_file").notNull(),
	summary: text("summary").notNull(),
});

export const npcInsertSchema = createInsertSchema(npcs).extend({
	id: technicalId,
	label: visibleLabel,
	role: npcRoleSchema,
	factionId: technicalId,
	tier: tierValue,
	mentalHp: socialCounter,
	patience: socialCounter,
	attitude: npcAttitudeSchema,
	sourceFile,
	summary: ruleText,
});

export const npcSelectSchema = createSelectSchema(npcs).extend({
	id: technicalId,
	label: visibleLabel,
	role: npcRoleSchema,
	factionId: technicalId,
	tier: tierValue,
	mentalHp: socialCounter,
	patience: socialCounter,
	attitude: npcAttitudeSchema,
	sourceFile,
	summary: ruleText,
});

export const npcIdSchema = technicalId;
export const npcFactionIdSchema = technicalId;

export type NpcId = z.infer<typeof npcIdSchema>;
export type NpcFactionId = z.infer<typeof npcFactionIdSchema>;
export type NewNpcRecord = z.infer<typeof npcInsertSchema>;
export type NpcRecord = z.infer<typeof npcSelectSchema>;
