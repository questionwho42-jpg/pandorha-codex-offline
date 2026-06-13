import { describe, expect, it } from "vitest";
import type { SpellRecord } from "../../model/spellSchema";
import { DrizzleSpellCatalogRepository } from "../DrizzleSpellCatalogRepository";

const TEST_SPELL: SpellRecord = {
	id: "light",
	label: "Luz",
	circle: 0,
	etherCost: 0,
	school: "evocation",
	castingKind: "instant",
	components: ["V", "M"],
	requiresAttackRoll: false,
	requiresSavingThrow: false,
	damageText: null,
	tags: ["utility"],
	sourceFile: "docs/spell.md",
	summary: "Um objeto emite luz",
	targetEffects: [],
	baseDuration: 0,
	upcastFormula: {
		etherCostPerCircle: 0,
		durationIncreasePerCircle: 0,
	},
};

class FakeSpellDrizzleDb {
	public selectRows: any[] = [];
	public getRow: any = null;
	public shouldFail = false;

	public select(): any {
		if (this.shouldFail) {
			throw new TypeError("fake db error");
		}
		return {
			from: () => ({
				all: () => this.selectRows,
				where: () => ({
					get: () => this.getRow,
					all: () => this.selectRows,
				}),
			}),
		};
	}
}

describe("DrizzleSpellCatalogRepository", () => {
	it("lists spells successfully", async () => {
		const db = new FakeSpellDrizzleDb();
		db.selectRows = [TEST_SPELL];
		const repo = new DrizzleSpellCatalogRepository(db);

		const result = await repo.listSpells();
		expect(result.success).toBe(true);
		expect(result.success && result.data).toEqual([TEST_SPELL]);
	});

	it("returns fail when db fails on listSpells", async () => {
		const db = new FakeSpellDrizzleDb();
		db.shouldFail = true;
		const repo = new DrizzleSpellCatalogRepository(db);

		const result = await repo.listSpells();
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"SPELL_REPOSITORY_READ_FAILED",
		);
	});

	it("finds spell by id successfully", async () => {
		const db = new FakeSpellDrizzleDb();
		db.getRow = TEST_SPELL;
		const repo = new DrizzleSpellCatalogRepository(db);

		const result = await repo.findSpellById("light");
		expect(result.success).toBe(true);
		expect(result.success && result.data).toEqual(TEST_SPELL);
	});

	it("returns SPELL_REPOSITORY_LOOKUP_FAILED when missing", async () => {
		const db = new FakeSpellDrizzleDb();
		db.getRow = null;
		const repo = new DrizzleSpellCatalogRepository(db);

		const result = await repo.findSpellById("missing");
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"SPELL_REPOSITORY_LOOKUP_FAILED",
		);
	});

	it("returns fail when db fails on findSpellById", async () => {
		const db = new FakeSpellDrizzleDb();
		db.shouldFail = true;
		const repo = new DrizzleSpellCatalogRepository(db);

		const result = await repo.findSpellById("light");
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"SPELL_REPOSITORY_READ_FAILED",
		);
	});

	it("lists spells by circle successfully", async () => {
		const db = new FakeSpellDrizzleDb();
		db.selectRows = [TEST_SPELL];
		const repo = new DrizzleSpellCatalogRepository(db);

		const result = await repo.listSpellsByCircle(0);
		expect(result.success).toBe(true);
		expect(result.success && result.data).toEqual([TEST_SPELL]);
	});

	it("returns fail when db fails on listSpellsByCircle", async () => {
		const db = new FakeSpellDrizzleDb();
		db.shouldFail = true;
		const repo = new DrizzleSpellCatalogRepository(db);

		const result = await repo.listSpellsByCircle(0);
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"SPELL_REPOSITORY_READ_FAILED",
		);
	});
});
