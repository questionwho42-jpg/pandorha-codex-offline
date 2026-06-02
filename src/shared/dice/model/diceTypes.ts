export interface DiceRng {
	next(): number;
}

export interface DiceRollIdProvider {
	generate(): string;
}

export interface DiceClock {
	now(): string;
}

export interface DiceRollInput {
	readonly sides: number;
	readonly reason: string;
}

export interface DiceD20RollInput {
	readonly reason: string;
}

export interface DiceRollAuditEntry {
	readonly rollId: string;
	readonly reason: string;
	readonly sides: number;
	readonly naturalRoll: number;
	readonly createdAt: string;
}

export interface DiceRollResult {
	readonly naturalRoll: number;
	readonly sides: number;
	readonly isNaturalCritical: boolean;
	readonly isNaturalFailure: boolean;
	readonly auditEntry: DiceRollAuditEntry;
}

export type DiceFailureCode =
	| "INVALID_DIE_SIDES"
	| "INVALID_DICE_REASON"
	| "INVALID_RNG_VALUE";

export type DiceFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface DiceFailure {
	readonly code: DiceFailureCode;
	readonly message: string;
	readonly details?: DiceFailureDetails;
}
