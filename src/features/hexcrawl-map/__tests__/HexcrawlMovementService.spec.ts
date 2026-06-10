import { describe, expect, it } from "vitest";
import { LoreService } from "$lib/entities/lore/domain/LoreService";
import { InMemoryLoreRepository } from "$lib/entities/lore/infrastructure/InMemoryLoreRepository";
import {
	InMemoryWorldTileCatalogRepository,
	WORLD_TILE_CATALOG,
} from "$lib/entities/world-tile";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { HexcrawlMovementService } from "../domain/HexcrawlMovementService";
import type {
	HexcrawlMovementFailure,
	HexcrawlMovementResult,
} from "../model/hexcrawlMovementTypes";

describe("HexcrawlMovementService", () => {
	it("moves the party to an adjacent axial tile", async () => {
		const service = createService();

		const result = await service.moveParty(
			createInput({ targetTileId: "north-pines" }),
		);
		const movement = expectMovementSuccess(result);

		expect(movement).toMatchObject({
			partyId: "party-alpha",
			direction: "north",
			discoveredTile: false,
			encounterCheckPending: false,
		});
		expect(movement.fromTile.id).toBe("camp-road");
		expect(movement.toTile.id).toBe("north-pines");
		expect(movement.events.map((event) => event.type)).toEqual(["party-moved"]);
		expect(movement.events[0]?.message).toBe(
			"O grupo avançou para Pinheiros do Norte.",
		);
	});

	it("rejects movement to a non-adjacent tile", async () => {
		const service = createService();

		const result = await service.moveParty(
			createInput({
				currentTileId: "north-pines",
				targetTileId: "south-marsh",
			}),
		);
		const failure = expectMovementFailure(result);

		expect(failure.code).toBe("NON_ADJACENT_WORLD_TILE");
	});

	it("rejects movement into a blocked tile", async () => {
		const service = createService();

		const result = await service.moveParty(
			createInput({ targetTileId: "southwest-barrow" }),
		);
		const failure = expectMovementFailure(result);

		expect(failure.code).toBe("BLOCKED_WORLD_TILE");
		expect(failure.details).toMatchObject({ targetTileId: "southwest-barrow" });
	});

	it("allows entering an unknown adjacent tile and returns a discovery event", async () => {
		const service = createService();

		const result = await service.moveParty(
			createInput({ targetTileId: "south-marsh" }),
		);
		const movement = expectMovementSuccess(result);

		expect(movement.direction).toBe("south");
		expect(movement.discoveredTile).toBe(true);
		expect(movement.events.map((event) => event.type)).toEqual([
			"party-moved",
			"world-tile-discovered",
		]);
		expect(movement.events[1]?.message).toBe(
			"O grupo descobriu Charco do Sul.",
		);
	});

	it("emits an encounter-check event without creating a real encounter", async () => {
		const service = createService();

		const result = await service.moveParty(
			createInput({ targetTileId: "southeast-ruins" }),
		);
		const movement = expectMovementSuccess(result);

		expect(movement.direction).toBe("southeast");
		expect(movement.encounterCheckPending).toBe(true);
		expect(movement.events.map((event) => event.type)).toEqual([
			"party-moved",
			"encounter-check-pending",
		]);
		expect(movement.events[1]?.message).toBe(
			"As ruínas exigem uma checagem de encontro futura.",
		);
	});

	it("rejects invalid input before asking the tile port", async () => {
		const tilePort = createTilePort();
		const service = new HexcrawlMovementService(tilePort);

		const result = await service.moveParty({
			partyId: "",
			currentTileId: "camp-road",
			targetTileId: "north-pines",
			createdAt: "not-a-date",
		});
		const failure = expectMovementFailure(result);

		expect(failure.code).toBe("INVALID_HEXCRAWL_MOVEMENT_INPUT");
		expect(tilePort.idLookupCount).toBe(0);
	});

	it("returns a typed failure when current or target tile lookup fails", async () => {
		const missingTileService = createService();

		expect(
			expectMovementFailure(
				await missingTileService.moveParty(
					createInput({ targetTileId: "missing-tile" }),
				),
			).code,
		).toBe("WORLD_TILE_LOOKUP_FAILED");

		const failingPort = createTilePort();
		failingPort.failNextIdLookup({
			code: "WORLD_TILE_REPOSITORY_LOOKUP_FAILED",
			message: "Injected world tile lookup failure.",
			details: { cause: "locked-world-tile" },
		});
		const failingService = new HexcrawlMovementService(failingPort);

		expect(
			expectMovementFailure(await failingService.moveParty(createInput())),
		).toMatchObject({
			code: "WORLD_TILE_LOOKUP_FAILED",
			details: { role: "current" },
		});
	});

	it("returns movement events in deterministic order", async () => {
		const service = createService();

		const result = await service.moveParty(
			createInput({ targetTileId: "southeast-ruins" }),
		);
		const movement = expectMovementSuccess(result);

		expect(movement.events).toEqual([
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
		]);
	});

	it("triggers lore encounter during movement if one is available on the target tile", async () => {
		class TestClockRepository {
			public async findById() {
				return ok(null);
			}
			public async save() {
				return fail(new Error());
			}
			public async findAll() {
				return ok([]);
			}
			public async delete(_id: string) {
				return ok(undefined);
			}
		}
		class TestSocialRepository {
			public async findReputation() {
				// biome-ignore lint/suspicious/noExplicitAny: fake reputation failure
				return fail({ code: "REPUTATION_NOT_FOUND", message: "" } as any);
			}
			public async saveFaction() {
				// biome-ignore lint/suspicious/noExplicitAny: fake repository method
				return fail(null as any);
			}
			public async findFactionById() {
				// biome-ignore lint/suspicious/noExplicitAny: fake repository method
				return fail(null as any);
			}
			public async listFactions() {
				return ok([]);
			}
			public async saveReputation() {
				// biome-ignore lint/suspicious/noExplicitAny: fake repository method
				return fail(null as any);
			}
			public async listReputationsByCharacter() {
				return ok([]);
			}
			public async saveBloodDebt() {
				// biome-ignore lint/suspicious/noExplicitAny: fake repository method
				return fail(null as any);
			}
			public async listBloodDebtsByCharacter() {
				return ok([]);
			}
		}

		const tilePort = createTilePort();
		const loreRepo = new InMemoryLoreRepository();
		// biome-ignore lint/suspicious/noExplicitAny: fake repository cast
		const clockRepo = new TestClockRepository() as any;
		// biome-ignore lint/suspicious/noExplicitAny: fake repository cast
		const socialRepo = new TestSocialRepository() as any;
		const loreService = new LoreService(loreRepo, clockRepo, socialRepo);

		await loreRepo.saveEncounter({
			id: "enc-pines",
			tileId: "north-pines",
			title: "Encontro nos Pinheiros",
			content: "Você avista uma clareira estranha.",
			factionIdRequired: null,
			reputationRequired: 0,
			requiredClockId: null,
			requiredClockValue: 0,
			isTriggered: false,
			createdAt: "2026-06-02T00:00:00Z",
			updatedAt: "2026-06-02T00:00:00Z",
		});

		const service = new HexcrawlMovementService(tilePort, loreService);

		const result = await service.moveParty(
			createInput({
				targetTileId: "north-pines",
				activeCharacterId: "char-1",
			}),
		);
		const movement = expectMovementSuccess(result);

		expect(movement.events.map((event) => event.type)).toContain(
			"lore-encounter-triggered",
		);
		const loreEvent = movement.events.find(
			(e) => e.type === "lore-encounter-triggered",
		);
		expect(loreEvent).toBeDefined();
		expect(loreEvent?.message).toContain("Encontro nos Pinheiros");
		expect(loreEvent?.payload).toEqual({
			encounterId: "enc-pines",
			title: "Encontro nos Pinheiros",
			content: "Você avista uma clareira estranha.",
		});
	});
});

function createTilePort(): InMemoryWorldTileCatalogRepository {
	return new InMemoryWorldTileCatalogRepository({
		worldTiles: WORLD_TILE_CATALOG,
	});
}

function createService(): HexcrawlMovementService {
	return new HexcrawlMovementService(createTilePort());
}

function createInput(
	overrides: Partial<{
		partyId: string;
		currentTileId: string;
		targetTileId: string;
		createdAt: string;
		activeCharacterId: string;
	}> = {},
) {
	return {
		partyId: "party-alpha",
		currentTileId: "camp-road",
		targetTileId: "north-pines",
		createdAt: "2026-05-14T03:00:00.000Z",
		activeCharacterId: "char-1",
		...overrides,
	};
}

function expectMovementSuccess(
	result: Result<HexcrawlMovementResult, HexcrawlMovementFailure>,
): HexcrawlMovementResult {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectMovementFailure(
	result: Result<HexcrawlMovementResult, HexcrawlMovementFailure>,
): HexcrawlMovementFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}
