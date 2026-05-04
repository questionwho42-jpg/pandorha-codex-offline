import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { ok } from "$lib/shared/lib/result";
import { AncestryCatalogService } from "../domain/AncestryCatalogService";
import type { AncestryRepository } from "../domain/AncestryRepository";
import {
	OFFICIAL_ANCESTRIES,
	OFFICIAL_ANCESTRY_IDS,
} from "../model/ancestryCatalog";
import {
	type AncestryRecord,
	ancestrySelectSchema,
} from "../model/ancestrySchema";
import type {
	AncestryFailure,
	AncestryRepositoryFailure,
} from "../model/ancestryTypes";
import { InMemoryAncestryRepository } from "../testing/InMemoryAncestryRepository";

describe("Official ancestry catalog", () => {
	it("contains exactly the six official base ancestries validated by Drizzle-Zod", () => {
		expect(OFFICIAL_ANCESTRIES).toHaveLength(6);
		expect(OFFICIAL_ANCESTRIES.map((ancestry) => ancestry.id)).toEqual([
			"human",
			"elf",
			"dwarf",
			"drakari",
			"umbral",
			"beast",
		]);
		expect(OFFICIAL_ANCESTRY_IDS).toEqual([
			"human",
			"elf",
			"dwarf",
			"drakari",
			"umbral",
			"beast",
		]);

		for (const ancestry of OFFICIAL_ANCESTRIES) {
			expect(ancestrySelectSchema.safeParse(ancestry).success).toBe(true);
		}
	});
});

describe("AncestryCatalogService", () => {
	it("lists validated ancestry records from the repository", async () => {
		const service = createService();

		const result = await service.listAncestries();
		const ancestries = expectAncestrySuccess(result);

		expect(ancestries).toHaveLength(6);
		expect(ancestries[0]).toMatchObject({
			id: "human",
			label: "Humano",
			epithet: "Os Sobreviventes de Morden",
			primordialAbilityName: "Mente Inquieta",
		});
	});

	it("finds Humano by id", async () => {
		const service = createService();

		const result = await service.findAncestryById("human");
		const ancestry = expectAncestrySuccess(result);

		expect(ancestry).toMatchObject({
			id: "human",
			label: "Humano",
			sourceFile: "docs/system/survival/01-01-humanos.md",
		});
	});

	it("rejects invalid ancestry ids before asking the repository", async () => {
		const repository = new InMemoryAncestryRepository(OFFICIAL_ANCESTRIES);
		const service = new AncestryCatalogService(repository);

		const result = await service.findAncestryById(" ");
		const failure = expectAncestryFailure(result);

		expect(failure.code).toBe("INVALID_ANCESTRY_ID");
		expect(repository.lookupCount).toBe(0);
	});

	it("returns not found when the repository has no matching ancestry", async () => {
		const service = createService();

		const result = await service.findAncestryById("missing");
		const failure = expectAncestryFailure(result);

		expect(failure.code).toBe("ANCESTRY_NOT_FOUND");
	});

	it("maps repository read failures into service failures", async () => {
		const repository = new InMemoryAncestryRepository(OFFICIAL_ANCESTRIES);
		repository.failNextList({
			code: "ANCESTRY_REPOSITORY_READ_FAILED",
			message: "Injected fake read failure.",
			details: { cause: "locked-catalog" },
		});
		const service = new AncestryCatalogService(repository);

		const result = await service.listAncestries();
		const failure = expectAncestryFailure(result);

		expect(failure).toMatchObject({
			code: "ANCESTRY_REPOSITORY_READ_FAILED",
			details: { cause: "locked-catalog" },
		});
	});

	it("rejects corrupted records returned by the repository", async () => {
		const service = new AncestryCatalogService(new CorruptAncestryRepository());

		const result = await service.listAncestries();
		const failure = expectAncestryFailure(result);

		expect(failure.code).toBe("CORRUPTED_ANCESTRY_RECORD");
	});
});

function createService(): AncestryCatalogService {
	return new AncestryCatalogService(
		new InMemoryAncestryRepository(OFFICIAL_ANCESTRIES),
	);
}

function expectAncestrySuccess<Success>(
	result: Result<Success, AncestryFailure>,
): Success {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectAncestryFailure<Success>(
	result: Result<Success, AncestryFailure>,
): AncestryFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class CorruptAncestryRepository implements AncestryRepository {
	public async list(): Promise<
		Result<readonly AncestryRecord[], AncestryRepositoryFailure>
	> {
		return ok([
			{
				...OFFICIAL_ANCESTRIES[0],
				label: "",
			} as AncestryRecord,
		]);
	}

	public async findById(): Promise<
		Result<AncestryRecord, AncestryRepositoryFailure>
	> {
		return ok({
			...OFFICIAL_ANCESTRIES[0],
			label: "",
		} as AncestryRecord);
	}
}
