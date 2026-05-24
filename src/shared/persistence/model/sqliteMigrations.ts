import characterMigrationSql from "../../../../drizzle/0000_smiling_banshee.sql?raw";
import worldStateMigrationSql from "../../../../drizzle/0001_crazy_wallop.sql?raw";
import socialMigrationSql from "../../../../drizzle/0002_remarkable_beast.sql?raw";
import statusEffectsMigrationSql from "../../../../drizzle/0003_tricky_lila_cheney.sql?raw";
import craftingMigrationSql from "../../../../drizzle/0004_sturdy_omega_sentinel.sql?raw";
import inventoryMigrationSql from "../../../../drizzle/0005_brainy_plazm.sql?raw";
import trapsMigrationSql from "../../../../drizzle/0006_noisy_ultragirl.sql?raw";
import bastionMigrationSql from "../../../../drizzle/0007_material_silver_surfer.sql?raw";
import clocksMigrationSql from "../../../../drizzle/0008_clear_magma.sql?raw";
import dialogueMigrationSql from "../../../../drizzle/0009_special_sentinels.sql?raw";
import questMigrationSql from "../../../../drizzle/0010_windy_wither.sql?raw";
import synergyMigrationSql from "../../../../drizzle/0011_petite_thor_girl.sql?raw";
import factionsCompanionsMigrationSql from "../../../../drizzle/0012_reflective_sasquatch.sql?raw";
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
	{
		id: "0002_remarkable_beast",
		sql: socialMigrationSql,
	},
	{
		id: "0003_tricky_lila_cheney",
		sql: statusEffectsMigrationSql,
	},
	{
		id: "0004_sturdy_omega_sentinel",
		sql: craftingMigrationSql,
	},
	{
		id: "0005_brainy_plazm",
		sql: inventoryMigrationSql,
	},
	{
		id: "0006_noisy_ultragirl",
		sql: trapsMigrationSql,
	},
	{
		id: "0007_material_silver_surfer",
		sql: bastionMigrationSql,
	},
	{
		id: "0008_clear_magma",
		sql: clocksMigrationSql,
	},
	{
		id: "0009_special_sentinels",
		sql: dialogueMigrationSql,
	},
	{
		id: "0010_windy_wither",
		sql: questMigrationSql,
	},
	{
		id: "0011_petite_thor_girl",
		sql: synergyMigrationSql,
	},
	{
		id: "0012_reflective_sasquatch",
		sql: factionsCompanionsMigrationSql,
	},
];
