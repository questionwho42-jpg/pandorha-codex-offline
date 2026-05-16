import { and, eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	SocialRepository,
	SocialRepositoryFailure,
} from "../domain/SocialRepository";
import {
	type BloodDebtRecord,
	bloodDebtSelectSchema,
	bloodDebts,
	characterReputation,
	type FactionRecord,
	factionSelectSchema,
	factions,
	type ReputationRecord,
	reputationSelectSchema,
} from "../model/socialSchema";

export interface SocialDrizzleDatabase {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic ORM table mapper
	insert(table: any): any;
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic ORM query builder
	select(): any;
}

export class DrizzleSocialRepository implements SocialRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance
	public constructor(private readonly db: any) {}

	public async saveFaction(
		record: FactionRecord,
	): Promise<Result<FactionRecord, SocialRepositoryFailure>> {
		try {
			await this.db
				.insert(factions)
				.values(record)
				.onConflictDoUpdate({
					target: factions.id,
					set: {
						name: record.name,
						description: record.description,
						alignment: record.alignment,
					},
				})
				.run();
			return ok(record);
		} catch (error: unknown) {
			return fail({
				code: "SOCIAL_REPOSITORY_WRITE_FAILED",
				message: "Could not persist faction.",
				details: { cause: String(error) },
			});
		}
	}

	public async findFactionById(
		id: string,
	): Promise<Result<FactionRecord, SocialRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(factions)
				.where(eq(factions.id, id))
				.all();
			const row = rows[0];
			if (!row)
				return fail({
					code: "FACTION_NOT_FOUND",
					message: "Faction not found",
				});
			return ok(factionSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: "Error reading faction",
				details: { cause: String(error) },
			});
		}
	}

	public async listFactions(): Promise<
		Result<readonly FactionRecord[], SocialRepositoryFailure>
	> {
		try {
			const rows = await this.db.select().from(factions).all();
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic database row
			return ok(rows.map((r: any) => factionSelectSchema.parse(r)));
		} catch (error: unknown) {
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: "Error listing factions",
				details: { cause: String(error) },
			});
		}
	}

	public async saveReputation(
		record: ReputationRecord,
	): Promise<Result<ReputationRecord, SocialRepositoryFailure>> {
		try {
			await this.db
				.insert(characterReputation)
				.values(record)
				.onConflictDoUpdate({
					target: [
						characterReputation.characterId,
						characterReputation.factionId,
					],
					set: {
						value: record.value,
						updatedAt: record.updatedAt,
					},
				})
				.run();
			return ok(record);
		} catch (error: unknown) {
			return fail({
				code: "SOCIAL_REPOSITORY_WRITE_FAILED",
				message: "Could not persist reputation.",
				details: { cause: String(error) },
			});
		}
	}

	public async findReputation(
		characterId: string,
		factionId: string,
	): Promise<Result<ReputationRecord, SocialRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(characterReputation)
				.where(
					and(
						eq(characterReputation.characterId, characterId),
						eq(characterReputation.factionId, factionId),
					),
				)
				.all();
			const row = rows[0];
			if (!row)
				return fail({
					code: "REPUTATION_NOT_FOUND",
					message: "Reputation not found",
				});
			return ok(reputationSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: "Error reading reputation",
				details: { cause: String(error) },
			});
		}
	}

	public async listReputationsByCharacter(
		characterId: string,
	): Promise<Result<readonly ReputationRecord[], SocialRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(characterReputation)
				.where(eq(characterReputation.characterId, characterId))
				.all();
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic database row
			return ok(rows.map((r: any) => reputationSelectSchema.parse(r)));
		} catch (error: unknown) {
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: "Error listing reputations",
				details: { cause: String(error) },
			});
		}
	}

	public async saveBloodDebt(
		record: BloodDebtRecord,
	): Promise<Result<BloodDebtRecord, SocialRepositoryFailure>> {
		try {
			await this.db
				.insert(bloodDebts)
				.values(record)
				.onConflictDoUpdate({
					target: bloodDebts.id,
					set: {
						debtValue: record.debtValue,
						isPaid: record.isPaid,
					},
				})
				.run();
			return ok(record);
		} catch (error: unknown) {
			return fail({
				code: "SOCIAL_REPOSITORY_WRITE_FAILED",
				message: "Could not persist blood debt.",
				details: { cause: String(error) },
			});
		}
	}

	public async listBloodDebtsByCharacter(
		characterId: string,
	): Promise<Result<readonly BloodDebtRecord[], SocialRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(bloodDebts)
				.where(eq(bloodDebts.characterId, characterId))
				.all();
			// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic database row
			return ok(rows.map((r: any) => bloodDebtSelectSchema.parse(r)));
		} catch (error: unknown) {
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: "Error listing blood debts",
				details: { cause: String(error) },
			});
		}
	}
}
