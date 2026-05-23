import type { Result } from "$lib/shared/lib/result";
import type {
	DialogueStateData,
	NewDialogueStateData,
} from "../model/dialogueSchema";

export interface DialogueRepository {
	save(
		state: NewDialogueStateData,
	): Promise<Result<DialogueStateData, { code: string; message: string }>>;
	findById(
		id: string,
	): Promise<Result<DialogueStateData, { code: string; message: string }>>;
	findByCharacterAndNpc(
		characterId: string,
		npcId: string,
	): Promise<
		Result<DialogueStateData | null, { code: string; message: string }>
	>;
	delete(id: string): Promise<Result<void, { code: string; message: string }>>;
}
