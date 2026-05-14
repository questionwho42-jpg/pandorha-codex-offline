import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { ok } from "$lib/shared/lib/result";
import type { WorldTileCatalogRepository } from "../domain/WorldTileCatalogRepository";
import { WorldTileCatalogService } from "../domain/WorldTileCatalogService";
import { WORLD_TILE_CATALOG } from "../model/worldTileCatalog";
import {
	type WorldTileRecord,
	worldTileSelectSchema,
} from "../model/worldTileSchema";
import type {
	WorldTileFailure,
	WorldTileRepositoryFailure,
} from "../model/worldTileTypes";
import { InMemoryWorldTileCatalogRepository } from "../testing/InMemoryWorldTileCatalogRepository";

describe("Official world tile catalog", () => {
	it("contains a validated center tile and six axial neighbors", () => {
		expect(WORLD_TILE_CATALOG).toHaveLength(7);
		expect(WORLD_TILE_CATALOG.map((tile) => tile.id)).toEqual([
			"camp-road",
			"north-pines",
			"northeast-watch",
			"southeast-ruins",
			"south-marsh",
			"southwest-barrow",
			"northwest-ridge",
		]);

		for (const tile of WORLD_TILE_CATALOG) {
			expect(worldTileSelectSchema.safeParse(tile).success).toBe(true);
			expect(tile.id).toMatch(/^[a-z][a-z0-9-]*$/);
			expect(tile.regionTier).toBeGreaterThanOrEqual(1);
			expect(tile.regionTier).toBeLessThanOrEqual(4);
		}
	});

	it("keeps every axial coordinate unique", () => {
		const coordinateKeys = WORLD_TILE_CATALOG.map(
			(tile) => `${tile.q},${tile.r}`,
		);

		expect(new Set(coordinateKeys).size).toBe(WORLD_TILE_CATALOG.length);
	});

	it("uses the official 1d6 drift direction order around the center", () => {
		expect(WORLD_TILE_CATALOG.map(({ id, q, r }) => ({ id, q, r }))).toEqual([
			{ id: "camp-road", q: 0, r: 0 },
			{ id: "north-pines", q: 0, r: -1 },
			{ id: "northeast-watch", q: 1, r: -1 },
			{ id: "southeast-ruins", q: 1, r: 0 },
			{ id: "south-marsh", q: 0, r: 1 },
			{ id: "southwest-barrow", q: -1, r: 1 },
			{ id: "northwest-ridge", q: -1, r: 0 },
		]);
	});
});

