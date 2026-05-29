import type { Result } from "$lib/shared/lib/result";
import type {
	NewRegionalDomainRecord,
	RegionalDomainRecord,
} from "../model/regionalDomainSchema";
import type { RegionalDomainRepositoryFailure } from "../model/regionalDomainTypes";

export interface RegionalDomainRepository {
	save(
		record: NewRegionalDomainRecord,
	): Promise<Result<RegionalDomainRecord, RegionalDomainRepositoryFailure>>;

	findById(
		id: string,
	): Promise<Result<RegionalDomainRecord, RegionalDomainRepositoryFailure>>;

	listAll(): Promise<
		Result<readonly RegionalDomainRecord[], RegionalDomainRepositoryFailure>
	>;
}
