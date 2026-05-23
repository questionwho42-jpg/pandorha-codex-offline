import type { Result } from "$lib/shared/lib/result";
import type { QuestRecord } from "../model/questSchema";

export interface QuestRepositoryFailure {
	readonly code:
		| "QUEST_REPOSITORY_WRITE_FAILED"
		| "QUEST_REPOSITORY_READ_FAILED"
		| "QUEST_NOT_FOUND";
	readonly message: string;
	readonly details?: unknown;
}

export interface QuestRepository {
	save(
		quest: QuestRecord,
	): Promise<Result<QuestRecord, QuestRepositoryFailure>>;
	findById(
		id: string,
	): Promise<Result<QuestRecord | null, QuestRepositoryFailure>>;
	findAll(): Promise<Result<QuestRecord[], QuestRepositoryFailure>>;
	delete(id: string): Promise<Result<void, QuestRepositoryFailure>>;
}
