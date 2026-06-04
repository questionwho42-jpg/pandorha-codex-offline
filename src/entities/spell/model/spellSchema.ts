import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const MIN_SPELL_CIRCLE = 0;
const MAX_SPELL_CIRCLE = 10;

const catalogId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);
const visibleLabel = z.string().trim().min(1).max(120);
const sourceFile = z.string().trim().min(1).max(180);
const ruleText = z.string().trim().min(1).max(1000);
const optionalRuleText = z.string().trim().min(1).max(500).nullable();
const technicalSlug = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);

export const spellComponentSchema = z.enum(["V", "S", "M"]);
export const spellCastingKindSchema = z.enum([
	"instant",
	"ritual",
	"concentration",
]);
export const spellSchoolSchema = z.enum([
	"conjuration",
	"divination",
	"evocation",
	"transmutation",
]);
export const spellCircleSchema = z
	.number()
	.int()
	.min(MIN_SPELL_CIRCLE)
	.max(MAX_SPELL_CIRCLE);

export type SpellComponent = z.infer<typeof spellComponentSchema>;
export type SpellCastingKind = z.infer<typeof spellCastingKindSchema>;
export type SpellSchool = z.infer<typeof spellSchoolSchema>;

export const upcastFormulaSchema = z.object({
	etherCostPerCircle: z.number().int().min(0),
	durationIncreasePerCircle: z.number().int().min(0),
});

export type UpcastFormula = z.infer<typeof upcastFormulaSchema>;

export const spell = sqliteTable("spells", {
	id: text("id").primaryKey(),
	label: text("label").notNull(),
	circle: integer("circle").notNull(),
	etherCost: integer("ether_cost").notNull(),
	school: text("school").notNull(),
	castingKind: text("casting_kind").notNull(),
	components: text("components", { mode: "json" })
		.$type<SpellComponent[]>()
		.notNull(),
	requiresAttackRoll: integer("requires_attack_roll", {
		mode: "boolean",
	}).notNull(),
	requiresSavingThrow: integer("requires_saving_throw", {
		mode: "boolean",
	}).notNull(),
	damageText: text("damage_text"),
	tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
	sourceFile: text("source_file").notNull(),
	summary: text("summary").notNull(),
	targetEffects: text("target_effects", { mode: "json" })
		.$type<string[]>()
		.notNull(),
	baseDuration: integer("base_duration").notNull(),
	upcastFormula: text("upcast_formula", { mode: "json" })
		.$type<UpcastFormula>()
		.notNull(),
});

export const spellInsertSchema = createInsertSchema(spell).extend({
	id: catalogId,
	label: visibleLabel,
	circle: spellCircleSchema,
	etherCost: z.number().int().min(0),
	school: spellSchoolSchema,
	castingKind: spellCastingKindSchema,
	components: z.array(spellComponentSchema).min(1).max(3),
	requiresAttackRoll: z.boolean(),
	requiresSavingThrow: z.boolean(),
	damageText: optionalRuleText,
	tags: z.array(technicalSlug).min(1).max(20),
	sourceFile,
	summary: ruleText,
	targetEffects: z.array(z.string()),
	baseDuration: z.number().int().min(0),
	upcastFormula: upcastFormulaSchema,
});

export const spellSelectSchema = createSelectSchema(spell).extend({
	id: catalogId,
	label: visibleLabel,
	circle: spellCircleSchema,
	etherCost: z.number().int().min(0),
	school: spellSchoolSchema,
	castingKind: spellCastingKindSchema,
	components: z.array(spellComponentSchema).min(1).max(3),
	requiresAttackRoll: z.boolean(),
	requiresSavingThrow: z.boolean(),
	damageText: optionalRuleText,
	tags: z.array(technicalSlug).min(1).max(20),
	sourceFile,
	summary: ruleText,
	targetEffects: z.array(z.string()),
	baseDuration: z.number().int().min(0),
	upcastFormula: upcastFormulaSchema,
});

export const spellIdSchema = catalogId;

export type SpellId = z.infer<typeof spellIdSchema>;
export type SpellCircle = z.infer<typeof spellCircleSchema>;
export type NewSpellRecord = z.infer<typeof spellInsertSchema>;
export type SpellRecord = z.infer<typeof spellSelectSchema>;
