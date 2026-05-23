import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { DialogueRepository } from "../domain/DialogueRepository";
import type {
	DialogueStateData,
	NewDialogueStateData,
} from "../model/dialogueSchema";

export class InMemoryDialogueRepository implements DialogueRepository {
	private states = new Map<string, DialogueStateData>();

	public async save(
		state: NewDialogueStateData,
	): Promise<Result<DialogueStateData, { code: string; message: string }>> {
		const data: DialogueStateData = {
			id: state.id,
			characterId: state.characterId,
			npcId: state.npcId,
			currentConversationNodeId: state.currentConversationNodeId,
			dialogueTreeId: state.dialogueTreeId,
			historyJson: state.historyJson ?? "[]",
			unlockedCluesJson: state.unlockedCluesJson ?? "[]",
			updatedAt: state.updatedAt,
		};
		this.states.set(data.id, data);
		return ok(data);
	}

	public async findById(
		id: string,
	): Promise<Result<DialogueStateData, { code: string; message: string }>> {
		const state = this.states.get(id);
		if (!state) {
			return fail({
				code: "DIALOGUE_STATE_NOT_FOUND",
				message: `Estado de diálogo ${id} não encontrado.`,
			});
		}
		return ok(state);
	}

	public async findByCharacterAndNpc(
		characterId: string,
		npcId: string,
	): Promise<
		Result<DialogueStateData | null, { code: string; message: string }>
	> {
		for (const state of this.states.values()) {
			if (state.characterId === characterId && state.npcId === npcId) {
				return ok(state);
			}
		}
		return ok(null);
	}

	public async delete(
		id: string,
	): Promise<Result<void, { code: string; message: string }>> {
		if (!this.states.has(id)) {
			return fail({
				code: "DIALOGUE_STATE_NOT_FOUND",
				message: `Estado de diálogo ${id} não encontrado para exclusão.`,
			});
		}
		this.states.delete(id);
		return ok(undefined);
	}
}
