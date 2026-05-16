import { z } from "zod";

export const clockSchema = z
	.object({
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
		triggerEvent: z.string().optional(),
	})
	.refine((data) => data.filledSegments <= data.totalSegments, {
		message: "Os segmentos preenchidos não podem exceder o total do relógio",
		path: ["filledSegments"],
	});

export type ClockData = z.infer<typeof clockSchema>;
