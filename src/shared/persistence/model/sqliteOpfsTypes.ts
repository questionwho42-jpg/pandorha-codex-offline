import type { Database, SqlJsStatic } from "sql.js";
import type { Result } from "$lib/shared/lib/result";

export interface SqliteMigration {
	readonly id: string;
	readonly sql: string;
}

export interface DatabaseFileStorage {
	readDatabaseFile(): Promise<Result<Uint8Array | null, DatabaseFileFailure>>;
	writeDatabaseFile(
		bytes: Uint8Array,
	): Promise<Result<void, DatabaseFileFailure>>;
}

export interface DatabaseFileFailure {
	readonly code:
		| "DATABASE_FILE_READ_FAILED"
		| "DATABASE_FILE_WRITE_FAILED"
		| "OPFS_UNAVAILABLE";
	readonly message: string;
	readonly details?: unknown;
}

export type SqliteWasmFactory = () => Promise<SqlJsStatic>;

export interface SqliteBootstrapInput {
	readonly requestedAt: string;
}

export interface SqliteBootstrapResult {
	readonly initialized: true;
	readonly loadedExistingDatabase: boolean;
	readonly appliedMigrationIds: readonly string[];
	readonly tableNames: readonly string[];
}

export type SqliteBootstrapFailureCode =
	| "INVALID_SQLITE_BOOTSTRAP_INPUT"
	| DatabaseFileFailure["code"]
	| "SQLITE_WASM_INIT_FAILED"
	| "CORRUPTED_DATABASE_FILE"
	| "SQLITE_MIGRATION_FAILED"
	| "SQLITE_EXPORT_FAILED"
	| "CHARACTER_NOT_FOUND"
	| "INVALID_CHARACTER_LEVEL"
	| "INVALID_TIER_CAP"
	| "INSUFFICIENT_EXPERIENCE_POINTS"
	| "INVALID_LEVEL_UP_DISTRIBUTION"
	| "SPELL_NOT_FOUND"
	| "INSUFFICIENT_ETHER"
	| "CLOCK_NOT_FOUND"
	| "INSUFFICIENT_RECESS_DAYS";

export interface SqliteBootstrapFailure {
	readonly code: SqliteBootstrapFailureCode;
	readonly message: string;
	readonly details?: unknown;
}

export type SqliteDatabase = Database;
