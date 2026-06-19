import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs, { type SqlJsStatic } from "sql.js";
import { describe, expect, it } from "vitest";
import { CharacterBuilder } from "$lib/entities/character/testing/CharacterBuilder";
import { TRAINING_FACTION_STANDINGS } from "$lib/entities/faction";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	DatabaseFileFailure,
	DatabaseFileStorage,
} from "$lib/shared/persistence";
import { PANDORHA_SQLITE_MIGRATIONS } from "$lib/shared/persistence";
import { SqliteSaveSnapshotService } from "../domain/SqliteSaveSnapshotService";
import type { LoadedSessionState } from "../model/saveLoadTypes";
import type {
	SaveSnapshotFailure,
	SaveSnapshotResult,
} from "../model/saveSnapshotTypes";

const SAVED_AT = "2026-05-15T19:50:00.000Z";
const UPDATED_AT = "2026-05-15T19:49:00.000Z";
const projectRoot = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
	"..",
);
const sqlJsWasmPath = join(
	projectRoot,
	"node_modules",
	"sql.js",
	"dist",
	"sql-wasm.wasm",
);

describe("SqliteSaveSnapshotService", () => {
	it("saves and loads a primary snapshot roundtrip", async () => {
		const storage = await createMigratedStorage();
		const service = createService(storage);

		const saved = expectSaveSuccess(
			await service.saveSnapshot(buildSnapshot()),
		);
		const loaded = expectLoadSuccess(await service.loadSnapshot());

		expect(saved).toEqual({
			saveId: "primary",
			version: 9,
			savedAt: SAVED_AT,
			characterCount: 1,
			worldStateCount: 1,
			clockCount: 1,
			campSessionCount: 1,
			campAssignmentCount: 1,
			factionStandingCount: 1,
			socialEncounterCount: 1,
			socialEncounterEventCount: 1,
			npcRelationshipCount: 1,
			inventoryEventCount: 1,
			equipmentLoadoutEventCount: 1,
			equipmentDurabilityEventCount: 1,
			characterTraitSelectionCount: 1,
		});
		expect(loaded).toEqual(buildSnapshot());
	});

	it("replaces the previous primary snapshot deterministically", async () => {
		const storage = await createMigratedStorage();
		const service = createService(storage);
		expectSaveSuccess(await service.saveSnapshot(buildSnapshot()));

		const replacement = {
			...buildSnapshot(),
			characters: [
				{
					...buildCharacter(),
					id: "session-character-2",
					name: "Lia",
				},
			],
			worldState: [
				{
					key: "plot:morden:chapter-one",
					value: "complete",
					updatedAt: UPDATED_AT,
				},
			],
		};
		expectSaveSuccess(await service.saveSnapshot(replacement));

		expect(expectLoadSuccess(await service.loadSnapshot())).toEqual(
			replacement,
		);
	});

	it("saves empty structured snapshots and rejects uninitialized databases", async () => {
		const storage = await createMigratedStorage();
		const service = createService(storage);
		const emptySnapshot = {
			...buildSnapshot(),
			characters: [],
			clocks: [],
			campSessions: [],
			campAssignments: [],
			factionStandings: [],
			socialEncounters: [],
			socialEncounterEvents: [],
			npcRelationships: [],
			inventoryEvents: [],
			equipmentLoadoutEvents: [],
			equipmentDurabilityEvents: [],
			characterTraitSelections: [],
		};

		const saved = expectSaveSuccess(await service.saveSnapshot(emptySnapshot));
		const uninitialized = expectFailure(
			await createService(new InMemoryDatabaseFileStorage()).loadSnapshot(),
		);
		const unsaved = expectFailure(
			await createService(new InMemoryDatabaseFileStorage()).saveSnapshot(
				emptySnapshot,
			),
		);

		expect(saved.characterCount).toBe(0);
		expect(saved.clockCount).toBe(0);
		expect(saved.campSessionCount).toBe(0);
		expect(saved.campAssignmentCount).toBe(0);
		expect(saved.factionStandingCount).toBe(0);
		expect(saved.socialEncounterCount).toBe(0);
		expect(saved.socialEncounterEventCount).toBe(0);
		expect(saved.npcRelationshipCount).toBe(0);
		expect(saved.inventoryEventCount).toBe(0);
		expect(saved.equipmentLoadoutEventCount).toBe(0);
		expect(saved.equipmentDurabilityEventCount).toBe(0);
		expect(expectLoadSuccess(await service.loadSnapshot())).toEqual(
			emptySnapshot,
		);
		expect(uninitialized.code).toBe("DATABASE_NOT_INITIALIZED");
		expect(unsaved.code).toBe("DATABASE_NOT_INITIALIZED");
	});

	it("returns typed failures for missing, invalid, and corrupted snapshots", async () => {
		const storage = await createMigratedStorage();
		const service = createService(storage);
		const missing = expectFailure(await service.loadSnapshot());
		const invalid = expectFailure(
			await service.saveSnapshot({
				...buildSnapshot(),
				characters: [{ ...buildCharacter(), level: 0 }],
			}),
		);
		expectSaveSuccess(await service.saveSnapshot(buildSnapshot()));
		await corruptCharacterLevel(storage);
		const corrupted = expectFailure(await service.loadSnapshot());

		expect(missing.code).toBe("SAVE_NOT_FOUND");
		expect(invalid.code).toBe("INVALID_SAVE_SNAPSHOT");
		expect(corrupted.code).toBe("CORRUPTED_SAVE_SNAPSHOT");
	});

	it("migrates a legacy v1 save to v9 with empty structured data", async () => {
		const loaded = expectLoadSuccess(
			await createService(await createLegacyV1SaveStorage()).loadSnapshot(),
		);

		expect(loaded).toEqual({
			version: 9,
			savedAt: SAVED_AT,
			characters: [buildCharacter()],
			characterTraitSelections: [],
			worldState: [
				{
					key: "location:morden:gate-open",
					value: true,
					updatedAt: UPDATED_AT,
				},
			],
			clocks: [],
			campSessions: [],
			campAssignments: [],
			factionStandings: [],
			socialEncounters: [],
			socialEncounterEvents: [],
			npcRelationships: [],
			inventoryEvents: [],
			equipmentLoadoutEvents: [],
			equipmentDurabilityEvents: [],
		});
	});

	it("migrates a legacy v2 save to v9 with empty social data", async () => {
		const loaded = expectLoadSuccess(
			await createService(await createLegacyV2SaveStorage()).loadSnapshot(),
		);

		expect(loaded).toEqual({
			version: 9,
			savedAt: SAVED_AT,
			characters: [buildCharacter()],
			characterTraitSelections: [],
			worldState: [
				{
					key: "location:morden:gate-open",
					value: true,
					updatedAt: UPDATED_AT,
				},
			],
			clocks: [buildClock()],
			campSessions: [buildCampSession()],
			campAssignments: [buildCampAssignment()],
			factionStandings: [],
			socialEncounters: [],
			socialEncounterEvents: [],
			npcRelationships: [],
			inventoryEvents: [],
			equipmentLoadoutEvents: [],
			equipmentDurabilityEvents: [],
		});
	});

	it("migrates a legacy v3 save to v9 with empty social encounter state", async () => {
		const loaded = expectLoadSuccess(
			await createService(await createLegacyV3SaveStorage()).loadSnapshot(),
		);

		expect(loaded).toEqual({
			version: 9,
			savedAt: SAVED_AT,
			characters: [buildCharacter()],
			characterTraitSelections: [],
			worldState: [
				{
					key: "location:morden:gate-open",
					value: true,
					updatedAt: UPDATED_AT,
				},
			],
			clocks: [buildClock()],
			campSessions: [buildCampSession()],
			campAssignments: [buildCampAssignment()],
			factionStandings: [buildFactionStanding()],
			socialEncounters: [],
			socialEncounterEvents: [],
			npcRelationships: [],
			inventoryEvents: [],
			equipmentLoadoutEvents: [],
			equipmentDurabilityEvents: [],
		});
	});

	it("migrates a legacy v4 save to v9 with empty NPC relationships", async () => {
		const loaded = expectLoadSuccess(
			await createService(await createLegacyV4SaveStorage()).loadSnapshot(),
		);

		expect(loaded).toEqual({
			version: 9,
			savedAt: SAVED_AT,
			characters: [buildCharacter()],
			characterTraitSelections: [],
			worldState: [
				{
					key: "location:morden:gate-open",
					value: true,
					updatedAt: UPDATED_AT,
				},
			],
			clocks: [buildClock()],
			campSessions: [buildCampSession()],
			campAssignments: [buildCampAssignment()],
			factionStandings: [buildFactionStanding()],
			socialEncounters: [buildSocialEncounter()],
			socialEncounterEvents: [buildSocialEncounterEvent()],
			npcRelationships: [],
			inventoryEvents: [],
			equipmentLoadoutEvents: [],
			equipmentDurabilityEvents: [],
		});
	});

	it("migrates a legacy v5 save to v9 with empty ledgers", async () => {
		const loaded = expectLoadSuccess(
			await createService(await createLegacyV5SaveStorage()).loadSnapshot(),
		);

		expect(loaded).toEqual({
			...buildSnapshot(),
			characterTraitSelections: [],
			inventoryEvents: [],
			equipmentLoadoutEvents: [],
			equipmentDurabilityEvents: [],
		});
	});

	it("migrates a legacy v6 save to v9 with empty later ledgers", async () => {
		const loaded = expectLoadSuccess(
			await createService(await createLegacyV6SaveStorage()).loadSnapshot(),
		);

		expect(loaded).toEqual({
			...buildSnapshot(),
			characterTraitSelections: [],
			equipmentLoadoutEvents: [],
			equipmentDurabilityEvents: [],
		});
	});

	it("migrates a legacy v7 save to v9 with empty trait selections", async () => {
		const loaded = expectLoadSuccess(
			await createService(await createLegacyV7SaveStorage()).loadSnapshot(),
		);

		expect(loaded).toEqual({
			...buildSnapshot(),
			characterTraitSelections: [],
			equipmentDurabilityEvents: [],
		});
	});

	it("migrates a legacy v8 save to v9 with empty durability events", async () => {
		const loaded = expectLoadSuccess(
			await createService(await createLegacyV8SaveStorage()).loadSnapshot(),
		);

		expect(loaded).toEqual({
			...buildSnapshot(),
			equipmentDurabilityEvents: [],
		});
	});

	it("returns typed failures for corrupted metadata and world-state rows", async () => {
		const invalidMetadataRowStorage = await createMigratedStorage();
		const invalidMetadataPayloadStorage = await createMigratedStorage();
		const invalidWorldStateStorage = await createMigratedStorage();
		expectSaveSuccess(
			await createService(invalidMetadataRowStorage).saveSnapshot(
				buildSnapshot(),
			),
		);
		expectSaveSuccess(
			await createService(invalidMetadataPayloadStorage).saveSnapshot(
				buildSnapshot(),
			),
		);
		expectSaveSuccess(
			await createService(invalidWorldStateStorage).saveSnapshot(
				buildSnapshot(),
			),
		);

		await corruptMetadataUpdatedAt(invalidMetadataRowStorage);
		await corruptMetadataVersion(invalidMetadataPayloadStorage);
		await corruptWorldStateUpdatedAt(invalidWorldStateStorage);

		const invalidMetadataRow = expectFailure(
			await createService(invalidMetadataRowStorage).loadSnapshot(),
		);
		const invalidMetadataPayload = expectFailure(
			await createService(invalidMetadataPayloadStorage).loadSnapshot(),
		);
		const invalidWorldState = expectFailure(
			await createService(invalidWorldStateStorage).loadSnapshot(),
		);

		expect(invalidMetadataRow.code).toBe("CORRUPTED_SAVE_SNAPSHOT");
		expect(invalidMetadataPayload.code).toBe("CORRUPTED_SAVE_SNAPSHOT");
		expect(invalidWorldState.code).toBe("CORRUPTED_SAVE_SNAPSHOT");
	});

	it("returns typed failures for corrupted clock, camp, faction, and social rows", async () => {
		const invalidClockStorage = await createMigratedStorage();
		const invalidCampSessionStorage = await createMigratedStorage();
		const invalidCampAssignmentStorage = await createMigratedStorage();
		const invalidFactionStandingStorage = await createMigratedStorage();
		const invalidSocialEncounterStorage = await createMigratedStorage();
		const invalidSocialEncounterEventStorage = await createMigratedStorage();
		const invalidNpcRelationshipStorage = await createMigratedStorage();
		const invalidInventoryEventStorage = await createMigratedStorage();
		const invalidEquipmentLoadoutEventStorage = await createMigratedStorage();
		const invalidCharacterTraitSelectionStorage = await createMigratedStorage();
		const invalidEquipmentDurabilityEventStorage =
			await createMigratedStorage();
		expectSaveSuccess(
			await createService(invalidClockStorage).saveSnapshot(buildSnapshot()),
		);
		expectSaveSuccess(
			await createService(invalidCampSessionStorage).saveSnapshot(
				buildSnapshot(),
			),
		);
		expectSaveSuccess(
			await createService(invalidCampAssignmentStorage).saveSnapshot(
				buildSnapshot(),
			),
		);
		expectSaveSuccess(
			await createService(invalidFactionStandingStorage).saveSnapshot(
				buildSnapshot(),
			),
		);
		expectSaveSuccess(
			await createService(invalidSocialEncounterStorage).saveSnapshot(
				buildSnapshot(),
			),
		);
		expectSaveSuccess(
			await createService(invalidSocialEncounterEventStorage).saveSnapshot(
				buildSnapshot(),
			),
		);
		expectSaveSuccess(
			await createService(invalidNpcRelationshipStorage).saveSnapshot(
				buildSnapshot(),
			),
		);
		expectSaveSuccess(
			await createService(invalidInventoryEventStorage).saveSnapshot(
				buildSnapshot(),
			),
		);
		expectSaveSuccess(
			await createService(invalidEquipmentLoadoutEventStorage).saveSnapshot(
				buildSnapshot(),
			),
		);
		expectSaveSuccess(
			await createService(invalidCharacterTraitSelectionStorage).saveSnapshot(
				buildSnapshot(),
			),
		);
		expectSaveSuccess(
			await createService(invalidEquipmentDurabilityEventStorage).saveSnapshot(
				buildSnapshot(),
			),
		);

		await corruptClockSlices(invalidClockStorage);
		await corruptCampSessionHour(invalidCampSessionStorage);
		await corruptCampAssignmentHour(invalidCampAssignmentStorage);
		await corruptFactionStandingStatus(invalidFactionStandingStorage);
		await corruptSocialEncounterStatus(invalidSocialEncounterStorage);
		await corruptSocialEncounterEventSequence(
			invalidSocialEncounterEventStorage,
		);
		await corruptNpcRelationshipStatus(invalidNpcRelationshipStorage);
		await corruptInventoryEventSequence(invalidInventoryEventStorage);
		await corruptEquipmentLoadoutEventSequence(
			invalidEquipmentLoadoutEventStorage,
		);
		await corruptCharacterTraitSelectionSequence(
			invalidCharacterTraitSelectionStorage,
		);
		await corruptEquipmentDurabilityEventSequence(
			invalidEquipmentDurabilityEventStorage,
		);

		expect(
			expectFailure(await createService(invalidClockStorage).loadSnapshot())
				.code,
		).toBe("CORRUPTED_SAVE_SNAPSHOT");
		expect(
			expectFailure(
				await createService(invalidCampSessionStorage).loadSnapshot(),
			).code,
		).toBe("CORRUPTED_SAVE_SNAPSHOT");
		expect(
			expectFailure(
				await createService(invalidCampAssignmentStorage).loadSnapshot(),
			).code,
		).toBe("CORRUPTED_SAVE_SNAPSHOT");
		expect(
			expectFailure(
				await createService(invalidFactionStandingStorage).loadSnapshot(),
			).code,
		).toBe("CORRUPTED_SAVE_SNAPSHOT");
		expect(
			expectFailure(
				await createService(invalidSocialEncounterStorage).loadSnapshot(),
			).code,
		).toBe("CORRUPTED_SAVE_SNAPSHOT");
		expect(
			expectFailure(
				await createService(invalidSocialEncounterEventStorage).loadSnapshot(),
			).code,
		).toBe("CORRUPTED_SAVE_SNAPSHOT");
		expect(
			expectFailure(
				await createService(invalidNpcRelationshipStorage).loadSnapshot(),
			).code,
		).toBe("CORRUPTED_SAVE_SNAPSHOT");
		expect(
			expectFailure(
				await createService(invalidInventoryEventStorage).loadSnapshot(),
			).code,
		).toBe("CORRUPTED_SAVE_SNAPSHOT");
		expect(
			expectFailure(
				await createService(invalidEquipmentLoadoutEventStorage).loadSnapshot(),
			).code,
		).toBe("CORRUPTED_SAVE_SNAPSHOT");
		expect(
			expectFailure(
				await createService(
					invalidCharacterTraitSelectionStorage,
				).loadSnapshot(),
			).code,
		).toBe("CORRUPTED_SAVE_SNAPSHOT");
		expect(
			expectFailure(
				await createService(
					invalidEquipmentDurabilityEventStorage,
				).loadSnapshot(),
			).code,
		).toBe("CORRUPTED_SAVE_SNAPSHOT");
	});

	it("maps storage, SQLite, and export failures to typed results", async () => {
		const readFailureStorage = new InMemoryDatabaseFileStorage();
		readFailureStorage.failNextRead({
			code: "DATABASE_FILE_READ_FAILED",
			message: "read failed",
		});
		const readFailure = expectFailure(
			await createService(readFailureStorage).loadSnapshot(),
		);
		const writeFailureStorage = await createMigratedStorage();
		writeFailureStorage.failNextWrite({
			code: "DATABASE_FILE_WRITE_FAILED",
			message: "write failed",
		});
		const writeFailure = expectFailure(
			await createService(writeFailureStorage).saveSnapshot(buildSnapshot()),
		);
		const sqliteFailure = expectFailure(
			await new SqliteSaveSnapshotService({
				storage: await createMigratedStorage(),
				createSqlite: () => Promise.reject(new Error("wasm unavailable")),
			}).loadSnapshot(),
		);
		const corruptStorage = new InMemoryDatabaseFileStorage(
			new Uint8Array([1, 2, 3]),
		);
		const corruptedDatabase = expectFailure(
			await createService(corruptStorage).loadSnapshot(),
		);
		const exportFailure = expectFailure(
			await new SqliteSaveSnapshotService({
				storage: await createMigratedStorage(),
				createSqlite: createExportFailingSqlite,
			}).saveSnapshot(buildSnapshot()),
		);

		expect(readFailure.code).toBe("DATABASE_FILE_READ_FAILED");
		expect(writeFailure.code).toBe("DATABASE_FILE_WRITE_FAILED");
		expect(sqliteFailure.code).toBe("SQLITE_WASM_INIT_FAILED");
		expect(corruptedDatabase.code).toBe("CORRUPTED_DATABASE_FILE");
		expect(exportFailure.code).toBe("SQLITE_EXPORT_FAILED");
	});

	it("maps opening, validation, and transaction failures to typed results", async () => {
		const openingFailure = expectFailure(
			await new SqliteSaveSnapshotService({
				storage: await createMigratedStorage(),
				createSqlite: createOpeningFailingSqlite,
			}).loadSnapshot(),
		);
		const validationFailure = expectFailure(
			await new SqliteSaveSnapshotService({
				storage: await createMigratedStorage(),
				createSqlite: createValidationFailingSqlite,
			}).loadSnapshot(),
		);
		const transactionFailure = expectFailure(
			await createService(await createMalformedSchemaStorage()).saveSnapshot(
				buildSnapshot(),
			),
		);

		expect(openingFailure.code).toBe("CORRUPTED_DATABASE_FILE");
		expect(validationFailure.code).toBe("CORRUPTED_DATABASE_FILE");
		expect(transactionFailure.code).toBe("SQLITE_SNAPSHOT_WRITE_FAILED");
	});

	it("maps missing required tables and malformed load queries to typed results", async () => {
		const missingTables = expectFailure(
			await createService(await createEmptySchemaStorage()).loadSnapshot(),
		);
		const malformedLoad = expectFailure(
			await new SqliteSaveSnapshotService({
				storage: await createMigratedStorage(),
				createSqlite: createQueryFailingSqlite,
			}).loadSnapshot(),
		);

		expect(missingTables.code).toBe("CORRUPTED_DATABASE_FILE");
		expect(malformedLoad.code).toBe("CORRUPTED_SAVE_SNAPSHOT");
	});
});

