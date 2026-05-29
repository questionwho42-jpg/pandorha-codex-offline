import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { InvestigationRepository } from "../domain/InvestigationRepository";
import type {
	InvestigationRecord,
	NewInvestigationRecord,
} from "../model/investigationSchema";
import type { InvestigationRepositoryFailure } from "../model/investigationTypes";

export class InMemoryInvestigationRepository
	implements InvestigationRepository
{
	public investigations: InvestigationRecord[] = [];

	public async save(
		record: NewInvestigationRecord,
	): Promise<Result<InvestigationRecord, InvestigationRepositoryFailure>> {
		const investigation: InvestigationRecord = {
			...record,
			successesAccumulated: record.successesAccumulated ?? 0,
			failuresAccumulated: record.failuresAccumulated ?? 0,
			status: record.status ?? "active",
			goldCostPerTest: record.goldCostPerTest ?? 0,
		};

		const idx = this.investigations.findIndex((i) => i.id === investigation.id);
		if (idx >= 0) {
			this.investigations[idx] = investigation;
		} else {
			this.investigations.push(investigation);
		}
		return ok(investigation);
	}

	public async findById(
		id: string,
	): Promise<Result<InvestigationRecord, InvestigationRepositoryFailure>> {
		const inv = this.investigations.find((i) => i.id === id);
		if (!inv) {
			return fail({
				code: "INVESTIGATION_NOT_FOUND",
				message: `Investigação com ID ${id} não encontrada.`,
			});
		}
		return ok(inv);
	}

	public async findByTargetId(
		targetId: string,
	): Promise<Result<InvestigationRecord[], InvestigationRepositoryFailure>> {
		const list = this.investigations.filter((i) => i.targetId === targetId);
		return ok(list);
	}

	public async listActive(): Promise<
		Result<InvestigationRecord[], InvestigationRepositoryFailure>
	> {
		const active = this.investigations.filter((i) => i.status === "active");
		return ok(active);
	}
}
