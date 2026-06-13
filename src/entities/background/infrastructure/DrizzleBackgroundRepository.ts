import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { BackgroundRepository } from "../domain/BackgroundRepository";
import type { BackgroundId, BackgroundRecord } from "../model/backgroundSchema";
import { backgrounds } from "../model/backgroundSchema";
import type { BackgroundRepositoryFailure } from "../model/backgroundTypes";

export class DrizzleBackgroundRepository implements BackgroundRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance dynamic typing
	public constructor(private readonly db: any) {}

	public async list(): Promise<
		Result<readonly BackgroundRecord[], BackgroundRepositoryFailure>
	> {
		try {
			const rows = this.db.select().from(backgrounds).all();
			return ok(rows);
		} catch (error: unknown) {
			const errMsg = error instanceof Error ? error.message : String(error);
			return fail({
				code: "BACKGROUND_REPOSITORY_READ_FAILED",
				message: "Falha ao listar antecedentes no banco SQLite.",
				details: { cause: errMsg },
			});
		}
	}

	public async findById(
		id: BackgroundId,
	): Promise<Result<BackgroundRecord, BackgroundRepositoryFailure>> {
		try {
			const row = this.db
				.select()
				.from(backgrounds)
				.where(eq(backgrounds.id, id))
				.get();
			if (!row) {
				return fail({
					code: "BACKGROUND_NOT_FOUND",
					message: `Antecedente com ID '${id}' não foi encontrado.`,
				});
			}
			return ok(row);
		} catch (error: unknown) {
			const errMsg = error instanceof Error ? error.message : String(error);
			return fail({
				code: "BACKGROUND_REPOSITORY_READ_FAILED",
				message: `Falha ao buscar antecedente '${id}' no banco SQLite.`,
				details: { cause: errMsg },
			});
		}
	}
}
