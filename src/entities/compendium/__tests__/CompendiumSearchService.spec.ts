import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { ok } from "$lib/shared/lib/result";
import type { CompendiumRepository } from "../domain/CompendiumRepository";
import { CompendiumSearchService } from "../domain/CompendiumSearchService";
import { OFFICIAL_COMPENDIUM_ENTRIES } from "../model/compendiumCatalog";
import type { CompendiumEntry } from "../model/compendiumSchema";
import type {
	CompendiumFailure,
	CompendiumRepositoryFailure,
} from "../model/compendiumTypes";
import { InMemoryCompendiumRepository } from "../testing/InMemoryCompendiumRepository";

describe("CompendiumSearchService", () => {
	it("returns the default catalog page when the query is empty", async () => {
		const service = createService();

		const result = await service.searchEntries({ query: "" });
		const entries = expectCompendiumSuccess(result);

		expect(entries.map((entry) => entry.id)).toEqual(
			OFFICIAL_COMPENDIUM_ENTRIES.slice(0, 20).map((entry) => entry.id),
		);
	});

	it("uses the default search input when input is omitted", async () => {
		const service = createService();

		const result = await service.searchEntries(undefined);
		const entries = expectCompendiumSuccess(result);

		expect(entries.map((entry) => entry.id)).toEqual(
			OFFICIAL_COMPENDIUM_ENTRIES.slice(0, 20).map((entry) => entry.id),
		);
	});

	it.each([
		"Vanguarda",
		"vanguarda",
		"VANGUARDA",
	])("finds Vanguarda with case-insensitive query %s", async (query) => {
		const service = createService();

		const result = await service.searchEntries({ query });
		const entries = expectCompendiumSuccess(result);

		expect(entries.map((entry) => entry.id)).toContain("class-vanguard");
	});

	it("finds Tecelão de Sombras with an accent-insensitive query", async () => {
		const service = createService();

		const result = await service.searchEntries({ query: "tecelao" });
		const entries = expectCompendiumSuccess(result);

		expect(entries.map((entry) => entry.id)).toContain("class-weaver");
	});

	it.each([
		["contramagia", "system-survival-capitulo-xx-contramagia-e-anulacao"],
		["descanso", "system-survival-descanso-e-acampamento-completo"],
	])("finds generated system entries with query %s", async (query, expectedEntryId) => {
		const service = createService();

		const result = await service.searchEntries({ query });
		const entries = expectCompendiumSuccess(result);

		expect(entries.map((entry) => entry.id)).toContain(expectedEntryId);
	});

	it("filters generated entries by category before applying the result limit", async () => {
		const service = createService();

		const result = await service.searchEntries({
			category: "system-magic",
			limit: 50,
			query: "",
		});
		const entries = expectCompendiumSuccess(result);

		expect(entries.length).toBeGreaterThan(1);
		expect(entries.every((entry) => entry.category === "system-magic")).toBe(
			true,
		);
		expect(entries.map((entry) => entry.id)).toContain(
			"system-magic-12-00-codex-de-magia",
		);
	});

	it("combines category and text filters", async () => {
		const service = createService();

		const survivalResult = await service.searchEntries({
			category: "system-survival",
			query: "descanso",
		});
		const magicResult = await service.searchEntries({
			category: "system-magic",
			query: "descanso",
		});

		expect(
			expectCompendiumSuccess(survivalResult).map((entry) => entry.id),
		).toContain("system-survival-descanso-e-acampamento-completo");
		expect(expectCompendiumSuccess(magicResult)).toEqual([]);
	});

	it("returns an empty list for a query without results", async () => {
		const service = createService();

		const result = await service.searchEntries({ query: "sem resultado" });
		const entries = expectCompendiumSuccess(result);

		expect(entries).toEqual([]);
	});

	it("respects a valid result limit", async () => {
		const service = createService();

		const result = await service.searchEntries({ query: "", limit: 3 });
		const entries = expectCompendiumSuccess(result);

		expect(entries).toHaveLength(3);
	});

	it("rejects invalid search input before reading the repository", async () => {
		const repository = new InMemoryCompendiumRepository(
			OFFICIAL_COMPENDIUM_ENTRIES,
		);
		const service = new CompendiumSearchService(repository);

		const result = await service.searchEntries({ query: 42 });
		const failure = expectCompendiumFailure(result);

		expect(failure.code).toBe("INVALID_COMPENDIUM_SEARCH_INPUT");
		expect(repository.lookupCount).toBe(0);
	});

	it("formats root-level search input validation issues", async () => {
		const repository = new InMemoryCompendiumRepository(
			OFFICIAL_COMPENDIUM_ENTRIES,
		);
		const service = new CompendiumSearchService(repository);

		const result = await service.searchEntries(["Vanguarda"]);
		const failure = expectCompendiumFailure(result);

		expect(failure.code).toBe("INVALID_COMPENDIUM_SEARCH_INPUT");
		expect(failure.details?.issues).toEqual([expect.stringContaining("root:")]);
		expect(repository.lookupCount).toBe(0);
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
		const service = new CompendiumSearchService(repository);

		const result = await service.searchEntries({ query: "Vanguarda" });
		const failure = expectCompendiumFailure(result);

		expect(failure).toMatchObject({
			code: "COMPENDIUM_REPOSITORY_READ_FAILED",
			details: { cause: "locked-catalog" },
		});
	});

	it("rejects corrupted records returned by the repository", async () => {
		const service = new CompendiumSearchService(
			new CorruptCompendiumRepository(),
		);

		const result = await service.searchEntries({ query: "" });
		const failure = expectCompendiumFailure(result);

		expect(failure.code).toBe("CORRUPTED_COMPENDIUM_ENTRY");
	});
});

function createService(): CompendiumSearchService {
	return new CompendiumSearchService(
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
		return ok(OFFICIAL_COMPENDIUM_ENTRIES[0] as CompendiumEntry);
	}
}
