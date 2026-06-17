import type { Result } from "$lib/shared/lib/result";

export interface CombatPotionBeltInput {
	readonly characterId: string;
}

export interface CombatPotionBeltConsumeInput extends CombatPotionBeltInput {
	readonly entryId: string;
}

export interface CombatPotionBeltSnapshot {
	readonly entryId: string | null;
	readonly quantity: number;
	readonly capacity: number;
	readonly canUse: boolean;
}

export interface CombatPotionBeltUseResult {
	readonly snapshot: CombatPotionBeltSnapshot;
	readonly logEntry: string;
}

export type CombatPotionBeltFailureCode =
	| "COMBAT_POTION_BELT_INVENTORY_UNAVAILABLE"
	| "COMBAT_POTION_BELT_LEDGER_INVALID"
	| "COMBAT_POTION_BELT_ENTRY_INVALID";

export interface CombatPotionBeltFailure {
	readonly code: CombatPotionBeltFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
}

export type CombatPotionBeltResolver = (
	input: CombatPotionBeltInput,
) => Promise<Result<CombatPotionBeltSnapshot, CombatPotionBeltFailure>>;

export type CombatPotionBeltConsumer = (
	input: CombatPotionBeltConsumeInput,
) => Promise<Result<CombatPotionBeltUseResult, CombatPotionBeltFailure>>;
