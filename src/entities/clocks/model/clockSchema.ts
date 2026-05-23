import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const progressClocks = sqliteTable("progress_clocks", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	totalSegments: integer("total_segments").notNull(),
	filledSegments: integer("filled_segments").notNull().default(0),
	isCompleted: integer("is_completed", { mode: "boolean" })
		.notNull()
		.default(false),
	triggerEvent: text("trigger_event"),
});

// Zod validation schemas
export const clockSelectSchema = createSelectSchema(progressClocks)
	.extend({
		id: z.string().uuid("ID inválido para o relógio"),
		name: z.string().min(1, "O relógio deve ter um nome"),
		totalSegments: z
			.number()
			.int()
			.min(2, "Um relógio deve ter no mínimo 2 segmentos"),
		filledSegments: z
			.number()
			.int()
			.min(0, "Os segmentos preenchidos não podem ser negativos"),
		isCompleted: z.boolean(),
		triggerEvent: z.string().optional().nullable(),
	})
	.refine((data) => data.filledSegments <= data.totalSegments, {
		message: "Os segmentos preenchidos não podem exceder o total do relógio",
		path: ["filledSegments"],
	});

export const clockInsertSchema = createInsertSchema(progressClocks)
	.extend({
		id: z.string().uuid("ID inválido para o relógio"),
		name: z.string().min(1, "O relógio deve ter um nome"),
		totalSegments: z
			.number()
			.int()
			.min(2, "Um relógio deve ter no mínimo 2 segmentos"),
		filledSegments: z
			.number()
			.int()
			.min(0, "Os segmentos preenchidos não podem ser negativos"),
		isCompleted: z.boolean().default(false),
		triggerEvent: z.string().optional().nullable(),
	})
	.refine((data) => data.filledSegments <= data.totalSegments, {
		message: "Os segmentos preenchidos não podem exceder o total do relógio",
		path: ["filledSegments"],
	});

export type ClockData = z.infer<typeof clockSelectSchema>;
export type NewClockData = z.infer<typeof clockInsertSchema>;
