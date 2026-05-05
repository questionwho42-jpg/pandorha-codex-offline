import type { Result } from "$lib/shared/lib/result";
import type { BackgroundId, BackgroundRecord } from "../model/backgroundSchema";
import type { BackgroundRepositoryFailure } from "../model/backgroundTypes";

export interface BackgroundRepository {
	list(): Promise<
		Result<readonly BackgroundRecord[], BackgroundRepositoryFailure>
	>;
	findById(
		id: BackgroundId,
	): Promise<Result<BackgroundRecord, BackgroundRepositoryFailure>>;
}
