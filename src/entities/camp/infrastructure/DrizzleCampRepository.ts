import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CampRepository } from "../domain/CampRepository";
import {
	type CampSessionRecord,
	campaignCampSessions,
	campSessionSelectSchema,
	type NewCampSessionRecord,
} from "../model/campSchema";
import type { CampRepositoryFailure } from "../model/campTypes";

export class DrizzleCampRepository implements CampRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance
	public constructor(private readonly db: any) {}

	public async save(
		record: NewCampSessionRecord,
	): Promise<Result<CampSessionRecord, CampRepositoryFailure>> {
		try {
			await this.db
				.insert(campaignCampSessions)
				.values(record)
				.onConflictDoUpdate({
					target: campaignCampSessions.id,
					set: {
						totalTime: record.totalTime,
						sleepHours: record.sleepHours,
						availableActions: record.availableActions,
						dangerCounter: record.dangerCounter,
						activeActivitiesJson: record.activeActivitiesJson,
						updatedAt: record.updatedAt,
					},
				})
				.run();
			const result = await this.findById(record.id);
			if (!result.success) {
				return fail(result.error);
			}
			return ok(result.data);
		} catch (error: unknown) {
			return fail({
				code: "CAMP_REPOSITORY_WRITE_FAILED",
				message: "Não foi possível persistir a sessão de acampamento.",
				details: { cause: String(error) },
			});
		}
	}

	public async findById(
		id: string,
	): Promise<Result<CampSessionRecord, CampRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(campaignCampSessions)
				.where(eq(campaignCampSessions.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return fail({
					code: "CAMP_SESSION_NOT_FOUND",
					message: `Sessão de acampamento com ID ${id} não encontrada.`,
				});
			}
			return ok(campSessionSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_CAMP_SESSION_RECORD",
				message: "Erro ao carregar registro de sessão de acampamento.",
				details: { cause: String(error) },
			});
		}
	}

	public async listAll(): Promise<
		Result<readonly CampSessionRecord[], CampRepositoryFailure>
	> {
		try {
			const rows = await this.db.select().from(campaignCampSessions).all();
			const list = rows.map((r: unknown) => campSessionSelectSchema.parse(r));
			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_CAMP_SESSION_RECORD",
				message: "Erro ao listar sessões de acampamento.",
				details: { cause: String(error) },
			});
		}
	}
}
