import { fail, type Result } from "$lib/shared/lib/result";
import type { QuestRecord } from "../model/questSchema";
import type {
	QuestRepository,
	QuestRepositoryFailure,
} from "./QuestRepository";

export class QuestService {
	public constructor(private readonly repository: QuestRepository) {}

	/**
	 * Aceita e registra uma nova missão (Quest) no diário de campanha.
	 */
	public async acceptQuest(
		id: string,
		title: string,
		description: string,
		requirements: string[] = [],
		rewards: { gold?: number; renown?: number; xp?: number } = {},
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
}
