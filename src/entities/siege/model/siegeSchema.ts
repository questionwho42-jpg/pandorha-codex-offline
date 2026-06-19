import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { bastions } from "../../bastion/model/bastionSchema";
import { factions } from "../../social/model/socialSchema";

export const siegeStatusEnum = z.enum(["active", "resolved"]);

export const campaignSiegeEvents = sqliteTable("campaign_siege_events", {
	id: text("id").primaryKey(),
	campaignId: text("campaign_id").notNull(),
	bastionId: text("bastion_id")
		.notNull()
		.references(() => bastions.id, { onDelete: "cascade" }),
	factionId: text("faction_id")
		.notNull()
		.references(() => factions.id, { onDelete: "cascade" }),
	status: text("status").notNull().default("active"), // 'active' | 'resolved'
	dangerLevel: integer("danger_level").notNull().default(1),
	damagePoints: integer("damage_points").notNull().default(0),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

// Zod Schemas
export const siegeEventInsertSchema = createInsertSchema(
	campaignSiegeEvents,
).extend({
	id: z.string().uuid("ID inválido para o evento de cerco"),
	campaignId: z.string().min(1, "O ID da campanha é obrigatório"),
	bastionId: z.string().min(1, "O ID do Bastião é obrigatório"),
	factionId: z.string().min(1, "O ID da facção é obrigatório"),
	status: siegeStatusEnum,
	dangerLevel: z.number().int().min(1).max(5),
	damagePoints: z.number().int().min(0),
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

export const siegeEventSelectSchema = createSelectSchema(
	campaignSiegeEvents,
).extend({
	id: z.string().uuid(),
	campaignId: z.string().min(1),
	bastionId: z.string().min(1),
	factionId: z.string().min(1),
	status: siegeStatusEnum,
	dangerLevel: z.number().int(),
	damagePoints: z.number().int(),
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

export type SiegeStatus = z.infer<typeof siegeStatusEnum>;

export type SiegeEventRecord = z.infer<typeof siegeEventSelectSchema>;
export type NewSiegeEventRecord = z.infer<typeof siegeEventInsertSchema>;
