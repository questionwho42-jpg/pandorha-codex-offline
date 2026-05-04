import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);
const ancestryId = notBlankText.regex(/^[a-z][a-z-]*$/).max(40);
const ancestryLabel = notBlankText.max(80);
const ancestryEpithet = notBlankText.max(120);
const ancestrySourceFile = notBlankText.max(160);
const ancestryRuleText = notBlankText.max(500);

export const ancestries = sqliteTable("ancestries", {
	id: text("id").primaryKey(),
	label: text("label").notNull(),
	epithet: text("epithet").notNull(),
	sourceFile: text("source_file").notNull(),
	initialBonus: text("initial_bonus").notNull(),
	primordialAbilityName: text("primordial_ability_name").notNull(),
	primordialAbilityDescription: text(
		"primordial_ability_description",
	).notNull(),
});

export const ancestryInsertSchema = createInsertSchema(ancestries).extend({
	id: ancestryId,
	label: ancestryLabel,
	epithet: ancestryEpithet,
	sourceFile: ancestrySourceFile,
	initialBonus: ancestryRuleText,
	primordialAbilityName: ancestryLabel,
	primordialAbilityDescription: ancestryRuleText,
});

export const ancestrySelectSchema = createSelectSchema(ancestries).extend({
	id: ancestryId,
	label: ancestryLabel,
	epithet: ancestryEpithet,
	sourceFile: ancestrySourceFile,
	initialBonus: ancestryRuleText,
	primordialAbilityName: ancestryLabel,
	primordialAbilityDescription: ancestryRuleText,
});

export const ancestryIdSchema = ancestrySelectSchema.shape.id;

export type AncestryRecord = z.infer<typeof ancestrySelectSchema>;
export type NewAncestryRecord = z.infer<typeof ancestryInsertSchema>;
export type AncestryId = z.infer<typeof ancestryIdSchema>;
