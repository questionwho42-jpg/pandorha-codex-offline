import { describe, expect, it } from "vitest";
import type { BackgroundRecord } from "../../model/backgroundSchema";
import { DrizzleBackgroundRepository } from "../DrizzleBackgroundRepository";

const TEST_BACKGROUND: BackgroundRecord = {
	id: "acolyte",
	label: "Acólito",
	epithet: "O Devoto",
	sourceFile: "docs/background.md",
	originAbilityName: "Abrigo da Fé",
	originAbilityDescription: "Desc",
	talentChoiceCount: 1,
	talentOptionsText: "Talentos",
};

class FakeBackgroundDrizzleDb {
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

describe("DrizzleBackgroundRepository", () => {
	it("lists backgrounds successfully", async () => {
		const db = new FakeBackgroundDrizzleDb();
		db.selectRows = [TEST_BACKGROUND];
		const repo = new DrizzleBackgroundRepository(db);

		const result = await repo.list();
		expect(result.success).toBe(true);
		expect(result.success && result.data).toEqual([TEST_BACKGROUND]);
	});

	it("returns fail when db fails on list", async () => {
		const db = new FakeBackgroundDrizzleDb();
		db.shouldFail = true;
		const repo = new DrizzleBackgroundRepository(db);

		const result = await repo.list();
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"BACKGROUND_REPOSITORY_READ_FAILED",
		);
	});

	it("finds background by id successfully", async () => {
		const db = new FakeBackgroundDrizzleDb();
		db.getRow = TEST_BACKGROUND;
		const repo = new DrizzleBackgroundRepository(db);

		const result = await repo.findById("acolyte");
		expect(result.success).toBe(true);
		expect(result.success && result.data).toEqual(TEST_BACKGROUND);
	});

	it("returns BACKGROUND_NOT_FOUND when missing", async () => {
		const db = new FakeBackgroundDrizzleDb();
		db.getRow = null;
		const repo = new DrizzleBackgroundRepository(db);

		const result = await repo.findById("missing");
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"BACKGROUND_NOT_FOUND",
		);
	});

	it("returns fail when db fails on findById", async () => {
		const db = new FakeBackgroundDrizzleDb();
		db.shouldFail = true;
		const repo = new DrizzleBackgroundRepository(db);

		const result = await repo.findById("acolyte");
		expect(result.success).toBe(false);
		expect(result.success ? null : result.error.code).toBe(
			"BACKGROUND_REPOSITORY_READ_FAILED",
		);
	});
});
