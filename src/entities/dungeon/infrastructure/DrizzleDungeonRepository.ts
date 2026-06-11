import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	DungeonRepository,
	DungeonRepositoryFailure,
} from "../domain/DungeonRepository";
import {
	type DungeonDelveRecord,
	type DungeonRoomRecord,
	dungeonDelveSelectSchema,
	dungeonDelves,
	dungeonRoomSelectSchema,
	dungeonRooms,
	type NewDungeonDelveRecord,
	type NewDungeonRoomRecord,
} from "../model/dungeonSchema";

export class DrizzleDungeonRepository implements DungeonRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance
	public constructor(private readonly db: any) {}

	public async saveDelve(
		delve: NewDungeonDelveRecord,
	): Promise<Result<DungeonDelveRecord, DungeonRepositoryFailure>> {
		try {
			await this.db
				.insert(dungeonDelves)
				.values({
					id: delve.id,
					campaignId: delve.campaignId,
					seed: delve.seed,
					currentLevel: delve.currentLevel ?? 1,
					dangerLevel: delve.dangerLevel ?? 1,
					biome: delve.biome,
					status: delve.status ?? "active",
					createdAt: delve.createdAt,
					updatedAt: delve.updatedAt,
				})
				.onConflictDoUpdate({
					target: dungeonDelves.id,
					set: {
						currentLevel: delve.currentLevel ?? 1,
						dangerLevel: delve.dangerLevel ?? 1,
						status: delve.status ?? "active",
						updatedAt: delve.updatedAt,
					},
				})
				.run();

			const record = dungeonDelveSelectSchema.parse(delve);
			return ok(record);
		} catch (error: unknown) {
			return fail({
				code: "DUNGEON_REPOSITORY_WRITE_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Failed to save dungeon delve.",
			});
		}
	}

	public async findDelveById(
		id: string,
	): Promise<Result<DungeonDelveRecord | null, DungeonRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(dungeonDelves)
				.where(eq(dungeonDelves.id, id))
				.all();
			if (rows.length === 0) return ok(null);
			const record = dungeonDelveSelectSchema.parse(rows[0]);
			return ok(record);
		} catch (error: unknown) {
			return fail({
				code: "DUNGEON_REPOSITORY_READ_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Failed to find dungeon delve.",
			});
		}
	}

	public async findDelvesByCampaignId(
		campaignId: string,
	): Promise<Result<DungeonDelveRecord[], DungeonRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(dungeonDelves)
				.where(eq(dungeonDelves.campaignId, campaignId))
				.all();
			const list = rows.map((r: any) => dungeonDelveSelectSchema.parse(r));
			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "DUNGEON_REPOSITORY_READ_FAILED",
				message:
					error instanceof Error ? error.message : "Failed to list delves.",
			});
		}
	}

	public async saveRoom(
		room: NewDungeonRoomRecord,
	): Promise<Result<DungeonRoomRecord, DungeonRepositoryFailure>> {
		try {
			await this.db
				.insert(dungeonRooms)
				.values({
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
				})
				.onConflictDoUpdate({
					target: dungeonRooms.id,
					set: {
						status: room.status ?? "hidden",
						connectionsCsv: room.connectionsCsv,
						coordinateX: room.coordinateX,
						coordinateY: room.coordinateY,
						updatedAt: room.updatedAt,
					},
				})
				.run();

			const record = dungeonRoomSelectSchema.parse(room);
			return ok(record);
		} catch (error: unknown) {
			return fail({
				code: "DUNGEON_REPOSITORY_WRITE_FAILED",
				message:
					error instanceof Error ? error.message : "Failed to save room.",
			});
		}
	}

	public async findRoomsByDelveId(
		delveId: string,
	): Promise<Result<DungeonRoomRecord[], DungeonRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(dungeonRooms)
				.where(eq(dungeonRooms.delveId, delveId))
				.all();
			const list = rows.map((r: any) => dungeonRoomSelectSchema.parse(r));
			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "DUNGEON_REPOSITORY_READ_FAILED",
				message:
					error instanceof Error ? error.message : "Failed to find rooms.",
			});
		}
	}

	public async findRoomByCoordinates(
		delveId: string,
		coordinateX: number,
		coordinateY: number,
	): Promise<Result<DungeonRoomRecord | null, DungeonRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(dungeonRooms)
				.where(eq(dungeonRooms.delveId, delveId))
				.all();
			const found = rows.find(
				(r: any) =>
					r.coordinateX === coordinateX && r.coordinateY === coordinateY,
			);
			if (!found) return ok(null);
			const record = dungeonRoomSelectSchema.parse(found);
			return ok(record);
		} catch (error: unknown) {
			return fail({
				code: "DUNGEON_REPOSITORY_READ_FAILED",
				message:
					error instanceof Error ? error.message : "Failed to find room.",
			});
		}
	}

	public async updateRoomStatus(
		id: string,
		status: "hidden" | "revealed" | "cleared",
	): Promise<Result<DungeonRoomRecord, DungeonRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(dungeonRooms)
				.where(eq(dungeonRooms.id, id))
				.all();

			let target = rows[0];
			if (!target) {
				const rowsByRoomId = await this.db
					.select()
					.from(dungeonRooms)
					.where(eq(dungeonRooms.roomId, id))
					.all();
				target = rowsByRoomId[0];
			}

			if (!target) {
				return fail({
					code: "DUNGEON_ROOM_NOT_FOUND",
					message: `Sala ${id} não encontrada no banco.`,
				});
			}

			const nowStr = new Date().toISOString();
			await this.db
				.update(dungeonRooms)
				.set({
					status,
					updatedAt: nowStr,
				})
				.where(eq(dungeonRooms.id, target.id))
				.run();

			const record = dungeonRoomSelectSchema.parse({
				...target,
				status,
				updatedAt: nowStr,
			});
			return ok(record);
		} catch (error: unknown) {
			return fail({
				code: "DUNGEON_REPOSITORY_WRITE_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Failed to update room status.",
			});
		}
	}

	public async updateDelveStatus(
		id: string,
		status: "active" | "completed" | "escaped" | "failed",
		currentLevel: number,
	): Promise<Result<DungeonDelveRecord, DungeonRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(dungeonDelves)
				.where(eq(dungeonDelves.id, id))
				.all();

			if (rows.length === 0) {
				return fail({
					code: "DUNGEON_DELVE_NOT_FOUND",
					message: `Masmorra ${id} não encontrada.`,
				});
			}

			const nowStr = new Date().toISOString();
			await this.db
				.update(dungeonDelves)
				.set({
					status,
					currentLevel,
					updatedAt: nowStr,
				})
				.where(eq(dungeonDelves.id, id))
				.run();

			const record = dungeonDelveSelectSchema.parse({
				...rows[0],
				status,
				currentLevel,
				updatedAt: nowStr,
			});
			return ok(record);
		} catch (error: unknown) {
			return fail({
				code: "DUNGEON_REPOSITORY_WRITE_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Failed to update delve status.",
			});
		}
	}
}
