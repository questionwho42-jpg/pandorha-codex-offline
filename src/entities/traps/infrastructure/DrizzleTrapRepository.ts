import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	TrapRepository,
	TrapRepositoryFailure,
} from "../domain/TrapRepository";
import {
	type NewTrapRecord,
	type TrapRecord,
	trapSelectSchema,
	traps,
} from "../model/trapSchema";

export interface TrapDrizzleDatabase {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle insert query is generic
	insert(table: any): any;
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle select query is generic
	select(): any;
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle delete query is generic
	delete(table: any): any;
}

export class DrizzleTrapRepository implements TrapRepository {
	public constructor(private readonly db: TrapDrizzleDatabase) {}

	public async save(
		record: NewTrapRecord,
	): Promise<Result<TrapRecord, TrapRepositoryFailure>> {
		try {
			const rows = await this.db.insert(traps).values(record).returning();
			const parsed = trapSelectSchema.safeParse(rows[0]);

			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_TRAP_RECORD",
					message: "Drizzle returned an invalid trap record after insert.",
					details: parsed.error,
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "TRAP_REPOSITORY_WRITE_FAILED",
				message: "Could not persist trap record.",
				details: {
					cause: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}

	public async findById(
		id: string,
	): Promise<Result<TrapRecord, TrapRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(traps)
				.where(eq(traps.id, id))
				.limit(1);
			const row = rows[0];

			if (!row) {
				return fail({
					code: "TRAP_NOT_FOUND",
					message: "Trap record was not found.",
					details: { id },
				});
			}

			const parsed = trapSelectSchema.safeParse(row);

			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_TRAP_RECORD",
					message: "Drizzle returned an invalid trap record after select.",
					details: { id },
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "TRAP_REPOSITORY_WRITE_FAILED",
				message: "Could not fetch trap record.",
				details: {
					cause: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}

	public async findByTileId(
		tileId: string,
	): Promise<Result<TrapRecord[], TrapRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(traps)
				.where(eq(traps.tileId, tileId));

			const list: TrapRecord[] = [];
			for (const row of rows) {
				const parsed = trapSelectSchema.safeParse(row);
				if (!parsed.success) {
					return fail({
						code: "CORRUPTED_TRAP_RECORD",
						message:
							"Drizzle returned an invalid trap record after findByTileId.",
						details: parsed.error,
					});
				}
				list.push(parsed.data);
			}

			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "TRAP_REPOSITORY_WRITE_FAILED",
				message: "Could not fetch trap records by tileId.",
				details: {
					cause: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}

	public async delete(
		id: string,
	): Promise<Result<void, TrapRepositoryFailure>> {
		try {
			await this.db.delete(traps).where(eq(traps.id, id));
			return ok(undefined);
		} catch (error: unknown) {
			return fail({
				code: "TRAP_REPOSITORY_WRITE_FAILED",
				message: "Could not delete trap record.",
				details: {
					cause: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}
}
