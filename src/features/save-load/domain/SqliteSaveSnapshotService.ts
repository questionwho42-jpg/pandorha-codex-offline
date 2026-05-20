import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/sql-js";
import {
	type CampAssignmentRecord,
	type CampSessionRecord,
	campAssignmentInsertSchema,
	campAssignmentSelectSchema,
	campAssignments,
	campSessionInsertSchema,
	campSessionSelectSchema,
	campSessions,
} from "$lib/entities/camp-session";
import { characterSelectSchema, characters } from "$lib/entities/character";
import {
	type ClockRecord,
	clockInsertSchema,
	clockSelectSchema,
	clocks,
} from "$lib/entities/clock";
import {
	type FactionStandingRecord,
	factionStandingInsertSchema,
	factionStandingSelectSchema,
	factionStandings,
} from "$lib/entities/faction";
import {
	type SocialEncounterEventRecord,
	type SocialEncounterRecord,
	socialEncounterEventInsertSchema,
	socialEncounterEventSelectSchema,
	socialEncounterEvents,
	socialEncounterInsertSchema,
	socialEncounterSelectSchema,
	socialEncounters,
} from "$lib/entities/social-encounter";
import {
	worldStateEntries,
	worldStateEntryInsertSchema,
	worldStateEntrySelectSchema,
} from "$lib/entities/world-state";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	DatabaseFileStorage,
	SqliteDatabase,
	SqliteWasmFactory,
} from "$lib/shared/persistence";
import {
	loadedSessionStateV1Schema,
	loadedSessionStateV2Schema,
	loadedSessionStateV3Schema,
	loadedSessionStateV4Schema,
	migrateLoadedSessionToCurrent,
	saveMetadataAnySchema,
	saveMetadataV4Schema,
} from "../model/saveLoadSchemas";
import type { LoadedSessionState } from "../model/saveLoadTypes";
import type {
	SaveSnapshotFailure,
	SaveSnapshotResult,
} from "../model/saveSnapshotTypes";

const SAVE_METADATA_KEY = "system:save:primary:metadata";

interface SqliteSaveSnapshotServiceInput {
	readonly storage: DatabaseFileStorage;
	readonly createSqlite: SqliteWasmFactory;
}

/**
 * @description Persists the primary save snapshot into SQLite tables already prepared by the Worker bootstrap phase.
 * @rule docs/architecture/worker_rpc_spec.md - Worker operations return typed results across the RPC boundary.
 */
export class SqliteSaveSnapshotService {
	public constructor(private readonly input: SqliteSaveSnapshotServiceInput) {}

