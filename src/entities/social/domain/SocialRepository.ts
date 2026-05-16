import type { Result } from "$lib/shared/lib/result";
import type {
	BloodDebtRecord,
	FactionRecord,
	ReputationRecord,
} from "../model/socialSchema";

export interface SocialRepositoryFailure {
	readonly code:
		| "SOCIAL_REPOSITORY_WRITE_FAILED"
		| "SOCIAL_REPOSITORY_READ_FAILED"
		| "FACTION_NOT_FOUND"
		| "REPUTATION_NOT_FOUND";
	readonly message: string;
	readonly details?: unknown;
}

export interface SocialRepository {
	saveFaction(
		faction: FactionRecord,
	): Promise<Result<FactionRecord, SocialRepositoryFailure>>;
	findFactionById(
		id: string,
	): Promise<Result<FactionRecord, SocialRepositoryFailure>>;
	listFactions(): Promise<
		Result<readonly FactionRecord[], SocialRepositoryFailure>
	>;

	saveReputation(
		reputation: ReputationRecord,
	): Promise<Result<ReputationRecord, SocialRepositoryFailure>>;
	findReputation(
		characterId: string,
		factionId: string,
	): Promise<Result<ReputationRecord, SocialRepositoryFailure>>;
	listReputationsByCharacter(
		characterId: string,
	): Promise<Result<readonly ReputationRecord[], SocialRepositoryFailure>>;

	saveBloodDebt(
		debt: BloodDebtRecord,
	): Promise<Result<BloodDebtRecord, SocialRepositoryFailure>>;
	listBloodDebtsByCharacter(
		characterId: string,
	): Promise<Result<readonly BloodDebtRecord[], SocialRepositoryFailure>>;
}
