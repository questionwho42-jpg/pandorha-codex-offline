import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { characters } from "../../character/model/characterSchema";

export const companionTypeSchema = z.enum([
	"aggressor",
	"protector",
	"scout",
	"familiar",
]);

export const summonCompanions = sqliteTable("summon_companions", {
	id: text("id").primaryKey(),
	characterId: text("character_id")
		.notNull()
		.references(() => characters.id),
	name: text("name").notNull(),
	type: text("type").notNull(), // 'aggressor' | 'protector' | 'scout' | 'familiar'
	subModel: text("sub_model").notNull(), // ex: "Lobo" ou "Besta Espiritual"
	tier: integer("tier").notNull().default(1),
	hpCurrent: integer("hp_current").notNull(),
	hpMax: integer("hp_max").notNull(),
	isShareSensory: integer("is_share_sensory", { mode: "boolean" })
		.notNull()
		.default(false),
	isDissipated: integer("is_dissipated", { mode: "boolean" })
		.notNull()
		.default(false),
	selectedTraitsJson: text("selected_traits_json").notNull().default("[]"), // Array de strings (Traços ou Truques ativos)
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const companionInsertSchema = createInsertSchema(
	summonCompanions,
).extend({
	type: companionTypeSchema,
	tier: z.number().int().min(1).max(4),
	hpCurrent: z.number().int().min(0),
	hpMax: z.number().int().min(1),
	isShareSensory: z.boolean().default(false),
	isDissipated: z.boolean().default(false),
	selectedTraitsJson: z.string().default("[]"),
});

export const companionSelectSchema = createSelectSchema(
	summonCompanions,
).extend({
	type: companionTypeSchema,
	tier: z.number().int(),
	hpCurrent: z.number().int(),
	hpMax: z.number().int(),
	isShareSensory: z.boolean(),
	isDissipated: z.boolean(),
	selectedTraitsJson: z.string(),
});

export type CompanionType = z.infer<typeof companionTypeSchema>;
export type CompanionRecord = z.infer<typeof companionSelectSchema>;
export type NewCompanionRecord = z.infer<typeof companionInsertSchema>;
