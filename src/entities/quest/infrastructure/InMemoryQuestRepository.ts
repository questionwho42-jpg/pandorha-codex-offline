import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	QuestRepository,
	QuestRepositoryFailure,
} from "../domain/QuestRepository";
import type { QuestRecord } from "../model/questSchema";

export class InMemoryQuestRepository implements QuestRepository {
	public quests: QuestRecord[] = [];

	public async save(
		quest: QuestRecord,
	): Promise<Result<QuestRecord, QuestRepositoryFailure>> {
		const idx = this.quests.findIndex((q) => q.id === quest.id);
		if (idx >= 0) {
			this.quests[idx] = quest;
		} else {
			this.quests.push(quest);
		}
		return ok(quest);
	}

	public async findById(
		id: string,
	): Promise<Result<QuestRecord | null, QuestRepositoryFailure>> {
		const q = this.quests.find((q) => q.id === id);
		return ok(q || null);
	}

	public async findAll(): Promise<
		Result<QuestRecord[], QuestRepositoryFailure>
	> {
		return ok([...this.quests]);
	}

	public async delete(
		id: string,
	): Promise<Result<void, QuestRepositoryFailure>> {
		const idx = this.quests.findIndex((q) => q.id === id);
		if (idx < 0) {
			return fail({
				code: "QUEST_NOT_FOUND",
				message: `Quest com o ID ${id} não encontrada.`,
			});
		}
		this.quests.splice(idx, 1);
		return ok(undefined);
	}
}
