import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { ok } from "$lib/shared/lib/result";
import type { SpellCatalogRepository } from "../domain/SpellCatalogRepository";
import { SpellCatalogService } from "../domain/SpellCatalogService";
import { OFFICIAL_SPELLS } from "../model/spellCatalog";
import { type SpellRecord, spellSelectSchema } from "../model/spellSchema";
import type { SpellFailure, SpellRepositoryFailure } from "../model/spellTypes";
import { InMemorySpellCatalogRepository } from "../testing/InMemorySpellCatalogRepository";

describe("Official spell catalog", () => {
	it("contains the minimum validated circle 0 spells", () => {
		expect(OFFICIAL_SPELLS).toHaveLength(9);
		expect(OFFICIAL_SPELLS.map((spell) => spell.id)).toEqual([
			"light",
			"mending",
			"mage-hand",
			"etheric-dart",
			"ray-of-frost",
			"sacred-flame",
			"silence",
			"hold-person",
			"bleeding-strike",
		]);

		for (const spell of OFFICIAL_SPELLS) {
			expect(spellSelectSchema.safeParse(spell).success).toBe(true);
			expect(spell.id).toMatch(/^[a-z][a-z0-9-]*$/);
		}
	});
});

describe("SpellCatalogService", () => {
	it("lists validated spell records from the repository", async () => {
		const service = createService();

		const result = await service.listSpells();
		const spells = expectSpellSuccess(result);

		expect(spells).toHaveLength(9);
		expect(spells[0]).toMatchObject({
			id: "light",
			label: "Luz",
			circle: 0,
			etherCost: 0,
		});
	});

	it("finds light by its English technical id", async () => {
		const service = createService();

		const result = await service.findSpellById("light");
		const spell = expectSpellSuccess(result);

		expect(spell).toMatchObject({
			id: "light",
			label: "Luz",
			circle: 0,
			etherCost: 0,
			sourceFile: "docs/system/magic/12-02-grimorio-circulo-0.md",
		});
	});

	it("marks ray of frost as a magic attack with damage text", async () => {
		const service = createService();

		const result = await service.findSpellById("ray-of-frost");
		const spell = expectSpellSuccess(result);

		expect(spell.requiresAttackRoll).toBe(true);
		expect(spell.requiresSavingThrow).toBe(false);
		expect(spell.damageText).toBe("1d8 de dano de Frio");
		expect(spell.tags).toContain("spell-attack");
	});

	it("marks sacred flame as a saving throw spell without an attack roll", async () => {
		const service = createService();

		const result = await service.findSpellById("sacred-flame");
		const spell = expectSpellSuccess(result);

		expect(spell.requiresAttackRoll).toBe(false);
		expect(spell.requiresSavingThrow).toBe(true);
		expect(spell.damageText).toBe("1d8 de dano Radiante");
		expect(spell.tags).toContain("saving-throw");
	});

	it("lists spells by validated circle", async () => {
		const service = createService();

		const result = await service.listSpellsByCircle(0);
		const spells = expectSpellSuccess(result);

		expect(spells).toHaveLength(6);
		expect(spells.every((spell) => spell.circle === 0)).toBe(true);
	});

	it("rejects invalid spell ids before asking the repository", async () => {
		const repository = createRepository();
		const service = new SpellCatalogService(repository);

		const result = await service.findSpellById("Luz");
		const failure = expectSpellFailure(result);

		expect(failure.code).toBe("INVALID_SPELL_ID");
		expect(repository.spellLookupCount).toBe(0);
	});

	it("rejects invalid circles before asking the repository", async () => {
		const repository = createRepository();
		const service = new SpellCatalogService(repository);

		const result = await service.listSpellsByCircle(11);
		const failure = expectSpellFailure(result);

		expect(failure.code).toBe("INVALID_SPELL_CIRCLE");
		expect(repository.circleLookupCount).toBe(0);
	});

	it("returns not found for missing spell ids", async () => {
		const service = createService();

		const result = await service.findSpellById("missing-spell");
		const failure = expectSpellFailure(result);

		expect(failure.code).toBe("SPELL_NOT_FOUND");
	});

	it("maps repository read failures into service failures", async () => {
		const repository = createRepository();
		repository.failNextSpellList({
			code: "SPELL_REPOSITORY_READ_FAILED",
			message: "Injected spell list failure.",
			details: { cause: "locked-spell-catalog" },
		});
		repository.failNextSpellFind({
			code: "SPELL_REPOSITORY_LOOKUP_FAILED",
			message: "Injected spell lookup failure.",
			details: { cause: "locked-spell-entry" },
		});
		repository.failNextCircleList({
			code: "SPELL_REPOSITORY_READ_FAILED",
			message: "Injected circle list failure.",
			details: { cause: "locked-circle-catalog" },
		});
		const service = new SpellCatalogService(repository);

		expect(expectSpellFailure(await service.listSpells())).toMatchObject({
			code: "SPELL_REPOSITORY_READ_FAILED",
			details: { cause: "locked-spell-catalog" },
		});
		expect(
			expectSpellFailure(await service.findSpellById("light")),
		).toMatchObject({
			code: "SPELL_REPOSITORY_LOOKUP_FAILED",
			details: { cause: "locked-spell-entry" },
		});
		expect(
			expectSpellFailure(await service.listSpellsByCircle(0)),
		).toMatchObject({
			code: "SPELL_REPOSITORY_READ_FAILED",
			details: { cause: "locked-circle-catalog" },
		});
	});

	it("rejects corrupted records returned by the repository", async () => {
		const service = new SpellCatalogService(new CorruptSpellRepository());

		expect(expectSpellFailure(await service.listSpells()).code).toBe(
			"CORRUPTED_SPELL_RECORD",
		);
		expect(expectSpellFailure(await service.findSpellById("light")).code).toBe(
			"CORRUPTED_SPELL_RECORD",
		);
		expect(expectSpellFailure(await service.listSpellsByCircle(0)).code).toBe(
			"CORRUPTED_SPELL_RECORD",
		);
	});
});

function createRepository(): InMemorySpellCatalogRepository {
	return new InMemorySpellCatalogRepository({
		spells: OFFICIAL_SPELLS,
	});
}

function createService(): SpellCatalogService {
	return new SpellCatalogService(createRepository());
}

function expectSpellSuccess<Success>(
	result: Result<Success, SpellFailure>,
): Success {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectSpellFailure<Success>(
	result: Result<Success, SpellFailure>,
): SpellFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class CorruptSpellRepository implements SpellCatalogRepository {
	public async listSpells(): Promise<
		Result<readonly SpellRecord[], SpellRepositoryFailure>
	> {
		return ok([
			{
				...OFFICIAL_SPELLS[0],
				label: "",
			} as SpellRecord,
		]);
	}

	public async findSpellById(): Promise<
		Result<SpellRecord, SpellRepositoryFailure>
	> {
		return ok({
			...OFFICIAL_SPELLS[0],
			circle: 99,
		} as SpellRecord);
	}

	public async listSpellsByCircle(): Promise<
		Result<readonly SpellRecord[], SpellRepositoryFailure>
	> {
		return ok([
			{
				...OFFICIAL_SPELLS[0],
				components: [],
			} as SpellRecord,
		]);
	}
}
