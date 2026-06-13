import { describe, expect, it } from "vitest";
import type { CharacterClassRecord } from "../../model/characterClassSchema";
import { DrizzleCharacterClassRepository } from "../DrizzleCharacterClassRepository";

const TEST_CLASS: CharacterClassRecord = {
	id: "vanguard",
	label: "Vanguarda",
	epithet: "A Legião de Ferro",
	sourceFile: "docs/class.md",
	primaryAttributesText: "Físico",
	baseHp: 10,
	resourceText: "Nenhum",
	equipmentText: "Armas",
	passiveAbilityName: "Postura",
	passiveAbilityDescription: "Desc",
	initialTalentChoiceCount: 2,
	initialTalentOptionsText: "Talentos",
};

class FakeClassDrizzleDb {
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
				}),
			}),
		};
	}
}

describe("DrizzleCharacterClassRepository", () => {
	it("lists classes successfully", async () => {
		const db = new FakeClassDrizzleDb();
		db.selectRows = [TEST_CLASS];
		const repo = new DrizzleCharacterClassRepository(db);

		const result = await repo.list();
		expect(result.success).toBe(true);
		expect(result.success && result.data).toEqual([TEST_CLASS]);
	});

	it("returns fail when db fails on list", async () => {
		const db = new FakeClassDrizzleDb();
		db.shouldFail = true;
		const repo = new DrizzleCharacterClassRepository(db);

		const result = await repo.list();
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"CHARACTER_CLASS_REPOSITORY_READ_FAILED",
		);
	});

	it("finds class by id successfully", async () => {
		const db = new FakeClassDrizzleDb();
		db.getRow = TEST_CLASS;
		const repo = new DrizzleCharacterClassRepository(db);

		const result = await repo.findById("vanguard");
		expect(result.success).toBe(true);
		expect(result.success && result.data).toEqual(TEST_CLASS);
	});

	it("returns CHARACTER_CLASS_NOT_FOUND when missing", async () => {
		const db = new FakeClassDrizzleDb();
		db.getRow = null;
		const repo = new DrizzleCharacterClassRepository(db);

		const result = await repo.findById("missing");
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"CHARACTER_CLASS_NOT_FOUND",
		);
	});

	it("returns fail when db fails on findById", async () => {
		const db = new FakeClassDrizzleDb();
		db.shouldFail = true;
		const repo = new DrizzleCharacterClassRepository(db);

		const result = await repo.findById("vanguard");
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"CHARACTER_CLASS_REPOSITORY_READ_FAILED",
		);
	});
});
