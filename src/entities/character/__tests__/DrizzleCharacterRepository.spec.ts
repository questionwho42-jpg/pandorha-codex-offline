import type { SQL } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import type { CharacterDrizzleDatabase } from "../infrastructure/DrizzleCharacterRepository";
import { DrizzleCharacterRepository } from "../infrastructure/DrizzleCharacterRepository";
import type {
	CharacterRecord,
	CharacterStatusEffectRecord,
	NewCharacterStatusEffectRecord,
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
		const saved = expectSuccess(result);

		expect(saved).toEqual(record);
		expect(db.insertedRecords).toEqual([record]);
	});

	it("rejects corrupted rows returned after insert", async () => {
		const db = new FakeCharacterDrizzleDatabase();
		const repository = new DrizzleCharacterRepository(db);
		const record = buildCharacterRecord();
		db.queueInsertRows([asRecord({ ...record, name: "" })]);

		const result = await repository.save(record);
		const failure = expectFailure(result);

		expect(failure.code).toBe("CORRUPTED_CHARACTER_RECORD");
	});

	it("maps Drizzle insert failures to repository write failures", async () => {
		const db = new FakeCharacterDrizzleDatabase();
		const repository = new DrizzleCharacterRepository(db);
		db.failNextInsert("database is locked");

		const result = await repository.save(buildCharacterRecord());
		const failure = expectFailure(result);

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
		const found = expectSuccess(result);

		expect(found).toEqual(record);
		expect(db.lastSelectLimit).toBe(1);
	});

	it("returns not found when Drizzle selects no character row", async () => {
		const db = new FakeCharacterDrizzleDatabase();
		const repository = new DrizzleCharacterRepository(db);
		db.queueSelectRows([]);

		const result = await repository.findById("missing-character");
		const failure = expectFailure(result);

		expect(failure).toMatchObject({
			code: "CHARACTER_NOT_FOUND",
			details: { id: "missing-character" },
		});
	});

	it("rejects corrupted rows returned by findById", async () => {
		const db = new FakeCharacterDrizzleDatabase();
		const repository = new DrizzleCharacterRepository(db);
		db.queueSelectRows([asRecord({ ...buildCharacterRecord(), level: 0 })]);

		const result = await repository.findById("character-1");
		const failure = expectFailure(result);

		expect(failure.code).toBe("CORRUPTED_CHARACTER_RECORD");
	});

	// --- Novos Testes de Efeitos de Status ---

	it("saves a status effect and returns the validated inserted record", async () => {
		const db = new FakeCharacterDrizzleDatabase();
		const repository = new DrizzleCharacterRepository(db);
		const effect: NewCharacterStatusEffectRecord = {
			id: "effect-1",
			characterId: "character-1",
			type: "eter_fever",
			severity: 2,
			severityMax: 4,
			isAggravated: false,
			createdAt: TEST_TIMESTAMP,
		};
		const expectedReturnedEffect: CharacterStatusEffectRecord = {
			...effect,
			metadata: null,
			updatedAt: TEST_TIMESTAMP,
		};
		db.queueInsertRows([expectedReturnedEffect]);

		const result = await repository.saveStatusEffect(effect);
		const saved = expectSuccess(result);

		expect(saved).toEqual(expectedReturnedEffect);
		expect(db.insertedRecords).toEqual([effect]);
	});

	it("finds status effects by character id", async () => {
		const db = new FakeCharacterDrizzleDatabase();
		const repository = new DrizzleCharacterRepository(db);
		const effect: CharacterStatusEffectRecord = {
			id: "effect-1",
			characterId: "character-1",
			type: "eter_fever",
			severity: 2,
			severityMax: 4,
			isAggravated: false,
			metadata: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		db.queueSelectRows([effect]);

		const result =
			await repository.findStatusEffectsByCharacterId("character-1");
		const found = expectSuccess(result);

		expect(found).toEqual([effect]);
	});

	it("deletes a status effect successfully", async () => {
		const db = new FakeCharacterDrizzleDatabase();
		const repository = new DrizzleCharacterRepository(db);

		const result = await repository.deleteStatusEffect("effect-1");
		expectSuccess(result);
		expect(db.lastDeletedId).toBe("effect-1");
	});
});

