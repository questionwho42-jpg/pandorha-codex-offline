import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { RpcResponse } from "$lib/shared/rpc";

export class WorkerDowntimeRepository {
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

	public async getCampaignRecess(
		campaignId: string,
	): Promise<Result<any, { code: string; message: string }>> {
		return this.sendRequest("GET_CAMPAIGN_RECESS", { campaignId });
	}

	public async addRecessDays(
		campaignId: string,
		days: number,
	): Promise<Result<any, { code: string; message: string }>> {
		return this.sendRequest("ADD_RECESS_DAYS", { campaignId, days });
	}

	public async resolveDowntimeWeek(params: {
		campaignId: string;
		location: "city" | "bastion";
		allocations: Array<{
			characterId: string;
			actionTag: string;
			params: any;
		}>;
	}): Promise<Result<any, { code: string; message: string }>> {
		return this.sendRequest("RESOLVE_DOWNTIME_WEEK", params);
	}
}
