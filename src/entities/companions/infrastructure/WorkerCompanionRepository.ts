import { fail, ok, type Result } from "$lib/shared/lib/result";
import { type RpcResponse, rpcCache } from "$lib/shared/rpc";
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
