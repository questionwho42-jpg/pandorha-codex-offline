import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type ClockData,
	clockSelectSchema,
	progressClocks,
} from "../model/clockSchema";
import type { IClockRepository } from "../model-api";

export class DrizzleClockRepository implements IClockRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic database instance
	public constructor(private readonly db: any) {}

	public async save(clock: ClockData): Promise<Result<ClockData, Error>> {
		try {
			await this.db
				.insert(progressClocks)
				.values({
					id: clock.id,
					name: clock.name,
					totalSegments: clock.totalSegments,
					filledSegments: clock.filledSegments,
					isCompleted: clock.isCompleted,
					triggerEvent: clock.triggerEvent ?? null,
				})
				.onConflictDoUpdate({
					target: progressClocks.id,
					set: {
						name: clock.name,
						totalSegments: clock.totalSegments,
						filledSegments: clock.filledSegments,
						isCompleted: clock.isCompleted,
						triggerEvent: clock.triggerEvent ?? null,
					},
				})
				.run();
			return ok(clock);
		} catch (error: unknown) {
			return fail(
				error instanceof Error
					? error
					: new Error("Could not persist progress clock in SQLite."),
			);
		}
	}

	public async findById(id: string): Promise<Result<ClockData | null, Error>> {
		try {
			const rows = await this.db
				.select()
				.from(progressClocks)
				.where(eq(progressClocks.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return ok(null);
			}

			const mapped = {
				...row,
				triggerEvent: row.triggerEvent ?? undefined,
				isCompleted: row.isCompleted === 1 || row.isCompleted === true,
			};

			return ok(clockSelectSchema.parse(mapped));
		} catch (error: unknown) {
			return fail(
				error instanceof Error
					? error
					: new Error("Error reading progress clock from SQLite."),
			);
		}
	}

	public async findAll(): Promise<Result<ClockData[], Error>> {
		try {
			const rows = await this.db.select().from(progressClocks).all();
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic row mapping
			const mapped = rows.map((row: any) => {
				return clockSelectSchema.parse({
					...row,
					triggerEvent: row.triggerEvent ?? undefined,
					isCompleted: row.isCompleted === 1 || row.isCompleted === true,
				});
			});
			return ok(mapped);
		} catch (error: unknown) {
			return fail(
				error instanceof Error
					? error
					: new Error("Error listing progress clocks from SQLite."),
			);
		}
	}

	public async delete(id: string): Promise<Result<void, Error>> {
		try {
			await this.db
				.delete(progressClocks)
				.where(eq(progressClocks.id, id))
				.run();
			return ok(undefined);
		} catch (error: unknown) {
			return fail(
				error instanceof Error
					? error
					: new Error("Error deleting progress clock from SQLite."),
			);
		}
	}
}
