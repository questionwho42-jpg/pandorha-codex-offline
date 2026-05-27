import { z } from "zod/v4";
import { clockSelectSchema } from "$lib/entities/clock";

const explicitTriggerIdSchema = z
	.string()
	.trim()
	.min(1)
	.max(120)
	.regex(/^[a-z][a-z0-9-]*$/);

export const socialRetaliationClockAdvanceInputSchema = z.object({
	appliedTriggerIds: z.array(explicitTriggerIdSchema),
	clocks: z.array(clockSelectSchema),
	slices: z.number().int().positive(),
	triggerId: explicitTriggerIdSchema,
	triggeredAt: z.string().trim().datetime({ offset: true }),
});

export type ParsedSocialRetaliationClockAdvanceInput = z.infer<
	typeof socialRetaliationClockAdvanceInputSchema
>;
