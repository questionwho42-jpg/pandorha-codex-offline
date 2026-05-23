import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { RpcResponse } from "$lib/shared/rpc";
import type {
	SocialRepository,
	SocialRepositoryFailure,
} from "../domain/SocialRepository";
import type {
	BloodDebtRecord,
	FactionRecord,
	ReputationRecord,
} from "../model/socialSchema";

export class WorkerSocialRepository implements SocialRepository {
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

		// Envia comando inicial para garantir que o banco local SQLite esteja montado
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

	public async saveFaction(
		faction: FactionRecord,
	): Promise<Result<FactionRecord, SocialRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_FACTION", { faction });
		if (!res.success) {
			return fail({
				code: "SOCIAL_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as FactionRecord);
	}

	public async findFactionById(
		id: string,
	): Promise<Result<FactionRecord, SocialRepositoryFailure>> {
		const res = await this.sendRequest("FIND_FACTION", { id });
		if (!res.success) {
			return fail({
				code: "FACTION_NOT_FOUND",
				message: res.error.message,
			});
		}
		return ok(res.data as FactionRecord);
	}

	public async listFactions(): Promise<
		Result<readonly FactionRecord[], SocialRepositoryFailure>
	> {
		const res = await this.sendRequest("LIST_FACTIONS", {});
		if (!res.success) {
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as readonly FactionRecord[]);
	}

	public async saveReputation(
		reputation: ReputationRecord,
	): Promise<Result<ReputationRecord, SocialRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_REPUTATION", { reputation });
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
	): Promise<Result<ReputationRecord, SocialRepositoryFailure>> {
		const res = await this.sendRequest("FIND_REPUTATION", {
			characterId,
			factionId,
		});
		if (!res.success) {
			return fail({
				code: "REPUTATION_NOT_FOUND",
				message: res.error.message,
			});
		}
		return ok(res.data as ReputationRecord);
	}

	public async listReputationsByCharacter(
		characterId: string,
	): Promise<Result<readonly ReputationRecord[], SocialRepositoryFailure>> {
		const res = await this.sendRequest("LIST_REPUTATIONS", { characterId });
		if (!res.success) {
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as readonly ReputationRecord[]);
	}

	public async saveBloodDebt(
		debt: BloodDebtRecord,
	): Promise<Result<BloodDebtRecord, SocialRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_BLOOD_DEBT", { debt });
		if (!res.success) {
			return fail({
				code: "SOCIAL_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as BloodDebtRecord);
	}

	public async listBloodDebtsByCharacter(
		characterId: string,
	): Promise<Result<readonly BloodDebtRecord[], SocialRepositoryFailure>> {
		const res = await this.sendRequest("LIST_BLOOD_DEBTS", { characterId });
		if (!res.success) {
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as readonly BloodDebtRecord[]);
	}
}
