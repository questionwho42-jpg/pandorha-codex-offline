import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";
import type { DamagePipelineResult } from "$lib/shared/damage";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type CombatRealDamageActorRef,
	type CombatRealDamageEventFailure,
	type CombatRealDamageReceivedEvent,
	createCombatRealDamageReceivedEvent,
} from "./combatRealDamageEvent";
import {
	type CombatRealHitPointsReplayFailure,
	type CombatRealHitPointsReplayState,
	type CombatRealHitPointsReplayTargetRef,
	replayCombatRealHitPoints,
} from "./combatRealHitPointsReplay";

export interface CombatRealDamageLedgerUpdateInput {
	readonly createdAt: string;
	readonly eventId: string;
	readonly eventLedger: readonly CombatRealDamageReceivedEvent[] | null;
	readonly incomingDamage: DamagePipelineResult | null;
	readonly source: CombatRealDamageActorRef;
	readonly target: CombatRealHitPointsReplayTargetRef | null;
}

export interface CombatRealDamageLedgerUpdateResult {
	readonly event: CombatRealDamageReceivedEvent;
	readonly eventLedger: readonly CombatRealDamageReceivedEvent[];
	readonly hitPoints: CombatRealHitPointsReplayState;
	readonly log: readonly string[];
}

export type CombatRealDamageLedgerUpdateFailureCode =
	| "INVALID_REAL_DAMAGE_LEDGER_UPDATE_INPUT"
	| "REAL_DAMAGE_REPLAY_FAILED"
	| "REAL_DAMAGE_EVENT_FAILED";

export type CombatRealDamageLedgerUpdateFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface CombatRealDamageLedgerUpdateFailure {
	readonly code: CombatRealDamageLedgerUpdateFailureCode;
	readonly message: string;
	readonly details?: CombatRealDamageLedgerUpdateFailureDetails;
}

const actorIdSchema = z
	.string()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);
const damageValueSchema = z.number().int().min(0).max(10_000);
const labelSchema = z.string().trim().min(1).max(80);
const timestampSchema = z.string().trim().min(1).max(120);
const damageAffinityKindSchema = z.enum([
	"resistance",
	"vulnerability",
	"immunity",
]);

const actorRefSchema = z
	.object({
		id: actorIdSchema,
		label: labelSchema,
	})
	.strict();

const replayTargetSchema = actorRefSchema
	.extend({
		maxHitPoints: z.number().int().min(1).max(10_000),
	})
	.strict();

const damagePipelineResultSchema = z
	.object({
		damageType: actorIdSchema,
		baseDamage: damageValueSchema,
		afterCritical: damageValueSchema,
		afterReduction: damageValueSchema,
		finalDamage: damageValueSchema,
		appliedAffinities: z.array(damageAffinityKindSchema).max(40),
		breakdown: z
			.object({
				baseDiceTotal: damageValueSchema,
				matrixValue: damageValueSchema,
				extraModifierTotal: damageValueSchema,
				criticalMultiplier: z.number().int().min(1).max(10),
				damageReduction: damageValueSchema,
				vulnerabilityBonusDamage: damageValueSchema,
			})
			.strict(),
	})
	.strict();

const realDamageEventSchema = z
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

const ledgerUpdateInputSchema = z
	.object({
		createdAt: timestampSchema,
		eventId: actorIdSchema,
		eventLedger: z.array(realDamageEventSchema).max(1000).nullable(),
		incomingDamage: damagePipelineResultSchema.nullable(),
		source: actorRefSchema,
		target: replayTargetSchema.nullable(),
	})
	.strict();

/**
 * @rule docs/architecture/feature_state_machines.md - HP real deve ser derivado por replay apos eventos de ledger.
 * @rule docs/process/t100-combat-real-damage-ui-gate.md - ponte evento+replay ainda nao autoriza save, UI persistida ou estados oficiais.
 */
export function createCombatRealDamageLedgerUpdate(
	input: unknown,
): Result<
	CombatRealDamageLedgerUpdateResult,
	CombatRealDamageLedgerUpdateFailure
> {
	const parsed = ledgerUpdateInputSchema.safeParse(input);
	if (!parsed.success) {
		return fail({
			code: "INVALID_REAL_DAMAGE_LEDGER_UPDATE_INPUT",
			message: "Combat real damage ledger update input failed validation.",
			details: {
				issues: formatCombatRealDamageLedgerUpdateIssues(parsed.error.issues),
			},
		});
	}

	const { createdAt, eventId, eventLedger, incomingDamage, source, target } =
		parsed.data;

	const currentHitPoints = replayCombatRealHitPoints({
		target,
		eventLedger,
	});
	if (!currentHitPoints.success) {
		return failReplay(currentHitPoints.error, target);
	}

	const event = createCombatRealDamageReceivedEvent({
		createdAt,
		eventId,
		eventLedger,
		incomingDamage,
		source,
		target: {
			id: currentHitPoints.data.targetId,
			label: currentHitPoints.data.targetLabel,
			maxHitPoints: currentHitPoints.data.maxHitPoints,
			currentHitPoints: currentHitPoints.data.currentHitPoints,
			isTerminal: currentHitPoints.data.isTerminal,
		},
	});
	if (!event.success) {
		return failEvent(event.error, target);
	}

	const nextHitPoints = replayCombatRealHitPoints({
		target,
		eventLedger: event.data.eventLedger,
	});
	if (!nextHitPoints.success) {
		return failReplay(nextHitPoints.error, target);
	}

	return ok({
		event: event.data.event,
		eventLedger: event.data.eventLedger,
		hitPoints: nextHitPoints.data,
		log: [...event.data.log, nextHitPoints.data.summaryLabel],
	});
}

export function formatCombatRealDamageLedgerUpdateIssues(
	issues: readonly ZodIssue[],
): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}

function failReplay(
	failure: CombatRealHitPointsReplayFailure,
	target: CombatRealHitPointsReplayTargetRef | null,
): Result<never, CombatRealDamageLedgerUpdateFailure> {
	return fail({
		code: "REAL_DAMAGE_REPLAY_FAILED",
		message: "Real damage ledger update could not replay hit points.",
		details: createWrappedFailureDetails(failure.code, target),
	});
}

function failEvent(
	failure: CombatRealDamageEventFailure,
	target: CombatRealHitPointsReplayTargetRef | null,
): Result<never, CombatRealDamageLedgerUpdateFailure> {
	return fail({
		code: "REAL_DAMAGE_EVENT_FAILED",
		message: "Real damage ledger update could not append the event.",
		details: createWrappedFailureDetails(failure.code, target),
	});
}

function createWrappedFailureDetails(
	originalFailureCode: string,
	target: CombatRealHitPointsReplayTargetRef | null,
): CombatRealDamageLedgerUpdateFailureDetails {
	return {
		originalFailureCode,
		...(target === null ? {} : { targetId: target.id }),
	};
}
