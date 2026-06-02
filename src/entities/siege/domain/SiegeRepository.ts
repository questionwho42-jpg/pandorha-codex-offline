import type { Result } from "$lib/shared/lib/result";
import type {
	EventHistoryRecord,
	NewEventHistoryRecord,
	NewSiegeEventRecord,
	SiegeEventRecord,
} from "../model/siegeSchema";
import type { SiegeRepositoryFailure } from "../model/siegeTypes";

export interface SiegeRepository {
	saveSiegeEvent(
		record: NewSiegeEventRecord,
	): Promise<Result<SiegeEventRecord, SiegeRepositoryFailure>>;

	findById(
		id: string,
	): Promise<Result<SiegeEventRecord, SiegeRepositoryFailure>>;

	findActiveSiege(
		campaignId: string,
	): Promise<Result<SiegeEventRecord | null, SiegeRepositoryFailure>>;

	saveEventHistory(
		record: NewEventHistoryRecord,
	): Promise<Result<EventHistoryRecord, SiegeRepositoryFailure>>;

	listEventHistory(
		campaignId: string,
	): Promise<Result<EventHistoryRecord[], SiegeRepositoryFailure>>;
}
