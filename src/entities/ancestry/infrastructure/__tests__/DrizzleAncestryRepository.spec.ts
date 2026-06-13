import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import type {
	AncestryRecord,
	AncestryTraitLinkRecord,
	AncestryTraitRecord,
} from "../../model/ancestrySchema";
import type {
	AncestryRepositoryFailure,
	AncestryTraitRepositoryFailure,
} from "../../model/ancestryTypes";
import { DrizzleAncestryRepository } from "../DrizzleAncestryRepository";
import { DrizzleAncestryTraitRepository } from "../DrizzleAncestryTraitRepository";

const TEST_ANCESTRY: AncestryRecord = {
	id: "human",
	label: "Humano",
	epithet: "Os Sobreviventes de Morden",
	sourceFile: "docs/human.md",
	initialBonus: "+1 em Eixo",
	primordialAbilityName: "Mente Inquieta",
	primordialAbilityDescription: "Desc",
};

const TEST_TRAIT: AncestryTraitRecord = {
	id: "human-trait-1",
	label: "Traço Humano",
	description: "Uma descrição legal",
	sourceFile: "docs/human.md",
};

const TEST_LINK: AncestryTraitLinkRecord = {
	ancestryId: "human",
	traitId: "human-trait-1",
};

class FakeAncestryDrizzleDb {
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
				innerJoin: () => ({
					where: () => ({
						all: () => this.selectRows,
					}),
				}),
			}),
		};
	}
}

describe("DrizzleAncestryRepository", () => {
	it("lists ancestries successfully", async () => {
		const db = new FakeAncestryDrizzleDb();
		db.selectRows = [TEST_ANCESTRY];
		const repo = new DrizzleAncestryRepository(db);

		const result = await repo.list();
		expect(result.success).toBe(true);
		expect(result.success && result.data).toEqual([TEST_ANCESTRY]);
	});

	it("returns fail when db fails on list", async () => {
		const db = new FakeAncestryDrizzleDb();
		db.shouldFail = true;
		const repo = new DrizzleAncestryRepository(db);

		const result = await repo.list();
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"ANCESTRY_REPOSITORY_READ_FAILED",
		);
	});

	it("finds ancestry by id successfully", async () => {
		const db = new FakeAncestryDrizzleDb();
		db.getRow = TEST_ANCESTRY;
		const repo = new DrizzleAncestryRepository(db);

		const result = await repo.findById("human");
		expect(result.success).toBe(true);
		expect(result.success && result.data).toEqual(TEST_ANCESTRY);
	});

	it("returns ANCESTRY_NOT_FOUND when missing", async () => {
		const db = new FakeAncestryDrizzleDb();
		db.getRow = null;
		const repo = new DrizzleAncestryRepository(db);

		const result = await repo.findById("missing");
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"ANCESTRY_NOT_FOUND",
		);
	});

	it("returns fail when db fails on findById", async () => {
		const db = new FakeAncestryDrizzleDb();
		db.shouldFail = true;
		const repo = new DrizzleAncestryRepository(db);

		const result = await repo.findById("human");
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"ANCESTRY_REPOSITORY_READ_FAILED",
		);
	});
});

describe("DrizzleAncestryTraitRepository", () => {
	it("lists traits by ancestry successfully", async () => {
		const db = new FakeAncestryDrizzleDb();
		db.selectRows = [TEST_TRAIT];
		const repo = new DrizzleAncestryTraitRepository(db);

		const result = await repo.listTraitsByAncestry("human");
		expect(result.success).toBe(true);
		expect(result.success && result.data).toEqual([TEST_TRAIT]);
	});

	it("returns fail when db fails on listTraitsByAncestry", async () => {
		const db = new FakeAncestryDrizzleDb();
		db.shouldFail = true;
		const repo = new DrizzleAncestryTraitRepository(db);

		const result = await repo.listTraitsByAncestry("human");
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"ANCESTRY_TRAIT_REPOSITORY_READ_FAILED",
		);
	});

	it("finds traits by ids successfully", async () => {
		const db = new FakeAncestryDrizzleDb();
		db.selectRows = [TEST_TRAIT];
		const repo = new DrizzleAncestryTraitRepository(db);

		const result = await repo.findTraitsByIds(["human-trait-1"]);
		expect(result.success).toBe(true);
		expect(result.success && result.data).toEqual([TEST_TRAIT]);
	});

	it("returns empty array when list of ids is empty", async () => {
		const db = new FakeAncestryDrizzleDb();
		const repo = new DrizzleAncestryTraitRepository(db);

		const result = await repo.findTraitsByIds([]);
		expect(result.success).toBe(true);
		expect(result.success && result.data).toEqual([]);
	});

	it("returns fail when db fails on findTraitsByIds", async () => {
		const db = new FakeAncestryDrizzleDb();
		db.shouldFail = true;
		const repo = new DrizzleAncestryTraitRepository(db);

		const result = await repo.findTraitsByIds(["human-trait-1"]);
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"ANCESTRY_TRAIT_REPOSITORY_READ_FAILED",
		);
	});

	it("lists links by ancestry successfully", async () => {
		const db = new FakeAncestryDrizzleDb();
		db.selectRows = [TEST_LINK];
		const repo = new DrizzleAncestryTraitRepository(db);

		const result = await repo.listLinksByAncestry("human");
		expect(result.success).toBe(true);
		expect(result.success && result.data).toEqual([TEST_LINK]);
	});

	it("returns fail when db fails on listLinksByAncestry", async () => {
		const db = new FakeAncestryDrizzleDb();
		db.shouldFail = true;
		const repo = new DrizzleAncestryTraitRepository(db);

		const result = await repo.listLinksByAncestry("human");
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"ANCESTRY_TRAIT_REPOSITORY_READ_FAILED",
		);
	});
});
