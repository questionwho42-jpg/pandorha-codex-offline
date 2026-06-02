import type { DiceFailure, DiceRollResult } from "$lib/shared/dice";

export type ResolutionDegree =
	| "criticalSuccess"
	| "success"
	| "successWithCost"
	| "failure";

export interface GlobalTestInput {
	readonly reason: string;
	readonly level: number;
	readonly axisValue: number;
	readonly applicationValue: number;
	readonly itemBonus: number;
	readonly dc: number;
}

export interface ResolutionBreakdown {
	readonly naturalRoll: number;
	readonly level: number;
	readonly axisValue: number;
	readonly applicationValue: number;
	readonly itemBonus: number;
}

export interface ResolutionResult {
	readonly degree: ResolutionDegree;
	readonly total: number;
	readonly margin: number;
	readonly dc: number;
	readonly level: number;
	readonly axisValue: number;
	readonly applicationValue: number;
	readonly itemBonus: number;
	readonly isNaturalSuccess: boolean;
	readonly isNaturalFailure: boolean;
	readonly dice: DiceRollResult;
	readonly breakdown: ResolutionBreakdown;
}

export type ResolutionFailureCode =
	| "INVALID_RESOLUTION_INPUT"
	| "DICE_ROLL_FAILED";

export type ResolutionFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface ResolutionFailure {
	readonly code: ResolutionFailureCode;
	readonly message: string;
	readonly details?: ResolutionFailureDetails;
	readonly cause?: DiceFailure;
}
