import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { ok } from "$lib/shared/lib/result";
import type { FactionCatalogRepository } from "../domain/FactionCatalogRepository";
import { FactionCatalogService } from "../domain/FactionCatalogService";
import {
	TRAINING_FACTION_STANDINGS,
	TRAINING_FACTIONS,
} from "../model/factionCatalog";
import {
	type FactionRecord,
	type FactionStandingRecord,
	factionSelectSchema,
	factionStandingSelectSchema,
} from "../model/factionSchema";
import type {
	FactionFailure,
	FactionRepositoryFailure,
} from "../model/factionTypes";
import { InMemoryFactionCatalogRepository } from "../testing/InMemoryFactionCatalogRepository";

describe("Training faction catalog", () => {
	it("contains validated training factions and standings", () => {
		expect(TRAINING_FACTIONS).toHaveLength(3);
		expect(TRAINING_FACTION_STANDINGS).toHaveLength(3);
		expect(TRAINING_FACTIONS.map((faction) => faction.id)).toEqual([
			"training-thieves-guild",
			"training-war-temple",
			"training-merchant-league",
		]);

		for (const faction of TRAINING_FACTIONS) {
			expect(factionSelectSchema.safeParse(faction).success).toBe(true);
			expect(faction.id).toMatch(/^[a-z][a-z0-9-]*$/);
		}

		for (const standing of TRAINING_FACTION_STANDINGS) {
			expect(factionStandingSelectSchema.safeParse(standing).success).toBe(
				true,
			);
			expect(standing.factionId).toMatch(/^[a-z][a-z0-9-]*$/);
			expect(standing.bloodDebt).toBe(0);
			expect(standing.status).toBe("sponsored");
		}
	});

	it("rejects negative standing values and invalid status", () => {
		expect(
			factionStandingSelectSchema.safeParse({
				...TRAINING_FACTION_STANDINGS[0],
				bloodDebt: -1,
			}).success,
		).toBe(false);
		expect(
			factionStandingSelectSchema.safeParse({
				...TRAINING_FACTION_STANDINGS[0],
				status: "friend",
			}).success,
		).toBe(false);
	});
});

