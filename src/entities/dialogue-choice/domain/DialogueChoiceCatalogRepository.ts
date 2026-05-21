import type { Result } from "$lib/shared/lib/result";
import type {
	DialogueChoiceId,
	DialogueChoiceRecord,
	DialogueChoiceTag,
} from "../model/dialogueChoiceSchema";
import type { DialogueChoiceFailure } from "../model/dialogueChoiceTypes";

export interface DialogueChoiceCatalogRepository {
	listDialogueChoices(): Promise<
		Result<readonly DialogueChoiceRecord[], DialogueChoiceFailure>
	>;
	findDialogueChoiceById(
		id: DialogueChoiceId,
	): Promise<Result<DialogueChoiceRecord, DialogueChoiceFailure>>;
	listDialogueChoicesByTag(
		tag: DialogueChoiceTag,
	): Promise<Result<readonly DialogueChoiceRecord[], DialogueChoiceFailure>>;
}
