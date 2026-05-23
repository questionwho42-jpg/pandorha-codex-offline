import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { RpcResponse } from "$lib/shared/rpc";
import type {
	BastionRepository,
	BastionRepositoryFailure,
} from "../domain/BastionRepository";
import type {
	BastionModuleRecord,
	BastionRecord,
} from "../model/bastionSchema";

export class WorkerBastionRepository implements BastionRepository {
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
		bastion: BastionRecord,
	): Promise<Result<BastionRecord, BastionRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_BASTION", { bastion });
		if (!res.success) {
			return fail({
				code: "BASTION_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as BastionRecord);
	}

	public async findById(
		id: string,
	): Promise<Result<BastionRecord, BastionRepositoryFailure>> {
		const res = await this.sendRequest("FIND_BASTION", { id });
		if (!res.success) {
			return fail({
				code: "BASTION_NOT_FOUND",
				message: res.error.message,
			});
		}
		const data = res.data as BastionRecord | null;
		if (!data) {
			return fail({
				code: "BASTION_NOT_FOUND",
				message: `Bastião com o ID ${id} não encontrado no banco local.`,
			});
		}
		return ok(data);
	}

	public async saveModule(
		module: BastionModuleRecord,
	): Promise<Result<BastionModuleRecord, BastionRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_BASTION_MODULE", { module });
		if (!res.success) {
			return fail({
				code: "BASTION_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as BastionModuleRecord);
	}

	public async findModuleById(
		id: string,
	): Promise<Result<BastionModuleRecord, BastionRepositoryFailure>> {
		const res = await this.sendRequest("LOAD_GAME_SNAPSHOT", {
			saveId: "primary",
		});
		if (!res.success) {
			return fail({
				code: "BASTION_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		// biome-ignore lint/suspicious/noExplicitAny: response structure contains snapshot
		const data = res.data as any;
		if (data?.snapshot?.bastionModules) {
			const m = data.snapshot.bastionModules.find((mod: any) => mod.id === id);
			if (m) {
				return ok(m as BastionModuleRecord);
			}
		}
		return fail({
			code: "BASTION_MODULE_NOT_FOUND",
			message: `Módulo do Bastião com o ID ${id} não encontrado no banco local.`,
		});
	}

	public async findModulesByBastionId(
		bastionId: string,
	): Promise<Result<readonly BastionModuleRecord[], BastionRepositoryFailure>> {
		const res = await this.sendRequest("FIND_BASTION_MODULES", { bastionId });
		if (!res.success) {
			return fail({
				code: "BASTION_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as BastionModuleRecord[]);
	}

	public async deleteModule(
		id: string,
	): Promise<Result<void, BastionRepositoryFailure>> {
		const res = await this.sendRequest("DELETE_BASTION_MODULE", { id });
		if (!res.success) {
			return fail({
				code: "BASTION_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(undefined);
	}

	public async loadFirstBastion(): Promise<
		Result<
			{ bastion: BastionRecord | null; modules: BastionModuleRecord[] },
			BastionRepositoryFailure
		>
	> {
		const res = await this.sendRequest("LOAD_GAME_SNAPSHOT", {
			saveId: "primary",
		});
		if (!res.success) {
			return fail({
				code: "BASTION_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		// biome-ignore lint/suspicious/noExplicitAny: response structure contains snapshot
		const data = res.data as any;
		if (data?.snapshot) {
			const snap = data.snapshot;
			const b =
				snap.bastions && snap.bastions.length > 0 ? snap.bastions[0] : null;
			const m = snap.bastionModules || [];
			return ok({ bastion: b, modules: m });
		}
		return ok({ bastion: null, modules: [] });
	}
}
