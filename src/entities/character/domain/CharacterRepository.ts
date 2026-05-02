import type { Result } from "$lib/shared/lib/result";
import type {
	CharacterRecord,
	NewCharacterRecord,
} from "../model/characterSchema";
import type { CharacterRepositoryFailure } from "../model/characterTypes";

export interface CharacterRepository {
	save(
		record: NewCharacterRecord,
	): Promise<Result<CharacterRecord, CharacterRepositoryFailure>>;
	findById(
		id: string,
	): Promise<Result<CharacterRecord, CharacterRepositoryFailure>>;
}
