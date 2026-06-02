import type { SQL } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import type { NpcRelationshipDrizzleDatabase } from "../infrastructure/DrizzleNpcRelationshipRepository";
import { DrizzleNpcRelationshipRepository } from "../infrastructure/DrizzleNpcRelationshipRepository";
import {
	type NewNpcRelationshipRecord,
	type NpcRelationshipRecord,
	npcRelationships,
} from "../model/npcRelationshipSchema";
import type { NpcRelationshipRepositoryFailure } from "../model/npcRelationshipTypes";

const TEST_TIMESTAMP = "2026-05-30T00:25:00.000-03:00";

describe("DrizzleNpcRelationshipRepository contract", () => {
	it("upserts a relationship and returns the validated stored record", async () => {
		const db = new FakeNpcRelationshipDrizzleDatabase();
		const repository = new DrizzleNpcRelationshipRepository(db);
		const record = buildRelationshipRecord();
		db.queueWriteRows([record]);

		const result = await repository.save(record);
		const saved = expectRepositorySuccess(result);

		expect(saved).toEqual(record);
		expect(db.writtenRecords).toEqual([record]);
		expect(db.lastConflictTarget).toBe(npcRelationships.npcId);
	});

	it("rejects corrupted rows returned after save", async () => {
		const db = new FakeNpcRelationshipDrizzleDatabase();
		const repository = new DrizzleNpcRelationshipRepository(db);
		const record = buildRelationshipRecord();
		db.queueWriteRows([
			asRelationshipRecord({ ...record, attitude: "unknown" }),
		]);

		const failure = expectRepositoryFailure(await repository.save(record));

		expect(failure.code).toBe("CORRUPTED_NPC_RELATIONSHIP_RECORD");
	});

	it("maps Drizzle write failures to typed repository failures", async () => {
		const db = new FakeNpcRelationshipDrizzleDatabase();
		const repository = new DrizzleNpcRelationshipRepository(db);
		db.failNextWrite(new Error("database is locked"));

		const failure = expectRepositoryFailure(
			await repository.save(buildRelationshipRecord()),
		);

		expect(failure).toMatchObject({
			code: "NPC_RELATIONSHIP_REPOSITORY_WRITE_FAILED",
			details: { cause: "database is locked" },
		});
	});

	it("maps non-Error Drizzle write failures to string causes", async () => {
		const db = new FakeNpcRelationshipDrizzleDatabase();
		const repository = new DrizzleNpcRelationshipRepository(db);
		db.failNextWrite({ reason: "locked" });

		const failure = expectRepositoryFailure(
			await repository.save(buildRelationshipRecord()),
		);

		expect(failure).toMatchObject({
			code: "NPC_RELATIONSHIP_REPOSITORY_WRITE_FAILED",
			details: { cause: "[object Object]" },
		});
	});

	it("finds a relationship by NPC id and returns the validated row", async () => {
		const db = new FakeNpcRelationshipDrizzleDatabase();
		const repository = new DrizzleNpcRelationshipRepository(db);
		const record = buildRelationshipRecord({ npcId: "training-broker" });
		db.queueSelectRows([record]);

		const found = expectRepositorySuccess(
			await repository.findByNpcId("training-broker"),
		);

		expect(found).toEqual(record);
		expect(db.lastSelectLimit).toBe(1);
	});

	it("returns not found when Drizzle selects no relationship row", async () => {
		const db = new FakeNpcRelationshipDrizzleDatabase();
		const repository = new DrizzleNpcRelationshipRepository(db);
		db.queueSelectRows([]);

		const failure = expectRepositoryFailure(
			await repository.findByNpcId("missing-npc"),
		);

		expect(failure).toMatchObject({
			code: "NPC_RELATIONSHIP_NOT_FOUND",
			details: { npcId: "missing-npc" },
		});
	});

	it("rejects corrupted rows returned by findByNpcId", async () => {
		const db = new FakeNpcRelationshipDrizzleDatabase();
		const repository = new DrizzleNpcRelationshipRepository(db);
		db.queueSelectRows([
			asRelationshipRecord({
				...buildRelationshipRecord(),
				appliedPressureKeysJson: "{not-json",
			}),
		]);

		const failure = expectRepositoryFailure(
			await repository.findByNpcId("training-broker"),
		);

		expect(failure.code).toBe("CORRUPTED_NPC_RELATIONSHIP_RECORD");
	});
});

function buildRelationshipRecord(
	patch: Partial<NpcRelationshipRecord> = {},
): NpcRelationshipRecord {
	return {
		npcId: "training-broker",
		attitude: "neutral",
		status: "stable",
		pressureDamage: 0,
		appliedPressureKeysJson: "[]",
		updatedAt: TEST_TIMESTAMP,
		...patch,
	};
}

function asRelationshipRecord(value: unknown): NpcRelationshipRecord {
	return value as NpcRelationshipRecord;
}

function expectRepositorySuccess(
	result: Result<NpcRelationshipRecord, NpcRelationshipRepositoryFailure>,
): NpcRelationshipRecord {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectRepositoryFailure(
	result: Result<NpcRelationshipRecord, NpcRelationshipRepositoryFailure>,
): NpcRelationshipRepositoryFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class FakeNpcRelationshipDrizzleDatabase
	implements NpcRelationshipDrizzleDatabase
{
	public readonly writtenRecords: NewNpcRelationshipRecord[] = [];
	public lastSelectLimit: number | null = null;
	public lastConflictTarget: unknown = null;

	private writeRows: NpcRelationshipRecord[] = [];
	private selectRows: NpcRelationshipRecord[] = [];
	private nextWriteFailure: unknown = null;

	public queueWriteRows(rows: NpcRelationshipRecord[]): void {
		this.writeRows = rows;
	}

	public queueSelectRows(rows: NpcRelationshipRecord[]): void {
		this.selectRows = rows;
	}

	public failNextWrite(error: unknown): void {
		this.nextWriteFailure = error;
	}

	public insert(table: typeof npcRelationships): {
		values(record: NewNpcRelationshipRecord): {
			onConflictDoUpdate(input: {
				target: typeof npcRelationships.npcId;
				set: NewNpcRelationshipRecord;
			}): {
				returning(): Promise<NpcRelationshipRecord[]>;
			};
		};
	} {
		expect(table).toBe(npcRelationships);

		return {
			values: (record) => ({
				onConflictDoUpdate: (input) => {
					this.writtenRecords.push(record);
					this.lastConflictTarget = input.target;
					return {
						returning: async () => {
							if (this.nextWriteFailure !== null) {
								const error = this.nextWriteFailure;
								this.nextWriteFailure = null;
								return Promise.reject(error);
							}

							return this.writeRows;
						},
					};
				},
			}),
		};
	}

	public select(): {
		from(table: typeof npcRelationships): {
			where(condition: SQL<unknown>): {
				limit(limit: number): Promise<NpcRelationshipRecord[]>;
			};
		};
	} {
		return {
			from: (table) => {
				expect(table).toBe(npcRelationships);

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
