import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { ok } from "$lib/shared/lib/result";
import type { AncestryTraitRepository } from "../domain/AncestryTraitRepository";
import { AncestryTraitSelectionService } from "../domain/AncestryTraitSelectionService";
import {
	type AncestryTraitLinkRecord,
	type AncestryTraitRecord,
	ancestryTraitLinkSelectSchema,
	ancestryTraitSelectSchema,
} from "../model/ancestrySchema";
import {
	OFFICIAL_ANCESTRY_TRAIT_LINKS,
	OFFICIAL_ANCESTRY_TRAITS,
} from "../model/ancestryTraitCatalog";
import type {
	AncestryTraitFailure,
	AncestryTraitRepositoryFailure,
} from "../model/ancestryTypes";
import { InMemoryAncestryTraitRepository } from "../testing/InMemoryAncestryTraitRepository";

describe("Official ancestry trait catalog", () => {
	it("contains exactly sixty official traits and sixty ancestry links", () => {
		expect(OFFICIAL_ANCESTRY_TRAITS).toHaveLength(60);
		expect(OFFICIAL_ANCESTRY_TRAIT_LINKS).toHaveLength(60);

		for (const trait of OFFICIAL_ANCESTRY_TRAITS) {
			expect(ancestryTraitSelectSchema.safeParse(trait).success).toBe(true);
		}

		for (const link of OFFICIAL_ANCESTRY_TRAIT_LINKS) {
			expect(ancestryTraitLinkSelectSchema.safeParse(link).success).toBe(true);
		}
	});

	it("contains exactly ten traits per official ancestry", () => {
		const ancestryIds = ["human", "elf", "dwarf", "drakari", "umbral", "beast"];

		for (const ancestryId of ancestryIds) {
			const traitIds = OFFICIAL_ANCESTRY_TRAIT_LINKS.filter(
				(link) => link.ancestryId === ancestryId,
			).map((link) => link.traitId);

			expect(new Set(traitIds).size).toBe(10);
		}
	});
});

