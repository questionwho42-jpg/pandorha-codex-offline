import { fail, ok, type Result } from "$lib/shared/lib/result";
import { type RpcResponse, rpcCache } from "$lib/shared/rpc";
import type {
	QuestRepository,
	QuestRepositoryFailure,
} from "../domain/QuestRepository";
import type { QuestRecord } from "../model/questSchema";

export class WorkerQuestRepository implements QuestRepository {
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
		quest: QuestRecord,
	): Promise<Result<QuestRecord, QuestRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_QUEST", { quest });
		if (!res.success) {
			return fail({
				code: "QUEST_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as QuestRecord);
	}

	public async findById(
		id: string,
	): Promise<Result<QuestRecord | null, QuestRepositoryFailure>> {
		const res = await this.sendRequest("FIND_QUEST", { id });
		if (!res.success) {
			return fail({
				code: "QUEST_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as QuestRecord | null);
	}

	public async findAll(): Promise<
		Result<QuestRecord[], QuestRepositoryFailure>
	> {
		const res = await this.sendRequest("LIST_QUESTS", {});
		if (!res.success) {
			return fail({
				code: "QUEST_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as QuestRecord[]);
	}

	public async delete(
		id: string,
	): Promise<Result<void, QuestRepositoryFailure>> {
		const res = await this.sendRequest("DELETE_QUEST", { id });
		if (!res.success) {
			return fail({
				code: "QUEST_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(undefined);
	}
}
