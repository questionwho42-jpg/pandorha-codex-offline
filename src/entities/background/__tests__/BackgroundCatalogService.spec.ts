import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { ok } from "$lib/shared/lib/result";
import { BackgroundCatalogService } from "../domain/BackgroundCatalogService";
import type { BackgroundRepository } from "../domain/BackgroundRepository";
import {
	OFFICIAL_BACKGROUND_IDS,
	OFFICIAL_BACKGROUNDS,
} from "../model/backgroundCatalog";
import {
	type BackgroundRecord,
	backgroundSelectSchema,
} from "../model/backgroundSchema";
import type {
	BackgroundFailure,
	BackgroundRepositoryFailure,
} from "../model/backgroundTypes";
import { InMemoryBackgroundRepository } from "../testing/InMemoryBackgroundRepository";

describe("Official background catalog", () => {
	it("contains exactly the twenty official base backgrounds validated by Drizzle-Zod", () => {
		expect(OFFICIAL_BACKGROUNDS).toHaveLength(20);
		expect(OFFICIAL_BACKGROUNDS.map((background) => background.id)).toEqual([
			"acolyte",
			"aristocrat",
			"guild-artisan",
			"artist",
			"bounty-hunter",
			"charlatan",
			"criminal",
			"hermit",
			"scholar",
			"escaped-slave",
			"gladiator",
			"city-guard",
			"sailor",
			"field-medic",
			"merchant",
			"nomad",
			"pirate",
			"street-rat",
			"veteran-soldier",
			"seer",
		]);
		expect(OFFICIAL_BACKGROUND_IDS).toEqual([
			"acolyte",
			"aristocrat",
			"guild-artisan",
			"artist",
			"bounty-hunter",
			"charlatan",
			"criminal",
			"hermit",
			"scholar",
			"escaped-slave",
			"gladiator",
			"city-guard",
			"sailor",
			"field-medic",
			"merchant",
			"nomad",
			"pirate",
			"street-rat",
			"veteran-soldier",
			"seer",
		]);

		for (const background of OFFICIAL_BACKGROUNDS) {
			expect(backgroundSelectSchema.safeParse(background).success).toBe(true);
		}
	});
});

describe("BackgroundCatalogService", () => {
	it("lists validated background records from the repository", async () => {
		const service = createService();

		const result = await service.listBackgrounds();
		const backgrounds = expectBackgroundSuccess(result);

		expect(backgrounds).toHaveLength(20);
		expect(backgrounds[0]).toMatchObject({
			id: "acolyte",
			label: "Acólito",
			epithet: "O Devoto",
			originAbilityName: "Abrigo da Fé",
			talentChoiceCount: 1,
		});
	});

	it("finds Acólito by its English technical id", async () => {
		const service = createService();

		const result = await service.findBackgroundById("acolyte");
		const background = expectBackgroundSuccess(result);

		expect(background).toMatchObject({
			id: "acolyte",
			label: "Acólito",
			sourceFile: "docs/system/survival/10-antecedentes-e-origens.md",
		});
	});

	it("rejects invalid background ids before asking the repository", async () => {
		const repository = new InMemoryBackgroundRepository(OFFICIAL_BACKGROUNDS);
		const service = new BackgroundCatalogService(repository);

		const result = await service.findBackgroundById(" ");
		const failure = expectBackgroundFailure(result);

		expect(failure.code).toBe("INVALID_BACKGROUND_ID");
		expect(repository.lookupCount).toBe(0);
	});

	it("returns not found when the repository has no matching background", async () => {
		const service = createService();

		const result = await service.findBackgroundById("missing");
		const failure = expectBackgroundFailure(result);

		expect(failure.code).toBe("BACKGROUND_NOT_FOUND");
	});

	it("maps repository read failures into service failures", async () => {
		const repository = new InMemoryBackgroundRepository(OFFICIAL_BACKGROUNDS);
		repository.failNextList({
			code: "BACKGROUND_REPOSITORY_READ_FAILED",
			message: "Injected fake read failure.",
			details: { cause: "locked-catalog" },
		});
		const service = new BackgroundCatalogService(repository);

		const result = await service.listBackgrounds();
		const failure = expectBackgroundFailure(result);

		expect(failure).toMatchObject({
			code: "BACKGROUND_REPOSITORY_READ_FAILED",
			details: { cause: "locked-catalog" },
		});
	});

	it("rejects corrupted records returned by the repository", async () => {
		const service = new BackgroundCatalogService(
			new CorruptBackgroundRepository(),
		);

		const result = await service.listBackgrounds();
		const failure = expectBackgroundFailure(result);

		expect(failure.code).toBe("CORRUPTED_BACKGROUND_RECORD");
	});

	it("rejects corrupted records returned by findById", async () => {
		const service = new BackgroundCatalogService(
			new CorruptBackgroundRepository(),
		);

		const result = await service.findBackgroundById("acolyte");
		const failure = expectBackgroundFailure(result);

		expect(failure.code).toBe("CORRUPTED_BACKGROUND_RECORD");
	});
});

function createService(): BackgroundCatalogService {
	return new BackgroundCatalogService(
		new InMemoryBackgroundRepository(OFFICIAL_BACKGROUNDS),
	);
}

function expectBackgroundSuccess<Success>(
	result: Result<Success, BackgroundFailure>,
): Success {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectBackgroundFailure<Success>(
	result: Result<Success, BackgroundFailure>,
): BackgroundFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class CorruptBackgroundRepository implements BackgroundRepository {
	public async list(): Promise<
		Result<readonly BackgroundRecord[], BackgroundRepositoryFailure>
	> {
		return ok([
			{
				...OFFICIAL_BACKGROUNDS[0],
				label: "",
			} as BackgroundRecord,
		]);
	}

	public async findById(): Promise<
		Result<BackgroundRecord, BackgroundRepositoryFailure>
	> {
		return ok({
			...OFFICIAL_BACKGROUNDS[0],
			label: "",
		} as BackgroundRecord);
	}
}
