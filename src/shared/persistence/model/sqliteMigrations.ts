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
import experiencePointsMigrationSql from "../../../../drizzle/0013_lush_mathemanic.sql?raw";
import investigationMigrationSql from "../../../../drizzle/0014_slippery_proemial_gods.sql?raw";
import regionalCampMigrationSql from "../../../../drizzle/0015_gray_texas_twister.sql?raw";
import mercenaryMigrationSql from "../../../../drizzle/0016_spotty_shiver_man.sql?raw";
import espionageMigrationSql from "../../../../drizzle/0017_dark_richard_fisk.sql?raw";
import dungeonMigrationSql from "../../../../drizzle/0018_condemned_menace.sql?raw";
import siegeMigrationSql from "../../../../drizzle/0019_tan_roughhouse.sql?raw";
import loreMigrationSql from "../../../../drizzle/0020_abnormal_the_spike.sql?raw";
import statusEffectsDurationMigrationSql from "../../../../drizzle/0021_status_effects_duration.sql?raw";
import statusEffectsMissingColumnsMigrationSql from "../../../../drizzle/0022_status_effects_missing_columns.sql?raw";
import durabilityMigrationSql from "../../../../drizzle/0023_add_crafted_item_durability_state.sql?raw";
import socialCombatMigrationSql from "../../../../drizzle/0024_add_dialogue_state_social_combat_fields.sql?raw";
import characterTensionMigrationSql from "../../../../drizzle/0025_add_character_tension_meter.sql?raw";
import patronageActiveBonusMigrationSql from "../../../../drizzle/0025_tan_greymalkin.sql?raw";
import combatLoopMigrationSql from "../../../../drizzle/0026_add_tactical_combat_loop.sql?raw";
import colossalViolationsMigrationSql from "../../../../drizzle/0026_colossal_violations.sql?raw";
import catalogsMigrationSql from "../../../../drizzle/0027_absurd_blink.sql?raw";
import questObjectivesMigrationSql from "../../../../drizzle/0027_melted_norrin_radd.sql?raw";
import foreignKeyIndexesMigrationSql from "../../../../drizzle/0028_add_foreign_key_indexes.sql?raw";
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
	{
		id: "0013_lush_mathemanic",
		sql: experiencePointsMigrationSql,
	},
	{
		id: "0014_slippery_proemial_gods",
		sql: investigationMigrationSql,
	},
	{
		id: "0015_gray_texas_twister",
		sql: regionalCampMigrationSql,
	},
	{
		id: "0016_spotty_shiver_man",
		sql: mercenaryMigrationSql,
	},
	{
		id: "0017_dark_richard_fisk",
		sql: espionageMigrationSql,
	},
	{
		id: "0018_condemned_menace",
		sql: dungeonMigrationSql,
	},
	{
		id: "0019_tan_roughhouse",
		sql: siegeMigrationSql,
	},
	{
		id: "0020_abnormal_the_spike",
		sql: loreMigrationSql,
	},
	{
		id: "0021_status_effects_duration",
		sql: statusEffectsDurationMigrationSql,
	},
	{
		id: "0022_status_effects_missing_columns",
		sql: statusEffectsMissingColumnsMigrationSql,
	},
	{
		id: "0023_add_crafted_item_durability_state",
		sql: durabilityMigrationSql,
	},
	{
		id: "0024_add_dialogue_state_social_combat_fields",
		sql: socialCombatMigrationSql,
	},
	{
		id: "0025_add_character_tension_meter",
		sql: characterTensionMigrationSql,
	},
	{
		id: "0026_add_tactical_combat_loop",
		sql: combatLoopMigrationSql,
	},
	{
		id: "0027_melted_norrin_radd",
		sql: questObjectivesMigrationSql,
	},
	{
		id: "0028_add_foreign_key_indexes",
		sql: foreignKeyIndexesMigrationSql,
	},
	{
		id: "0025_tan_greymalkin",
		sql: patronageActiveBonusMigrationSql,
	},
	{
		id: "0026_colossal_violations",
		sql: colossalViolationsMigrationSql,
	},
	{
		id: "0027_absurd_blink",
		sql: catalogsMigrationSql,
	},
];
