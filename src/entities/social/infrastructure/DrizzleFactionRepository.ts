import { and, eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	FactionRepository,
	FactionRepositoryFailure,
} from "../domain/FactionRepository";
import {
	type BloodDebtRecord,
	bloodDebtSelectSchema,
	bloodDebts,
	type CampaignSocialLedgerRecord,
	campaignSocialLedger,
	campaignSocialLedgerSelectSchema,
	characterReputation,
	type ReputationRecord,
	reputationSelectSchema,
} from "../model/socialSchema";

export interface FactionDrizzleDatabase {
	// biome-ignore lint/suspicious/noExplicitAny: generic drizzle types
	insert(table: any): any;
	// biome-ignore lint/suspicious/noExplicitAny: generic drizzle types
	select(): any;
	// biome-ignore lint/suspicious/noExplicitAny: generic drizzle types
	update(table: any): any;
}

export class DrizzleFactionRepository implements FactionRepository {
	public constructor(private readonly db: FactionDrizzleDatabase) {}

	public async saveLedger(
		record: CampaignSocialLedgerRecord,
	): Promise<Result<CampaignSocialLedgerRecord, FactionRepositoryFailure>> {
		try {
			const existing = await this.db
				.select()
				.from(campaignSocialLedger)
				.where(eq(campaignSocialLedger.id, record.id));

			// biome-ignore lint/suspicious/noExplicitAny: rows returned dynamically by Drizzle
			let rows: any[];
			if (existing.length > 0) {
				rows = await this.db
					.update(campaignSocialLedger)
					.set(record)
					.where(eq(campaignSocialLedger.id, record.id))
					.returning();
			} else {
				rows = await this.db
					.insert(campaignSocialLedger)
					.values(record)
					.returning();
			}

			const parsed = campaignSocialLedgerSelectSchema.safeParse(rows[0]);
			if (!parsed.success) {
				return fail({
					code: "SOCIAL_REPOSITORY_WRITE_FAILED",
					message: "Drizzle retornou um ledger inválido após salvar.",
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "SOCIAL_REPOSITORY_WRITE_FAILED",
				message: `Falha ao salvar ledger social no SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	public async getLedger(
		id: string,
	): Promise<
		Result<CampaignSocialLedgerRecord | null, FactionRepositoryFailure>
	> {
		try {
			const rows = await this.db
				.select()
				.from(campaignSocialLedger)
				.where(eq(campaignSocialLedger.id, id));

			if (rows.length === 0) {
				return ok(null);
			}

			const parsed = campaignSocialLedgerSelectSchema.safeParse(rows[0]);
			if (!parsed.success) {
				return fail({
					code: "SOCIAL_REPOSITORY_READ_FAILED",
					message:
						"Registro do ledger social está corrompido no banco de dados.",
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: `Falha ao carregar ledger social do SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	public async saveReputation(
		record: ReputationRecord,
	): Promise<Result<ReputationRecord, FactionRepositoryFailure>> {
		try {
			const existing = await this.db
				.select()
				.from(characterReputation)
				.where(eq(characterReputation.id, record.id));

			// biome-ignore lint/suspicious/noExplicitAny: rows returned dynamically by Drizzle
			let rows: any[];
			if (existing.length > 0) {
				rows = await this.db
					.update(characterReputation)
					.set(record)
					.where(eq(characterReputation.id, record.id))
					.returning();
			} else {
				rows = await this.db
					.insert(characterReputation)
					.values(record)
					.returning();
			}

			const parsed = reputationSelectSchema.safeParse(rows[0]);
			if (!parsed.success) {
				return fail({
					code: "SOCIAL_REPOSITORY_WRITE_FAILED",
					message: "Drizzle retornou uma reputação inválida após salvar.",
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "SOCIAL_REPOSITORY_WRITE_FAILED",
				message: `Falha ao salvar reputação no SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	public async findReputation(
		characterId: string,
		factionId: string,
	): Promise<Result<ReputationRecord | null, FactionRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(characterReputation)
				.where(
					and(
						eq(characterReputation.characterId, characterId),
						eq(characterReputation.factionId, factionId),
					),
				);

			if (rows.length === 0) {
				return ok(null);
			}

			const parsed = reputationSelectSchema.safeParse(rows[0]);
			if (!parsed.success) {
				return fail({
					code: "SOCIAL_REPOSITORY_READ_FAILED",
					message:
						"Registro da reputação de facção está corrompido no banco de dados.",
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: `Falha ao buscar reputação de facção no SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	public async saveBloodDebt(
		record: BloodDebtRecord,
	): Promise<Result<BloodDebtRecord, FactionRepositoryFailure>> {
		try {
			const existing = await this.db
				.select()
				.from(bloodDebts)
				.where(eq(bloodDebts.id, record.id));

			// biome-ignore lint/suspicious/noExplicitAny: rows returned dynamically by Drizzle
			let rows: any[];
			if (existing.length > 0) {
				rows = await this.db
					.update(bloodDebts)
					.set(record)
					.where(eq(bloodDebts.id, record.id))
					.returning();
			} else {
				rows = await this.db.insert(bloodDebts).values(record).returning();
			}

			const parsed = bloodDebtSelectSchema.safeParse(rows[0]);
			if (!parsed.success) {
				return fail({
					code: "SOCIAL_REPOSITORY_WRITE_FAILED",
					message:
						"Drizzle retornou uma dívida de sangue inválida após salvar.",
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "SOCIAL_REPOSITORY_WRITE_FAILED",
				message: `Falha ao salvar dívida de sangue no SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	public async findBloodDebtsByCharacter(
		characterId: string,
	): Promise<Result<BloodDebtRecord[], FactionRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(bloodDebts)
				.where(eq(bloodDebts.characterId, characterId));

			const list: BloodDebtRecord[] = [];
			for (const row of rows) {
				const parsed = bloodDebtSelectSchema.safeParse(row);
				if (parsed.success) {
					list.push(parsed.data);
				}
			}

			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: `Falha ao buscar dívidas de sangue do personagem no SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	public async findBloodDebtById(
		id: string,
	): Promise<Result<BloodDebtRecord | null, FactionRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(bloodDebts)
				.where(eq(bloodDebts.id, id));

			if (rows.length === 0) {
				return ok(null);
			}

			const parsed = bloodDebtSelectSchema.safeParse(rows[0]);
			if (!parsed.success) {
				return fail({
					code: "SOCIAL_REPOSITORY_READ_FAILED",
					message:
						"Registro da dívida de sangue está corrompido no banco de dados.",
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "SOCIAL_REPOSITORY_READ_FAILED",
				message: `Falha ao buscar dívida de sangue no SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}
}
