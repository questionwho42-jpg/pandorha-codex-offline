import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";
import { PANDORHA_RULES } from "$lib/shared/game-rules";

export const diceRollReasonSchema = z.string().trim().min(1).max(120);

export const dieSidesSchema = z
	.number()
	.int()
	.min(PANDORHA_RULES.DICE.MIN_DIE_SIDES)
	.max(PANDORHA_RULES.DICE.MAX_DIE_SIDES);

export const diceRollInputSchema = z
	.object({
		sides: dieSidesSchema,
		reason: diceRollReasonSchema,
	})
	.strict();

export const diceD20RollInputSchema = z
	.object({
		reason: diceRollReasonSchema,
	})
	.strict();

export function formatDiceIssues(
	issues: readonly ZodIssue[],
): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
