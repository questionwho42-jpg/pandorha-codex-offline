import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs from "sql.js";
import { describe, expect, it } from "vitest";

type SqlValue = string | number | Uint8Array | null;

type TableColumn = {
	name: string;
	type: string;
	notNull: boolean;
	primaryKey: boolean;
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

const expectedColumns = [
	{ name: "id", type: "TEXT", notNull: true, primaryKey: true },
	{ name: "name", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "concept", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "ancestry_id", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "class_id", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "background_id", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "level", type: "INTEGER", notNull: true, primaryKey: false },
	{ name: "physical", type: "INTEGER", notNull: true, primaryKey: false },
	{ name: "mental", type: "INTEGER", notNull: true, primaryKey: false },
	{ name: "social", type: "INTEGER", notNull: true, primaryKey: false },
	{ name: "conflict", type: "INTEGER", notNull: true, primaryKey: false },
	{ name: "interaction", type: "INTEGER", notNull: true, primaryKey: false },
	{ name: "resistance", type: "INTEGER", notNull: true, primaryKey: false },
	{ name: "created_at", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "updated_at", type: "TEXT", notNull: true, primaryKey: false },
	{
		name: "experience_points",
		type: "INTEGER",
		notNull: true,
		primaryKey: false,
	},
];

const expectedStatusEffectsColumns = [
	{ name: "id", type: "TEXT", notNull: true, primaryKey: true },
	{ name: "character_id", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "type", type: "TEXT", notNull: true, primaryKey: false },
	{ name: "created_at", type: "TEXT", notNull: true, primaryKey: false },
];

const findSqlFiles = (directory: string): string[] => {
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
};

const loadMigrationSql = (): string => {
	return findSqlFiles(migrationsRoot)
		.map((filePath) => readFileSync(filePath, "utf8"))
		.join("\n");
};

const tableColumnsFrom = (rows: SqlValue[][]): TableColumn[] => {
	return rows.map((row) => ({
		name: String(row[1]),
		type: String(row[2]).toUpperCase(),
		notNull: Number(row[3]) === 1,
		primaryKey: Number(row[5]) === 1,
	}));
};

describe("Character migration", () => {
	it("creates the characters table from versioned SQL migrations", async () => {
		const migrationSql = loadMigrationSql();
		expect(migrationSql).toContain("CREATE TABLE `characters`");

		const SQL = await initSqlJs({
			locateFile: () => sqlJsWasmPath,
		});
		const database = new SQL.Database();

		try {
			database.run(migrationSql);
			const [tableInfo] = database.exec("PRAGMA table_info('characters');");
			const columns = tableColumnsFrom(tableInfo?.values ?? []);
			const columnsByName = new Map(
				columns.map((column) => [column.name, column]),
			);

			expect(columns.map((column) => column.name)).toEqual(
				expectedColumns.map((column) => column.name),
			);

			for (const expectedColumn of expectedColumns) {
				expect(columnsByName.get(expectedColumn.name)).toEqual(expectedColumn);
			}
		} finally {
			database.close();
		}
	});

	it("creates the character_status_effects table from versioned SQL migrations", async () => {
		const migrationSql = loadMigrationSql();
		expect(migrationSql).toContain("CREATE TABLE `character_status_effects`");

		const SQL = await initSqlJs({
			locateFile: () => sqlJsWasmPath,
		});
		const database = new SQL.Database();

		try {
			database.run(migrationSql);
			const [tableInfo] = database.exec(
				"PRAGMA table_info('character_status_effects');",
			);
			const columns = tableColumnsFrom(tableInfo?.values ?? []);
			const columnsByName = new Map(
				columns.map((column) => [column.name, column]),
			);

			expect(columns.map((column) => column.name)).toEqual(
				expectedStatusEffectsColumns.map((column) => column.name),
			);

			for (const expectedColumn of expectedStatusEffectsColumns) {
				expect(columnsByName.get(expectedColumn.name)).toEqual(expectedColumn);
			}
		} finally {
			database.close();
		}
	});
});
