import type { SQL } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { DrizzleInvestigationRepository } from "../infrastructure/DrizzleInvestigationRepository";
import type { InvestigationRecord } from "../model/investigationSchema";
import type { InvestigationRepositoryFailure } from "../model/investigationTypes";

const TEST_TIMESTAMP = "2026-05-27T09:00:00.000Z";

function buildInvestigationRecord(
	patch: Partial<InvestigationRecord> = {},
): InvestigationRecord {
	return {
		id: "project-123",
		targetId: "monster-1",
		targetName: "Rato Gigante",
		type: "short_rest",
		tier: 1,
		dc: 12,
		successesRequired: 3,
		successesAccumulated: 0,
		failuresMax: 1,
		failuresAccumulated: 0,
		status: "active",
		goldCostPerTest: 0,
		translatedPercent: 0,
		discoveredSecrets: "",
		createdAt: TEST_TIMESTAMP,
		updatedAt: TEST_TIMESTAMP,
		...patch,
	};
}

class FakeInvestigationDrizzleDatabase {
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

	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database contract mock
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

	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database contract mock
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

function expectSuccess<T>(
	result: Result<T, InvestigationRepositoryFailure>,
): T {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}
	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectFailure<T>(
	result: Result<T, InvestigationRepositoryFailure>,
): InvestigationRepositoryFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}
	expect.fail("Expected failure, received success.");
}

describe("DrizzleInvestigationRepository contract", () => {
	it("saves an investigation and returns the saved record after finding it", async () => {
		const db = new FakeInvestigationDrizzleDatabase();
		const repository = new DrizzleInvestigationRepository(db);
		const record = buildInvestigationRecord();

		db.queueSelectRows([record]);

		const result = await repository.save(record);
		const saved = expectSuccess(result);

		expect(saved).toEqual(record);
		expect(db.insertedRecords).toEqual([record]);
	});

	it("maps Drizzle insert failures to repository write failures", async () => {
		const db = new FakeInvestigationDrizzleDatabase();
		const repository = new DrizzleInvestigationRepository(db);
		db.failNextInsert(new Error("database is locked"));

		const result = await repository.save(buildInvestigationRecord());
		const failure = expectFailure(result);

		expect(failure.code).toBe("INVESTIGATION_REPOSITORY_WRITE_FAILED");
		expect(failure.message).toContain(
			"Não foi possível persistir a investigação",
		);
	});

	it("returns not found when missing", async () => {
		const db = new FakeInvestigationDrizzleDatabase();
		const repository = new DrizzleInvestigationRepository(db);
		db.queueSelectRows([]);

		const result = await repository.findById("missing-project");
		const failure = expectFailure(result);

		expect(failure.code).toBe("INVESTIGATION_NOT_FOUND");
	});

	it("rejects corrupted rows returned by findById", async () => {
		const db = new FakeInvestigationDrizzleDatabase();
		const repository = new DrizzleInvestigationRepository(db);
		db.queueSelectRows([{ id: "project-1", dc: "invalid-dc-string" }]);

		const result = await repository.findById("project-1");
		const failure = expectFailure(result);

		expect(failure.code).toBe("CORRUPTED_INVESTIGATION_RECORD");
	});

	it("finds investigations by target id", async () => {
		const db = new FakeInvestigationDrizzleDatabase();
		const repository = new DrizzleInvestigationRepository(db);
		const record = buildInvestigationRecord();
		db.queueSelectRows([record]);

		const result = await repository.findByTargetId("monster-1");
		const list = expectSuccess(result);

		expect(list).toEqual([record]);
	});

	it("fails findByTargetId on select error", async () => {
		const db = new FakeInvestigationDrizzleDatabase();
		const repository = new DrizzleInvestigationRepository(db);
		db.failNextSelect(new Error("query timeout"));

		const result = await repository.findByTargetId("monster-1");
		const failure = expectFailure(result);

		expect(failure.code).toBe("CORRUPTED_INVESTIGATION_RECORD");
	});

	it("lists active investigations successfully", async () => {
		const db = new FakeInvestigationDrizzleDatabase();
		const repository = new DrizzleInvestigationRepository(db);
		const record = buildInvestigationRecord();
		db.queueSelectRows([record]);

		const result = await repository.listActive();
		const list = expectSuccess(result);

		expect(list).toEqual([record]);
	});

	it("fails listActive on select error", async () => {
		const db = new FakeInvestigationDrizzleDatabase();
		const repository = new DrizzleInvestigationRepository(db);
		db.failNextSelect(new Error("query timeout"));

		const result = await repository.listActive();
		const failure = expectFailure(result);

		expect(failure.code).toBe("CORRUPTED_INVESTIGATION_RECORD");
	});
});
