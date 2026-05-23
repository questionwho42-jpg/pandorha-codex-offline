import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);

export const campaignQuests = sqliteTable("campaign_quests", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	status: text("status").notNull().default("active"), // 'active', 'completed', 'failed'
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
	requirementsJson: z.string(),
	rewardsJson: z.string(),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export type QuestRecord = z.infer<typeof questSelectSchema>;
export type NewQuestRecord = z.infer<typeof questInsertSchema>;
