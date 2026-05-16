import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const isoTimestamp = z.string().trim().datetime({ offset: true });
const technicalId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(120);
const currentHour = z.number().int().min(1).max(24);
const danger = z.number().int().min(0).max(999);

export const campSessionStatusSchema = z.enum(["planning", "resolved"]);

export const campSessions = sqliteTable("camp_sessions", {
	id: text("id").primaryKey(),
	currentHour: integer("current_hour").notNull(),
	danger: integer("danger").notNull(),
	status: text("status").notNull(),
	fortifyClockId: text("fortify_clock_id"),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const campAssignments = sqliteTable("camp_assignments", {
	id: text("id").primaryKey(),
	sessionId: text("session_id").notNull(),
	characterId: text("character_id").notNull(),
	activityId: text("activity_id").notNull(),
	hour: integer("hour").notNull(),
	createdAt: text("created_at").notNull(),
});

export const campSessionInsertSchema = createInsertSchema(campSessions).extend({
	id: technicalId,
	currentHour,
	danger,
	status: campSessionStatusSchema,
	fortifyClockId: technicalId.nullable(),
	createdAt: isoTimestamp,
	updatedAt: isoTimestamp,
});

export const campSessionSelectSchema = createSelectSchema(campSessions).extend({
	id: technicalId,
	currentHour,
	danger,
	status: campSessionStatusSchema,
	fortifyClockId: technicalId.nullable(),
	createdAt: isoTimestamp,
	updatedAt: isoTimestamp,
});

export const campAssignmentInsertSchema = createInsertSchema(
	campAssignments,
).extend({
	id: technicalId,
	sessionId: technicalId,
	characterId: technicalId,
	activityId: technicalId,
	hour: currentHour,
	createdAt: isoTimestamp,
});

export const campAssignmentSelectSchema = createSelectSchema(
	campAssignments,
).extend({
	id: technicalId,
	sessionId: technicalId,
	characterId: technicalId,
	activityId: technicalId,
	hour: currentHour,
	createdAt: isoTimestamp,
});

export type CampSessionRecord = z.infer<typeof campSessionSelectSchema>;
export type NewCampSessionRecord = z.infer<typeof campSessionInsertSchema>;
export type CampAssignmentRecord = z.infer<typeof campAssignmentSelectSchema>;
export type NewCampAssignmentRecord = z.infer<
	typeof campAssignmentInsertSchema
>;
