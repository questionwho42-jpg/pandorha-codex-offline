export type InvestigationFailureCode =
	| "INVALID_INVESTIGATION_INPUT"
	| "INVALID_INVESTIGATION_RECORD"
	| "INVESTIGATION_ALREADY_EXISTS"
	| "INVESTIGATION_NOT_ACTIVE"
	| "INVESTIGATION_FINISHED"
	| "INSUFFICIENT_FUNDS"
	| "INSUFFICIENT_VIGOR"
	| "INSUFFICIENT_EE"
	| "REPOSITORY_WRITE_FAILED"
	| "NARRATIVE_FLAG_FAILED";

export type InvestigationFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface InvestigationFailure {
	readonly code: InvestigationFailureCode;
	readonly message: string;
	readonly details?: InvestigationFailureDetails;
}

export type InvestigationRepositoryFailureCode =
	| "INVESTIGATION_NOT_FOUND"
	| "INVESTIGATION_REPOSITORY_WRITE_FAILED"
	| "CORRUPTED_INVESTIGATION_RECORD";

export interface InvestigationRepositoryFailure {
	readonly code: InvestigationRepositoryFailureCode;
	readonly message: string;
	readonly details?: InvestigationFailureDetails;
}

export interface InvestigationIdProvider {
	generate(): string;
}

export interface InvestigationClock {
	now(): string;
}
