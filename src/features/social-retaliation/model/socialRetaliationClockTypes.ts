import type { ClockFailure, ClockRecord } from "$lib/entities/clock";
import type { Result } from "$lib/shared/lib/result";
import type { ParsedSocialRetaliationClockAdvanceGateInput } from "./socialRetaliationClockSchemas";

export type SocialRetaliationClockEventType =
	| "social-retaliation-clock-advanced"
	| "social-retaliation-trigger-skipped"
	| "social-retaliation-trigger-had-no-targets";

export interface SocialRetaliationClockEvent {
	readonly type: SocialRetaliationClockEventType;
	readonly message: string;
	readonly createdAt: string;
	readonly clockId?: string;
	readonly triggerId?: string;
}

export interface SocialRetaliationClockAdvanceResult {
	readonly clocks: readonly ClockRecord[];
	readonly advancedClocks: readonly ClockRecord[];
	readonly appliedTriggerIds: readonly string[];
	readonly events: readonly SocialRetaliationClockEvent[];
}

export type SocialRetaliationClockAdvanceCause =
	ParsedSocialRetaliationClockAdvanceGateInput["cause"];

export type SocialRetaliationClockAdvanceGateNextAction =
	| "advance-from-trigger"
	| "wait-for-official-rule";

export interface SocialRetaliationClockAdvanceGateDecision {
	readonly allowed: boolean;
	readonly cause: SocialRetaliationClockAdvanceCause;
	readonly nextAction: SocialRetaliationClockAdvanceGateNextAction;
	readonly reason: string;
	readonly triggerId: string;
}

export type SocialRetaliationClockFailureCode =
	| "INVALID_SOCIAL_RETALIATION_CLOCK_INPUT"
	| "SOCIAL_RETALIATION_CLOCK_OVERFLOW"
	| "SOCIAL_RETALIATION_CLOCK_ADVANCE_FAILED";

export interface SocialRetaliationClockFailure {
	readonly code: SocialRetaliationClockFailureCode;
	readonly message: string;
	readonly details?: unknown;
}

export interface SocialRetaliationClockProgressPort {
	advanceClock(input: {
		readonly clockId: string;
		readonly slices: number;
		readonly updatedAt: string;
	}): Promise<Result<ClockRecord, ClockFailure>>;
}
