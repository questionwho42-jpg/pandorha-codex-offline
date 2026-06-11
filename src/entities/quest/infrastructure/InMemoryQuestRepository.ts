import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	QuestRepository,
	QuestRepositoryFailure,
} from "../domain/QuestRepository";
import type { QuestObjectiveRecord, QuestRecord } from "../model/questSchema";

export class InMemoryQuestRepository implements QuestRepository {
	public quests: QuestRecord[] = [];
	public objectives: QuestObjectiveRecord[] = [];

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

	public async saveObjective(
		objective: QuestObjectiveRecord,
	): Promise<Result<QuestObjectiveRecord, QuestRepositoryFailure>> {
		const idx = this.objectives.findIndex((o) => o.id === objective.id);
		if (idx >= 0) {
			this.objectives[idx] = objective;
		} else {
			this.objectives.push(objective);
		}
		return ok(objective);
	}

	public async findObjectiveById(
		id: string,
	): Promise<Result<QuestObjectiveRecord | null, QuestRepositoryFailure>> {
		const o = this.objectives.find((o) => o.id === id);
		return ok(o || null);
	}

	public async findObjectivesByQuestId(
		questId: string,
	): Promise<Result<QuestObjectiveRecord[], QuestRepositoryFailure>> {
		const list = this.objectives.filter((o) => o.questId === questId);
		return ok(list);
	}

	public async deleteObjective(
		id: string,
	): Promise<Result<void, QuestRepositoryFailure>> {
		const idx = this.objectives.findIndex((o) => o.id === id);
		if (idx < 0) {
			return fail({
				code: "QUEST_NOT_FOUND",
				message: `Quest objective com o ID ${id} não encontrada.`,
			});
		}
		this.objectives.splice(idx, 1);
		return ok(undefined);
	}
}
