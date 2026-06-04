import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { factions } from "../../social/model/socialSchema";
import { worldTile } from "../../world-tile/model/worldTileSchema";

export const loreEncounters = sqliteTable("lore_encounters", {
	id: text("id").primaryKey(),
	tileId: text("tile_id")
		.notNull()
		.references(() => worldTile.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	content: text("content").notNull(),
	factionIdRequired: text("faction_id_required").references(() => factions.id, {
		onDelete: "set null",
	}),
	reputationRequired: integer("reputation_required").default(0),
	requiredClockId: text("required_clock_id"),
	requiredClockValue: integer("required_clock_value").default(0),
	isTriggered: integer("is_triggered", { mode: "boolean" })
		.notNull()
		.default(false),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const campaignRumors = sqliteTable("campaign_rumors", {
	id: text("id").primaryKey(),
	tileId: text("tile_id")
		.notNull()
		.references(() => worldTile.id, { onDelete: "cascade" }),
	factionId: text("faction_id").references(() => factions.id, {
		onDelete: "set null",
	}),
	title: text("title").notNull(),
	content: text("content").notNull(),
	isDiscovered: integer("is_discovered", { mode: "boolean" })
		.notNull()
		.default(false),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

// Zod Schemas
export const loreEncounterInsertSchema = createInsertSchema(
	loreEncounters,
).extend({
	id: z
		.string()
		.trim()
		.regex(/^[a-z][a-z0-9-]*$/)
		.max(80),
	tileId: z.string().min(1),
	title: z.string().trim().min(1).max(120),
	content: z.string().trim().min(1).max(2000),
	factionIdRequired: z.string().nullable().optional(),
	reputationRequired: z.number().int().optional(),
	requiredClockId: z.string().nullable().optional(),
	requiredClockValue: z.number().int().optional(),
	isTriggered: z.boolean(),
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

export const loreEncounterSelectSchema = createSelectSchema(
	loreEncounters,
).extend({
	id: z.string().trim(),
	tileId: z.string().min(1),
	title: z.string().trim(),
	content: z.string().trim(),
	factionIdRequired: z.string().nullable(),
	reputationRequired: z.number().int().nullable(),
	requiredClockId: z.string().nullable(),
	requiredClockValue: z.number().int().nullable(),
	isTriggered: z.boolean(),
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

export const campaignRumorInsertSchema = createInsertSchema(
	campaignRumors,
).extend({
	id: z
		.string()
		.trim()
		.regex(/^[a-z][a-z0-9-]*$/)
		.max(80),
	tileId: z.string().min(1),
	factionId: z.string().nullable().optional(),
	title: z.string().trim().min(1).max(120),
	content: z.string().trim().min(1).max(2000),
	isDiscovered: z.boolean(),
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

export const campaignRumorSelectSchema = createSelectSchema(
	campaignRumors,
).extend({
	id: z.string().trim(),
	tileId: z.string().min(1),
	factionId: z.string().nullable(),
	title: z.string().trim(),
	content: z.string().trim(),
	isDiscovered: z.boolean(),
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

export type LoreEncounterRecord = z.infer<typeof loreEncounterSelectSchema>;
export type NewLoreEncounterRecord = z.infer<typeof loreEncounterInsertSchema>;
export type CampaignRumorRecord = z.infer<typeof campaignRumorSelectSchema>;
export type NewCampaignRumorRecord = z.infer<typeof campaignRumorInsertSchema>;
