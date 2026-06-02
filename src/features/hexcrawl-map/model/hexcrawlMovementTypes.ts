import type { WorldTileRecord } from "$lib/entities/world-tile";

export type HexcrawlDirection =
	| "north"
	| "northeast"
	| "southeast"
	| "south"
	| "southwest"
	| "northwest";

export type HexcrawlMovementEventType =
	| "party-moved"
	| "world-tile-discovered"
	| "encounter-check-pending";

export type HexcrawlMovementEvent = {
	readonly type: HexcrawlMovementEventType;
	readonly message: string;
	readonly tileId: string;
	readonly createdAt: string;
};

export type HexcrawlMovementResult = {
	readonly partyId: string;
	readonly fromTile: WorldTileRecord;
	readonly toTile: WorldTileRecord;
	readonly direction: HexcrawlDirection;
	readonly discoveredTile: boolean;
	readonly encounterCheckPending: boolean;
	readonly events: readonly HexcrawlMovementEvent[];
};

export type HexcrawlMovementFailureCode =
	| "INVALID_HEXCRAWL_MOVEMENT_INPUT"
	| "WORLD_TILE_LOOKUP_FAILED"
	| "NON_ADJACENT_WORLD_TILE"
	| "BLOCKED_WORLD_TILE";

export type HexcrawlMovementFailure = {
	readonly code: HexcrawlMovementFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
};
