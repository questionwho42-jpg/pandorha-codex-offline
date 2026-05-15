import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs, { type SqlJsStatic } from "sql.js";
import { describe, expect, it } from "vitest";
import { CharacterBuilder } from "$lib/entities/character/testing/CharacterBuilder";
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
			version: 1,
			savedAt: SAVED_AT,
			characterCount: 1,
			worldStateCount: 1,
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

	it("saves empty character snapshots and rejects uninitialized databases", async () => {
		const storage = await createMigratedStorage();
		const service = createService(storage);
		const emptySnapshot = {
			...buildSnapshot(),
			characters: [],
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
		version: 1 as const,
		savedAt: SAVED_AT,
		characters: [buildCharacter()],
		worldState: [
			{
				key: "location:morden:gate-open",
				value: true,
				updatedAt: UPDATED_AT,
			},
		],
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
		'UPDATE world_state_entries SET value_json = \'{"version":2,"savedAt":"2026-05-15T19:50:00.000Z"}\' WHERE key = \'system:save:primary:metadata\';',
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

async function createMalformedSchemaStorage(): Promise<InMemoryDatabaseFileStorage> {
	const sqlite = await createSqlite();
	const database = new sqlite.Database();
	database.run("CREATE TABLE characters (id text PRIMARY KEY NOT NULL);");
	database.run(
		"CREATE TABLE world_state_entries (key text PRIMARY KEY NOT NULL, value_json text NOT NULL, updated_at text NOT NULL);",
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
