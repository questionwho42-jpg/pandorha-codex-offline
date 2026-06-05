import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";
import type {
	DamageAffinityKind,
	DamagePipelineResult,
} from "$lib/shared/damage";
import { fail, ok, type Result } from "$lib/shared/lib/result";

export type CombatRealDamageReceivedEventType = "realDamageReceived";

export interface CombatRealDamageActorRef {
	readonly id: string;
	readonly label: string;
}

export interface CombatRealDamageTargetRef extends CombatRealDamageActorRef {
	readonly currentHitPoints: number;
	readonly maxHitPoints: number;
	readonly isTerminal: boolean;
}

export interface CombatRealDamageReceivedEvent {
	readonly id: string;
	readonly type: CombatRealDamageReceivedEventType;
	readonly sourceId: string;
	readonly sourceLabel: string;
	readonly targetId: string;
	readonly targetLabel: string;
	readonly damageType: string;
	readonly damageAmount: number;
	readonly appliedAffinities: readonly DamageAffinityKind[];
	readonly createdAt: string;
	readonly message: string;
}

export interface CombatRealDamageEventInput {
	readonly eventId: string;
	readonly createdAt: string;
	readonly source: CombatRealDamageActorRef;
	readonly target: CombatRealDamageTargetRef | null;
	readonly incomingDamage: DamagePipelineResult | null;
	readonly eventLedger: readonly CombatRealDamageReceivedEvent[] | null;
}

export interface CombatRealDamageEventResult {
	readonly event: CombatRealDamageReceivedEvent;
	readonly eventLedger: readonly CombatRealDamageReceivedEvent[];
	readonly log: readonly string[];
}

export type CombatRealDamageEventFailureCode =
	| "INVALID_REAL_DAMAGE_EVENT_INPUT"
	| "REAL_DAMAGE_TARGET_NOT_FOUND"
	| "REAL_DAMAGE_LEDGER_MISSING"
	| "REAL_DAMAGE_INVALID_DAMAGE"
	| "REAL_DAMAGE_TERMINAL_BLOCKED";

export type CombatRealDamageEventFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface CombatRealDamageEventFailure {
	readonly code: CombatRealDamageEventFailureCode;
	readonly message: string;
	readonly details?: CombatRealDamageEventFailureDetails;
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

const combatRealDamageActorRefSchema = z
	.object({
		id: actorIdSchema,
		label: labelSchema,
	})
	.strict();

const combatRealDamageTargetRefSchema = combatRealDamageActorRefSchema
	.extend({
		currentHitPoints: damageValueSchema,
		maxHitPoints: z.number().int().min(1).max(10_000),
		isTerminal: z.boolean(),
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

const combatRealDamageEventInputSchema = z
	.object({
		eventId: actorIdSchema,
		createdAt: timestampSchema,
		source: combatRealDamageActorRefSchema,
		target: combatRealDamageTargetRefSchema.nullable(),
		incomingDamage: damagePipelineResultSchema.nullable(),
		eventLedger: z
			.array(combatRealDamageReceivedEventSchema)
			.max(1000)
			.nullable(),
	})
	.strict();

/**
 * @rule docs/architecture/feature_state_machines.md - HP real nao pode mudar sem evento no ledger.
 * @rule docs/process/t98-official-incoming-damage-gate.md - T99 cria apenas o contrato de evento, sem UI, save v6 ou mutacao de HP real.
 */
export function createCombatRealDamageReceivedEvent(
	input: unknown,
): Result<CombatRealDamageEventResult, CombatRealDamageEventFailure> {
	const parsed = combatRealDamageEventInputSchema.safeParse(input);
	if (!parsed.success) {
		return fail({
			code: "INVALID_REAL_DAMAGE_EVENT_INPUT",
			message: "Combat real damage event input failed validation.",
			details: {
				issues: formatCombatRealDamageEventIssues(parsed.error.issues),
			},
		});
	}

	const { createdAt, eventId, eventLedger, incomingDamage, source, target } =
		parsed.data;

	if (target === null) {
		return fail({
			code: "REAL_DAMAGE_TARGET_NOT_FOUND",
			message: "Real damage event target could not be resolved.",
			details: { sourceId: source.id },
		});
	}

	if (eventLedger === null) {
		return fail({
			code: "REAL_DAMAGE_LEDGER_MISSING",
			message: "Real damage event requires an explicit event ledger.",
			details: { targetId: target.id },
		});
	}

	if (incomingDamage === null || incomingDamage.finalDamage <= 0) {
		return fail({
			code: "REAL_DAMAGE_INVALID_DAMAGE",
			message: "Real damage event requires positive resolved damage.",
			details: {
				targetId: target.id,
				...(incomingDamage === null
					? {}
					: { finalDamage: incomingDamage.finalDamage }),
			},
		});
	}

	if (target.isTerminal || target.currentHitPoints <= 0) {
		return fail({
			code: "REAL_DAMAGE_TERMINAL_BLOCKED",
			message:
				"Real damage event is blocked until the terminal HP flow is approved.",
			details: {
				currentHitPoints: target.currentHitPoints,
				isTerminal: target.isTerminal,
				targetId: target.id,
			},
		});
	}

	const message = createRealDamageEventMessage(target, incomingDamage);
	const event: CombatRealDamageReceivedEvent = {
		id: eventId,
		type: "realDamageReceived",
		sourceId: source.id,
		sourceLabel: source.label,
		targetId: target.id,
		targetLabel: target.label,
		damageType: incomingDamage.damageType,
		damageAmount: incomingDamage.finalDamage,
		appliedAffinities: incomingDamage.appliedAffinities,
		createdAt,
		message,
	};

	return ok({
		event,
		eventLedger: [...eventLedger, event],
		log: [message],
	});
}

export function formatCombatRealDamageEventIssues(
	issues: readonly ZodIssue[],
): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}

function createRealDamageEventMessage(
	target: CombatRealDamageTargetRef,
	damage: DamagePipelineResult,
): string {
	return `${target.label} recebeu ${damage.finalDamage} de dano real ${formatDamageTypeLabel(
		damage.damageType,
	)}. Evento registrado; HP real depende de replay aprovado do ledger.`;
}

function formatDamageTypeLabel(damageType: string): string {
	if (damageType === "physical") {
		return "fisico";
	}

	return damageType;
}
