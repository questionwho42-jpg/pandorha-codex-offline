import type { SQL } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import type { ClockDrizzleDatabase } from "../infrastructure/DrizzleClockRepository";
import { DrizzleClockRepository } from "../infrastructure/DrizzleClockRepository";
import {
	type ClockRecord,
	clocks,
	type NewClockRecord,
} from "../model/clockSchema";
import type { ClockRepositoryFailure } from "../model/clockTypes";

const TEST_TIMESTAMP = "2026-05-15T21:12:00.000Z";

describe("DrizzleClockRepository contract", () => {
	it("upserts a clock and returns the validated stored record", async () => {
		const db = new FakeClockDrizzleDatabase();
		const repository = new DrizzleClockRepository(db);
		const record = buildClockRecord();
		db.queueWriteRows([record]);

		const result = await repository.save(record);
		const saved = expectRepositorySuccess(result);

		expect(saved).toEqual(record);
		expect(db.writtenRecords).toEqual([record]);
		expect(db.lastConflictTarget).toBe(clocks.id);
	});

	it("rejects corrupted rows returned after save", async () => {
		const db = new FakeClockDrizzleDatabase();
		const repository = new DrizzleClockRepository(db);
		const record = buildClockRecord();
		db.queueWriteRows([asClockRecord({ ...record, currentSlices: 5 })]);

		const failure = expectRepositoryFailure(await repository.save(record));

		expect(failure.code).toBe("CORRUPTED_CLOCK_RECORD");
	});

	it("maps Drizzle write failures to typed repository failures", async () => {
		const db = new FakeClockDrizzleDatabase();
		const repository = new DrizzleClockRepository(db);
		db.failNextWrite("database is locked");

		const failure = expectRepositoryFailure(
			await repository.save(buildClockRecord()),
		);

		expect(failure).toMatchObject({
			code: "CLOCK_REPOSITORY_WRITE_FAILED",
			details: { cause: "database is locked" },
		});
	});

	it("finds a clock by id and returns the validated selected record", async () => {
		const db = new FakeClockDrizzleDatabase();
		const repository = new DrizzleClockRepository(db);
		const record = buildClockRecord({ id: "camp-clock" });
		db.queueSelectRows([record]);

		const found = expectRepositorySuccess(
			await repository.findById("camp-clock"),
		);

		expect(found).toEqual(record);
		expect(db.lastSelectLimit).toBe(1);
	});

	it("returns not found when Drizzle selects no clock row", async () => {
		const db = new FakeClockDrizzleDatabase();
		const repository = new DrizzleClockRepository(db);
		db.queueSelectRows([]);

		const failure = expectRepositoryFailure(
			await repository.findById("missing-clock"),
		);

		expect(failure).toMatchObject({
			code: "CLOCK_NOT_FOUND",
			details: { id: "missing-clock" },
		});
	});

	it("rejects corrupted rows returned by findById", async () => {
		const db = new FakeClockDrizzleDatabase();
		const repository = new DrizzleClockRepository(db);
		db.queueSelectRows([
			asClockRecord({ ...buildClockRecord(), currentSlices: 5 }),
		]);

		const failure = expectRepositoryFailure(
			await repository.findById("fortify-perimeter"),
		);

		expect(failure.code).toBe("CORRUPTED_CLOCK_RECORD");
	});
});

function buildClockRecord(patch: Partial<ClockRecord> = {}): ClockRecord {
	return {
		id: "fortify-perimeter",
		label: "Fortificar perimetro",
		currentSlices: 1,
		maxSlices: 4,
		status: "active",
		source: "camp",
		createdAt: TEST_TIMESTAMP,
		updatedAt: TEST_TIMESTAMP,
		...patch,
	};
}

function asClockRecord(value: unknown): ClockRecord {
	return value as ClockRecord;
}

function expectRepositorySuccess(
	result: Result<ClockRecord, ClockRepositoryFailure>,
): ClockRecord {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectRepositoryFailure(
	result: Result<ClockRecord, ClockRepositoryFailure>,
): ClockRepositoryFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class FakeClockDrizzleDatabase implements ClockDrizzleDatabase {
	public readonly writtenRecords: NewClockRecord[] = [];
	public lastSelectLimit: number | null = null;
	public lastConflictTarget: unknown = null;

	private writeRows: ClockRecord[] = [];
	private selectRows: ClockRecord[] = [];
	private nextWriteFailure: unknown = null;

	public queueWriteRows(rows: ClockRecord[]): void {
		this.writeRows = rows;
	}

	public queueSelectRows(rows: ClockRecord[]): void {
		this.selectRows = rows;
	}

	public failNextWrite(error: unknown): void {
		this.nextWriteFailure = error;
	}

	public insert(table: typeof clocks): {
		values(record: NewClockRecord): {
			onConflictDoUpdate(input: {
				target: typeof clocks.id;
				set: NewClockRecord;
			}): {
				returning(): Promise<ClockRecord[]>;
			};
		};
	} {
		expect(table).toBe(clocks);

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
		from(table: typeof clocks): {
			where(condition: SQL<unknown>): {
				limit(limit: number): Promise<ClockRecord[]>;
			};
		};
	} {
		return {
			from: (table) => {
				expect(table).toBe(clocks);

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
