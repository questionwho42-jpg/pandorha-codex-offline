import type { Result } from "$lib/shared/lib/result";
import type {
	CharacterClassId,
	CharacterClassRecord,
} from "../model/characterClassSchema";
import type { CharacterClassRepositoryFailure } from "../model/characterClassTypes";

export interface CharacterClassRepository {
	list(): Promise<
		Result<readonly CharacterClassRecord[], CharacterClassRepositoryFailure>
	>;
	findById(
		id: CharacterClassId,
	): Promise<Result<CharacterClassRecord, CharacterClassRepositoryFailure>>;
}
