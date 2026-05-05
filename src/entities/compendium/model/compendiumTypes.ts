export type CompendiumFailureCode =
	| "INVALID_COMPENDIUM_ENTRY_ID"
	| "COMPENDIUM_ENTRY_NOT_FOUND"
	| "COMPENDIUM_REPOSITORY_READ_FAILED"
	| "CORRUPTED_COMPENDIUM_ENTRY";

export type CompendiumFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface CompendiumFailure {
	readonly code: CompendiumFailureCode;
	readonly message: string;
	readonly details?: CompendiumFailureDetails;
}

export type CompendiumRepositoryFailureCode =
	| "COMPENDIUM_ENTRY_NOT_FOUND"
	| "COMPENDIUM_REPOSITORY_READ_FAILED"
	| "CORRUPTED_COMPENDIUM_ENTRY";

export interface CompendiumRepositoryFailure {
	readonly code: CompendiumRepositoryFailureCode;
	readonly message: string;
	readonly details?: CompendiumFailureDetails;
}
