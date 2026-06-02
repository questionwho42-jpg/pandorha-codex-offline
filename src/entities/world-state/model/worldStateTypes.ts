export type WorldStateKeyPrefix =
	| "location"
	| "npc"
	| "plot"
	| "system"
	| "engine";
export type WorldStateValue =
	| string
	| number
	| boolean
	| null
	| readonly WorldStateValue[]
	| { readonly [key: string]: WorldStateValue };

export interface WorldStateFlagView {
	readonly key: string;
	readonly value: WorldStateValue;
	readonly updatedAt: string;
}

export type WorldStateFailureCode =
	| "INVALID_WORLD_STATE_INPUT"
	| "WORLD_STATE_NAMESPACE_READ_ONLY"
	| "CORRUPTED_WORLD_STATE_RECORD"
	| WorldStateRepositoryFailureCode;

export type WorldStateRepositoryFailureCode =
	| "WORLD_STATE_FLAG_NOT_FOUND"
	| "WORLD_STATE_REPOSITORY_READ_FAILED"
	| "WORLD_STATE_REPOSITORY_WRITE_FAILED"
	| "WORLD_STATE_REPOSITORY_LOOKUP_FAILED";

export interface WorldStateFailure {
	readonly code: WorldStateFailureCode;
	readonly message: string;
	readonly details?: unknown;
}

export interface WorldStateRepositoryFailure {
	readonly code: WorldStateRepositoryFailureCode;
	readonly message: string;
	readonly details?: unknown;
}
