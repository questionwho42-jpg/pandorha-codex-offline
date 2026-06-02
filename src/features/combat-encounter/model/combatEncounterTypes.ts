import type {
	ActionCommand,
	ActionQueueFailure,
	ActionQueueProcessedCommand,
} from "$lib/shared/action-queue";
import type {
	DamagePipelineFailure,
	DamagePipelineInput,
	DamagePipelineResult,
} from "$lib/shared/damage";
import type { DiceFailure, DiceRollResult } from "$lib/shared/dice";
import type { Result } from "$lib/shared/lib/result";
import type {
	ResolutionFailure,
	ResolutionResult,
} from "$lib/shared/resolution";

export interface CombatEncounterActorRef {
	readonly id: string;
	readonly label: string;
}

export interface CombatEncounterTargetState extends CombatEncounterActorRef {
	readonly currentHitPoints: number;
	readonly armorClass: number;
}

export interface CombatEncounterAttackInput {
	readonly reason: string;
	readonly level: number;
	readonly axisValue: number;
	readonly applicationValue: number;
	readonly itemBonus: number;
}

export type CombatEncounterDamageInput = Omit<
	DamagePipelineInput,
	"isCriticalHit"
> & {
	readonly weaponDice?: CombatWeaponDamageDiceInput | undefined;
};

export type CombatWeaponDamageDiceExpression = "1d4" | "1d8";

export interface CombatWeaponDamageDiceInput {
	readonly expression: CombatWeaponDamageDiceExpression;
	readonly label: string;
}

export interface CombatEncounterInput {
	readonly command: unknown;
	readonly attacker: CombatEncounterActorRef;
	readonly target: CombatEncounterTargetState;
	readonly attack: CombatEncounterAttackInput;
	readonly damage: CombatEncounterDamageInput;
}

export type CombatEncounterEventType =
	| "attackQueued"
	| "attackResolved"
	| "weaponDamageRolled"
	| "damageApplied";

export interface CombatEncounterEvent {
	readonly id: string;
	readonly type: CombatEncounterEventType;
	readonly actorId: string;
	readonly targetId: string;
	readonly message: string;
	readonly createdAt: string;
	readonly damageAmount: number;
}

export interface CombatEncounterState {
	readonly attacker: CombatEncounterActorRef;
	readonly target: CombatEncounterTargetState;
	readonly wasHit: boolean;
	readonly resolution: ResolutionResult;
	readonly damage: DamagePipelineResult | null;
	readonly weaponDamageRoll: DiceRollResult | null;
	readonly events: readonly CombatEncounterEvent[];
	readonly log: readonly string[];
	readonly processedCommand: ActionQueueProcessedCommand;
}

export interface CombatResolutionPort {
	resolveGlobalTest(
		input: unknown,
	): Result<ResolutionResult, ResolutionFailure>;
}

export interface CombatDamagePort {
	calculateDamage(
		input: unknown,
	): Result<DamagePipelineResult, DamagePipelineFailure>;
}

export interface CombatWeaponDamageDicePort {
	rollDie(input: unknown): Result<DiceRollResult, DiceFailure>;
}

export interface CombatEncounterClock {
	now(): string;
}

export type CombatEncounterFailureCode =
	| "INVALID_COMBAT_ENCOUNTER_INPUT"
	| "ACTION_QUEUE_FAILED"
	| "RESOLUTION_FAILED"
	| "DAMAGE_PIPELINE_FAILED"
	| "WEAPON_DAMAGE_DICE_FAILED";

export type CombatEncounterFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface CombatEncounterFailure {
	readonly code: CombatEncounterFailureCode;
	readonly message: string;
	readonly details?: CombatEncounterFailureDetails;
	readonly cause?:
		| ActionQueueFailure
		| ResolutionFailure
		| DamagePipelineFailure
		| DiceFailure;
}

export interface CombatEncounterResolvedCommand {
	readonly command: ActionCommand;
	readonly state: CombatEncounterState;
}
