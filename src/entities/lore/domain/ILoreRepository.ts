import type { Result } from "$lib/shared/lib/result";
import type {
	CampaignRumorRecord,
	LoreEncounterRecord,
} from "../model/loreSchema";

export interface LoreRepositoryFailure {
	readonly code:
		| "LORE_REPOSITORY_WRITE_FAILED"
		| "LORE_REPOSITORY_READ_FAILED"
		| "ENCOUNTER_NOT_FOUND"
		| "RUMOR_NOT_FOUND";
	readonly message: string;
	readonly details?: unknown;
}

export interface ILoreRepository {
	saveEncounter(
		encounter: LoreEncounterRecord,
	): Promise<Result<LoreEncounterRecord, LoreRepositoryFailure>>;
	findEncounterById(
		id: string,
	): Promise<Result<LoreEncounterRecord | null, LoreRepositoryFailure>>;
	listEncountersByTile(
		tileId: string,
	): Promise<Result<readonly LoreEncounterRecord[], LoreRepositoryFailure>>;
	listAllEncounters(): Promise<
		Result<readonly LoreEncounterRecord[], LoreRepositoryFailure>
	>;

	saveRumor(
		rumor: CampaignRumorRecord,
	): Promise<Result<CampaignRumorRecord, LoreRepositoryFailure>>;
	findRumorById(
		id: string,
	): Promise<Result<CampaignRumorRecord | null, LoreRepositoryFailure>>;
	listRumorsByTile(
		tileId: string,
	): Promise<Result<readonly CampaignRumorRecord[], LoreRepositoryFailure>>;
	listAllRumors(): Promise<
		Result<readonly CampaignRumorRecord[], LoreRepositoryFailure>
	>;
}
