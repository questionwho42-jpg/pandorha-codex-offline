import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";
import { damagePipelineInputSchema } from "$lib/shared/damage";
import { globalTestInputSchema } from "$lib/shared/resolution";

const actorIdSchema = z
	.string()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);

export const combatEncounterActorSchema = z
	.object({
		id: actorIdSchema,
		label: z.string().trim().min(1).max(80),
	})
	.strict();

export const combatEncounterTargetSchema = combatEncounterActorSchema
	.extend({
		currentHitPoints: z.number().int().min(0).max(10_000),
		armorClass: z.number().int().min(1).max(500),
	})
	.strict();

export const combatEncounterAttackSchema = globalTestInputSchema
	.omit({ dc: true })
	.strict();

export const combatEncounterDamageSchema = damagePipelineInputSchema
	.omit({ isCriticalHit: true })
	.extend({
		weaponDice: z
			.object({
				expression: z.enum(["1d4", "1d8"]),
				label: z.string().trim().min(1).max(80),
			})
			.strict()
			.optional(),
	})
	.strict();

export const combatEncounterInputSchema = z
	.object({
		command: z.unknown(),
		attacker: combatEncounterActorSchema,
		target: combatEncounterTargetSchema,
		attack: combatEncounterAttackSchema,
		damage: combatEncounterDamageSchema,
	})
	.strict();

export function formatCombatEncounterIssues(
	issues: readonly ZodIssue[],
): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
