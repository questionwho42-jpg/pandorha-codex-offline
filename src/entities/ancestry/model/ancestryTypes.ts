export type AncestryFailureCode =
	| "INVALID_ANCESTRY_ID"
	| "ANCESTRY_NOT_FOUND"
	| "ANCESTRY_REPOSITORY_READ_FAILED"
	| "CORRUPTED_ANCESTRY_RECORD";

export type AncestryFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface AncestryFailure {
	readonly code: AncestryFailureCode;
	readonly message: string;
	readonly details?: AncestryFailureDetails;
}

export type AncestryRepositoryFailureCode =
	| "ANCESTRY_NOT_FOUND"
	| "ANCESTRY_REPOSITORY_READ_FAILED"
	| "CORRUPTED_ANCESTRY_RECORD";

export interface AncestryRepositoryFailure {
	readonly code: AncestryRepositoryFailureCode;
	readonly message: string;
	readonly details?: AncestryFailureDetails;
}

export type AncestryTraitFailureCode =
	| "INVALID_ANCESTRY_ID"
	| "INVALID_ANCESTRY_TRAIT_SELECTION"
	| "DUPLICATE_ANCESTRY_TRAIT_SELECTION"
	| "ANCESTRY_TRAIT_NOT_FOUND"
	| "ANCESTRY_TRAIT_ANCESTRY_MISMATCH"
	| "ANCESTRY_TRAIT_REPOSITORY_READ_FAILED"
	| "CORRUPTED_ANCESTRY_TRAIT_RECORD"
	| "CORRUPTED_ANCESTRY_TRAIT_LINK";

export interface AncestryTraitFailure {
	readonly code: AncestryTraitFailureCode;
	readonly message: string;
	readonly details?: AncestryFailureDetails;
}

export type AncestryTraitRepositoryFailureCode =
	| "ANCESTRY_TRAIT_NOT_FOUND"
	| "ANCESTRY_TRAIT_REPOSITORY_READ_FAILED"
	| "CORRUPTED_ANCESTRY_TRAIT_RECORD"
	| "CORRUPTED_ANCESTRY_TRAIT_LINK";

export interface AncestryTraitRepositoryFailure {
	readonly code: AncestryTraitRepositoryFailureCode;
	readonly message: string;
	readonly details?: AncestryFailureDetails;
}
