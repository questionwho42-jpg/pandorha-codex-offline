import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);
const backgroundId = notBlankText.regex(/^[a-z][a-z-]*$/).max(60);
const backgroundLabel = notBlankText.max(100);
const backgroundEpithet = notBlankText.max(120);
const backgroundSourceFile = notBlankText.max(180);
const backgroundRuleText = notBlankText.max(1000);
const backgroundChoiceCount = z.number().int().min(0).max(10);

export const backgrounds = sqliteTable("backgrounds", {
	id: text("id").primaryKey(),
	label: text("label").notNull(),
	epithet: text("epithet").notNull(),
	sourceFile: text("source_file").notNull(),
	originAbilityName: text("origin_ability_name").notNull(),
	originAbilityDescription: text("origin_ability_description").notNull(),
	talentChoiceCount: integer("talent_choice_count").notNull(),
	talentOptionsText: text("talent_options_text").notNull(),
});

export const backgroundInsertSchema = createInsertSchema(backgrounds).extend({
	id: backgroundId,
	label: backgroundLabel,
	epithet: backgroundEpithet,
	sourceFile: backgroundSourceFile,
	originAbilityName: backgroundLabel,
	originAbilityDescription: backgroundRuleText,
	talentChoiceCount: backgroundChoiceCount,
	talentOptionsText: backgroundRuleText,
});

export const backgroundSelectSchema = createSelectSchema(backgrounds).extend({
	id: backgroundId,
	label: backgroundLabel,
	epithet: backgroundEpithet,
	sourceFile: backgroundSourceFile,
	originAbilityName: backgroundLabel,
	originAbilityDescription: backgroundRuleText,
	talentChoiceCount: backgroundChoiceCount,
	talentOptionsText: backgroundRuleText,
});

export const backgroundIdSchema = backgroundSelectSchema.shape.id;

export type BackgroundRecord = z.infer<typeof backgroundSelectSchema>;
export type NewBackgroundRecord = z.infer<typeof backgroundInsertSchema>;
export type BackgroundId = z.infer<typeof backgroundIdSchema>;
