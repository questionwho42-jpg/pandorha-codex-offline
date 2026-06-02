export type FactionFailureCode =
	| "INVALID_FACTION_ID"
	| "FACTION_NOT_FOUND"
	| "FACTION_STANDING_NOT_FOUND"
	| "FACTION_REPOSITORY_READ_FAILED"
	| "CORRUPTED_FACTION_RECORD"
	| "CORRUPTED_FACTION_STANDING_RECORD";

export type FactionFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface FactionFailure {
	readonly code: FactionFailureCode;
	readonly message: string;
	readonly details?: FactionFailureDetails;
}

export type FactionRepositoryFailureCode =
	| "FACTION_NOT_FOUND"
	| "FACTION_STANDING_NOT_FOUND"
	| "FACTION_REPOSITORY_READ_FAILED"
	| "CORRUPTED_FACTION_RECORD"
	| "CORRUPTED_FACTION_STANDING_RECORD";

export interface FactionRepositoryFailure {
	readonly code: FactionRepositoryFailureCode;
	readonly message: string;
	readonly details?: FactionFailureDetails;
}
