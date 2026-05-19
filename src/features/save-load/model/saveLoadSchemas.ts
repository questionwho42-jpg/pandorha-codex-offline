import { z } from "zod/v4";
import {
	campAssignmentSelectSchema,
	campSessionSelectSchema,
} from "$lib/entities/camp-session";
import { characterSelectSchema } from "$lib/entities/character";
import { clockSelectSchema } from "$lib/entities/clock";
import { worldStateValueSchema } from "$lib/entities/world-state";

const isoTimestamp = z.string().trim().datetime({ offset: true });
export const CURRENT_SAVE_VERSION = 2;

export const worldStateFlagSchema = z.object({
	key: z.string().trim().min(1),
	value: worldStateValueSchema,
	updatedAt: isoTimestamp,
});

export const saveMetadataV1Schema = z.object({
	version: z.literal(1),
	savedAt: isoTimestamp,
});

export const saveMetadataV2Schema = z.object({
	version: z.literal(2),
	savedAt: isoTimestamp,
});

export const saveMetadataAnySchema = z.union([
	saveMetadataV1Schema,
	saveMetadataV2Schema,
]);

export const saveMetadataSchema = saveMetadataAnySchema;

export const saveSessionInputSchema = z.object({
	characters: z.array(characterSelectSchema),
	worldState: z.array(worldStateFlagSchema),
	clocks: z.array(clockSelectSchema).default([]),
	campSessions: z.array(campSessionSelectSchema).default([]),
	campAssignments: z.array(campAssignmentSelectSchema).default([]),
	savedAt: isoTimestamp,
});

export const loadedSessionStateV1Schema = z.object({
	version: z.literal(1),
	savedAt: isoTimestamp,
	characters: z.array(characterSelectSchema),
	worldState: z.array(worldStateFlagSchema),
});

export const loadedSessionStateV2Schema = z.object({
	version: z.literal(CURRENT_SAVE_VERSION),
	savedAt: isoTimestamp,
	characters: z.array(characterSelectSchema),
	worldState: z.array(worldStateFlagSchema),
	clocks: z.array(clockSelectSchema),
	campSessions: z.array(campSessionSelectSchema),
	campAssignments: z.array(campAssignmentSelectSchema),
});

export const loadedSessionStateSchema = z.union([
	loadedSessionStateV1Schema,
	loadedSessionStateV2Schema,
]);

export function migrateSaveV1ToV2(
	snapshot: z.infer<typeof loadedSessionStateV1Schema>,
): z.infer<typeof loadedSessionStateV2Schema> {
	return {
		version: CURRENT_SAVE_VERSION,
		savedAt: snapshot.savedAt,
		characters: snapshot.characters,
		worldState: snapshot.worldState,
		clocks: [],
		campSessions: [],
		campAssignments: [],
	};
}

export function migrateLoadedSessionToCurrent(
	snapshot: z.infer<typeof loadedSessionStateSchema>,
): z.infer<typeof loadedSessionStateV2Schema> {
	if (snapshot.version === 1) {
		return migrateSaveV1ToV2(snapshot);
	}

	return snapshot;
}
