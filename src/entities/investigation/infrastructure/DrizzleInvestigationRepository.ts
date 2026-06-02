import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { InvestigationRepository } from "../domain/InvestigationRepository";
import {
	campaignInvestigations,
	type InvestigationRecord,
	investigationSelectSchema,
	type NewInvestigationRecord,
} from "../model/investigationSchema";
import type { InvestigationRepositoryFailure } from "../model/investigationTypes";

export class DrizzleInvestigationRepository implements InvestigationRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance
	public constructor(private readonly db: any) {}

	public async save(
		record: NewInvestigationRecord,
	): Promise<Result<InvestigationRecord, InvestigationRepositoryFailure>> {
		try {
			await this.db
				.insert(campaignInvestigations)
				.values(record)
				.onConflictDoUpdate({
					target: campaignInvestigations.id,
					set: {
						successesAccumulated: record.successesAccumulated,
						failuresAccumulated: record.failuresAccumulated,
						status: record.status,
						goldCostPerTest: record.goldCostPerTest,
						translatedPercent: record.translatedPercent,
						discoveredSecrets: record.discoveredSecrets,
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
				code: "INVESTIGATION_REPOSITORY_WRITE_FAILED",
				message: "Não foi possível persistir a investigação.",
				details: { cause: String(error) },
			});
		}
	}

	public async findById(
		id: string,
	): Promise<Result<InvestigationRecord, InvestigationRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(campaignInvestigations)
				.where(eq(campaignInvestigations.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return fail({
					code: "INVESTIGATION_NOT_FOUND",
					message: `Investigação com ID ${id} não encontrada.`,
				});
			}
			return ok(investigationSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_INVESTIGATION_RECORD",
				message: "Erro ao carregar registro de investigação do banco.",
				details: { cause: String(error) },
			});
		}
	}

	public async findByTargetId(
		targetId: string,
	): Promise<Result<InvestigationRecord[], InvestigationRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(campaignInvestigations)
				.where(eq(campaignInvestigations.targetId, targetId))
				.all();
			const list = rows.map((r: unknown) => investigationSelectSchema.parse(r));
			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_INVESTIGATION_RECORD",
				message: "Erro ao listar investigações por alvo.",
				details: { cause: String(error) },
			});
		}
	}

	public async listActive(): Promise<
		Result<InvestigationRecord[], InvestigationRepositoryFailure>
	> {
		try {
			const rows = await this.db
				.select()
				.from(campaignInvestigations)
				.where(eq(campaignInvestigations.status, "active"))
				.all();
			const list = rows.map((r: unknown) => investigationSelectSchema.parse(r));
			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_INVESTIGATION_RECORD",
				message: "Erro ao listar investigações ativas.",
				details: { cause: String(error) },
			});
		}
	}
}
