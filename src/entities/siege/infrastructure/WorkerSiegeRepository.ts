import type { CampaignEventRecord as EventHistoryRecord } from "$lib/entities/campaign";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { RpcResponse } from "$lib/shared/rpc";
import type { SiegeEventRecord } from "../model/siegeSchema";
import type { SiegeRepositoryFailure } from "../model/siegeTypes";

export class WorkerSiegeRepository {
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

	public async triggerSiege(params: {
		campaignId: string;
		bastionId: string;
		factionId: string;
		dangerLevel: number;
		requestedAt: string;
		uuid?: string | undefined;
	}): Promise<Result<SiegeEventRecord, SiegeRepositoryFailure>> {
		const res = await this.sendRequest("TRIGGER_SIEGE", params);
		if (!res.success) {
			return fail({
				code: "SIEGE_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as SiegeEventRecord);
	}

	public async resolveSiegeRound(params: {
		siegeId: string;
		defenseRollBonus: number;
		requestedAt: string;
		forcedAttackRoll?: number;
		forcedDefenseRoll?: number;
		squadIdsToDefend?: string[];
	}): Promise<
		Result<
			{
				damageToBastion: number;
				isResolved: boolean;
				logMessage: string;
				updatedBastion?: any;
				updatedSquads?: any[];
				resetClockName?: string;
			},
			SiegeRepositoryFailure
		>
	> {
		const res = await this.sendRequest("RESOLVE_SIEGE_ROUND", params);
		if (!res.success) {
			return fail({
				code: "SIEGE_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as any);
	}

	public async findActiveSiege(
		campaignId: string,
	): Promise<Result<SiegeEventRecord | null, SiegeRepositoryFailure>> {
		const res = await this.sendRequest("FIND_ACTIVE_SIEGE", { campaignId });
		if (!res.success) {
			return fail({
				code: "SIEGE_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as SiegeEventRecord | null);
	}

	public async listSiegeHistory(
		campaignId: string,
	): Promise<Result<EventHistoryRecord[], SiegeRepositoryFailure>> {
		const res = await this.sendRequest("LIST_SIEGE_HISTORY", { campaignId });
		if (!res.success) {
			return fail({
				code: "SIEGE_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as EventHistoryRecord[]);
	}
}
