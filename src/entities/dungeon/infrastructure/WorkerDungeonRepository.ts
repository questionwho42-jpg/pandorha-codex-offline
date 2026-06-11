import { fail, ok, type Result } from "$lib/shared/lib/result";
import { type RpcResponse, rpcCache } from "$lib/shared/rpc";
import type {
	DungeonRepository,
	DungeonRepositoryFailure,
} from "../domain/DungeonRepository";
import type {
	DungeonDelveRecord,
	DungeonRoomRecord,
	NewDungeonDelveRecord,
	NewDungeonRoomRecord,
} from "../model/dungeonSchema";

export class WorkerDungeonRepository implements DungeonRepository {
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
			!type.startsWith("GET_");

		const messageId = `${type}-${Date.now()}-${Math["random"]()}`;
		const promise = new Promise<
			Result<unknown, { code: string; message: string }>
		>((resolve, reject) => {
			this.pendingRequests.set(messageId, { resolve, reject });
		});

		this.worker.postMessage({
			messageId,
			type,
			payload,
		});

		const result = await promise;
		return result;
	}

	public async saveDelve(
		delve: NewDungeonDelveRecord,
	): Promise<Result<DungeonDelveRecord, DungeonRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_DUNGEON_DELVE", { delve });
		if (!res.success) {
			return fail({
				code: "DUNGEON_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as DungeonDelveRecord);
	}

	public async findDelveById(
		id: string,
	): Promise<Result<DungeonDelveRecord | null, DungeonRepositoryFailure>> {
		const res = await this.sendRequest("FIND_DUNGEON_DELVE", { id });
		if (!res.success) {
			return fail({
				code: "DUNGEON_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as DungeonDelveRecord | null);
	}

	public async findDelvesByCampaignId(
		campaignId: string,
	): Promise<Result<DungeonDelveRecord[], DungeonRepositoryFailure>> {
		const res = await this.sendRequest("LIST_DUNGEON_DELVES", { campaignId });
		if (!res.success) {
			return fail({
				code: "DUNGEON_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as DungeonDelveRecord[]);
	}

	public async saveRoom(
		room: NewDungeonRoomRecord,
	): Promise<Result<DungeonRoomRecord, DungeonRepositoryFailure>> {
		const res = await this.sendRequest("SAVE_DUNGEON_ROOM", { room });
		if (!res.success) {
			return fail({
				code: "DUNGEON_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as DungeonRoomRecord);
	}

	public async findRoomsByDelveId(
		delveId: string,
	): Promise<Result<DungeonRoomRecord[], DungeonRepositoryFailure>> {
		const res = await this.sendRequest("FIND_DUNGEON_ROOMS", { delveId });
		if (!res.success) {
			return fail({
				code: "DUNGEON_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as DungeonRoomRecord[]);
	}

	public async findRoomByCoordinates(
		delveId: string,
		coordinateX: number,
		coordinateY: number,
	): Promise<Result<DungeonRoomRecord | null, DungeonRepositoryFailure>> {
		const res = await this.sendRequest("FIND_DUNGEON_ROOM_BY_COORDS", {
			delveId,
			coordinateX,
			coordinateY,
		});
		if (!res.success) {
			return fail({
				code: "DUNGEON_REPOSITORY_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as DungeonRoomRecord | null);
	}

	public async updateRoomStatus(
		id: string,
		status: "hidden" | "revealed" | "cleared",
	): Promise<Result<DungeonRoomRecord, DungeonRepositoryFailure>> {
		const res = await this.sendRequest("UPDATE_DUNGEON_ROOM_STATUS", {
			id,
			status,
		});
		if (!res.success) {
			return fail({
				code: "DUNGEON_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as DungeonRoomRecord);
	}

	public async updateDelveStatus(
		id: string,
		status: "active" | "completed" | "escaped" | "failed",
		currentLevel: number,
	): Promise<Result<DungeonDelveRecord, DungeonRepositoryFailure>> {
		const res = await this.sendRequest("UPDATE_DUNGEON_DELVE_STATUS", {
			id,
			status,
			currentLevel,
		});
		if (!res.success) {
			return fail({
				code: "DUNGEON_REPOSITORY_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as DungeonDelveRecord);
	}
}
