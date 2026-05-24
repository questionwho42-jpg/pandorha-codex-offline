import type { Result } from "$lib/shared/lib/result";
import type { CompanionRecord } from "../model/companionSchema";

export interface CompanionRepositoryFailure {
	code:
		| "COMPANION_NOT_FOUND"
		| "CHARACTER_NOT_FOUND"
		| "COMPANION_ALREADY_EXISTS"
		| "REPOSITORY_WRITE_FAILED"
		| "REPOSITORY_READ_FAILED"
		| "EXCEEDS_TIER_LIMIT";
	message: string;
	details?: unknown;
}

export interface CompanionRepository {
	saveCompanion(
		record: CompanionRecord,
	): Promise<Result<CompanionRecord, CompanionRepositoryFailure>>;

	getCompanion(
		id: string,
	): Promise<Result<CompanionRecord | null, CompanionRepositoryFailure>>;

	findCompanionsByCharacter(
		characterId: string,
	): Promise<Result<CompanionRecord[], CompanionRepositoryFailure>>;
}
