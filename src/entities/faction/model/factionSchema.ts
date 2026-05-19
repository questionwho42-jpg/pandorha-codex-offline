import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);
const technicalId = notBlankText.regex(/^[a-z][a-z0-9-]*$/).max(80);
const visibleLabel = notBlankText.max(120);
const sourceFile = notBlankText.max(180);
const summaryText = notBlankText.max(1000);
const reputationLevel = z.number().int().min(0).max(5);
const nonNegativeCounter = z.number().int().min(0).max(999);

export const factionKindSchema = z.enum([
	"guild",
	"temple",
	"noble-house",
	"company",
]);

export const factionStandingStatusSchema = z.enum([
	"unpledged",
	"sponsored",
	"ultimatum",
	"hunted",
]);

export const factions = sqliteTable("factions", {
	id: text("id").primaryKey(),
	label: text("label").notNull(),
	kind: text("kind").notNull(),
	sourceFile: text("source_file").notNull(),
	summary: text("summary").notNull(),
});

export const factionStandings = sqliteTable("faction_standings", {
	factionId: text("faction_id").primaryKey(),
	fameLevel: integer("fame_level").notNull(),
	fameXp: integer("fame_xp").notNull(),
	infamyLevel: integer("infamy_level").notNull(),
	bloodDebt: integer("blood_debt").notNull(),
	favorPoints: integer("favor_points").notNull(),
	intriguePoints: integer("intrigue_points").notNull(),
	status: text("status").notNull(),
});

export const factionInsertSchema = createInsertSchema(factions).extend({
	id: technicalId,
	label: visibleLabel,
	kind: factionKindSchema,
	sourceFile,
	summary: summaryText,
});

export const factionSelectSchema = createSelectSchema(factions).extend({
	id: technicalId,
	label: visibleLabel,
	kind: factionKindSchema,
	sourceFile,
	summary: summaryText,
});

export const factionStandingInsertSchema = createInsertSchema(
	factionStandings,
).extend({
	factionId: technicalId,
	fameLevel: reputationLevel,
	fameXp: nonNegativeCounter,
	infamyLevel: reputationLevel,
	bloodDebt: nonNegativeCounter,
	favorPoints: nonNegativeCounter,
	intriguePoints: nonNegativeCounter,
	status: factionStandingStatusSchema,
});

export const factionStandingSelectSchema = createSelectSchema(
	factionStandings,
).extend({
	factionId: technicalId,
	fameLevel: reputationLevel,
	fameXp: nonNegativeCounter,
	infamyLevel: reputationLevel,
	bloodDebt: nonNegativeCounter,
	favorPoints: nonNegativeCounter,
	intriguePoints: nonNegativeCounter,
	status: factionStandingStatusSchema,
});

export const factionIdSchema = technicalId;

export type FactionRecord = z.infer<typeof factionSelectSchema>;
export type NewFactionRecord = z.infer<typeof factionInsertSchema>;
export type FactionId = z.infer<typeof factionIdSchema>;

export type FactionStandingRecord = z.infer<typeof factionStandingSelectSchema>;
export type NewFactionStandingRecord = z.infer<
	typeof factionStandingInsertSchema
>;
