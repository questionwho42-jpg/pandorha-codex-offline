import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);
const isoTimestamp = z.string().trim().datetime({ offset: true });

export const campaignRegionalDomains = sqliteTable(
	"campaign_regional_domains",
	{
		id: text("id").primaryKey(),
		tier: integer("tier").notNull(), // 1, 2, 3, 4
		physicalLevel: integer("physical_level").notNull().default(0), // 0 to 5
		mentalLevel: integer("mental_level").notNull().default(0), // 0 to 5
		socialLevel: integer("social_level").notNull().default(0), // 0 to 5
		regentId: text("regent_id"), // Nullable NPC regente
		weeksAway: integer("weeks_away").notNull().default(0), // Semanas fora acumuladas
		createdAt: text("created_at").notNull(),
		updatedAt: text("updated_at").notNull(),
	},
);

export const regionalDomainInsertSchema = createInsertSchema(
	campaignRegionalDomains,
).extend({
	id: notBlankText,
	tier: z.number().int().min(1).max(4),
	physicalLevel: z.number().int().min(0).max(5),
	mentalLevel: z.number().int().min(0).max(5),
	socialLevel: z.number().int().min(0).max(5),
	regentId: z.string().trim().nullable(),
	weeksAway: z.number().int().min(0),
	createdAt: isoTimestamp,
	updatedAt: isoTimestamp,
});

export const regionalDomainSelectSchema = createSelectSchema(
	campaignRegionalDomains,
).extend({
	id: notBlankText,
	tier: z.number().int().min(1).max(4),
	physicalLevel: z.number().int().min(0).max(5),
	mentalLevel: z.number().int().min(0).max(5),
	socialLevel: z.number().int().min(0).max(5),
	regentId: z.string().trim().nullable(),
	weeksAway: z.number().int().min(0),
	createdAt: isoTimestamp,
	updatedAt: isoTimestamp,
});

export type RegionalDomainRecord = z.infer<typeof regionalDomainSelectSchema>;
export type NewRegionalDomainRecord = z.infer<
	typeof regionalDomainInsertSchema
>;
