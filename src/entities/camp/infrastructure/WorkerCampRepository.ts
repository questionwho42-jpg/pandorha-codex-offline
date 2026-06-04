import { fail, ok, type Result } from "$lib/shared/lib/result";
import { type RpcResponse, rpcCache } from "$lib/shared/rpc";
import type { CampRepository } from "../domain/CampRepository";
import type {
	CampSessionRecord,
	NewCampSessionRecord,
} from "../model/campSchema";
import type { CampRepositoryFailure } from "../model/campTypes";

export class WorkerCampRepository implements CampRepository {
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

	public async save(
		record: NewCampSessionRecord,
	): Promise<Result<CampSessionRecord, CampRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_CAMP_SESSION", {
			campSession: record,
		});
		if (!res.success) {
			return fail({
				code: "CAMP_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as CampSessionRecord);
	}

	public async findById(
		id: string,
	): Promise<Result<CampSessionRecord, CampRepositoryFailure>> {
		const res = await this.sendRequest("FIND_CAMP_SESSION", { id });
		if (!res.success) {
			return fail({
				code: "CAMP_SESSION_NOT_FOUND",
				message: res.error.message,
			});
		}
		return ok(res.data as CampSessionRecord);
	}

	public async listAll(): Promise<
		Result<readonly CampSessionRecord[], CampRepositoryFailure>
	> {
		const res = await this.sendRequest("LIST_CAMP_SESSIONS", {});
		if (!res.success) {
			return fail({
				code: "CORRUPTED_CAMP_SESSION_RECORD",
				message: res.error.message,
			});
		}
		return ok(res.data as readonly CampSessionRecord[]);
	}
}