describe("AncestryTraitSelectionService", () => {
	it("rejects invalid ancestry ids before listing traits", async () => {
		const service = createService();

		const result = await service.listTraitsByAncestry(" ");
		const failure = expectTraitFailure(result);

		expect(failure.code).toBe("INVALID_ANCESTRY_ID");
	});

	it("lists the ten Humano traits by ancestry id", async () => {
		const service = createService();

		const result = await service.listTraitsByAncestry("human");
		const traits = expectTraitSuccess(result);

		expect(traits).toHaveLength(10);
		expect(traits[0]).toMatchObject({
			id: "human-diligencia-erudita",
			label: "Diligência Erudita",
			sourceFile: "docs/system/survival/01-01-humanos.md",
		});
	});

	it("accepts exactly three valid Humano level-one traits", async () => {
		const service = createService();

		const result = await service.chooseLevelOneTraits({
			ancestryId: "human",
			traitIds: [
				"human-diligencia-erudita",
				"human-lingua-de-prata",
				"human-vontade-indomavel",
			],
		});
		const selection = expectTraitSuccess(result);

		expect(selection).toMatchObject({
			ancestryId: "human",
			traitIds: [
				"human-diligencia-erudita",
				"human-lingua-de-prata",
				"human-vontade-indomavel",
			],
		});
		expect(selection.traits.map((trait) => trait.label)).toEqual([
			"Diligência Erudita",
			"Língua de Prata",
			"Vontade Indomável",
		]);
	});

	it("rejects malformed level-one selection input", async () => {
		const service = createService();

		const result = await service.chooseLevelOneTraits(undefined);
		const failure = expectTraitFailure(result);

		expect(failure.code).toBe("INVALID_ANCESTRY_TRAIT_SELECTION");
	});

	it.each([
		["two traits", ["human-diligencia-erudita", "human-lingua-de-prata"]],
		[
			"four traits",
			[
				"human-diligencia-erudita",
				"human-lingua-de-prata",
				"human-vontade-indomavel",
				"human-maestria-improvisada",
			],
		],
	])("rejects %s for level-one selection", async (_caseName, traitIds) => {
		const service = createService();

		const result = await service.chooseLevelOneTraits({
			ancestryId: "human",
			traitIds,
		});
		const failure = expectTraitFailure(result);

		expect(failure.code).toBe("INVALID_ANCESTRY_TRAIT_SELECTION");
	});

	it("rejects duplicate trait ids", async () => {
		const service = createService();

		const result = await service.chooseLevelOneTraits({
			ancestryId: "human",
			traitIds: [
				"human-diligencia-erudita",
				"human-diligencia-erudita",
				"human-vontade-indomavel",
			],
		});
		const failure = expectTraitFailure(result);

		expect(failure.code).toBe("DUPLICATE_ANCESTRY_TRAIT_SELECTION");
	});

	it("rejects missing trait ids", async () => {
		const service = createService();

		const result = await service.chooseLevelOneTraits({
			ancestryId: "human",
			traitIds: [
				"human-diligencia-erudita",
				"human-lingua-de-prata",
				"human-missing-trait",
			],
		});
		const failure = expectTraitFailure(result);

		expect(failure.code).toBe("ANCESTRY_TRAIT_NOT_FOUND");
	});

	it("rejects traits that belong to another ancestry", async () => {
		const service = createService();

		const result = await service.chooseLevelOneTraits({
			ancestryId: "human",
			traitIds: [
				"human-diligencia-erudita",
				"human-lingua-de-prata",
				"elf-visao-estelar",
			],
		});
		const failure = expectTraitFailure(result);

		expect(failure.code).toBe("ANCESTRY_TRAIT_ANCESTRY_MISMATCH");
	});

	it("maps repository find failures into service failures", async () => {
		const repository = new InMemoryAncestryTraitRepository(
			OFFICIAL_ANCESTRY_TRAITS,
			OFFICIAL_ANCESTRY_TRAIT_LINKS,
		);
		repository.failNextFind({
			code: "ANCESTRY_TRAIT_REPOSITORY_READ_FAILED",
			message: "Injected fake find failure.",
			details: { cause: "find-blocked" },
		});
		const service = new AncestryTraitSelectionService(repository);

		const result = await service.chooseLevelOneTraits({
			ancestryId: "human",
			traitIds: [
				"human-diligencia-erudita",
				"human-lingua-de-prata",
				"human-vontade-indomavel",
			],
		});
		const failure = expectTraitFailure(result);

		expect(failure).toMatchObject({
			code: "ANCESTRY_TRAIT_REPOSITORY_READ_FAILED",
			details: { cause: "find-blocked" },
		});
	});

	it("rejects corrupted trait records returned by findTraitsByIds", async () => {
		const service = new AncestryTraitSelectionService(
			new CorruptTraitRepository(),
		);

		const result = await service.chooseLevelOneTraits({
			ancestryId: "human",
			traitIds: [
				"human-diligencia-erudita",
				"human-lingua-de-prata",
				"human-vontade-indomavel",
			],
		});
		const failure = expectTraitFailure(result);

		expect(failure.code).toBe("CORRUPTED_ANCESTRY_TRAIT_RECORD");
	});

	it("maps repository link failures into service failures", async () => {
		const repository = new InMemoryAncestryTraitRepository(
			OFFICIAL_ANCESTRY_TRAITS,
			OFFICIAL_ANCESTRY_TRAIT_LINKS,
		);
		repository.failNextLinks({
			code: "ANCESTRY_TRAIT_REPOSITORY_READ_FAILED",
			message: "Injected fake link failure.",
			details: { cause: "links-blocked" },
		});
		const service = new AncestryTraitSelectionService(repository);

		const result = await service.chooseLevelOneTraits({
			ancestryId: "human",
			traitIds: [
				"human-diligencia-erudita",
				"human-lingua-de-prata",
				"human-vontade-indomavel",
			],
		});
		const failure = expectTraitFailure(result);

		expect(failure).toMatchObject({
			code: "ANCESTRY_TRAIT_REPOSITORY_READ_FAILED",
			details: { cause: "links-blocked" },
		});
	});

	it("rejects corrupted ancestry trait links returned by the repository", async () => {
		const service = new AncestryTraitSelectionService(
			new CorruptTraitLinkRepository(),
		);

		const result = await service.chooseLevelOneTraits({
			ancestryId: "human",
			traitIds: [
				"human-diligencia-erudita",
				"human-lingua-de-prata",
				"human-vontade-indomavel",
			],
		});
		const failure = expectTraitFailure(result);

		expect(failure.code).toBe("CORRUPTED_ANCESTRY_TRAIT_LINK");
	});

	it("rejects corrupted trait records returned by the repository", async () => {
		const service = new AncestryTraitSelectionService(
			new CorruptTraitRepository(),
		);

		const result = await service.listTraitsByAncestry("human");
		const failure = expectTraitFailure(result);

		expect(failure.code).toBe("CORRUPTED_ANCESTRY_TRAIT_RECORD");
	});

	it("maps repository read failures into service failures", async () => {
		const repository = new InMemoryAncestryTraitRepository(
			OFFICIAL_ANCESTRY_TRAITS,
			OFFICIAL_ANCESTRY_TRAIT_LINKS,
		);
		repository.failNextList({
			code: "ANCESTRY_TRAIT_REPOSITORY_READ_FAILED",
			message: "Injected fake read failure.",
			details: { cause: "locked-trait-catalog" },
		});
		const service = new AncestryTraitSelectionService(repository);

		const result = await service.listTraitsByAncestry("human");
		const failure = expectTraitFailure(result);

		expect(failure).toMatchObject({
			code: "ANCESTRY_TRAIT_REPOSITORY_READ_FAILED",
			details: { cause: "locked-trait-catalog" },
		});
	});
});

