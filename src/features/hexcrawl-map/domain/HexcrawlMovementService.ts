import type {
	WorldTileCatalogRepository,
	WorldTileRecord,
} from "$lib/entities/world-tile";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	formatHexcrawlMovementIssues,
	type HexcrawlMovementInput,
	hexcrawlMovementInputSchema,
} from "../model/hexcrawlMovementSchemas";
import type {
	HexcrawlDirection,
	HexcrawlMovementFailure,
	HexcrawlMovementResult,
} from "../model/hexcrawlMovementTypes";

/**
 * @description Resolves the minimal hexcrawl training movement between adjacent axial world tiles.
 * @rule docs/system/survival/c-dex-de-hexcrawl-e-explora-o.md - exploration movement targets adjacent hexes and drift directions follow N, NE, SE, S, SW, NW.
 */
export class HexcrawlMovementService {
	public constructor(
		private readonly tileRepository: WorldTileCatalogRepository,
	) {}

	public async moveParty(
		input: unknown,
	): Promise<Result<HexcrawlMovementResult, HexcrawlMovementFailure>> {
		const parsedInput = hexcrawlMovementInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return fail({
				code: "INVALID_HEXCRAWL_MOVEMENT_INPUT",
				message: "Hexcrawl movement input is invalid.",
				details: {
					issues: formatHexcrawlMovementIssues(parsedInput.error.issues),
				},
			});
		}

		const currentTile = await this.findTile(
			parsedInput.data.currentTileId,
			"current",
		);
		if (!currentTile.success) {
			return fail(currentTile.error);
		}

		const targetTile = await this.findTile(
			parsedInput.data.targetTileId,
			"target",
		);
		if (!targetTile.success) {
			return fail(targetTile.error);
		}

		const direction = getAdjacentDirection(currentTile.data, targetTile.data);
		if (!direction) {
			return fail({
				code: "NON_ADJACENT_WORLD_TILE",
				message: "Target world tile is not adjacent to the current tile.",
				details: {
					currentTileId: currentTile.data.id,
					targetTileId: targetTile.data.id,
				},
			});
		}

		if (targetTile.data.isBlocked) {
			return fail({
				code: "BLOCKED_WORLD_TILE",
				message: "Target world tile is blocked for this training movement.",
				details: { targetTileId: targetTile.data.id },
			});
		}

		return ok(
			createMovementResult(
				parsedInput.data,
				currentTile.data,
				targetTile.data,
				direction,
			),
		);
	}

	private async findTile(
		id: string,
		role: "current" | "target",
	): Promise<Result<WorldTileRecord, HexcrawlMovementFailure>> {
		const found = await this.tileRepository.findWorldTileById(id);
		if (!found.success) {
			return fail({
				code: "WORLD_TILE_LOOKUP_FAILED",
				message: "World tile lookup failed during hexcrawl movement.",
				details: { role, failure: found.error },
			});
		}

		return ok(found.data);
	}
}

const AXIAL_DIRECTIONS = [
	{ direction: "north", q: 0, r: -1 },
	{ direction: "northeast", q: 1, r: -1 },
	{ direction: "southeast", q: 1, r: 0 },
	{ direction: "south", q: 0, r: 1 },
	{ direction: "southwest", q: -1, r: 1 },
	{ direction: "northwest", q: -1, r: 0 },
] satisfies readonly {
	readonly direction: HexcrawlDirection;
	readonly q: number;
	readonly r: number;
}[];

function getAdjacentDirection(
	currentTile: WorldTileRecord,
	targetTile: WorldTileRecord,
): HexcrawlDirection | null {
	const deltaQ = targetTile.q - currentTile.q;
	const deltaR = targetTile.r - currentTile.r;
	const match = AXIAL_DIRECTIONS.find(
		(direction) => direction.q === deltaQ && direction.r === deltaR,
	);

	return match?.direction ?? null;
}

function createMovementResult(
	input: HexcrawlMovementInput,
	fromTile: WorldTileRecord,
	toTile: WorldTileRecord,
	direction: HexcrawlDirection,
): HexcrawlMovementResult {
	const discoveredTile = !toTile.isKnown;
	const encounterCheckPending = toTile.encounterSignal === "check";

	return {
		partyId: input.partyId,
		fromTile,
		toTile,
		direction,
		discoveredTile,
		encounterCheckPending,
		events: createMovementEvents(
			input,
			toTile,
			discoveredTile,
			encounterCheckPending,
		),
	};
}

function createMovementEvents(
	input: HexcrawlMovementInput,
	toTile: WorldTileRecord,
	discoveredTile: boolean,
	encounterCheckPending: boolean,
): HexcrawlMovementResult["events"] {
	const events: HexcrawlMovementResult["events"][number][] = [
		{
			type: "party-moved",
			message: `O grupo avançou para ${toTile.label}.`,
			tileId: toTile.id,
			createdAt: input.createdAt,
		},
	];

	if (discoveredTile) {
		events.push({
			type: "world-tile-discovered",
			message: `O grupo descobriu ${toTile.label}.`,
			tileId: toTile.id,
			createdAt: input.createdAt,
		});
	}

	if (encounterCheckPending) {
		events.push({
			type: "encounter-check-pending",
			message: "As ruínas exigem uma checagem de encontro futura.",
			tileId: toTile.id,
			createdAt: input.createdAt,
		});
	}

	return events;
}
