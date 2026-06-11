import { fail, ok, type Result } from "$lib/shared/lib/result";
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

export class InMemoryDungeonRepository implements DungeonRepository {
	public delves = new Map<string, DungeonDelveRecord>();
	public rooms = new Map<string, DungeonRoomRecord>();

	public async saveDelve(
		delve: NewDungeonDelveRecord,
	): Promise<Result<DungeonDelveRecord, DungeonRepositoryFailure>> {
		const record: DungeonDelveRecord = {
			id: delve.id,
			campaignId: delve.campaignId,
			seed: delve.seed,
			currentLevel: delve.currentLevel ?? 1,
			dangerLevel: delve.dangerLevel ?? 1,
			biome: delve.biome,
			status: delve.status ?? "active",
			createdAt: delve.createdAt,
			updatedAt: delve.updatedAt,
		};
		this.delves.set(record.id, record);
		return ok(record);
	}

	public async findDelveById(
		id: string,
	): Promise<Result<DungeonDelveRecord | null, DungeonRepositoryFailure>> {
		const delve = this.delves.get(id);
		return ok(delve ?? null);
	}

	public async findDelvesByCampaignId(
		campaignId: string,
	): Promise<Result<DungeonDelveRecord[], DungeonRepositoryFailure>> {
		const list = Array.from(this.delves.values()).filter(
			(d) => d.campaignId === campaignId,
		);
		return ok(list);
	}

	public async saveRoom(
		room: NewDungeonRoomRecord,
	): Promise<Result<DungeonRoomRecord, DungeonRepositoryFailure>> {
		const record: DungeonRoomRecord = {
			id: room.id,
			delveId: room.delveId,
			roomId: room.roomId,
			type: room.type,
			status: room.status ?? "hidden",
			connectionsCsv: room.connectionsCsv,
			coordinateX: room.coordinateX,
			coordinateY: room.coordinateY,
			createdAt: room.createdAt,
			updatedAt: room.updatedAt,
		};
		this.rooms.set(record.id, record);
		return ok(record);
	}

	public async findRoomsByDelveId(
		delveId: string,
	): Promise<Result<DungeonRoomRecord[], DungeonRepositoryFailure>> {
		const list = Array.from(this.rooms.values()).filter(
			(r) => r.delveId === delveId,
		);
		return ok(list);
	}

	public async findRoomByCoordinates(
		delveId: string,
		coordinateX: number,
		coordinateY: number,
	): Promise<Result<DungeonRoomRecord | null, DungeonRepositoryFailure>> {
		const room = Array.from(this.rooms.values()).find(
			(r) =>
				r.delveId === delveId &&
				r.coordinateX === coordinateX &&
				r.coordinateY === coordinateY,
		);
		return ok(room ?? null);
	}

	public async updateRoomStatus(
		id: string,
		status: "hidden" | "revealed" | "cleared",
	): Promise<Result<DungeonRoomRecord, DungeonRepositoryFailure>> {
		const room = Array.from(this.rooms.values()).find(
			(r) => r.roomId === id || r.id === id,
		);
		if (!room) {
			return fail({
				code: "DUNGEON_ROOM_NOT_FOUND",
				message: `Sala ${id} não encontrada.`,
			});
		}
		const updated = {
			...room,
			status,
			updatedAt: new Date().toISOString(),
		};
		this.rooms.set(updated.id, updated);
		return ok(updated);
	}

	public async updateDelveStatus(
		id: string,
		status: "active" | "completed" | "escaped" | "failed",
		currentLevel: number,
	): Promise<Result<DungeonDelveRecord, DungeonRepositoryFailure>> {
		const delve = this.delves.get(id);
		if (!delve) {
			return fail({
				code: "DUNGEON_DELVE_NOT_FOUND",
				message: `Incursão ${id} não encontrada.`,
			});
		}
		const updated = {
			...delve,
			status,
			currentLevel,
			updatedAt: new Date().toISOString(),
		};
		this.delves.set(updated.id, updated);
		return ok(updated);
	}
}
