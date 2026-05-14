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
	| "LOAD_GAME_SNAPSHOT";

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
