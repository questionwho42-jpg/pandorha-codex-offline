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
				"0002_true_cable",
				"0003_public_tyger_tiger",
				"0004_abnormal_luke_cage",
				"0005_perfect_sinister_six",
				"0006_bent_havok",
				"0007_aromatic_moonstone",
				"0008_equipment_loadout_events",
				"0009_character_trait_selections",
				"0010_equipment_durability_events",
			],
			tableNames: [
				"_pandorha_migrations",
				"camp_assignments",
				"camp_sessions",
				"character_trait_selections",
				"characters",
				"clocks",
				"equipment_durability_events",
				"equipment_loadout_events",
				"faction_standings",
				"factions",
				"inventory_events",
				"npc_relationships",
				"social_encounter_events",
				"social_encounters",
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
			"0002_true_cable",
			"0003_public_tyger_tiger",
			"0004_abnormal_luke_cage",
			"0005_perfect_sinister_six",
			"0006_bent_havok",
			"0007_aromatic_moonstone",
			"0008_equipment_loadout_events",
			"0009_character_trait_selections",
			"0010_equipment_durability_events",
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
			"0002_true_cable",
			"0003_public_tyger_tiger",
			"0004_abnormal_luke_cage",
			"0005_perfect_sinister_six",
			"0006_bent_havok",
			"0007_aromatic_moonstone",
			"0008_equipment_loadout_events",
			"0009_character_trait_selections",
			"0010_equipment_durability_events",
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

	it("routes save and load commands through the injected snapshot worker port", async () => {
		const saveResponse = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "SAVE_GAME_SNAPSHOT",
				payload: {
					saveId: "primary",
					snapshot: {
						version: 9,
						savedAt: REQUESTED_AT,
						characters: [],
						characterTraitSelections: [],
						worldState: [],
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
					},
				},
			},
			{
				bootstrapService: createService(new InMemoryDatabaseFileStorage()),
				snapshotService: new FakeSnapshotWorkerPort(),
			},
		);
		const loadResponse = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "LOAD_GAME_SNAPSHOT",
				payload: { saveId: "primary" },
			},
			{
				bootstrapService: createService(new InMemoryDatabaseFileStorage()),
				snapshotService: new FakeSnapshotWorkerPort(),
			},
		);

		expect(saveResponse).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: { saved: true },
		});
		expect(loadResponse).toMatchObject({
			messageId: MESSAGE_ID,
			success: true,
			data: {
				version: 9,
				savedAt: REQUESTED_AT,
				characters: [],
				characterTraitSelections: [],
				worldState: [],
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
			},
		});
	});

	it("returns failure responses for invalid, unsupported, and failing requests", async () => {
		const invalidResponse = await handleDatabaseWorkerRequest(
			{ type: "INIT_DATABASE" },
			{ bootstrapService: createService(new InMemoryDatabaseFileStorage()) },
		);
		const unsupportedResponse = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "LOAD_GAME_SNAPSHOT",
				payload: { saveId: "primary" },
			},
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
		const snapshotFailureResponse = await handleDatabaseWorkerRequest(
			{
				messageId: MESSAGE_ID,
				type: "LOAD_GAME_SNAPSHOT",
				payload: { saveId: "primary" },
			},
			{
				bootstrapService: createService(new InMemoryDatabaseFileStorage()),
				snapshotService: new FailingSnapshotWorkerPort(),
			},
		);

		expect(invalidResponse).toMatchObject({
			messageId: "00000000-0000-4000-8000-000000000000",
			success: false,
			error: { code: "VALIDATION_ERROR" },
		});
		expect(unsupportedResponse).toMatchObject({
			success: false,
			error: { code: "RPC_COMMAND_NOT_IMPLEMENTED" },
		});
		expect(serviceFailureResponse).toMatchObject({
			success: false,
			error: { code: "SQLITE_MIGRATION_FAILED" },
		});
		expect(snapshotFailureResponse).toMatchObject({
			success: false,
			error: { code: "SAVE_NOT_FOUND" },
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

class FakeSnapshotWorkerPort {
	public async saveSnapshot(): Promise<
		Result<
			{ readonly saved: true },
			{ readonly code: string; readonly message: string }
		>
	> {
		return ok({ saved: true as const });
	}

	public async loadSnapshot(): Promise<
		Result<
			{
				readonly version: 9;
				readonly savedAt: string;
				readonly characters: readonly [];
				readonly characterTraitSelections: readonly [];
				readonly worldState: readonly [];
				readonly clocks: readonly [];
				readonly campSessions: readonly [];
				readonly campAssignments: readonly [];
				readonly factionStandings: readonly [];
				readonly socialEncounters: readonly [];
				readonly socialEncounterEvents: readonly [];
				readonly npcRelationships: readonly [];
				readonly inventoryEvents: readonly [];
				readonly equipmentLoadoutEvents: readonly [];
				readonly equipmentDurabilityEvents: readonly [];
			},
			{ readonly code: string; readonly message: string }
		>
	> {
		return ok({
			version: 9,
			savedAt: REQUESTED_AT,
			characters: [],
			characterTraitSelections: [],
			worldState: [],
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
	}
}

class FailingSnapshotWorkerPort {
	public async saveSnapshot(): Promise<
		Result<
			{ readonly saved: true },
			{ readonly code: string; readonly message: string }
		>
	> {
		return fail({ code: "SAVE_NOT_FOUND", message: "missing save" });
	}

	public async loadSnapshot(): Promise<
		Result<never, { readonly code: string; readonly message: string }>
	> {
		return fail({ code: "SAVE_NOT_FOUND", message: "missing save" });
	}
}
