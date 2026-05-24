import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	CompanionRepository,
	CompanionRepositoryFailure,
} from "../domain/CompanionRepository";
import {
	type CompanionRecord,
	companionSelectSchema,
	summonCompanions,
} from "../model/companionSchema";

export interface CompanionDrizzleDatabase {
	// biome-ignore lint/suspicious/noExplicitAny: generic drizzle types
	insert(table: any): any;
	// biome-ignore lint/suspicious/noExplicitAny: generic drizzle types
	select(): any;
	// biome-ignore lint/suspicious/noExplicitAny: generic drizzle types
	update(table: any): any;
}

export class DrizzleCompanionRepository implements CompanionRepository {
	public constructor(private readonly db: CompanionDrizzleDatabase) {}

	public async saveCompanion(
		record: CompanionRecord,
	): Promise<Result<CompanionRecord, CompanionRepositoryFailure>> {
		try {
			const existing = await this.db
				.select()
				.from(summonCompanions)
				.where(eq(summonCompanions.id, record.id));

			let rows: CompanionRecord[];
			if (existing.length > 0) {
				rows = await this.db
					.update(summonCompanions)
					.set(record)
					.where(eq(summonCompanions.id, record.id))
					.returning();
			} else {
				rows = await this.db
					.insert(summonCompanions)
					.values(record)
					.returning();
			}

			const parsed = companionSelectSchema.safeParse(rows[0]);
			if (!parsed.success) {
				return fail({
					code: "REPOSITORY_WRITE_FAILED",
					message: "Drizzle retornou um companheiro inválido após salvar.",
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: `Falha ao salvar companheiro no SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	public async getCompanion(
		id: string,
	): Promise<Result<CompanionRecord | null, CompanionRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(summonCompanions)
				.where(eq(summonCompanions.id, id));

			if (rows.length === 0) {
				return ok(null);
			}

			const parsed = companionSelectSchema.safeParse(rows[0]);
			if (!parsed.success) {
				return fail({
					code: "REPOSITORY_READ_FAILED",
					message: "Registro do companheiro está corrompido no banco de dados.",
				});
			}

			return ok(parsed.data);
		} catch (error: unknown) {
			return fail({
				code: "REPOSITORY_READ_FAILED",
				message: `Falha ao buscar companheiro no SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}

	public async findCompanionsByCharacter(
		characterId: string,
	): Promise<Result<CompanionRecord[], CompanionRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(summonCompanions)
				.where(eq(summonCompanions.characterId, characterId));

			const list: CompanionRecord[] = [];
			for (const row of rows) {
				const parsed = companionSelectSchema.safeParse(row);
				if (parsed.success) {
					list.push(parsed.data);
				}
			}

			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "REPOSITORY_READ_FAILED",
				message: `Falha ao listar companheiros do personagem no SQLite: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	}
}
