import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);
const catalogId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);
const visibleLabel = z.string().trim().min(1).max(120);

export const trapTypeSchema = z.enum(["mechanical", "magical"]);
export const trapSeveritySchema = z.enum(["simple", "hidden", "deadly"]);

export const traps = sqliteTable("traps", {
	id: text("id").primaryKey(),
	tileId: text("tile_id").notNull(),
	name: text("name").notNull(),
	type: text("type").notNull(), // 'mechanical' | 'magical'
	severity: text("severity").notNull(), // 'simple' | 'hidden' | 'deadly'
	dc: integer("dc").notNull(),
	damage: integer("damage").notNull(),
	isDetected: integer("is_detected", { mode: "boolean" })
		.notNull()
		.default(false),
	isDisarmed: integer("is_disarmed", { mode: "boolean" })
		.notNull()
		.default(false),
	isTriggered: integer("is_triggered", { mode: "boolean" })
		.notNull()
		.default(false),
	effects: text("effects").notNull().default("[]"), // Array de strings JSON de efeitos aplicados: e.g. ["poisoned", "eter_fever"]
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const trapInsertSchema = createInsertSchema(traps).extend({
	id: catalogId,
	tileId: notBlankText,
	name: visibleLabel,
	type: trapTypeSchema,
	severity: trapSeveritySchema,
	dc: z.number().int().min(1).max(99),
	damage: z.number().int().min(0).max(999),
	isDetected: z.boolean().default(false),
	isDisarmed: z.boolean().default(false),
	isTriggered: z.boolean().default(false),
	effects: z.string().default("[]"),
	createdAt: notBlankText,
	updatedAt: notBlankText.optional(),
});

export const trapSelectSchema = createSelectSchema(traps).extend({
	id: catalogId,
	tileId: notBlankText,
	name: visibleLabel,
	type: trapTypeSchema,
	severity: trapSeveritySchema,
	dc: z.number().int(),
	damage: z.number().int(),
	isDetected: z.boolean(),
	isDisarmed: z.boolean(),
	isTriggered: z.boolean(),
	effects: z.string(),
	createdAt: notBlankText,
	updatedAt: notBlankText,
});

export type TrapType = z.infer<typeof trapTypeSchema>;
export type TrapSeverity = z.infer<typeof trapSeveritySchema>;
export type TrapRecord = z.infer<typeof trapSelectSchema>;
export type NewTrapRecord = z.infer<typeof trapInsertSchema>;
