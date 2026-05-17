import type { Result } from "$lib/shared/lib/result";
import type {
	CharacterRecord,
	CharacterStatusEffectRecord,
	NewCharacterRecord,
	NewCharacterStatusEffectRecord,
} from "../model/characterSchema";
import type { CharacterRepositoryFailure } from "../model/characterTypes";

export interface CharacterRepository {
	save(
		record: NewCharacterRecord,
	): Promise<Result<CharacterRecord, CharacterRepositoryFailure>>;
	findById(
		id: string,
	): Promise<Result<CharacterRecord, CharacterRepositoryFailure>>;
	saveStatusEffect(
		effect: NewCharacterStatusEffectRecord,
	): Promise<Result<CharacterStatusEffectRecord, CharacterRepositoryFailure>>;
	findStatusEffectsByCharacterId(
		characterId: string,
	): Promise<Result<CharacterStatusEffectRecord[], CharacterRepositoryFailure>>;
	deleteStatusEffect(
		id: string,
	): Promise<Result<void, CharacterRepositoryFailure>>;
}
