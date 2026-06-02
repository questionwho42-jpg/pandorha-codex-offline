import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type WorldTileRecord,
	worldTileCoordinatesSchema,
	worldTileIdSchema,
	worldTileSelectSchema,
} from "../model/worldTileSchema";
import type { WorldTileFailure } from "../model/worldTileTypes";
import type { WorldTileCatalogRepository } from "./WorldTileCatalogRepository";

/**
 * @description Read-only catalog for the minimal hexcrawl axial map. It does not persist world state, roll navigation, generate encounters, or mutate explored tiles.
 * @rule docs/architecture/blueprint.md - hexcrawl uses world_tiles with axial q/r coordinates and region_tier.
 * @rule docs/system/survival/c-dex-de-hexcrawl-e-explora-o.md - drift directions use the 1d6 order N, NE, SE, S, SW, NW.
 */
export class WorldTileCatalogService {
	public constructor(private readonly repository: WorldTileCatalogRepository) {}

	public async listWorldTiles(): Promise<
		Result<readonly WorldTileRecord[], WorldTileFailure>
	> {
		const listed = await this.repository.listWorldTiles();
		if (!listed.success) {
			return fail(listed.error);
		}

		return validateWorldTileRecords(listed.data);
	}

	public async findWorldTileById(
		id: unknown,
	): Promise<Result<WorldTileRecord, WorldTileFailure>> {
		const parsedId = worldTileIdSchema.safeParse(id);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_WORLD_TILE_ID",
				message: "World tile id does not match the catalog id format.",
				details: { issues: formatIssues(parsedId.error.issues) },
			});
		}

		const found = await this.repository.findWorldTileById(parsedId.data);
		if (!found.success) {
			return fail(found.error);
		}

		return validateWorldTileRecord(found.data);
	}

	public async findWorldTileByCoordinates(
		input: unknown,
	): Promise<Result<WorldTileRecord, WorldTileFailure>> {
		const parsedCoordinates = worldTileCoordinatesSchema.safeParse(input);
		if (!parsedCoordinates.success) {
			return fail({
				code: "INVALID_WORLD_TILE_COORDINATES",
				message: "World tile coordinates must be integer axial q/r values.",
				details: { issues: formatIssues(parsedCoordinates.error.issues) },
			});
		}

		const found = await this.repository.findWorldTileByCoordinates(
			parsedCoordinates.data,
		);
		if (!found.success) {
			return fail(found.error);
		}

		return validateWorldTileRecord(found.data);
	}
}

function validateWorldTileRecords(
	records: readonly WorldTileRecord[],
): Result<readonly WorldTileRecord[], WorldTileFailure> {
	const validated: WorldTileRecord[] = [];
	for (const record of records) {
		const parsed = worldTileSelectSchema.safeParse(record);
		if (!parsed.success) {
			return fail({
				code: "CORRUPTED_WORLD_TILE_RECORD",
				message: "World tile record failed output validation.",
				details: { issues: formatIssues(parsed.error.issues) },
			});
		}

		validated.push(parsed.data);
	}

	return ok(validated);
}

function validateWorldTileRecord(
	record: WorldTileRecord,
): Result<WorldTileRecord, WorldTileFailure> {
	const parsedRecord = worldTileSelectSchema.safeParse(record);
	if (!parsedRecord.success) {
		return fail({
			code: "CORRUPTED_WORLD_TILE_RECORD",
			message: "World tile record failed output validation.",
			details: { issues: formatIssues(parsedRecord.error.issues) },
		});
	}

	return ok(parsedRecord.data);
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
