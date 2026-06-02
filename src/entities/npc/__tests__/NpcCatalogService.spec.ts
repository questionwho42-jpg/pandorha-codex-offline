import { describe, expect, it } from "vitest";
import {
	InMemoryNpcCatalogRepository,
	NPC_CATALOG,
	NpcCatalogService,
	type NpcRecord,
} from "$lib/entities/npc";

describe("NpcCatalogService", () => {
	it("lists exactly the three valid training NPC records", async () => {
		const service = createService();

		const result = await service.listNpcs();

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data).toHaveLength(3);
		expect(result.data.map((npcRecord) => npcRecord.id)).toEqual([
			"training-broker",
			"training-captain",
			"training-informant",
		]);
	});

	it("keeps technical NPC ids in English ASCII slugs", async () => {
		const service = createService();

		const result = await service.listNpcs();

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		for (const npcRecord of result.data) {
			expect(npcRecord.id).toMatch(/^[a-z][a-z0-9-]*$/);
		}
	});

	it("finds the training broker by id with faction, attitude and source", async () => {
		const service = createService();

		const result = await service.findNpcById("training-broker");

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data.label).toBe("Corretora de Treino");
		expect(result.data.factionId).toBe("training-merchant-league");
		expect(result.data.attitude).toBe("skeptical");
		expect(result.data.sourceFile).toBe(
			"docs/system/survival/regras-negociacao.md",
		);
	});

	it("lists NPCs by faction id", async () => {
		const service = createService();

		const result = await service.listNpcsByFactionId(
			"training-merchant-league",
		);

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data.map((npcRecord) => npcRecord.id)).toEqual([
			"training-broker",
		]);
	});

	it("rejects invalid NPC id without calling the repository", async () => {
		const repository = new InMemoryNpcCatalogRepository();
		const service = new NpcCatalogService(repository);

		const result = await service.findNpcById("Treinamento");

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("INVALID_NPC_ID");
		expect(repository.getCallCount()).toBe(0);
	});

	it("rejects invalid faction id without calling the repository", async () => {
		const repository = new InMemoryNpcCatalogRepository();
		const service = new NpcCatalogService(repository);

		const result = await service.listNpcsByFactionId("Liga Mercante");

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("INVALID_FACTION_ID");
		expect(repository.getCallCount()).toBe(0);
	});

	it("returns a typed failure for missing NPC id", async () => {
		const service = createService();

		const result = await service.findNpcById("training-missing");

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("MISSING_NPC");
	});

	it("returns a typed failure for corrupted records", async () => {
		const corruptedRecord = {
			...NPC_CATALOG[0],
			tier: 0,
		} as unknown as NpcRecord;
		const service = createService([corruptedRecord]);

		const result = await service.listNpcs();

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("CORRUPTED_NPC_RECORD");
	});

	it("returns a typed failure when a found NPC record is corrupted", async () => {
		const corruptedRecord = {
			...NPC_CATALOG[0],
			attitude: "bored",
		} as unknown as NpcRecord;
		const service = createService([corruptedRecord]);

		const result = await service.findNpcById("training-broker");

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("CORRUPTED_NPC_RECORD");
	});

	it("returns a typed failure when faction listing includes a corrupted record", async () => {
		const corruptedRecord = {
			...NPC_CATALOG[0],
			mentalHp: 0,
		} as unknown as NpcRecord;
		const service = createService([corruptedRecord]);

		const result = await service.listNpcsByFactionId(
			"training-merchant-league",
		);

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("CORRUPTED_NPC_RECORD");
	});

	it("returns a typed failure when repository fails", async () => {
		const repository = new InMemoryNpcCatalogRepository();
		repository.failNextCall();
		const service = new NpcCatalogService(repository);

		const result = await service.listNpcs();

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("REPOSITORY_FAILURE");
	});

	it("returns a typed failure when repository fails while listing by faction", async () => {
		const repository = new InMemoryNpcCatalogRepository();
		repository.failNextCall();
		const service = new NpcCatalogService(repository);

		const result = await service.listNpcsByFactionId(
			"training-merchant-league",
		);

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("REPOSITORY_FAILURE");
	});
});

function createService(records: readonly NpcRecord[] = NPC_CATALOG) {
	return new NpcCatalogService(new InMemoryNpcCatalogRepository(records));
}
