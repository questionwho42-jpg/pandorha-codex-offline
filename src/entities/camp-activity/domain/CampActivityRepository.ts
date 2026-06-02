import type { Result } from "$lib/shared/lib/result";
import type {
	CampActivityId,
	CampActivityRecord,
} from "../model/campActivitySchema";
import type { CampActivityRepositoryFailure } from "../model/campActivityTypes";

export interface CampActivityRepository {
	list(): Promise<
		Result<readonly CampActivityRecord[], CampActivityRepositoryFailure>
	>;
	findById(
		id: CampActivityId,
	): Promise<Result<CampActivityRecord, CampActivityRepositoryFailure>>;
}
