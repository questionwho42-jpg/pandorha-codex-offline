import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	ILoreRepository,
	LoreRepositoryFailure,
} from "../domain/ILoreRepository";
import {
	type CampaignRumorRecord,
	campaignRumorSelectSchema,
	campaignRumors,
	type LoreEncounterRecord,
	loreEncounterSelectSchema,
	loreEncounters,
} from "../model/loreSchema";

export class DrizzleLoreRepository implements ILoreRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic database instance
	public constructor(private readonly db: any) {}

	public async saveEncounter(
		encounter: LoreEncounterRecord,
	): Promise<Result<LoreEncounterRecord, LoreRepositoryFailure>> {
		try {
			await this.db
				.insert(loreEncounters)
				.values({
					id: encounter.id,
					tileId: encounter.tileId,
					title: encounter.title,
					content: encounter.content,
					factionIdRequired: encounter.factionIdRequired ?? null,
					reputationRequired: encounter.reputationRequired ?? 0,
					requiredClockId: encounter.requiredClockId ?? null,
					requiredClockValue: encounter.requiredClockValue ?? 0,
					isTriggered: encounter.isTriggered,
					createdAt: encounter.createdAt,
					updatedAt: encounter.updatedAt,
				})
				.onConflictDoUpdate({
					target: loreEncounters.id,
					set: {
						tileId: encounter.tileId,
						title: encounter.title,
						content: encounter.content,
						factionIdRequired: encounter.factionIdRequired ?? null,
						reputationRequired: encounter.reputationRequired ?? 0,
						requiredClockId: encounter.requiredClockId ?? null,
						requiredClockValue: encounter.requiredClockValue ?? 0,
						isTriggered: encounter.isTriggered,
						updatedAt: encounter.updatedAt,
					},
				})
				.run();
			return ok(encounter);
		} catch (error: unknown) {
			return fail({
				code: "LORE_REPOSITORY_WRITE_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Error saving lore encounter to SQLite.",
				details: error,
			});
		}
	}

	public async findEncounterById(
		id: string,
	): Promise<Result<LoreEncounterRecord | null, LoreRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(loreEncounters)
				.where(eq(loreEncounters.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return ok(null);
			}

			const mapped = {
				...row,
				factionIdRequired: row.factionIdRequired ?? null,
				reputationRequired: row.reputationRequired ?? 0,
				requiredClockId: row.requiredClockId ?? null,
				requiredClockValue: row.requiredClockValue ?? 0,
				isTriggered: row.isTriggered === 1 || row.isTriggered === true,
			};

			return ok(loreEncounterSelectSchema.parse(mapped));
		} catch (error: unknown) {
			return fail({
				code: "LORE_REPOSITORY_READ_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Error reading lore encounter from SQLite.",
				details: error,
			});
		}
	}

	public async listEncountersByTile(
		tileId: string,
	): Promise<Result<readonly LoreEncounterRecord[], LoreRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(loreEncounters)
				.where(eq(loreEncounters.tileId, tileId))
				.all();

			// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic row mapping
			const mapped = rows.map((row: any) => {
				return loreEncounterSelectSchema.parse({
					...row,
					factionIdRequired: row.factionIdRequired ?? null,
					reputationRequired: row.reputationRequired ?? 0,
					requiredClockId: row.requiredClockId ?? null,
					requiredClockValue: row.requiredClockValue ?? 0,
					isTriggered: row.isTriggered === 1 || row.isTriggered === true,
				});
			});
			return ok(mapped);
		} catch (error: unknown) {
			return fail({
				code: "LORE_REPOSITORY_READ_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Error listing lore encounters by tile from SQLite.",
				details: error,
			});
		}
	}

	public async listAllEncounters(): Promise<
		Result<readonly LoreEncounterRecord[], LoreRepositoryFailure>
	> {
		try {
			const rows = await this.db.select().from(loreEncounters).all();
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic row mapping
			const mapped = rows.map((row: any) => {
				return loreEncounterSelectSchema.parse({
					...row,
					factionIdRequired: row.factionIdRequired ?? null,
					reputationRequired: row.reputationRequired ?? 0,
					requiredClockId: row.requiredClockId ?? null,
					requiredClockValue: row.requiredClockValue ?? 0,
					isTriggered: row.isTriggered === 1 || row.isTriggered === true,
				});
			});
			return ok(mapped);
		} catch (error: unknown) {
			return fail({
				code: "LORE_REPOSITORY_READ_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Error listing all lore encounters from SQLite.",
				details: error,
			});
		}
	}

	public async saveRumor(
		rumor: CampaignRumorRecord,
	): Promise<Result<CampaignRumorRecord, LoreRepositoryFailure>> {
		try {
			await this.db
				.insert(campaignRumors)
				.values({
					id: rumor.id,
					tileId: rumor.tileId,
					factionId: rumor.factionId ?? null,
					title: rumor.title,
					content: rumor.content,
					isDiscovered: rumor.isDiscovered,
					createdAt: rumor.createdAt,
					updatedAt: rumor.updatedAt,
				})
				.onConflictDoUpdate({
					target: campaignRumors.id,
					set: {
						tileId: rumor.tileId,
						factionId: rumor.factionId ?? null,
						title: rumor.title,
						content: rumor.content,
						isDiscovered: rumor.isDiscovered,
						updatedAt: rumor.updatedAt,
					},
				})
				.run();
			return ok(rumor);
		} catch (error: unknown) {
			return fail({
				code: "LORE_REPOSITORY_WRITE_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Error saving campaign rumor to SQLite.",
				details: error,
			});
		}
	}

	public async findRumorById(
		id: string,
	): Promise<Result<CampaignRumorRecord | null, LoreRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(campaignRumors)
				.where(eq(campaignRumors.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return ok(null);
			}

			const mapped = {
				...row,
				factionId: row.factionId ?? null,
				isDiscovered: row.isDiscovered === 1 || row.isDiscovered === true,
			};

			return ok(campaignRumorSelectSchema.parse(mapped));
		} catch (error: unknown) {
			return fail({
				code: "LORE_REPOSITORY_READ_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Error reading campaign rumor from SQLite.",
				details: error,
			});
		}
	}

	public async listRumorsByTile(
		tileId: string,
	): Promise<Result<readonly CampaignRumorRecord[], LoreRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(campaignRumors)
				.where(eq(campaignRumors.tileId, tileId))
				.all();

			// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic row mapping
			const mapped = rows.map((row: any) => {
				return campaignRumorSelectSchema.parse({
					...row,
					factionId: row.factionId ?? null,
					isDiscovered: row.isDiscovered === 1 || row.isDiscovered === true,
				});
			});
			return ok(mapped);
		} catch (error: unknown) {
			return fail({
				code: "LORE_REPOSITORY_READ_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Error listing campaign rumors by tile from SQLite.",
				details: error,
			});
		}
	}

	public async listAllRumors(): Promise<
		Result<readonly CampaignRumorRecord[], LoreRepositoryFailure>
	> {
		try {
			const rows = await this.db.select().from(campaignRumors).all();
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic row mapping
			const mapped = rows.map((row: any) => {
				return campaignRumorSelectSchema.parse({
					...row,
					factionId: row.factionId ?? null,
					isDiscovered: row.isDiscovered === 1 || row.isDiscovered === true,
				});
			});
			return ok(mapped);
		} catch (error: unknown) {
			return fail({
				code: "LORE_REPOSITORY_READ_FAILED",
				message:
					error instanceof Error
						? error.message
						: "Error listing all campaign rumors from SQLite.",
				details: error,
			});
		}
	}
}
