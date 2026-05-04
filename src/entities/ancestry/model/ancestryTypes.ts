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
