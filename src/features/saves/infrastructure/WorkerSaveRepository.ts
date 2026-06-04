import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type RpcResponse,
	rpcCache,
	type SaveGameSnapshot,
} from "$lib/shared/rpc";

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

		const activeSaveFile =
			typeof window !== "undefined"
				? window.localStorage.getItem("pandorha_active_save_file") ||
					"pandorha.sqlite3"
				: "pandorha.sqlite3";
		void this.sendRequest("INIT_DATABASE", {
			requestedAt: new Date().toISOString(),
			activeSaveFile,
		});
	}

	private async sendRequest(
		type: string,
		payload: unknown,
	): Promise<Result<unknown, { code: string; message: string }>> {
		rpcCache.invalidate(type);

		const isMutation =
			!type.startsWith("LOAD_") &&
			!type.startsWith("FIND_") &&
			!type.startsWith("LIST_") &&
			type !== "INIT_DATABASE";

		if (!isMutation) {
			const cached = rpcCache.get(type, payload);
			if (cached !== null) {
				return ok(cached);
			}
		}

		const messageId = crypto.randomUUID();
		const request = {
			messageId,
			type,
			payload,
		};

		const startTime = performance.now();

		const result = await new Promise<
			Result<unknown, { code: string; message: string }>
		>((resolve, reject) => {
			this.pendingRequests.set(messageId, { resolve, reject });
			this.worker.postMessage(request);
		});

		const latency = performance.now() - startTime;
		if (latency > 16) {
			console.warn(
				`[RPC Latency Warning] Request ${type} took ${latency.toFixed(2)}ms (budget exceeded)`,
			);
		} else {
			console.log(`[RPC Latency] Request ${type} took ${latency.toFixed(2)}ms`);
		}

		if (result.success && !isMutation) {
			rpcCache.set(type, payload, result.data);
		}

		return result;
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
		if (data?.snapshot) {
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

	public async listSaveSlots(): Promise<
		Result<
			{ fileName: string; sizeBytes: number; lastModified: string }[],
			Error
		>
	> {
		const res = await this.sendRequest("LIST_SAVE_SLOTS", {});
		if (!res.success) {
			return fail(new Error(res.error.message));
		}
		return ok(
			res.data as {
				fileName: string;
				sizeBytes: number;
				lastModified: string;
			}[],
		);
	}

	public async createSaveSlot(fileName: string): Promise<Result<void, Error>> {
		const res = await this.sendRequest("CREATE_SAVE_SLOT", { fileName });
		if (!res.success) {
			return fail(new Error(res.error.message));
		}
		return ok(undefined);
	}

	public async cloneSaveSlot(
		sourceFileName: string,
		targetFileName: string,
	): Promise<Result<void, Error>> {
		const res = await this.sendRequest("CLONE_SAVE_SLOT", {
			sourceFileName,
			targetFileName,
		});
		if (!res.success) {
			return fail(new Error(res.error.message));
		}
		return ok(undefined);
	}

	public async deleteSaveSlot(fileName: string): Promise<Result<void, Error>> {
		const res = await this.sendRequest("DELETE_SAVE_SLOT", { fileName });
		if (!res.success) {
			return fail(new Error(res.error.message));
		}
		return ok(undefined);
	}
}
