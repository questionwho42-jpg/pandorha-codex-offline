import type { WorldTileBiome, WorldTileRecord } from "$lib/entities/world-tile";
import type {
	HexcrawlMovementEvent,
	HexcrawlMovementFailure,
} from "./hexcrawlMovementTypes";

export interface HexcrawlMapTileView {
	readonly biomeLabel: string;
	readonly canMove: boolean;
	readonly disabledReason: string | null;
	readonly id: string;
	readonly isAdjacent: boolean;
	readonly isBlocked: boolean;
	readonly isCurrent: boolean;
	readonly label: string;
	readonly q: number;
	readonly r: number;
	readonly regionTierLabel: string;
	readonly stateLabel: string;
}

export interface HexcrawlMapView {
	readonly biomeLabel: string;
	readonly currentTileLabel: string;
	readonly errorMessage: string | null;
	readonly logEmptyLabel: string;
	readonly logEntries: readonly HexcrawlMovementEvent[];
	readonly mappingStatusLabel: string;
	readonly regionTierLabel: string;
	readonly tiles: readonly HexcrawlMapTileView[];
}

interface HexcrawlMapViewInput {
	readonly currentTileId: string;
	readonly discoveredTileIds: readonly string[];
	readonly errorMessage: string | null;
	readonly events: readonly HexcrawlMovementEvent[];
	readonly tiles: readonly WorldTileRecord[];
}

export function createHexcrawlMapView(
	input: HexcrawlMapViewInput,
): HexcrawlMapView {
	const currentTile =
		input.tiles.find((tile) => tile.id === input.currentTileId) ??
		input.tiles[0];

	return {
		biomeLabel: mapBiomeLabel(currentTile?.biome ?? "road"),
		currentTileLabel: currentTile?.label ?? "Hex desconhecido",
		errorMessage: input.errorMessage,
		logEmptyLabel: "Clique em um hex adjacente para explorar.",
		logEntries: input.events,
		mappingStatusLabel: currentTile
			? mapCurrentKnowledgeLabel(currentTile, input.discoveredTileIds)
			: "Desconhecido",
		regionTierLabel: currentTile ? `Tier ${currentTile.regionTier}` : "Tier ?",
		tiles: currentTile
			? input.tiles.map((tile) =>
					createTileView(tile, currentTile, input.discoveredTileIds),
				)
			: [],
	};
}

export function mapHexcrawlMovementFailureToMessage(
	failure: HexcrawlMovementFailure,
): string {
	switch (failure.code) {
		case "INVALID_HEXCRAWL_MOVEMENT_INPUT":
			return "O movimento informado não é válido para o mapa de treino.";
		case "WORLD_TILE_LOOKUP_FAILED":
			return "Não foi possível localizar um dos hexes do movimento.";
		case "NON_ADJACENT_WORLD_TILE":
			return "Escolha apenas um hex adjacente ao grupo.";
		case "BLOCKED_WORLD_TILE":
			return "Este hex está bloqueado no mapa de treino.";
	}
}

function createTileView(
	tile: WorldTileRecord,
	currentTile: WorldTileRecord,
	discoveredTileIds: readonly string[],
): HexcrawlMapTileView {
	const isCurrent = tile.id === currentTile.id;
	const isAdjacent = areTilesAdjacent(currentTile, tile);
	const canMove = !isCurrent && isAdjacent && !tile.isBlocked;

	return {
		biomeLabel: mapBiomeLabel(tile.biome),
		canMove,
		disabledReason: mapDisabledReason(isCurrent, isAdjacent, tile.isBlocked),
		id: tile.id,
		isAdjacent,
		isBlocked: tile.isBlocked,
		isCurrent,
		label: tile.label,
		q: tile.q,
		r: tile.r,
		regionTierLabel: `Tier ${tile.regionTier}`,
		stateLabel: mapTileStateLabel(tile, discoveredTileIds, isCurrent),
	};
}

function mapDisabledReason(
	isCurrent: boolean,
	isAdjacent: boolean,
	isBlocked: boolean,
): string | null {
	if (isCurrent) {
		return "Atual";
	}

	if (isBlocked) {
		return "Bloqueado";
	}

	if (!isAdjacent) {
		return "Distante";
	}

	return null;
}

function mapTileStateLabel(
	tile: WorldTileRecord,
	discoveredTileIds: readonly string[],
	isCurrent: boolean,
): string {
	if (isCurrent) {
		return "Atual";
	}

	if (tile.isMapped) {
		return "Mapeado";
	}

	if (tile.isKnown || discoveredTileIds.includes(tile.id)) {
		return "Conhecido";
	}

	return "Desconhecido";
}

function mapCurrentKnowledgeLabel(
	tile: WorldTileRecord,
	discoveredTileIds: readonly string[],
): string {
	if (tile.isMapped) {
		return "Mapeado";
	}

	if (tile.isKnown || discoveredTileIds.includes(tile.id)) {
		return "Conhecido";
	}

	return "Desconhecido";
}

function mapBiomeLabel(biome: WorldTileBiome): string {
	switch (biome) {
		case "road":
			return "Estrada";
		case "forest":
			return "Floresta";
		case "watch":
			return "Posto";
		case "ruins":
			return "Ruínas";
		case "marsh":
			return "Charco";
		case "barrow":
			return "Túmulo";
		case "ridge":
			return "Crista";
	}
}

function areTilesAdjacent(
	currentTile: WorldTileRecord,
	candidate: WorldTileRecord,
): boolean {
	const deltaQ = candidate.q - currentTile.q;
	const deltaR = candidate.r - currentTile.r;

	return AXIAL_DELTAS.some((delta) => delta.q === deltaQ && delta.r === deltaR);
}

const AXIAL_DELTAS = [
	{ q: 0, r: -1 },
	{ q: 1, r: -1 },
	{ q: 1, r: 0 },
	{ q: 0, r: 1 },
	{ q: -1, r: 1 },
	{ q: -1, r: 0 },
] as const;
