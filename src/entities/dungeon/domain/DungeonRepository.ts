import type { Result } from "$lib/shared/lib/result";
import type {
	DungeonDelveRecord,
	DungeonRoomRecord,
	NewDungeonDelveRecord,
	NewDungeonRoomRecord,
} from "../model/dungeonSchema";

export interface DungeonRepositoryFailure {
	readonly code:
		| "DUNGEON_REPOSITORY_WRITE_FAILED"
		| "DUNGEON_REPOSITORY_READ_FAILED"
		| "DUNGEON_DELVE_NOT_FOUND"
		| "DUNGEON_ROOM_NOT_FOUND";
	readonly message: string;
	readonly details?: unknown;
}

export interface DungeonRepository {
	saveDelve(
		delve: NewDungeonDelveRecord,
	): Promise<Result<DungeonDelveRecord, DungeonRepositoryFailure>>;
	findDelveById(
		id: string,
	): Promise<Result<DungeonDelveRecord | null, DungeonRepositoryFailure>>;
	findDelvesByCampaignId(
		campaignId: string,
	): Promise<Result<DungeonDelveRecord[], DungeonRepositoryFailure>>;
	saveRoom(
		room: NewDungeonRoomRecord,
	): Promise<Result<DungeonRoomRecord, DungeonRepositoryFailure>>;
	findRoomsByDelveId(
		delveId: string,
	): Promise<Result<DungeonRoomRecord[], DungeonRepositoryFailure>>;
	findRoomByCoordinates(
		delveId: string,
		coordinateX: number,
		coordinateY: number,
	): Promise<Result<DungeonRoomRecord | null, DungeonRepositoryFailure>>;
	updateRoomStatus(
		id: string,
		status: "hidden" | "revealed" | "cleared",
	): Promise<Result<DungeonRoomRecord, DungeonRepositoryFailure>>;
	updateDelveStatus(
		id: string,
		status: "active" | "completed" | "escaped" | "failed",
		currentLevel: number,
	): Promise<Result<DungeonDelveRecord, DungeonRepositoryFailure>>;
}
