import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs, { type SqlJsStatic } from "sql.js";
import { describe, expect, it } from "vitest";
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
			],
			tableNames: [
				"_pandorha_migrations",
				"bastion_modules",
				"bastions",
				"blood_debts",
				"campaign_camp_sessions",
				"campaign_cohesion",
				"campaign_dialogue_states",
				"campaign_investigations",
				"campaign_quests",
				"campaign_regional_domains",
				"campaign_social_ledger",
				"character_crafted_items",
				"character_reputation",
				"character_status_effects",
				"characters",
				"crafting_recipes",
				"dungeon_delves",
				"dungeon_rooms",
				"espionage_cells",
				"faction_patronages",
				"factions",
				"mercenary_companies",
				"mercenary_squads",
				"progress_clocks",
				"registered_signatures",
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