describe("FactionCatalogService", () => {
	it("lists validated factions and standings from the repository", async () => {
		const service = createService();

		const factions = expectFactionSuccess(await service.listFactions());
		const standings = expectFactionSuccess(
			await service.listFactionStandings(),
		);

		expect(factions).toHaveLength(3);
		expect(standings).toHaveLength(3);
		expect(factions[0]).toMatchObject({
			id: "training-thieves-guild",
			label: "Guilda dos Ladrões de Treino",
			sourceFile: "docs/system/survival/31-codex-teia-infamia-patrocinio.md",
		});
	});

	it("finds a faction and standing by English technical id", async () => {
		const service = createService();

		const faction = expectFactionSuccess(
			await service.findFactionById("training-war-temple"),
		);
		const standing = expectFactionSuccess(
			await service.findFactionStandingByFactionId("training-war-temple"),
		);

		expect(faction.label).toBe("Templo da Guerra de Treino");
		expect(standing).toMatchObject({
			factionId: "training-war-temple",
			fameLevel: 1,
			bloodDebt: 0,
			intriguePoints: 0,
		});
	});

	it("rejects invalid ids before asking the repository", async () => {
		const repository = createRepository();
		const service = new FactionCatalogService(repository);

		const faction = expectFactionFailure(
			await service.findFactionById("Guilda dos Ladrões"),
		);
		const standing = expectFactionFailure(
			await service.findFactionStandingByFactionId("Templo da Guerra"),
		);

		expect(faction.code).toBe("INVALID_FACTION_ID");
		expect(standing.code).toBe("INVALID_FACTION_ID");
		expect(repository.factionLookupCount).toBe(0);
		expect(repository.standingLookupCount).toBe(0);
	});

	it("returns not found for missing factions and standings", async () => {
		const service = createService();

		expect(
			expectFactionFailure(await service.findFactionById("missing-faction"))
				.code,
		).toBe("FACTION_NOT_FOUND");
		expect(
			expectFactionFailure(
				await service.findFactionStandingByFactionId("missing-faction"),
			).code,
		).toBe("FACTION_STANDING_NOT_FOUND");
	});

	it("maps repository read failures into service failures", async () => {
		const repository = createRepository();
		repository.failNextFactionList({
			code: "FACTION_REPOSITORY_READ_FAILED",
			message: "Injected faction read failure.",
			details: { cause: "locked-faction-catalog" },
		});
		repository.failNextStandingList({
			code: "FACTION_REPOSITORY_READ_FAILED",
			message: "Injected standing read failure.",
			details: { cause: "locked-standing-catalog" },
		});
		const service = new FactionCatalogService(repository);

		expect(expectFactionFailure(await service.listFactions())).toMatchObject({
			code: "FACTION_REPOSITORY_READ_FAILED",
			details: { cause: "locked-faction-catalog" },
		});
		expect(
			expectFactionFailure(await service.listFactionStandings()),
		).toMatchObject({
			code: "FACTION_REPOSITORY_READ_FAILED",
			details: { cause: "locked-standing-catalog" },
		});
	});

	it("maps repository lookup failures into service failures", async () => {
		const repository = createRepository();
		repository.failNextFactionFind({
			code: "FACTION_REPOSITORY_READ_FAILED",
			message: "Injected faction lookup failure.",
		});
		repository.failNextStandingFind({
			code: "FACTION_REPOSITORY_READ_FAILED",
			message: "Injected standing lookup failure.",
		});
		const service = new FactionCatalogService(repository);

		expect(
			expectFactionFailure(
				await service.findFactionById("training-thieves-guild"),
			).code,
		).toBe("FACTION_REPOSITORY_READ_FAILED");
		expect(
			expectFactionFailure(
				await service.findFactionStandingByFactionId("training-thieves-guild"),
			).code,
		).toBe("FACTION_REPOSITORY_READ_FAILED");
	});

	it("rejects corrupted records returned by the repository", async () => {
		const service = new FactionCatalogService(new CorruptFactionRepository());

		expect(expectFactionFailure(await service.listFactions()).code).toBe(
			"CORRUPTED_FACTION_RECORD",
		);
		expect(
			expectFactionFailure(
				await service.findFactionById("training-thieves-guild"),
			).code,
		).toBe("CORRUPTED_FACTION_RECORD");
		expect(
			expectFactionFailure(await service.listFactionStandings()).code,
		).toBe("CORRUPTED_FACTION_STANDING_RECORD");
		expect(
			expectFactionFailure(
				await service.findFactionStandingByFactionId("training-thieves-guild"),
			).code,
		).toBe("CORRUPTED_FACTION_STANDING_RECORD");
	});
});

function createRepository(): InMemoryFactionCatalogRepository {
	return new InMemoryFactionCatalogRepository({
		factions: TRAINING_FACTIONS,
		standings: TRAINING_FACTION_STANDINGS,
	});
}

function createService(): FactionCatalogService {
	return new FactionCatalogService(createRepository());
}

function expectFactionSuccess<Success>(
	result: Result<Success, FactionFailure>,
): Success {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectFactionFailure<Success>(
	result: Result<Success, FactionFailure>,
): FactionFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class CorruptFactionRepository implements FactionCatalogRepository {
	public async listFactions(): Promise<
		Result<readonly FactionRecord[], FactionRepositoryFailure>
	> {
		return ok([
			{
				...TRAINING_FACTIONS[0],
				label: "",
			} as FactionRecord,
		]);
	}

	public async findFactionById(): Promise<
		Result<FactionRecord, FactionRepositoryFailure>
	> {
		return ok({
			...TRAINING_FACTIONS[0],
			label: "",
		} as FactionRecord);
	}

	public async listFactionStandings(): Promise<
		Result<readonly FactionStandingRecord[], FactionRepositoryFailure>
	> {
		return ok([
			{
				...TRAINING_FACTION_STANDINGS[0],
				bloodDebt: -1,
			} as FactionStandingRecord,
		]);
	}

	public async findFactionStandingByFactionId(): Promise<
		Result<FactionStandingRecord, FactionRepositoryFailure>
	> {
		return ok({
			...TRAINING_FACTION_STANDINGS[0],
			status: "friend",
		} as unknown as FactionStandingRecord);
	}
}
