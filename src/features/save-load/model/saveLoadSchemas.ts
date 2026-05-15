import { z } from "zod/v4";
import { characterSelectSchema } from "$lib/entities/character";
import { worldStateValueSchema } from "$lib/entities/world-state";

const isoTimestamp = z.string().trim().datetime({ offset: true });

export const worldStateFlagSchema = z.object({
	key: z.string().trim().min(1),
	value: worldStateValueSchema,
	updatedAt: isoTimestamp,
});

export const saveMetadataSchema = z.object({
	version: z.literal(1),
	savedAt: isoTimestamp,
});

export const saveSessionInputSchema = z.object({
	characters: z.array(characterSelectSchema),
	worldState: z.array(worldStateFlagSchema),
	savedAt: isoTimestamp,
});

export const loadedSessionStateSchema = z.object({
	version: z.literal(1),
	savedAt: isoTimestamp,
	characters: z.array(characterSelectSchema),
	worldState: z.array(worldStateFlagSchema),
});
