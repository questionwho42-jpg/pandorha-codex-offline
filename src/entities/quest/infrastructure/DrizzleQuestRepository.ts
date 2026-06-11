import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	QuestRepository,
	QuestRepositoryFailure,
} from "../domain/QuestRepository";
import {
	campaignQuests,
	type QuestObjectiveRecord,
	type QuestRecord,
	questObjectiveSelectSchema,
	questObjectives,
	questSelectSchema,
} from "../model/questSchema";

export class DrizzleQuestRepository implements QuestRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance
	public constructor(private readonly db: any) {}

	public async save(
		quest: QuestRecord,
	): Promise<Result<QuestRecord, QuestRepositoryFailure>> {
		try {
			await this.db
				.insert(campaignQuests)
				.values({
					id: quest.id,
					title: quest.title,
					description: quest.description,
					status: quest.status,
					requirementsJson: quest.requirementsJson,
					rewardsJson: quest.rewardsJson,
					createdAt: quest.createdAt,
					updatedAt: quest.updatedAt,
				})
				.onConflictDoUpdate({
					target: campaignQuests.id,
					set: {
						title: quest.title,
						description: quest.description,
						status: quest.status,
						requirementsJson: quest.requirementsJson,
						rewardsJson: quest.rewardsJson,
						updatedAt: quest.updatedAt,
					},
				})
				.run();
			return ok(quest);
		} catch (error: unknown) {
			return fail({
				code: "QUEST_REPOSITORY_WRITE_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Could not persist quest in SQLite via Drizzle.",
			});
		}
	}

	public async findById(
		id: string,
	): Promise<Result<QuestRecord | null, QuestRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(campaignQuests)
				.where(eq(campaignQuests.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return ok(null);
			}
			return ok(questSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "QUEST_REPOSITORY_READ_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Error reading quest from SQLite via Drizzle.",
			});
		}
	}

	public async findAll(): Promise<
		Result<QuestRecord[], QuestRepositoryFailure>
	> {
		try {
			const rows = await this.db.select().from(campaignQuests).all();
			const parsed = rows.map((row: unknown) => questSelectSchema.parse(row));
			return ok(parsed);
		} catch (error: unknown) {
			return fail({
				code: "QUEST_REPOSITORY_READ_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Error listing quests from SQLite via Drizzle.",
			});
		}
	}

	public async delete(
		id: string,
	): Promise<Result<void, QuestRepositoryFailure>> {
		try {
			await this.db
				.delete(campaignQuests)
				.where(eq(campaignQuests.id, id))
				.run();
			return ok(undefined);
		} catch (error: unknown) {
			return fail({
				code: "QUEST_REPOSITORY_WRITE_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Error deleting quest from SQLite via Drizzle.",
			});
		}
	}

	public async saveObjective(
		objective: QuestObjectiveRecord,
	): Promise<Result<QuestObjectiveRecord, QuestRepositoryFailure>> {
		try {
			await this.db
				.insert(questObjectives)
				.values({
					id: objective.id,
					questId: objective.questId,
					description: objective.description,
					status: objective.status,
					type: objective.type,
					target: objective.target,
					currentAmount: objective.currentAmount,
					requiredAmount: objective.requiredAmount,
					createdAt: objective.createdAt,
					updatedAt: objective.updatedAt,
				})
				.onConflictDoUpdate({
					target: questObjectives.id,
					set: {
						description: objective.description,
						status: objective.status,
						type: objective.type,
						target: objective.target,
						currentAmount: objective.currentAmount,
						requiredAmount: objective.requiredAmount,
						updatedAt: objective.updatedAt,
					},
				})
				.run();
			return ok(objective);
		} catch (error: unknown) {
			return fail({
				code: "QUEST_REPOSITORY_WRITE_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Could not persist quest objective in SQLite via Drizzle.",
			});
		}
	}

	public async findObjectiveById(
		id: string,
	): Promise<Result<QuestObjectiveRecord | null, QuestRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(questObjectives)
				.where(eq(questObjectives.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return ok(null);
			}
			return ok(questObjectiveSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "QUEST_REPOSITORY_READ_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Error reading quest objective from SQLite via Drizzle.",
			});
		}
	}

	public async findObjectivesByQuestId(
		questId: string,
	): Promise<Result<QuestObjectiveRecord[], QuestRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(questObjectives)
				.where(eq(questObjectives.questId, questId))
				.all();
			const parsed = rows.map((row: unknown) =>
				questObjectiveSelectSchema.parse(row),
			);
			return ok(parsed);
		} catch (error: unknown) {
			return fail({
				code: "QUEST_REPOSITORY_READ_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Error listing quest objectives from SQLite via Drizzle.",
			});
		}
	}

	public async deleteObjective(
		id: string,
	): Promise<Result<void, QuestRepositoryFailure>> {
		try {
			await this.db
				.delete(questObjectives)
				.where(eq(questObjectives.id, id))
				.run();
			return ok(undefined);
		} catch (error: unknown) {
			return fail({
				code: "QUEST_REPOSITORY_WRITE_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Error deleting quest objective from SQLite via Drizzle.",
			});
		}
	}
}