function buildSnapshot() {
	return {
		version: 9 as const,
		savedAt: SAVED_AT,
		characters: [buildCharacter()],
		characterTraitSelections: [buildCharacterTraitSelection()],
		worldState: [
			{
				key: "location:morden:gate-open",
				value: true,
				updatedAt: UPDATED_AT,
			},
		],
		clocks: [buildClock()],
		campSessions: [buildCampSession()],
		campAssignments: [buildCampAssignment()],
		factionStandings: [buildFactionStanding()],
		socialEncounters: [buildSocialEncounter()],
		socialEncounterEvents: [buildSocialEncounterEvent()],
		npcRelationships: [buildNpcRelationship()],
		inventoryEvents: [buildInventoryEvent()],
		equipmentLoadoutEvents: [buildEquipmentLoadoutEvent()],
		equipmentDurabilityEvents: [buildEquipmentDurabilityEvent()],
	};
}

function buildCharacterTraitSelection() {
	return {
		id: "character-trait-selection-1",
		characterId: "session-character-1",
		sequence: 1,
		traitId: "human-diligencia-erudita",
		createdAt: SAVED_AT,
	};
}

function buildCharacter() {
	return {
		...CharacterBuilder.valid().buildCreateInput(),
		id: "session-character-1",
		createdAt: SAVED_AT,
		updatedAt: SAVED_AT,
	};
}

