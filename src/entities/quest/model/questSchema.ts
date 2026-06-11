import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);

export const campaignQuests = sqliteTable("campaign_quests", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	status: text("status").notNull().default("active"), // 'active', 'completed', 'failed'
	scope: text("scope").notNull().default("campaign"), // 'campaign', 'guild'
	requirementsJson: text("requirements_json").notNull().default("[]"), // Array de chaves de pistas (ex: ['pista_bastiao'])
	rewardsJson: text("rewards_json").notNull().default("{}"), // Recompensas (ex: { gold: 100, renown: 5 })
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const questInsertSchema = createInsertSchema(campaignQuests).extend({
	id: notBlankText,
	title: z.string().trim().min(1).max(200),
	description: z.string().trim(),
	status: z.enum(["active", "completed", "failed"]).default("active"),
	scope: z.enum(["campaign", "guild"]).default("campaign"),
	requirementsJson: z.string().default("[]"),
	rewardsJson: z.string().default("{}"),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export const questSelectSchema = createSelectSchema(campaignQuests).extend({
	id: notBlankText,
	title: notBlankText,
	description: z.string(),
	status: z.enum(["active", "completed", "failed"]),
	scope: z.enum(["campaign", "guild"]),
	requirementsJson: z.string(),
	rewardsJson: z.string(),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export type QuestRecord = z.infer<typeof questSelectSchema>;
export type NewQuestRecord = z.infer<typeof questInsertSchema>;

export const questObjectives = sqliteTable("quest_objectives", {
	id: text("id").primaryKey(),
	questId: text("quest_id").notNull(),
	description: text("description").notNull(),
	status: text("status").notNull().default("active"), // 'active', 'completed', 'failed'
	type: text("type").notNull(), // 'kill' | 'collect' | 'clue' | 'custom'
	target: text("target").notNull(), // e.g. target name or clue ID
	currentAmount: integer("current_amount").notNull().default(0),
	requiredAmount: integer("required_amount").notNull().default(1),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const questObjectiveInsertSchema = createInsertSchema(
	questObjectives,
).extend({
	id: notBlankText,
	questId: notBlankText,
	description: z.string().trim().min(1),
	status: z.enum(["active", "completed", "failed"]).default("active"),
	type: z.enum(["kill", "collect", "clue", "custom"]),
	target: z.string().trim().min(1),
	currentAmount: z.number().int().min(0).default(0),
	requiredAmount: z.number().int().min(1).default(1),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export const questObjectiveSelectSchema = createSelectSchema(
	questObjectives,
).extend({
	id: notBlankText,
	questId: notBlankText,
	description: notBlankText,
	status: z.enum(["active", "completed", "failed"]),
	type: z.enum(["kill", "collect", "clue", "custom"]),
	target: notBlankText,
	currentAmount: z.number().int().min(0),
	requiredAmount: z.number().int().min(1),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export type QuestObjectiveRecord = z.infer<typeof questObjectiveSelectSchema>;
export type NewQuestObjectiveRecord = z.infer<
	typeof questObjectiveInsertSchema
>;
