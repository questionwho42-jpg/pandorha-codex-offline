import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs, { type SqlJsStatic } from "sql.js";
import { describe, expect, it } from "vitest";
import type { CharacterRecord } from "$lib/entities/character/model/characterSchema";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { SqliteOpfsBootstrapService } from "../domain/SqliteOpfsBootstrapService";
import { PANDORHA_SQLITE_MIGRATIONS } from "../model/sqliteMigrations";
import type {
	DatabaseFileFailure,
	DatabaseFileStorage,
	SqliteBootstrapFailure,
	SqliteBootstrapResult,
	SqliteMigration,
} from "../model/sqliteOpfsTypes";
import { handleDatabaseWorkerRequest } from "../worker/databaseWorkerHandler";

const REQUESTED_AT = "2026-05-14T11:30:00.000Z";
const MESSAGE_ID = "d51b73d5-2d05-4fec-a18c-7cd685cfed00";
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

describe("SqliteOpfsBootstrapService", () => {
	it("creates a new SQLite database and applies all migrations", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const service = createService(storage);

		const result = await service.initializeDatabase({
			requestedAt: REQUESTED_AT,
		});
		const initialized = expectBootstrapSuccess(result);

		expect(initialized).toMatchObject({
			initialized: true,
			loadedExistingDatabase: false,
			appliedMigrationIds: [
				"0000_smiling_banshee",
				"0001_crazy_wallop",
				"0002_remarkable_beast",
				"0003_tricky_lila_cheney",
				"0004_sturdy_omega_sentinel",
				"0005_brainy_plazm",
				"0006_noisy_ultragirl",
				"0007_material_silver_surfer",
				"0008_clear_magma",
				"0009_special_sentinels",
				"0010_windy_wither",
				"0011_petite_thor_girl",
				"0012_reflective_sasquatch",
				"0013_lush_mathemanic",
				"0014_slippery_proemial_gods",
				"0015_gray_texas_twister",
				"0016_spotty_shiver_man",
				"0017_dark_richard_fisk",
				"0018_condemned_menace",
				"0019_tan_roughhouse",
				"0020_abnormal_the_spike",
				"0021_status_effects_duration",
				"0022_status_effects_missing_columns",
				"0023_add_crafted_item_durability_state",
				"0024_add_dialogue_state_social_combat_fields",
				"0025_add_character_tension_meter",
				"0026_add_tactical_combat_loop",
				"0027_melted_norrin_radd",
				"0028_add_foreign_key_indexes",
				"0025_tan_greymalkin",
				"0026_colossal_violations",
				"0027_absurd_blink",
				"0028_nasty_beast",
			],
			tableNames: [
				"_pandorha_migrations",
				"active_sessions",
				"ancestries",
				"ancestry_trait_links",
				"ancestry_traits",
				"backgrounds",
				"bastion_modules",
				"bastions",
				"blood_debts",
				"campaign_camp_sessions",
				"campaign_cohesion",
				"campaign_dialogue_states",
				"campaign_events_history",
				"campaign_investigations",
				"campaign_quests",
				"campaign_recess",
				"campaign_regional_domains",
				"campaign_rumors",
				"campaign_siege_events",
				"campaign_social_ledger",
				"character_classes",
				"character_crafted_items",
				"character_reputation",
				"character_status_effects",
				"characters",
				"combat_encounters",
				"combat_monsters",
				"crafting_recipes",
				"downtime_action_logs",
				"dungeon_delves",
				"dungeon_rooms",
				"espionage_cells",
				"faction_patronages",
				"factions",
				"lore_encounters",
				"mercenary_companies",
				"mercenary_squads",
				"progress_clocks",
				"quest_objectives",
				"registered_signatures",
				"spells",
				"summon_companions",
				"traps",
				"world_state_entries",
			],
		});
		expect(storage.writeCount).toBe(1);
		expect(storage.fileBytes?.byteLength).toBeGreaterThan(0);
	});

	it("is idempotent when the database is already migrated", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const service = createService(storage);
		expectBootstrapSuccess(
			await service.initializeDatabase({ requestedAt: REQUESTED_AT }),
		);
		const secondService = createService(storage);

		const initialized = expectBootstrapSuccess(
			await secondService.initializeDatabase({ requestedAt: REQUESTED_AT }),
		);

		expect(initialized.loadedExistingDatabase).toBe(true);
		expect(initialized.appliedMigrationIds).toEqual([]);
		expect(storage.writeCount).toBe(1);
	});

	it("applies only pending migrations to an existing database", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const [firstMigration] = PANDORHA_SQLITE_MIGRATIONS;
		if (!firstMigration) {
			expect.fail("Expected the first migration to exist.");
		}
		const service = createService(storage, [firstMigration]);
		expectBootstrapSuccess(
			await service.initializeDatabase({ requestedAt: REQUESTED_AT }),
		);
		const upgradedService = createService(storage);

		const initialized = expectBootstrapSuccess(
			await upgradedService.initializeDatabase({ requestedAt: REQUESTED_AT }),
		);

		expect(initialized.loadedExistingDatabase).toBe(true);
		expect(initialized.appliedMigrationIds).toEqual([
			"0001_crazy_wallop",
			"0002_remarkable_beast",
			"0003_tricky_lila_cheney",
			"0004_sturdy_omega_sentinel",
			"0005_brainy_plazm",
			"0006_noisy_ultragirl",
			"0007_material_silver_surfer",
			"0008_clear_magma",
			"0009_special_sentinels",
			"0010_windy_wither",
			"0011_petite_thor_girl",
			"0012_reflective_sasquatch",
			"0013_lush_mathemanic",
			"0014_slippery_proemial_gods",
			"0015_gray_texas_twister",
			"0016_spotty_shiver_man",
			"0017_dark_richard_fisk",
			"0018_condemned_menace",
			"0019_tan_roughhouse",
			"0020_abnormal_the_spike",
			"0021_status_effects_duration",
			"0022_status_effects_missing_columns",
			"0023_add_crafted_item_durability_state",
			"0024_add_dialogue_state_social_combat_fields",
			"0025_add_character_tension_meter",
			"0026_add_tactical_combat_loop",
			"0027_melted_norrin_radd",
			"0028_add_foreign_key_indexes",
			"0025_tan_greymalkin",
			"0026_colossal_violations",
			"0027_absurd_blink",
			"0028_nasty_beast",
		]);
		expect(initialized.tableNames).toContain("world_state_entries");
	});

	it("returns typed failures for invalid input and storage failures", async () => {
		const invalidInputFailure = expectBootstrapFailure(
			await createService(new InMemoryDatabaseFileStorage()).initializeDatabase(
				{
					requestedAt: "hoje",
				},
			),
		);
		const readFailureStorage = new InMemoryDatabaseFileStorage();
		readFailureStorage.failNextRead({
			code: "DATABASE_FILE_READ_FAILED",
			message: "Injected read failure.",
		});
		const readFailure = expectBootstrapFailure(
			await createService(readFailureStorage).initializeDatabase({
				requestedAt: REQUESTED_AT,
			}),
		);
		const writeFailureStorage = new InMemoryDatabaseFileStorage();
		writeFailureStorage.failNextWrite({
			code: "DATABASE_FILE_WRITE_FAILED",
			message: "Injected write failure.",
		});
		const writeFailure = expectBootstrapFailure(
			await createService(writeFailureStorage).initializeDatabase({
				requestedAt: REQUESTED_AT,
			}),
		);

		expect(invalidInputFailure.code).toBe("INVALID_SQLITE_BOOTSTRAP_INPUT");
		expect(readFailure.code).toBe("DATABASE_FILE_READ_FAILED");
		expect(writeFailure.code).toBe("DATABASE_FILE_WRITE_FAILED");
	});

	it("returns typed failures for SQLite init, corrupted file, and migration errors", async () => {
		const sqliteFailure = expectBootstrapFailure(
			await new SqliteOpfsBootstrapService({
				storage: new InMemoryDatabaseFileStorage(),
				createSqlite: () => Promise.reject("wasm unavailable"),
			}).initializeDatabase({ requestedAt: REQUESTED_AT }),
		);
		const corruptStorage = new InMemoryDatabaseFileStorage(
			new Uint8Array([1, 2, 3]),
		);
		const corruptedFile = expectBootstrapFailure(
			await createService(corruptStorage).initializeDatabase({
				requestedAt: REQUESTED_AT,
			}),
		);
		const migrationFailure = expectBootstrapFailure(
			await createService(new InMemoryDatabaseFileStorage(), [
				{ id: "bad-migration", sql: "CREATE TABLE broken (" },
			]).initializeDatabase({ requestedAt: REQUESTED_AT }),
		);

		expect(sqliteFailure.code).toBe("SQLITE_WASM_INIT_FAILED");
		expect(corruptedFile.code).toBe("CORRUPTED_DATABASE_FILE");
		expect(migrationFailure.code).toBe("SQLITE_MIGRATION_FAILED");
	});

	it("returns a typed failure when SQLite cannot open the database", async () => {
		const failure = expectBootstrapFailure(
			await new SqliteOpfsBootstrapService({
				storage: new InMemoryDatabaseFileStorage(new Uint8Array([1])),
				createSqlite: createOpeningFailingSqlite,
			}).initializeDatabase({ requestedAt: REQUESTED_AT }),
		);

		expect(failure.code).toBe("CORRUPTED_DATABASE_FILE");
	});

	it("returns a typed failure when SQLite export fails", async () => {
		const failure = expectBootstrapFailure(
			await new SqliteOpfsBootstrapService({
				storage: new InMemoryDatabaseFileStorage(),
				createSqlite: createExportFailingSqlite,
				migrations: [],
				bindDrizzle: () => undefined,
			}).initializeDatabase({ requestedAt: REQUESTED_AT }),
		);

		expect(failure.code).toBe("SQLITE_EXPORT_FAILED");
	});

	it("uses default migrations and supports an empty table-name result", async () => {
		const defaultMigrationStorage = new InMemoryDatabaseFileStorage();
		const defaultMigrationResult = expectBootstrapSuccess(
			await new SqliteOpfsBootstrapService({
				storage: defaultMigrationStorage,
				createSqlite,
			}).initializeDatabase({ requestedAt: REQUESTED_AT }),
		);
		const emptyTablesResult = expectBootstrapSuccess(
			await new SqliteOpfsBootstrapService({
				storage: new InMemoryDatabaseFileStorage(),
				createSqlite: createEmptyTablesSqlite,
				migrations: [],
				bindDrizzle: () => undefined,
			}).initializeDatabase({ requestedAt: REQUESTED_AT }),
		);

		expect(defaultMigrationResult.appliedMigrationIds).toEqual([
			"0000_smiling_banshee",
			"0001_crazy_wallop",
			"0002_remarkable_beast",
			"0003_tricky_lila_cheney",
			"0004_sturdy_omega_sentinel",
			"0005_brainy_plazm",
			"0006_noisy_ultragirl",
			"0007_material_silver_surfer",
			"0008_clear_magma",
			"0009_special_sentinels",
			"0010_windy_wither",
			"0011_petite_thor_girl",
			"0012_reflective_sasquatch",
			"0013_lush_mathemanic",
			"0014_slippery_proemial_gods",
			"0015_gray_texas_twister",
			"0016_spotty_shiver_man",
			"0017_dark_richard_fisk",
			"0018_condemned_menace",
			"0019_tan_roughhouse",
			"0020_abnormal_the_spike",
			"0021_status_effects_duration",
			"0022_status_effects_missing_columns",
			"0023_add_crafted_item_durability_state",
			"0024_add_dialogue_state_social_combat_fields",
			"0025_add_character_tension_meter",
			"0026_add_tactical_combat_loop",
			"0027_melted_norrin_radd",
			"0028_add_foreign_key_indexes",
			"0025_tan_greymalkin",
			"0026_colossal_violations",
			"0027_absurd_blink",
			"0028_nasty_beast",
		]);
		expect(emptyTablesResult.tableNames).toEqual([]);
	});
});

