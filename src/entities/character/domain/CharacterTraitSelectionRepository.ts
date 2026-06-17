import type { Result } from "$lib/shared/lib/result";
import type {
	CharacterTraitSelectionRecord,
	NewCharacterTraitSelectionRecord,
} from "../model/characterTraitSelectionSchema";
import type { CharacterTraitSelectionRepositoryFailure } from "../model/characterTypes";

export interface CharacterTraitSelectionRepository {
	append(
		records: readonly NewCharacterTraitSelectionRecord[],
	): Promise<
		Result<
			readonly CharacterTraitSelectionRecord[],
			CharacterTraitSelectionRepositoryFailure
		>
	>;
	listByCharacterId(
		characterId: string,
	): Promise<
		Result<
			readonly CharacterTraitSelectionRecord[],
			CharacterTraitSelectionRepositoryFailure
		>
	>;
}