function buildClock() {
	return {
		id: "fortify-perimeter",
		label: "Fortificar perímetro",
		currentSlices: 1,
		maxSlices: 4,
		status: "active",
		source: "camp",
		createdAt: SAVED_AT,
		updatedAt: SAVED_AT,
	};
}

function buildCampSession() {
	return {
		id: "camp-session-1",
		currentHour: 1,
		danger: 1,
		status: "resolved",
		fortifyClockId: "fortify-perimeter",
		createdAt: SAVED_AT,
		updatedAt: SAVED_AT,
	};
}

function buildCampAssignment() {
	return {
		id: "camp-assignment-1",
		sessionId: "camp-session-1",
		characterId: "session-character-1",
		activityId: "fortify-perimeter",
		hour: 1,
		createdAt: SAVED_AT,
	};
}

function buildFactionStanding() {
	return {
		...TRAINING_FACTION_STANDINGS[0],
		bloodDebt: 1,
		intriguePoints: 1,
	};
}

function buildSocialEncounter() {
	return {
		id: "social-encounter-one",
		npcId: "training-broker",
		actorId: "session-character-1",
		status: "active",
		attitude: "skeptical",
		mentalHpCurrent: 5,
		mentalHpMax: 8,
		patienceCurrent: 6,
		patienceMax: 6,
		persuasionProgress: 1,
		persuasionTarget: 3,
		createdAt: SAVED_AT,
		updatedAt: SAVED_AT,
	};
}

