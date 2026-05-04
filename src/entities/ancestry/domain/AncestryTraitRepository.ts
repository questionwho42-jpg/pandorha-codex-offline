import type { Result } from "$lib/shared/lib/result";
import type {
	AncestryId,
	AncestryTraitId,
	AncestryTraitLinkRecord,
	AncestryTraitRecord,
} from "../model/ancestrySchema";
import type { AncestryTraitRepositoryFailure } from "../model/ancestryTypes";

export interface AncestryTraitRepository {
	listTraitsByAncestry(
		ancestryId: AncestryId,
	): Promise<
		Result<readonly AncestryTraitRecord[], AncestryTraitRepositoryFailure>
	>;
	findTraitsByIds(
		traitIds: readonly AncestryTraitId[],
	): Promise<
		Result<readonly AncestryTraitRecord[], AncestryTraitRepositoryFailure>
	>;
	listLinksByAncestry(
		ancestryId: AncestryId,
	): Promise<
		Result<readonly AncestryTraitLinkRecord[], AncestryTraitRepositoryFailure>
	>;
}
