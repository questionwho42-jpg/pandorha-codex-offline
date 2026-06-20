import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { ok } from "$lib/shared/lib/result";
import { CompendiumCatalogService } from "../domain/CompendiumCatalogService";
import type { CompendiumRepository } from "../domain/CompendiumRepository";
import {
	OFFICIAL_COMPENDIUM_ENTRIES,
	OFFICIAL_COMPENDIUM_ENTRY_IDS,
} from "../model/compendiumCatalog";
import {
	type CompendiumEntry,
	compendiumEntrySelectSchema,
} from "../model/compendiumSchema";
import type {
	CompendiumFailure,
	CompendiumRepositoryFailure,
} from "../model/compendiumTypes";
import { InMemoryCompendiumRepository } from "../testing/InMemoryCompendiumRepository";

describe("Official compendium catalog", () => {
	it("contains the curated slice followed by the generated system index", () => {
		const curatedEntryIds = [
			"character-creation-guide",
			"ancestry-overview",
			"class-overview",
			"class-vanguard",
			"class-weaver",
			"class-emissary",
			"class-hunter",
			"background-overview",
		];
		const categories = new Set(
			OFFICIAL_COMPENDIUM_ENTRIES.map((entry) => entry.category),
		);

		expect(OFFICIAL_COMPENDIUM_ENTRIES.length).toBeGreaterThan(
			curatedEntryIds.length,
		);
		expect(
			OFFICIAL_COMPENDIUM_ENTRY_IDS.slice(0, curatedEntryIds.length),
		).toEqual(curatedEntryIds);
		expect(new Set(OFFICIAL_COMPENDIUM_ENTRY_IDS).size).toBe(
			OFFICIAL_COMPENDIUM_ENTRY_IDS.length,
		);
		expect(categories).toEqual(
			new Set([
				"character-creation",
				"ancestry",
				"class",
				"background",
				"system-survival",
				"system-combat",
				"system-magic",
			]),
		);
		expect(
			OFFICIAL_COMPENDIUM_ENTRIES.some((entry) =>
				entry.sourceFile.endsWith("pandorha-sistema-compilado.md"),
			),
		).toBe(false);

		for (const entry of OFFICIAL_COMPENDIUM_ENTRIES) {
			expect(compendiumEntrySelectSchema.safeParse(entry).success).toBe(true);
		}
	});
});

describe("CompendiumCatalogService", () => {
	it("lists validated compendium entries from the repository", async () => {
		const service = createService();

		const result = await service.listEntries();
		const entries = expectCompendiumSuccess(result);

		expect(entries.length).toBeGreaterThan(8);
		expect(entries[0]).toMatchObject({
			id: "character-creation-guide",
			title: "Guia de criação de ficha",
			category: "character-creation",
			sourceFile: "docs/system/survival/guia-criacao-de-ficha.md",
		});
		expect(entries).toContainEqual(
			expect.objectContaining({
				id: "system-survival-descanso-e-acampamento-completo",
				category: "system-survival",
				sourceFile: "docs/system/survival/descanso-e-acampamento-completo.md",
			}),
		);
	});

	it("finds Vanguarda by its English technical id", async () => {
		const service = createService();

		const result = await service.findEntryById("class-vanguard");
		const entry = expectCompendiumSuccess(result);

		expect(entry).toMatchObject({
			id: "class-vanguard",
			title: "Vanguarda",
			category: "class",
			sourceFile: "docs/system/survival/05-01-vanguarda.md",
		});
		expect(entry.searchText).toContain("vanguarda");
	});

	it("rejects invalid compendium ids before asking the repository", async () => {
		const repository = new InMemoryCompendiumRepository(
			OFFICIAL_COMPENDIUM_ENTRIES,
		);
		const service = new CompendiumCatalogService(repository);

		const result = await service.findEntryById(" ");
		const failure = expectCompendiumFailure(result);

		expect(failure.code).toBe("INVALID_COMPENDIUM_ENTRY_ID");
		expect(repository.lookupCount).toBe(0);
	});

	it("returns not found when the repository has no matching entry", async () => {
		const service = createService();

		const result = await service.findEntryById("missing-entry");
		const failure = expectCompendiumFailure(result);

		expect(failure.code).toBe("COMPENDIUM_ENTRY_NOT_FOUND");
	});

	it("maps repository read failures into service failures", async () => {
		const repository = new InMemoryCompendiumRepository(
			OFFICIAL_COMPENDIUM_ENTRIES,
		);
		repository.failNextList({
			code: "COMPENDIUM_REPOSITORY_READ_FAILED",
			message: "Injected fake read failure.",
			details: { cause: "locked-catalog" },
		});
		const service = new CompendiumCatalogService(repository);

		const result = await service.listEntries();
		const failure = expectCompendiumFailure(result);

		expect(failure).toMatchObject({
			code: "COMPENDIUM_REPOSITORY_READ_FAILED",
			details: { cause: "locked-catalog" },
		});
	});

	it("rejects corrupted records returned by the repository", async () => {
		const service = new CompendiumCatalogService(
			new CorruptCompendiumRepository(),
		);

		const result = await service.listEntries();
		const failure = expectCompendiumFailure(result);

		expect(failure.code).toBe("CORRUPTED_COMPENDIUM_ENTRY");
	});

	it("rejects corrupted records returned by findById", async () => {
		const service = new CompendiumCatalogService(
			new CorruptCompendiumRepository(),
		);

		const result = await service.findEntryById("class-vanguard");
		const failure = expectCompendiumFailure(result);

		expect(failure.code).toBe("CORRUPTED_COMPENDIUM_ENTRY");
	});
});

function createService(): CompendiumCatalogService {
	return new CompendiumCatalogService(
		new InMemoryCompendiumRepository(OFFICIAL_COMPENDIUM_ENTRIES),
	);
}

function expectCompendiumSuccess<Success>(
	result: Result<Success, CompendiumFailure>,
): Success {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectCompendiumFailure<Success>(
	result: Result<Success, CompendiumFailure>,
): CompendiumFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class CorruptCompendiumRepository implements CompendiumRepository {
	public async list(): Promise<
		Result<readonly CompendiumEntry[], CompendiumRepositoryFailure>
	> {
		return ok([
			{
				...OFFICIAL_COMPENDIUM_ENTRIES[0],
				title: "",
			} as CompendiumEntry,
		]);
	}

	public async findById(): Promise<
		Result<CompendiumEntry, CompendiumRepositoryFailure>
	> {
		return ok({
			...OFFICIAL_COMPENDIUM_ENTRIES[0],
			title: "",
		} as CompendiumEntry);
	}
}
