import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { summonCompanions } from "../../companions/model/companionSchema";
import { factions } from "../../social/model/socialSchema";

export const specializedAxisEnum = z.enum(["physical", "mental", "social"]);
export const methodOfControlEnum = z.enum([
	"social_indoctrination",
	"ether_pact",
	"blind_cells",
]);

export const espionageCells = sqliteTable("espionage_cells", {
	id: text("id").primaryKey(),
	campaignId: text("campaign_id").notNull(),
	factionId: text("faction_id")
		.notNull()
		.references(() => factions.id, { onDelete: "cascade" }),
	regionId: text("region_id").notNull(),
	tenenteCompanionId: text("tenente_companion_id")
		.notNull()
		.references(() => summonCompanions.id),
	specializedAxis: text("specialized_axis").notNull(), // 'physical' | 'mental' | 'social'
	tier: integer("tier").notNull().default(1), // 1 a 4
	isLockdown: integer("is_lockdown", { mode: "boolean" })
		.notNull()
		.default(false),
	lockdownWeeksRemaining: integer("lockdown_weeks_remaining")
		.notNull()
		.default(0),
	vigilanceHeat: integer("vigilance_heat").notNull().default(0), // 0 a 3
	methodOfControl: text("method_of_control"), // 'social_indoctrination' | 'ether_pact' | 'blind_cells' | null
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

// Zod validation schemas
export const espionageCellInsertSchema = createInsertSchema(
	espionageCells,
).extend({
	id: z.string().uuid("ID inválido para a célula de espionagem"),
	campaignId: z.string().min(1, "O ID da campanha é obrigatório"),
	factionId: z.string().min(1, "O ID da facção é obrigatório"),
	regionId: z.string().min(1, "O ID da região é obrigatório"),
	tenenteCompanionId: z.string().min(1, "O ID do tenente é obrigatório"),
	specializedAxis: specializedAxisEnum,
	tier: z.number().int().min(1).max(4, "O tier da célula deve ser entre 1 e 4"),
	isLockdown: z.boolean().default(false),
	lockdownWeeksRemaining: z.number().int().min(0),
	vigilanceHeat: z
		.number()
		.int()
		.min(0)
		.max(3, "O nível de vigilância (heat) deve ser entre 0 e 3"),
	methodOfControl: methodOfControlEnum.nullable().optional(),
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

export const espionageCellSelectSchema = createSelectSchema(
	espionageCells,
).extend({
	id: z.string().uuid("ID inválido para a célula de espionagem"),
	campaignId: z.string().min(1),
	factionId: z.string().min(1),
	regionId: z.string().min(1),
	tenenteCompanionId: z.string().min(1),
	specializedAxis: specializedAxisEnum,
	tier: z.number().int().min(1).max(4),
	isLockdown: z.boolean(),
	lockdownWeeksRemaining: z.number().int().min(0),
	vigilanceHeat: z.number().int().min(0).max(3),
	methodOfControl: methodOfControlEnum.nullable().optional(),
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

export type SpecializedAxis = z.infer<typeof specializedAxisEnum>;
export type MethodOfControl = z.infer<typeof methodOfControlEnum>;
export type EspionageCellRecord = z.infer<typeof espionageCellSelectSchema>;
export type NewEspionageCellRecord = z.infer<typeof espionageCellInsertSchema>;
