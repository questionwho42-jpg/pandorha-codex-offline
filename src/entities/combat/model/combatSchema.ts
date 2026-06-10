import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);

export const combatEncounters = sqliteTable("combat_encounters", {
	id: text("id").primaryKey(),
	turn: integer("turn").notNull().default(1),
	round: integer("round").notNull().default(1),
	initiativeOrderJson: text("initiative_order_json").notNull().default("[]"), // Array of actor IDs
	status: text("status").notNull().default("active"), // 'active' | 'won' | 'escaped' | 'lost'
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const combatMonsters = sqliteTable("combat_monsters", {
	id: text("id").primaryKey(),
	combatEncounterId: text("combat_encounter_id")
		.notNull()
		.references(() => combatEncounters.id, { onDelete: "cascade" }),
	monsterId: text("monster_id").notNull(),
	name: text("name").notNull(),
	hpCurrent: integer("hp_current").notNull(),
	hpMax: integer("hp_max").notNull(),
	eeCurrent: integer("ee_current").notNull(),
	eeMax: integer("ee_max").notNull(),
	tacticalRole: text("tactical_role").notNull(), // 'bruto' | 'assassino' | 'suporte'
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const activeSessions = sqliteTable("active_sessions", {
	id: text("id").primaryKey(), // 'current' or slot-based
	combatEncounterId: text("combat_encounter_id").references(
		() => combatEncounters.id,
		{ onDelete: "set null" },
	),
	updatedAt: text("updated_at").notNull(),
});

// Zod Schemas
export const combatEncounterInsertSchema = createInsertSchema(
	combatEncounters,
).extend({
	id: notBlankText,
	turn: z.number().int().min(1),
	round: z.number().int().min(1),
	initiativeOrderJson: z.string().trim(),
	status: z.enum(["active", "won", "escaped", "lost"]),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export const combatEncounterSelectSchema = createSelectSchema(
	combatEncounters,
).extend({
	id: notBlankText,
	turn: z.number().int(),
	round: z.number().int(),
	initiativeOrderJson: z.string().trim(),
	status: z.enum(["active", "won", "escaped", "lost"]),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export const combatMonsterInsertSchema = createInsertSchema(
	combatMonsters,
).extend({
	id: notBlankText,
	combatEncounterId: notBlankText,
	monsterId: notBlankText,
	name: notBlankText,
	hpCurrent: z.number().int().min(0),
	hpMax: z.number().int().min(1),
	eeCurrent: z.number().int().min(0),
	eeMax: z.number().int().min(0),
	tacticalRole: z.enum(["bruto", "assassino", "suporte"]),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export const combatMonsterSelectSchema = createSelectSchema(
	combatMonsters,
).extend({
	id: notBlankText,
	combatEncounterId: notBlankText,
	monsterId: notBlankText,
	name: notBlankText,
	hpCurrent: z.number().int(),
	hpMax: z.number().int(),
	eeCurrent: z.number().int(),
	eeMax: z.number().int(),
	tacticalRole: z.enum(["bruto", "assassino", "suporte"]),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export const activeSessionInsertSchema = createInsertSchema(
	activeSessions,
).extend({
	id: notBlankText,
	combatEncounterId: z.string().trim().nullable().optional(),
	updatedAt: notBlankText,
});

export const activeSessionSelectSchema = createSelectSchema(
	activeSessions,
).extend({
	id: notBlankText,
	combatEncounterId: z.string().trim().nullable().optional(),
	updatedAt: notBlankText,
});

export type CombatEncounterRecord = z.infer<typeof combatEncounterSelectSchema>;
export type NewCombatEncounterRecord = z.infer<
	typeof combatEncounterInsertSchema
>;

export type CombatMonsterRecord = z.infer<typeof combatMonsterSelectSchema>;
export type NewCombatMonsterRecord = z.infer<typeof combatMonsterInsertSchema>;

export type ActiveSessionRecord = z.infer<typeof activeSessionSelectSchema>;
export type NewActiveSessionRecord = z.infer<typeof activeSessionInsertSchema>;
