import { eq, type SQL } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { ClockRepository } from "../domain/ClockRepository";
import {
	type ClockRecord,
	clockSelectSchema,
	clocks,
	type NewClockRecord,
} from "../model/clockSchema";
import type { ClockRepositoryFailure } from "../model/clockTypes";

export interface ClockDrizzleDatabase {
	insert(table: typeof clocks): {
		values(record: NewClockRecord): {
			onConflictDoUpdate(input: {
				target: typeof clocks.id;
				set: NewClockRecord;
			}): {
				returning(): Promise<ClockRecord[]>;
			};
		};
	};
	select(): {
		from(table: typeof clocks): {
			where(condition: SQL<unknown>): {
				limit(limit: number): Promise<ClockRecord[]>;
			};
		};
	};
}

/**
 * @description Persists clocks through Drizzle while keeping the domain service independent from SQLite.
 */
export class DrizzleClockRepository implements ClockRepository {
	public constructor(private readonly db: ClockDrizzleDatabase) {}

	public async save(
		record: NewClockRecord,
	): Promise<Result<ClockRecord, ClockRepositoryFailure>> {
		try {
			const rows = await this.db
				.insert(clocks)
				.values(record)
				.onConflictDoUpdate({
					target: clocks.id,
					set: record,
				})
				.returning();
			const parsed = clockSelectSchema.safeParse(rows[0]);

			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_CLOCK_RECORD",
					message: "Drizzle returned an invalid clock record after save.",
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "CLOCK_REPOSITORY_WRITE_FAILED",
				message: "Could not persist clock record.",
				details: {
					cause: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}

	public async findById(
		id: string,
	): Promise<Result<ClockRecord, ClockRepositoryFailure>> {
		const rows = await this.db
			.select()
			.from(clocks)
			.where(eq(clocks.id, id))
			.limit(1);
		const row = rows[0];

		if (!row) {
			return fail({
				code: "CLOCK_NOT_FOUND",
				message: "Clock record was not found.",
				details: { id },
			});
		}

		const parsed = clockSelectSchema.safeParse(row);
		if (!parsed.success) {
			return fail({
				code: "CORRUPTED_CLOCK_RECORD",
				message: "Drizzle returned an invalid clock record after select.",
				details: { id },
			});
		}

		return ok(parsed.data);
	}
}
