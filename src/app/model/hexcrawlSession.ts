import type { TrapRepository } from "$lib/entities/traps/domain/TrapRepository";
import {
	InMemoryWorldTileCatalogRepository,
	WORLD_TILE_CATALOG,
	type WorldTileRecord,
} from "$lib/entities/world-tile";
import {
	type HexcrawlMovementFailure,
	type HexcrawlMovementInput,
	type HexcrawlMovementResult,
	HexcrawlMovementService,
} from "$lib/features/hexcrawl-map";
import type { Result } from "$lib/shared/lib/result";

export interface HexcrawlSession {
	readonly createMovementInput: (
		currentTileId: string,
		targetTileId: string,
	) => HexcrawlMovementInput;
	readonly initialTileId: string;
	readonly moveParty: (
		input: unknown,
	) => Promise<Result<HexcrawlMovementResult, HexcrawlMovementFailure>>;
	readonly tiles: readonly WorldTileRecord[];
}

const TRAINING_PARTY_ID = "party-alpha";
const TRAINING_MOVEMENT_CREATED_AT = "2026-05-14T03:00:00.000Z";
const INITIAL_WORLD_TILE_ID = "camp-road";

export function createHexcrawlSession(
	trapRepository?: TrapRepository,
): HexcrawlSession {
	const repository = new InMemoryWorldTileCatalogRepository({
		worldTiles: WORLD_TILE_CATALOG,
	});
	const movementService = new HexcrawlMovementService(
		repository,
		undefined,
		trapRepository,
	);

	return {
		createMovementInput: (currentTileId, targetTileId) => ({
			partyId: TRAINING_PARTY_ID,
			currentTileId,
			targetTileId,
			createdAt: TRAINING_MOVEMENT_CREATED_AT,
		}),
		initialTileId: INITIAL_WORLD_TILE_ID,
		moveParty: (input) => movementService.moveParty(input),
		tiles: WORLD_TILE_CATALOG,
	};
}
