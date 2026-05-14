export type WorldTileFailureCode =
	| "INVALID_WORLD_TILE_ID"
	| "INVALID_WORLD_TILE_COORDINATES"
	| "WORLD_TILE_NOT_FOUND"
	| "CORRUPTED_WORLD_TILE_RECORD"
	| WorldTileRepositoryFailureCode;

export type WorldTileRepositoryFailureCode =
	| "WORLD_TILE_NOT_FOUND"
	| "WORLD_TILE_REPOSITORY_READ_FAILED"
	| "WORLD_TILE_REPOSITORY_LOOKUP_FAILED";

export type WorldTileFailure = {
	readonly code: WorldTileFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
};

export type WorldTileRepositoryFailure = {
	readonly code: WorldTileRepositoryFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
};
