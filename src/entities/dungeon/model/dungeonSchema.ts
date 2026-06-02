import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const delveStatusEnum = z.enum([
	"active",
	"completed",
	"escaped",
	"failed",
]);
export const roomTypeEnum = z.enum([
	"combat",
	"treasure",
	"puzzle",
	"rest",
	"boss",
]);
export const roomStatusEnum = z.enum(["hidden", "revealed", "cleared"]);
export const dungeonBiomeEnum = z.enum(["ruins", "caverns", "crypt"]);

export const dungeonDelves = sqliteTable("dungeon_delves", {
	id: text("id").primaryKey(),
	campaignId: text("campaign_id").notNull(),
	seed: integer("seed").notNull(),
	currentLevel: integer("current_level").notNull().default(1),
	dangerLevel: integer("danger_level").notNull().default(1),
	biome: text("biome").notNull(), // 'ruins' | 'caverns' | 'crypt'
	status: text("status").notNull().default("active"), // 'active' | 'completed' | 'escaped' | 'failed'
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const dungeonRooms = sqliteTable("dungeon_rooms", {
	id: text("id").primaryKey(),
	delveId: text("delve_id")
		.notNull()
		.references(() => dungeonDelves.id, { onDelete: "cascade" }),
	roomId: text("room_id").notNull(),
	type: text("type").notNull(), // 'combat' | 'treasure' | 'puzzle' | 'rest' | 'boss'
	status: text("status").notNull().default("hidden"), // 'hidden' | 'revealed' | 'cleared'
	connectionsCsv: text("connections_csv").notNull(), // ex: "room_0_1,room_1_0"
	coordinateX: integer("coordinate_x").notNull(),
	coordinateY: integer("coordinate_y").notNull(),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

// Zod validation schemas
export const dungeonDelveInsertSchema = createInsertSchema(
	dungeonDelves,
).extend({
	id: z.string().uuid("ID inválido para a incursão de masmorra"),
	campaignId: z.string().min(1, "O ID da campanha é obrigatório"),
	seed: z.number().int(),
	currentLevel: z.number().int().min(1),
	dangerLevel: z.number().int().min(1).max(5),
	biome: dungeonBiomeEnum,
	status: delveStatusEnum,
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

export const dungeonDelveSelectSchema = createSelectSchema(
	dungeonDelves,
).extend({
	id: z.string().uuid(),
	campaignId: z.string().min(1),
	seed: z.number().int(),
	currentLevel: z.number().int().min(1),
	dangerLevel: z.number().int().min(1).max(5),
	biome: dungeonBiomeEnum,
	status: delveStatusEnum,
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

export const dungeonRoomInsertSchema = createInsertSchema(dungeonRooms).extend({
	id: z.string().uuid("ID inválido para a sala"),
	delveId: z.string().uuid("ID inválido para a incursão correspondente"),
	roomId: z.string().min(1, "O ID da sala é obrigatório"),
	type: roomTypeEnum,
	status: roomStatusEnum,
	connectionsCsv: z.string(),
	coordinateX: z.number().int(),
	coordinateY: z.number().int(),
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

export const dungeonRoomSelectSchema = createSelectSchema(dungeonRooms).extend({
	id: z.string().uuid(),
	delveId: z.string().uuid(),
	roomId: z.string().min(1),
	type: roomTypeEnum,
	status: roomStatusEnum,
	connectionsCsv: z.string(),
	coordinateX: z.number().int(),
	coordinateY: z.number().int(),
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

export type DelveStatus = z.infer<typeof delveStatusEnum>;
export type RoomType = z.infer<typeof roomTypeEnum>;
export type RoomStatus = z.infer<typeof roomStatusEnum>;
export type DungeonBiome = z.infer<typeof dungeonBiomeEnum>;

export type DungeonDelveRecord = z.infer<typeof dungeonDelveSelectSchema>;
export type NewDungeonDelveRecord = z.infer<typeof dungeonDelveInsertSchema>;
export type DungeonRoomRecord = z.infer<typeof dungeonRoomSelectSchema>;
export type NewDungeonRoomRecord = z.infer<typeof dungeonRoomInsertSchema>;
