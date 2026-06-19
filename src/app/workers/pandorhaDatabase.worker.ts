import initSqlJs from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { SqliteSaveSnapshotService } from "$lib/features/save-load/domain/SqliteSaveSnapshotService";
import { ok } from "$lib/shared/lib/result";
import {
	BrowserOpfsDatabaseStorage,
	handleDatabaseWorkerRequest,
	SqliteOpfsBootstrapService,
} from "$lib/shared/persistence";

const storage = new BrowserOpfsDatabaseStorage();
const createSqlite = () =>
	initSqlJs({
		locateFile: () => sqlWasmUrl,
	});
const bootstrapService = new SqliteOpfsBootstrapService({
	storage,
	createSqlite,
});
const snapshotService = new SqliteSaveSnapshotService({
	storage,
	createSqlite,
});
const snapshotWorkerPort = {
	saveSnapshot: async (input: unknown) => {
		const saved = await snapshotService.saveSnapshot(input);
		if (!saved.success) {
			return saved;
		}

		return ok({
			saveId: saved.data.saveId,
			version: saved.data.version,
			savedAt: saved.data.savedAt,
			characterCount: saved.data.characterCount,
			characterTraitSelectionCount: saved.data.characterTraitSelectionCount,
			worldStateCount: saved.data.worldStateCount,
			clockCount: saved.data.clockCount,
			campSessionCount: saved.data.campSessionCount,
			campAssignmentCount: saved.data.campAssignmentCount,
			factionStandingCount: saved.data.factionStandingCount,
			socialEncounterCount: saved.data.socialEncounterCount,
			socialEncounterEventCount: saved.data.socialEncounterEventCount,
			npcRelationshipCount: saved.data.npcRelationshipCount,
			inventoryEventCount: saved.data.inventoryEventCount,
			equipmentLoadoutEventCount: saved.data.equipmentLoadoutEventCount,
			equipmentDurabilityEventCount: saved.data.equipmentDurabilityEventCount,
		});
	},
	loadSnapshot: async () => {
		const loaded = await snapshotService.loadSnapshot();
		if (!loaded.success) {
			return loaded;
		}

		return ok({
			version: loaded.data.version,
			savedAt: loaded.data.savedAt,
			characters: loaded.data.characters.map((character) => ({
				...character,
			})),
			characterTraitSelections: loaded.data.characterTraitSelections.map(
				(selection) => ({
					...selection,
				}),
			),
			worldState: loaded.data.worldState.map((flag) => ({
				key: flag.key,
				value: flag.value,
				updatedAt: flag.updatedAt,
			})),
			clocks: loaded.data.clocks.map((clock) => ({
				...clock,
			})),
			campSessions: loaded.data.campSessions.map((session) => ({
				...session,
			})),
			campAssignments: loaded.data.campAssignments.map((assignment) => ({
				...assignment,
			})),
			factionStandings: loaded.data.factionStandings.map((standing) => ({
				...standing,
			})),
			socialEncounters: loaded.data.socialEncounters.map((encounter) => ({
				...encounter,
			})),
			socialEncounterEvents: loaded.data.socialEncounterEvents.map((event) => ({
				...event,
			})),
			npcRelationships: loaded.data.npcRelationships.map((relationship) => ({
				...relationship,
			})),
			inventoryEvents: loaded.data.inventoryEvents.map((inventoryEvent) => ({
				...inventoryEvent,
			})),
			equipmentLoadoutEvents: loaded.data.equipmentLoadoutEvents.map(
				(loadoutEvent) => ({
					...loadoutEvent,
				}),
			),
			equipmentDurabilityEvents: loaded.data.equipmentDurabilityEvents.map(
				(durabilityEvent) => ({
					...durabilityEvent,
				}),
			),
		});
	},
};

self.onmessage = (event: MessageEvent<unknown>): void => {
	void handleDatabaseWorkerRequest(event.data, {
		bootstrapService,
		snapshotService: snapshotWorkerPort,
	}).then((response) => {
		self.postMessage(response);
	});
};
