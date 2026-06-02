import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { ok } from "$lib/shared/lib/result";
import { CharacterClassCatalogService } from "../domain/CharacterClassCatalogService";
import type { CharacterClassRepository } from "../domain/CharacterClassRepository";
import {
	OFFICIAL_CHARACTER_CLASS_IDS,
	OFFICIAL_CHARACTER_CLASSES,
} from "../model/characterClassCatalog";
import {
	type CharacterClassRecord,
	characterClassSelectSchema,
} from "../model/characterClassSchema";
import type {
	CharacterClassFailure,
	CharacterClassRepositoryFailure,
} from "../model/characterClassTypes";
import { InMemoryCharacterClassRepository } from "../testing/InMemoryCharacterClassRepository";

describe("Official character class catalog", () => {
	it("contains exactly the four official base classes validated by Drizzle-Zod", () => {
		expect(OFFICIAL_CHARACTER_CLASSES).toHaveLength(4);
		expect(
			OFFICIAL_CHARACTER_CLASSES.map((characterClass) => characterClass.id),
		).toEqual(["vanguard", "weaver", "emissary", "hunter"]);
		expect(OFFICIAL_CHARACTER_CLASS_IDS).toEqual([
			"vanguard",
			"weaver",
			"emissary",
			"hunter",
		]);

		for (const characterClass of OFFICIAL_CHARACTER_CLASSES) {
			expect(characterClassSelectSchema.safeParse(characterClass).success).toBe(
				true,
			);
		}
	});
});

describe("CharacterClassCatalogService", () => {
	it("lists validated character class records from the repository", async () => {
		const service = createService();

		const result = await service.listCharacterClasses();
		const characterClasses = expectCharacterClassSuccess(result);

		expect(characterClasses).toHaveLength(4);
		expect(characterClasses[0]).toMatchObject({
			id: "vanguard",
			label: "Vanguarda",
			epithet: "A Legião de Ferro",
			baseHp: 10,
			passiveAbilityName: "Postura de Combate",
		});
	});

	it("finds Vanguarda by its English technical id", async () => {
		const service = createService();

		const result = await service.findCharacterClassById("vanguard");
		const characterClass = expectCharacterClassSuccess(result);

		expect(characterClass).toMatchObject({
			id: "vanguard",
			label: "Vanguarda",
			sourceFile: "docs/system/survival/05-01-vanguarda.md",
		});
	});

	it("rejects invalid character class ids before asking the repository", async () => {
		const repository = new InMemoryCharacterClassRepository(
			OFFICIAL_CHARACTER_CLASSES,
		);
		const service = new CharacterClassCatalogService(repository);

		const result = await service.findCharacterClassById(" ");
		const failure = expectCharacterClassFailure(result);

		expect(failure.code).toBe("INVALID_CHARACTER_CLASS_ID");
		expect(repository.lookupCount).toBe(0);
	});

	it("returns not found when the repository has no matching character class", async () => {
		const service = createService();

		const result = await service.findCharacterClassById("missing");
		const failure = expectCharacterClassFailure(result);

		expect(failure.code).toBe("CHARACTER_CLASS_NOT_FOUND");
	});

	it("maps repository read failures into service failures", async () => {
		const repository = new InMemoryCharacterClassRepository(
			OFFICIAL_CHARACTER_CLASSES,
		);
		repository.failNextList({
			code: "CHARACTER_CLASS_REPOSITORY_READ_FAILED",
			message: "Injected fake read failure.",
			details: { cause: "locked-catalog" },
		});
		const service = new CharacterClassCatalogService(repository);

		const result = await service.listCharacterClasses();
		const failure = expectCharacterClassFailure(result);

		expect(failure).toMatchObject({
			code: "CHARACTER_CLASS_REPOSITORY_READ_FAILED",
			details: { cause: "locked-catalog" },
		});
	});

	it("rejects corrupted records returned by the repository", async () => {
		const service = new CharacterClassCatalogService(
			new CorruptCharacterClassRepository(),
		);

		const result = await service.listCharacterClasses();
		const failure = expectCharacterClassFailure(result);

		expect(failure.code).toBe("CORRUPTED_CHARACTER_CLASS_RECORD");
	});

	it("rejects corrupted records returned by findById", async () => {
		const service = new CharacterClassCatalogService(
			new CorruptCharacterClassRepository(),
		);

		const result = await service.findCharacterClassById("vanguard");
		const failure = expectCharacterClassFailure(result);

		expect(failure.code).toBe("CORRUPTED_CHARACTER_CLASS_RECORD");
	});
});

function createService(): CharacterClassCatalogService {
	return new CharacterClassCatalogService(
		new InMemoryCharacterClassRepository(OFFICIAL_CHARACTER_CLASSES),
	);
}

function expectCharacterClassSuccess<Success>(
	result: Result<Success, CharacterClassFailure>,
): Success {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectCharacterClassFailure<Success>(
	result: Result<Success, CharacterClassFailure>,
): CharacterClassFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class CorruptCharacterClassRepository implements CharacterClassRepository {
	public async list(): Promise<
		Result<readonly CharacterClassRecord[], CharacterClassRepositoryFailure>
	> {
		return ok([
			{
				...OFFICIAL_CHARACTER_CLASSES[0],
				label: "",
			} as CharacterClassRecord,
		]);
	}

	public async findById(): Promise<
		Result<CharacterClassRecord, CharacterClassRepositoryFailure>
	> {
		return ok({
			...OFFICIAL_CHARACTER_CLASSES[0],
			label: "",
		} as CharacterClassRecord);
	}
}
