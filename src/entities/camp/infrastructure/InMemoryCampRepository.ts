import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CampRepository } from "../domain/CampRepository";
import type {
	CampSessionRecord,
	NewCampSessionRecord,
} from "../model/campSchema";
import type { CampRepositoryFailure } from "../model/campTypes";

export class InMemoryCampRepository implements CampRepository {
	private readonly records = new Map<string, CampSessionRecord>();

	public async save(
		record: NewCampSessionRecord,
	): Promise<Result<CampSessionRecord, CampRepositoryFailure>> {
		const stored: CampSessionRecord = {
			...record,
			dangerCounter: record.dangerCounter ?? 0,
		};
		this.records.set(stored.id, stored);
		return ok({ ...stored });
	}

	public async findById(
		id: string,
	): Promise<Result<CampSessionRecord, CampRepositoryFailure>> {
		const rec = this.records.get(id);
		if (!rec) {
			return fail({
				code: "CAMP_SESSION_NOT_FOUND",
				message: `Sessão de acampamento com ID ${id} não encontrada.`,
			});
		}
		return ok({ ...rec });
	}

	public async listAll(): Promise<
		Result<readonly CampSessionRecord[], CampRepositoryFailure>
	> {
		return ok(Array.from(this.records.values()).map((r) => ({ ...r })));
	}
}
