import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	QuestRepository,
	QuestRepositoryFailure,
} from "../domain/QuestRepository";
import {
	campaignQuests,
	type QuestRecord,
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
}
