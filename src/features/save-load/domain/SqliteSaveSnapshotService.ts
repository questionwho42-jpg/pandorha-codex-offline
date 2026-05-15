import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/sql-js";
import { characterSelectSchema, characters } from "$lib/entities/character";
import {
	worldStateEntries,
	worldStateEntryInsertSchema,
	worldStateEntrySelectSchema,
} from "$lib/entities/world-state";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	DatabaseFileStorage,
	SqliteDatabase,
	SqliteWasmFactory,
} from "$lib/shared/persistence";
import {
	loadedSessionStateSchema,
	saveMetadataSchema,
} from "../model/saveLoadSchemas";
import type { LoadedSessionState } from "../model/saveLoadTypes";
import type {
	SaveSnapshotFailure,
	SaveSnapshotResult,
} from "../model/saveSnapshotTypes";

const SAVE_METADATA_KEY = "system:save:primary:metadata";

interface SqliteSaveSnapshotServiceInput {
	readonly storage: DatabaseFileStorage;
	readonly createSqlite: SqliteWasmFactory;
}

/**
 * @description Persists the primary save snapshot into SQLite tables already prepared by the Worker bootstrap phase.
 * @rule docs/architecture/worker_rpc_spec.md - Worker operations return typed results across the RPC boundary.
 */
export class SqliteSaveSnapshotService {
	public constructor(private readonly input: SqliteSaveSnapshotServiceInput) {}

