import type { Result } from "$lib/shared/lib/result";
import type {
	BloodDebtRecord,
	CampaignSocialLedgerRecord,
	ReputationRecord,
} from "../model/socialSchema";

export interface FactionRepositoryFailure {
	code:
		| "FACTION_NOT_FOUND"
		| "SOCIAL_LEDGER_NOT_FOUND"
		| "SOCIAL_LEDGER_EXISTS"
		| "BLOOD_DEBT_NOT_FOUND"
		| "REPUTATION_NOT_FOUND"
		| "SOCIAL_REPOSITORY_WRITE_FAILED"
		| "SOCIAL_REPOSITORY_READ_FAILED"
		| "REST_BLOCKED_BY_DEBT"
		| "GOLD_INSUFFICIENT";
	message: string;
	details?: unknown;
}

export interface FactionRepository {
	saveLedger(
		record: CampaignSocialLedgerRecord,
	): Promise<Result<CampaignSocialLedgerRecord, FactionRepositoryFailure>>;

	getLedger(
		id: string,
	): Promise<
		Result<CampaignSocialLedgerRecord | null, FactionRepositoryFailure>
	>;

	saveReputation(
		record: ReputationRecord,
	): Promise<Result<ReputationRecord, FactionRepositoryFailure>>;

	findReputation(
		characterId: string,
		factionId: string,
	): Promise<Result<ReputationRecord | null, FactionRepositoryFailure>>;

	saveBloodDebt(
		record: BloodDebtRecord,
	): Promise<Result<BloodDebtRecord, FactionRepositoryFailure>>;

	findBloodDebtsByCharacter(
		characterId: string,
	): Promise<Result<BloodDebtRecord[], FactionRepositoryFailure>>;

	findBloodDebtById(
		id: string,
	): Promise<Result<BloodDebtRecord | null, FactionRepositoryFailure>>;
}
