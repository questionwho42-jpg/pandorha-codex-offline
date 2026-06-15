import { z } from "zod/v4";
import {
	campAssignmentSelectSchema,
	campSessionSelectSchema,
} from "$lib/entities/camp-session";
import { characterSelectSchema } from "$lib/entities/character";
import { clockSelectSchema } from "$lib/entities/clock";
import { factionStandingSelectSchema } from "$lib/entities/faction";
import { inventoryEventSelectSchema } from "$lib/entities/inventory";
import { npcRelationshipSelectSchema } from "$lib/entities/npc-relationship";
import {
	socialEncounterEventSelectSchema,
	socialEncounterSelectSchema,
} from "$lib/entities/social-encounter";
import { worldStateValueSchema } from "$lib/entities/world-state";

const isoTimestamp = z.string().trim().datetime({ offset: true });
export const CURRENT_SAVE_VERSION = 6;

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
	version: z.literal(3),
	savedAt: isoTimestamp,
});

export const saveMetadataV4Schema = z.object({
	version: z.literal(4),
	savedAt: isoTimestamp,
});

export const saveMetadataV5Schema = z.object({
	version: z.literal(5),
	savedAt: isoTimestamp,
});

export const saveMetadataV6Schema = z.object({
	version: z.literal(CURRENT_SAVE_VERSION),
	savedAt: isoTimestamp,
});

export const saveMetadataAnySchema = z.union([
	saveMetadataV1Schema,
	saveMetadataV2Schema,
	saveMetadataV3Schema,
	saveMetadataV4Schema,
	saveMetadataV5Schema,
	saveMetadataV6Schema,
]);

export const saveMetadataSchema = saveMetadataAnySchema;

export const saveSessionInputSchema = z.object({
	characters: z.array(characterSelectSchema),
	worldState: z.array(worldStateFlagSchema),
	clocks: z.array(clockSelectSchema).default([]),
	campSessions: z.array(campSessionSelectSchema).default([]),
	campAssignments: z.array(campAssignmentSelectSchema).default([]),
	factionStandings: z.array(factionStandingSelectSchema).default([]),
	socialEncounters: z.array(socialEncounterSelectSchema).default([]),
	socialEncounterEvents: z.array(socialEncounterEventSelectSchema).default([]),
	npcRelationships: z.array(npcRelationshipSelectSchema).default([]),
	inventoryEvents: z.array(inventoryEventSelectSchema).default([]),
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
	version: z.literal(3),
	savedAt: isoTimestamp,
	characters: z.array(characterSelectSchema),
	worldState: z.array(worldStateFlagSchema),
	clocks: z.array(clockSelectSchema),
	campSessions: z.array(campSessionSelectSchema),
	campAssignments: z.array(campAssignmentSelectSchema),
	factionStandings: z.array(factionStandingSelectSchema),
});

export const loadedSessionStateV4Schema = z.object({
	version: z.literal(4),
	savedAt: isoTimestamp,
	characters: z.array(characterSelectSchema),
	worldState: z.array(worldStateFlagSchema),
	clocks: z.array(clockSelectSchema),
	campSessions: z.array(campSessionSelectSchema),
	campAssignments: z.array(campAssignmentSelectSchema),
	factionStandings: z.array(factionStandingSelectSchema),
	socialEncounters: z.array(socialEncounterSelectSchema),
	socialEncounterEvents: z.array(socialEncounterEventSelectSchema),
});

export const loadedSessionStateV5Schema = z.object({
	version: z.literal(5),
	savedAt: isoTimestamp,
	characters: z.array(characterSelectSchema),
	worldState: z.array(worldStateFlagSchema),
	clocks: z.array(clockSelectSchema),
	campSessions: z.array(campSessionSelectSchema),
	campAssignments: z.array(campAssignmentSelectSchema),
	factionStandings: z.array(factionStandingSelectSchema),
	socialEncounters: z.array(socialEncounterSelectSchema),
	socialEncounterEvents: z.array(socialEncounterEventSelectSchema),
	npcRelationships: z.array(npcRelationshipSelectSchema),
});

