import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { RpcResponse, SaveGameSnapshot } from "$lib/shared/rpc";
import type { InvestigationRepository } from "../domain/InvestigationRepository";
import type {
	InvestigationRecord,
	NewInvestigationRecord,
} from "../model/investigationSchema";
import type { InvestigationRepositoryFailure } from "../model/investigationTypes";

export class WorkerInvestigationRepository implements InvestigationRepository {
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
		record: NewInvestigationRecord,
	): Promise<Result<InvestigationRecord, InvestigationRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_INVESTIGATION", {
			investigation: record,
		});
		if (!res.success) {
			return fail({
				code: "INVESTIGATION_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as InvestigationRecord);
	}

	public async findById(
		id: string,
	): Promise<Result<InvestigationRecord, InvestigationRepositoryFailure>> {
		const res = await this.sendRequest("FIND_INVESTIGATION", { id });
		if (!res.success) {
			return fail({
				code: "INVESTIGATION_NOT_FOUND",
				message: res.error.message,
			});
		}
		return ok(res.data as InvestigationRecord);
	}

	public async findByTargetId(
		targetId: string,
	): Promise<Result<InvestigationRecord[], InvestigationRepositoryFailure>> {
		const res = await this.sendRequest("LIST_INVESTIGATIONS_BY_TARGET", {
			targetId,
		});
		if (!res.success) {
			return fail({
				code: "INVESTIGATION_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as InvestigationRecord[]);
	}

	public async listActive(): Promise<
		Result<InvestigationRecord[], InvestigationRepositoryFailure>
	> {
		const res = await this.sendRequest("LIST_ACTIVE_INVESTIGATIONS", {});
		if (!res.success) {
			return fail({
				code: "INVESTIGATION_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as InvestigationRecord[]);
	}

	public async loadGameSnapshot(): Promise<
		Result<SaveGameSnapshot, { code: string; message: string }>
	> {
		const res = await this.sendRequest("LOAD_GAME_SNAPSHOT", {
			saveId: "primary",
		});
		if (!res.success) {
			return fail(res.error);
		}
		return ok(res.data as SaveGameSnapshot);
	}

	public async saveGameSnapshot(
		snapshot: SaveGameSnapshot,
	): Promise<Result<unknown, { code: string; message: string }>> {
		return this.sendRequest("SAVE_GAME_SNAPSHOT", {
			saveId: "primary",
			snapshot,
		});
	}
}
