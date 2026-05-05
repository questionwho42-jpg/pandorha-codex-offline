export type BackgroundFailureCode =
	| "INVALID_BACKGROUND_ID"
	| "BACKGROUND_NOT_FOUND"
	| "BACKGROUND_REPOSITORY_READ_FAILED"
	| "CORRUPTED_BACKGROUND_RECORD";

export type BackgroundFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface BackgroundFailure {
	readonly code: BackgroundFailureCode;
	readonly message: string;
	readonly details?: BackgroundFailureDetails;
}

export type BackgroundRepositoryFailureCode =
	| "BACKGROUND_NOT_FOUND"
	| "BACKGROUND_REPOSITORY_READ_FAILED"
	| "CORRUPTED_BACKGROUND_RECORD";

export interface BackgroundRepositoryFailure {
	readonly code: BackgroundRepositoryFailureCode;
	readonly message: string;
	readonly details?: BackgroundFailureDetails;
}
