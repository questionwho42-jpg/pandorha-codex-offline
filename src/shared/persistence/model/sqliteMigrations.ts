import characterMigrationSql from "../../../../drizzle/0000_smiling_banshee.sql?raw";
import worldStateMigrationSql from "../../../../drizzle/0001_crazy_wallop.sql?raw";
import clockMigrationSql from "../../../../drizzle/0002_true_cable.sql?raw";
import campSessionMigrationSql from "../../../../drizzle/0003_public_tyger_tiger.sql?raw";
import factionMigrationSql from "../../../../drizzle/0004_abnormal_luke_cage.sql?raw";
import socialEncounterMigrationSql from "../../../../drizzle/0005_perfect_sinister_six.sql?raw";
import npcRelationshipMigrationSql from "../../../../drizzle/0006_bent_havok.sql?raw";
import inventoryEventMigrationSql from "../../../../drizzle/0007_aromatic_moonstone.sql?raw";
import equipmentLoadoutEventMigrationSql from "../../../../drizzle/0008_equipment_loadout_events.sql?raw";
import characterTraitSelectionMigrationSql from "../../../../drizzle/0009_character_trait_selections.sql?raw";
import equipmentDurabilityEventMigrationSql from "../../../../drizzle/0010_equipment_durability_events.sql?raw";
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
		id: "0002_true_cable",
		sql: clockMigrationSql,
	},
	{
		id: "0003_public_tyger_tiger",
		sql: campSessionMigrationSql,
	},
	{
		id: "0004_abnormal_luke_cage",
		sql: factionMigrationSql,
	},
	{
		id: "0005_perfect_sinister_six",
		sql: socialEncounterMigrationSql,
	},
	{
		id: "0006_bent_havok",
		sql: npcRelationshipMigrationSql,
	},
	{
		id: "0007_aromatic_moonstone",
		sql: inventoryEventMigrationSql,
	},
	{
		id: "0008_equipment_loadout_events",
		sql: equipmentLoadoutEventMigrationSql,
	},
	{
		id: "0009_character_trait_selections",
		sql: characterTraitSelectionMigrationSql,
	},
	{
		id: "0010_equipment_durability_events",
		sql: equipmentDurabilityEventMigrationSql,
	},
];
