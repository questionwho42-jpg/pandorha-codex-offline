import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs, { type Database } from "sql.js";
import { describe, expect, it } from "vitest";

type SqlValue = string | number | Uint8Array | null;

const projectRoot = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
	"..",
);
const migrationsRoot = join(projectRoot, "drizzle");
const sqlJsWasmPath = join(
	projectRoot,
	"node_modules",
	"sql.js",
	"dist",
	"sql-wasm.wasm",
);

describe("Camp session migration", () => {
	it("creates camp session and assignment tables from versioned migrations", async () => {
		const migrationSql = loadMigrationSql();
		expect(migrationSql).toContain("CREATE TABLE `camp_sessions`");
		expect(migrationSql).toContain("CREATE TABLE `camp_assignments`");

		const SQL = await initSqlJs({
			locateFile: () => sqlJsWasmPath,
		});
		const database = new SQL.Database();

		try {
			database.run(migrationSql);

			expect(readColumnNames(database, "camp_sessions")).toEqual([
				"id",
				"current_hour",
				"danger",
				"status",
				"fortify_clock_id",
				"created_at",
				"updated_at",
			]);
			expect(readColumnNames(database, "camp_assignments")).toEqual([
				"id",
				"session_id",
				"character_id",
				"activity_id",
				"hour",
				"created_at",
			]);
		} finally {
			database.close();
		}
	});
});

function loadMigrationSql(): string {
	return findSqlFiles(migrationsRoot)
		.map((filePath) => readFileSync(filePath, "utf8"))
		.join("\n");
}

function findSqlFiles(directory: string): string[] {
	if (!existsSync(directory)) {
		return [];
	}

	return readdirSync(directory, { withFileTypes: true })
		.flatMap((entry) => {
			const entryPath = join(directory, entry.name);

			if (entry.isDirectory()) {
				return findSqlFiles(entryPath);
			}

			return entry.isFile() && entry.name.endsWith(".sql") ? [entryPath] : [];
		})
		.sort();
}

function readColumnNames(
	database: Database,
	tableName: string,
): readonly string[] {
	const [tableInfo] = database.exec(`PRAGMA table_info('${tableName}');`);
	return (tableInfo?.values ?? []).map((row: SqlValue[]) => String(row[1]));
}
