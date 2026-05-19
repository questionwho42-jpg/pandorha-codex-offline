import type {
	CampAssignmentRecord,
	CampSessionRecord,
} from "$lib/entities/camp-session";
import type { CharacterRecord } from "$lib/entities/character";
import type { ClockRecord } from "$lib/entities/clock";
import type { WorldStateFlagView } from "$lib/entities/world-state";

export interface SaveLoadMessageIdProvider {
	generate(): string;
}

export interface SaveSessionResult {
	readonly saveId: "primary";
	readonly version: 2;
	readonly savedAt: string;
	readonly characterCount: number;
	readonly worldStateCount: number;
	readonly clockCount: number;
	readonly campSessionCount: number;
	readonly campAssignmentCount: number;
}

export interface LoadedSessionState {
	readonly version: 2;
	readonly savedAt: string;
	readonly characters: readonly CharacterRecord[];
	readonly worldState: readonly WorldStateFlagView[];
	readonly clocks: readonly ClockRecord[];
	readonly campSessions: readonly CampSessionRecord[];
	readonly campAssignments: readonly CampAssignmentRecord[];
}

export type SaveLoadFailureCode =
	| "INVALID_SAVE_SESSION_INPUT"
	| "SAVE_WORKER_FAILED"
	| "LOAD_WORKER_FAILED"
	| "INVALID_SAVE_WORKER_RESPONSE"
	| "CORRUPTED_SAVE_SNAPSHOT"
	| "PENDING_SAVE_MIGRATION";

export interface SaveLoadFailure {
	readonly code: SaveLoadFailureCode;
	readonly message: string;
	readonly details?: unknown;
}
