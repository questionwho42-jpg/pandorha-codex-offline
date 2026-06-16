import type { DatabaseFileFailure } from "$lib/shared/persistence";

export interface SaveSnapshotResult {
	readonly saveId: "primary";
	readonly version: 7;
	readonly savedAt: string;
	readonly characterCount: number;
	readonly worldStateCount: number;
	readonly clockCount: number;
	readonly campSessionCount: number;
	readonly campAssignmentCount: number;
	readonly factionStandingCount: number;
	readonly socialEncounterCount: number;
	readonly socialEncounterEventCount: number;
	readonly npcRelationshipCount: number;
	readonly inventoryEventCount: number;
	readonly equipmentLoadoutEventCount: number;
}

export type SaveSnapshotFailureCode =
	| "INVALID_SAVE_SNAPSHOT"
	| "SAVE_NOT_FOUND"
	| "DATABASE_NOT_INITIALIZED"
	| DatabaseFileFailure["code"]
	| "SQLITE_WASM_INIT_FAILED"
	| "CORRUPTED_DATABASE_FILE"
	| "SQLITE_SNAPSHOT_WRITE_FAILED"
	| "CORRUPTED_SAVE_SNAPSHOT"
	| "SQLITE_EXPORT_FAILED";

export interface SaveSnapshotFailure {
	readonly code: SaveSnapshotFailureCode;
	readonly message: string;
	readonly details?: unknown;
}
