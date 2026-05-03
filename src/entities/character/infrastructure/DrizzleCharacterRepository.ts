import { eq, type SQL } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CharacterRepository } from "../domain/CharacterRepository";
import {
	type CharacterRecord,
	characterSelectSchema,
	characters,
	type NewCharacterRecord,
} from "../model/characterSchema";
import type { CharacterRepositoryFailure } from "../model/characterTypes";

export interface CharacterDrizzleDatabase {
	insert(table: typeof characters): {
		values(record: NewCharacterRecord): {
			returning(): Promise<CharacterRecord[]>;
		};
	};
	select(): {
		from(table: typeof characters): {
			where(condition: SQL<unknown>): {
				limit(limit: number): Promise<CharacterRecord[]>;
			};
		};
	};
}

export class DrizzleCharacterRepository implements CharacterRepository {
	public constructor(private readonly db: CharacterDrizzleDatabase) {}

	public async save(
		record: NewCharacterRecord,
	): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
		try {
			const rows = await this.db.insert(characters).values(record).returning();
			const parsed = characterSelectSchema.safeParse(rows[0]);

			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_CHARACTER_RECORD",
					message: "Drizzle returned an invalid character record after insert.",
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "CHARACTER_REPOSITORY_WRITE_FAILED",
				message: "Could not persist character record.",
				details: {
					cause: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}

	public async findById(
		id: string,
	): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
		const rows = await this.db
			.select()
			.from(characters)
			.where(eq(characters.id, id))
			.limit(1);
		const row = rows[0];

		if (!row) {
			return fail({
				code: "CHARACTER_NOT_FOUND",
				message: "Character record was not found.",
				details: { id },
			});
		}

		const parsed = characterSelectSchema.safeParse(row);

		if (!parsed.success) {
			return fail({
				code: "CORRUPTED_CHARACTER_RECORD",
				message: "Drizzle returned an invalid character record after select.",
				details: { id },
			});
		}

		return ok(parsed.data);
	}
}