function buildSocialEncounterEvent() {
	return {
		id: "social-encounter-one-event-one",
		encounterId: "social-encounter-one",
		sequence: 0,
		type: "social-encounter-started",
		message: "Negociação iniciada com Corretora de Treino.",
		createdAt: SAVED_AT,
		commandId: null,
	};
}

function buildNpcRelationship() {
	return {
		npcId: "training-broker",
		attitude: "neutral",
		status: "stable",
		pressureDamage: 0,
		appliedPressureKeysJson: "[]",
		updatedAt: SAVED_AT,
	};
}

function buildInventoryEvent() {
	return {
		id: "inventory-event-1",
		characterId: "session-character-1",
		sequence: 1,
		type: "inventory-item-added",
		entryId: "inventory-entry-1",
		catalogKind: "equipment",
		catalogItemId: "dagger",
		quantity: 1,
		createdAt: SAVED_AT,
	};
}

function buildEquipmentLoadoutEvent() {
	return {
		id: "equipment-loadout-event-1",
		characterId: "session-character-1",
		sequence: 1,
		type: "equipment-loadout-slot-equipped",
		slot: "mainHand",
		inventoryEntryId: "inventory-entry-1",
		createdAt: SAVED_AT,
	};
}

function buildEquipmentDurabilityEvent() {
	return {
		id: "equipment-durability-event-1",
		characterId: "session-character-1",
		sequence: 1,
		inventoryEntryId: "inventory-entry-1",
		type: "equipment-durability-condition-set",
		condition: "damaged",
		createdAt: SAVED_AT,
	};
}

