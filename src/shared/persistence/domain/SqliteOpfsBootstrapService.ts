/* istanbul ignore file */

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/sql-js";
import { DrizzleAncestryRepository } from "$lib/entities/ancestry/infrastructure/DrizzleAncestryRepository";
import { DrizzleAncestryTraitRepository } from "$lib/entities/ancestry/infrastructure/DrizzleAncestryTraitRepository";
import { OFFICIAL_ANCESTRIES } from "$lib/entities/ancestry/model/ancestryCatalog";
import {
	ancestries,
	ancestryTraitLinks,
	ancestryTraits,
} from "$lib/entities/ancestry/model/ancestrySchema";
import {
	OFFICIAL_ANCESTRY_TRAIT_LINKS,
	OFFICIAL_ANCESTRY_TRAITS,
} from "$lib/entities/ancestry/model/ancestryTraitCatalog";
import { DrizzleBackgroundRepository } from "$lib/entities/background/infrastructure/DrizzleBackgroundRepository";
import { OFFICIAL_BACKGROUNDS } from "$lib/entities/background/model/backgroundCatalog";
import { backgrounds } from "$lib/entities/background/model/backgroundSchema";
import { DrizzleBastionRepository } from "$lib/entities/bastion/infrastructure/DrizzleBastionRepository";
import {
	bastionModules,
	bastions,
} from "$lib/entities/bastion/model/bastionSchema";
import { DrizzleCampRepository } from "$lib/entities/camp/infrastructure/DrizzleCampRepository";
import { campaignCampSessions } from "$lib/entities/camp/model/campSchema";
import { campaignEventsHistory } from "$lib/entities/campaign";
import { DrizzleCharacterRepository } from "$lib/entities/character/infrastructure/DrizzleCharacterRepository";
import {
	canCharacterLevelUp,
	getCharacterTierForLevel,
	getXpRequiredForLevel,
} from "$lib/entities/character/model/characterRules";
import {
	characters,
	type LevelUpInput,
	type NewCharacterStatusEffectRecord,
} from "$lib/entities/character/model/characterSchema";
import { DrizzleCharacterClassRepository } from "$lib/entities/character-class/infrastructure/DrizzleCharacterClassRepository";
import { OFFICIAL_CHARACTER_CLASSES } from "$lib/entities/character-class/model/characterClassCatalog";
import { characterClasses } from "$lib/entities/character-class/model/characterClassSchema";
import { DrizzleClockRepository } from "$lib/entities/clocks/infrastructure/DrizzleClockRepository";
import { progressClocks } from "$lib/entities/clocks/model/clockSchema";
import { DrizzleCombatRepository } from "$lib/entities/combat/infrastructure/DrizzleCombatRepository";
import {
	activeSessions,
	combatEncounters,
	combatMonsters,
} from "$lib/entities/combat/model/combatSchema";
import { DrizzleCompanionRepository } from "$lib/entities/companions/infrastructure/DrizzleCompanionRepository";
import { DrizzleDialogueRepository } from "$lib/entities/dialogue/infrastructure/DrizzleDialogueRepository";
import { campaignDialogueStates } from "$lib/entities/dialogue/model/dialogueSchema";
import { DrizzleRegionalDomainRepository } from "$lib/entities/domain-regional/infrastructure/DrizzleRegionalDomainRepository";
import { campaignRegionalDomains } from "$lib/entities/domain-regional/model/regionalDomainSchema";
import { DowntimeService } from "$lib/entities/downtime/domain/DowntimeService";
import {
	campaignRecess,
	downtimeActionLogs,
} from "$lib/entities/downtime/model/downtimeSchema";
import { DrizzleDungeonRepository } from "$lib/entities/dungeon/infrastructure/DrizzleDungeonRepository";
import { CraftingService } from "$lib/entities/equipment/domain/CraftingService";
import { DrizzleCraftingRepository } from "$lib/entities/equipment/infrastructure/DrizzleCraftingRepository";
import { DrizzleEspionageRepository } from "$lib/entities/espionage/infrastructure/DrizzleEspionageRepository";
import { espionageCells } from "$lib/entities/espionage/model/espionageSchema";
import { DrizzleInvestigationRepository } from "$lib/entities/investigation/infrastructure/DrizzleInvestigationRepository";
import { campaignInvestigations } from "$lib/entities/investigation/model/investigationSchema";
import { DrizzleLoreRepository } from "$lib/entities/lore/infrastructure/DrizzleLoreRepository";
import { DrizzleMercenaryRepository } from "$lib/entities/mercenary/infrastructure/DrizzleMercenaryRepository";
import {
	mercenaryCompanies,
	mercenarySquads,
} from "$lib/entities/mercenary/model/mercenarySchema";
import { DrizzleQuestRepository } from "$lib/entities/quest/infrastructure/DrizzleQuestRepository";
import {
	campaignQuests,
	questObjectives,
} from "$lib/entities/quest/model/questSchema";
import { SiegeService } from "$lib/entities/siege/domain/SiegeService";
import { DrizzleSiegeRepository } from "$lib/entities/siege/infrastructure/DrizzleSiegeRepository";
import { campaignSiegeEvents } from "$lib/entities/siege/model/siegeSchema";
import { DrizzleFactionRepository } from "$lib/entities/social/infrastructure/DrizzleFactionRepository";
import { DrizzleSocialRepository } from "$lib/entities/social/infrastructure/DrizzleSocialRepository";
import {
	bloodDebts,
	characterReputation,
	factions,
} from "$lib/entities/social/model/socialSchema";
import { DrizzleSpellCatalogRepository } from "$lib/entities/spell/infrastructure/DrizzleSpellCatalogRepository";
import { OFFICIAL_SPELLS } from "$lib/entities/spell/model/spellCatalog";
import { spell } from "$lib/entities/spell/model/spellSchema";
import { DrizzleSynergyRepository } from "$lib/entities/synergy/infrastructure/DrizzleSynergyRepository";
import { DrizzleTrapRepository } from "$lib/entities/traps/infrastructure/DrizzleTrapRepository";
import { DrizzleWorldStateRepository } from "$lib/entities/world-state/infrastructure/DrizzleWorldStateRepository";
import { worldStateEntries } from "$lib/entities/world-state/model/worldStateSchema";
import { DiceService } from "$lib/shared/dice/domain/DiceService";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { SaveGameSnapshot } from "$lib/shared/rpc";
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
import { DrizzleDowntimeContext } from "./DrizzleDowntimeContext";

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
			this.seedCatalogsIfEmpty(database.data);
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

	public async saveGameSnapshot(
		snapshot: SaveGameSnapshot,
	): Promise<Result<void, SqliteBootstrapFailure>> {
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

			const db = drizzle(database.data);

			database.data.run("DELETE FROM characters;");

			if (snapshot.characters && snapshot.characters.length > 0) {
				const defaultCharacter = {
					concept: "Desconhecido",
					ancestryId: "humano",
					classId: "guerreiro",
					backgroundId: "plebeu",
					level: 1,
					experiencePoints: 0,
					physical: 1,
					mental: 1,
					social: 1,
					conflict: 1,
					interaction: 1,
					resistance: 1,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};

				for (const char of snapshot.characters) {
					const merged = {
						id: String(char.id),
						name: String(char.name ?? "Sem Nome"),
						concept: String(char.concept ?? defaultCharacter.concept),
						ancestryId: String(char.ancestryId ?? defaultCharacter.ancestryId),
						classId: String(char.classId ?? defaultCharacter.classId),
						backgroundId: String(
							char.backgroundId ?? defaultCharacter.backgroundId,
						),
						level:
							typeof char.level === "number"
								? char.level
								: defaultCharacter.level,
						experiencePoints:
							typeof char.experiencePoints === "number"
								? char.experiencePoints
								: defaultCharacter.experiencePoints,
						physical:
							typeof char.physical === "number"
								? char.physical
								: defaultCharacter.physical,
						mental:
							typeof char.mental === "number"
								? char.mental
								: defaultCharacter.mental,
						social:
							typeof char.social === "number"
								? char.social
								: defaultCharacter.social,
						conflict:
							typeof char.conflict === "number"
								? char.conflict
								: defaultCharacter.conflict,
						interaction:
							typeof char.interaction === "number"
								? char.interaction
								: defaultCharacter.interaction,
						resistance:
							typeof char.resistance === "number"
								? char.resistance
								: defaultCharacter.resistance,
						createdAt: String(char.createdAt ?? defaultCharacter.createdAt),
						updatedAt: String(char.updatedAt ?? defaultCharacter.updatedAt),
					};

					db.insert(characters).values(merged).run();
				}
			}

			database.data.run("DELETE FROM world_state_entries;");
			database.data.run("DELETE FROM bastions;");
			database.data.run("DELETE FROM bastion_modules;");
			database.data.run("DELETE FROM factions;");
			database.data.run("DELETE FROM character_reputation;");
			database.data.run("DELETE FROM blood_debts;");
			database.data.run("DELETE FROM progress_clocks;");
			database.data.run("DELETE FROM campaign_dialogue_states;");
			database.data.run("DELETE FROM campaign_quests;");
			database.data.run("DELETE FROM quest_objectives;");
			database.data.run("DELETE FROM campaign_investigations;");
			database.data.run("DELETE FROM campaign_regional_domains;");
			database.data.run("DELETE FROM campaign_camp_sessions;");
			database.data.run("DELETE FROM mercenary_companies;");
			database.data.run("DELETE FROM mercenary_squads;");
			database.data.run("DELETE FROM espionage_cells;");
			database.data.run("DELETE FROM campaign_events_history;");

			if (snapshot.worldState && snapshot.worldState.length > 0) {
				for (const state of snapshot.worldState) {
					const mergedState = {
						key: String(state.key),
						valueJson: JSON.stringify(state.value),
						updatedAt: String(state.updatedAt ?? new Date().toISOString()),
					};
					db.insert(worldStateEntries).values(mergedState).run();
				}
			}

			if (snapshot.bastions && snapshot.bastions.length > 0) {
				for (const b of snapshot.bastions) {
					const mappedB = {
						id: String(b.id),
						name: String(b.name),
						chassisId: String(b.chassisId),
						tier: Number(b.tier ?? 0),
						structure: Number(b.structure),
						vigilance: Number(b.vigilance),
						logistics: Number(b.logistics),
						integrityCurrent: Number(b.integrityCurrent),
						threatCurrent: Number(b.threatCurrent ?? 0),
						vaultGold: Number(b.vaultGold ?? 0),
						createdAt: String(b.createdAt),
						updatedAt: String(b.updatedAt),
					};
					db.insert(bastions).values(mappedB).run();
				}
			}

			if (snapshot.bastionModules && snapshot.bastionModules.length > 0) {
				for (const m of snapshot.bastionModules) {
					const mappedM = {
						id: String(m.id),
						bastionId: String(m.bastionId),
						moduleId: String(m.moduleId),
						tier: Number(m.tier),
						progressCurrent: Number(m.progressCurrent ?? 0),
						progressMax: Number(m.progressMax),
						isBroken:
							m.isBroken === true || m.isBroken === 1 || m.isBroken === "1",
						createdAt: String(m.createdAt),
						updatedAt: String(m.updatedAt),
					};
					db.insert(bastionModules).values(mappedM).run();
				}
			}

			if (snapshot.factions && snapshot.factions.length > 0) {
				for (const f of snapshot.factions) {
					const mappedF = {
						id: String(f.id),
						name: String(f.name),
						description: String(f.description ?? ""),
						alignment: String(f.alignment ?? "neutral"),
					};
					db.insert(factions).values(mappedF).run();
				}
			}

			if (
				snapshot.characterReputation &&
				snapshot.characterReputation.length > 0
			) {
				for (const r of snapshot.characterReputation) {
					const mappedR = {
						id: String(r.id),
						characterId: String(r.characterId),
						factionId: String(r.factionId),
						value: Number(r.value ?? 0),
						updatedAt: String(r.updatedAt ?? new Date().toISOString()),
					};
					db.insert(characterReputation).values(mappedR).run();
				}
			}

			if (snapshot.bloodDebts && snapshot.bloodDebts.length > 0) {
				for (const bd of snapshot.bloodDebts) {
					const mappedBd = {
						id: String(bd.id),
						characterId: String(bd.characterId),
						targetName: String(bd.targetName),
						debtValue: Number(bd.debtValue ?? 1),
						isPaid: bd.isPaid === true || bd.isPaid === 1 || bd.isPaid === "1",
						createdAt: String(bd.createdAt ?? new Date().toISOString()),
					};
					db.insert(bloodDebts).values(mappedBd).run();
				}
			}

			if (snapshot.progressClocks && snapshot.progressClocks.length > 0) {
				for (const c of snapshot.progressClocks) {
					const mappedC = {
						id: String(c.id),
						name: String(c.name),
						totalSegments: Number(c.totalSegments),
						filledSegments: Number(c.filledSegments ?? 0),
						isCompleted:
							c.isCompleted === true ||
							c.isCompleted === 1 ||
							c.isCompleted === "1",
						triggerEvent: c.triggerEvent ? String(c.triggerEvent) : null,
					};
					db.insert(progressClocks).values(mappedC).run();
				}
			}

			if (snapshot.dialogueStates && snapshot.dialogueStates.length > 0) {
				for (const d of snapshot.dialogueStates) {
					const mappedD = {
						id: String(d.id),
						characterId: String(d.characterId),
						npcId: String(d.npcId),
						currentConversationNodeId: String(d.currentConversationNodeId),
						dialogueTreeId: String(d.dialogueTreeId),
						historyJson: String(d.historyJson ?? "[]"),
						unlockedCluesJson: String(d.unlockedCluesJson ?? "[]"),
						updatedAt: String(d.updatedAt ?? new Date().toISOString()),
					};
					db.insert(campaignDialogueStates).values(mappedD).run();
				}
			}

			// biome-ignore lint/suspicious/noExplicitAny: response snapshot quests typing
			const snapshotQuests = (snapshot as any).quests;
			if (snapshotQuests && snapshotQuests.length > 0) {
				for (const q of snapshotQuests) {
					const mappedQ = {
						id: String(q.id),
						title: String(q.title),
						description: String(q.description),
						status: String(q.status ?? "active"),
						scope: String(q.scope ?? "campaign"),
						requirementsJson: String(q.requirementsJson ?? "[]"),
						rewardsJson: String(q.rewardsJson ?? "{}"),
						createdAt: String(q.createdAt),
						updatedAt: String(q.updatedAt),
					};
					db.insert(campaignQuests).values(mappedQ).run();
				}
			}

			// biome-ignore lint/suspicious/noExplicitAny: response snapshot questObjectives typing
			const snapshotQuestObjectives = (snapshot as any).questObjectives;
			if (snapshotQuestObjectives && snapshotQuestObjectives.length > 0) {
				for (const qo of snapshotQuestObjectives) {
					const mappedQO = {
						id: String(qo.id),
						questId: String(qo.questId),
						description: String(qo.description),
						status: String(qo.status ?? "active"),
						type: String(qo.type),
						target: String(qo.target),
						currentAmount: Number(qo.currentAmount ?? 0),
						requiredAmount: Number(qo.requiredAmount ?? 1),
						createdAt: String(qo.createdAt),
						updatedAt: String(qo.updatedAt),
					};
					db.insert(questObjectives).values(mappedQO).run();
				}
			}

			// biome-ignore lint/suspicious/noExplicitAny: response snapshot investigations typing
			const snapshotInvestigations = (snapshot as any).investigations;
			if (snapshotInvestigations && snapshotInvestigations.length > 0) {
				for (const inv of snapshotInvestigations) {
					const mappedInv = {
						id: String(inv.id),
						targetId: String(inv.targetId),
						targetName: String(inv.targetName),
						type: String(inv.type),
						tier: Number(inv.tier),
						dc: Number(inv.dc),
						successesRequired: Number(inv.successesRequired),
						successesAccumulated: Number(inv.successesAccumulated ?? 0),
						failuresMax: Number(inv.failuresMax),
						failuresAccumulated: Number(inv.failuresAccumulated ?? 0),
						status: String(inv.status ?? "active"),
						goldCostPerTest: Number(inv.goldCostPerTest ?? 0),
						createdAt: String(inv.createdAt),
						updatedAt: String(inv.updatedAt),
					};
					db.insert(campaignInvestigations).values(mappedInv).run();
				}
			}

			// biome-ignore lint/suspicious/noExplicitAny: response snapshot regionalDomains typing
			const snapshotRegionalDomains = (snapshot as any).regionalDomains;
			if (snapshotRegionalDomains && snapshotRegionalDomains.length > 0) {
				for (const rd of snapshotRegionalDomains) {
					const mappedRd = {
						id: String(rd.id),
						tier: Number(rd.tier ?? 1),
						physicalLevel: Number(
							rd.physicalLevel ?? rd.matrixPhysicalLevel ?? 0,
						),
						mentalLevel: Number(rd.mentalLevel ?? rd.matrixMentalLevel ?? 0),
						socialLevel: Number(rd.socialLevel ?? rd.matrixSocialLevel ?? 0),
						regentId: rd.regentId ? String(rd.regentId) : null,
						weeksAway: Number(rd.weeksAway ?? 0),
						createdAt: String(rd.createdAt),
						updatedAt: String(rd.updatedAt),
					};
					db.insert(campaignRegionalDomains).values(mappedRd).run();
				}
			}

			// biome-ignore lint/suspicious/noExplicitAny: response snapshot campSessions typing
			const snapshotCampSessions = (snapshot as any).campSessions;
			if (snapshotCampSessions && snapshotCampSessions.length > 0) {
				for (const cs of snapshotCampSessions) {
					const mappedCs = {
						id: String(cs.id),
						totalTime: Number(cs.totalTime),
						sleepHours: Number(cs.sleepHours),
						availableActions: Number(cs.availableActions),
						dangerCounter: Number(cs.dangerCounter),
						activeActivitiesJson: String(cs.activeActivitiesJson),
						createdAt: String(cs.createdAt),
						updatedAt: String(cs.updatedAt),
					};
					db.insert(campaignCampSessions).values(mappedCs).run();
				}
			}

			if (
				snapshot.mercenaryCompanies &&
				snapshot.mercenaryCompanies.length > 0
			) {
				for (const mc of snapshot.mercenaryCompanies) {
					const mappedMc = {
						id: String(mc.id),
						bastionId: mc.bastionId ? String(mc.bastionId) : null,
						tier: Number(mc.tier ?? 1),
						reputation: Number(mc.reputation ?? 0),
						hqName: String(mc.hqName),
						createdAt: String(mc.createdAt),
						updatedAt: String(mc.updatedAt),
					};
					db.insert(mercenaryCompanies).values(mappedMc).run();
				}
			}

			if (snapshot.mercenarySquads && snapshot.mercenarySquads.length > 0) {
				for (const ms of snapshot.mercenarySquads) {
					const mappedMs = {
						id: String(ms.id),
						companyId: String(ms.companyId),
						name: String(ms.name),
						physical: Number(ms.physical ?? 0),
						mental: Number(ms.mental ?? 0),
						social: Number(ms.social ?? 0),
						cohesionMax: Number(ms.cohesionMax ?? 10),
						cohesionCurrent: Number(ms.cohesionCurrent ?? 10),
						tagsJson: String(ms.tagsJson ?? "[]"),
						commandTactic: String(ms.commandTactic ?? "honorable"),
						status: String(ms.status ?? "available"),
						assignedMissionId: ms.assignedMissionId
							? String(ms.assignedMissionId)
							: null,
						createdAt: String(ms.createdAt),
						updatedAt: String(ms.updatedAt),
					};
					db.insert(mercenarySquads).values(mappedMs).run();
				}
			}

			// biome-ignore lint/suspicious/noExplicitAny: response snapshot espionageCells typing
			const snapshotEspionageCells = (snapshot as any).espionageCells;
			if (snapshotEspionageCells && snapshotEspionageCells.length > 0) {
				for (const ec of snapshotEspionageCells) {
					const mappedEc = {
						id: String(ec.id),
						campaignId: String(ec.campaignId),
						factionId: String(ec.factionId),
						regionId: String(ec.regionId),
						tenenteCompanionId: String(ec.tenenteCompanionId),
						specializedAxis: String(ec.specializedAxis),
						tier: Number(ec.tier ?? 1),
						isLockdown:
							ec.isLockdown === true ||
							ec.isLockdown === 1 ||
							ec.isLockdown === "1",
						lockdownWeeksRemaining: Number(ec.lockdownWeeksRemaining ?? 0),
						vigilanceHeat: Number(ec.vigilanceHeat ?? 0),
						methodOfControl: ec.methodOfControl
							? String(ec.methodOfControl)
							: null,
						createdAt: String(ec.createdAt),
						updatedAt: String(ec.updatedAt),
					};
					db.insert(espionageCells).values(mappedEc).run();
				}
			}

			// active_sessions
			const snapshotActiveSessions = (snapshot as any).activeSessions;
			if (snapshotActiveSessions && snapshotActiveSessions.length > 0) {
				for (const asess of snapshotActiveSessions) {
					const mappedAs = {
						id: String(asess.id),
						combatEncounterId: asess.combatEncounterId
							? String(asess.combatEncounterId)
							: null,
						updatedAt: String(asess.updatedAt),
					};
					db.insert(activeSessions).values(mappedAs).run();
				}
			}

			// combat_encounters
			const snapshotCombatEncounters = (snapshot as any).combatEncounters;
			if (snapshotCombatEncounters && snapshotCombatEncounters.length > 0) {
				for (const ce of snapshotCombatEncounters) {
					const mappedCe = {
						id: String(ce.id),
						turn: Number(ce.turn ?? 1),
						round: Number(ce.round ?? 1),
						initiativeOrderJson: String(ce.initiativeOrderJson ?? "[]"),
						status: String(ce.status ?? "active"),
						createdAt: String(ce.createdAt),
						updatedAt: String(ce.updatedAt),
					};
					db.insert(combatEncounters).values(mappedCe).run();
				}
			}

			// combat_monsters
			const snapshotCombatMonsters = (snapshot as any).combatMonsters;
			if (snapshotCombatMonsters && snapshotCombatMonsters.length > 0) {
				for (const cm of snapshotCombatMonsters) {
					const mappedCm = {
						id: String(cm.id),
						combatEncounterId: String(cm.combatEncounterId),
						monsterId: String(cm.monsterId),
						name: String(cm.name),
						hpCurrent: Number(cm.hpCurrent),
						hpMax: Number(cm.hpMax),
						eeCurrent: Number(cm.eeCurrent),
						eeMax: Number(cm.eeMax),
						tacticalRole: String(cm.tacticalRole),
						createdAt: String(cm.createdAt),
						updatedAt: String(cm.updatedAt),
					};
					db.insert(combatMonsters).values(mappedCm).run();
				}
			}

			// campaign_events_history
			const snapshotCampaignEventsHistory = (snapshot as any)
				.campaignEventsHistory;
			if (
				snapshotCampaignEventsHistory &&
				snapshotCampaignEventsHistory.length > 0
			) {
				for (const ev of snapshotCampaignEventsHistory) {
					const mappedEv = {
						id: String(ev.id),
						campaignId: String(ev.campaignId),
						eventType: String(ev.eventType),
						description: String(ev.description),
						createdAt: String(ev.createdAt),
					};
					db.insert(campaignEventsHistory).values(mappedEv).run();
				}
			}

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

			database.data.close();
			return ok(undefined);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save game snapshot to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async loadGameSnapshot(): Promise<
		Result<SaveGameSnapshot, SqliteBootstrapFailure>
	> {
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

			const db = drizzle(database.data);

			const loadedCharacters = db.select().from(characters).all();

			const loadedWorldState = db.select().from(worldStateEntries).all();

			const mappedWorldState = loadedWorldState.map((entry) => {
				// biome-ignore lint/suspicious/noExplicitAny: JSON.parse returns dynamic any for JsonValue compatibility
				let decodedValue: any = null;
				try {
					decodedValue = JSON.parse(entry.valueJson);
				} catch {
					// Manter nulo em caso de erro de parsing
				}

				return {
					key: entry.key,
					value: decodedValue,
					updatedAt: entry.updatedAt,
				};
			});

			const loadedBastions = db.select().from(bastions).all();
			const loadedBastionModules = db.select().from(bastionModules).all();
			const loadedFactions = db.select().from(factions).all();
			const loadedReputations = db.select().from(characterReputation).all();
			const loadedBloodDebts = db.select().from(bloodDebts).all();
			const loadedClocks = db.select().from(progressClocks).all();
			const loadedDialogueStates = db
				.select()
				.from(campaignDialogueStates)
				.all();
			const loadedQuests = db.select().from(campaignQuests).all();
			const loadedQuestObjectives = db.select().from(questObjectives).all();
			const loadedInvestigations = db
				.select()
				.from(campaignInvestigations)
				.all();
			const loadedRegionalDomains = db
				.select()
				.from(campaignRegionalDomains)
				.all();
			const loadedCampSessions = db.select().from(campaignCampSessions).all();
			const loadedMercenaryCompanies = db
				.select()
				.from(mercenaryCompanies)
				.all();
			const loadedMercenarySquads = db.select().from(mercenarySquads).all();
			const loadedEspionageCells = db.select().from(espionageCells).all();
			const loadedActiveSessions = db.select().from(activeSessions).all();
			const loadedCombatEncounters = db.select().from(combatEncounters).all();
			const loadedCombatMonsters = db.select().from(combatMonsters).all();
			const loadedCampaignEventsHistory = db
				.select()
				.from(campaignEventsHistory)
				.all();

			const mappedBastionModules = loadedBastionModules.map((m: any) => ({
				...m,
				isBroken: m.isBroken === 1 || m.isBroken === true,
			}));

			const mappedReputations = loadedReputations.map((r: any) => ({
				...r,
			}));

			const mappedBloodDebts = loadedBloodDebts.map((bd: any) => ({
				...bd,
				isPaid: bd.isPaid === 1 || bd.isPaid === true,
			}));

			const mappedClocks = loadedClocks.map((c: any) => ({
				...c,
				isCompleted: c.isCompleted === 1 || c.isCompleted === true,
				triggerEvent: c.triggerEvent ?? undefined,
			}));

			const mappedRegionalDomains = loadedRegionalDomains.map((rd: any) => ({
				...rd,
			}));

			database.data.close();

			return ok({
				version: 1,
				savedAt: new Date().toISOString(),
				characters: loadedCharacters,
				worldState: mappedWorldState,
				bastions: loadedBastions,
				bastionModules: mappedBastionModules,
				factions: loadedFactions,
				characterReputation: mappedReputations,
				bloodDebts: mappedBloodDebts,
				progressClocks: mappedClocks,
				dialogueStates: loadedDialogueStates,
				quests: loadedQuests,
				questObjectives: loadedQuestObjectives,
				investigations: loadedInvestigations,
				regionalDomains: mappedRegionalDomains,
				campSessions: loadedCampSessions,
				mercenaryCompanies: loadedMercenaryCompanies,
				mercenarySquads: loadedMercenarySquads,
				espionageCells: loadedEspionageCells.map((ec: any) => ({
					...ec,
					isLockdown: ec.isLockdown === 1 || ec.isLockdown === true,
				})),
				activeSessions: loadedActiveSessions,
				combatEncounters: loadedCombatEncounters,
				combatMonsters: loadedCombatMonsters,
				campaignEventsHistory: loadedCampaignEventsHistory,
			});
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load game snapshot from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveCharacter(
		// biome-ignore lint/suspicious/noExplicitAny: Drizzle model is generic
		character: any,
		// biome-ignore lint/suspicious/noExplicitAny: return record has dynamic structure
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock mapping
			const repository = new DrizzleCharacterRepository(db as any);

			const result = await repository.save(character);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save character to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async applyLevelUp(
		levelUpInput: LevelUpInput,
	): Promise<Result<any, SqliteBootstrapFailure>> {
		const axisSum =
			levelUpInput.addedPhysical +
			levelUpInput.addedMental +
			levelUpInput.addedSocial;
		if (axisSum !== 1) {
			return fail({
				code: "INVALID_LEVEL_UP_DISTRIBUTION",
				message: `Distribuição inválida de Eixos. É necessário distribuir exatamente 1 ponto, recebido: ${axisSum}`,
			});
		}

		const appSum =
			levelUpInput.addedConflict +
			levelUpInput.addedInteraction +
			levelUpInput.addedResistance;
		if (appSum !== 2) {
			return fail({
				code: "INVALID_LEVEL_UP_DISTRIBUTION",
				message: `Distribuição inválida de Aplicações. É necessário distribuir exatamente 2 pontos, recebido: ${appSum}`,
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
			const db = drizzle(database.data);
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock mapping
			const repository = new DrizzleCharacterRepository(db as any);

			const findRes = await repository.findById(levelUpInput.characterId);
			if (!findRes.success) {
				database.data.close();
				return fail({
					code: "CHARACTER_NOT_FOUND",
					message: `Aventureiro com ID ${levelUpInput.characterId} não foi localizado.`,
				});
			}

			const character = findRes.data;

			if (!canCharacterLevelUp(character.experiencePoints, character.level)) {
				database.data.close();
				const required = getXpRequiredForLevel(character.level + 1);
				return fail({
					code: "INSUFFICIENT_EXPERIENCE_POINTS",
					message: `XP insuficiente para subir para o nível ${character.level + 1}. Atual: ${character.experiencePoints}, Necessário: ${required}`,
				});
			}

			const nextLevel = character.level + 1;
			const nextTierRes = getCharacterTierForLevel(nextLevel);
			if (!nextTierRes.success) {
				database.data.close();
				return fail({
					code: "INVALID_CHARACTER_LEVEL",
					message: nextTierRes.error.message,
				});
			}

			const tierCap =
				nextTierRes.data === 1
					? 3
					: nextTierRes.data === 2
						? 4
						: nextTierRes.data === 3
							? 5
							: 6;

			const newPhysical = character.physical + levelUpInput.addedPhysical;
			const newMental = character.mental + levelUpInput.addedMental;
			const newSocial = character.social + levelUpInput.addedSocial;

			if (newPhysical > tierCap || newMental > tierCap || newSocial > tierCap) {
				database.data.close();
				return fail({
					code: "INVALID_TIER_CAP",
					message: `Um dos Eixos excede o limite máximo permitido de ${tierCap} para o Tier ${nextTierRes.data}.`,
					details: {
						cap: tierCap,
						physical: newPhysical,
						mental: newMental,
						social: newSocial,
					},
				});
			}

			const newConflict = character.conflict + levelUpInput.addedConflict;
			const newInteraction =
				character.interaction + levelUpInput.addedInteraction;
			const newResistance = character.resistance + levelUpInput.addedResistance;

			const updatedCharacter = {
				...character,
				level: nextLevel,
				physical: newPhysical,
				mental: newMental,
				social: newSocial,
				conflict: newConflict,
				interaction: newInteraction,
				resistance: newResistance,
				updatedAt: new Date().toISOString(),
			};

			const saveRes = await repository.save(updatedCharacter);
			if (!saveRes.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: saveRes.error.message,
				});
			}

			const exported = this.exportDatabase(database.data);
			if (!exported.success) {
				database.data.close();
				return fail(exported.error);
			}

			const written = await this.storage.writeDatabaseFile(exported.data);
			database.data.close();

			if (!written.success) {
				return fail(written.error);
			}

			return ok(saveRes.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not apply level up in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findCharacter(
		id: string,
		// biome-ignore lint/suspicious/noExplicitAny: return record has dynamic structure
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock mapping
			const repository = new DrizzleCharacterRepository(db as any);

			const result = await repository.findById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load character from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveStatusEffect(
		// biome-ignore lint/suspicious/noExplicitAny: Drizzle model is generic
		effect: any,
		// biome-ignore lint/suspicious/noExplicitAny: return record has dynamic structure
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock mapping
			const repository = new DrizzleCharacterRepository(db as any);

			const result = await repository.saveStatusEffect(effect);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save status effect to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findStatusEffects(
		characterId: string,
		// biome-ignore lint/suspicious/noExplicitAny: return list has dynamic structure
	): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock mapping
			const repository = new DrizzleCharacterRepository(db as any);

			const result =
				await repository.findStatusEffectsByCharacterId(characterId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load status effects from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async deleteStatusEffect(
		id: string,
	): Promise<Result<void, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock mapping
			const repository = new DrizzleCharacterRepository(db as any);

			const result = await repository.deleteStatusEffect(id);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(undefined);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not delete status effect from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async castSpell(inputPayload: {
		casterId: string;
		targetId: string;
		spellId: string;
		upcastLevel: number;
	}): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock mapping
			const repository = new DrizzleCharacterRepository(db as any);
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock mapping
			const companionRepository = new DrizzleCompanionRepository(db as any);

			// 1. Load caster character
			const casterResult = await repository.findById(inputPayload.casterId);
			if (!casterResult.success) {
				database.data.close();
				return fail({
					code: "CHARACTER_NOT_FOUND",
					message: "Caster character was not found.",
				});
			}
			const caster = casterResult.data;

			// 2. Load target character
			const targetResult = await repository.findById(inputPayload.targetId);
			if (!targetResult.success) {
				database.data.close();
				return fail({
					code: "CHARACTER_NOT_FOUND",
					message: "Target character was not found.",
				});
			}
			const target = targetResult.data;

			// 3. Find spell in catalog
			const spell = OFFICIAL_SPELLS.find((s) => s.id === inputPayload.spellId);
			if (!spell) {
				database.data.close();
				return fail({
					code: "SPELL_NOT_FOUND",
					message: "Spell not found in catalog.",
				});
			}

			// 4. Calculate ether cost
			const baseCost = spell.etherCost;
			const upcastCost =
				inputPayload.upcastLevel * spell.upcastFormula.etherCostPerCircle;
			const totalCost = baseCost + upcastCost;

			// 5. Calculate available ether
			const baseEe = caster.level + caster.mental;
			const companionsRes = await companionRepository.findCompanionsByCharacter(
				caster.id,
			);
			const hasActiveFamiliar =
				companionsRes.success &&
				companionsRes.data.some(
					(comp) => comp.type === "familiar" && !comp.isDissipated,
				);
			const finalEe = hasActiveFamiliar ? Math.max(0, baseEe - 1) : baseEe;

			// 6. Check enough ether
			if (totalCost > finalEe) {
				database.data.close();
				return fail({
					code: "INSUFFICIENT_ETHER",
					message: `EE insuficiente: você tem ${finalEe} EE e precisa de ${totalCost} EE.`,
					details: {
						availableEther: finalEe,
						requiredEther: totalCost,
						spellId: spell.id,
					},
				});
			}

			// 7. Inject status effects into the target
			const appliedEffects = [];
			for (const effectType of spell.targetEffects) {
				const duration =
					spell.baseDuration +
					inputPayload.upcastLevel *
						spell.upcastFormula.durationIncreasePerCircle;
				const newEffect: NewCharacterStatusEffectRecord = {
					id: crypto.randomUUID(),
					characterId: target.id,
					type: effectType as NewCharacterStatusEffectRecord["type"],
					severity: 1,
					severityMax: 3,
					isAggravated: false,
					metadata: null,
					durationTurns: duration > 0 ? duration : null,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};
				const saveEffectRes = await repository.saveStatusEffect(newEffect);
				if (!saveEffectRes.success) {
					database.data.close();
					return fail({
						code: "DATABASE_FILE_WRITE_FAILED",
						message: `Could not save status effect for target: ${saveEffectRes.error.message}`,
						details: { innerError: saveEffectRes.error },
					});
				}
				appliedEffects.push(saveEffectRes.data);
			}

			// 8. Export and write database file
			const exported = this.exportDatabase(database.data);
			if (!exported.success) {
				database.data.close();
				return fail(exported.error);
			}

			const written = await this.storage.writeDatabaseFile(exported.data);
			database.data.close();

			if (!written.success) {
				return fail(written.error);
			}

			return ok({
				success: true,
				casterId: caster.id,
				targetId: target.id,
				spellId: spell.id,
				totalEtherCost: totalCost,
				effectsApplied: appliedEffects,
			});
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not process spell cast in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveBastion(
		bastion: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleBastionRepository(db as any);

			const result = await repository.save(bastion);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save bastion to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findBastion(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleBastionRepository(db as any);

			const result = await repository.findById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load bastion from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveBastionModule(
		module: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleBastionRepository(db as any);

			const result = await repository.saveModule(module);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save bastion module to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findBastionModules(
		bastionId: string,
	): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleBastionRepository(db as any);

			const result = await repository.findModulesByBastionId(bastionId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data as any);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load bastion modules from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async deleteBastionModule(
		id: string,
	): Promise<Result<void, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleBastionRepository(db as any);

			const result = await repository.deleteModule(id);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(undefined);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not delete bastion module from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveFaction(
		faction: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSocialRepository(db as any);

			const result = await repository.saveFaction(faction);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save faction to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveSocialLedger(
		ledger: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleFactionRepository(db as any);

			const result = await repository.saveLedger(ledger);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save social ledger to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async savePatronage(
		patronage: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleFactionRepository(db as any);

			const result = await repository.savePatronage(patronage);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save patronage to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findPatronage(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleFactionRepository(db as any);

			const result = await repository.findPatronage(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load patronage from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findPatronageByFaction(
		factionId: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleFactionRepository(db as any);

			const result = await repository.findPatronageByFaction(factionId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load patronage by faction from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listPatronages(): Promise<
		Result<any[], SqliteBootstrapFailure>
	> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleFactionRepository(db as any);

			const result = await repository.listPatronages();
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data as any[]);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load patronages list from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findSocialLedger(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleFactionRepository(db as any);

			const result = await repository.getLedger(id);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load social ledger from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findFaction(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSocialRepository(db as any);

			const result = await repository.findFactionById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load faction from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listFactions(): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSocialRepository(db as any);

			const result = await repository.listFactions();
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data as any[]);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load factions list from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listAncestries(): Promise<
		Result<any[], SqliteBootstrapFailure>
	> {
		try {
			const storedFile = await this.storage.readDatabaseFile();
			if (!storedFile.success) {
				return ok([...OFFICIAL_ANCESTRIES]);
			}

			const sqlite = await this.createSqliteModule();
			if (!sqlite.success) {
				return ok([...OFFICIAL_ANCESTRIES]);
			}

			const database = this.openDatabase(sqlite.data, storedFile.data);
			if (!database.success) {
				return ok([...OFFICIAL_ANCESTRIES]);
			}

			const db = drizzle(database.data);
			const repository = new DrizzleAncestryRepository(db as any);

			const result = await repository.list();
			database.data.close();

			if (!result.success) {
				return ok([...OFFICIAL_ANCESTRIES]);
			}

			return ok(result.data as any[]);
		} catch {
			return ok([...OFFICIAL_ANCESTRIES]);
		}
	}

	public async listBackgrounds(): Promise<
		Result<any[], SqliteBootstrapFailure>
	> {
		try {
			const storedFile = await this.storage.readDatabaseFile();
			if (!storedFile.success) {
				return ok([...OFFICIAL_BACKGROUNDS]);
			}

			const sqlite = await this.createSqliteModule();
			if (!sqlite.success) {
				return ok([...OFFICIAL_BACKGROUNDS]);
			}

			const database = this.openDatabase(sqlite.data, storedFile.data);
			if (!database.success) {
				return ok([...OFFICIAL_BACKGROUNDS]);
			}

			const db = drizzle(database.data);
			const repository = new DrizzleBackgroundRepository(db as any);

			const result = await repository.list();
			database.data.close();

			if (!result.success) {
				return ok([...OFFICIAL_BACKGROUNDS]);
			}

			return ok(result.data as any[]);
		} catch {
			return ok([...OFFICIAL_BACKGROUNDS]);
		}
	}

	public async listCharacterClasses(): Promise<
		Result<any[], SqliteBootstrapFailure>
	> {
		try {
			const storedFile = await this.storage.readDatabaseFile();
			if (!storedFile.success) {
				return ok([...OFFICIAL_CHARACTER_CLASSES]);
			}

			const sqlite = await this.createSqliteModule();
			if (!sqlite.success) {
				return ok([...OFFICIAL_CHARACTER_CLASSES]);
			}

			const database = this.openDatabase(sqlite.data, storedFile.data);
			if (!database.success) {
				return ok([...OFFICIAL_CHARACTER_CLASSES]);
			}

			const db = drizzle(database.data);
			const repository = new DrizzleCharacterClassRepository(db as any);

			const result = await repository.list();
			database.data.close();

			if (!result.success) {
				return ok([...OFFICIAL_CHARACTER_CLASSES]);
			}

			return ok(result.data as any[]);
		} catch {
			return ok([...OFFICIAL_CHARACTER_CLASSES]);
		}
	}

	public async listSpells(): Promise<Result<any[], SqliteBootstrapFailure>> {
		try {
			const storedFile = await this.storage.readDatabaseFile();
			if (!storedFile.success) {
				return ok([...OFFICIAL_SPELLS]);
			}

			const sqlite = await this.createSqliteModule();
			if (!sqlite.success) {
				return ok([...OFFICIAL_SPELLS]);
			}

			const database = this.openDatabase(sqlite.data, storedFile.data);
			if (!database.success) {
				return ok([...OFFICIAL_SPELLS]);
			}

			const db = drizzle(database.data);
			const repository = new DrizzleSpellCatalogRepository(db as any);

			const result = await repository.listSpells();
			database.data.close();

			if (!result.success) {
				return ok([...OFFICIAL_SPELLS]);
			}

			return ok(result.data as any[]);
		} catch {
			return ok([...OFFICIAL_SPELLS]);
		}
	}

	public async saveReputation(
		reputation: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSocialRepository(db as any);

			const result = await repository.saveReputation(reputation);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save reputation to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findReputation(
		characterId: string,
		factionId: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSocialRepository(db as any);

			const result = await repository.findReputation(characterId, factionId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load reputation from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listReputationsByCharacter(
		characterId: string,
	): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSocialRepository(db as any);

			const result = await repository.listReputationsByCharacter(characterId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data as any[]);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load reputations list from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async triggerSiege(params: {
		campaignId: string;
		bastionId: string;
		factionId: string;
		dangerLevel: number;
		requestedAt: string;
		uuid?: string | undefined;
	}): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const siegeRepo = new DrizzleSiegeRepository(db as any);
			const diceService = new DiceService(
				{
					next: () => {
						const array = new Uint32Array(1);
						crypto.getRandomValues(array);
						return (array[0] ?? 0) / 4294967296;
					},
				},
				{
					generate: (() => {
						let id = 1;
						return () => `siege-roll-${id++}`;
					})(),
				},
				{ now: () => new Date().toISOString() },
			);
			const service = new SiegeService(siegeRepo, diceService);

			const result = await service.triggerSiege(params);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not trigger siege event in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async resolveSiegeRound(params: {
		siegeId: string;
		defenseRollBonus: number;
		requestedAt: string;
		forcedAttackRoll?: number | undefined;
		forcedDefenseRoll?: number | undefined;
		squadIdsToDefend?: string[] | undefined;
	}): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const siegeRepo = new DrizzleSiegeRepository(db as any);
			const bastionRepo = new DrizzleBastionRepository(db as any);
			const mercenaryRepo = new DrizzleMercenaryRepository(db as any);
			const clockRepo = new DrizzleClockRepository(db as any);

			const diceService = new DiceService(
				{
					next: () => {
						const array = new Uint32Array(1);
						crypto.getRandomValues(array);
						return (array[0] ?? 0) / 4294967296;
					},
				},
				{
					generate: (() => {
						let id = 1;
						return () => `siege-roll-${id++}`;
					})(),
				},
				{ now: () => new Date().toISOString() },
			);
			const service = new SiegeService(siegeRepo, diceService);

			// 1. Carrega dados do Bastião e Mercenários associados (se houver parameters)
			const activeSiegeRes = await siegeRepo.findById(params.siegeId);
			if (!activeSiegeRes.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: activeSiegeRes.error.message,
				});
			}
			const activeSiege = activeSiegeRes.data;

			const bastionRes = await bastionRepo.findById(activeSiege.bastionId);
			if (!bastionRes.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: bastionRes.error.message,
				});
			}
			const bastion = bastionRes.data;

			const squads: any[] = [];
			if (params.squadIdsToDefend && params.squadIdsToDefend.length > 0) {
				const squadsPromises = params.squadIdsToDefend.map((id) =>
					mercenaryRepo.findSquadById(id),
				);
				const squadsResults = await Promise.all(squadsPromises);
				for (const sRes of squadsResults) {
					if (sRes.success) {
						squads.push(sRes.data);
					}
				}
			}

			// 2. Resolve a rodada de cerco
			const result = await service.resolveSiegeRound({
				siegeId: params.siegeId,
				defenseRollBonus: params.defenseRollBonus,
				requestedAt: params.requestedAt,
				forcedAttackRoll: params.forcedAttackRoll,
				forcedDefenseRoll: params.forcedDefenseRoll,
				bastion,
				squads,
			});

			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

			// 3. Salva Bastião e Mercenários modificados
			if (result.data.updatedBastion) {
				const saveBastionRes = await bastionRepo.save(
					result.data.updatedBastion as any,
				);
				if (!saveBastionRes.success) {
					database.data.close();
					return fail({
						code: "DATABASE_FILE_WRITE_FAILED",
						message: saveBastionRes.error.message,
					});
				}
			}

			if (result.data.updatedSquads) {
				for (const squad of result.data.updatedSquads) {
					const saveSquadRes = await mercenaryRepo.saveSquad(squad as any);
					if (!saveSquadRes.success) {
						database.data.close();
						return fail({
							code: "DATABASE_FILE_WRITE_FAILED",
							message: saveSquadRes.error.message,
						});
					}
				}
			}

			// 4. Se houver reset de relógio de ameaça, zera os segmentos
			if (result.data.resetClockName) {
				const clocksListRes = await clockRepo.findAll();
				if (clocksListRes.success) {
					const targetClock = clocksListRes.data.find(
						(c) => c.name === result.data.resetClockName,
					);
					if (targetClock) {
						targetClock.filledSegments = 0;
						targetClock.isCompleted = false;
						await clockRepo.save(targetClock);
					}
				}
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not resolve siege round in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findActiveSiege(
		campaignId: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSiegeRepository(db as any);

			const result = await repository.findActiveSiege(campaignId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load active siege from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listSiegeHistory(
		campaignId: string,
	): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSiegeRepository(db as any);

			const result = await repository.listEventHistory(campaignId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data as any[]);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load siege history from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveBloodDebt(
		debt: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSocialRepository(db as any);

			const result = await repository.saveBloodDebt(debt);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save blood debt to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listBloodDebtsByCharacter(
		characterId: string,
	): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSocialRepository(db as any);

			const result = await repository.listBloodDebtsByCharacter(characterId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data as any[]);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load blood debts list from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveClock(
		clock: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleClockRepository(db as any);

			const result = await repository.save(clock);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save progress clock to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findClock(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleClockRepository(db as any);

			const result = await repository.findById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load progress clock from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listClocks(): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleClockRepository(db as any);

			const result = await repository.findAll();
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data as any[]);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load progress clocks list from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async deleteClock(
		id: string,
	): Promise<Result<void, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleClockRepository(db as any);

			const result = await repository.delete(id);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(undefined);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not delete progress clock from SQLite database.",
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

	public async saveDialogueState(
		dialogueState: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleDialogueRepository(db as any);

			const result = await repository.save(dialogueState);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save campaign dialogue state to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findDialogueState(
		characterId: string,
		npcId: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleDialogueRepository(db as any);

			const result = await repository.findByCharacterAndNpc(characterId, npcId);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load campaign dialogue state from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async deleteDialogueState(
		id: string,
	): Promise<Result<void, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleDialogueRepository(db as any);

			const result = await repository.delete(id);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(undefined);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message:
					"Could not delete campaign dialogue state from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveDungeonDelve(
		delve: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleDungeonRepository(db as any);

			const result = await repository.saveDelve(delve);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save dungeon delve to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findDungeonDelve(
		id: string,
	): Promise<Result<any | null, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleDungeonRepository(db as any);

			const result = await repository.findDelveById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not read dungeon delve from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listDungeonDelves(
		campaignId: string,
	): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleDungeonRepository(db as any);

			const result = await repository.findDelvesByCampaignId(campaignId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list dungeon delves from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveDungeonRoom(
		room: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleDungeonRepository(db as any);

			const result = await repository.saveRoom(room);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save room to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findDungeonRooms(
		delveId: string,
	): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleDungeonRepository(db as any);

			const result = await repository.findRoomsByDelveId(delveId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not read rooms from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findDungeonRoomByCoords(
		delveId: string,
		coordinateX: number,
		coordinateY: number,
	): Promise<Result<any | null, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleDungeonRepository(db as any);

			const result = await repository.findRoomByCoordinates(
				delveId,
				coordinateX,
				coordinateY,
			);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not find room in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async updateDungeonRoomStatus(
		id: string,
		status: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleDungeonRepository(db as any);

			const result = await repository.updateRoomStatus(id, status);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not update room status in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async updateDungeonDelveStatus(
		id: string,
		status: any,
		currentLevel: number,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleDungeonRepository(db as any);

			const result = await repository.updateDelveStatus(
				id,
				status,
				currentLevel,
			);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not update dungeon delve status in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveQuest(
		quest: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleQuestRepository(db as any);

			const result = await repository.save(quest);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save quest to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findQuest(
		id: string,
	): Promise<Result<any | null, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleQuestRepository(db as any);

			const result = await repository.findById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not read quest from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listQuests(): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleQuestRepository(db as any);

			const result = await repository.findAll();
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list quests from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async deleteQuest(
		id: string,
	): Promise<Result<void, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleQuestRepository(db as any);

			const result = await repository.delete(id);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(undefined);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not delete quest from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveQuestObjective(
		objective: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleQuestRepository(db as any);

			const result = await repository.saveObjective(objective);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save quest objective to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findQuestObjective(
		id: string,
	): Promise<Result<any | null, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleQuestRepository(db as any);

			const result = await repository.findObjectiveById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not read quest objective from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listQuestObjectivesByQuest(
		questId: string,
	): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleQuestRepository(db as any);

			const result = await repository.findObjectivesByQuestId(questId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list quest objectives from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async deleteQuestObjective(
		id: string,
	): Promise<Result<void, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleQuestRepository(db as any);

			const result = await repository.deleteObjective(id);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(undefined);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not delete quest objective from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveCohesion(
		cohesion: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSynergyRepository(db as any);

			const result = await repository.saveCohesion(cohesion);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save campaign cohesion to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findCohesion(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSynergyRepository(db as any);

			const result = await repository.getCohesion(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load campaign cohesion from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveSignature(
		signature: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSynergyRepository(db as any);

			const result = await repository.saveSignature(signature);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save registered signature to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findSignature(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSynergyRepository(db as any);

			const result = await repository.findSignatureById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load registered signature from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listSignatures(): Promise<
		Result<any[], SqliteBootstrapFailure>
	> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSynergyRepository(db as any);

			const result = await repository.findAllSignatures();
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list registered signatures from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async deleteSignature(
		id: string,
	): Promise<Result<void, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleSynergyRepository(db as any);

			const result = await repository.deleteSignature(id);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(undefined);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not delete registered signature from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveTrap(
		trap: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleTrapRepository(db as any);

			const result = await repository.save(trap);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save trap to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findTrap(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleTrapRepository(db as any);

			const result = await repository.findById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load trap from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listTraps(
		tileId: string,
	): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleTrapRepository(db as any);

			const result = await repository.findByTileId(tileId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list traps from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async deleteTrap(
		id: string,
	): Promise<Result<void, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleTrapRepository(db as any);

			const result = await repository.delete(id);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(undefined);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not delete trap from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveCompanion(
		companion: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleCompanionRepository(db as any);

			const result = await repository.saveCompanion(companion);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save companion to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findCompanion(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleCompanionRepository(db as any);

			const result = await repository.getCompanion(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not find companion in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listCompanionsByCharacter(
		characterId: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleCompanionRepository(db as any);

			const result = await repository.findCompanionsByCharacter(characterId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list companions in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveInvestigation(
		investigation: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleInvestigationRepository(db as any);

			const result = await repository.save(investigation);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save investigation to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findInvestigation(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleInvestigationRepository(db as any);

			const result = await repository.findById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not find investigation in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listInvestigationsByTarget(
		targetId: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleInvestigationRepository(db as any);

			const result = await repository.findByTargetId(targetId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list investigations by target in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listActiveInvestigations(): Promise<
		Result<any, SqliteBootstrapFailure>
	> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleInvestigationRepository(db as any);

			const result = await repository.listActive();
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list active investigations in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveRegionalDomain(
		record: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleRegionalDomainRepository(db as any);

			const result = await repository.save(record);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save regional domain to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findRegionalDomain(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleRegionalDomainRepository(db as any);

			const result = await repository.findById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load regional domain from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listRegionalDomains(): Promise<
		Result<any, SqliteBootstrapFailure>
	> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleRegionalDomainRepository(db as any);

			const result = await repository.listAll();
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list regional domains from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveCampSession(
		record: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleCampRepository(db as any);

			const result = await repository.save(record);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save camp session to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findCampSession(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleCampRepository(db as any);

			const result = await repository.findById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load camp session from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listCampSessions(): Promise<
		Result<any[], SqliteBootstrapFailure>
	> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleCampRepository(db as any);

			const result = await repository.listAll();
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data as any[]);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list camp sessions from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveMercenaryCompany(
		company: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleMercenaryRepository(db as any);

			const result = await repository.saveCompany(company);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save mercenary company to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findMercenaryCompany(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleMercenaryRepository(db as any);

			const result = await repository.findCompanyById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load mercenary company from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listMercenaryCompanies(): Promise<
		Result<any[], SqliteBootstrapFailure>
	> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleMercenaryRepository(db as any);

			const result = await repository.listCompanies();
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data as any[]);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list mercenary companies from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveMercenarySquad(
		squad: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleMercenaryRepository(db as any);

			const result = await repository.saveSquad(squad);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save mercenary squad to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findMercenarySquad(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleMercenaryRepository(db as any);

			const result = await repository.findSquadById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load mercenary squad from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listMercenarySquadsByCompany(
		companyId: string,
	): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleMercenaryRepository(db as any);

			const result = await repository.listSquadsByCompany(companyId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data as any[]);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list mercenary squads from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async deleteCampSession(
		id: string,
	): Promise<Result<void, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const { eq } = await import("drizzle-orm");

			db.delete(campaignCampSessions)
				.where(eq(campaignCampSessions.id, id))
				.run();

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

			database.data.close();
			return ok(undefined);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not delete camp session from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveEspionageCell(
		// biome-ignore lint/suspicious/noExplicitAny: Drizzle model is generic
		cell: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock mapping
			const repository = new DrizzleEspionageRepository(db as any);

			const result = await repository.save(cell);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save espionage cell to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findEspionageCell(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock mapping
			const repository = new DrizzleEspionageRepository(db as any);

			const result = await repository.findById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load espionage cell from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listEspionageCells(
		campaignId: string,
	): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock mapping
			const repository = new DrizzleEspionageRepository(db as any);

			const result = await repository.listByCampaign(campaignId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data as any[]);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list espionage cells from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async deleteEspionageCell(
		id: string,
	): Promise<Result<void, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle mock mapping
			const repository = new DrizzleEspionageRepository(db as any);

			const result = await repository.deleteCell(id);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(undefined);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not delete espionage cell from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveCombatEncounter(
		combatEncounter: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleCombatRepository(db as any);

			const result = await repository.saveEncounter(combatEncounter);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save combat encounter to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findCombatEncounter(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleCombatRepository(db as any);

			const result = await repository.findEncounterById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load combat encounter from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveCombatMonster(
		combatMonster: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleCombatRepository(db as any);

			const result = await repository.saveMonster(combatMonster);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save combat monster to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findCombatMonstersByEncounter(
		combatEncounterId: string,
	): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleCombatRepository(db as any);

			const result =
				await repository.findMonstersByEncounterId(combatEncounterId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data as any[]);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load combat monsters from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveActiveSession(
		activeSession: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleCombatRepository(db as any);

			const result = await repository.saveActiveSession(activeSession);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save active session to SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findActiveSession(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleCombatRepository(db as any);

			const result = await repository.findActiveSessionById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load active session from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async dismantleCraftedItem(
		characterId: string,
		itemId: string,
	): Promise<
		Result<
			{ materialsRecovered: Record<string, number> },
			SqliteBootstrapFailure
		>
	> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleCraftingRepository(db as any);
			const service = new CraftingService(repository, null as any);

			const result = await service.dismantleCraftedItem(characterId, itemId);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not dismantle crafted item in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public scrapEquipment(
		equipmentId: string,
	): Result<{ materialRecovered: string }, SqliteBootstrapFailure> {
		const service = new CraftingService(null as any, null as any);
		const result = service.scrapEquipment(equipmentId);
		if (!result.success) {
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: result.error.message,
			});
		}
		return ok(result.data);
	}

	public async saveLoreEncounter(
		encounter: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleLoreRepository(db as any);

			const result = await repository.saveEncounter(encounter);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save lore encounter in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findLoreEncounter(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleLoreRepository(db as any);

			const result = await repository.findEncounterById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not find lore encounter in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listLoreEncountersByTile(
		tileId: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleLoreRepository(db as any);

			const result = await repository.listEncountersByTile(tileId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list lore encounters by tile in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listAllLoreEncounters(): Promise<
		Result<any, SqliteBootstrapFailure>
	> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleLoreRepository(db as any);

			const result = await repository.listAllEncounters();
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list all lore encounters in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async saveCampaignRumor(
		rumor: any,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleLoreRepository(db as any);

			const result = await repository.saveRumor(rumor);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

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

			database.data.close();
			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not save campaign rumor in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async findCampaignRumor(
		id: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleLoreRepository(db as any);

			const result = await repository.findRumorById(id);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not find campaign rumor in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listCampaignRumorsByTile(
		tileId: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleLoreRepository(db as any);

			const result = await repository.listRumorsByTile(tileId);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list campaign rumors by tile in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listAllCampaignRumors(): Promise<
		Result<any, SqliteBootstrapFailure>
	> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleLoreRepository(db as any);

			const result = await repository.listAllRumors();
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list all campaign rumors in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async mutateWorldState(
		worldStateMutations?: Array<{ key: string; value: any }>,
		factionRenownMutations?: Array<{
			characterId: string;
			factionId: string;
			value: number;
		}>,
	): Promise<Result<{ mutated: boolean }, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);

			if (worldStateMutations && worldStateMutations.length > 0) {
				for (const mutation of worldStateMutations) {
					const valueJson = JSON.stringify(mutation.value);
					const now = new Date().toISOString();
					await db
						.insert(worldStateEntries)
						.values({
							key: mutation.key,
							valueJson,
							updatedAt: now,
						})
						.onConflictDoUpdate({
							target: worldStateEntries.key,
							set: {
								valueJson,
								updatedAt: now,
							},
						})
						.run();
				}
			}

			if (factionRenownMutations && factionRenownMutations.length > 0) {
				const { eq, and } = await import("drizzle-orm");
				for (const mutation of factionRenownMutations) {
					const now = new Date().toISOString();
					const existing = await db
						.select()
						.from(characterReputation)
						.where(
							and(
								eq(characterReputation.characterId, mutation.characterId),
								eq(characterReputation.factionId, mutation.factionId),
							),
						)
						.all();

					if (existing.length > 0) {
						await db
							.update(characterReputation)
							.set({
								value: mutation.value,
								updatedAt: now,
							})
							.where(
								and(
									eq(characterReputation.characterId, mutation.characterId),
									eq(characterReputation.factionId, mutation.factionId),
								),
							)
							.run();
					} else {
						const record = {
							id: crypto.randomUUID(),
							characterId: mutation.characterId,
							factionId: mutation.factionId,
							value: mutation.value,
							updatedAt: now,
						};
						await db.insert(characterReputation).values(record).run();
					}
				}
			}

			const exported = this.exportDatabase(database.data);
			if (!exported.success) {
				database.data.close();
				return fail(exported.error);
			}

			const written = await this.storage.writeDatabaseFile(exported.data);
			database.data.close();

			if (!written.success) {
				return fail(written.error);
			}

			return ok({ mutated: true });
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not mutate world state/renown in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async setWorldStateFlag(flag: {
		key: string;
		valueJson: string;
		updatedAt: string;
	}): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleWorldStateRepository(db as any);

			const result = await repository.setFlag(flag as any);
			if (!result.success) {
				database.data.close();
				return fail({
					code: "DATABASE_FILE_WRITE_FAILED",
					message: result.error.message,
				});
			}

			const exported = this.exportDatabase(database.data);
			if (!exported.success) {
				database.data.close();
				return fail(exported.error);
			}

			const written = await this.storage.writeDatabaseFile(exported.data);
			database.data.close();

			if (!written.success) {
				return fail(written.error);
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not write world state flag.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async getWorldStateFlag(
		key: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleWorldStateRepository(db as any);

			const result = await repository.getFlag(key as any);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not read world state flag.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async listWorldStateFlags(
		prefix: string,
	): Promise<Result<readonly any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const repository = new DrizzleWorldStateRepository(db as any);

			const result = await repository.listFlagsByPrefix(prefix as any);
			database.data.close();

			if (!result.success) {
				return fail({
					code: "DATABASE_FILE_READ_FAILED",
					message: result.error.message,
				});
			}

			return ok(result.data);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not list world state flags.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async tickClockManual(
		clockId: string,
		delta: number,
	): Promise<
		Result<
			{ clock: any; eventTriggered: string | null },
			SqliteBootstrapFailure
		>
	> {
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
			const db = drizzle(database.data);
			const { eq } = await import("drizzle-orm");

			const rows = await db
				.select()
				.from(progressClocks)
				.where(eq(progressClocks.id, clockId))
				.all();
			const clock = rows[0];

			if (!clock) {
				database.data.close();
				return fail({
					code: "CLOCK_NOT_FOUND",
					message: "Clock not found in SQLite database.",
				});
			}

			const newFilled = Math.min(
				clock.totalSegments,
				Math.max(0, clock.filledSegments + delta),
			);
			const isCompletedNow = newFilled >= clock.totalSegments;
			const isCompletedBefore = clock.isCompleted === true;
			const eventTriggered =
				isCompletedNow && !isCompletedBefore && clock.triggerEvent
					? clock.triggerEvent
					: null;

			await db
				.update(progressClocks)
				.set({
					filledSegments: newFilled,
					isCompleted: isCompletedNow,
				})
				.where(eq(progressClocks.id, clockId))
				.run();

			const updatedClock = {
				...clock,
				filledSegments: newFilled,
				isCompleted: isCompletedNow,
				triggerEvent: clock.triggerEvent ?? null,
			};

			const exported = this.exportDatabase(database.data);
			if (!exported.success) {
				database.data.close();
				return fail(exported.error);
			}

			const written = await this.storage.writeDatabaseFile(exported.data);
			database.data.close();

			if (!written.success) {
				return fail(written.error);
			}

			return ok({
				clock: updatedClock,
				eventTriggered,
			});
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not tick clock manually in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async forceSpawnActor(actor: {
		actorId: string;
		label: string;
		profile: "brute" | "sniper" | "controller";
		hitPoints: number;
		initiativeBase: number;
	}): Promise<
		Result<{ spawned: boolean; actor: any }, SqliteBootstrapFailure>
	> {
		return ok({
			spawned: true,
			actor,
		});
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

	private seedCatalogsIfEmpty(database: SqliteDatabase): void {
		const db = drizzle(database);

		// 1. Ancestries
		try {
			const existingAncestries = db
				.select({ id: ancestries.id })
				.from(ancestries)
				.all();
			if (existingAncestries.length === 0) {
				for (const item of OFFICIAL_ANCESTRIES) {
					db.insert(ancestries).values(item).run();
				}
			}
		} catch {
			// Tabela pode não existir (ex: testes sem migrations)
		}

		// 2. Ancestry Traits & Links
		try {
			const existingTraits = db
				.select({ id: ancestryTraits.id })
				.from(ancestryTraits)
				.all();
			if (existingTraits.length === 0) {
				for (const item of OFFICIAL_ANCESTRY_TRAITS) {
					db.insert(ancestryTraits).values(item).run();
				}
				for (const link of OFFICIAL_ANCESTRY_TRAIT_LINKS) {
					db.insert(ancestryTraitLinks).values(link).run();
				}
			}
		} catch {
			// Ignorar se tabelas não existirem
		}

		// 3. Backgrounds
		try {
			const existingBackgrounds = db
				.select({ id: backgrounds.id })
				.from(backgrounds)
				.all();
			if (existingBackgrounds.length === 0) {
				for (const item of OFFICIAL_BACKGROUNDS) {
					db.insert(backgrounds)
						.values(item as any)
						.run();
				}
			}
		} catch {
			// Ignorar se tabela não existir
		}

		// 4. Character Classes
		try {
			const existingClasses = db
				.select({ id: characterClasses.id })
				.from(characterClasses)
				.all();
			if (existingClasses.length === 0) {
				for (const item of OFFICIAL_CHARACTER_CLASSES) {
					db.insert(characterClasses)
						.values(item as any)
						.run();
				}
			}
		} catch {
			// Ignorar se tabela não existir
		}

		// 5. Spells
		try {
			const existingSpells = db.select({ id: spell.id }).from(spell).all();
			if (existingSpells.length === 0) {
				for (const item of OFFICIAL_SPELLS) {
					db.insert(spell)
						.values(item as any)
						.run();
				}
			}
		} catch {
			// Ignorar se tabela não existir
		}
	}

	public async getCampaignRecess(
		campaignId: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			let rows = db
				.select()
				.from(campaignRecess)
				.where(eq(campaignRecess.id, campaignId))
				.all();

			if (rows.length === 0) {
				db.insert(campaignRecess)
					.values({
						id: campaignId,
						recessDays: 7,
						currentDateDays: 0,
					})
					.run();
				rows = db
					.select()
					.from(campaignRecess)
					.where(eq(campaignRecess.id, campaignId))
					.all();

				const exported = this.exportDatabase(database.data);
				if (exported.success) {
					await this.storage.writeDatabaseFile(exported.data);
				}
			}

			database.data.close();
			return ok(rows[0]);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load campaign recess from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async addRecessDays(
		campaignId: string,
		days: number,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const rows = db
				.select()
				.from(campaignRecess)
				.where(eq(campaignRecess.id, campaignId))
				.all();

			const firstRow = rows[0];
			if (firstRow) {
				const nextDays = Math.max(0, firstRow.recessDays + days);
				db.update(campaignRecess)
					.set({ recessDays: nextDays })
					.where(eq(campaignRecess.id, campaignId))
					.run();
			} else {
				db.insert(campaignRecess)
					.values({
						id: campaignId,
						recessDays: Math.max(0, 7 + days),
						currentDateDays: 0,
					})
					.run();
			}

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

			database.data.close();
			return ok({ success: true });
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not add recess days in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async resolveDowntimeWeek(params: {
		campaignId: string;
		location: "city" | "bastion";
		allocations: Array<{
			characterId: string;
			actionTag: string;
			params: any;
		}>;
	}): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const recessRows = db
				.select()
				.from(campaignRecess)
				.where(eq(campaignRecess.id, params.campaignId))
				.all();

			const currentRecess = recessRows[0] ?? {
				recessDays: 7,
				currentDateDays: 0,
			};
			if (currentRecess.recessDays < 7) {
				database.data.close();
				return fail({
					code: "INSUFFICIENT_RECESS_DAYS",
					message: `Saldo de recesso insuficiente para resolver semana. Disponível: ${currentRecess.recessDays} dias.`,
				});
			}

			const nextRecessDays = currentRecess.recessDays - 7;
			const nextDateDays = currentRecess.currentDateDays + 7;
			const weekIndex = Math.floor(nextDateDays / 7);

			if (recessRows.length > 0) {
				db.update(campaignRecess)
					.set({ recessDays: nextRecessDays, currentDateDays: nextDateDays })
					.where(eq(campaignRecess.id, params.campaignId))
					.run();
			} else {
				db.insert(campaignRecess)
					.values({
						id: params.campaignId,
						recessDays: nextRecessDays,
						currentDateDays: nextDateDays,
					})
					.run();
			}

			let bastionRow = db.select().from(bastions).all()[0];
			if (!bastionRow) {
				const defaultBastionId = "bastion_default";
				db.insert(bastions)
					.values({
						id: defaultBastionId,
						name: "O Bastião dos Andarilhos",
						chassisId: "fortaleza_pedra",
						tier: 1,
						structure: 5,
						vigilance: 5,
						logistics: 5,
						integrityCurrent: 100,
						threatCurrent: 0,
						vaultGold: 1000,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					})
					.run();
				bastionRow = db.select().from(bastions).all()[0];
			}

			if (!bastionRow) {
				database.data.close();
				return fail({
					code: "CLOCK_NOT_FOUND",
					message: "Bastion record could not be found or initialized.",
				});
			}

			const context = new DrizzleDowntimeContext(
				db,
				params.campaignId,
				bastionRow.id,
			);
			const service = new DowntimeService(context);
			const logRecords: any[] = [];

			for (const alloc of params.allocations) {
				let details = "";
				let roll = 0;

				const tag = alloc.actionTag.toUpperCase();
				if (tag === "A") {
					const res = await service.resolveTagA({
						characterId: alloc.characterId,
						tier: alloc.params.tier ?? "sustento",
						statName: alloc.params.statName ?? "physical",
						regionId: alloc.params.regionId,
					});
					if (res.success) {
						roll = res.data.rollResult;
						details = res.data.outcomeDetails;
					} else {
						details = `Erro na Tag A: ${res.error}`;
					}
				} else if (tag === "B") {
					const res = await service.resolveTagB(alloc.characterId);
					if (res.success) {
						details = res.data.outcomeDetails;
					} else {
						details = `Erro na Tag B: ${res.error}`;
					}
				} else if (tag === "C") {
					const res = await service.resolveTagC({
						characterId: alloc.characterId,
						bossId: alloc.params.bossId ?? "default_boss",
						dc: alloc.params.dc ?? 20,
						subornoPO: alloc.params.subornoPO ?? 0,
					});
					if (res.success) {
						roll = res.data.rollResult;
						details = res.data.outcomeDetails;
					} else {
						details = `Erro na Tag C: ${res.error}`;
					}
				} else if (tag === "D") {
					const res = await service.resolveTagD(
						alloc.characterId,
						alloc.params.statName ?? "social",
					);
					if (res.success) {
						roll = res.data.rollResult;
						details = res.data.outcomeDetails;
					} else {
						details = `Erro na Tag D: ${res.error}`;
					}
				} else if (tag === "E") {
					const res = await service.resolveTagE({
						characterId: alloc.characterId,
						regionId: alloc.params.regionId ?? "region_default",
						goldSpent: alloc.params.goldSpent ?? 15,
						statName: alloc.params.statName ?? "social",
						dc: alloc.params.dc ?? 15,
					});
					if (res.success) {
						roll = res.data.rollResult;
						details = res.data.outcomeDetails;
					} else {
						details = `Erro na Tag E: ${res.error}`;
					}
				} else if (tag === "F") {
					const res = await service.resolveTagF({
						characterId: alloc.characterId,
						oldTalentId: alloc.params.oldTalentId,
						newTalentId: alloc.params.newTalentId,
					});
					if (res.success) {
						details = res.data.outcomeDetails;
					} else {
						details = `Erro na Tag F: ${res.error}`;
					}
				} else if (tag === "G") {
					const res = await service.resolveTagG({
						characterId: alloc.characterId,
						actionType: alloc.params.actionType ?? "coleta_impostos",
						statName: alloc.params.statName ?? "mental",
					});
					if (res.success) {
						roll = res.data.rollResult;
						details = res.data.outcomeDetails;
					} else {
						details = `Erro na Tag G: ${res.error}`;
					}
				} else if (tag === "H") {
					const res = await service.resolveTagH({
						characterId: alloc.characterId,
						factionId: alloc.params.factionId,
						statName: alloc.params.statName ?? "social",
						dc: alloc.params.dc ?? 15,
					});
					if (res.success) {
						roll = res.data.rollResult;
						details = res.data.outcomeDetails;
					} else {
						details = `Erro na Tag H: ${res.error}`;
					}
				} else {
					details = `Tag de ação [${alloc.actionTag}] inválida ou não implementada.`;
				}

				const logId = crypto.randomUUID();
				db.insert(downtimeActionLogs)
					.values({
						id: logId,
						characterId: alloc.characterId,
						weekIndex,
						actionTag: alloc.actionTag,
						rollResult: roll,
						outcomeDetails: details,
						createdAt: new Date().toISOString(),
					})
					.run();

				logRecords.push({
					characterId: alloc.characterId,
					actionTag: alloc.actionTag,
					rollResult: roll,
					outcomeDetails: details,
				});
			}

			const activeClocks = db
				.select()
				.from(progressClocks)
				.where(eq(progressClocks.isCompleted, false))
				.all();

			let siegeTriggered = false;
			let siegeFactionId = "";

			for (const clock of activeClocks) {
				const nextFilled = clock.filledSegments + 1;
				const isCompleted = nextFilled >= clock.totalSegments;

				db.update(progressClocks)
					.set({
						filledSegments: nextFilled,
						isCompleted,
					})
					.where(eq(progressClocks.id, clock.id))
					.run();

				if (
					isCompleted &&
					(clock.triggerEvent === "siege" ||
						clock.name.toLowerCase().includes("ameaça"))
				) {
					siegeTriggered = true;
					siegeFactionId = clock.name.toLowerCase().includes("ruína")
						? "fac-ruin"
						: "rival_faction";
				}
			}

			let threatDelta = 1;
			if (params.location === "bastion") {
				threatDelta = -1;
			}

			const nextThreat = Math.min(
				10,
				Math.max(0, bastionRow.threatCurrent + threatDelta),
			);
			db.update(bastions)
				.set({
					threatCurrent: nextThreat,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(bastions.id, bastionRow.id))
				.run();

			if (nextThreat >= 10 && !siegeTriggered) {
				siegeTriggered = true;
				siegeFactionId = "rival_faction";
			}

			let siegeRecord: any = null;
			if (siegeTriggered) {
				let dangerLevel = 3;
				if (params.location === "bastion") {
					dangerLevel = 2;
				}

				const siegeId = crypto.randomUUID();
				const newSiege = {
					id: siegeId,
					campaignId: params.campaignId,
					bastionId: bastionRow.id,
					factionId: siegeFactionId,
					status: "active",
					dangerLevel,
					damagePoints: 0,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};

				db.insert(campaignSiegeEvents).values(newSiege).run();
				siegeRecord = newSiege;

				let description = `Fase Macro: O exército da Facção inimiga [${siegeFactionId}] cercou o Bastião com nível de perigo [${dangerLevel}]!`;
				if (params.location === "bastion") {
					description +=
						" ATENUAÇÃO: Cerco atenuado (+2 Defesa temporária, 50% menos ouro roubado) devido à segurança do recesso guarnecido no Bastião.";
				}

				db.insert(campaignEventsHistory)
					.values({
						id: crypto.randomUUID(),
						campaignId: params.campaignId,
						eventType: "siege_start",
						description,
						createdAt: new Date().toISOString(),
					})
					.run();
			}

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

			database.data.close();
			return ok({
				weekIndex,
				recessDaysRemaining: nextRecessDays,
				currentDateDays: nextDateDays,
				logRecords,
				siegeTriggered,
				siegeRecord,
			});
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not resolve downtime week in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async getCampaignTimeline(
		campaignId: string,
	): Promise<Result<any[], SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const rows = db
				.select()
				.from(campaignEventsHistory)
				.where(eq(campaignEventsHistory.campaignId, campaignId))
				.orderBy(campaignEventsHistory.createdAt)
				.all();

			database.data.close();
			return ok(rows);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not load campaign timeline from SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async recordCampaignEvent(
		campaignId: string,
		eventType: string,
		description: string,
	): Promise<Result<any, SqliteBootstrapFailure>> {
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
			const db = drizzle(database.data);
			const newEvent = {
				id: crypto.randomUUID(),
				campaignId,
				eventType,
				description,
				createdAt: new Date().toISOString(),
			};

			db.insert(campaignEventsHistory).values(newEvent).run();

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

			database.data.close();
			return ok(newEvent);
		} catch (error: unknown) {
			database.data.close();
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not record campaign event in SQLite database.",
				details: { cause: stringifyCause(error) },
			});
		}
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
