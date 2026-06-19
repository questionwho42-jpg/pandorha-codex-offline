import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod/v4";
import { characters } from "$lib/entities/character";

export const campaignRecess = sqliteTable("campaign_recess", {
	id: text("id").primaryKey(), // ex: "campaign_default"
	recessDays: integer("recess_days").notNull().default(7),
	currentDateDays: integer("current_date_days").notNull().default(0),
});

export const downtimeActionLogs = sqliteTable("downtime_action_logs", {
	id: text("id").primaryKey(),
	characterId: text("character_id")
		.notNull()
		.references(() => characters.id, { onDelete: "cascade" }),
	weekIndex: integer("week_index").notNull(),
	actionTag: text("action_tag").notNull(),
	rollResult: integer("roll_result"),
	outcomeDetails: text("outcome_details").notNull(),
	createdAt: text("created_at").notNull(),
});

// Zod Schemas
export const campaignRecessInsertSchema = createInsertSchema(campaignRecess);
export const campaignRecessSelectSchema = createSelectSchema(campaignRecess);

export const downtimeActionLogsInsertSchema =
	createInsertSchema(downtimeActionLogs);
export const downtimeActionLogsSelectSchema =
	createSelectSchema(downtimeActionLogs);

export type CampaignRecessRecord = z.infer<typeof campaignRecessSelectSchema>;
export type NewCampaignRecessRecord = z.infer<
	typeof campaignRecessInsertSchema
>;

export type DowntimeActionLogRecord = z.infer<
	typeof downtimeActionLogsSelectSchema
>;
export type NewDowntimeActionLogRecord = z.infer<
	typeof downtimeActionLogsInsertSchema
>;
