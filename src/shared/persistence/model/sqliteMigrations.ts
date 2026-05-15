import characterMigrationSql from "../../../../drizzle/0000_smiling_banshee.sql?raw";
import worldStateMigrationSql from "../../../../drizzle/0001_crazy_wallop.sql?raw";
import type { SqliteMigration } from "./sqliteOpfsTypes";

export const PANDORHA_SQLITE_MIGRATIONS: readonly SqliteMigration[] = [
	{
		id: "0000_smiling_banshee",
		sql: characterMigrationSql,
	},
	{
		id: "0001_crazy_wallop",
		sql: worldStateMigrationSql,
	},
];
