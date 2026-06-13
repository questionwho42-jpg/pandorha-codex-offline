import { fail, ok, type Result } from "$lib/shared/lib/result";
import { type RpcResponse, rpcCache } from "$lib/shared/rpc";
import type {
	FactionRepository,
	FactionRepositoryFailure,
} from "../domain/FactionRepository";
import type {
	BloodDebtRecord,
	CampaignSocialLedgerRecord,
	FactionPatronageRecord,
	ReputationRecord,
} from "../model/socialSchema";

export class WorkerFactionRepository implements FactionRepository {
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

		const result = await new Promise<
			Result<unknown, { code: string; message: string }>
		>((resolve, reject) => {
			this.pendingRequests.set(messageId, { resolve, reject });
			this.worker.postMessage(request);
		});

		if (result.success && !isMutation) {
			rpcCache.set(type, payload, result.data);
		}

		return result;
	}

	public async saveLedger(
		record: CampaignSocialLedgerRecord,
	): Promise<Result<CampaignSocialLedgerRecord, FactionRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_SOCIAL_LEDGER", {
			ledger: record,
		});
		if (!res.success) {
			return fail({
				code: "SOCIAL_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as CampaignSocialLedgerRecord);
	}

	public async getLedger(
		id: string,
	): Promise<
		Result<CampaignSocialLedgerRecord | null, FactionRepositoryFailure>
	> {
		const res = await this.sendRequest("FIND_SOCIAL_LEDGER", { id });
		if (!res.success) {
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as CampaignSocialLedgerRecord | null);
	}

	public async saveReputation(
		record: ReputationRecord,
	): Promise<Result<ReputationRecord, FactionRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_REPUTATION", {
			reputation: record,
		});
		if (!res.success) {
			return fail({
				code: "SOCIAL_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as ReputationRecord);
	}

	public async findReputation(
		characterId: string,
		factionId: string,
	): Promise<Result<ReputationRecord | null, FactionRepositoryFailure>> {
		const res = await this.sendRequest("FIND_REPUTATION", {
			characterId,
			factionId,
		});
		if (!res.success) {
			if (res.error.code === "REPUTATION_NOT_FOUND") {
				return ok(null);
			}
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as ReputationRecord);
	}

	public async saveBloodDebt(
		record: BloodDebtRecord,
	): Promise<Result<BloodDebtRecord, FactionRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_BLOOD_DEBT", { debt: record });
		if (!res.success) {
			return fail({
				code: "SOCIAL_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as BloodDebtRecord);
	}

	public async findBloodDebtsByCharacter(
		characterId: string,
	): Promise<Result<BloodDebtRecord[], FactionRepositoryFailure>> {
		const res = await this.sendRequest("LIST_BLOOD_DEBTS", { characterId });
		if (!res.success) {
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as BloodDebtRecord[]);
	}

	public async findBloodDebtById(
		id: string,
	): Promise<Result<BloodDebtRecord | null, FactionRepositoryFailure>> {
		return fail({
			code: "BLOOD_DEBT_NOT_FOUND",
			message: `findBloodDebtById (${id}) não suportado no contexto do Worker.`,
		});
	}

	public async savePatronage(
		record: FactionPatronageRecord,
	): Promise<Result<FactionPatronageRecord, FactionRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_FACTION_PATRONAGE", {
			patronage: record,
		});
		if (!res.success) {
			return fail({
				code: "SOCIAL_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as FactionPatronageRecord);
	}

	public async findPatronage(
		id: string,
	): Promise<Result<FactionPatronageRecord | null, FactionRepositoryFailure>> {
		const res = await this.sendRequest("FIND_FACTION_PATRONAGE", { id });
		if (!res.success) {
			if (res.error.code === "PATRONAGE_NOT_FOUND") {
				return ok(null);
			}
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as FactionPatronageRecord | null);
	}

	public async findPatronageByFaction(
		factionId: string,
	): Promise<Result<FactionPatronageRecord | null, FactionRepositoryFailure>> {
		const res = await this.sendRequest("FIND_FACTION_PATRONAGE_BY_FACTION", {
			factionId,
		});
		if (!res.success) {
			if (res.error.code === "PATRONAGE_NOT_FOUND") {
				return ok(null);
			}
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as FactionPatronageRecord | null);
	}

	public async listPatronages(): Promise<
		Result<readonly FactionPatronageRecord[], FactionRepositoryFailure>
	> {
		const res = await this.sendRequest("LIST_FACTION_PATRONAGES", {});
		if (!res.success) {
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as readonly FactionPatronageRecord[]);
	}
}
