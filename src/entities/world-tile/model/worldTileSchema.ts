import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const catalogId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);
const visibleLabel = z.string().trim().min(1).max(120);
const sourceFile = z.string().trim().min(1).max(180);
const ruleText = z.string().trim().min(1).max(1000);
const axialCoordinate = z.number().int().min(-999).max(999);

export const worldTileBiomeSchema = z.enum([
	"road",
	"forest",
	"watch",
	"ruins",
	"marsh",
	"barrow",
	"ridge",
]);
export const worldTileEncounterSignalSchema = z.enum(["none", "check"]);
export const worldTileRegionTierSchema = z.number().int().min(1).max(4);
export const worldTileCoordinatesSchema = z.object({
	q: axialCoordinate,
	r: axialCoordinate,
});

export const worldTile = sqliteTable("world_tiles", {
	id: text("id").primaryKey(),
	label: text("label").notNull(),
	q: integer("q").notNull(),
	r: integer("r").notNull(),
	biome: text("biome").notNull(),
	regionTier: integer("region_tier").notNull(),
	isKnown: integer("is_known", { mode: "boolean" }).notNull(),
	isMapped: integer("is_mapped", { mode: "boolean" }).notNull(),
	isBlocked: integer("is_blocked", { mode: "boolean" }).notNull(),
	encounterSignal: text("encounter_signal").notNull(),
	sourceFile: text("source_file").notNull(),
	summary: text("summary").notNull(),
});

export const worldTileInsertSchema = createInsertSchema(worldTile).extend({
	id: catalogId,
	label: visibleLabel,
	q: axialCoordinate,
	r: axialCoordinate,
	biome: worldTileBiomeSchema,
	regionTier: worldTileRegionTierSchema,
	isKnown: z.boolean(),
	isMapped: z.boolean(),
	isBlocked: z.boolean(),
	encounterSignal: worldTileEncounterSignalSchema,
	sourceFile,
	summary: ruleText,
});

export const worldTileSelectSchema = createSelectSchema(worldTile).extend({
	id: catalogId,
	label: visibleLabel,
	q: axialCoordinate,
	r: axialCoordinate,
	biome: worldTileBiomeSchema,
	regionTier: worldTileRegionTierSchema,
	isKnown: z.boolean(),
	isMapped: z.boolean(),
	isBlocked: z.boolean(),
	encounterSignal: worldTileEncounterSignalSchema,
	sourceFile,
	summary: ruleText,
});

export const worldTileIdSchema = catalogId;

export type WorldTileBiome = z.infer<typeof worldTileBiomeSchema>;
export type WorldTileEncounterSignal = z.infer<
	typeof worldTileEncounterSignalSchema
>;
export type WorldTileCoordinates = z.infer<typeof worldTileCoordinatesSchema>;
export type WorldTileId = z.infer<typeof worldTileIdSchema>;
export type NewWorldTileRecord = z.infer<typeof worldTileInsertSchema>;
export type WorldTileRecord = z.infer<typeof worldTileSelectSchema>;
