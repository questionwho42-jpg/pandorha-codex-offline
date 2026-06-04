import { fail, ok, type Result } from "$lib/shared/lib/result";
import { type RpcResponse, rpcCache } from "$lib/shared/rpc";
import type {
	EspionageRepository,
	EspionageRepositoryFailure,
} from "../domain/EspionageRepository";
import type {
	EspionageCellRecord,
	NewEspionageCellRecord,
} from "../model/espionageSchema";

export class WorkerEspionageRepository implements EspionageRepository {
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
		record: NewEspionageCellRecord,
	): Promise<Result<EspionageCellRecord, EspionageRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_ESPIONAGE_CELL", {
			cell: record,
		});
		if (!res.success) {
			return fail({
				code: "ESPIONAGE_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as EspionageCellRecord);
	}

	public async findById(
		id: string,
	): Promise<Result<EspionageCellRecord, EspionageRepositoryFailure>> {
		const res = await this.sendRequest("FIND_ESPIONAGE_CELL", { id });
		if (!res.success) {
			return fail({
				code: "ESPIONAGE_CELL_NOT_FOUND",
				message: res.error.message,
			});
		}
		return ok(res.data as EspionageCellRecord);
	}

	public async listByCampaign(
		campaignId: string,
	): Promise<
		Result<readonly EspionageCellRecord[], EspionageRepositoryFailure>
	> {
		const res = await this.sendRequest("LIST_ESPIONAGE_CELLS", { campaignId });
		if (!res.success) {
			return fail({
				code: "ESPIONAGE_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as readonly EspionageCellRecord[]);
	}

	public async deleteCell(
		id: string,
	): Promise<Result<void, EspionageRepositoryFailure>> {
		const res = await this.sendRequest("DELETE_ESPIONAGE_CELL", { id });
		if (!res.success) {
			return fail({
				code: "ESPIONAGE_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(undefined);
	}
}
