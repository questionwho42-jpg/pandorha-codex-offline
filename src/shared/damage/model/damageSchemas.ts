import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";

const slugSchema = z
	.string()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);
const nonNegativeDamageValueSchema = z.number().int().min(0).max(10_000);

export const damageAffinityKindSchema = z.enum([
	"resistance",
	"vulnerability",
	"immunity",
]);

export const damageAffinitySchema = z
	.object({
		damageType: slugSchema,
		kind: damageAffinityKindSchema,
	})
	.strict();

export const damagePipelineInputSchema = z
	.object({
		damageType: slugSchema,
		baseDiceTotal: nonNegativeDamageValueSchema,
		matrixValue: nonNegativeDamageValueSchema,
		extraModifierTotal: nonNegativeDamageValueSchema,
		isCriticalHit: z.boolean(),
		damageReduction: nonNegativeDamageValueSchema,
		vulnerabilityBonusDamage: nonNegativeDamageValueSchema,
		affinities: z.array(damageAffinitySchema).max(40),
	})
	.strict();

export function formatDamagePipelineIssues(
	issues: readonly ZodIssue[],
): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
