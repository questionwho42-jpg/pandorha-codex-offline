export type CampActivityFailureCode =
	| "INVALID_CAMP_ACTIVITY_ID"
	| "CAMP_ACTIVITY_NOT_FOUND"
	| "CAMP_ACTIVITY_REPOSITORY_READ_FAILED"
	| "CORRUPTED_CAMP_ACTIVITY_RECORD";

export interface CampActivityFailure {
	readonly code: CampActivityFailureCode;
	readonly message: string;
	readonly details?: unknown;
}

export type CampActivityRepositoryFailureCode =
	| "CAMP_ACTIVITY_NOT_FOUND"
	| "CAMP_ACTIVITY_REPOSITORY_READ_FAILED"
	| "CORRUPTED_CAMP_ACTIVITY_RECORD";

export interface CampActivityRepositoryFailure {
	readonly code: CampActivityRepositoryFailureCode;
	readonly message: string;
	readonly details?: unknown;
}
