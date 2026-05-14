import type { Result } from "$lib/shared/lib/result";
import type {
	WorldTileCoordinates,
	WorldTileId,
	WorldTileRecord,
} from "../model/worldTileSchema";
import type { WorldTileRepositoryFailure } from "../model/worldTileTypes";

export type WorldTileCatalogRepository = {
	readonly listWorldTiles: () => Promise<
		Result<readonly WorldTileRecord[], WorldTileRepositoryFailure>
	>;
	readonly findWorldTileById: (
		id: WorldTileId,
	) => Promise<Result<WorldTileRecord, WorldTileRepositoryFailure>>;
	readonly findWorldTileByCoordinates: (
		coordinates: WorldTileCoordinates,
	) => Promise<Result<WorldTileRecord, WorldTileRepositoryFailure>>;
};
