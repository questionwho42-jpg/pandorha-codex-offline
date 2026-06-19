import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const campaignEventsHistory = sqliteTable("campaign_events_history", {
	id: text("id").primaryKey(),
	campaignId: text("campaign_id").notNull(),
	eventType: text("event_type").notNull(), // 'siege_start' | 'siege_resolve' | 'clock_advance' | 'ambience_change' | 'weather_shift' | 'faction_pact'
	description: text("description").notNull(),
	createdAt: text("created_at").notNull(),
});

// Zod schemas
export const campaignEventInsertSchema = createInsertSchema(
	campaignEventsHistory,
).extend({
	id: z.string().uuid("ID de evento de campanha inválido"),
	campaignId: z.string().min(1, "O ID da campanha é obrigatório"),
	eventType: z.string().min(1, "O tipo do evento é obrigatório"),
	description: z.string().min(1, "A descrição do evento é obrigatória"),
	createdAt: z.string().min(1),
});

export const campaignEventSelectSchema = createSelectSchema(
	campaignEventsHistory,
).extend({
	id: z.string().uuid(),
	campaignId: z.string().min(1),
	eventType: z.string().min(1),
	description: z.string().min(1),
	createdAt: z.string().min(1),
});

export type CampaignEventRecord = z.infer<typeof campaignEventSelectSchema>;
export type NewCampaignEventRecord = z.infer<typeof campaignEventInsertSchema>;
