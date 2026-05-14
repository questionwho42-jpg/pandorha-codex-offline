import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";

const technicalId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);

export const spellCastInputSchema = z
	.object({
		commandId: technicalId,
		casterId: technicalId,
		spellId: technicalId,
		targetId: technicalId,
		availableEther: z.number().int().min(0).max(999),
		metamagicIds: z.array(technicalId).max(10),
		createdAt: z.iso.datetime(),
	})
	.strict();

export type SpellCastInput = z.infer<typeof spellCastInputSchema>;

export function formatSpellCastIssues(
	issues: readonly ZodIssue[],
): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
