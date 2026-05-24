import { ok, type Result } from "$lib/shared/lib/result";
import type {
	CompanionRepository,
	CompanionRepositoryFailure,
} from "../domain/CompanionRepository";
import type { CompanionRecord } from "../model/companionSchema";

export class InMemoryCompanionRepository implements CompanionRepository {
	private companions = new Map<string, CompanionRecord>();

	public async saveCompanion(
		record: CompanionRecord,
	): Promise<Result<CompanionRecord, CompanionRepositoryFailure>> {
		this.companions.set(record.id, record);
		return ok(record);
	}

	public async getCompanion(
		id: string,
	): Promise<Result<CompanionRecord | null, CompanionRepositoryFailure>> {
		const comp = this.companions.get(id) || null;
		return ok(comp);
	}

	public async findCompanionsByCharacter(
		characterId: string,
	): Promise<Result<CompanionRecord[], CompanionRepositoryFailure>> {
		const list: CompanionRecord[] = [];
		for (const comp of this.companions.values()) {
			if (comp.characterId === characterId) {
				list.push(comp);
			}
		}
		return ok(list);
	}
}
