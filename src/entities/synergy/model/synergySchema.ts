import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);

export const campaignCohesion = sqliteTable("campaign_cohesion", {
	id: text("id").primaryKey(),
	cohesionLevel: integer("cohesion_level").notNull().default(1),
	cohesionPoints: integer("cohesion_points").notNull().default(1),
	activePlayers: integer("active_players").notNull().default(4),
	updatedAt: text("updated_at").notNull(),
});

export const registeredSignatures = sqliteTable("registered_signatures", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	openingTactId: text("opening_tact_id").notNull(),
	reinforceTactId: text("reinforce_tact_id"),
	detonationTactId: text("detonation_tact_id").notNull(),
	usageCount: integer("usage_count").notNull().default(0),
	updatedAt: text("updated_at").notNull(),
});

export const campaignCohesionInsertSchema = createInsertSchema(
	campaignCohesion,
).extend({
	id: notBlankText,
	cohesionLevel: z.number().int().min(1).max(4).default(1),
	cohesionPoints: z.number().int().min(0).default(1),
	activePlayers: z.number().int().min(1).default(4),
	updatedAt: notBlankText,
});

export const campaignCohesionSelectSchema = createSelectSchema(
	campaignCohesion,
).extend({
	id: notBlankText,
	cohesionLevel: z.number().int().min(1).max(4),
	cohesionPoints: z.number().int().min(0),
	activePlayers: z.number().int().min(1),
	updatedAt: notBlankText,
});

export const signatureInsertSchema = createInsertSchema(
	registeredSignatures,
).extend({
	id: notBlankText,
	name: z.string().trim().min(1).max(200),
	openingTactId: notBlankText,
	reinforceTactId: z.string().trim().nullable().optional(),
	detonationTactId: notBlankText,
	usageCount: z.number().int().min(0).default(0),
	updatedAt: notBlankText,
});

export const signatureSelectSchema = createSelectSchema(
	registeredSignatures,
).extend({
	id: notBlankText,
	name: notBlankText,
	openingTactId: notBlankText,
	reinforceTactId: z.string().trim().nullable().optional(),
	detonationTactId: notBlankText,
	usageCount: z.number().int().min(0),
	updatedAt: notBlankText,
});

export type CampaignCohesionRecord = z.infer<
	typeof campaignCohesionSelectSchema
>;
export type NewCampaignCohesionRecord = z.infer<
	typeof campaignCohesionInsertSchema
>;
export type RegisteredSignatureRecord = z.infer<typeof signatureSelectSchema>;
export type NewRegisteredSignatureRecord = z.infer<
	typeof signatureInsertSchema
>;
