import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { SpellCatalogRepository } from "../domain/SpellCatalogRepository";
import type { SpellCircle, SpellId, SpellRecord } from "../model/spellSchema";
import { spell } from "../model/spellSchema";
import type { SpellRepositoryFailure } from "../model/spellTypes";

export class DrizzleSpellCatalogRepository implements SpellCatalogRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance dynamic typing
	public constructor(private readonly db: any) {}

	public async listSpells(): Promise<
		Result<readonly SpellRecord[], SpellRepositoryFailure>
	> {
		try {
			const rows = this.db.select().from(spell).all();
			return ok(rows);
		} catch (error: unknown) {
			const errMsg = error instanceof Error ? error.message : String(error);
			return fail({
				code: "SPELL_REPOSITORY_READ_FAILED",
				message: "Falha ao listar magias no banco SQLite.",
				details: { cause: errMsg },
			});
		}
	}

	public async findSpellById(
		id: SpellId,
	): Promise<Result<SpellRecord, SpellRepositoryFailure>> {
		try {
			const row = this.db.select().from(spell).where(eq(spell.id, id)).get();
			if (!row) {
				return fail({
					code: "SPELL_REPOSITORY_LOOKUP_FAILED",
					message: `Magia com ID '${id}' não foi encontrada.`,
				});
			}
			return ok(row);
		} catch (error: unknown) {
			const errMsg = error instanceof Error ? error.message : String(error);
			return fail({
				code: "SPELL_REPOSITORY_READ_FAILED",
				message: `Falha ao buscar magia '${id}' no banco SQLite.`,
				details: { cause: errMsg },
			});
		}
	}

	public async listSpellsByCircle(
		circle: SpellCircle,
	): Promise<Result<readonly SpellRecord[], SpellRepositoryFailure>> {
		try {
			const rows = this.db
				.select()
				.from(spell)
				.where(eq(spell.circle, circle))
				.all();
			return ok(rows);
		} catch (error: unknown) {
			const errMsg = error instanceof Error ? error.message : String(error);
			return fail({
				code: "SPELL_REPOSITORY_READ_FAILED",
				message: `Falha ao listar magias do círculo ${circle} no banco SQLite.`,
				details: { cause: errMsg },
			});
		}
	}
}
