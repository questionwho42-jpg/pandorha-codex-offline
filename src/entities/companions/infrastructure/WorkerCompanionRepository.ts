import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { RpcResponse } from "$lib/shared/rpc";
import type {
	CompanionRepository,
	CompanionRepositoryFailure,
} from "../domain/CompanionRepository";
import type { CompanionRecord } from "../model/companionSchema";

export class WorkerCompanionRepository implements CompanionRepository {
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

	public async saveCompanion(
		companion: CompanionRecord,
	): Promise<Result<CompanionRecord, CompanionRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_COMPANION", { companion });
		if (!res.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as CompanionRecord);
	}

	public async getCompanion(
		id: string,
	): Promise<Result<CompanionRecord | null, CompanionRepositoryFailure>> {
		const res = await this.sendRequest("FIND_COMPANION", { id });
		if (!res.success) {
			return fail({
				code: "REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as CompanionRecord | null);
	}

	public async findCompanionsByCharacter(
		characterId: string,
	): Promise<Result<CompanionRecord[], CompanionRepositoryFailure>> {
		const res = await this.sendRequest("LIST_COMPANIONS", { characterId });
		if (!res.success) {
			return fail({
				code: "REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as CompanionRecord[]);
	}
}
