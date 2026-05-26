import type { FactionStandingRecord } from "$lib/entities/faction";

export type SocialStandingFailureCode =
	| "INVALID_SOCIAL_STANDING_INPUT"
	| "FACTION_NOT_FOUND"
	| "FACTION_LOOKUP_FAILED"
	| "DEBT_LIMIT_EXCEEDED"
	| "INVALID_FAVOR_TIER"
	| "OPERATION_NOT_ALLOWED";

export type SocialStandingFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface SocialStandingFailure {
	readonly code: SocialStandingFailureCode;
	readonly message: string;
	readonly details?: SocialStandingFailureDetails;
}

export interface SocialDebtLimitResult {
	readonly fameLevel: number;
	readonly debtLimit: number;
}

export interface SocialStandingChangeResult {
	readonly standing: FactionStandingRecord;
	readonly debtLimit: number;
	readonly event: SocialStandingEvent;
}

export interface SocialStandingEvent {
	readonly type:
		| "faction-favor-invoked"
		| "faction-debt-redeemed"
		| "faction-fame-gained"
		| "faction-fame-lost"
		| "faction-infamy-gained";
	readonly message: string;
}