	public async saveSnapshot(
		input: unknown,
	): Promise<Result<SaveSnapshotResult, SaveSnapshotFailure>> {
		const parsedSnapshot = loadedSessionStateV4Schema.safeParse(input);
		if (!parsedSnapshot.success) {
			return fail({
				code: "INVALID_SAVE_SNAPSHOT",
				message: "Save snapshot failed validation before persistence.",
				details: {
					issues: parsedSnapshot.error.issues.map((issue) => issue.message),
				},
			});
		}

		const opened = await this.openExistingDatabase();
		if (!opened.success) {
			return fail(opened.error);
		}

		const database = opened.data;
		try {
			const db = drizzle(database);
			const clockRecords = parsedSnapshot.data.clocks.map((clock) =>
				clockInsertSchema.parse(clock),
			);
			const campSessionRecords = parsedSnapshot.data.campSessions.map(
				(session) => campSessionInsertSchema.parse(session),
			);
			const campAssignmentRecords = parsedSnapshot.data.campAssignments.map(
				(assignment) => campAssignmentInsertSchema.parse(assignment),
			);
			const factionStandingRecords = parsedSnapshot.data.factionStandings.map(
				(standing) => factionStandingInsertSchema.parse(standing),
			);
			const socialEncounterRecords = parsedSnapshot.data.socialEncounters.map(
				(encounter) => socialEncounterInsertSchema.parse(encounter),
			);
			const socialEncounterEventRecords =
				parsedSnapshot.data.socialEncounterEvents.map((event) =>
					socialEncounterEventInsertSchema.parse(event),
				);
			const worldStateRecords = parsedSnapshot.data.worldState.map((flag) =>
				worldStateEntryInsertSchema.parse({
					key: flag.key,
					valueJson: JSON.stringify(flag.value),
					updatedAt: flag.updatedAt,
				}),
			);
			const metadataRecord = worldStateEntryInsertSchema.parse({
				key: SAVE_METADATA_KEY,
				valueJson: JSON.stringify(
					saveMetadataV4Schema.parse({
						version: parsedSnapshot.data.version,
						savedAt: parsedSnapshot.data.savedAt,
					}),
				),
				updatedAt: parsedSnapshot.data.savedAt,
			});

			db.transaction((tx) => {
				tx.delete(socialEncounterEvents).run();
				tx.delete(socialEncounters).run();
				tx.delete(campAssignments).run();
				tx.delete(campSessions).run();
				tx.delete(clocks).run();
				tx.delete(factionStandings).run();
				tx.delete(characters).run();
				tx.delete(worldStateEntries).run();
				if (clockRecords.length > 0) {
					tx.insert(clocks).values(clockRecords).run();
				}
				if (campSessionRecords.length > 0) {
					tx.insert(campSessions).values(campSessionRecords).run();
				}
				if (campAssignmentRecords.length > 0) {
					tx.insert(campAssignments).values(campAssignmentRecords).run();
				}
				if (parsedSnapshot.data.characters.length > 0) {
					tx.insert(characters).values(parsedSnapshot.data.characters).run();
				}
				if (factionStandingRecords.length > 0) {
					tx.insert(factionStandings).values(factionStandingRecords).run();
				}
				if (socialEncounterRecords.length > 0) {
					tx.insert(socialEncounters).values(socialEncounterRecords).run();
				}
				if (socialEncounterEventRecords.length > 0) {
					tx.insert(socialEncounterEvents)
						.values(socialEncounterEventRecords)
						.run();
				}
				tx.insert(worldStateEntries)
					.values([...worldStateRecords, metadataRecord])
					.run();
			});

			const exported = this.exportDatabase(database);
			if (!exported.success) {
				database.close();
				return fail(exported.error);
			}

			const written = await this.input.storage.writeDatabaseFile(exported.data);
			if (!written.success) {
				database.close();
				return fail(written.error);
			}

			database.close();
			return ok({
				saveId: "primary",
				version: 4,
				savedAt: parsedSnapshot.data.savedAt,
				characterCount: parsedSnapshot.data.characters.length,
				worldStateCount: parsedSnapshot.data.worldState.length,
				clockCount: parsedSnapshot.data.clocks.length,
				campSessionCount: parsedSnapshot.data.campSessions.length,
				campAssignmentCount: parsedSnapshot.data.campAssignments.length,
				factionStandingCount: parsedSnapshot.data.factionStandings.length,
				socialEncounterCount: parsedSnapshot.data.socialEncounters.length,
				socialEncounterEventCount:
					parsedSnapshot.data.socialEncounterEvents.length,
			});
		} catch (error: unknown) {
			database.close();
			return fail({
				code: "SQLITE_SNAPSHOT_WRITE_FAILED",
				message: "SQLite snapshot transaction could not be persisted.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async loadSnapshot(): Promise<
		Result<LoadedSessionState, SaveSnapshotFailure>
	> {
		const opened = await this.openExistingDatabase();
		if (!opened.success) {
			return fail(opened.error);
		}

		const database = opened.data;
		try {
			const db = drizzle(database);
			const metadataRows = db
				.select()
				.from(worldStateEntries)
				.where(eq(worldStateEntries.key, SAVE_METADATA_KEY))
				.all();
			const metadataRow = metadataRows[0];
			if (!metadataRow) {
				database.close();
				return fail({
					code: "SAVE_NOT_FOUND",
					message: "Primary save metadata was not found.",
				});
			}

			const parsedMetadataRow =
				worldStateEntrySelectSchema.safeParse(metadataRow);
			if (!parsedMetadataRow.success) {
				database.close();
				return corruptedSnapshotFailure("metadata row failed validation");
			}

			const parsedMetadata = saveMetadataAnySchema.safeParse(
				JSON.parse(parsedMetadataRow.data.valueJson) as unknown,
			);
			if (!parsedMetadata.success) {
				database.close();
				return corruptedSnapshotFailure("metadata payload failed validation");
			}

			const parsedCharacters = [];
			for (const row of db
				.select()
				.from(characters)
				.orderBy(asc(characters.id))
				.all()) {
				const parsed = characterSelectSchema.safeParse(row);
				if (!parsed.success) {
					database.close();
					return corruptedSnapshotFailure("character row failed validation");
				}
				parsedCharacters.push(parsed.data);
			}

			const parsedWorldState = [];
			for (const row of db
				.select()
				.from(worldStateEntries)
				.orderBy(asc(worldStateEntries.key))
				.all()) {
				if (row.key === SAVE_METADATA_KEY) {
					continue;
				}

				const parsedRow = worldStateEntrySelectSchema.safeParse(row);
				if (!parsedRow.success) {
					database.close();
					return corruptedSnapshotFailure("world-state row failed validation");
				}

				parsedWorldState.push({
					key: parsedRow.data.key,
					value: JSON.parse(parsedRow.data.valueJson) as unknown,
					updatedAt: parsedRow.data.updatedAt,
				});
			}

			if (parsedMetadata.data.version === 1) {
				const parsedLoaded = migrateLoadedSessionToCurrent(
					loadedSessionStateV1Schema.parse({
						version: parsedMetadata.data.version,
						savedAt: parsedMetadata.data.savedAt,
						characters: parsedCharacters,
						worldState: parsedWorldState,
					}),
				);
				database.close();
				return ok(parsedLoaded);
			}

			const parsedClocks = readClocks(db);
			if (!parsedClocks.success) {
				database.close();
				return parsedClocks;
			}
			const parsedCampSessions = readCampSessions(db);
			if (!parsedCampSessions.success) {
				database.close();
				return parsedCampSessions;
			}
			const parsedCampAssignments = readCampAssignments(db);
			if (!parsedCampAssignments.success) {
				database.close();
				return parsedCampAssignments;
			}

			if (parsedMetadata.data.version === 2) {
				const parsedLoaded = migrateLoadedSessionToCurrent(
					loadedSessionStateV2Schema.parse({
						version: parsedMetadata.data.version,
						savedAt: parsedMetadata.data.savedAt,
						characters: parsedCharacters,
						worldState: parsedWorldState,
						clocks: parsedClocks.data,
						campSessions: parsedCampSessions.data,
						campAssignments: parsedCampAssignments.data,
					}),
				);
				database.close();
				return ok(parsedLoaded);
			}

			const parsedFactionStandings = readFactionStandings(db);
			if (!parsedFactionStandings.success) {
				database.close();
				return parsedFactionStandings;
			}

			if (parsedMetadata.data.version === 3) {
				const parsedLoaded = migrateLoadedSessionToCurrent(
					loadedSessionStateV3Schema.parse({
						version: parsedMetadata.data.version,
						savedAt: parsedMetadata.data.savedAt,
						characters: parsedCharacters,
						worldState: parsedWorldState,
						clocks: parsedClocks.data,
						campSessions: parsedCampSessions.data,
						campAssignments: parsedCampAssignments.data,
						factionStandings: parsedFactionStandings.data,
					}),
				);
				database.close();
				return ok(parsedLoaded);
			}

			const parsedSocialEncounters = readSocialEncounters(db);
			if (!parsedSocialEncounters.success) {
				database.close();
				return parsedSocialEncounters;
			}
			const parsedSocialEncounterEvents = readSocialEncounterEvents(db);
			if (!parsedSocialEncounterEvents.success) {
				database.close();
				return parsedSocialEncounterEvents;
			}

			const parsedLoaded = loadedSessionStateV4Schema.parse({
				version: parsedMetadata.data.version,
				savedAt: parsedMetadata.data.savedAt,
				characters: parsedCharacters,
				worldState: parsedWorldState,
				clocks: parsedClocks.data,
				campSessions: parsedCampSessions.data,
				campAssignments: parsedCampAssignments.data,
				factionStandings: parsedFactionStandings.data,
				socialEncounters: parsedSocialEncounters.data,
				socialEncounterEvents: parsedSocialEncounterEvents.data,
			});
			database.close();
			return ok(parsedLoaded);
		} catch (error: unknown) {
			database.close();
			return corruptedSnapshotFailure(stringifyCause(error));
		}
	}

	private async openExistingDatabase(): Promise<
		Result<SqliteDatabase, SaveSnapshotFailure>
	> {
		const storedFile = await this.input.storage.readDatabaseFile();
		if (!storedFile.success) {
			return fail(storedFile.error);
		}
		if (storedFile.data === null) {
			return fail({
				code: "DATABASE_NOT_INITIALIZED",
				message: "SQLite database file is not initialized yet.",
			});
		}

		const sqlite = await this.createSqliteModule();
		if (!sqlite.success) {
			return fail(sqlite.error);
		}

		try {
			const database = new sqlite.data.Database(storedFile.data);
			const readable = this.validateOpenedDatabase(database);
			if (!readable.success) {
				database.close();
				return fail(readable.error);
			}

			return ok(database);
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_DATABASE_FILE",
				message: "Stored SQLite database file could not be opened.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	private async createSqliteModule(): Promise<
		Result<Awaited<ReturnType<SqliteWasmFactory>>, SaveSnapshotFailure>
	> {
		try {
			return ok(await this.input.createSqlite());
		} catch (error: unknown) {
			return fail({
				code: "SQLITE_WASM_INIT_FAILED",
				message: "SQLite WASM module could not be initialized.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	private exportDatabase(
		database: SqliteDatabase,
	): Result<Uint8Array, SaveSnapshotFailure> {
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

	private validateOpenedDatabase(
		database: SqliteDatabase,
	): Result<void, SaveSnapshotFailure> {
		try {
			const result = database.exec(
				"SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;",
			);
			const tableNames = new Set(
				(result[0]?.values ?? []).map((row) => String(row[0])),
			);
			if (
				!tableNames.has("characters") ||
				!tableNames.has("world_state_entries") ||
				!tableNames.has("clocks") ||
				!tableNames.has("camp_sessions") ||
				!tableNames.has("camp_assignments") ||
				!tableNames.has("faction_standings") ||
				!tableNames.has("social_encounters") ||
				!tableNames.has("social_encounter_events")
			) {
				return fail({
					code: "CORRUPTED_DATABASE_FILE",
					message: "Stored SQLite database is missing required tables.",
				});
			}

			return ok(undefined);
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_DATABASE_FILE",
				message: "Stored SQLite database file failed validation.",
				details: { cause: stringifyCause(error) },
			});
		}
	}
}

function readClocks(
	db: ReturnType<typeof drizzle>,
): Result<readonly ClockRecord[], SaveSnapshotFailure> {
	const parsedClocks: ClockRecord[] = [];
	for (const row of db.select().from(clocks).orderBy(asc(clocks.id)).all()) {
		const parsed = clockSelectSchema.safeParse(row);
		if (!parsed.success) {
			return corruptedSnapshotFailure("clock row failed validation");
		}
		parsedClocks.push(parsed.data);
	}
	return ok(parsedClocks);
}

function readCampSessions(
	db: ReturnType<typeof drizzle>,
): Result<readonly CampSessionRecord[], SaveSnapshotFailure> {
	const parsedSessions: CampSessionRecord[] = [];
	for (const row of db
		.select()
		.from(campSessions)
		.orderBy(asc(campSessions.id))
		.all()) {
		const parsed = campSessionSelectSchema.safeParse(row);
		if (!parsed.success) {
			return corruptedSnapshotFailure("camp session row failed validation");
		}
		parsedSessions.push(parsed.data);
	}
	return ok(parsedSessions);
}

function readCampAssignments(
	db: ReturnType<typeof drizzle>,
): Result<readonly CampAssignmentRecord[], SaveSnapshotFailure> {
	const parsedAssignments: CampAssignmentRecord[] = [];
	for (const row of db
		.select()
		.from(campAssignments)
		.orderBy(asc(campAssignments.id))
		.all()) {
		const parsed = campAssignmentSelectSchema.safeParse(row);
		if (!parsed.success) {
			return corruptedSnapshotFailure("camp assignment row failed validation");
		}
		parsedAssignments.push(parsed.data);
	}
	return ok(parsedAssignments);
}

function readFactionStandings(
	db: ReturnType<typeof drizzle>,
): Result<readonly FactionStandingRecord[], SaveSnapshotFailure> {
	const parsedStandings: FactionStandingRecord[] = [];
	for (const row of db
		.select()
		.from(factionStandings)
		.orderBy(asc(factionStandings.factionId))
		.all()) {
		const parsed = factionStandingSelectSchema.safeParse(row);
		if (!parsed.success) {
			return corruptedSnapshotFailure("faction standing row failed validation");
		}
		parsedStandings.push(parsed.data);
	}
	return ok(parsedStandings);
}

function readSocialEncounters(
	db: ReturnType<typeof drizzle>,
): Result<readonly SocialEncounterRecord[], SaveSnapshotFailure> {
	const parsedEncounters: SocialEncounterRecord[] = [];
	for (const row of db
		.select()
		.from(socialEncounters)
		.orderBy(asc(socialEncounters.id))
		.all()) {
		const parsed = socialEncounterSelectSchema.safeParse(row);
		if (!parsed.success) {
			return corruptedSnapshotFailure("social encounter row failed validation");
		}
		parsedEncounters.push(parsed.data);
	}
	return ok(parsedEncounters);
}

function readSocialEncounterEvents(
	db: ReturnType<typeof drizzle>,
): Result<readonly SocialEncounterEventRecord[], SaveSnapshotFailure> {
	const parsedEvents: SocialEncounterEventRecord[] = [];
	for (const row of db
		.select()
		.from(socialEncounterEvents)
		.orderBy(
			asc(socialEncounterEvents.encounterId),
			asc(socialEncounterEvents.sequence),
		)
		.all()) {
		const parsed = socialEncounterEventSelectSchema.safeParse(row);
		if (!parsed.success) {
			return corruptedSnapshotFailure(
				"social encounter event row failed validation",
			);
		}
		parsedEvents.push(parsed.data);
	}
	return ok(parsedEvents);
}

function corruptedSnapshotFailure(
	cause: string,
): Result<never, SaveSnapshotFailure> {
	return fail({
		code: "CORRUPTED_SAVE_SNAPSHOT",
		message: "Loaded SQLite snapshot failed validation.",
		details: { cause },
	});
}

function stringifyCause(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
