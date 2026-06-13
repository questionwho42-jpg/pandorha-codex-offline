import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CharacterClassRepository } from "../domain/CharacterClassRepository";
import type {
	CharacterClassId,
	CharacterClassRecord,
} from "../model/characterClassSchema";
import { characterClasses } from "../model/characterClassSchema";
import type { CharacterClassRepositoryFailure } from "../model/characterClassTypes";

export class DrizzleCharacterClassRepository
	implements CharacterClassRepository
{
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance dynamic typing
	public constructor(private readonly db: any) {}

	public async list(): Promise<
		Result<readonly CharacterClassRecord[], CharacterClassRepositoryFailure>
	> {
		try {
			const rows = this.db.select().from(characterClasses).all();
			return ok(rows);
		} catch (error: unknown) {
			const errMsg = error instanceof Error ? error.message : String(error);
			return fail({
				code: "CHARACTER_CLASS_REPOSITORY_READ_FAILED",
				message: "Falha ao listar classes no banco SQLite.",
				details: { cause: errMsg },
			});
		}
	}

	public async findById(
		id: CharacterClassId,
	): Promise<Result<CharacterClassRecord, CharacterClassRepositoryFailure>> {
		try {
			const row = this.db
				.select()
				.from(characterClasses)
				.where(eq(characterClasses.id, id))
				.get();
			if (!row) {
				return fail({
					code: "CHARACTER_CLASS_NOT_FOUND",
					message: `Classe com ID '${id}' não foi encontrada.`,
				});
			}
			return ok(row);
		} catch (error: unknown) {
			const errMsg = error instanceof Error ? error.message : String(error);
			return fail({
				code: "CHARACTER_CLASS_REPOSITORY_READ_FAILED",
				message: `Falha ao buscar classe '${id}' no banco SQLite.`,
				details: { cause: errMsg },
			});
		}
	}
}
