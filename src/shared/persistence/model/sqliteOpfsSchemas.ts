import { z } from "zod/v4";

export const sqliteBootstrapInputSchema = z.object({
	requestedAt: z.string().trim().datetime({ offset: true }),
	activeSaveFile: z.string().trim().optional(),
});