function createService(): AncestryTraitSelectionService {
	return new AncestryTraitSelectionService(
		new InMemoryAncestryTraitRepository(
			OFFICIAL_ANCESTRY_TRAITS,
			OFFICIAL_ANCESTRY_TRAIT_LINKS,
		),
	);
}

function expectTraitSuccess<Success>(
	result: Result<Success, AncestryTraitFailure>,
): Success {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectTraitFailure<Success>(
	result: Result<Success, AncestryTraitFailure>,
): AncestryTraitFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class CorruptTraitRepository implements AncestryTraitRepository {
	public async listTraitsByAncestry(): Promise<
		Result<readonly AncestryTraitRecord[], AncestryTraitRepositoryFailure>
	> {
		return ok([
			{
				...OFFICIAL_ANCESTRY_TRAITS[0],
				label: "",
			} as AncestryTraitRecord,
		]);
	}

	public async findTraitsByIds(): Promise<
		Result<readonly AncestryTraitRecord[], AncestryTraitRepositoryFailure>
	> {
		return ok([
			{
				...OFFICIAL_ANCESTRY_TRAITS[0],
				label: "",
			} as AncestryTraitRecord,
		]);
	}

	public async listLinksByAncestry(): Promise<
		Result<readonly AncestryTraitLinkRecord[], AncestryTraitRepositoryFailure>
	> {
		return ok(OFFICIAL_ANCESTRY_TRAIT_LINKS.slice(0, 10));
	}
}

class CorruptTraitLinkRepository implements AncestryTraitRepository {
	public async listTraitsByAncestry(): Promise<
		Result<readonly AncestryTraitRecord[], AncestryTraitRepositoryFailure>
	> {
		return ok(OFFICIAL_ANCESTRY_TRAITS.slice(0, 10));
	}

	public async findTraitsByIds(): Promise<
		Result<readonly AncestryTraitRecord[], AncestryTraitRepositoryFailure>
	> {
		return ok(OFFICIAL_ANCESTRY_TRAITS.slice(0, 3));
	}

	public async listLinksByAncestry(): Promise<
		Result<readonly AncestryTraitLinkRecord[], AncestryTraitRepositoryFailure>
	> {
		return ok([
			{
				...OFFICIAL_ANCESTRY_TRAIT_LINKS[0],
				traitId: "",
			} as AncestryTraitLinkRecord,
		]);
	}
}
