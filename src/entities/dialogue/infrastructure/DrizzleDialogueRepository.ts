import { and, eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { DialogueRepository } from "../domain/DialogueRepository";
import {
	campaignDialogueStates,
	type DialogueStateData,
	dialogueStateSelectSchema,
	type NewDialogueStateData,
} from "../model/dialogueSchema";

export class DrizzleDialogueRepository implements DialogueRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic database instance
	public constructor(private readonly db: any) {}

	public async save(
		state: NewDialogueStateData,
	): Promise<Result<DialogueStateData, { code: string; message: string }>> {
		try {
			await this.db
				.insert(campaignDialogueStates)
				.values({
					id: state.id,
					characterId: state.characterId,
					npcId: state.npcId,
					currentConversationNodeId: state.currentConversationNodeId,
					dialogueTreeId: state.dialogueTreeId,
					historyJson: state.historyJson,
					unlockedCluesJson: state.unlockedCluesJson,
					updatedAt: state.updatedAt,
				})
				.onConflictDoUpdate({
					target: campaignDialogueStates.id,
					set: {
						characterId: state.characterId,
						npcId: state.npcId,
						currentConversationNodeId: state.currentConversationNodeId,
						dialogueTreeId: state.dialogueTreeId,
						historyJson: state.historyJson,
						unlockedCluesJson: state.unlockedCluesJson,
						updatedAt: state.updatedAt,
					},
				})
				.run();

			const mapped: DialogueStateData = {
				id: state.id,
				characterId: state.characterId,
				npcId: state.npcId,
				currentConversationNodeId: state.currentConversationNodeId,
				dialogueTreeId: state.dialogueTreeId,
				historyJson: state.historyJson ?? "[]",
				unlockedCluesJson: state.unlockedCluesJson ?? "[]",
				updatedAt: state.updatedAt,
			};

			return ok(dialogueStateSelectSchema.parse(mapped));
		} catch (error: unknown) {
			return fail({
				code: "DIALOGUE_SAVE_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Erro desconhecido ao salvar estado de diálogo.",
			});
		}
	}

	public async findById(
		id: string,
	): Promise<Result<DialogueStateData, { code: string; message: string }>> {
		try {
			const rows = await this.db
				.select()
				.from(campaignDialogueStates)
				.where(eq(campaignDialogueStates.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return fail({
					code: "DIALOGUE_STATE_NOT_FOUND",
					message: `Estado de diálogo ${id} não encontrado.`,
				});
			}
			return ok(dialogueStateSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "DIALOGUE_FIND_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Erro desconhecido ao carregar estado de diálogo.",
			});
		}
	}

	public async findByCharacterAndNpc(
		characterId: string,
		npcId: string,
	): Promise<
		Result<DialogueStateData | null, { code: string; message: string }>
	> {
		try {
			const rows = await this.db
				.select()
				.from(campaignDialogueStates)
				.where(
					and(
						eq(campaignDialogueStates.characterId, characterId),
						eq(campaignDialogueStates.npcId, npcId),
					),
				)
				.all();
			const row = rows[0];
			if (!row) {
				return ok(null);
			}
			return ok(dialogueStateSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "DIALOGUE_QUERY_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Erro desconhecido ao consultar estado de diálogo.",
			});
		}
	}

	public async delete(
		id: string,
	): Promise<Result<void, { code: string; message: string }>> {
		try {
			await this.db
				.delete(campaignDialogueStates)
				.where(eq(campaignDialogueStates.id, id))
				.run();
			return ok(undefined);
		} catch (error: unknown) {
			return fail({
				code: "DIALOGUE_DELETE_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Erro desconhecido ao deletar estado de diálogo.",
			});
		}
	}
}
