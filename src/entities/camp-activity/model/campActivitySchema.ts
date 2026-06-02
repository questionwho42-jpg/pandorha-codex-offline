import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const catalogId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);
const visibleLabel = z.string().trim().min(1).max(120);
const sourceFile = z.string().trim().min(1).max(180);
const ruleText = z.string().trim().min(1).max(1000);

export const campActivities = sqliteTable("camp_activities", {
	id: text("id").primaryKey(),
	label: text("label").notNull(),
	summary: text("summary").notNull(),
	sourceFile: text("source_file").notNull(),
	isCollective: integer("is_collective", { mode: "boolean" }).notNull(),
	createsClock: integer("creates_clock", { mode: "boolean" }).notNull(),
});

export const campActivityInsertSchema = createInsertSchema(
	campActivities,
).extend({
	id: catalogId,
	label: visibleLabel,
	summary: ruleText,
	sourceFile,
	isCollective: z.boolean(),
	createsClock: z.boolean(),
});

export const campActivitySelectSchema = createSelectSchema(
	campActivities,
).extend({
	id: catalogId,
	label: visibleLabel,
	summary: ruleText,
	sourceFile,
	isCollective: z.boolean(),
	createsClock: z.boolean(),
});

export const campActivityIdSchema = catalogId;

export type CampActivityRecord = z.infer<typeof campActivitySelectSchema>;
export type NewCampActivityRecord = z.infer<typeof campActivityInsertSchema>;
export type CampActivityId = z.infer<typeof campActivityIdSchema>;
