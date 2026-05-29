import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { RpcResponse } from "$lib/shared/rpc";

/**
 * @description Repositorio de forja baseado no Web Worker offline do Pandorha.
 */
export class WorkerCraftingRepository {
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

	public async dismantleCraftedItem(
		characterId: string,
		itemId: string,
	): Promise<
		Result<
			{ materialsRecovered: Record<string, number> },
			{ code: string; message: string }
		>
	> {
		const res = await this.sendRequest("DISMANTLE_CRAFTED_ITEM", {
			characterId,
			itemId,
		});
		if (!res.success) {
			return fail(res.error);
		}
		return ok(res.data as { materialsRecovered: Record<string, number> });
	}

	public async scrapEquipment(
		equipmentId: string,
	): Promise<
		Result<{ materialRecovered: string }, { code: string; message: string }>
	> {
		const res = await this.sendRequest("SCRAP_EQUIPMENT", {
			equipmentId,
		});
		if (!res.success) {
			return fail(res.error);
		}
		return ok(res.data as { materialRecovered: string });
	}
}
