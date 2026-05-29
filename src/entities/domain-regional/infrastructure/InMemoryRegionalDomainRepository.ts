import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { RegionalDomainRepository } from "../domain/RegionalDomainRepository";
import type {
	NewRegionalDomainRecord,
	RegionalDomainRecord,
} from "../model/regionalDomainSchema";
import type { RegionalDomainRepositoryFailure } from "../model/regionalDomainTypes";

export class InMemoryRegionalDomainRepository
	implements RegionalDomainRepository
{
	private readonly records = new Map<string, RegionalDomainRecord>();

	public async save(
		record: NewRegionalDomainRecord,
	): Promise<Result<RegionalDomainRecord, RegionalDomainRepositoryFailure>> {
		const stored: RegionalDomainRecord = {
			...record,
			physicalLevel: record.physicalLevel ?? 0,
			mentalLevel: record.mentalLevel ?? 0,
			socialLevel: record.socialLevel ?? 0,
			weeksAway: record.weeksAway ?? 0,
		};
		this.records.set(stored.id, stored);
		return ok({ ...stored });
	}

	public async findById(
		id: string,
	): Promise<Result<RegionalDomainRecord, RegionalDomainRepositoryFailure>> {
		const rec = this.records.get(id);
		if (!rec) {
			return fail({
				code: "REGIONAL_DOMAIN_NOT_FOUND",
				message: `Domínio regional com ID ${id} não encontrado.`,
			});
		}
		return ok({ ...rec });
	}

	public async listAll(): Promise<
		Result<readonly RegionalDomainRecord[], RegionalDomainRepositoryFailure>
	> {
		return ok(Array.from(this.records.values()).map((r) => ({ ...r })));
	}
}
