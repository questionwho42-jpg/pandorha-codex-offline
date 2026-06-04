import { fail, ok, type Result } from "$lib/shared/lib/result";
import { type RpcResponse, rpcCache } from "$lib/shared/rpc";
import type { RegionalDomainRepository } from "../domain/RegionalDomainRepository";
import type {
	NewRegionalDomainRecord,
	RegionalDomainRecord,
} from "../model/regionalDomainSchema";
import type { RegionalDomainRepositoryFailure } from "../model/regionalDomainTypes";

export class WorkerRegionalDomainRepository
	implements RegionalDomainRepository
{
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
		record: NewRegionalDomainRecord,
	): Promise<Result<RegionalDomainRecord, RegionalDomainRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_REGIONAL_DOMAIN", {
			regionalDomain: record,
		});
		if (!res.success) {
			return fail({
				code: "REGIONAL_DOMAIN_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as RegionalDomainRecord);
	}

	public async findById(
		id: string,
	): Promise<Result<RegionalDomainRecord, RegionalDomainRepositoryFailure>> {
		const res = await this.sendRequest("FIND_REGIONAL_DOMAIN", { id });
		if (!res.success) {
			return fail({
				code: "REGIONAL_DOMAIN_NOT_FOUND",
				message: res.error.message,
			});
		}
		return ok(res.data as RegionalDomainRecord);
	}

	public async listAll(): Promise<
		Result<readonly RegionalDomainRecord[], RegionalDomainRepositoryFailure>
	> {
		const res = await this.sendRequest("LIST_REGIONAL_DOMAINS", {});
		if (!res.success) {
			return fail({
				code: "CORRUPTED_REGIONAL_DOMAIN_RECORD",
				message: res.error.message,
			});
		}
		return ok(res.data as readonly RegionalDomainRecord[]);
	}
}
