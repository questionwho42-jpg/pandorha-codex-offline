import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);

export const bastions = sqliteTable("bastions", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	chassisId: text("chassis_id").notNull(), // 'fortaleza_pedra', 'taverna_guilda', 'galeao', 'torre_arcana', etc.
	tier: integer("tier").notNull().default(0),
	structure: integer("structure").notNull(),
	vigilance: integer("vigilance").notNull(),
	logistics: integer("logistics").notNull(),
	integrityCurrent: integer("integrity_current").notNull(),
	threatCurrent: integer("threat_current").notNull().default(0),
	vaultGold: integer("vault_gold").notNull().default(0),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const bastionModules = sqliteTable("bastion_modules", {
	id: text("id").primaryKey(),
	bastionId: text("bastion_id")
		.notNull()
		.references(() => bastions.id, { onDelete: "cascade" }),
	moduleId: text("module_id").notNull(), // 'horta_alquimia', 'ferraria_reparo', 'dormitorio_comum', etc.
	tier: integer("tier").notNull(), // 1 a 4
	progressCurrent: integer("progress_current").notNull().default(0),
	progressMax: integer("progress_max").notNull(), // barra de obra
	isBroken: integer("is_broken", { mode: "boolean" }).notNull().default(false),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const bastionInsertSchema = createInsertSchema(bastions).extend({
	id: notBlankText,
	name: z.string().trim().min(1).max(100),
	chassisId: z.enum([
		"fortaleza_pedra",
		"taverna_guilda",
		"galeao",
		"torre_arcana",
		"masmorra_subterranea",
		"templo_arruinado",
		"caravana_nomade",
		"mansao_nobre",
		"mina_abandonada",
		"arvore_mae",
	]),
	tier: z.number().int().min(0).max(4),
	structure: z.number().int().min(0).max(15),
	vigilance: z.number().int().min(0).max(15),
	logistics: z.number().int().min(0).max(15),
	integrityCurrent: z.number().int().min(0),
	threatCurrent: z.number().int().min(0).max(10),
	vaultGold: z.number().int().min(0),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export const bastionSelectSchema = createSelectSchema(bastions).extend({
	id: notBlankText,
	name: notBlankText,
	chassisId: z.string(),
	tier: z.number().int(),
	structure: z.number().int(),
	vigilance: z.number().int(),
	logistics: z.number().int(),
	integrityCurrent: z.number().int(),
	threatCurrent: z.number().int(),
	vaultGold: z.number().int(),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export const bastionModuleInsertSchema = createInsertSchema(
	bastionModules,
).extend({
	id: notBlankText,
	bastionId: notBlankText,
	moduleId: notBlankText,
	tier: z.number().int().min(1).max(4),
	progressCurrent: z.number().int().min(0),
	progressMax: z.number().int().min(10).max(100),
	isBroken: z.boolean().default(false),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export const bastionModuleSelectSchema = createSelectSchema(
	bastionModules,
).extend({
	id: notBlankText,
	bastionId: notBlankText,
	moduleId: notBlankText,
	tier: z.number().int(),
	progressCurrent: z.number().int(),
	progressMax: z.number().int(),
	isBroken: z.boolean(),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export type BastionRecord = z.infer<typeof bastionSelectSchema>;
export type NewBastionRecord = z.infer<typeof bastionInsertSchema>;
export type BastionModuleRecord = z.infer<typeof bastionModuleSelectSchema>;
export type NewBastionModuleRecord = z.infer<typeof bastionModuleInsertSchema>;
