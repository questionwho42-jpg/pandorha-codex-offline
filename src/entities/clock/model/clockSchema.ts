import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const isoTimestampSchema = z.string().trim().datetime({ offset: true });
const clockIdPattern = /^[a-z][a-z0-9-]*$/;

export const clockIdSchema = z
	.string()
	.trim()
	.min(1)
	.max(120)
	.regex(clockIdPattern);

export const clockStatusSchema = z.enum(["active", "completed"]);

export const clocks = sqliteTable("clocks", {
	id: text("id").primaryKey(),
	label: text("label").notNull(),
	currentSlices: integer("current_slices").notNull(),
	maxSlices: integer("max_slices").notNull(),
	status: text("status").notNull(),
	source: text("source").notNull(),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const clockInsertSchema = createInsertSchema(clocks).extend({
	id: clockIdSchema,
	label: z.string().trim().min(1).max(180),
	currentSlices: z.number().int().min(0),
	maxSlices: z.number().int().positive(),
	status: clockStatusSchema,
	source: z.string().trim().min(1).max(120),
	createdAt: isoTimestampSchema,
	updatedAt: isoTimestampSchema,
});

export const clockSelectSchema = createSelectSchema(clocks)
	.extend({
		id: clockIdSchema,
		label: z.string().trim().min(1).max(180),
		currentSlices: z.number().int().min(0),
		maxSlices: z.number().int().positive(),
		status: clockStatusSchema,
		source: z.string().trim().min(1).max(120),
		createdAt: isoTimestampSchema,
		updatedAt: isoTimestampSchema,
	})
	.refine((clock) => clock.currentSlices <= clock.maxSlices, {
		message: "currentSlices must not exceed maxSlices.",
		path: ["currentSlices"],
	});

export const clockCreateInputSchema = z.object({
	id: clockIdSchema,
	label: z.string().trim().min(1).max(180),
	maxSlices: z.number().int().positive(),
	source: z.string().trim().min(1).max(120),
	createdAt: isoTimestampSchema,
	updatedAt: isoTimestampSchema,
});

export const clockAdvanceInputSchema = z.object({
	clockId: clockIdSchema,
	slices: z.number().int().positive(),
	updatedAt: isoTimestampSchema,
});

export type ClockRecord = z.infer<typeof clockSelectSchema>;
export type NewClockRecord = z.infer<typeof clockInsertSchema>;
export type ClockId = z.infer<typeof clockIdSchema>;
export type ClockCreateInput = z.infer<typeof clockCreateInputSchema>;
export type ClockAdvanceInput = z.infer<typeof clockAdvanceInputSchema>;