function createService(
	storage: DatabaseFileStorage,
): SqliteSaveSnapshotService {
	return new SqliteSaveSnapshotService({
		storage,
		createSqlite,
	});
}

async function createMigratedStorage(): Promise<InMemoryDatabaseFileStorage> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database();
	for (const migration of PANDORHA_SQLITE_MIGRATIONS) {
		database.run(migration.sql);
	}
	const storage = new InMemoryDatabaseFileStorage(database.export());
	database.close();
	return storage;
}

async function createLegacyV1SaveStorage(): Promise<InMemoryDatabaseFileStorage> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database();
	for (const migration of PANDORHA_SQLITE_MIGRATIONS) {
		database.run(migration.sql);
	}
	insertCharacter(database);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		["location:morden:gate-open", JSON.stringify(true), UPDATED_AT],
	);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		[
			"system:save:primary:metadata",
			JSON.stringify({ version: 1, savedAt: SAVED_AT }),
			SAVED_AT,
		],
	);
	const storage = new InMemoryDatabaseFileStorage(database.export());
	database.close();
	return storage;
}

async function createLegacyV2SaveStorage(): Promise<InMemoryDatabaseFileStorage> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database();
	for (const migration of PANDORHA_SQLITE_MIGRATIONS) {
		database.run(migration.sql);
	}
	insertCharacter(database);
	insertClock(database);
	insertCampSession(database);
	insertCampAssignment(database);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		["location:morden:gate-open", JSON.stringify(true), UPDATED_AT],
	);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		[
			"system:save:primary:metadata",
			JSON.stringify({ version: 2, savedAt: SAVED_AT }),
			SAVED_AT,
		],
	);
	const storage = new InMemoryDatabaseFileStorage(database.export());
	database.close();
	return storage;
}

async function createLegacyV3SaveStorage(): Promise<InMemoryDatabaseFileStorage> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database();
	for (const migration of PANDORHA_SQLITE_MIGRATIONS) {
		database.run(migration.sql);
	}
	insertCharacter(database);
	insertClock(database);
	insertCampSession(database);
	insertCampAssignment(database);
	insertFactionStanding(database);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		["location:morden:gate-open", JSON.stringify(true), UPDATED_AT],
	);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		[
			"system:save:primary:metadata",
			JSON.stringify({ version: 3, savedAt: SAVED_AT }),
			SAVED_AT,
		],
	);
	const storage = new InMemoryDatabaseFileStorage(database.export());
	database.close();
	return storage;
}

async function createLegacyV4SaveStorage(): Promise<InMemoryDatabaseFileStorage> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database();
	for (const migration of PANDORHA_SQLITE_MIGRATIONS) {
		database.run(migration.sql);
	}
	insertCharacter(database);
	insertClock(database);
	insertCampSession(database);
	insertCampAssignment(database);
	insertFactionStanding(database);
	insertSocialEncounter(database);
	insertSocialEncounterEvent(database);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		["location:morden:gate-open", JSON.stringify(true), UPDATED_AT],
	);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		[
			"system:save:primary:metadata",
			JSON.stringify({ version: 4, savedAt: SAVED_AT }),
			SAVED_AT,
		],
	);
	const storage = new InMemoryDatabaseFileStorage(database.export());
	database.close();
	return storage;
}

async function createLegacyV5SaveStorage(): Promise<InMemoryDatabaseFileStorage> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database();
	for (const migration of PANDORHA_SQLITE_MIGRATIONS) {
		database.run(migration.sql);
	}
	insertCharacter(database);
	insertClock(database);
	insertCampSession(database);
	insertCampAssignment(database);
	insertFactionStanding(database);
	insertSocialEncounter(database);
	insertSocialEncounterEvent(database);
	insertNpcRelationship(database);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		["location:morden:gate-open", JSON.stringify(true), UPDATED_AT],
	);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		[
			"system:save:primary:metadata",
			JSON.stringify({ version: 5, savedAt: SAVED_AT }),
			SAVED_AT,
		],
	);
	const storage = new InMemoryDatabaseFileStorage(database.export());
	database.close();
	return storage;
}

