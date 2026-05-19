import type { Result } from "$lib/shared/lib/result";
import type {
	FactionId,
	FactionRecord,
	FactionStandingRecord,
} from "../model/factionSchema";
import type { FactionRepositoryFailure } from "../model/factionTypes";

export interface FactionCatalogRepository {
	listFactions(): Promise<
		Result<readonly FactionRecord[], FactionRepositoryFailure>
	>;
	findFactionById(
		id: FactionId,
	): Promise<Result<FactionRecord, FactionRepositoryFailure>>;
	listFactionStandings(): Promise<
		Result<readonly FactionStandingRecord[], FactionRepositoryFailure>
	>;
	findFactionStandingByFactionId(
		id: FactionId,
	): Promise<Result<FactionStandingRecord, FactionRepositoryFailure>>;
}
