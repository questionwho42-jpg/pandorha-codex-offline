export type CharacterClassFailureCode =
	| "INVALID_CHARACTER_CLASS_ID"
	| "CHARACTER_CLASS_NOT_FOUND"
	| "CHARACTER_CLASS_REPOSITORY_READ_FAILED"
	| "CORRUPTED_CHARACTER_CLASS_RECORD";

export type CharacterClassFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface CharacterClassFailure {
	readonly code: CharacterClassFailureCode;
	readonly message: string;
	readonly details?: CharacterClassFailureDetails;
}

export type CharacterClassRepositoryFailureCode =
	| "CHARACTER_CLASS_NOT_FOUND"
	| "CHARACTER_CLASS_REPOSITORY_READ_FAILED"
	| "CORRUPTED_CHARACTER_CLASS_RECORD";

export interface CharacterClassRepositoryFailure {
	readonly code: CharacterClassRepositoryFailureCode;
	readonly message: string;
	readonly details?: CharacterClassFailureDetails;
}
