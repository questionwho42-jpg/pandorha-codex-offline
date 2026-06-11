import { fail, ok, type Result } from "$lib/shared/lib/result";
import { type RpcResponse, rpcCache } from "$lib/shared/rpc";
import type { WorldStateRepository } from "../domain/WorldStateRepository";
import type {
	WorldStateEntryRecord,
	WorldStateKey,
	WorldStateListPrefix,
} from "../model/worldStateSchema";
import type { WorldStateRepositoryFailure } from "../model/worldStateTypes";

export class WorkerWorldStateRepository implements WorldStateRepository {
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

	private async sendRequest(
		type: string,
		payload: unknown,
	): Promise<Result<unknown, { code: string; message: string }>> {
		rpcCache.invalidate(type);

		const isMutation =
			!type.startsWith("LOAD_") &&
			!type.startsWith("FIND_") &&
			!type.startsWith("LIST_") &&
			!type.startsWith("GET_") &&
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

	public async setFlag(flag: {
		key: WorldStateKey;
		valueJson: string;
		updatedAt: string;
	}): Promise<Result<WorldStateEntryRecord, WorldStateRepositoryFailure>> {
		const res = await this.sendRequest("SET_WORLD_STATE_FLAG", flag);
		if (!res.success) {
			return fail({
				code: "WORLD_STATE_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as WorldStateEntryRecord);
	}

	public async getFlag(
		key: WorldStateKey,
	): Promise<Result<WorldStateEntryRecord, WorldStateRepositoryFailure>> {
		const res = await this.sendRequest("GET_WORLD_STATE_FLAG", { key });
		if (!res.success) {
			return fail({
				code: "WORLD_STATE_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as WorldStateEntryRecord);
	}

	public async listFlagsByPrefix(
		prefix: WorldStateListPrefix,
	): Promise<
		Result<readonly WorldStateEntryRecord[], WorldStateRepositoryFailure>
	> {
		const res = await this.sendRequest("LIST_WORLD_STATE_FLAGS", { prefix });
		if (!res.success) {
			return fail({
				code: "WORLD_STATE_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as readonly WorldStateEntryRecord[]);
	}
}
