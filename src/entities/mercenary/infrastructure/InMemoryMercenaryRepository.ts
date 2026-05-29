import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { MercenaryRepository } from "../domain/MercenaryRepository";
import type {
	MercenaryCompanyRecord,
	MercenarySquadRecord,
	NewMercenaryCompanyRecord,
	NewMercenarySquadRecord,
} from "../model/mercenarySchema";
import type { MercenaryRepositoryFailure } from "../model/mercenaryTypes";

export class InMemoryMercenaryRepository implements MercenaryRepository {
	private readonly companies = new Map<string, MercenaryCompanyRecord>();
	private readonly squads = new Map<string, MercenarySquadRecord>();

	public async saveCompany(
		record: NewMercenaryCompanyRecord,
	): Promise<Result<MercenaryCompanyRecord, MercenaryRepositoryFailure>> {
		const result: MercenaryCompanyRecord = {
			...record,
			bastionId: record.bastionId ?? null,
			reputation: record.reputation ?? 0,
		};
		this.companies.set(record.id, result);
		return ok(result);
	}

	public async findCompanyById(
		id: string,
	): Promise<Result<MercenaryCompanyRecord, MercenaryRepositoryFailure>> {
		const found = this.companies.get(id);
		if (!found) {
			return fail({
				code: "MERCENARY_COMPANY_NOT_FOUND",
				message: `Companhia mercenária com ID ${id} não encontrada.`,
			});
		}
		return ok(found);
	}

	public async listCompanies(): Promise<
		Result<readonly MercenaryCompanyRecord[], MercenaryRepositoryFailure>
	> {
		return ok(Array.from(this.companies.values()));
	}

	public async saveSquad(
		record: NewMercenarySquadRecord,
	): Promise<Result<MercenarySquadRecord, MercenaryRepositoryFailure>> {
		const result: MercenarySquadRecord = {
			...record,
			tagsJson: record.tagsJson ?? "[]",
			assignedMissionId: record.assignedMissionId ?? null,
		};
		this.squads.set(record.id, result);
		return ok(result);
	}

	public async findSquadById(
		id: string,
	): Promise<Result<MercenarySquadRecord, MercenaryRepositoryFailure>> {
		const found = this.squads.get(id);
		if (!found) {
			return fail({
				code: "MERCENARY_SQUAD_NOT_FOUND",
				message: `Esquadrão mercenário com ID ${id} não encontrado.`,
			});
		}
		return ok(found);
	}

	public async listSquadsByCompany(
		companyId: string,
	): Promise<
		Result<readonly MercenarySquadRecord[], MercenaryRepositoryFailure>
	> {
		const list = Array.from(this.squads.values()).filter(
			(s) => s.companyId === companyId,
		);
		return ok(list);
	}
}
