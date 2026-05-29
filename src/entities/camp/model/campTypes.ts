export interface CampRepositoryFailure {
	readonly code:
		| "CAMP_REPOSITORY_WRITE_FAILED"
		| "CAMP_SESSION_NOT_FOUND"
		| "CORRUPTED_CAMP_SESSION_RECORD";
	readonly message: string;
	readonly details?: Record<string, string>;
}

export interface CampFailure {
	readonly code:
		| "INVALID_CAMP_INPUT"
		| "CAMP_SESSION_NOT_FOUND"
		| "REPOSITORY_WRITE_FAILED";
	readonly message: string;
}
