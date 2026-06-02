import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);
const isoTimestamp = z.string().trim().datetime({ offset: true });

export const campaignInvestigations = sqliteTable("campaign_investigations", {
	id: text("id").primaryKey(),
	targetId: text("target_id").notNull(),
	targetName: text("target_name").notNull(),
	type: text("type").notNull(), // 'short_rest' | 'weekly_metropolis' | 'lore' | 'cryptography' | 'great_enigma'
	tier: integer("tier").notNull(), // 1, 2, 3, 4
	dc: integer("dc").notNull(),
	successesRequired: integer("successes_required").notNull(), // 3, 6, 9
	successesAccumulated: integer("successes_accumulated").notNull().default(0),
	failuresMax: integer("failures_max").notNull(), // 1, 2, 3
	failuresAccumulated: integer("failures_accumulated").notNull().default(0),
	status: text("status").notNull().default("active"), // 'active' | 'completed_perfect' | 'completed_standard' | 'completed_poor' | 'failed'
	goldCostPerTest: integer("gold_cost_per_test").notNull().default(0),
	translatedPercent: integer("translated_percent").notNull().default(0),
	discoveredSecrets: text("discovered_secrets").notNull().default(""),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const investigationInsertSchema = createInsertSchema(
	campaignInvestigations,
).extend({
	id: notBlankText,
	targetId: notBlankText,
	targetName: notBlankText,
	type: z.enum([
		"short_rest",
		"weekly_metropolis",
		"lore",
		"cryptography",
		"great_enigma",
	]),
	tier: z.number().int().min(1).max(4),
	dc: z.number().int().min(1),
	successesRequired: z.number().int().min(1),
	successesAccumulated: z.number().int().min(0).default(0),
	failuresMax: z.number().int().min(1),
	failuresAccumulated: z.number().int().min(0).default(0),
	status: z.enum([
		"active",
		"completed_perfect",
		"completed_standard",
		"completed_poor",
		"failed",
	]),
	goldCostPerTest: z.number().int().min(0).default(0),
	translatedPercent: z.number().int().min(0).max(100).default(0),
	discoveredSecrets: z.string().default(""),
	createdAt: isoTimestamp,
	updatedAt: isoTimestamp,
});

export const investigationSelectSchema = createSelectSchema(
	campaignInvestigations,
).extend({
	id: notBlankText,
	targetId: notBlankText,
	targetName: notBlankText,
	type: z.enum([
		"short_rest",
		"weekly_metropolis",
		"lore",
		"cryptography",
		"great_enigma",
	]),
	tier: z.number().int().min(1).max(4),
	dc: z.number().int().min(1),
	successesRequired: z.number().int().min(1),
	successesAccumulated: z.number().int().min(0),
	failuresMax: z.number().int().min(1),
	failuresAccumulated: z.number().int().min(0),
	status: z.enum([
		"active",
		"completed_perfect",
		"completed_standard",
		"completed_poor",
		"failed",
	]),
	goldCostPerTest: z.number().int().min(0),
	translatedPercent: z.number().int().min(0).max(100),
	discoveredSecrets: z.string(),
	createdAt: isoTimestamp,
	updatedAt: isoTimestamp,
});

export type InvestigationRecord = z.infer<typeof investigationSelectSchema>;
export type NewInvestigationRecord = z.infer<typeof investigationInsertSchema>;
