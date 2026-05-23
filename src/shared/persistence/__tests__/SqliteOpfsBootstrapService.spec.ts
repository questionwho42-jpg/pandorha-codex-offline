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
			],
			tableNames: [
				"_pandorha_migrations",
				"bastion_modules",
				"bastions",
				"blood_debts",
				"campaign_cohesion",
				"campaign_dialogue_states",
				"campaign_quests",
				"character_crafted_items",
				"character_reputation",
				"character_status_effects",
				"characters",
				"crafting_recipes",
				"factions",
				"progress_clocks",
				"registered_signatures",
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
