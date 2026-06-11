import type { LoreService } from "$lib/entities/lore/domain/LoreService";
import type { LoreEncounterRecord } from "$lib/entities/lore/model/loreSchema";
import type { TrapRepository } from "$lib/entities/traps";
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
		private readonly loreService?: LoreService,
		private readonly trapRepository?: TrapRepository,
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

		let resolvedEncounter: LoreEncounterRecord | null = null;
		if (this.loreService) {
			const characterId = parsedInput.data.activeCharacterId ?? "party-leader";
			const loreResult = await this.loreService.resolveLoreEncounter(
				targetTile.data.id,
				characterId,
			);
			if (loreResult.success) {
				resolvedEncounter = loreResult.data;
			}
		}

		if (
			this.trapRepository &&
			!targetTile.data.isKnown &&
			(targetTile.data.biome === "ruins" || targetTile.data.biome === "marsh")
		) {
			// 50% chance de gerar armadilha
			const randArray = new Uint32Array(1);
			crypto.getRandomValues(randArray);
			const randVal = randArray[0];
			if (randVal !== undefined && randVal % 100 < 50) {
				const tier = targetTile.data.regionTier;
				const trapId = `trap-gen-${crypto.randomUUID()}`;

				let name = "Armadilha de Farpas";
				let type: "mechanical" | "magical" = "mechanical";
				let severity: "simple" | "hidden" | "deadly" = "simple";
				let dc = 4;
				let damage = 10;
				let effects = ["bleeding"];

				if (tier === 2) {
					name = "Runa de Gás de Éter";
					type = "magical";
					severity = "simple";
					dc = 6;
					damage = 18;
					effects = ["silenced"];
				} else if (tier === 3) {
					name = "Armadilha de Urso de Aço";
					type = "mechanical";
					severity = "hidden";
					dc = 8;
					damage = 26;
					effects = ["immobilized"];
				} else if (tier >= 4) {
					name = "Runa Ruidosa Antiga";
					type = "magical";
					severity = "deadly";
					dc = 10;
					damage = 35;
					effects = ["noisy_rune"];
				}

				const nowStr = new Date().toISOString();
				await this.trapRepository.save({
					id: trapId,
					tileId: targetTile.data.id,
					name,
					type,
					severity,
					dc,
					damage,
					isDetected: false,
					isDisarmed: false,
					isTriggered: false,
					effects: JSON.stringify(effects),
					createdAt: nowStr,
					updatedAt: nowStr,
				});
			}
		}

		return ok(
			createMovementResult(
				parsedInput.data,
				currentTile.data,
				targetTile.data,
				direction,
				resolvedEncounter,
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
	loreEncounter: LoreEncounterRecord | null,
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
			loreEncounter,
		),
	};
}

function createMovementEvents(
	input: HexcrawlMovementInput,
	toTile: WorldTileRecord,
	discoveredTile: boolean,
	encounterCheckPending: boolean,
	loreEncounter: LoreEncounterRecord | null,
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

	if (loreEncounter) {
		events.push({
			type: "lore-encounter-triggered",
			message: `[Narrativa] ${loreEncounter.title}: ${loreEncounter.content}`,
			tileId: toTile.id,
			createdAt: input.createdAt,
			payload: {
				encounterId: loreEncounter.id,
				title: loreEncounter.title,
				content: loreEncounter.content,
			},
		});
	}

	return events;
}
