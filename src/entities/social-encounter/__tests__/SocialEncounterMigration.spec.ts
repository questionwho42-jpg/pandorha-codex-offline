import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs, { type SqlJsStatic } from "sql.js";
import { describe, expect, it } from "vitest";

type SqlValue = string | number | Uint8Array | null;

type TableColumn = {
	readonly name: string;
	readonly type: string;
	readonly notNull: boolean;
	readonly primaryKey: boolean;
};

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

const expectedEncounterColumns = [
	{ name: "id", type: "TEXT", notNull: true, primaryKey: true },
	{ name: "npc_id", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "actor_id", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "status", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "attitude", type: "TEXT", notNull: true, primaryKey: false },
	{
		name: "mental_hp_current",
		type: "INTEGER",
		notNull: true,
		primaryKey: false,
	},
	{ name: "mental_hp_max", type: "INTEGER", notNull: true, primaryKey: false },
	{
		name: "patience_current",
		type: "INTEGER",
		notNull: true,
		primaryKey: false,
	},
	{ name: "patience_max", type: "INTEGER", notNull: true, primaryKey: false },
	{
		name: "persuasion_progress",
		type: "INTEGER",
		notNull: true,
		primaryKey: false,
	},
	{
		name: "persuasion_target",
		type: "INTEGER",
		notNull: true,
		primaryKey: false,
	},
	{ name: "created_at", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "updated_at", type: "TEXT", notNull: true, primaryKey: false },
];

const expectedEventColumns = [
	{ name: "id", type: "TEXT", notNull: true, primaryKey: true },
	{ name: "encounter_id", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "sequence", type: "INTEGER", notNull: true, primaryKey: false },
	{ name: "type", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "message", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "created_at", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "command_id", type: "TEXT", notNull: false, primaryKey: false },
];

describe("Social encounter migration", () => {
	it("creates social encounter tables from versioned SQL migrations", async () => {
		const migrationSql = loadMigrationSql();
		expect(migrationSql).toContain("CREATE TABLE `social_encounters`");
		expect(migrationSql).toContain("CREATE TABLE `social_encounter_events`");

		const SQL = await initSqlJs({
			locateFile: () => sqlJsWasmPath,
		});
		const database = new SQL.Database();

		try {
			database.run(migrationSql);
			expectColumns(database, "social_encounters", expectedEncounterColumns);
			expectColumns(database, "social_encounter_events", expectedEventColumns);
		} finally {
			database.close();
		}
	});
});

function expectColumns(
	database: SqlJsStatic["Database"]["prototype"],
	tableName: string,
	expectedColumns: readonly TableColumn[],
): void {
	const [tableInfo] = database.exec(`PRAGMA table_info('${tableName}');`);
	const columns = tableColumnsFrom(tableInfo?.values ?? []);
	const columnsByName = new Map(columns.map((column) => [column.name, column]));

	expect(columns.map((column) => column.name)).toEqual(
		expectedColumns.map((column) => column.name),
	);

	for (const expectedColumn of expectedColumns) {
		expect(columnsByName.get(expectedColumn.name)).toEqual(expectedColumn);
	}
}

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

function tableColumnsFrom(rows: SqlValue[][]): TableColumn[] {
	return rows.map((row) => ({
		name: String(row[1]),
		type: String(row[2]).toUpperCase(),
		notNull: Number(row[3]) === 1,
		primaryKey: Number(row[5]) === 1,
	}));
}
