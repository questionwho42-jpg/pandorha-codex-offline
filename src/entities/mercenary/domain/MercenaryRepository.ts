import type { Result } from "$lib/shared/lib/result";
import type {
	MercenaryCompanyRecord,
	MercenarySquadRecord,
	NewMercenaryCompanyRecord,
	NewMercenarySquadRecord,
} from "../model/mercenarySchema";
import type { MercenaryRepositoryFailure } from "../model/mercenaryTypes";

export interface MercenaryRepository {
	saveCompany(
		record: NewMercenaryCompanyRecord,
	): Promise<Result<MercenaryCompanyRecord, MercenaryRepositoryFailure>>;

	findCompanyById(
		id: string,
	): Promise<Result<MercenaryCompanyRecord, MercenaryRepositoryFailure>>;

	listCompanies(): Promise<
		Result<readonly MercenaryCompanyRecord[], MercenaryRepositoryFailure>
	>;

	saveSquad(
		record: NewMercenarySquadRecord,
	): Promise<Result<MercenarySquadRecord, MercenaryRepositoryFailure>>;

	findSquadById(
		id: string,
	): Promise<Result<MercenarySquadRecord, MercenaryRepositoryFailure>>;

	listSquadsByCompany(
		companyId: string,
	): Promise<
		Result<readonly MercenarySquadRecord[], MercenaryRepositoryFailure>
	>;
}