async function createLegacyV6SaveStorage(): Promise<InMemoryDatabaseFileStorage> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database();
	for (const migration of PANDORHA_SQLITE_MIGRATIONS) {
		database.run(migration.sql);
	}
	insertCharacter(database);
	insertClock(database);
	insertCampSession(database);
	insertCampAssignment(database);
	insertFactionStanding(database);
	insertSocialEncounter(database);
	insertSocialEncounterEvent(database);
	insertNpcRelationship(database);
	insertInventoryEvent(database);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		["location:morden:gate-open", JSON.stringify(true), UPDATED_AT],
	);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		[
			"system:save:primary:metadata",
			JSON.stringify({ version: 6, savedAt: SAVED_AT }),
			SAVED_AT,
		],
	);
	const storage = new InMemoryDatabaseFileStorage(database.export());
	database.close();
	return storage;
}

async function createLegacyV7SaveStorage(): Promise<InMemoryDatabaseFileStorage> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database();
	for (const migration of PANDORHA_SQLITE_MIGRATIONS) {
		database.run(migration.sql);
	}
	insertCharacter(database);
	insertClock(database);
	insertCampSession(database);
	insertCampAssignment(database);
	insertFactionStanding(database);
	insertSocialEncounter(database);
	insertSocialEncounterEvent(database);
	insertNpcRelationship(database);
	insertInventoryEvent(database);
	insertEquipmentLoadoutEvent(database);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		["location:morden:gate-open", JSON.stringify(true), UPDATED_AT],
	);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		[
			"system:save:primary:metadata",
			JSON.stringify({ version: 7, savedAt: SAVED_AT }),
			SAVED_AT,
		],
	);
	const storage = new InMemoryDatabaseFileStorage(database.export());
	database.close();
	return storage;
}

async function createLegacyV8SaveStorage(): Promise<InMemoryDatabaseFileStorage> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database();
	for (const migration of PANDORHA_SQLITE_MIGRATIONS) {
		database.run(migration.sql);
	}
	insertCharacter(database);
	insertClock(database);
	insertCampSession(database);
	insertCampAssignment(database);
	insertFactionStanding(database);
	insertSocialEncounter(database);
	insertSocialEncounterEvent(database);
	insertNpcRelationship(database);
	insertInventoryEvent(database);
	insertEquipmentLoadoutEvent(database);
	insertCharacterTraitSelection(database);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		["location:morden:gate-open", JSON.stringify(true), UPDATED_AT],
	);
	database.run(
		"INSERT INTO world_state_entries (key, value_json, updated_at) VALUES (?, ?, ?);",
		[
			"system:save:primary:metadata",
			JSON.stringify({ version: 8, savedAt: SAVED_AT }),
			SAVED_AT,
		],
	);
	const storage = new InMemoryDatabaseFileStorage(database.export());
	database.close();
	return storage;
}

