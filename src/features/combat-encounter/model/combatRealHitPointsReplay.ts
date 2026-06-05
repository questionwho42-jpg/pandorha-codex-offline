import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CombatRealDamageReceivedEvent } from "./combatRealDamageEvent";

export interface CombatRealHitPointsReplayTargetRef {
	readonly id: string;
	readonly label: string;
	readonly maxHitPoints: number;
}

export interface CombatRealHitPointsReplayInput {
	readonly target: CombatRealHitPointsReplayTargetRef | null;
	readonly eventLedger: readonly CombatRealDamageReceivedEvent[] | null;
}

export interface CombatRealHitPointsReplayState {
	readonly appliedDamageTotal: number;
	readonly currentHitPoints: number;
	readonly isTerminal: boolean;
	readonly matchedEventCount: number;
	readonly maxHitPoints: number;
	readonly summaryLabel: string;
	readonly targetId: string;
	readonly targetLabel: string;
}

export type CombatRealHitPointsReplayFailureCode =
	| "INVALID_REAL_HIT_POINTS_REPLAY_INPUT"
	| "REAL_HIT_POINTS_TARGET_NOT_FOUND"
	| "REAL_HIT_POINTS_LEDGER_MISSING"
	| "REAL_HIT_POINTS_EVENT_AFTER_TERMINAL";

export type CombatRealHitPointsReplayFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface CombatRealHitPointsReplayFailure {
	readonly code: CombatRealHitPointsReplayFailureCode;
	readonly message: string;
	readonly details?: CombatRealHitPointsReplayFailureDetails;
}

const actorIdSchema = z
	.string()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);
const labelSchema = z.string().trim().min(1).max(80);
const timestampSchema = z.string().trim().min(1).max(120);
const damageAffinityKindSchema = z.enum([
	"resistance",
	"vulnerability",
	"immunity",
]);

const combatRealHitPointsReplayTargetSchema = z
	.object({
		id: actorIdSchema,
		label: labelSchema,
		maxHitPoints: z.number().int().min(1).max(10_000),
	})
	.strict();

const combatRealDamageReceivedEventSchema = z
	.object({
		id: actorIdSchema,
		type: z.literal("realDamageReceived"),
		sourceId: actorIdSchema,
		sourceLabel: labelSchema,
		targetId: actorIdSchema,
		targetLabel: labelSchema,
		damageType: actorIdSchema,
		damageAmount: z.number().int().min(1).max(10_000),
		appliedAffinities: z.array(damageAffinityKindSchema).max(40),
		createdAt: timestampSchema,
		message: z.string().trim().min(1).max(240),
	})
	.strict();

const combatRealHitPointsReplayInputSchema = z
	.object({
		target: combatRealHitPointsReplayTargetSchema.nullable(),
		eventLedger: z
			.array(combatRealDamageReceivedEventSchema)
			.max(1000)
			.nullable(),
	})
	.strict();

/**
 * @rule docs/architecture/feature_state_machines.md - HP real e derivado por replay do ledger de eventos.
 * @rule docs/process/t100-combat-real-damage-ui-gate.md - replay puro deve existir antes de qualquer UI de HP real.
 */
export function replayCombatRealHitPoints(
	input: unknown,
): Result<CombatRealHitPointsReplayState, CombatRealHitPointsReplayFailure> {
	const parsed = combatRealHitPointsReplayInputSchema.safeParse(input);
	if (!parsed.success) {
		return fail({
			code: "INVALID_REAL_HIT_POINTS_REPLAY_INPUT",
			message: "Combat real hit points replay input failed validation.",
			details: {
				issues: formatCombatRealHitPointsReplayIssues(parsed.error.issues),
			},
		});
	}

	const { eventLedger, target } = parsed.data;
	if (target === null) {
		return fail({
			code: "REAL_HIT_POINTS_TARGET_NOT_FOUND",
			message: "Real hit points replay target could not be resolved.",
		});
	}

	if (eventLedger === null) {
		return fail({
			code: "REAL_HIT_POINTS_LEDGER_MISSING",
			message: "Real hit points replay requires an explicit event ledger.",
			details: { targetId: target.id },
		});
	}

	let currentHitPoints = target.maxHitPoints;
	let appliedDamageTotal = 0;
	let matchedEventCount = 0;

	for (const event of eventLedger) {
		if (event.targetId !== target.id) {
			continue;
		}

		if (currentHitPoints <= 0) {
			return fail({
				code: "REAL_HIT_POINTS_EVENT_AFTER_TERMINAL",
				message:
					"Real hit points replay is blocked by an event after terminal HP.",
				details: {
					blockedEventId: event.id,
					currentHitPoints,
					targetId: target.id,
				},
			});
		}

		matchedEventCount += 1;
		appliedDamageTotal += event.damageAmount;
		currentHitPoints = Math.max(0, currentHitPoints - event.damageAmount);
	}

	return ok(
		createReplayState({
			appliedDamageTotal,
			currentHitPoints,
			matchedEventCount,
			target,
		}),
	);
}

export function formatCombatRealHitPointsReplayIssues(
	issues: readonly ZodIssue[],
): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}

function createReplayState(input: {
	readonly appliedDamageTotal: number;
	readonly currentHitPoints: number;
	readonly matchedEventCount: number;
	readonly target: CombatRealHitPointsReplayTargetRef;
}): CombatRealHitPointsReplayState {
	return {
		appliedDamageTotal: input.appliedDamageTotal,
		currentHitPoints: input.currentHitPoints,
		isTerminal: input.currentHitPoints <= 0,
		matchedEventCount: input.matchedEventCount,
		maxHitPoints: input.target.maxHitPoints,
		summaryLabel: `HP real de ${input.target.label}: ${input.currentHitPoints}/${input.target.maxHitPoints}`,
		targetId: input.target.id,
		targetLabel: input.target.label,
	};
}
