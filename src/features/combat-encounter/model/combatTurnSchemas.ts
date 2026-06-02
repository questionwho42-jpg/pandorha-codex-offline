import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";

const actorIdSchema = z
	.string()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);

export const combatTurnEventSchema = z
	.object({
		id: z
			.string()
			.regex(/^turn-event-[1-9][0-9]*$/)
			.max(80),
		type: z.enum(["turnStarted", "actionSpent", "turnEnded"]),
		actorId: actorIdSchema,
		round: z.number().int().min(1).max(10_000),
		actionCost: z.number().int().min(0).max(4),
	})
	.strict();

export const combatTurnStateSchema = z
	.object({
		round: z.number().int().min(1).max(10_000),
		activeActorId: actorIdSchema,
		activeActorIndex: z.number().int().min(0).max(99),
		actorOrder: z.array(actorIdSchema).min(2).max(100),
		actionPointsRemaining: z.number().int().min(0).max(4),
		maxActionPoints: z.literal(3),
		events: z.array(combatTurnEventSchema),
	})
	.strict();

export const combatTurnStartInputSchema = z
	.object({
		actorOrder: z.array(actorIdSchema).min(2).max(100),
	})
	.strict();

export const combatTurnActionInputSchema = z
	.object({
		state: combatTurnStateSchema,
		actorId: actorIdSchema,
		actionCost: z.number().int().min(1).max(4),
	})
	.strict();

export const combatTurnEndInputSchema = z
	.object({
		state: combatTurnStateSchema,
		actorId: actorIdSchema,
	})
	.strict();

export function formatCombatTurnIssues(
	issues: readonly ZodIssue[],
): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
