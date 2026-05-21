import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const technicalId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(120);
const isoTimestamp = z.string().trim().datetime({ offset: true });
const nonNegativeCounter = z.number().int().min(0).max(999);
const positiveCounter = z.number().int().min(1).max(999);
const eventMessage = z.string().trim().min(1).max(240);

export const socialEncounterStatusSchema = z.enum([
	"active",
	"convinced",
	"walked-away",
]);

export const socialEncounterAttitudeSchema = z.enum([
	"friendly",
	"neutral",
	"skeptical",
	"hostile",
]);

export const socialEncounterEventTypeSchema = z.enum([
	"dialogue-option-selected",
	"social-encounter-started",
	"social-appeal-queued",
	"social-appeal-succeeded",
	"social-appeal-failed",
	"social-encounter-convinced",
	"social-encounter-walked-away",
]);

export const socialEncounters = sqliteTable("social_encounters", {
	id: text("id").primaryKey(),
	npcId: text("npc_id").notNull(),
	actorId: text("actor_id").notNull(),
	status: text("status").notNull(),
	attitude: text("attitude").notNull(),
	mentalHpCurrent: integer("mental_hp_current").notNull(),
	mentalHpMax: integer("mental_hp_max").notNull(),
	patienceCurrent: integer("patience_current").notNull(),
	patienceMax: integer("patience_max").notNull(),
	persuasionProgress: integer("persuasion_progress").notNull(),
	persuasionTarget: integer("persuasion_target").notNull(),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const socialEncounterEvents = sqliteTable("social_encounter_events", {
	id: text("id").primaryKey(),
	encounterId: text("encounter_id").notNull(),
	sequence: integer("sequence").notNull(),
	type: text("type").notNull(),
	message: text("message").notNull(),
	createdAt: text("created_at").notNull(),
	commandId: text("command_id"),
});

export const socialEncounterInsertSchema = createInsertSchema(
	socialEncounters,
).extend({
	id: technicalId,
	npcId: technicalId,
	actorId: technicalId,
	status: socialEncounterStatusSchema,
	attitude: socialEncounterAttitudeSchema,
	mentalHpCurrent: nonNegativeCounter,
	mentalHpMax: positiveCounter,
	patienceCurrent: nonNegativeCounter,
	patienceMax: positiveCounter,
	persuasionProgress: nonNegativeCounter,
	persuasionTarget: positiveCounter,
	createdAt: isoTimestamp,
	updatedAt: isoTimestamp,
});

export const socialEncounterSelectSchema = createSelectSchema(
	socialEncounters,
).extend({
	id: technicalId,
	npcId: technicalId,
	actorId: technicalId,
	status: socialEncounterStatusSchema,
	attitude: socialEncounterAttitudeSchema,
	mentalHpCurrent: nonNegativeCounter,
	mentalHpMax: positiveCounter,
	patienceCurrent: nonNegativeCounter,
	patienceMax: positiveCounter,
	persuasionProgress: nonNegativeCounter,
	persuasionTarget: positiveCounter,
	createdAt: isoTimestamp,
	updatedAt: isoTimestamp,
});

export const socialEncounterEventInsertSchema = createInsertSchema(
	socialEncounterEvents,
).extend({
	id: technicalId,
	encounterId: technicalId,
	sequence: nonNegativeCounter,
	type: socialEncounterEventTypeSchema,
	message: eventMessage,
	createdAt: isoTimestamp,
	commandId: technicalId.nullable(),
});

export const socialEncounterEventSelectSchema = createSelectSchema(
	socialEncounterEvents,
).extend({
	id: technicalId,
	encounterId: technicalId,
	sequence: nonNegativeCounter,
	type: socialEncounterEventTypeSchema,
	message: eventMessage,
	createdAt: isoTimestamp,
	commandId: technicalId.nullable(),
});

export const socialEncounterIdSchema = technicalId;

export type SocialEncounterRecord = z.infer<typeof socialEncounterSelectSchema>;
export type NewSocialEncounterRecord = z.infer<
	typeof socialEncounterInsertSchema
>;
export type SocialEncounterEventRecord = z.infer<
	typeof socialEncounterEventSelectSchema
>;
export type NewSocialEncounterEventRecord = z.infer<
	typeof socialEncounterEventInsertSchema
>;
export type SocialEncounterId = z.infer<typeof socialEncounterIdSchema>;
