import { z } from "zod/v4";
import {
	campAssignmentSelectSchema,
	campSessionSelectSchema,
} from "$lib/entities/camp-session";
import { characterSelectSchema } from "$lib/entities/character";
import { clockSelectSchema } from "$lib/entities/clock";
import { factionStandingSelectSchema } from "$lib/entities/faction";
import { worldStateValueSchema } from "$lib/entities/world-state";

const isoTimestamp = z.string().trim().datetime({ offset: true });
export const CURRENT_SAVE_VERSION = 3;

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

export const saveMetadataV3Schema = z.object({
	version: z.literal(CURRENT_SAVE_VERSION),
	savedAt: isoTimestamp,
});

export const saveMetadataAnySchema = z.union([
	saveMetadataV1Schema,
	saveMetadataV2Schema,
	saveMetadataV3Schema,
]);

export const saveMetadataSchema = saveMetadataAnySchema;

export const saveSessionInputSchema = z.object({
	characters: z.array(characterSelectSchema),
	worldState: z.array(worldStateFlagSchema),
	clocks: z.array(clockSelectSchema).default([]),
	campSessions: z.array(campSessionSelectSchema).default([]),
	campAssignments: z.array(campAssignmentSelectSchema).default([]),
	factionStandings: z.array(factionStandingSelectSchema).default([]),
	savedAt: isoTimestamp,
});

export const loadedSessionStateV1Schema = z.object({
	version: z.literal(1),
	savedAt: isoTimestamp,
	characters: z.array(characterSelectSchema),
	worldState: z.array(worldStateFlagSchema),
});

export const loadedSessionStateV2Schema = z.object({
	version: z.literal(2),
	savedAt: isoTimestamp,
	characters: z.array(characterSelectSchema),
	worldState: z.array(worldStateFlagSchema),
	clocks: z.array(clockSelectSchema),
	campSessions: z.array(campSessionSelectSchema),
	campAssignments: z.array(campAssignmentSelectSchema),
});

export const loadedSessionStateV3Schema = z.object({
	version: z.literal(CURRENT_SAVE_VERSION),
	savedAt: isoTimestamp,
	characters: z.array(characterSelectSchema),
	worldState: z.array(worldStateFlagSchema),
	clocks: z.array(clockSelectSchema),
	campSessions: z.array(campSessionSelectSchema),
	campAssignments: z.array(campAssignmentSelectSchema),
	factionStandings: z.array(factionStandingSelectSchema),
});

export const loadedSessionStateSchema = z.union([
	loadedSessionStateV1Schema,
	loadedSessionStateV2Schema,
	loadedSessionStateV3Schema,
]);

export function migrateSaveV1ToV2(
	snapshot: z.infer<typeof loadedSessionStateV1Schema>,
): z.infer<typeof loadedSessionStateV2Schema> {
	return {
		version: 2,
		savedAt: snapshot.savedAt,
		characters: snapshot.characters,
		worldState: snapshot.worldState,
		clocks: [],
		campSessions: [],
		campAssignments: [],
	};
}

export function migrateSaveV2ToV3(
	snapshot: z.infer<typeof loadedSessionStateV2Schema>,
): z.infer<typeof loadedSessionStateV3Schema> {
	return {
		version: CURRENT_SAVE_VERSION,
		savedAt: snapshot.savedAt,
		characters: snapshot.characters,
		worldState: snapshot.worldState,
		clocks: snapshot.clocks,
		campSessions: snapshot.campSessions,
		campAssignments: snapshot.campAssignments,
		factionStandings: [],
	};
}

export function migrateLoadedSessionToCurrent(
	snapshot: z.infer<typeof loadedSessionStateSchema>,
): z.infer<typeof loadedSessionStateV3Schema> {
	if (snapshot.version === 1) {
		return migrateSaveV2ToV3(migrateSaveV1ToV2(snapshot));
	}

	if (snapshot.version === 2) {
		return migrateSaveV2ToV3(snapshot);
	}

	return snapshot;
}
