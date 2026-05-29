import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { RpcResponse } from "$lib/shared/rpc";
import type { MercenaryRepository } from "../domain/MercenaryRepository";
import type {
	MercenaryCompanyRecord,
	MercenarySquadRecord,
	NewMercenaryCompanyRecord,
	NewMercenarySquadRecord,
} from "../model/mercenarySchema";
import type { MercenaryRepositoryFailure } from "../model/mercenaryTypes";

export class WorkerMercenaryRepository implements MercenaryRepository {
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

	public async saveCompany(
		record: NewMercenaryCompanyRecord,
	): Promise<Result<MercenaryCompanyRecord, MercenaryRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_MERCENARY_COMPANY", {
			company: record,
		});
		if (!res.success) {
			return fail({
				code: "MERCENARY_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as MercenaryCompanyRecord);
	}

	public async findCompanyById(
		id: string,
	): Promise<Result<MercenaryCompanyRecord, MercenaryRepositoryFailure>> {
		const res = await this.sendRequest("FIND_MERCENARY_COMPANY", { id });
		if (!res.success) {
			return fail({
				code: "MERCENARY_COMPANY_NOT_FOUND",
				message: res.error.message,
			});
		}
		return ok(res.data as MercenaryCompanyRecord);
	}

	public async listCompanies(): Promise<
		Result<readonly MercenaryCompanyRecord[], MercenaryRepositoryFailure>
	> {
		const res = await this.sendRequest("LIST_MERCENARY_COMPANIES", {});
		if (!res.success) {
			return fail({
				code: "CORRUPTED_MERCENARY_RECORD",
				message: res.error.message,
			});
		}
		return ok(res.data as readonly MercenaryCompanyRecord[]);
	}

	public async saveSquad(
		record: NewMercenarySquadRecord,
	): Promise<Result<MercenarySquadRecord, MercenaryRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_MERCENARY_SQUAD", {
			squad: record,
		});
		if (!res.success) {
			return fail({
				code: "MERCENARY_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as MercenarySquadRecord);
	}

	public async findSquadById(
		id: string,
	): Promise<Result<MercenarySquadRecord, MercenaryRepositoryFailure>> {
		const res = await this.sendRequest("FIND_MERCENARY_SQUAD", { id });
		if (!res.success) {
			return fail({
				code: "MERCENARY_SQUAD_NOT_FOUND",
				message: res.error.message,
			});
		}
		return ok(res.data as MercenarySquadRecord);
	}

	public async listSquadsByCompany(
		companyId: string,
	): Promise<
		Result<readonly MercenarySquadRecord[], MercenaryRepositoryFailure>
	> {
		const res = await this.sendRequest("LIST_MERCENARY_SQUADS_BY_COMPANY", {
			companyId,
		});
		if (!res.success) {
			return fail({
				code: "CORRUPTED_MERCENARY_RECORD",
				message: res.error.message,
			});
		}
		return ok(res.data as readonly MercenarySquadRecord[]);
	}
}
