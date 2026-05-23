export type JsonValue =
	| string
	| number
	| boolean
	| null
	| readonly JsonValue[]
	| { readonly [key: string]: JsonValue };

export type JsonObject = { readonly [key: string]: JsonValue };

export type RpcCommandType =
	| "INIT_DATABASE"
	| "SAVE_GAME_SNAPSHOT"
	| "LOAD_GAME_SNAPSHOT"
	| "SAVE_CHARACTER"
	| "FIND_CHARACTER"
	| "SAVE_STATUS_EFFECT"
	| "FIND_STATUS_EFFECTS"
	| "DELETE_STATUS_EFFECT"
	| "SAVE_BASTION"
	| "FIND_BASTION"
	| "SAVE_BASTION_MODULE"
	| "FIND_BASTION_MODULES"
	| "DELETE_BASTION_MODULE"
	| "SAVE_FACTION"
	| "FIND_FACTION"
	| "LIST_FACTIONS"
	| "SAVE_REPUTATION"
	| "FIND_REPUTATION"
	| "LIST_REPUTATIONS"
	| "SAVE_BLOOD_DEBT"
	| "LIST_BLOOD_DEBTS"
	| "SAVE_CLOCK"
	| "FIND_CLOCK"
	| "LIST_CLOCKS"
	| "DELETE_CLOCK"
	| "SAVE_DIALOGUE_STATE"
	| "FIND_DIALOGUE_STATE"
	| "DELETE_DIALOGUE_STATE"
	| "SAVE_QUEST"
	| "FIND_QUEST"
	| "LIST_QUESTS"
	| "DELETE_QUEST"
	| "SAVE_COHESION"
	| "FIND_COHESION"
	| "SAVE_SIGNATURE"
	| "FIND_SIGNATURE"
	| "LIST_SIGNATURES"
	| "DELETE_SIGNATURE"
	| "SAVE_TRAP"
	| "FIND_TRAP"
	| "LIST_TRAPS"
	| "DELETE_TRAP";

export type RpcBridgeFailureCode =
	| "INVALID_RPC_REQUEST"
	| "RPC_RESPONSE_NOT_QUEUED"
	| "INVALID_RPC_RESPONSE"
	| "RPC_MESSAGE_ID_MISMATCH";

export interface RpcBridgeFailure {
	readonly code: RpcBridgeFailureCode;
	readonly message: string;
	readonly details?: unknown;
}
