import type { SQL } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import type { CharacterDrizzleDatabase } from "../infrastructure/DrizzleCharacterRepository";
import { DrizzleCharacterRepository } from "../infrastructure/DrizzleCharacterRepository";
import {
	type CharacterRecord,
	characters,
	type NewCharacterRecord,
} from "../model/characterSchema";
import type { CharacterRepositoryFailure } from "../model/characterTypes";
import { CharacterBuilder } from "../testing/CharacterBuilder";

const TEST_TIMESTAMP = "2026-05-02T14:49:35.000Z";

describe("DrizzleCharacterRepository contract", () => {
	it("saves a character and returns the validated inserted record", async () => {
		const db = new FakeCharacterDrizzleDatabase();
		const repository = new DrizzleCharacterRepository(db);
		const record = buildCharacterRecord();
		db.queueInsertRows([record]);

		const result = await repository.save(record);
		const saved = expectRepositorySuccess(result);

		expect(saved).toEqual(record);
		expect(db.insertedRecords).toEqual([record]);
	});

	it("rejects corrupted rows returned after insert", async () => {
		const db = new FakeCharacterDrizzleDatabase();
		const repository = new DrizzleCharacterRepository(db);
		const record = buildCharacterRecord();
		db.queueInsertRows([asCharacterRecord({ ...record, name: "" })]);

		const result = await repository.save(record);
		const failure = expectRepositoryFailure(result);

		expect(failure.code).toBe("CORRUPTED_CHARACTER_RECORD");
	});

	it("maps Drizzle insert failures to repository write failures", async () => {
		const db = new FakeCharacterDrizzleDatabase();
		const repository = new DrizzleCharacterRepository(db);
		db.failNextInsert("database is locked");

		const result = await repository.save(buildCharacterRecord());
		const failure = expectRepositoryFailure(result);

		expect(failure).toMatchObject({
			code: "CHARACTER_REPOSITORY_WRITE_FAILED",
			details: { cause: "database is locked" },
		});
	});

	it("finds a character by id and returns the validated selected record", async () => {
		const db = new FakeCharacterDrizzleDatabase();
		const repository = new DrizzleCharacterRepository(db);
		const record = buildCharacterRecord({ id: "character-2" });
		db.queueSelectRows([record]);

		const result = await repository.findById("character-2");
		const found = expectRepositorySuccess(result);

		expect(found).toEqual(record);
		expect(db.lastSelectLimit).toBe(1);
	});

	it("returns not found when Drizzle selects no character row", async () => {
		const db = new FakeCharacterDrizzleDatabase();
		const repository = new DrizzleCharacterRepository(db);
		db.queueSelectRows([]);

		const result = await repository.findById("missing-character");
		const failure = expectRepositoryFailure(result);

		expect(failure).toMatchObject({
			code: "CHARACTER_NOT_FOUND",
			details: { id: "missing-character" },
		});
	});

	it("rejects corrupted rows returned by findById", async () => {
		const db = new FakeCharacterDrizzleDatabase();
		const repository = new DrizzleCharacterRepository(db);
		db.queueSelectRows([
			asCharacterRecord({ ...buildCharacterRecord(), level: 0 }),
		]);

		const result = await repository.findById("character-1");
		const failure = expectRepositoryFailure(result);

		expect(failure.code).toBe("CORRUPTED_CHARACTER_RECORD");
	});
});

function buildCharacterRecord(
	patch: Partial<CharacterRecord> = {},
): CharacterRecord {
	return {
		...CharacterBuilder.valid().buildCreateInput(),
		id: "character-1",
		createdAt: TEST_TIMESTAMP,
		updatedAt: TEST_TIMESTAMP,
		...patch,
	};
}

function asCharacterRecord(value: unknown): CharacterRecord {
	return value as CharacterRecord;
}

function expectRepositorySuccess(
	result: Result<CharacterRecord, CharacterRepositoryFailure>,
): CharacterRecord {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectRepositoryFailure(
	result: Result<CharacterRecord, CharacterRepositoryFailure>,
): CharacterRepositoryFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class FakeCharacterDrizzleDatabase implements CharacterDrizzleDatabase {
	public readonly insertedRecords: NewCharacterRecord[] = [];
	public lastSelectLimit: number | null = null;

	private insertRows: CharacterRecord[] = [];
	private selectRows: CharacterRecord[] = [];
	private nextInsertFailure: unknown = null;

	public queueInsertRows(rows: CharacterRecord[]): void {
		this.insertRows = rows;
	}

	public queueSelectRows(rows: CharacterRecord[]): void {
		this.selectRows = rows;
	}

	public failNextInsert(error: unknown): void {
		this.nextInsertFailure = error;
	}

	public insert(table: typeof characters): {
		values(record: NewCharacterRecord): {
			returning(): Promise<CharacterRecord[]>;
		};
	} {
		expect(table).toBe(characters);

		return {
			values: (record) => ({
				returning: async () => {
					this.insertedRecords.push(record);
					if (this.nextInsertFailure !== null) {
						const error = this.nextInsertFailure;
						this.nextInsertFailure = null;
						return Promise.reject(error);
					}

					return this.insertRows;
				},
			}),
		};
	}

	public select(): {
		from(table: typeof characters): {
			where(condition: SQL<unknown>): {
				limit(limit: number): Promise<CharacterRecord[]>;
			};
		};
	} {
		return {
			from: (table) => {
				expect(table).toBe(characters);

				return {
					where: (condition) => {
						expect(condition).toBeDefined();

						return {
							limit: async (limit) => {
								this.lastSelectLimit = limit;
								return this.selectRows;
							},
						};
					},
				};
			},
		};
	}
}
