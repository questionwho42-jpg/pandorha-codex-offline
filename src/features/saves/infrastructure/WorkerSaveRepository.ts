import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { RpcResponse, SaveGameSnapshot } from "$lib/shared/rpc";

export class WorkerSaveRepository {
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

	public async getSnapshot(): Promise<Result<SaveGameSnapshot, Error>> {
		const res = await this.sendRequest("LOAD_GAME_SNAPSHOT", {
			saveId: "primary",
		});
		if (!res.success) {
			return fail(new Error(res.error.message));
		}
		// biome-ignore lint/suspicious/noExplicitAny: response structure contains snapshot
		const data = res.data as any;
		if (data && data.snapshot) {
			return ok(data.snapshot as SaveGameSnapshot);
		}
		return fail(new Error("Formato de snapshot inválido retornado do banco."));
	}

	public async saveSnapshot(
		snapshot: SaveGameSnapshot,
	): Promise<Result<void, Error>> {
		const res = await this.sendRequest("SAVE_GAME_SNAPSHOT", {
			saveId: "primary",
			snapshot,
		});
		if (!res.success) {
			return fail(new Error(res.error.message));
		}
		return ok(undefined);
	}
}