function insertCharacter(database: SqlJsStatic["Database"]["prototype"]): void {
	const character = buildCharacter();
	database.run(
		`INSERT INTO characters (
			id, name, concept, ancestry_id, class_id, background_id, level,
			physical, mental, social, conflict, interaction, resistance,
			created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
		[
			character.id,
			character.name,
			character.concept,
			character.ancestryId,
			character.classId,
			character.backgroundId,
			character.level,
			character.physical,
			character.mental,
			character.social,
			character.conflict,
			character.interaction,
			character.resistance,
			character.createdAt,
			character.updatedAt,
		],
	);
}

function insertCharacterTraitSelection(
	database: SqlJsStatic["Database"]["prototype"],
): void {
	const selection = buildCharacterTraitSelection();
	database.run(
		`INSERT INTO character_trait_selections (
			id, character_id, sequence, trait_id, created_at
		) VALUES (?, ?, ?, ?, ?);`,
		[
			selection.id,
			selection.characterId,
			selection.sequence,
			selection.traitId,
			selection.createdAt,
		],
	);
}

function insertClock(database: SqlJsStatic["Database"]["prototype"]): void {
	const clock = buildClock();
	database.run(
		`INSERT INTO clocks (
			id, label, current_slices, max_slices, status, source, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
		[
			clock.id,
			clock.label,
			clock.currentSlices,
			clock.maxSlices,
			clock.status,
			clock.source,
			clock.createdAt,
			clock.updatedAt,
		],
	);
}

function insertCampSession(
	database: SqlJsStatic["Database"]["prototype"],
): void {
	const session = buildCampSession();
	database.run(
		`INSERT INTO camp_sessions (
			id, current_hour, danger, status, fortify_clock_id, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?);`,
		[
			session.id,
			session.currentHour,
			session.danger,
			session.status,
			session.fortifyClockId,
			session.createdAt,
			session.updatedAt,
		],
	);
}

function insertCampAssignment(
	database: SqlJsStatic["Database"]["prototype"],
): void {
	const assignment = buildCampAssignment();
	database.run(
		`INSERT INTO camp_assignments (
			id, session_id, character_id, activity_id, hour, created_at
		) VALUES (?, ?, ?, ?, ?, ?);`,
		[
			assignment.id,
			assignment.sessionId,
			assignment.characterId,
			assignment.activityId,
			assignment.hour,
			assignment.createdAt,
		],
	);
}

function insertFactionStanding(
	database: SqlJsStatic["Database"]["prototype"],
): void {
	const standing = buildFactionStanding();
	database.run(
		`INSERT INTO faction_standings (
			faction_id, fame_level, fame_xp, infamy_level, blood_debt,
			favor_points, intrigue_points, status
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
		[
			standing.factionId,
			standing.fameLevel,
			standing.fameXp,
			standing.infamyLevel,
			standing.bloodDebt,
			standing.favorPoints,
			standing.intriguePoints,
			standing.status,
		],
	);
}

function insertSocialEncounter(
	database: SqlJsStatic["Database"]["prototype"],
): void {
	const encounter = buildSocialEncounter();
	database.run(
		`INSERT INTO social_encounters (
			id, npc_id, actor_id, status, attitude, mental_hp_current, mental_hp_max,
			patience_current, patience_max, persuasion_progress, persuasion_target,
			created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
		[
			encounter.id,
			encounter.npcId,
			encounter.actorId,
			encounter.status,
			encounter.attitude,
			encounter.mentalHpCurrent,
			encounter.mentalHpMax,
			encounter.patienceCurrent,
			encounter.patienceMax,
			encounter.persuasionProgress,
			encounter.persuasionTarget,
			encounter.createdAt,
			encounter.updatedAt,
		],
	);
}

function insertSocialEncounterEvent(
	database: SqlJsStatic["Database"]["prototype"],
): void {
	const event = buildSocialEncounterEvent();
	database.run(
		`INSERT INTO social_encounter_events (
			id, encounter_id, sequence, type, message, created_at, command_id
		) VALUES (?, ?, ?, ?, ?, ?, ?);`,
		[
			event.id,
			event.encounterId,
			event.sequence,
			event.type,
			event.message,
			event.createdAt,
			event.commandId,
		],
	);
}

function insertNpcRelationship(
	database: SqlJsStatic["Database"]["prototype"],
): void {
	const relationship = buildNpcRelationship();
	database.run(
		`INSERT INTO npc_relationships (
			npc_id, attitude, status, pressure_damage, applied_pressure_keys_json, updated_at
		) VALUES (?, ?, ?, ?, ?, ?);`,
		[
			relationship.npcId,
			relationship.attitude,
			relationship.status,
			relationship.pressureDamage,
			relationship.appliedPressureKeysJson,
			relationship.updatedAt,
		],
	);
}

function insertInventoryEvent(
	database: SqlJsStatic["Database"]["prototype"],
): void {
	const event = buildInventoryEvent();
	database.run(
		`INSERT INTO inventory_events (
			id, character_id, sequence, type, entry_id, catalog_kind, catalog_item_id,
			quantity, created_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
		[
			event.id,
			event.characterId,
			event.sequence,
			event.type,
			event.entryId,
			event.catalogKind,
			event.catalogItemId,
			event.quantity,
			event.createdAt,
		],
	);
}

function insertEquipmentLoadoutEvent(
	database: SqlJsStatic["Database"]["prototype"],
): void {
	const event = buildEquipmentLoadoutEvent();
	database.run(
		`INSERT INTO equipment_loadout_events (
			id, character_id, sequence, type, slot, inventory_entry_id, created_at
		) VALUES (?, ?, ?, ?, ?, ?, ?);`,
		[
			event.id,
			event.characterId,
			event.sequence,
			event.type,
			event.slot,
			event.inventoryEntryId,
			event.createdAt,
		],
	);
}

async function corruptCharacterLevel(
	storage: InMemoryDatabaseFileStorage,
): Promise<void> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database(storage.fileBytes);
	database.run("UPDATE characters SET level = 0;");
	storage.fileBytes = database.export();
	database.close();
}

async function corruptMetadataUpdatedAt(
	storage: InMemoryDatabaseFileStorage,
): Promise<void> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database(storage.fileBytes);
	database.run(
		"UPDATE world_state_entries SET updated_at = 'hoje' WHERE key = 'system:save:primary:metadata';",
	);
	storage.fileBytes = database.export();
	database.close();
}

async function corruptMetadataVersion(
	storage: InMemoryDatabaseFileStorage,
): Promise<void> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database(storage.fileBytes);
	database.run(
		'UPDATE world_state_entries SET value_json = \'{"version":10,"savedAt":"2026-05-15T19:50:00.000Z"}\' WHERE key = \'system:save:primary:metadata\';',
	);
	storage.fileBytes = database.export();
	database.close();
}

async function corruptWorldStateUpdatedAt(
	storage: InMemoryDatabaseFileStorage,
): Promise<void> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database(storage.fileBytes);
	database.run(
		"UPDATE world_state_entries SET updated_at = 'hoje' WHERE key = 'location:morden:gate-open';",
	);
	storage.fileBytes = database.export();
	database.close();
}

async function corruptClockSlices(
	storage: InMemoryDatabaseFileStorage,
): Promise<void> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database(storage.fileBytes);
	database.run(
		"UPDATE clocks SET current_slices = 5 WHERE id = 'fortify-perimeter';",
	);
	storage.fileBytes = database.export();
	database.close();
}

async function corruptCampSessionHour(
	storage: InMemoryDatabaseFileStorage,
): Promise<void> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database(storage.fileBytes);
	database.run("UPDATE camp_sessions SET current_hour = 0;");
	storage.fileBytes = database.export();
	database.close();
}

async function corruptCampAssignmentHour(
	storage: InMemoryDatabaseFileStorage,
): Promise<void> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database(storage.fileBytes);
	database.run("UPDATE camp_assignments SET hour = 0;");
	storage.fileBytes = database.export();
	database.close();
}

async function corruptFactionStandingStatus(
	storage: InMemoryDatabaseFileStorage,
): Promise<void> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database(storage.fileBytes);
	database.run("UPDATE faction_standings SET status = 'unknown';");
	storage.fileBytes = database.export();
	database.close();
}

async function corruptSocialEncounterStatus(
	storage: InMemoryDatabaseFileStorage,
): Promise<void> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database(storage.fileBytes);
	database.run("UPDATE social_encounters SET status = 'unknown';");
	storage.fileBytes = database.export();
	database.close();
}

async function corruptSocialEncounterEventSequence(
	storage: InMemoryDatabaseFileStorage,
): Promise<void> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database(storage.fileBytes);
	database.run("UPDATE social_encounter_events SET sequence = -1;");
	storage.fileBytes = database.export();
	database.close();
}

async function corruptNpcRelationshipStatus(
	storage: InMemoryDatabaseFileStorage,
): Promise<void> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database(storage.fileBytes);
	database.run("UPDATE npc_relationships SET status = 'unknown';");
	storage.fileBytes = database.export();
	database.close();
}

async function corruptInventoryEventSequence(
	storage: InMemoryDatabaseFileStorage,
): Promise<void> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database(storage.fileBytes);
	database.run("UPDATE inventory_events SET sequence = 0;");
	storage.fileBytes = database.export();
	database.close();
}

async function corruptEquipmentLoadoutEventSequence(
	storage: InMemoryDatabaseFileStorage,
): Promise<void> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database(storage.fileBytes);
	database.run("UPDATE equipment_loadout_events SET sequence = 0;");
	storage.fileBytes = database.export();
	database.close();
}

async function corruptCharacterTraitSelectionSequence(
	storage: InMemoryDatabaseFileStorage,
): Promise<void> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database(storage.fileBytes);
	database.run("UPDATE character_trait_selections SET sequence = 0;");
	storage.fileBytes = database.export();
	database.close();
}

async function corruptEquipmentDurabilityEventSequence(
	storage: InMemoryDatabaseFileStorage,
): Promise<void> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database(storage.fileBytes);
	database.run("UPDATE equipment_durability_events SET sequence = 0;");
	storage.fileBytes = database.export();
	database.close();
}

async function createMalformedSchemaStorage(): Promise<InMemoryDatabaseFileStorage> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database();
	database.run("CREATE TABLE characters (id text PRIMARY KEY NOT NULL);");
	database.run(
		"CREATE TABLE world_state_entries (key text PRIMARY KEY NOT NULL, value_json text NOT NULL, updated_at text NOT NULL);",
	);
	database.run("CREATE TABLE clocks (id text PRIMARY KEY NOT NULL);");
	database.run("CREATE TABLE camp_sessions (id text PRIMARY KEY NOT NULL);");
	database.run("CREATE TABLE camp_assignments (id text PRIMARY KEY NOT NULL);");
	database.run(
		"CREATE TABLE faction_standings (faction_id text PRIMARY KEY NOT NULL);",
	);
	database.run(
		"CREATE TABLE social_encounters (id text PRIMARY KEY NOT NULL);",
	);
	database.run(
		"CREATE TABLE social_encounter_events (id text PRIMARY KEY NOT NULL);",
	);
	database.run(
		"CREATE TABLE npc_relationships (npc_id text PRIMARY KEY NOT NULL);",
	);
	database.run("CREATE TABLE inventory_events (id text PRIMARY KEY NOT NULL);");
	database.run(
		"CREATE TABLE equipment_loadout_events (id text PRIMARY KEY NOT NULL);",
	);
	database.run(
		"CREATE TABLE equipment_durability_events (id text PRIMARY KEY NOT NULL);",
	);
	database.run(
		"CREATE TABLE character_trait_selections (id text PRIMARY KEY NOT NULL);",
	);
	const storage = new InMemoryDatabaseFileStorage(database.export());
	database.close();
	return storage;
}

async function createEmptySchemaStorage(): Promise<InMemoryDatabaseFileStorage> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database();
	const storage = new InMemoryDatabaseFileStorage(database.export());
	database.close();
	return storage;
}

async function createSqlite(): Promise<SqlJsStatic> {
	return initSqlJs({
		locateFile: () => sqlJsWasmPath,
	});
}

async function createExportFailingSqlite(): Promise<SqlJsStatic> {
	const sqlite = await createSqlite();
	return {
		...sqlite,
		Database: class extends sqlite.Database {
			public override export(): Uint8Array {
				throw "export failed";
			}
		},
	} as SqlJsStatic;
}

async function createOpeningFailingSqlite(): Promise<SqlJsStatic> {
	return {
		Database: class {
			public constructor() {
				throw "open failed";
			}
		} as unknown as SqlJsStatic["Database"],
		Statement: class {} as SqlJsStatic["Statement"],
	} as SqlJsStatic;
}

async function createValidationFailingSqlite(): Promise<SqlJsStatic> {
	return {
		Database: class {
			public exec(): [] {
				throw "validation failed";
			}

			public close(): void {}
		} as unknown as SqlJsStatic["Database"],
		Statement: class {} as SqlJsStatic["Statement"],
	} as SqlJsStatic;
}

async function createQueryFailingSqlite(): Promise<SqlJsStatic> {
	const sqlite = await createSqlite();
	return {
		...sqlite,
		Database: class extends sqlite.Database {
			public override prepare(): never {
				throw "query failed";
			}
		},
	} as SqlJsStatic;
}

function expectSaveSuccess(
	result: Result<SaveSnapshotResult, SaveSnapshotFailure>,
): SaveSnapshotResult {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectLoadSuccess(
	result: Result<LoadedSessionState, SaveSnapshotFailure>,
): LoadedSessionState {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectFailure<Success>(
	result: Result<Success, SaveSnapshotFailure>,
): SaveSnapshotFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class InMemoryDatabaseFileStorage implements DatabaseFileStorage {
	public writeCount = 0;
	private nextReadFailure: DatabaseFileFailure | null = null;
	private nextWriteFailure: DatabaseFileFailure | null = null;

	public constructor(public fileBytes: Uint8Array | null = null) {}

	public async readDatabaseFile(): Promise<
		Result<Uint8Array | null, DatabaseFileFailure>
	> {
		if (this.nextReadFailure) {
			const failure = this.nextReadFailure;
			this.nextReadFailure = null;
			return fail(failure);
		}

		return ok(this.fileBytes);
	}

	public async writeDatabaseFile(
		bytes: Uint8Array,
	): Promise<Result<void, DatabaseFileFailure>> {
		if (this.nextWriteFailure) {
			const failure = this.nextWriteFailure;
			this.nextWriteFailure = null;
			return fail(failure);
		}

		this.writeCount += 1;
		this.fileBytes = bytes;
		return ok(undefined);
	}

	public failNextRead(failure: DatabaseFileFailure): void {
		this.nextReadFailure = failure;
	}

	public failNextWrite(failure: DatabaseFileFailure): void {
		this.nextWriteFailure = failure;
	}
}
