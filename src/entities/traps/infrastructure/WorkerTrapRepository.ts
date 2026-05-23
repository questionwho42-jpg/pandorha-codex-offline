import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { RpcResponse } from "$lib/shared/rpc";
import type {
	TrapRepository,
	TrapRepositoryFailure,
} from "../domain/TrapRepository";
import type { NewTrapRecord, TrapRecord } from "../model/trapSchema";

export class WorkerTrapRepository implements TrapRepository {
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

	public async save(
		record: NewTrapRecord,
	): Promise<Result<TrapRecord, TrapRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_TRAP", { trap: record });
		if (!res.success) {
			return fail({
				code: "TRAP_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as TrapRecord);
	}

	public async findById(
		id: string,
	): Promise<Result<TrapRecord, TrapRepositoryFailure>> {
		const res = await this.sendRequest("FIND_TRAP", { id });
		if (!res.success) {
			return fail({
				code: "TRAP_NOT_FOUND",
				message: res.error.message,
			});
		}
		return ok(res.data as TrapRecord);
	}

	public async findByTileId(
		tileId: string,
	): Promise<Result<TrapRecord[], TrapRepositoryFailure>> {
		const res = await this.sendRequest("LIST_TRAPS", { tileId });
		if (!res.success) {
			return fail({
				code: "TRAP_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as TrapRecord[]);
	}

	public async delete(
		id: string,
	): Promise<Result<void, TrapRepositoryFailure>> {
		const res = await this.sendRequest("DELETE_TRAP", { id });
		if (!res.success) {
			return fail({
				code: "TRAP_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(undefined);
	}
}
