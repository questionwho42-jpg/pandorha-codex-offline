import { describe, expect, it } from "vitest";
import { WORLD_TILE_CATALOG } from "$lib/entities/world-tile";
import {
	createHexcrawlMapView,
	mapHexcrawlMovementFailureToMessage,
} from "../model/hexcrawlMapView";
import type { HexcrawlMovementFailure } from "../model/hexcrawlMovementTypes";

describe("createHexcrawlMapView", () => {
	it("creates pt-BR labels for the current mapped tile", () => {
		const view = createHexcrawlMapView({
			currentTileId: "camp-road",
			discoveredTileIds: [],
			errorMessage: null,
			events: [],
			tiles: WORLD_TILE_CATALOG,
		});

		expect(view.currentTileLabel).toBe("Estrada do Acampamento");
		expect(view.biomeLabel).toBe("Estrada");
		expect(view.regionTierLabel).toBe("Tier 1");
		expect(view.mappingStatusLabel).toBe("Mapeado");
		expect(view.logEmptyLabel).toBe(
			"Clique em um hex adjacente para explorar.",
		);
	});

	it("marks adjacent open tiles as movable and blocked tiles as disabled", () => {
		const view = createHexcrawlMapView({
			currentTileId: "camp-road",
			discoveredTileIds: [],
			errorMessage: null,
			events: [],
			tiles: WORLD_TILE_CATALOG,
		});

		const north = view.tiles.find((tile) => tile.id === "north-pines");
		const blocked = view.tiles.find((tile) => tile.id === "southwest-barrow");
		const current = view.tiles.find((tile) => tile.id === "camp-road");

		expect(north?.canMove).toBe(true);
		expect(north?.stateLabel).toBe("Conhecido");
		expect(blocked?.canMove).toBe(false);
		expect(blocked?.disabledReason).toBe("Bloqueado");
		expect(current?.canMove).toBe(false);
		expect(current?.stateLabel).toBe("Atual");
	});

	it("marks distant tiles as disabled when the current tile changes", () => {
		const view = createHexcrawlMapView({
			currentTileId: "north-pines",
			discoveredTileIds: [],
			errorMessage: null,
			events: [],
			tiles: WORLD_TILE_CATALOG,
		});

		const distant = view.tiles.find((tile) => tile.id === "south-marsh");

		expect(distant?.canMove).toBe(false);
		expect(distant?.disabledReason).toBe("Distante");
	});

	it("allows unknown adjacent tiles and labels them clearly", () => {
		const view = createHexcrawlMapView({
			currentTileId: "camp-road",
			discoveredTileIds: [],
			errorMessage: null,
			events: [],
			tiles: WORLD_TILE_CATALOG,
		});

		const unknown = view.tiles.find((tile) => tile.id === "south-marsh");

		expect(unknown?.canMove).toBe(true);
		expect(unknown?.stateLabel).toBe("Desconhecido");
	});

	it("keeps an unknown current tile explicit when it was not discovered in session", () => {
		const view = createHexcrawlMapView({
			currentTileId: "south-marsh",
			discoveredTileIds: [],
			errorMessage: null,
			events: [],
			tiles: WORLD_TILE_CATALOG,
		});

		expect(view.currentTileLabel).toBe("Charco do Sul");
		expect(view.mappingStatusLabel).toBe("Desconhecido");
	});

	it("treats discovered tile ids as known in the UI session", () => {
		const view = createHexcrawlMapView({
			currentTileId: "south-marsh",
			discoveredTileIds: ["south-marsh"],
			errorMessage: null,
			events: [],
			tiles: WORLD_TILE_CATALOG,
		});

		expect(view.currentTileLabel).toBe("Charco do Sul");
		expect(view.mappingStatusLabel).toBe("Conhecido");
		expect(
			view.tiles.find((tile) => tile.id === "south-marsh")?.stateLabel,
		).toBe("Atual");
	});

	it("creates a safe empty view when no tile is available", () => {
		const view = createHexcrawlMapView({
			currentTileId: "missing",
			discoveredTileIds: [],
			errorMessage: "Erro visível",
			events: [],
			tiles: [],
		});

		expect(view.currentTileLabel).toBe("Hex desconhecido");
		expect(view.biomeLabel).toBe("Estrada");
		expect(view.regionTierLabel).toBe("Tier ?");
		expect(view.mappingStatusLabel).toBe("Desconhecido");
		expect(view.errorMessage).toBe("Erro visível");
		expect(view.tiles).toEqual([]);
	});

	it("falls back to the first tile when the current tile id is missing", () => {
		const view = createHexcrawlMapView({
			currentTileId: "missing",
			discoveredTileIds: [],
			errorMessage: null,
			events: [],
			tiles: WORLD_TILE_CATALOG,
		});

		expect(view.currentTileLabel).toBe("Estrada do Acampamento");
		expect(view.tiles.find((tile) => tile.id === "camp-road")?.stateLabel).toBe(
			"Atual",
		);
	});

	it("exposes movement log messages in deterministic order", () => {
		const view = createHexcrawlMapView({
			currentTileId: "southeast-ruins",
			discoveredTileIds: [],
			errorMessage: null,
			events: [
				{
					type: "party-moved",
					message: "O grupo avançou para Ruínas Baixas.",
					tileId: "southeast-ruins",
					createdAt: "2026-05-14T03:00:00.000Z",
				},
				{
					type: "encounter-check-pending",
					message: "As ruínas exigem uma checagem de encontro futura.",
					tileId: "southeast-ruins",
					createdAt: "2026-05-14T03:00:00.000Z",
				},
			],
			tiles: WORLD_TILE_CATALOG,
		});

		expect(view.logEntries.map((entry) => entry.message)).toEqual([
			"O grupo avançou para Ruínas Baixas.",
			"As ruínas exigem uma checagem de encontro futura.",
		]);
	});

	it("maps movement failures to pt-BR messages without technical codes", () => {
		const failures: readonly [HexcrawlMovementFailure, string][] = [
			[
				{
					code: "INVALID_HEXCRAWL_MOVEMENT_INPUT",
					message: "Invalid.",
				},
				"O movimento informado não é válido para o mapa de treino.",
			],
			[
				{
					code: "WORLD_TILE_LOOKUP_FAILED",
					message: "Lookup failed.",
				},
				"Não foi possível localizar um dos hexes do movimento.",
			],
			[
				{
					code: "NON_ADJACENT_WORLD_TILE",
					message: "Distant.",
				},
				"Escolha apenas um hex adjacente ao grupo.",
			],
			[
				{
					code: "BLOCKED_WORLD_TILE",
					message: "Blocked.",
				},
				"Este hex está bloqueado no mapa de treino.",
			],
		];

		for (const [failure, message] of failures) {
			expect(mapHexcrawlMovementFailureToMessage(failure)).toBe(message);
		}
	});
});
