import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { MercenaryRepository } from "../domain/MercenaryRepository";
import {
	type MercenaryCompanyRecord,
	type MercenarySquadRecord,
	mercenaryCompanies,
	mercenaryCompanySelectSchema,
	mercenarySquadSelectSchema,
	mercenarySquads,
	type NewMercenaryCompanyRecord,
	type NewMercenarySquadRecord,
} from "../model/mercenarySchema";
import type { MercenaryRepositoryFailure } from "../model/mercenaryTypes";

export class DrizzleMercenaryRepository implements MercenaryRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance
	public constructor(private readonly db: any) {}

	public async saveCompany(
		record: NewMercenaryCompanyRecord,
	): Promise<Result<MercenaryCompanyRecord, MercenaryRepositoryFailure>> {
		try {
			await this.db
				.insert(mercenaryCompanies)
				.values(record)
				.onConflictDoUpdate({
					target: mercenaryCompanies.id,
					set: {
						bastionId: record.bastionId,
						tier: record.tier,
						reputation: record.reputation,
						hqName: record.hqName,
						updatedAt: record.updatedAt,
					},
				})
				.run();
			const result = await this.findCompanyById(record.id);
			if (!result.success) {
				return fail(result.error);
			}
			return ok(result.data);
		} catch (error: unknown) {
			return fail({
				code: "MERCENARY_REPOSITORY_WRITE_FAILED",
				message: "Não foi possível persistir a companhia mercenária.",
				details: { cause: String(error) },
			});
		}
	}

	public async findCompanyById(
		id: string,
	): Promise<Result<MercenaryCompanyRecord, MercenaryRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(mercenaryCompanies)
				.where(eq(mercenaryCompanies.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return fail({
					code: "MERCENARY_COMPANY_NOT_FOUND",
					message: `Companhia mercenária com ID ${id} não encontrada.`,
				});
			}
			return ok(mercenaryCompanySelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_MERCENARY_RECORD",
				message: "Erro ao carregar registro de companhia mercenária do banco.",
				details: { cause: String(error) },
			});
		}
	}

	public async listCompanies(): Promise<
		Result<readonly MercenaryCompanyRecord[], MercenaryRepositoryFailure>
	> {
		try {
			const rows = await this.db.select().from(mercenaryCompanies).all();
			const list = rows.map((r: unknown) =>
				mercenaryCompanySelectSchema.parse(r),
			);
			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_MERCENARY_RECORD",
				message: "Erro ao listar companhias mercenárias.",
				details: { cause: String(error) },
			});
		}
	}

	public async saveSquad(
		record: NewMercenarySquadRecord,
	): Promise<Result<MercenarySquadRecord, MercenaryRepositoryFailure>> {
		try {
			await this.db
				.insert(mercenarySquads)
				.values(record)
				.onConflictDoUpdate({
					target: mercenarySquads.id,
					set: {
						companyId: record.companyId,
						name: record.name,
						physical: record.physical,
						mental: record.mental,
						social: record.social,
						cohesionMax: record.cohesionMax,
						cohesionCurrent: record.cohesionCurrent,
						tagsJson: record.tagsJson,
						commandTactic: record.commandTactic,
						status: record.status,
						assignedMissionId: record.assignedMissionId,
						updatedAt: record.updatedAt,
					},
				})
				.run();
			const result = await this.findSquadById(record.id);
			if (!result.success) {
				return fail(result.error);
			}
			return ok(result.data);
		} catch (error: unknown) {
			return fail({
				code: "MERCENARY_REPOSITORY_WRITE_FAILED",
				message: "Não foi possível persistir o esquadrão mercenário.",
				details: { cause: String(error) },
			});
		}
	}

	public async findSquadById(
		id: string,
	): Promise<Result<MercenarySquadRecord, MercenaryRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(mercenarySquads)
				.where(eq(mercenarySquads.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return fail({
					code: "MERCENARY_SQUAD_NOT_FOUND",
					message: `Esquadrão mercenário com ID ${id} não encontrado.`,
				});
			}
			return ok(mercenarySquadSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_MERCENARY_RECORD",
				message: "Erro ao carregar registro de esquadrão mercenário do banco.",
				details: { cause: String(error) },
			});
		}
	}

	public async listSquadsByCompany(
		companyId: string,
	): Promise<
		Result<readonly MercenarySquadRecord[], MercenaryRepositoryFailure>
	> {
		try {
			const rows = await this.db
				.select()
				.from(mercenarySquads)
				.where(eq(mercenarySquads.companyId, companyId))
				.all();
			const list = rows.map((r: unknown) =>
				mercenarySquadSelectSchema.parse(r),
			);
			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_MERCENARY_RECORD",
				message: "Erro ao listar esquadrões da companhia.",
				details: { cause: String(error) },
			});
		}
	}
}
