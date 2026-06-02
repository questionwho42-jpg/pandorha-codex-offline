export type DialogueTreeFailureCode =
	| "INVALID_DIALOGUE_NODE_ID"
	| "INVALID_DIALOGUE_OPTION_ID"
	| "INVALID_NPC_ID"
	| "MISSING_DIALOGUE_NODE"
	| "CORRUPTED_DIALOGUE_NODE_RECORD"
	| "CORRUPTED_DIALOGUE_OPTION_RECORD"
	| "REPOSITORY_FAILURE";

export type DialogueTreeFailure = {
	readonly code: DialogueTreeFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
};
