import type { Result } from "$lib/shared/lib/result";
import type {
	CampSessionRecord,
	NewCampSessionRecord,
} from "../model/campSchema";
import type { CampRepositoryFailure } from "../model/campTypes";

export interface CampRepository {
	save(
		record: NewCampSessionRecord,
	): Promise<Result<CampSessionRecord, CampRepositoryFailure>>;

	findById(
		id: string,
	): Promise<Result<CampSessionRecord, CampRepositoryFailure>>;

	listAll(): Promise<
		Result<readonly CampSessionRecord[], CampRepositoryFailure>
	>;
}
