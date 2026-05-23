import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { RpcResponse } from "$lib/shared/rpc";
import type { DialogueRepository } from "../domain/DialogueRepository";
import type {
	DialogueStateData,
	NewDialogueStateData,
} from "../model/dialogueSchema";

export class WorkerDialogueRepository implements DialogueRepository {
	private readonly worker: Worker;
	private readonly pendingRequests = new Map<
		string,
		{
			resolve: (
				value: Result<unknown, { code: string; message: string }>,
			) => void;
			reject: (reason: unknown) => void;
		}
	>();

	public constructor() {
		// Instancia o Web Worker de banco de dados do Pandorha usando a sintaxe do Vite
		this.worker = new Worker(
			new URL(
				"../../../shared/persistence/worker/pandorhaDatabase.worker.ts",
				import.meta.url,
			),
			{ type: "module" },
		);

		this.worker.onmessage = (event: MessageEvent<RpcResponse>) => {
			const response = event.data;
			const pending = this.pendingRequests.get(response.messageId);
			if (pending) {
				this.pendingRequests.delete(response.messageId);
				if (response.success) {
					pending.resolve(ok(response.data));
				} else {
					pending.resolve(
						fail({
							code: response.error.code,
							message: response.error.message,
						}),
					);
				}
			}
		};

		// Envia comando inicial para garantir que o banco local SQLite esteja montado
		void this.sendRequest("INIT_DATABASE", {
			requestedAt: new Date().toISOString(),
		});
	}

	private sendRequest(
		type: string,
		payload: unknown,
	): Promise<Result<unknown, { code: string; message: string }>> {
		const messageId = crypto.randomUUID();
		const request = {
			messageId,
			type,
			payload,
		};

		return new Promise<Result<unknown, { code: string; message: string }>>(
			(resolve, reject) => {
				this.pendingRequests.set(messageId, { resolve, reject });
				this.worker.postMessage(request);
			},
		);
	}

	public async save(
		state: NewDialogueStateData,
	): Promise<Result<DialogueStateData, { code: string; message: string }>> {
		const res = await this.sendRequest("SAVE_DIALOGUE_STATE", {
			dialogueState: state,
		});
		if (!res.success) {
			return fail(res.error);
		}
		return ok(res.data as DialogueStateData);
	}

	public async findById(
		id: string,
	): Promise<Result<DialogueStateData, { code: string; message: string }>> {
		const res = await this.sendRequest("FIND_DIALOGUE_STATE", { id }); // Não mapeado para busca individual no worker por enquanto, mas implementado por conformidade
		if (!res.success) {
			return fail(res.error);
		}
		return ok(res.data as DialogueStateData);
	}

	public async findByCharacterAndNpc(
		characterId: string,
		npcId: string,
	): Promise<
		Result<DialogueStateData | null, { code: string; message: string }>
	> {
		const res = await this.sendRequest("FIND_DIALOGUE_STATE", {
			characterId,
			npcId,
		});
		if (!res.success) {
			return fail(res.error);
		}
		return ok(res.data as DialogueStateData | null);
	}

	public async delete(
		id: string,
	): Promise<Result<void, { code: string; message: string }>> {
		const res = await this.sendRequest("DELETE_DIALOGUE_STATE", { id });
		if (!res.success) {
			return fail(res.error);
		}
		return ok(undefined);
	}
}
