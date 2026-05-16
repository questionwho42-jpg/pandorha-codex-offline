export type ClockFailureCode =
	| "INVALID_CLOCK_INPUT"
	| "CLOCK_SLICE_OVERFLOW"
	| "CORRUPTED_CLOCK_RECORD"
	| ClockRepositoryFailureCode;

export type ClockRepositoryFailureCode =
	| "CLOCK_NOT_FOUND"
	| "CLOCK_REPOSITORY_WRITE_FAILED"
	| "CLOCK_REPOSITORY_LOOKUP_FAILED";

export interface ClockFailure {
	readonly code: ClockFailureCode;
	readonly message: string;
	readonly details?: unknown;
}

export interface ClockRepositoryFailure {
	readonly code: ClockRepositoryFailureCode;
	readonly message: string;
	readonly details?: unknown;
}