	public async saveSnapshot(
		input: unknown,
	): Promise<Result<SaveSnapshotResult, SaveSnapshotFailure>> {
		const parsedSnapshot = loadedSessionStateSchema.safeParse(input);
		if (!parsedSnapshot.success) {
			return fail({
				code: "INVALID_SAVE_SNAPSHOT",
				message: "Save snapshot failed validation before persistence.",
				details: {
					issues: parsedSnapshot.error.issues.map((issue) => issue.message),
				},
			});
		}

		const opened = await this.openExistingDatabase();
		if (!opened.success) {
			return fail(opened.error);
		}

		const database = opened.data;
		try {
			const db = drizzle(database);
			const worldStateRecords = parsedSnapshot.data.worldState.map((flag) =>
				worldStateEntryInsertSchema.parse({
					key: flag.key,
					valueJson: JSON.stringify(flag.value),
					updatedAt: flag.updatedAt,
				}),
			);
			const metadataRecord = worldStateEntryInsertSchema.parse({
				key: SAVE_METADATA_KEY,
				valueJson: JSON.stringify({
					version: parsedSnapshot.data.version,
					savedAt: parsedSnapshot.data.savedAt,
				}),
				updatedAt: parsedSnapshot.data.savedAt,
			});

			db.transaction((tx) => {
				tx.delete(characters).run();
				tx.delete(worldStateEntries).run();
				if (parsedSnapshot.data.characters.length > 0) {
					tx.insert(characters).values(parsedSnapshot.data.characters).run();
				}
				tx.insert(worldStateEntries)
					.values([...worldStateRecords, metadataRecord])
					.run();
			});

			const exported = this.exportDatabase(database);
			if (!exported.success) {
				database.close();
				return fail(exported.error);
			}

			const written = await this.input.storage.writeDatabaseFile(exported.data);
			if (!written.success) {
				database.close();
				return fail(written.error);
			}

			database.close();
			return ok({
				saveId: "primary",
				version: 1,
				savedAt: parsedSnapshot.data.savedAt,
				characterCount: parsedSnapshot.data.characters.length,
				worldStateCount: parsedSnapshot.data.worldState.length,
			});
		} catch (error: unknown) {
			database.close();
			return fail({
				code: "SQLITE_SNAPSHOT_WRITE_FAILED",
				message: "SQLite snapshot transaction could not be persisted.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async loadSnapshot(): Promise<
		Result<LoadedSessionState, SaveSnapshotFailure>
	> {
		const opened = await this.openExistingDatabase();
		if (!opened.success) {
			return fail(opened.error);
		}

		const database = opened.data;
		try {
			const db = drizzle(database);
			const metadataRows = db
				.select()
				.from(worldStateEntries)
				.where(eq(worldStateEntries.key, SAVE_METADATA_KEY))
				.all();
			const metadataRow = metadataRows[0];
			if (!metadataRow) {
				database.close();
				return fail({
					code: "SAVE_NOT_FOUND",
					message: "Primary save metadata was not found.",
				});
			}

			const parsedMetadataRow =
				worldStateEntrySelectSchema.safeParse(metadataRow);
			if (!parsedMetadataRow.success) {
				database.close();
				return corruptedSnapshotFailure("metadata row failed validation");
			}

			const parsedMetadata = saveMetadataSchema.safeParse(
				JSON.parse(parsedMetadataRow.data.valueJson) as unknown,
			);
			if (!parsedMetadata.success) {
				database.close();
				return corruptedSnapshotFailure("metadata payload failed validation");
			}

			const parsedCharacters = [];
			for (const row of db
				.select()
				.from(characters)
				.orderBy(asc(characters.id))
				.all()) {
				const parsed = characterSelectSchema.safeParse(row);
				if (!parsed.success) {
					database.close();
					return corruptedSnapshotFailure("character row failed validation");
				}
				parsedCharacters.push(parsed.data);
			}

			const parsedWorldState = [];
			for (const row of db
				.select()
				.from(worldStateEntries)
				.orderBy(asc(worldStateEntries.key))
				.all()) {
				if (row.key === SAVE_METADATA_KEY) {
					continue;
				}

				const parsedRow = worldStateEntrySelectSchema.safeParse(row);
				if (!parsedRow.success) {
					database.close();
					return corruptedSnapshotFailure("world-state row failed validation");
				}

				parsedWorldState.push({
					key: parsedRow.data.key,
					value: JSON.parse(parsedRow.data.valueJson) as unknown,
					updatedAt: parsedRow.data.updatedAt,
				});
			}

			const parsedLoaded = loadedSessionStateSchema.parse({
				version: parsedMetadata.data.version,
				savedAt: parsedMetadata.data.savedAt,
				characters: parsedCharacters,
				worldState: parsedWorldState,
			});
			database.close();
			return ok(parsedLoaded);
		} catch (error: unknown) {
			database.close();
			return corruptedSnapshotFailure(stringifyCause(error));
		}
	}

	private async openExistingDatabase(): Promise<
		Result<SqliteDatabase, SaveSnapshotFailure>
	> {
		const storedFile = await this.input.storage.readDatabaseFile();
		if (!storedFile.success) {
			return fail(storedFile.error);
		}
		if (storedFile.data === null) {
			return fail({
				code: "DATABASE_NOT_INITIALIZED",
				message: "SQLite database file is not initialized yet.",
			});
		}

		const sqlite = await this.createSqliteModule();
		if (!sqlite.success) {
			return fail(sqlite.error);
		}

		try {
			const database = new sqlite.data.Database(storedFile.data);
			const readable = this.validateOpenedDatabase(database);
			if (!readable.success) {
				database.close();
				return fail(readable.error);
			}

			return ok(database);
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_DATABASE_FILE",
				message: "Stored SQLite database file could not be opened.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	private async createSqliteModule(): Promise<
		Result<Awaited<ReturnType<SqliteWasmFactory>>, SaveSnapshotFailure>
	> {
		try {
			return ok(await this.input.createSqlite());
		} catch (error: unknown) {
			return fail({
				code: "SQLITE_WASM_INIT_FAILED",
				message: "SQLite WASM module could not be initialized.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	private exportDatabase(
		database: SqliteDatabase,
	): Result<Uint8Array, SaveSnapshotFailure> {
		try {
			return ok(database.export());
		} catch (error: unknown) {
			return fail({
				code: "SQLITE_EXPORT_FAILED",
				message: "SQLite database could not be exported to bytes.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	private validateOpenedDatabase(
		database: SqliteDatabase,
	): Result<void, SaveSnapshotFailure> {
		try {
			const result = database.exec(
				"SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;",
			);
			const tableNames = new Set(
				(result[0]?.values ?? []).map((row) => String(row[0])),
			);
			if (
				!tableNames.has("characters") ||
				!tableNames.has("world_state_entries")
			) {
				return fail({
					code: "CORRUPTED_DATABASE_FILE",
					message: "Stored SQLite database is missing required tables.",
				});
			}

			return ok(undefined);
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_DATABASE_FILE",
				message: "Stored SQLite database file failed validation.",
				details: { cause: stringifyCause(error) },
			});
		}
	}
}

function corruptedSnapshotFailure(
	cause: string,
): Result<never, SaveSnapshotFailure> {
	return fail({
		code: "CORRUPTED_SAVE_SNAPSHOT",
		message: "Loaded SQLite snapshot failed validation.",
		details: { cause },
	});
}

function stringifyCause(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