export const loadedSessionStateV6Schema = z.object({
	version: z.literal(CURRENT_SAVE_VERSION),
	savedAt: isoTimestamp,
	characters: z.array(characterSelectSchema),
	worldState: z.array(worldStateFlagSchema),
	clocks: z.array(clockSelectSchema),
	campSessions: z.array(campSessionSelectSchema),
	campAssignments: z.array(campAssignmentSelectSchema),
	factionStandings: z.array(factionStandingSelectSchema),
	socialEncounters: z.array(socialEncounterSelectSchema),
	socialEncounterEvents: z.array(socialEncounterEventSelectSchema),
	npcRelationships: z.array(npcRelationshipSelectSchema),
	inventoryEvents: z.array(inventoryEventSelectSchema),
});

export const loadedSessionStateSchema = z.union([
	loadedSessionStateV1Schema,
	loadedSessionStateV2Schema,
	loadedSessionStateV3Schema,
	loadedSessionStateV4Schema,
	loadedSessionStateV5Schema,
	loadedSessionStateV6Schema,
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
		version: 3,
		savedAt: snapshot.savedAt,
		characters: snapshot.characters,
		worldState: snapshot.worldState,
		clocks: snapshot.clocks,
		campSessions: snapshot.campSessions,
		campAssignments: snapshot.campAssignments,
		factionStandings: [],
	};
}

export function migrateSaveV3ToV4(
	snapshot: z.infer<typeof loadedSessionStateV3Schema>,
): z.infer<typeof loadedSessionStateV4Schema> {
	return {
		version: 4,
		savedAt: snapshot.savedAt,
		characters: snapshot.characters,
		worldState: snapshot.worldState,
		clocks: snapshot.clocks,
		campSessions: snapshot.campSessions,
		campAssignments: snapshot.campAssignments,
		factionStandings: snapshot.factionStandings,
		socialEncounters: [],
		socialEncounterEvents: [],
	};
}

export function migrateSaveV4ToV5(
	snapshot: z.infer<typeof loadedSessionStateV4Schema>,
): z.infer<typeof loadedSessionStateV5Schema> {
	return {
		version: 5,
		savedAt: snapshot.savedAt,
		characters: snapshot.characters,
		worldState: snapshot.worldState,
		clocks: snapshot.clocks,
		campSessions: snapshot.campSessions,
		campAssignments: snapshot.campAssignments,
		factionStandings: snapshot.factionStandings,
		socialEncounters: snapshot.socialEncounters,
		socialEncounterEvents: snapshot.socialEncounterEvents,
		npcRelationships: [],
	};
}

export function migrateSaveV5ToV6(
	snapshot: z.infer<typeof loadedSessionStateV5Schema>,
): z.infer<typeof loadedSessionStateV6Schema> {
	return {
		...snapshot,
		version: CURRENT_SAVE_VERSION,
		inventoryEvents: [],
	};
}

export function migrateLoadedSessionToCurrent(
	snapshot: z.infer<typeof loadedSessionStateSchema>,
): z.infer<typeof loadedSessionStateV6Schema> {
	if (snapshot.version === 1) {
		return migrateSaveV5ToV6(
			migrateSaveV4ToV5(
				migrateSaveV3ToV4(migrateSaveV2ToV3(migrateSaveV1ToV2(snapshot))),
			),
		);
	}

	if (snapshot.version === 2) {
		return migrateSaveV5ToV6(
			migrateSaveV4ToV5(migrateSaveV3ToV4(migrateSaveV2ToV3(snapshot))),
		);
	}

	if (snapshot.version === 3) {
		return migrateSaveV5ToV6(migrateSaveV4ToV5(migrateSaveV3ToV4(snapshot)));
	}

	if (snapshot.version === 4) {
		return migrateSaveV5ToV6(migrateSaveV4ToV5(snapshot));
	}

	if (snapshot.version === 5) {
		return migrateSaveV5ToV6(snapshot);
	}

	return snapshot;
}
