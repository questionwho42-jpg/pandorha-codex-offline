import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { AncestryRepository } from "../domain/AncestryRepository";
import type { AncestryId, AncestryRecord } from "../model/ancestrySchema";
import { ancestries } from "../model/ancestrySchema";
import type { AncestryRepositoryFailure } from "../model/ancestryTypes";

export class DrizzleAncestryRepository implements AncestryRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance dynamic typing
	public constructor(private readonly db: any) {}

	public async list(): Promise<
		Result<readonly AncestryRecord[], AncestryRepositoryFailure>
	> {
		try {
			const rows = this.db.select().from(ancestries).all();
			return ok(rows);
		} catch (error: unknown) {
			const errMsg = error instanceof Error ? error.message : String(error);
			return fail({
				code: "ANCESTRY_REPOSITORY_READ_FAILED",
				message: "Falha ao listar ancestralidades no banco SQLite.",
				details: { cause: errMsg },
			});
		}
	}

	public async findById(
		id: AncestryId,
	): Promise<Result<AncestryRecord, AncestryRepositoryFailure>> {
		try {
			const row = this.db
				.select()
				.from(ancestries)
				.where(eq(ancestries.id, id))
				.get();
			if (!row) {
				return fail({
					code: "ANCESTRY_NOT_FOUND",
					message: `Ancestralidade com ID '${id}' não foi encontrada.`,
				});
			}
			return ok(row);
		} catch (error: unknown) {
			const errMsg = error instanceof Error ? error.message : String(error);
			return fail({
				code: "ANCESTRY_REPOSITORY_READ_FAILED",
				message: `Falha ao buscar ancestralidade '${id}' no banco SQLite.`,
				details: { cause: errMsg },
			});
		}
	}
}
