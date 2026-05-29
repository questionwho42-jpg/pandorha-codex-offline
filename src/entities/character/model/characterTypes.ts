export type CharacterFailureCode =
	| "INVALID_CHARACTER_INPUT"
	| "INVALID_AXIS_DISTRIBUTION"
	| "INVALID_APPLICATION_DISTRIBUTION"
	| "INVALID_TIER_CAP"
	| "INVALID_CHARACTER_RECORD"
	| "REPOSITORY_WRITE_FAILED"
	| "FETCH_STATUS_EFFECTS_FAILED"
	| "ALREADY_INFECTED"
	| "PERSIST_STATUS_EFFECT_FAILED"
	| "EFFECT_NOT_FOUND"
	| "DELETE_STATUS_EFFECT_FAILED"
	| "RESURRECTION_BLOCKED"
	| "REPOSITORY_READ_FAILED";

export type CharacterFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface CharacterFailure {
	readonly code: CharacterFailureCode;
	readonly message: string;
	readonly details?: CharacterFailureDetails;
}

export type CharacterRepositoryFailureCode =
	| "CHARACTER_NOT_FOUND"
	| "CHARACTER_REPOSITORY_WRITE_FAILED"
	| "CORRUPTED_CHARACTER_RECORD";

export interface CharacterRepositoryFailure {
	readonly code: CharacterRepositoryFailureCode;
	readonly message: string;
	readonly details?: CharacterFailureDetails;
}

export type CharacterTier = 1 | 2 | 3 | 4;

export interface CharacterIdProvider {
	generate(): string;
}

export interface CharacterClock {
	now(): string;
}
