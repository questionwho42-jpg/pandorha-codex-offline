import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);
const isoTimestamp = z.string().trim().datetime({ offset: true });

// Schema do Zod para CampActivity
export const campActivitySchema = z.object({
	id: z.string().trim().min(1),
	name: z.string().trim().min(1),
	performerId: z.string().trim().min(1),
	matrix: z.enum(["Physical", "Mental", "Social"]),
	costCargas: z.number().int().min(0).optional(),
	difficulty: z.number().int().min(1),
});

export const campaignCampSessions = sqliteTable("campaign_camp_sessions", {
	id: text("id").primaryKey(),
	totalTime: integer("total_time").notNull(),
	sleepHours: integer("sleep_hours").notNull(),
	availableActions: integer("available_actions").notNull(),
	dangerCounter: integer("danger_counter").notNull().default(0),
	activeActivitiesJson: text("active_activities_json").notNull(), // Serialized array of CampActivity
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const campSessionInsertSchema = createInsertSchema(
	campaignCampSessions,
).extend({
	id: notBlankText,
	totalTime: z.number().int().min(1),
	sleepHours: z.number().int().min(0),
	availableActions: z.number().int().min(0),
	dangerCounter: z.number().int().min(0),
	activeActivitiesJson: z
		.string()
		.trim()
		.refine((val) => {
			try {
				const parsed: unknown = JSON.parse(val);
				return z.array(campActivitySchema).safeParse(parsed).success;
			} catch {
				return false;
			}
		}),
	createdAt: isoTimestamp,
	updatedAt: isoTimestamp,
});

export const campSessionSelectSchema = createSelectSchema(
	campaignCampSessions,
).extend({
	id: notBlankText,
	totalTime: z.number().int().min(1),
	sleepHours: z.number().int().min(0),
	availableActions: z.number().int().min(0),
	dangerCounter: z.number().int().min(0),
	activeActivitiesJson: z
		.string()
		.trim()
		.refine((val) => {
			try {
				const parsed: unknown = JSON.parse(val);
				return z.array(campActivitySchema).safeParse(parsed).success;
			} catch {
				return false;
			}
		}),
	createdAt: isoTimestamp,
	updatedAt: isoTimestamp,
});

export type CampSessionRecord = z.infer<typeof campSessionSelectSchema>;
export type NewCampSessionRecord = z.infer<typeof campSessionInsertSchema>;
