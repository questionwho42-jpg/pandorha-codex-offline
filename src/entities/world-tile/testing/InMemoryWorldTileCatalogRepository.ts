import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { WorldTileCatalogRepository } from "../domain/WorldTileCatalogRepository";
import { WORLD_TILE_CATALOG } from "../model/worldTileCatalog";
import {
	type WorldTileCoordinates,
	type WorldTileId,
	type WorldTileRecord,
	worldTileSelectSchema,
} from "../model/worldTileSchema";
import type { WorldTileRepositoryFailure } from "../model/worldTileTypes";

interface InMemoryWorldTileCatalogInput {
	readonly worldTiles: readonly WorldTileRecord[];
}

export class InMemoryWorldTileCatalogRepository
	implements WorldTileCatalogRepository
{
	private readonly recordsById = new Map<WorldTileId, WorldTileRecord>();
	private readonly recordsByCoordinates = new Map<string, WorldTileRecord>();
	private nextListFailure: WorldTileRepositoryFailure | null = null;
	private nextIdLookupFailure: WorldTileRepositoryFailure | null = null;
	private nextCoordinatesLookupFailure: WorldTileRepositoryFailure | null =
		null;
	public idLookupCount = 0;
	public coordinatesLookupCount = 0;

	public constructor(
		input: InMemoryWorldTileCatalogInput = { worldTiles: WORLD_TILE_CATALOG },
	) {
		for (const record of input.worldTiles) {
			const parsed = worldTileSelectSchema.safeParse(record);
			if (parsed.success) {
				this.recordsById.set(parsed.data.id, parsed.data);
				this.recordsByCoordinates.set(
					createCoordinatesKey(parsed.data),
					parsed.data,
				);
			}
		}
	}

	public async listWorldTiles(): Promise<
		Result<readonly WorldTileRecord[], WorldTileRepositoryFailure>
	> {
		if (this.nextListFailure) {
			const failure = this.nextListFailure;
			this.nextListFailure = null;
			return fail(failure);
		}

		return ok(Array.from(this.recordsById.values()));
	}

	public async findWorldTileById(
		id: WorldTileId,
	): Promise<Result<WorldTileRecord, WorldTileRepositoryFailure>> {
		this.idLookupCount += 1;

		if (this.nextIdLookupFailure) {
			const failure = this.nextIdLookupFailure;
			this.nextIdLookupFailure = null;
			return fail(failure);
		}

		const record = this.recordsById.get(id);
		if (!record) {
			return fail({
				code: "WORLD_TILE_NOT_FOUND",
				message: "World tile record was not found in memory.",
				details: { id },
			});
		}

		return ok(record);
	}

	public async findWorldTileByCoordinates(
		coordinates: WorldTileCoordinates,
	): Promise<Result<WorldTileRecord, WorldTileRepositoryFailure>> {
		this.coordinatesLookupCount += 1;

		if (this.nextCoordinatesLookupFailure) {
			const failure = this.nextCoordinatesLookupFailure;
			this.nextCoordinatesLookupFailure = null;
			return fail(failure);
		}

		const record = this.recordsByCoordinates.get(
			createCoordinatesKey(coordinates),
		);
		if (!record) {
			return fail({
				code: "WORLD_TILE_NOT_FOUND",
				message: "World tile record was not found by axial coordinates.",
				details: coordinates,
			});
		}

		return ok(record);
	}

	public failNextList(failure: WorldTileRepositoryFailure): void {
		this.nextListFailure = failure;
	}

	public failNextIdLookup(failure: WorldTileRepositoryFailure): void {
		this.nextIdLookupFailure = failure;
	}

	public failNextCoordinatesLookup(failure: WorldTileRepositoryFailure): void {
		this.nextCoordinatesLookupFailure = failure;
	}
}

function createCoordinatesKey(coordinates: WorldTileCoordinates): string {
	return `${coordinates.q},${coordinates.r}`;
}
