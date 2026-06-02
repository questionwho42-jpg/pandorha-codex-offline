import type { Result } from "$lib/shared/lib/result";
import type { AncestryId, AncestryRecord } from "../model/ancestrySchema";
import type { AncestryRepositoryFailure } from "../model/ancestryTypes";

export interface AncestryRepository {
	list(): Promise<Result<readonly AncestryRecord[], AncestryRepositoryFailure>>;
	findById(
		id: AncestryId,
	): Promise<Result<AncestryRecord, AncestryRepositoryFailure>>;
}
