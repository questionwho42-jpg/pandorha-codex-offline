import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);
const ancestryId = notBlankText.regex(/^[a-z][a-z-]*$/).max(40);
const ancestryLabel = notBlankText.max(80);
const ancestryEpithet = notBlankText.max(120);
const ancestrySourceFile = notBlankText.max(160);
const ancestryRuleText = notBlankText.max(500);
const ancestryTraitId = notBlankText.regex(/^[a-z][a-z0-9-]*$/).max(80);
const ancestryTraitDescription = notBlankText.max(700);

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

export const ancestryTraits = sqliteTable("ancestry_traits", {
	id: text("id").primaryKey(),
	label: text("label").notNull(),
	description: text("description").notNull(),
	sourceFile: text("source_file").notNull(),
});

export const ancestryTraitLinks = sqliteTable("ancestry_trait_links", {
	ancestryId: text("ancestry_id").notNull(),
	traitId: text("trait_id").notNull(),
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

export const ancestryTraitInsertSchema = createInsertSchema(
	ancestryTraits,
).extend({
	id: ancestryTraitId,
	label: ancestryLabel,
	description: ancestryTraitDescription,
	sourceFile: ancestrySourceFile,
});

export const ancestryTraitSelectSchema = createSelectSchema(
	ancestryTraits,
).extend({
	id: ancestryTraitId,
	label: ancestryLabel,
	description: ancestryTraitDescription,
	sourceFile: ancestrySourceFile,
});

export const ancestryTraitLinkInsertSchema = createInsertSchema(
	ancestryTraitLinks,
).extend({
	ancestryId,
	traitId: ancestryTraitId,
});

export const ancestryTraitLinkSelectSchema = createSelectSchema(
	ancestryTraitLinks,
).extend({
	ancestryId,
	traitId: ancestryTraitId,
});

export const ancestryTraitIdSchema = ancestryTraitSelectSchema.shape.id;

export const ancestryTraitChoiceInputSchema = z.object({
	ancestryId: ancestryIdSchema,
	traitIds: z.array(ancestryTraitIdSchema).length(3),
});

export type AncestryRecord = z.infer<typeof ancestrySelectSchema>;
export type NewAncestryRecord = z.infer<typeof ancestryInsertSchema>;
export type AncestryId = z.infer<typeof ancestryIdSchema>;
export type AncestryTraitRecord = z.infer<typeof ancestryTraitSelectSchema>;
export type NewAncestryTraitRecord = z.infer<typeof ancestryTraitInsertSchema>;
export type AncestryTraitLinkRecord = z.infer<
	typeof ancestryTraitLinkSelectSchema
>;
export type NewAncestryTraitLinkRecord = z.infer<
	typeof ancestryTraitLinkInsertSchema
>;
export type AncestryTraitId = z.infer<typeof ancestryTraitIdSchema>;
export type AncestryTraitChoiceInput = z.infer<
	typeof ancestryTraitChoiceInputSchema
>;
