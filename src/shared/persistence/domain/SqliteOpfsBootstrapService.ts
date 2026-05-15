import { drizzle } from "drizzle-orm/sql-js";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { PANDORHA_SQLITE_MIGRATIONS } from "../model/sqliteMigrations";
import { sqliteBootstrapInputSchema } from "../model/sqliteOpfsSchemas";
import type {
	DatabaseFileStorage,
	SqliteBootstrapFailure,
	SqliteBootstrapResult,
	SqliteDatabase,
	SqliteMigration,
	SqliteWasmFactory,
} from "../model/sqliteOpfsTypes";

const MIGRATION_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS _pandorha_migrations (
	id TEXT PRIMARY KEY NOT NULL,
	applied_at TEXT NOT NULL
);
`;

interface SqliteOpfsBootstrapServiceInput {
	readonly storage: DatabaseFileStorage;
	readonly createSqlite: SqliteWasmFactory;
	readonly migrations?: readonly SqliteMigration[];
	readonly bindDrizzle?: (database: SqliteDatabase) => void;
}

/**
 * @description Initializes the local SQLite WASM database file and applies versioned Drizzle SQL migrations. It does not expose save/load UI or mutate Svelte state.
 * @rule docs/architecture/sdd.md - save game storage uses OPFS from a dedicated Worker.
 * @rule docs/architecture/worker_rpc_spec.md - database initialization happens through an explicit Worker handshake.
 */
export class SqliteOpfsBootstrapService {
	private readonly migrations: readonly SqliteMigration[];
	private readonly storage: DatabaseFileStorage;
	private readonly createSqlite: SqliteWasmFactory;
	private readonly bindDrizzle: (database: SqliteDatabase) => void;

	public constructor(input: SqliteOpfsBootstrapServiceInput) {
		this.storage = input.storage;
		this.createSqlite = input.createSqlite;
		this.migrations = input.migrations ?? PANDORHA_SQLITE_MIGRATIONS;
		this.bindDrizzle = input.bindDrizzle ?? ((database) => drizzle(database));
	}

	public async initializeDatabase(
		input: unknown,
	): Promise<Result<SqliteBootstrapResult, SqliteBootstrapFailure>> {
		const parsedInput = sqliteBootstrapInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return fail({
				code: "INVALID_SQLITE_BOOTSTRAP_INPUT",
				message: "SQLite bootstrap input failed validation.",
				details: {
					issues: parsedInput.error.issues.map((issue) => issue.message),
				},
			});
		}

		const storedFile = await this.storage.readDatabaseFile();
		if (!storedFile.success) {
			return fail(storedFile.error);
		}

		const sqlite = await this.createSqliteModule();
		if (!sqlite.success) {
			return fail(sqlite.error);
		}

		const database = this.openDatabase(sqlite.data, storedFile.data);
		if (!database.success) {
			return fail(database.error);
		}

		try {
			const readable = this.validateOpenedDatabase(
				database.data,
				storedFile.data !== null,
			);
			if (!readable.success) {
				database.data.close();
				return fail(readable.error);
			}

			this.bindDrizzle(database.data);
			const appliedMigrationIds = this.applyPendingMigrations(
				database.data,
				parsedInput.data.requestedAt,
			);
			const shouldWrite =
				storedFile.data === null || appliedMigrationIds.length > 0;
			if (shouldWrite) {
				const exported = this.exportDatabase(database.data);
				if (!exported.success) {
					database.data.close();
					return fail(exported.error);
				}

				const written = await this.storage.writeDatabaseFile(exported.data);
				if (!written.success) {
					database.data.close();
					return fail(written.error);
				}
			}

			const result = ok({
				initialized: true as const,
				loadedExistingDatabase: storedFile.data !== null,
				appliedMigrationIds,
				tableNames: listUserTableNames(database.data),
			});
			database.data.close();
			return result;
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "SQLITE_MIGRATION_FAILED",
				message: "SQLite migrations could not be applied.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	private async createSqliteModule(): Promise<
		Result<Awaited<ReturnType<SqliteWasmFactory>>, SqliteBootstrapFailure>
	> {
		try {
			return ok(await this.createSqlite());
		} catch (error: unknown) {
			return fail({
				code: "SQLITE_WASM_INIT_FAILED",
				message: "SQLite WASM module could not be initialized.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	private openDatabase(
		sqlite: Awaited<ReturnType<SqliteWasmFactory>>,
		bytes: Uint8Array | null,
	): Result<SqliteDatabase, SqliteBootstrapFailure> {
		try {
			return ok(new sqlite.Database(bytes));
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_DATABASE_FILE",
				message: "Stored SQLite database file could not be opened.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	private validateOpenedDatabase(
		database: SqliteDatabase,
		loadedExistingDatabase: boolean,
	): Result<void, SqliteBootstrapFailure> {
		if (!loadedExistingDatabase) {
			return ok(undefined);
		}

		try {
			database.exec("PRAGMA schema_version;");
			return ok(undefined);
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_DATABASE_FILE",
				message: "Stored SQLite database file failed validation.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	private applyPendingMigrations(
		database: SqliteDatabase,
		appliedAt: string,
	): readonly string[] {
		database.run(MIGRATION_TABLE_SQL);
		const applied = readAppliedMigrationIds(database);
		const appliedNow: string[] = [];

		for (const migration of this.migrations) {
			if (applied.has(migration.id)) {
				continue;
			}

			database.run(migration.sql);
			database.run(
				"INSERT INTO _pandorha_migrations (id, applied_at) VALUES (?, ?);",
				[migration.id, appliedAt],
			);
			appliedNow.push(migration.id);
		}

		return appliedNow;
	}

	private exportDatabase(
		database: SqliteDatabase,
	): Result<Uint8Array, SqliteBootstrapFailure> {
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
}

function readAppliedMigrationIds(database: SqliteDatabase): Set<string> {
	const result = database.exec(
		"SELECT id FROM _pandorha_migrations ORDER BY id;",
	);
	const rows = result[0]?.values ?? [];
	return new Set(rows.map((row) => String(row[0])));
}

function listUserTableNames(database: SqliteDatabase): readonly string[] {
	const result = database.exec(
		"SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name;",
	);
	const rows = result[0]?.values ?? [];
	return rows.map((row) => String(row[0]));
}

function stringifyCause(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
