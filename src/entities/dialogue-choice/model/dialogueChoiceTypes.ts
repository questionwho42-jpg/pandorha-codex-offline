export type DialogueChoiceFailureCode =
	| "INVALID_DIALOGUE_CHOICE_ID"
	| "INVALID_DIALOGUE_CHOICE_TAG"
	| "MISSING_DIALOGUE_CHOICE"
	| "CORRUPTED_DIALOGUE_CHOICE_RECORD"
	| "REPOSITORY_FAILURE";

export type DialogueChoiceFailure = {
	readonly code: DialogueChoiceFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
};
