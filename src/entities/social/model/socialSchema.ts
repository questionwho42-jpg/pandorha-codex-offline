import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod/v4";
import { characters } from "../../character/model/characterSchema";

export const factions = sqliteTable("factions", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	alignment: text("alignment").notNull(), // ex: "order", "chaos", "neutral"
});

export const characterReputation = sqliteTable("character_reputation", {
	id: text("id").primaryKey(),
	characterId: text("character_id")
		.notNull()
		.references(() => characters.id),
	factionId: text("faction_id")
		.notNull()
		.references(() => factions.id),
	value: integer("reputation_value").notNull().default(0), // Fama positiva, Infâmia negativa
	updatedAt: text("updated_at").notNull(),
});

export const bloodDebts = sqliteTable("blood_debts", {
	id: text("id").primaryKey(),
	characterId: text("character_id")
		.notNull()
		.references(() => characters.id),
	targetName: text("target_name").notNull(), // Nome do NPC ou grupo
	debtValue: integer("debt_value").notNull().default(1),
	isPaid: integer("is_paid", { mode: "boolean" }).notNull().default(false),
	createdAt: text("created_at").notNull(),
});

// Zod Schemas
export const factionInsertSchema = createInsertSchema(factions);
export const factionSelectSchema = createSelectSchema(factions);

export const reputationInsertSchema = createInsertSchema(characterReputation);
export const reputationSelectSchema = createSelectSchema(characterReputation);

export const bloodDebtInsertSchema = createInsertSchema(bloodDebts);
export const bloodDebtSelectSchema = createSelectSchema(bloodDebts);

export type FactionRecord = z.infer<typeof factionSelectSchema>;
export type ReputationRecord = z.infer<typeof reputationSelectSchema>;
export type BloodDebtRecord = z.infer<typeof bloodDebtSelectSchema>;
