export type NpcFailureCode =
	| "INVALID_NPC_ID"
	| "INVALID_FACTION_ID"
	| "MISSING_NPC"
	| "CORRUPTED_NPC_RECORD"
	| "REPOSITORY_FAILURE";

export type NpcFailure = {
	readonly code: NpcFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
};
