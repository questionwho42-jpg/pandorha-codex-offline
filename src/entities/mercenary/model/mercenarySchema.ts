import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);

export const mercenaryCompanies = sqliteTable("mercenary_companies", {
	id: text("id").primaryKey(),
	bastionId: text("bastion_id"),
	tier: integer("tier").notNull().default(1), // 1 a 4
	reputation: integer("reputation").notNull().default(0),
	hqName: text("hq_name").notNull(),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const mercenarySquads = sqliteTable("mercenary_squads", {
	id: text("id").primaryKey(),
	companyId: text("company_id")
		.notNull()
		.references(() => mercenaryCompanies.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	physical: integer("physical").notNull().default(0), // 0 a 5
	mental: integer("mental").notNull().default(0), // 0 a 5
	social: integer("social").notNull().default(0), // 0 a 5
	cohesionMax: integer("cohesion_max").notNull().default(10), // 10 + physical
	cohesionCurrent: integer("cohesion_current").notNull().default(10),
	tagsJson: text("tags_json").notNull().default("[]"), // Array de strings (JSON)
	commandTactic: text("command_tactic").notNull().default("honorable"), // 'honorable' | 'cruel' | 'stealthy'
	status: text("status").notNull().default("available"), // 'available' | 'on_mission' | 'resting' | 'dead'
	assignedMissionId: text("assigned_mission_id"),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

// Zod Schemas
export const mercenaryCompanyInsertSchema = createInsertSchema(
	mercenaryCompanies,
).extend({
	id: notBlankText,
	hqName: z.string().trim().min(1).max(100),
	tier: z.number().int().min(1).max(4),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export const mercenaryCompanySelectSchema = createSelectSchema(
	mercenaryCompanies,
).extend({
	id: notBlankText,
	hqName: notBlankText,
	tier: z.number().int(),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export const mercenarySquadInsertSchema = createInsertSchema(
	mercenarySquads,
).extend({
	id: notBlankText,
	companyId: notBlankText,
	name: z.string().trim().min(1).max(100),
	physical: z.number().int().min(0).max(5),
	mental: z.number().int().min(0).max(5),
	social: z.number().int().min(0).max(5),
	cohesionMax: z.number().int().min(10),
	cohesionCurrent: z.number().int().min(0),
	commandTactic: z.enum(["honorable", "cruel", "stealthy"]),
	status: z.enum(["available", "on_mission", "resting", "dead"]),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export const mercenarySquadSelectSchema = createSelectSchema(
	mercenarySquads,
).extend({
	id: notBlankText,
	companyId: notBlankText,
	name: notBlankText,
	physical: z.number().int(),
	mental: z.number().int(),
	social: z.number().int(),
	cohesionMax: z.number().int(),
	cohesionCurrent: z.number().int(),
	commandTactic: z.enum(["honorable", "cruel", "stealthy"]),
	status: z.enum(["available", "on_mission", "resting", "dead"]),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export type MercenaryCompanyRecord = z.infer<
	typeof mercenaryCompanySelectSchema
>;
export type NewMercenaryCompanyRecord = z.infer<
	typeof mercenaryCompanyInsertSchema
>;
export type MercenarySquadRecord = z.infer<typeof mercenarySquadSelectSchema>;
export type NewMercenarySquadRecord = z.infer<
	typeof mercenarySquadInsertSchema
>;
