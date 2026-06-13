export interface SiegeRepositoryFailure {
	code:
		| "SIEGE_REPOSITORY_WRITE_FAILED"
		| "SIEGE_REPOSITORY_READ_FAILED"
		| "SIEGE_NOT_FOUND"
		| "CORRUPTED_SIEGE_RECORD"
		| "EVENT_HISTORY_WRITE_FAILED";
	message: string;
	details?: unknown;
}

export interface SiegeServiceFailure {
	code:
		| "NO_ACTIVE_BASTION"
		| "NO_ACTIVE_SIEGE"
		| "SIEGE_ALREADY_ACTIVE"
		| "SIEGE_RESOLUTION_FAILED"
		| "INVALID_SIEGE_INPUT"
		| "REPOSITORY_ERROR";
	message: string;
	details?: unknown;
}