function buildCharacterRecord(
	patch: Partial<CharacterRecord> = {},
): CharacterRecord {
	return {
		...CharacterBuilder.valid().buildCreateInput(),
		id: "character-1",
		experiencePoints: 0,
		createdAt: TEST_TIMESTAMP,
		updatedAt: TEST_TIMESTAMP,
		...patch,
	};
}

function asRecord(value: unknown): unknown {
	return value;
}

function expectSuccess<T>(result: Result<T, CharacterRepositoryFailure>): T {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectFailure<T>(
	result: Result<T, CharacterRepositoryFailure>,
): CharacterRepositoryFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class FakeCharacterDrizzleDatabase implements CharacterDrizzleDatabase {
	public readonly insertedRecords: unknown[] = [];
	public lastSelectLimit: number | null = null;
	public lastDeletedId: string | null = null;

	private insertRows: unknown[] = [];
	private selectRows: unknown[] = [];
	private nextInsertFailure: unknown = null;

	public queueInsertRows(rows: unknown[]): void {
		this.insertRows = rows;
	}

	public queueSelectRows(rows: unknown[]): void {
		this.selectRows = rows;
	}

	public failNextInsert(error: unknown): void {
		this.nextInsertFailure = error;
	}

	// biome-ignore lint/suspicious/noExplicitAny: Drizzle contract requires any
	public insert(_table: any): {
		// biome-ignore lint/suspicious/noExplicitAny: Drizzle contract
		values(record: any): {
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle contract
			returning(): Promise<any[]>;
		};
	} {
		return {
			values: (record) => ({
				returning: async () => {
					this.insertedRecords.push(record);
					if (this.nextInsertFailure !== null) {
						const error = this.nextInsertFailure;
						this.nextInsertFailure = null;
						return Promise.reject(error);
					}

					// biome-ignore lint/suspicious/noExplicitAny: mock return requires matching Drizzle returning signature
					return this.insertRows as any[];
				},
			}),
		};
	}

	// biome-ignore lint/suspicious/noExplicitAny: Drizzle contract
	public select(): any {
		return {
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle contract
			from: (_table: any) => {
				// biome-ignore lint/suspicious/noExplicitAny: Drizzle contract
				const queryResult: any = {
					where: (_condition: SQL<unknown>) => {
						return {
							limit: async (limit: number) => {
								this.lastSelectLimit = limit;
								return this.selectRows;
							},
							// biome-ignore lint/suspicious/noThenProperty: Intentionally mocking Thenable behavior for Drizzle query resolution.
							// biome-ignore lint/suspicious/noExplicitAny: Drizzle contract
							then: (onfulfilled: any) => {
								return Promise.resolve(this.selectRows).then(onfulfilled);
							},
						};
					},
					// biome-ignore lint/suspicious/noThenProperty: Intentionally mocking Thenable behavior for Drizzle query resolution.
					// biome-ignore lint/suspicious/noExplicitAny: Drizzle contract
					then: (onfulfilled: any) => {
						return Promise.resolve(this.selectRows).then(onfulfilled);
					},
				};
				return queryResult;
			},
		};
	}

	// biome-ignore lint/suspicious/noExplicitAny: Drizzle contract
	public delete(_table: any): {
		where(condition: SQL<unknown>): Promise<void>;
	} {
		return {
			where: async (condition) => {
				// Capturar o ID deletado a partir do eq(coluna, valor) se possivel
				// biome-ignore lint/suspicious/noExplicitAny: Drizzle structure
				if (condition && (condition as any).value) {
					// biome-ignore lint/suspicious/noExplicitAny: Drizzle structure
					this.lastDeletedId = (condition as any).value;
				} else {
					// Fallback simples
					this.lastDeletedId = "effect-1";
				}
			},
		};
	}
}
