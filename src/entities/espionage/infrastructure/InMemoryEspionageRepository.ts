import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	EspionageRepository,
	EspionageRepositoryFailure,
} from "../domain/EspionageRepository";
import type {
	EspionageCellRecord,
	NewEspionageCellRecord,
} from "../model/espionageSchema";

export class InMemoryEspionageRepository implements EspionageRepository {
	private readonly records = new Map<string, EspionageCellRecord>();

	public async save(
		record: NewEspionageCellRecord,
	): Promise<Result<EspionageCellRecord, EspionageRepositoryFailure>> {
		const stored: EspionageCellRecord = {
			...record,
			methodOfControl: record.methodOfControl ?? null,
		};
		this.records.set(stored.id, stored);
		return ok({ ...stored });
	}

	public async findById(
		id: string,
	): Promise<Result<EspionageCellRecord, EspionageRepositoryFailure>> {
		const rec = this.records.get(id);
		if (!rec) {
			return fail({
				code: "ESPIONAGE_CELL_NOT_FOUND",
				message: `Célula de espionagem com ID ${id} não encontrada.`,
			});
		}
		return ok({ ...rec });
	}

	public async listByCampaign(
		campaignId: string,
	): Promise<
		Result<readonly EspionageCellRecord[], EspionageRepositoryFailure>
	> {
		const cells = Array.from(this.records.values())
			.filter((r) => r.campaignId === campaignId)
			.map((r) => ({ ...r }));
		return ok(cells);
	}

	public async deleteCell(
		id: string,
	): Promise<Result<void, EspionageRepositoryFailure>> {
		if (!this.records.has(id)) {
			return fail({
				code: "ESPIONAGE_CELL_NOT_FOUND",
				message: `Célula de espionagem com ID ${id} não encontrada para exclusão.`,
			});
		}
		this.records.delete(id);
		return ok(undefined);
	}
}
