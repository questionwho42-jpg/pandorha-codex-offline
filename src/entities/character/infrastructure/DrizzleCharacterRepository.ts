import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CharacterRepository } from "../domain/CharacterRepository";
import {
	type CharacterRecord,
	type CharacterStatusEffectRecord,
	characterSelectSchema,
	characterStatusEffectSelectSchema,
	characterStatusEffects,
	characters,
	type NewCharacterRecord,
	type NewCharacterStatusEffectRecord,
} from "../model/characterSchema";
import type { CharacterRepositoryFailure } from "../model/characterTypes";

/**
 * Interface simplificada do Drizzle Database para permitir operações genéricas e extensíveis
 * sem travar a tipagem rígida nos mocks de teste.
 */
export interface CharacterDrizzleDatabase {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle insert query is generic
	insert(table: any): any;
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle select query is generic
	select(): any;
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle delete query is generic
	delete(table: any): any;
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle update query is generic
	update(table: any): any;
}

export class DrizzleCharacterRepository implements CharacterRepository {
	public constructor(private readonly db: CharacterDrizzleDatabase) {}

	public async save(
		record: NewCharacterRecord,
	): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
		try {
			let rows: unknown[];
			if (record.id) {
				const existing = await this.db
					.select()
					.from(characters)
					.where(eq(characters.id, record.id))
					.limit(1);
				if (existing.length > 0) {
					rows = await this.db
						.update(characters)
						.set(record)
						.where(eq(characters.id, record.id))
						.returning();
				} else {
					rows = await this.db.insert(characters).values(record).returning();
				}
			} else {
				rows = await this.db.insert(characters).values(record).returning();
			}

			const parsed = characterSelectSchema.safeParse(rows[0]);

			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_CHARACTER_RECORD",
					message: "Drizzle returned an invalid character record after save.",
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
		try {
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
		} catch (error: unknown) {
			return fail({
				code: "CHARACTER_REPOSITORY_WRITE_FAILED",
				message: "Could not fetch character record.",
				details: {
					cause: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}

	public async saveStatusEffect(
		effect: NewCharacterStatusEffectRecord,
	): Promise<Result<CharacterStatusEffectRecord, CharacterRepositoryFailure>> {
		try {
			const rows = await this.db
				.insert(characterStatusEffects)
				.values(effect)
				.returning();
			const parsed = characterStatusEffectSelectSchema.safeParse(rows[0]);

			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_CHARACTER_RECORD",
					message:
						"Drizzle returned an invalid status effect record after insert.",
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "CHARACTER_REPOSITORY_WRITE_FAILED",
				message: "Could not persist status effect record.",
				details: {
					cause: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}

	public async findStatusEffectsByCharacterId(
		characterId: string,
	): Promise<
		Result<CharacterStatusEffectRecord[], CharacterRepositoryFailure>
	> {
		try {
			const rows = await this.db
				.select()
				.from(characterStatusEffects)
				.where(eq(characterStatusEffects.characterId, characterId));

			const list: CharacterStatusEffectRecord[] = [];
			for (const row of rows) {
				const parsed = characterStatusEffectSelectSchema.safeParse(row);
				if (!parsed.success) {
					return fail({
						code: "CORRUPTED_CHARACTER_RECORD",
						message:
							"Drizzle returned an invalid status effect record after select.",
					});
				}
				list.push(parsed.data);
			}

			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "CHARACTER_REPOSITORY_WRITE_FAILED",
				message: "Could not fetch status effect records.",
				details: {
					cause: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}

	public async deleteStatusEffect(
		id: string,
	): Promise<Result<void, CharacterRepositoryFailure>> {
		try {
			await this.db
				.delete(characterStatusEffects)
				.where(eq(characterStatusEffects.id, id));
			return ok(undefined);
		} catch (error: unknown) {
			return fail({
				code: "CHARACTER_REPOSITORY_WRITE_FAILED",
				message: "Could not delete status effect record.",
				details: {
					cause: error instanceof Error ? error.message : String(error),
				},
			});
		}
	}
}
