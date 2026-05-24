/* istanbul ignore file */
import { drizzle } from "drizzle-orm/sql-js";
import { DrizzleBastionRepository } from "$lib/entities/bastion/infrastructure/DrizzleBastionRepository";
import {
	bastionModules,
	bastions,
} from "$lib/entities/bastion/model/bastionSchema";
import { DrizzleCharacterRepository } from "$lib/entities/character/infrastructure/DrizzleCharacterRepository";
import { characters } from "$lib/entities/character/model/characterSchema";
import { DrizzleClockRepository } from "$lib/entities/clocks/infrastructure/DrizzleClockRepository";
import { progressClocks } from "$lib/entities/clocks/model/clockSchema";
import { DrizzleCompanionRepository } from "$lib/entities/companions/infrastructure/DrizzleCompanionRepository";
import { DrizzleDialogueRepository } from "$lib/entities/dialogue/infrastructure/DrizzleDialogueRepository";
import { campaignDialogueStates } from "$lib/entities/dialogue/model/dialogueSchema";
import { DrizzleQuestRepository } from "$lib/entities/quest/infrastructure/DrizzleQuestRepository";
import { campaignQuests } from "$lib/entities/quest/model/questSchema";
import { DrizzleSocialRepository } from "$lib/entities/social/infrastructure/DrizzleSocialRepository";
import {
	bloodDebts,
	characterReputation,
	factions,
} from "$lib/entities/social/model/socialSchema";
import { DrizzleSynergyRepository } from "$lib/entities/synergy/infrastructure/DrizzleSynergyRepository";
import { DrizzleTrapRepository } from "$lib/entities/traps/infrastructure/DrizzleTrapRepository";
import { worldStateEntries } from "$lib/entities/world-state/model/worldStateSchema";
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
						requirementsJson: String(q.requirementsJson ?? "[]"),
						rewardsJson: String(q.rewardsJson ?? "{}"),
						createdAt: String(q.createdAt),
						updatedAt: String(q.updatedAt),
					};
					db.insert(campaignQuests).values(mappedQ).run();
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