describe("database worker request handler", () => {
	it("handles INIT_DATABASE with a serializable RPC response", async () => {
		const response = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "INIT_DATABASE",
				payload: { requestedAt: REQUESTED_AT },
			},
			{ bootstrapService: createService(new InMemoryDatabaseFileStorage()) },
		);

		expect(response).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
		});
	});

	it("handles GET_*_CATALOG queries and returns the correct official data", async () => {
		const ancestryResponse = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "GET_ANCESTRY_CATALOG",
				payload: {},
			},
			{ bootstrapService: createService(new InMemoryDatabaseFileStorage()) },
		);
		expect(ancestryResponse).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
		});
		expect(
			ancestryResponse.success && (ancestryResponse.data as any),
		).toHaveLength(6);

		const backgroundResponse = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "GET_BACKGROUND_CATALOG",
				payload: {},
			},
			{ bootstrapService: createService(new InMemoryDatabaseFileStorage()) },
		);
		expect(backgroundResponse).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
		});
		expect(
			backgroundResponse.success && (backgroundResponse.data as any),
		).toHaveLength(20);

		const characterClassResponse = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "GET_CHARACTER_CLASS_CATALOG",
				payload: {},
			},
			{ bootstrapService: createService(new InMemoryDatabaseFileStorage()) },
		);
		expect(characterClassResponse).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
		});
		expect(
			characterClassResponse.success && (characterClassResponse.data as any),
		).toHaveLength(4);

		const spellResponse = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "GET_SPELL_CATALOG",
				payload: {},
			},
			{ bootstrapService: createService(new InMemoryDatabaseFileStorage()) },
		);
		expect(spellResponse).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
		});
		expect(spellResponse.success && (spellResponse.data as any)).toHaveLength(
			9,
		);
	});

	it("returns failure responses for invalid requests and bootstrap service failures", async () => {
		const invalidResponse = await handleDatabaseWorkerRequest(
			{ type: "INIT_DATABASE" },
			{ bootstrapService: createService(new InMemoryDatabaseFileStorage()) },
		);
		const serviceFailureResponse = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "INIT_DATABASE",
				payload: { requestedAt: REQUESTED_AT },
			},
			{
				bootstrapService: createFailingBootstrapService(),
			},
		);

		expect(invalidResponse).toMatchObject({
			messageId: "00000000-0000-4000-8000-000000000000",
			success: false,
			error: { code: "VALIDATION_ERROR" },
		});
		expect(serviceFailureResponse).toMatchObject({
			success: false,
			error: { code: "SQLITE_MIGRATION_FAILED" },
		});
	});

	it("handles SAVE_GAME_SNAPSHOT and LOAD_GAME_SNAPSHOT roundtrip", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const service = createService(storage);

		await service.initializeDatabase({ requestedAt: REQUESTED_AT });

		const saveResponse = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "SAVE_GAME_SNAPSHOT",
				payload: {
					saveId: "primary",
					snapshot: {
						version: 1,
						savedAt: REQUESTED_AT,
						characters: [{ id: "lia", name: "Lia", level: 1 }],
						worldState: [
							{
								key: "location:morden:gate-open",
								value: true,
								updatedAt: REQUESTED_AT,
							},
						],
						progressClocks: [
							{
								id: "d51b73d5-2d05-4fec-a18c-7cd685cfed11",
								name: "Ameaça Orc",
								totalSegments: 6,
								filledSegments: 2,
								isCompleted: false,
								triggerEvent: "ORC_ATTACK",
							},
						],
						dialogueStates: [
							{
								id: "f51b73d5-2d05-4fec-a18c-7cd685cfed33",
								characterId: "00000000-0000-0000-0000-000000000001",
								npcId: "npc-emissary",
								currentConversationNodeId: "node-1",
								dialogueTreeId: "tree-1",
								historyJson: JSON.stringify(["root", "node-1"]),
								unlockedCluesJson: JSON.stringify(["clue-1"]),
								updatedAt: REQUESTED_AT,
							},
						],
						mercenaryCompanies: [
							{
								id: "company-123",
								bastionId: "bastion-1",
								tier: 1,
								reputation: 0,
								hqName: "Batalhão Dourado",
								createdAt: REQUESTED_AT,
								updatedAt: REQUESTED_AT,
							},
						],
						mercenarySquads: [
							{
								id: "squad-123",
								companyId: "company-123",
								name: "Garras de Aço",
								physical: 3,
								mental: 1,
								social: 1,
								cohesionMax: 13,
								cohesionCurrent: 13,
								tagsJson: JSON.stringify(["heavy_infantry"]),
								commandTactic: "stealthy",
								status: "available",
								assignedMissionId: null,
								createdAt: REQUESTED_AT,
								updatedAt: REQUESTED_AT,
							},
						],
						campaignEventsHistory: [
							{
								id: "e51b73d5-2d05-4fec-a18c-7cd685cfed99",
								campaignId: "primary",
								eventType: "siege_start",
								description: "O teste de cerco iniciou no snapshot",
								createdAt: REQUESTED_AT,
							},
						],
					},
				},
			},
			{ bootstrapService: service },
		);

		expect(saveResponse).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: { saved: true },
		});

		const loadResponse = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "LOAD_GAME_SNAPSHOT",
				payload: { saveId: "primary" },
			},
			{ bootstrapService: service },
		);

		expect(loadResponse).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: {
				snapshot: {
					version: 1,
					characters: [
						expect.objectContaining({
							id: "lia",
							name: "Lia",
							level: 1,
						}),
					],
					worldState: [
						{
							key: "location:morden:gate-open",
							value: true,
							updatedAt: REQUESTED_AT,
						},
					],
					progressClocks: [
						{
							id: "d51b73d5-2d05-4fec-a18c-7cd685cfed11",
							name: "Ameaça Orc",
							totalSegments: 6,
							filledSegments: 2,
							isCompleted: false,
							triggerEvent: "ORC_ATTACK",
						},
					],
					dialogueStates: [
						{
							id: "f51b73d5-2d05-4fec-a18c-7cd685cfed33",
							characterId: "00000000-0000-0000-0000-000000000001",
							npcId: "npc-emissary",
							currentConversationNodeId: "node-1",
							dialogueTreeId: "tree-1",
							historyJson: JSON.stringify(["root", "node-1"]),
							unlockedCluesJson: JSON.stringify(["clue-1"]),
							updatedAt: REQUESTED_AT,
						},
					],
					mercenaryCompanies: [
						{
							id: "company-123",
							bastionId: "bastion-1",
							tier: 1,
							reputation: 0,
							hqName: "Batalhão Dourado",
							createdAt: REQUESTED_AT,
							updatedAt: REQUESTED_AT,
						},
					],
					mercenarySquads: [
						{
							id: "squad-123",
							companyId: "company-123",
							name: "Garras de Aço",
							physical: 3,
							mental: 1,
							social: 1,
							cohesionMax: 13,
							cohesionCurrent: 13,
							tagsJson: JSON.stringify(["heavy_infantry"]),
							commandTactic: "stealthy",
							status: "available",
							assignedMissionId: null,
							createdAt: REQUESTED_AT,
							updatedAt: REQUESTED_AT,
						},
					],
					campaignEventsHistory: [
						{
							id: "e51b73d5-2d05-4fec-a18c-7cd685cfed99",
							campaignId: "primary",
							eventType: "siege_start",
							description: "O teste de cerco iniciou no snapshot",
							createdAt: REQUESTED_AT,
						},
					],
				},
			},
		});
	});

	it("handles Clock RPC operations (save, find, list, delete)", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const service = createService(storage);

		await service.initializeDatabase({ requestedAt: REQUESTED_AT });

		const clockId = "e51b73d5-2d05-4fec-a18c-7cd685cfed22";
		const clockObj = {
			id: clockId,
			name: "Construção do Bastião",
			totalSegments: 4,
			filledSegments: 1,
			isCompleted: false,
			triggerEvent: null,
		};

		// 1. SAVE_CLOCK
		const saveRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "SAVE_CLOCK",
				payload: { clock: clockObj },
			},
			{ bootstrapService: service },
		);

		expect(saveRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: clockObj,
		});

		// 2. FIND_CLOCK
		const findRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "FIND_CLOCK",
				payload: { id: clockId },
			},
			{ bootstrapService: service },
		);

		expect(findRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: {
				...clockObj,
				triggerEvent: undefined,
			},
		});

		// 3. LIST_CLOCKS
		const listRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "LIST_CLOCKS",
				payload: {},
			},
			{ bootstrapService: service },
		);

		expect(listRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: [
				{
					...clockObj,
					triggerEvent: undefined,
				},
			],
		});

		// 4. DELETE_CLOCK
		const delRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "DELETE_CLOCK",
				payload: { id: clockId },
			},
			{ bootstrapService: service },
		);

		expect(delRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
		});

		// 5. FIND_CLOCK after delete
		const findAfterDelRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "FIND_CLOCK",
				payload: { id: clockId },
			},
			{ bootstrapService: service },
		);

		expect(findAfterDelRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: null,
		});
	});

	it("handles Dialogue RPC operations (save, find, delete)", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const service = createService(storage);

		await service.initializeDatabase({ requestedAt: REQUESTED_AT });

		const dialogueId = "f51b73d5-2d05-4fec-a18c-7cd685cfed33";
		const characterId = "a0000000-0000-4000-8000-00000000000a";
		const dialogueStateObj = {
			id: dialogueId,
			characterId,
			npcId: "npc-emissary",
			currentConversationNodeId: "node-1",
			dialogueTreeId: "tree-1",
			historyJson: JSON.stringify(["root", "node-1"]),
			unlockedCluesJson: JSON.stringify(["clue-1"]),
			updatedAt: REQUESTED_AT,
		};

		// 1. SAVE_DIALOGUE_STATE
		const saveRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "SAVE_DIALOGUE_STATE",
				payload: { dialogueState: dialogueStateObj },
			},
			{ bootstrapService: service },
		);

		expect(saveRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: dialogueStateObj,
		});

		// 2. FIND_DIALOGUE_STATE
		const findRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "FIND_DIALOGUE_STATE",
				payload: { characterId, npcId: "npc-emissary" },
			},
			{ bootstrapService: service },
		);

		expect(findRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: dialogueStateObj,
		});

		// 3. DELETE_DIALOGUE_STATE
		const delRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "DELETE_DIALOGUE_STATE",
				payload: { id: dialogueId },
			},
			{ bootstrapService: service },
		);

		expect(delRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
		});

		// 4. FIND_DIALOGUE_STATE after delete
		const findAfterDelRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "FIND_DIALOGUE_STATE",
				payload: { characterId, npcId: "npc-emissary" },
			},
			{ bootstrapService: service },
		);

		expect(findAfterDelRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: null,
		});
	});

	it("handles Campaign Events RPC operations (record, list)", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const service = createService(storage);

		await service.initializeDatabase({ requestedAt: REQUESTED_AT });

		const campaignId = "primary";
		const eventType = "siege_start";
		const description = "O cerco foi iniciado!";

		// 1. RECORD_CAMPAIGN_EVENT
		const recordRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "RECORD_CAMPAIGN_EVENT",
				payload: { campaignId, eventType, description },
			},
			{ bootstrapService: service },
		);

		expect(recordRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: expect.objectContaining({
				campaignId,
				eventType,
				description,
			}),
		});

		// 2. GET_CAMPAIGN_TIMELINE
		const timelineRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "GET_CAMPAIGN_TIMELINE",
				payload: { campaignId },
			},
			{ bootstrapService: service },
		);

		expect(timelineRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
		});
		expect(timelineRes.success && (timelineRes.data as any)).toHaveLength(1);
		expect(timelineRes.success && (timelineRes.data as any)[0]).toMatchObject({
			campaignId,
			eventType,
			description,
		});
	});

	it("handles Regional Domain RPC operations (save, find)", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const service = createService(storage);

		await service.initializeDatabase({ requestedAt: REQUESTED_AT });

		const domainId = "domain-123";
		const regionalDomainObj = {
			id: domainId,
			tier: 1,
			physicalLevel: 3,
			mentalLevel: 1,
			socialLevel: 1,
			regentId: null,
			weeksAway: 0,
			createdAt: REQUESTED_AT,
			updatedAt: REQUESTED_AT,
		};

		// 1. SAVE
		const saveRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "SAVE_REGIONAL_DOMAIN",
				payload: { regionalDomain: regionalDomainObj },
			},
			{ bootstrapService: service },
		);
		expect(saveRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: regionalDomainObj,
		});

		// 2. FIND
		const findRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "FIND_REGIONAL_DOMAIN",
				payload: { id: domainId },
			},
			{ bootstrapService: service },
		);
		expect(findRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: regionalDomainObj,
		});
	});

	it("handles Camp Session RPC operations (save, find, list, delete)", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const service = createService(storage);

		await service.initializeDatabase({ requestedAt: REQUESTED_AT });

		const campId = "camp-123";
		const campSessionObj = {
			id: campId,
			totalTime: 12,
			sleepHours: 8,
			availableActions: 4,
			dangerCounter: 0,
			activeActivitiesJson: JSON.stringify([]),
			createdAt: REQUESTED_AT,
			updatedAt: REQUESTED_AT,
		};

		// 1. SAVE
		const saveRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "SAVE_CAMP_SESSION",
				payload: { campSession: campSessionObj },
			},
			{ bootstrapService: service },
		);
		expect(saveRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: campSessionObj,
		});

		// 2. FIND
		const findRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "FIND_CAMP_SESSION",
				payload: { id: campId },
			},
			{ bootstrapService: service },
		);
		expect(findRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: campSessionObj,
		});

		// 3. LIST
		const listRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "LIST_CAMP_SESSIONS",
				payload: {},
			},
			{ bootstrapService: service },
		);
		expect(listRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: [campSessionObj],
		});

		// 4. DELETE
		const delRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "DELETE_CAMP_SESSION",
				payload: { id: campId },
			},
			{ bootstrapService: service },
		);
		expect(delRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
		});

		// 5. FIND after delete (should return success: false with DATABASE_FILE_READ_FAILED)
		const findAfterDel = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "FIND_CAMP_SESSION",
				payload: { id: campId },
			},
			{ bootstrapService: service },
		);
		expect(findAfterDel).toMatchObject({
			messageId: MESSAGE_ID,
			success: false,
			error: {
				code: "DATABASE_FILE_READ_FAILED",
			},
		});
	});

	it("handles Mercenary Company and Squad RPC operations (save, find, list)", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const service = createService(storage);

		await service.initializeDatabase({ requestedAt: REQUESTED_AT });

		const companyId = "company-123";
		const companyObj = {
			id: companyId,
			bastionId: "bastion-1",
			tier: 1,
			reputation: 0,
			hqName: "Batalhão Dourado",
			createdAt: REQUESTED_AT,
			updatedAt: REQUESTED_AT,
		};

		// 1. SAVE COMPANY
		const saveCompanyRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "SAVE_MERCENARY_COMPANY",
				payload: { company: companyObj },
			},
			{ bootstrapService: service },
		);
		expect(saveCompanyRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: companyObj,
		});

		// 2. FIND COMPANY
		const findCompanyRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "FIND_MERCENARY_COMPANY",
				payload: { id: companyId },
			},
			{ bootstrapService: service },
		);
		expect(findCompanyRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: companyObj,
		});

		// 3. LIST COMPANIES
		const listCompaniesRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "LIST_MERCENARY_COMPANIES",
				payload: {},
			},
			{ bootstrapService: service },
		);
		expect(listCompaniesRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: [companyObj],
		});

		const squadId = "squad-123";
		const squadObj = {
			id: squadId,
			companyId: companyId,
			name: "Garras de Aço",
			physical: 3,
			mental: 1,
			social: 1,
			cohesionMax: 13,
			cohesionCurrent: 13,
			tagsJson: JSON.stringify(["heavy_infantry"]),
			commandTactic: "stealthy",
			status: "available",
			assignedMissionId: null,
			createdAt: REQUESTED_AT,
			updatedAt: REQUESTED_AT,
		};

		// 4. SAVE SQUAD
		const saveSquadRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "SAVE_MERCENARY_SQUAD",
				payload: { squad: squadObj },
			},
			{ bootstrapService: service },
		);
		expect(saveSquadRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: squadObj,
		});

		// 5. FIND SQUAD
		const findSquadRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "FIND_MERCENARY_SQUAD",
				payload: { id: squadId },
			},
			{ bootstrapService: service },
		);
		expect(findSquadRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: squadObj,
		});

		// 6. LIST SQUADS BY COMPANY
		const listSquadsRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "LIST_MERCENARY_SQUADS_BY_COMPANY",
				payload: { companyId: companyId },
			},
			{ bootstrapService: service },
		);
		expect(listSquadsRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: [squadObj],
		});
	});

	it("handles Combat Encounter, Monsters and Active Session RPC operations", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const service = createService(storage);

		await service.initializeDatabase({ requestedAt: REQUESTED_AT });

		const encounterId = "encounter-123";
		const encounterObj = {
			id: encounterId,
			turn: 1,
			round: 1,
			initiativeOrderJson: JSON.stringify(["hero-1", "monster-1"]),
			status: "active",
			createdAt: REQUESTED_AT,
			updatedAt: REQUESTED_AT,
		};

		// 1. SAVE ENCOUNTER
		const saveEncounterRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "SAVE_COMBAT_ENCOUNTER",
				payload: { combatEncounter: encounterObj },
			},
			{ bootstrapService: service },
		);
		expect(saveEncounterRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: encounterObj,
		});

		// 2. FIND ENCOUNTER
		const findEncounterRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "FIND_COMBAT_ENCOUNTER",
				payload: { id: encounterId },
			},
			{ bootstrapService: service },
		);
		expect(findEncounterRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: encounterObj,
		});

		const monsterId = "monster-instance-123";
		const monsterObj = {
			id: monsterId,
			combatEncounterId: encounterId,
			monsterId: "goblin",
			name: "Goblin Comum",
			hpCurrent: 8,
			hpMax: 8,
			eeCurrent: 0,
			eeMax: 0,
			tacticalRole: "assassino",
			createdAt: REQUESTED_AT,
			updatedAt: REQUESTED_AT,
		};

		// 3. SAVE MONSTER
		const saveMonsterRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "SAVE_COMBAT_MONSTER",
				payload: { combatMonster: monsterObj },
			},
			{ bootstrapService: service },
		);
		expect(saveMonsterRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: monsterObj,
		});

		// 4. FIND MONSTERS BY ENCOUNTER
		const findMonstersRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "FIND_COMBAT_MONSTERS_BY_ENCOUNTER",
				payload: { combatEncounterId: encounterId },
			},
			{ bootstrapService: service },
		);
		expect(findMonstersRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: [monsterObj],
		});

		const activeSessionId = "current-session";
		const activeSessionObj = {
			id: activeSessionId,
			combatEncounterId: encounterId,
			updatedAt: REQUESTED_AT,
		};

		// 5. SAVE ACTIVE SESSION
		const saveSessionRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "SAVE_ACTIVE_SESSION",
				payload: { activeSession: activeSessionObj },
			},
			{ bootstrapService: service },
		);
		expect(saveSessionRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: activeSessionObj,
		});

		// 6. FIND ACTIVE SESSION
		const findSessionRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "FIND_ACTIVE_SESSION",
				payload: { id: activeSessionId },
			},
			{ bootstrapService: service },
		);
		expect(findSessionRes).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: activeSessionObj,
		});
	});

	it("handles save slot RPC operations (list, create, clone, delete)", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const service = createService(storage);

		// Mock global navigator
		const mockFiles = new Map<
			string,
			{ size: number; lastModified: number; bytes: Uint8Array }
		>();
		mockFiles.set("pandorha.sqlite3", {
			size: 100,
			lastModified: Date.now(),
			bytes: new Uint8Array([1, 2]),
		});

		const mockDirectoryHandle = {
			keys: async function* () {
				yield* mockFiles.keys();
			},
			getFileHandle: async (name: string, options?: { create?: boolean }) => {
				if (options?.create && !mockFiles.has(name)) {
					mockFiles.set(name, {
						size: 0,
						lastModified: Date.now(),
						bytes: new Uint8Array(),
					});
				}
				const entry = mockFiles.get(name);
				if (!entry) {
					throw new DOMException("File not found", "NotFoundError");
				}
				return {
					getFile: async () => ({
						size: entry.size,
						lastModified: entry.lastModified,
						arrayBuffer: async () => entry.bytes.buffer as ArrayBuffer,
					}),
					createWritable: async () => {
						let writtenBytes = new Uint8Array() as any;
						return {
							write: async (b: Uint8Array) => {
								writtenBytes = b;
							},
							close: async () => {
								entry.bytes = writtenBytes;
								entry.size = writtenBytes.byteLength;
								entry.lastModified = Date.now();
							},
						};
					},
				};
			},
			removeEntry: async (name: string) => {
				mockFiles.delete(name);
			},
		};

		const originalNavigator = globalThis.navigator;
		Object.defineProperty(globalThis, "navigator", {
			value: {
				storage: {
					getDirectory: async () => mockDirectoryHandle,
				},
			},
			configurable: true,
			writable: true,
		});

		try {
			// 1. INIT_DATABASE com activeSaveFile
			const initRes = await handleDatabaseWorkerRequest(
				{
					messageId: MESSAGE_ID,
					type: "INIT_DATABASE",
					payload: {
						requestedAt: REQUESTED_AT,
						activeSaveFile: "campanha_1.sqlite3",
					},
				},
				{ bootstrapService: service },
			);
			expect(initRes.success).toBe(true);
			// Deve ter alterado a propriedade fileName do storage interno
			expect((service as any).storage.fileName).toBe("campanha_1.sqlite3");

			// 2. LIST_SAVE_SLOTS
			const listRes = await handleDatabaseWorkerRequest(
				{
					messageId: MESSAGE_ID,
					type: "LIST_SAVE_SLOTS",
					payload: {},
				},
				{ bootstrapService: service },
			);
			expect(listRes.success).toBe(true);
			if (listRes.success) {
				expect(listRes.data).toContainEqual(
					expect.objectContaining({
						fileName: "pandorha.sqlite3",
					}),
				);
			}

			// 3. CREATE_SAVE_SLOT
			const createRes = await handleDatabaseWorkerRequest(
				{
					messageId: MESSAGE_ID,
					type: "CREATE_SAVE_SLOT",
					payload: { fileName: "campanha_2.sqlite3" },
				},
				{ bootstrapService: service },
			);
			expect(createRes.success).toBe(true);

			// 4. CLONE_SAVE_SLOT
			const cloneRes = await handleDatabaseWorkerRequest(
				{
					messageId: MESSAGE_ID,
					type: "CLONE_SAVE_SLOT",
					payload: {
						sourceFileName: "pandorha.sqlite3",
						targetFileName: "pandorha_copia.sqlite3",
					},
				},
				{ bootstrapService: service },
			);
			expect(cloneRes.success).toBe(true);
			expect(mockFiles.has("pandorha_copia.sqlite3")).toBe(true);

			// 5. DELETE_SAVE_SLOT
			const deleteRes = await handleDatabaseWorkerRequest(
				{
					messageId: MESSAGE_ID,
					type: "DELETE_SAVE_SLOT",
					payload: { fileName: "pandorha_copia.sqlite3" },
				},
				{ bootstrapService: service },
			);
			expect(deleteRes.success).toBe(true);
			expect(mockFiles.has("pandorha_copia.sqlite3")).toBe(false);
		} finally {
			// Restaura o navigator original
			Object.defineProperty(globalThis, "navigator", {
				value: originalNavigator,
				configurable: true,
				writable: true,
			});
		}
	});

	it("handles MUTATE_WORLD_STATE, TICK_CLOCK_MANUAL, and FORCE_SPAWN_ACTOR operations", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const service = createService(storage);

		expectBootstrapSuccess(
			await service.initializeDatabase({ requestedAt: REQUESTED_AT }),
		);

		// Insere facção e personagem válidos para satisfazer restrições de chaves estrangeiras
		const factionSave = await service.saveFaction({
			id: "guild_explorers",
			name: "Guilda dos Exploradores",
			description: "Exploradores de Pandorha",
			alignment: "neutral",
		});
		expect(factionSave.success).toBe(true);

		const characterSave = await service.saveCharacter({
			id: "char-1",
			name: "Aria",
			concept: "Guerreira nobre das Terras Altas",
			classId: "warrior",
			ancestryId: "human",
			backgroundId: "noble",
			level: 1,
			experiencePoints: 0,
			physical: 3,
			mental: 2,
			social: 2,
			conflict: 3,
			interaction: 2,
			resistance: 3,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
		expect(characterSave.success).toBe(true);

		// 1. Testa mutateWorldState
		const mutateRes = await service.mutateWorldState(
			[{ key: "plot:pista_revelada", value: true }],
			[{ characterId: "char-1", factionId: "guild_explorers", value: 15 }],
		);
		expect(mutateRes.success).toBe(true);

		// Valida falhas
		storage.failNextRead({
			code: "DATABASE_FILE_READ_FAILED",
			message: "Read error",
		});
		const mutateReadFail = await service.mutateWorldState([]);
		expect(mutateReadFail.success).toBe(false);

		// 2. Testa tickClockManual
		const clockId = "d51b73d5-2d05-4fec-a18c-7cd685cfed01";
		const clockRes = await service.saveClock({
			id: clockId,
			name: "Clock Teste",
			totalSegments: 4,
			filledSegments: 2,
			isCompleted: false,
			triggerEvent: "EVENTO_TESTE",
		});
		expect(clockRes.success).toBe(true);

		const tickRes = await service.tickClockManual(clockId, 1);
		expect(tickRes.success).toBe(true);
		if (tickRes.success) {
			expect(tickRes.data.clock.filledSegments).toBe(3);
			expect(tickRes.data.clock.isCompleted).toBe(false);
			expect(tickRes.data.eventTriggered).toBeNull();
		}

		const tickCompleteRes = await service.tickClockManual(clockId, 1);
		expect(tickCompleteRes.success).toBe(true);
		if (tickCompleteRes.success) {
			expect(tickCompleteRes.data.clock.filledSegments).toBe(4);
			expect(tickCompleteRes.data.clock.isCompleted).toBe(true);
			expect(tickCompleteRes.data.eventTriggered).toBe("EVENTO_TESTE");
		}

		const tickNotFound = await service.tickClockManual(
			"d51b73d5-2d05-4fec-a18c-7cd685cfed02",
			1,
		);
		expect(tickNotFound.success).toBe(false);
		if (!tickNotFound.success) {
			expect(tickNotFound.error.code).toBe("CLOCK_NOT_FOUND");
		}

		storage.failNextRead({
			code: "DATABASE_FILE_READ_FAILED",
			message: "Read error",
		});
		const tickReadFail = await service.tickClockManual(clockId, 1);
		expect(tickReadFail.success).toBe(false);

		// 3. Testa forceSpawnActor
		const spawnRes = await service.forceSpawnActor({
			actorId: "actor-1",
			label: "Orco Bruto",
			profile: "brute",
			hitPoints: 50,
			initiativeBase: 3,
		});
		expect(spawnRes.success).toBe(true);
		if (spawnRes.success) {
			expect(spawnRes.data.spawned).toBe(true);
			expect(spawnRes.data.actor.label).toBe("Orco Bruto");
		}
	});

	it("handles MUTATE_WORLD_STATE, TICK_CLOCK_MANUAL, and FORCE_SPAWN_ACTOR via database worker handler", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const service = createService(storage);

		expectBootstrapSuccess(
			await service.initializeDatabase({ requestedAt: REQUESTED_AT }),
		);

		// Insere facção e personagem válidos para satisfazer restrições de chaves estrangeiras
		const factionSave = await service.saveFaction({
			id: "guild_explorers",
			name: "Guilda dos Exploradores",
			description: "Exploradores de Pandorha",
			alignment: "neutral",
		});
		expect(factionSave.success).toBe(true);

		const characterSave = await service.saveCharacter({
			id: "char-1",
			name: "Aria",
			concept: "Guerreira nobre das Terras Altas",
			classId: "warrior",
			ancestryId: "human",
			backgroundId: "noble",
			level: 1,
			experiencePoints: 0,
			physical: 3,
			mental: 2,
			social: 2,
			conflict: 3,
			interaction: 2,
			resistance: 3,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
		expect(characterSave.success).toBe(true);

		// 1. MUTATE_WORLD_STATE
		const mutateWorkerRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "MUTATE_WORLD_STATE",
				payload: {
					worldStateMutations: [{ key: "plot:pista_revelada", value: true }],
					factionRenownMutations: [
						{ characterId: "char-1", factionId: "guild_explorers", value: 15 },
					],
				},
			},
			{ bootstrapService: service },
		);
		expect(mutateWorkerRes.success).toBe(true);

		// 2. TICK_CLOCK_MANUAL
		const clockId = "d51b73d5-2d05-4fec-a18c-7cd685cfed03";
		await service.saveClock({
			id: clockId,
			name: "Clock Teste 2",
			totalSegments: 4,
			filledSegments: 2,
			isCompleted: false,
			triggerEvent: "EVENTO_TESTE_2",
		});

		const tickWorkerRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "TICK_CLOCK_MANUAL",
				payload: { clockId, delta: 1 },
			},
			{ bootstrapService: service },
		);
		expect(tickWorkerRes.success).toBe(true);

		// 3. FORCE_SPAWN_ACTOR
		const spawnWorkerRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "FORCE_SPAWN_ACTOR",
				payload: {
					actorId: "actor-2",
					label: "Mago Sniper",
					profile: "sniper",
					hitPoints: 30,
					initiativeBase: 5,
				},
			},
			{ bootstrapService: service },
		);
		expect(spawnWorkerRes.success).toBe(true);
	});

	it("handles APPLY_LEVEL_UP successfully and handles validation failures", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const service = createService(storage);

		expectBootstrapSuccess(
			await service.initializeDatabase({ requestedAt: REQUESTED_AT }),
		);

		// Insert required faction
		const factionSave = await service.saveFaction({
			id: "guild_explorers",
			name: "Guilda dos Exploradores",
			description: "Exploradores de Pandorha",
			alignment: "neutral",
		});
		expect(factionSave.success).toBe(true);

		// Character 1 with level 1, 0 XP, physical 2, mental 3
		const charId1 = "char-levelup-test-1";
		const characterSave1 = await service.saveCharacter({
			id: charId1,
			name: "LevelUp Hero 1",
			concept: "Místico em ascensão",
			classId: "weaver",
			ancestryId: "human",
			backgroundId: "scholar",
			level: 1,
			experiencePoints: 0,
			physical: 2,
			mental: 3,
			social: 2,
			conflict: 3,
			interaction: 2,
			resistance: 3,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
		expect(characterSave1.success).toBe(true);

		// Character 2 with level 1, 100 XP (eligible), physical 2, mental 3
		const charId2 = "char-levelup-test-2";
		const characterSave2 = await service.saveCharacter({
			id: charId2,
			name: "LevelUp Hero 2",
			concept: "Guerreiro experiente",
			classId: "warrior",
			ancestryId: "human",
			backgroundId: "noble",
			level: 1,
			experiencePoints: 100,
			physical: 2,
			mental: 3,
			social: 2,
			conflict: 3,
			interaction: 2,
			resistance: 3,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
		expect(characterSave2.success).toBe(true);

		// Character 3 with level 2, 300 XP (eligible), physical 3, mental 3, social 2
		const charId3 = "char-levelup-test-3";
		const characterSave3 = await service.saveCharacter({
			id: charId3,
			name: "LevelUp Hero 3",
			concept: "Ladrão furtivo",
			classId: "vanguard",
			ancestryId: "human",
			backgroundId: "criminal",
			level: 2,
			experiencePoints: 300,
			physical: 3,
			mental: 3,
			social: 2,
			conflict: 4,
			interaction: 2,
			resistance: 4,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
		expect(characterSave3.success).toBe(true);

		// 1. Attempt to level up with insufficient XP (Character 1 has 0 XP, level 2 needs 100 XP)
		const failXpRes = await service.applyLevelUp({
			characterId: charId1,
			addedPhysical: 1,
			addedMental: 0,
			addedSocial: 0,
			addedConflict: 1,
			addedInteraction: 1,
			addedResistance: 0,
		});
		expect(failXpRes.success).toBe(false);
		if (!failXpRes.success) {
			expect(failXpRes.error.code).toBe("INSUFFICIENT_EXPERIENCE_POINTS");
		}

		// 2. Attempt to level up with invalid point distribution (Eixos sum !== 1)
		const failAxisRes = await service.applyLevelUp({
			characterId: charId2,
			addedPhysical: 1,
			addedMental: 1,
			addedSocial: 0,
			addedConflict: 1,
			addedInteraction: 1,
			addedResistance: 0,
		});
		expect(failAxisRes.success).toBe(false);
		if (!failAxisRes.success) {
			expect(failAxisRes.error.code).toBe("INVALID_LEVEL_UP_DISTRIBUTION");
		}

		// 3. Attempt to level up with invalid point distribution (Aplicações sum !== 2)
		const failAppRes = await service.applyLevelUp({
			characterId: charId2,
			addedPhysical: 1,
			addedMental: 0,
			addedSocial: 0,
			addedConflict: 1,
			addedInteraction: 0,
			addedResistance: 0,
		});
		expect(failAppRes.success).toBe(false);
		if (!failAppRes.success) {
			expect(failAppRes.error.code).toBe("INVALID_LEVEL_UP_DISTRIBUTION");
		}

		// 4. Attempt to level up raising mental above cap for Tier I (limit is 3 for level 2, mental is 3. Adding 1 makes it 4, exceeds cap)
		const failCapRes = await service.applyLevelUp({
			characterId: charId2,
			addedPhysical: 0,
			addedMental: 1, // 3 + 1 = 4, exceeds Tier I cap of 3
			addedSocial: 0,
			addedConflict: 1,
			addedInteraction: 1,
			addedResistance: 0,
		});
		expect(failCapRes.success).toBe(false);
		if (!failCapRes.success) {
			expect(failCapRes.error.code).toBe("INVALID_TIER_CAP");
		}

		// 5. Successful level up for Character 2 (physical becomes 3, conflict 4, resistance 4)
		const successRes = await service.applyLevelUp({
			characterId: charId2,
			addedPhysical: 1,
			addedMental: 0,
			addedSocial: 0,
			addedConflict: 1,
			addedInteraction: 0,
			addedResistance: 1,
		});
		if (!successRes.success) {
			console.log("LEVEL UP ERROR: ", JSON.stringify(successRes));
		}
		expect(successRes.success).toBe(true);
		if (successRes.success) {
			const updatedChar = successRes.data;
			expect(updatedChar.level).toBe(2);
			expect(updatedChar.physical).toBe(3);
			expect(updatedChar.mental).toBe(3);
			expect(updatedChar.social).toBe(2);
			expect(updatedChar.conflict).toBe(4);
			expect(updatedChar.interaction).toBe(2);
			expect(updatedChar.resistance).toBe(4);
		}

		// 6. Test handler directly via handleDatabaseWorkerRequest on Character 3 (level up to 3)
		const workerRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "APPLY_LEVEL_UP",
				payload: {
					levelUpInput: {
						characterId: charId3,
						addedPhysical: 0,
						addedMental: 0,
						addedSocial: 1, // 2 + 1 = 3 (within Tier I cap of 3)
						addedConflict: 0,
						addedInteraction: 2, // 2 + 2 = 4
						addedResistance: 0,
					},
				},
			},
			{ bootstrapService: service },
		);
		expect(workerRes.success).toBe(true);
		if (workerRes.success) {
			const updatedChar = workerRes.data as unknown as CharacterRecord;
			expect(updatedChar.level).toBe(3);
			expect(updatedChar.social).toBe(3);
			expect(updatedChar.interaction).toBe(4);
		}
	});

	it("processes CAST_SPELL RPC requests, validates EE, calculates Upcast, and applies status effects to targets", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const service = createService(storage);

		await service.initializeDatabase({
			requestedAt: REQUESTED_AT,
		});

		// 1. Create a Weaver caster (Weaver class, Level 1, Mental 2 -> Max EE 3)
		const casterId = "char-weaver-caster";
		const targetId = "char-target-dummy";

		const casterRes = await service.saveCharacter({
			id: casterId,
			name: "Mestre Tecelao",
			concept: "Conjurador de Status",
			ancestryId: "humano",
			classId: "weaver",
			backgroundId: "plebeu",
			level: 1,
			experiencePoints: 0,
			physical: 1,
			mental: 2,
			social: 1,
			conflict: 1,
			interaction: 1,
			resistance: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
		expect(casterRes.success).toBe(true);

		// 2. Create target character
		const targetRes = await service.saveCharacter({
			id: targetId,
			name: "Boneco de Treino",
			concept: "Alvo estatico",
			ancestryId: "humano",
			classId: "guerreiro",
			backgroundId: "plebeu",
			level: 1,
			experiencePoints: 0,
			physical: 1,
			mental: 1,
			social: 1,
			conflict: 1,
			interaction: 1,
			resistance: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
		expect(targetRes.success).toBe(true);

		// 3. Cast "silence" (2 EE base, circle 1, targetEffects: silenced, duration 3)
		// Caster max EE = 3, cost = 2. Should succeed.
		const cast1 = await service.castSpell({
			casterId,
			targetId,
			spellId: "silence",
			upcastLevel: 0,
		});
		if (!cast1.success) {
			console.error("CAST_SPELL_ERROR:", JSON.stringify(cast1.error));
		}
		expect(cast1.success).toBe(true);

		// Check status effects applied to target
		const effects1 = await service.findStatusEffects(targetId);
		expect(effects1.success).toBe(true);
		if (effects1.success) {
			expect(effects1.data).toHaveLength(1);
			expect(effects1.data[0]).toMatchObject({
				characterId: targetId,
				type: "silenced",
				durationTurns: 3,
			});
		}

		// Clean up status effects for next tests
		if (effects1.success && effects1.data[0]) {
			await service.deleteStatusEffect(effects1.data[0].id);
		}

		// 4. Try to upcast "silence" to level 1 (cost 4 EE). Available 3 EE -> Should fail
		const castFail = await service.castSpell({
			casterId,
			targetId,
			spellId: "silence",
			upcastLevel: 1,
		});
		expect(castFail.success).toBe(false);
		if (!castFail.success) {
			expect(castFail.error.code).toBe("INSUFFICIENT_ETHER");
		}

		// 5. Upgrade caster's mental to 4 (max EE = 1 + 4 = 5)
		const upgradedCasterRes = await service.saveCharacter({
			id: casterId,
			name: "Mestre Tecelao",
			concept: "Conjurador de Status",
			ancestryId: "humano",
			classId: "weaver",
			backgroundId: "plebeu",
			level: 1,
			experiencePoints: 0,
			physical: 1,
			mental: 4,
			social: 1,
			conflict: 1,
			interaction: 1,
			resistance: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
		expect(upgradedCasterRes.success).toBe(true);

		// 6. Cast "silence" with upcast 1 (cost 4 EE). Caster Max EE = 5 -> Should succeed
		const cast2 = await service.castSpell({
			casterId,
			targetId,
			spellId: "silence",
			upcastLevel: 1,
		});
		expect(cast2.success).toBe(true);

		const effects2 = await service.findStatusEffects(targetId);
		expect(effects2.success).toBe(true);
		if (effects2.success) {
			expect(effects2.data).toHaveLength(1);
			expect(effects2.data[0]).toMatchObject({
				characterId: targetId,
				type: "silenced",
				durationTurns: 4, // 3 base + 1 upcast duration increase
			});
		}

		// Clean up
		if (effects2.success && effects2.data[0]) {
			await service.deleteStatusEffect(effects2.data[0].id);
		}

		// 7. Test RPC worker endpoint for CAST_SPELL
		const workerRes = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "CAST_SPELL",
				payload: {
					casterId,
					targetId,
					spellId: "hold-person",
					upcastLevel: 0,
				},
			},
			{ bootstrapService: service },
		);
		expect(workerRes.success).toBe(true);

		const effects3 = await service.findStatusEffects(targetId);
		expect(effects3.success).toBe(true);
		if (effects3.success) {
			expect(effects3.data).toHaveLength(1);
			expect(effects3.data[0]).toMatchObject({
				characterId: targetId,
				type: "immobilized",
				durationTurns: 2, // base duration of hold-person
			});
		}
	});
});

function createService(
	storage: DatabaseFileStorage,
	migrations: readonly SqliteMigration[] = PANDORHA_SQLITE_MIGRATIONS,
): SqliteOpfsBootstrapService {
	return new SqliteOpfsBootstrapService({
		storage,
		migrations,
		createSqlite,
	});
}

async function createSqlite(): Promise<SqlJsStatic> {
	return initSqlJs({
		locateFile: () => sqlJsWasmPath,
	});
}

async function createExportFailingSqlite(): Promise<SqlJsStatic> {
	return {
		Database: ExportFailingDatabase as unknown as SqlJsStatic["Database"],
		Statement: class {} as SqlJsStatic["Statement"],
	} as SqlJsStatic;
}

async function createOpeningFailingSqlite(): Promise<SqlJsStatic> {
	return {
		Database: OpeningFailingDatabase as unknown as SqlJsStatic["Database"],
		Statement: class {} as SqlJsStatic["Statement"],
	} as SqlJsStatic;
}

async function createEmptyTablesSqlite(): Promise<SqlJsStatic> {
	return {
		Database: EmptyTablesDatabase as unknown as SqlJsStatic["Database"],
		Statement: class {} as SqlJsStatic["Statement"],
	} as SqlJsStatic;
}

function createFailingBootstrapService(): SqliteOpfsBootstrapService {
	const service = new SqliteOpfsBootstrapService({
		storage: new InMemoryDatabaseFileStorage(),
		createSqlite,
	});
	service.initializeDatabase = async () =>
		fail({
			code: "SQLITE_MIGRATION_FAILED",
			message: "Injected handler failure.",
			details: { cause: "bad migration" },
		});
	return service;
}

function expectBootstrapSuccess(
	result: Result<SqliteBootstrapResult, SqliteBootstrapFailure>,
): SqliteBootstrapResult {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectBootstrapFailure(
	result: Result<SqliteBootstrapResult, SqliteBootstrapFailure>,
): SqliteBootstrapFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class InMemoryDatabaseFileStorage implements DatabaseFileStorage {
	public fileName = "pandorha.sqlite3";
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

class ExportFailingDatabase {
	public run(): ExportFailingDatabase {
		return this;
	}

	public exec(): [] {
		return [];
	}

	public export(): Uint8Array {
		throw "export failed";
	}

	public close(): void {}
}

class OpeningFailingDatabase {
	public constructor() {
		throw "open failed";
	}
}

class EmptyTablesDatabase {
	public run(): EmptyTablesDatabase {
		return this;
	}

	public exec(): [] {
		return [];
	}

	public export(): Uint8Array {
		return new Uint8Array([1]);
	}

	public close(): void {}
}
