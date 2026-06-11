import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { QuestObjectiveRecord, QuestRecord } from "../model/questSchema";
import type {
	QuestRepository,
	QuestRepositoryFailure,
} from "./QuestRepository";

export class QuestService {
	public constructor(private readonly repository: QuestRepository) {}

	/**
	 * Aceita e registra uma nova missão (Quest) no diário de campanha ou guilda.
	 */
	public async acceptQuest(
		id: string,
		title: string,
		description: string,
		requirements: string[] = [],
		rewards: { gold?: number; renown?: number; xp?: number } = {},
		scope: "campaign" | "guild" = "campaign",
	): Promise<Result<QuestRecord, QuestRepositoryFailure>> {
		const existingRes = await this.repository.findById(id);
		if (existingRes.success && existingRes.data) {
			return fail({
				code: "QUEST_REPOSITORY_WRITE_FAILED",
				message: `Uma missão com o ID '${id}' já está registrada.`,
			});
		}

		const newQuest: QuestRecord = {
			id,
			title,
			description,
			status: "active",
			scope,
			requirementsJson: JSON.stringify(requirements),
			rewardsJson: JSON.stringify(rewards),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		return this.repository.save(newQuest);
	}

	/**
	 * Conclui uma missão ativa com sucesso, liberando as recompensas para o grupo.
	 */
	public async completeQuest(
		id: string,
	): Promise<Result<QuestRecord, QuestRepositoryFailure>> {
		const questRes = await this.repository.findById(id);
		if (!questRes.success || !questRes.data) {
			return fail({
				code: "QUEST_NOT_FOUND",
				message: `Quest com o ID '${id}' não encontrada para conclusão.`,
			});
		}

		const quest = questRes.data;
		if (quest.status !== "active") {
			return fail({
				code: "QUEST_REPOSITORY_WRITE_FAILED",
				message: `Não é possível concluir uma missão que não esteja ativa. Status atual: ${quest.status}`,
			});
		}

		quest.status = "completed";
		quest.updatedAt = new Date().toISOString();

		return this.repository.save(quest);
	}

	/**
	 * Marca uma missão como falhada (por exemplo, quando o grupo falha em proteger um alvo ou o tempo limite expira).
	 */
	public async failQuest(
		id: string,
	): Promise<Result<QuestRecord, QuestRepositoryFailure>> {
		const questRes = await this.repository.findById(id);
		if (!questRes.success || !questRes.data) {
			return fail({
				code: "QUEST_NOT_FOUND",
				message: `Quest com o ID '${id}' não encontrada para falha.`,
			});
		}

		const quest = questRes.data;
		if (quest.status !== "active") {
			return fail({
				code: "QUEST_REPOSITORY_WRITE_FAILED",
				message: `Não é possível falhar uma missão que não esteja ativa. Status atual: ${quest.status}`,
			});
		}

		quest.status = "failed";
		quest.updatedAt = new Date().toISOString();

		return this.repository.save(quest);
	}

	/**
	 * Lista todas as missões registradas na campanha.
	 */
	public async listQuests(): Promise<
		Result<QuestRecord[], QuestRepositoryFailure>
	> {
		return this.repository.findAll();
	}

	/**
	 * Adiciona um objetivo de progresso a uma quest ativa.
	 */
	public async addObjective(
		questId: string,
		objectiveId: string,
		description: string,
		type: "kill" | "collect" | "clue" | "custom",
		target: string,
		requiredAmount = 1,
	): Promise<Result<QuestObjectiveRecord, QuestRepositoryFailure>> {
		const questRes = await this.repository.findById(questId);
		if (!questRes.success || !questRes.data) {
			return fail({
				code: "QUEST_NOT_FOUND",
				message: `Quest com o ID '${questId}' não encontrada para adicionar objetivo.`,
			});
		}

		const newObjective: QuestObjectiveRecord = {
			id: objectiveId,
			questId,
			description,
			status: "active",
			type,
			target,
			currentAmount: 0,
			requiredAmount,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		return this.repository.saveObjective(newObjective);
	}

	/**
	 * Incrementa o progresso de um objetivo de quest.
	 */
	public async updateObjectiveProgress(
		objectiveId: string,
		amount: number,
	): Promise<Result<QuestObjectiveRecord, QuestRepositoryFailure>> {
		const objRes = await this.repository.findObjectiveById(objectiveId);
		if (!objRes.success || !objRes.data) {
			return fail({
				code: "QUEST_NOT_FOUND",
				message: `Objetivo com o ID '${objectiveId}' não encontrado.`,
			});
		}

		const objective = objRes.data;
		if (objective.status !== "active") {
			return fail({
				code: "QUEST_REPOSITORY_WRITE_FAILED",
				message: `Não é possível progredir um objetivo que não esteja ativo. Status atual: ${objective.status}`,
			});
		}

		objective.currentAmount = Math.min(
			objective.requiredAmount,
			objective.currentAmount + amount,
		);
		if (objective.currentAmount >= objective.requiredAmount) {
			objective.status = "completed";
		}
		objective.updatedAt = new Date().toISOString();

		const saveRes = await this.repository.saveObjective(objective);
		if (!saveRes.success) {
			return saveRes;
		}

		if (objective.status === "completed") {
			const allObjRes = await this.repository.findObjectivesByQuestId(
				objective.questId,
			);
			if (
				allObjRes.success &&
				allObjRes.data.every((o) => o.status === "completed")
			) {
				await this.completeQuest(objective.questId);
			}
		}

		return saveRes;
	}

	/**
	 * Lista os objetivos de uma quest.
	 */
	public async listObjectives(
		questId: string,
	): Promise<Result<QuestObjectiveRecord[], QuestRepositoryFailure>> {
		return this.repository.findObjectivesByQuestId(questId);
	}

	/**
	 * Verifica e atualiza objetivos de quests ativas de acordo com mudanças no estado do mundo.
	 */
	public async evaluateObjectivesAgainstWorldState(
		unlockedClues: string[],
		slainMonsters: Record<string, number> = {},
	): Promise<Result<void, QuestRepositoryFailure>> {
		const questsRes = await this.repository.findAll();
		if (!questsRes.success) {
			return fail(questsRes.error);
		}

		const activeQuests = questsRes.data.filter((q) => q.status === "active");
		for (const quest of activeQuests) {
			const objRes = await this.repository.findObjectivesByQuestId(quest.id);
			if (!objRes.success) {
				continue;
			}

			const activeObjectives = objRes.data.filter((o) => o.status === "active");
			for (const obj of activeObjectives) {
				if (obj.type === "clue" && unlockedClues.includes(obj.target)) {
					await this.updateObjectiveProgress(obj.id, 1);
				} else if (obj.type === "kill") {
					const count = slainMonsters[obj.target] ?? 0;
					if (count > 0) {
						await this.updateObjectiveProgress(obj.id, count);
					}
				}
			}
		}

		return ok(undefined);
	}
}
