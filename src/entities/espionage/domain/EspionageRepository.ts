import type { Result } from "$lib/shared/lib/result";
import type {
	EspionageCellRecord,
	NewEspionageCellRecord,
} from "../model/espionageSchema";

export interface EspionageRepositoryFailure {
	readonly code:
		| "ESPIONAGE_REPOSITORY_WRITE_FAILED"
		| "ESPIONAGE_REPOSITORY_READ_FAILED"
		| "ESPIONAGE_CELL_NOT_FOUND";
	readonly message: string;
	readonly details?: unknown;
}

export interface EspionageRepository {
	save(
		record: NewEspionageCellRecord,
	): Promise<Result<EspionageCellRecord, EspionageRepositoryFailure>>;

	findById(
		id: string,
	): Promise<Result<EspionageCellRecord, EspionageRepositoryFailure>>;

	listByCampaign(
		campaignId: string,
	): Promise<
		Result<readonly EspionageCellRecord[], EspionageRepositoryFailure>
	>;

	deleteCell(id: string): Promise<Result<void, EspionageRepositoryFailure>>;
}
