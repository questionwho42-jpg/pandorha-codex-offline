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

const expectedStandingColumns = [
	{ name: "faction_id", type: "TEXT", notNull: true, primaryKey: true },
	{ name: "fame_level", type: "INTEGER", notNull: true, primaryKey: false },
	{ name: "fame_xp", type: "INTEGER", notNull: true, primaryKey: false },
	{ name: "infamy_level", type: "INTEGER", notNull: true, primaryKey: false },
	{ name: "blood_debt", type: "INTEGER", notNull: true, primaryKey: false },
	{ name: "favor_points", type: "INTEGER", notNull: true, primaryKey: false },
	{
		name: "intrigue_points",
		type: "INTEGER",
		notNull: true,
		primaryKey: false,
	},
	{ name: "status", type: "TEXT", notNull: true, primaryKey: false },
];

describe("Faction migration", () => {
	it("creates the faction standing table from versioned SQL migrations", async () => {
		const migrationSql = loadMigrationSql();
		expect(migrationSql).toContain("CREATE TABLE `faction_standings`");

		const SQL = await initSqlJs({
			locateFile: () => sqlJsWasmPath,
		});
		const database = new SQL.Database();

		try {
			database.run(migrationSql);
			const [tableInfo] = database.exec(
				"PRAGMA table_info('faction_standings');",
			);
			const columns = tableColumnsFrom(tableInfo?.values ?? []);
			const columnsByName = new Map(
				columns.map((column) => [column.name, column]),
			);

			expect(columns.map((column) => column.name)).toEqual(
				expectedStandingColumns.map((column) => column.name),
			);

			for (const expectedColumn of expectedStandingColumns) {
				expect(columnsByName.get(expectedColumn.name)).toEqual(expectedColumn);
			}
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

function tableColumnsFrom(rows: SqlValue[][]): TableColumn[] {
	return rows.map((row) => ({
		name: String(row[1]),
		type: String(row[2]).toUpperCase(),
		notNull: Number(row[3]) === 1,
		primaryKey: Number(row[5]) === 1,
	}));
}
