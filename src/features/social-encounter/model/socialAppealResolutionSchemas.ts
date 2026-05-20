import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";

const integerModifierSchema = z.number().int().min(-100).max(100);
const nonNegativeIntegerSchema = z.number().int().min(0).max(100);

export const socialAppealResolutionInputSchema = z
	.object({
		reason: z.string().trim().min(1).max(120),
		level: nonNegativeIntegerSchema,
		social: integerModifierSchema,
		interaction: integerModifierSchema,
		itemBonus: integerModifierSchema,
		dc: z.number().int().min(1).max(200),
	})
	.strict();

export type SocialAppealResolutionInput = z.infer<
	typeof socialAppealResolutionInputSchema
>;

export function formatSocialAppealResolutionIssues(
	issues: readonly ZodIssue[],
): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