describe("WorldTileCatalogService", () => {
	it("lists validated world tile records from the repository", async () => {
		const service = createService();

		const result = await service.listWorldTiles();
		const tiles = expectWorldTileSuccess(result);

		expect(tiles).toHaveLength(7);
		expect(tiles[0]).toMatchObject({
			id: "camp-road",
			label: "Estrada do Acampamento",
			q: 0,
			r: 0,
			isMapped: true,
		});
	});

	it("finds a tile by its English technical id", async () => {
		const service = createService();

		const result = await service.findWorldTileById("southeast-ruins");
		const tile = expectWorldTileSuccess(result);

		expect(tile).toMatchObject({
			id: "southeast-ruins",
			label: "Ruínas Baixas",
			q: 1,
			r: 0,
			encounterSignal: "check",
			sourceFile: "docs/system/survival/c-dex-de-hexcrawl-e-explora-o.md",
		});
	});

	it("finds a tile by validated axial coordinates", async () => {
		const service = createService();

		const result = await service.findWorldTileByCoordinates({ q: -1, r: 0 });
		const tile = expectWorldTileSuccess(result);

		expect(tile).toMatchObject({
			id: "northwest-ridge",
			label: "Crista do Vento",
		});
	});

	it("rejects invalid ids and coordinates before asking the repository", async () => {
		const repository = createRepository();
		const service = new WorldTileCatalogService(repository);

		const idFailure = expectWorldTileFailure(
			await service.findWorldTileById("Estrada"),
		);
		const coordinateFailure = expectWorldTileFailure(
			await service.findWorldTileByCoordinates({ q: 0.5, r: 0 }),
		);

		expect(idFailure.code).toBe("INVALID_WORLD_TILE_ID");
		expect(coordinateFailure.code).toBe("INVALID_WORLD_TILE_COORDINATES");
		expect(repository.idLookupCount).toBe(0);
		expect(repository.coordinatesLookupCount).toBe(0);
	});

	it("returns not found for missing ids and coordinates", async () => {
		const service = createService();

		expect(
			expectWorldTileFailure(
				await service.findWorldTileById("missing-world-tile"),
			).code,
		).toBe("WORLD_TILE_NOT_FOUND");
		expect(
			expectWorldTileFailure(
				await service.findWorldTileByCoordinates({ q: 5, r: 5 }),
			).code,
		).toBe("WORLD_TILE_NOT_FOUND");
	});

	it("maps repository failures into service failures", async () => {
		const repository = createRepository();
		repository.failNextList({
			code: "WORLD_TILE_REPOSITORY_READ_FAILED",
			message: "Injected world tile list failure.",
			details: { cause: "locked-world-tile-catalog" },
		});
		repository.failNextIdLookup({
			code: "WORLD_TILE_REPOSITORY_LOOKUP_FAILED",
			message: "Injected world tile id lookup failure.",
			details: { cause: "locked-world-tile-entry" },
		});
		repository.failNextCoordinatesLookup({
			code: "WORLD_TILE_REPOSITORY_LOOKUP_FAILED",
			message: "Injected world tile coordinate lookup failure.",
			details: { cause: "locked-world-tile-coordinates" },
		});
		const service = new WorldTileCatalogService(repository);

		expect(
			expectWorldTileFailure(await service.listWorldTiles()),
		).toMatchObject({
			code: "WORLD_TILE_REPOSITORY_READ_FAILED",
			details: { cause: "locked-world-tile-catalog" },
		});
		expect(
			expectWorldTileFailure(await service.findWorldTileById("camp-road")),
		).toMatchObject({
			code: "WORLD_TILE_REPOSITORY_LOOKUP_FAILED",
			details: { cause: "locked-world-tile-entry" },
		});
		expect(
			expectWorldTileFailure(
				await service.findWorldTileByCoordinates({ q: 0, r: 0 }),
			),
		).toMatchObject({
			code: "WORLD_TILE_REPOSITORY_LOOKUP_FAILED",
			details: { cause: "locked-world-tile-coordinates" },
		});
	});

	it("rejects corrupted records returned by the repository", async () => {
		const service = new WorldTileCatalogService(
			new CorruptWorldTileRepository(),
		);

		expect(expectWorldTileFailure(await service.listWorldTiles()).code).toBe(
			"CORRUPTED_WORLD_TILE_RECORD",
		);
		expect(
			expectWorldTileFailure(await service.findWorldTileById("camp-road")).code,
		).toBe("CORRUPTED_WORLD_TILE_RECORD");
		expect(
			expectWorldTileFailure(
				await service.findWorldTileByCoordinates({ q: 0, r: 0 }),
			).code,
		).toBe("CORRUPTED_WORLD_TILE_RECORD");
	});
});

function createRepository(): InMemoryWorldTileCatalogRepository {
	return new InMemoryWorldTileCatalogRepository({
		worldTiles: WORLD_TILE_CATALOG,
	});
}

function createService(): WorldTileCatalogService {
	return new WorldTileCatalogService(createRepository());
}

function expectWorldTileSuccess<Success>(
	result: Result<Success, WorldTileFailure>,
): Success {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectWorldTileFailure<Success>(
	result: Result<Success, WorldTileFailure>,
): WorldTileFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class CorruptWorldTileRepository implements WorldTileCatalogRepository {
	public async listWorldTiles(): Promise<
		Result<readonly WorldTileRecord[], WorldTileRepositoryFailure>
	> {
		return ok([
			{
				...WORLD_TILE_CATALOG[0],
				label: "",
			} as WorldTileRecord,
		]);
	}

	public async findWorldTileById(): Promise<
		Result<WorldTileRecord, WorldTileRepositoryFailure>
	> {
		return ok({
			...WORLD_TILE_CATALOG[0],
			regionTier: 99,
		} as WorldTileRecord);
	}

	public async findWorldTileByCoordinates(): Promise<
		Result<WorldTileRecord, WorldTileRepositoryFailure>
	> {
		return ok({
			...WORLD_TILE_CATALOG[0],
			encounterSignal: "monster",
		} as unknown as WorldTileRecord);
	}
}
