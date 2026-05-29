import type { SQL } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { DrizzleCampRepository } from "../infrastructure/DrizzleCampRepository";
import type { CampSessionRecord } from "../model/campSchema";
import type { CampRepositoryFailure } from "../model/campTypes";

const TEST_TIMESTAMP = "2026-05-27T09:00:00.000Z";

function buildCampRecord(
	patch: Partial<CampSessionRecord> = {},
): CampSessionRecord {
	return {
		id: "camp-123",
		totalTime: 12,
		sleepHours: 8,
		availableActions: 4,
		dangerCounter: 0,
		activeActivitiesJson: JSON.stringify([]),
		createdAt: TEST_TIMESTAMP,
		updatedAt: TEST_TIMESTAMP,
		...patch,
	};
}

class FakeCampDrizzleDatabase {
	public readonly insertedRecords: unknown[] = [];
	public lastSelectLimit: number | null = null;
	public updatedRecord: unknown = null;

	private selectRows: unknown[] = [];
	private nextInsertFailure: unknown = null;
	private nextSelectFailure: unknown = null;

	public queueSelectRows(rows: unknown[]): void {
		this.selectRows = rows;
	}

	public failNextInsert(error: unknown): void {
		this.nextInsertFailure = error;
	}

	public failNextSelect(error: unknown): void {
		this.nextSelectFailure = error;
	}

	// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock
	public insert(_table: any): {
		// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock
		values(record: any): {
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock
			onConflictDoUpdate(config: any): {
				run(): Promise<void>;
			};
		};
	} {
		return {
			values: (record) => ({
				onConflictDoUpdate: (config) => ({
					run: async () => {
						if (this.nextInsertFailure !== null) {
							const error = this.nextInsertFailure;
							this.nextInsertFailure = null;
							throw error;
						}
						this.insertedRecords.push(record);
						this.updatedRecord = config.set;
					},
				}),
			}),
		};
	}

	// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock
	public select(): any {
		if (this.nextSelectFailure !== null) {
			const error = this.nextSelectFailure;
			this.nextSelectFailure = null;
			throw error;
		}

		return {
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock
			from: (_table: any) => {
				// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock
				const queryResult: any = {
					where: (_condition: SQL<unknown>) => {
						return {
							limit: (limit: number) => {
								this.lastSelectLimit = limit;
								return {
									all: () => this.selectRows,
								};
							},
							all: () => this.selectRows,
						};
					},
					limit: (limit: number) => {
						this.lastSelectLimit = limit;
						return {
							all: () => this.selectRows,
						};
					},
					all: () => this.selectRows,
				};
				return queryResult;
			},
		};
	}
}

function expectSuccess<T>(result: Result<T, CampRepositoryFailure>): T {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}
	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectFailure<T>(
	result: Result<T, CampRepositoryFailure>,
): CampRepositoryFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}
	expect.fail("Expected failure, received success.");
}

describe("DrizzleCampRepository contract", () => {
	it("saves a camp session and returns the saved record after finding it", async () => {
		const db = new FakeCampDrizzleDatabase();
		const repository = new DrizzleCampRepository(db);
		const record = buildCampRecord();

		db.queueSelectRows([record]);

		const result = await repository.save(record);
		const saved = expectSuccess(result);

		expect(saved).toEqual(record);
		expect(db.insertedRecords).toEqual([record]);
	});

	it("maps Drizzle insert failures to repository write failures", async () => {
		const db = new FakeCampDrizzleDatabase();
		const repository = new DrizzleCampRepository(db);
		db.failNextInsert(new Error("database is locked"));

		const result = await repository.save(buildCampRecord());
		const failure = expectFailure(result);

		expect(failure.code).toBe("CAMP_REPOSITORY_WRITE_FAILED");
	});

	it("returns not found when missing", async () => {
		const db = new FakeCampDrizzleDatabase();
		const repository = new DrizzleCampRepository(db);
		db.queueSelectRows([]);

		const result = await repository.findById("missing-camp");
		const failure = expectFailure(result);

		expect(failure.code).toBe("CAMP_SESSION_NOT_FOUND");
	});

	it("rejects corrupted rows returned by findById", async () => {
		const db = new FakeCampDrizzleDatabase();
		const repository = new DrizzleCampRepository(db);
		db.queueSelectRows([{ id: "camp-1", totalTime: "invalid-time" }]);

		const result = await repository.findById("camp-1");
		const failure = expectFailure(result);

		expect(failure.code).toBe("CORRUPTED_CAMP_SESSION_RECORD");
	});

	it("lists all camp sessions successfully", async () => {
		const db = new FakeCampDrizzleDatabase();
		const repository = new DrizzleCampRepository(db);
		const record = buildCampRecord();
		db.queueSelectRows([record]);

		const result = await repository.listAll();
		const list = expectSuccess(result);

		expect(list).toEqual([record]);
	});

	it("fails listAll on select error", async () => {
		const db = new FakeCampDrizzleDatabase();
		const repository = new DrizzleCampRepository(db);
		db.failNextSelect(new Error("query timeout"));

		const result = await repository.listAll();
		const failure = expectFailure(result);

		expect(failure.code).toBe("CORRUPTED_CAMP_SESSION_RECORD");
	});
});
