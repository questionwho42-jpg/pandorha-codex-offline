import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);
const characterClassId = notBlankText.regex(/^[a-z][a-z-]*$/).max(40);
const characterClassLabel = notBlankText.max(80);
const characterClassEpithet = notBlankText.max(120);
const characterClassSourceFile = notBlankText.max(160);
const characterClassRuleText = notBlankText.max(900);
const characterClassBaseHp = z.number().int().min(1).max(30);
const characterClassChoiceCount = z.number().int().min(0).max(10);

export const characterClasses = sqliteTable("character_classes", {
	id: text("id").primaryKey(),
	label: text("label").notNull(),
	epithet: text("epithet").notNull(),
	sourceFile: text("source_file").notNull(),
	primaryAttributesText: text("primary_attributes_text").notNull(),
	baseHp: integer("base_hp").notNull(),
	resourceText: text("resource_text").notNull(),
	equipmentText: text("equipment_text").notNull(),
	passiveAbilityName: text("passive_ability_name").notNull(),
	passiveAbilityDescription: text("passive_ability_description").notNull(),
	initialTalentChoiceCount: integer("initial_talent_choice_count").notNull(),
	initialTalentOptionsText: text("initial_talent_options_text").notNull(),
});

export const characterClassInsertSchema = createInsertSchema(
	characterClasses,
).extend({
	id: characterClassId,
	label: characterClassLabel,
	epithet: characterClassEpithet,
	sourceFile: characterClassSourceFile,
	primaryAttributesText: characterClassRuleText,
	baseHp: characterClassBaseHp,
	resourceText: characterClassRuleText,
	equipmentText: characterClassRuleText,
	passiveAbilityName: characterClassLabel,
	passiveAbilityDescription: characterClassRuleText,
	initialTalentChoiceCount: characterClassChoiceCount,
	initialTalentOptionsText: characterClassRuleText,
});

export const characterClassSelectSchema = createSelectSchema(
	characterClasses,
).extend({
	id: characterClassId,
	label: characterClassLabel,
	epithet: characterClassEpithet,
	sourceFile: characterClassSourceFile,
	primaryAttributesText: characterClassRuleText,
	baseHp: characterClassBaseHp,
	resourceText: characterClassRuleText,
	equipmentText: characterClassRuleText,
	passiveAbilityName: characterClassLabel,
	passiveAbilityDescription: characterClassRuleText,
	initialTalentChoiceCount: characterClassChoiceCount,
	initialTalentOptionsText: characterClassRuleText,
});

export const characterClassIdSchema = characterClassSelectSchema.shape.id;

export type CharacterClassRecord = z.infer<typeof characterClassSelectSchema>;
export type NewCharacterClassRecord = z.infer<
	typeof characterClassInsertSchema
>;
export type CharacterClassId = z.infer<typeof characterClassIdSchema>;
