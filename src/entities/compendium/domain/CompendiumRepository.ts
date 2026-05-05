import type { Result } from "$lib/shared/lib/result";
import type {
	CompendiumEntry,
	CompendiumEntryId,
} from "../model/compendiumSchema";
import type { CompendiumRepositoryFailure } from "../model/compendiumTypes";

export interface CompendiumRepository {
	list(): Promise<
		Result<readonly CompendiumEntry[], CompendiumRepositoryFailure>
	>;
	findById(
		id: CompendiumEntryId,
	): Promise<Result<CompendiumEntry, CompendiumRepositoryFailure>>;
}
