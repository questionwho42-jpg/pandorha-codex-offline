import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	BastionRepository,
	BastionRepositoryFailure,
} from "../domain/BastionRepository";
import {
	type BastionModuleRecord,
	type BastionRecord,
	bastionModuleSelectSchema,
	bastionModules,
	bastionSelectSchema,
	bastions,
} from "../model/bastionSchema";

export class DrizzleBastionRepository implements BastionRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance
	public constructor(private readonly db: any) {}

	public async save(
		record: BastionRecord,
	): Promise<Result<BastionRecord, BastionRepositoryFailure>> {
		try {
			await this.db
				.insert(bastions)
				.values(record)
				.onConflictDoUpdate({
					target: bastions.id,
					set: {
						name: record.name,
						chassisId: record.chassisId,
						tier: record.tier,
						structure: record.structure,
						vigilance: record.vigilance,
						logistics: record.logistics,
						integrityCurrent: record.integrityCurrent,
						threatCurrent: record.threatCurrent,
						vaultGold: record.vaultGold,
						updatedAt: record.updatedAt,
					},
				})
				.run();
			return ok(record);
		} catch (error: unknown) {
			return fail({
				code: "BASTION_REPOSITORY_WRITE_FAILED",
				message: "Could not persist bastion record.",
				details: { cause: String(error) },
			});
		}
	}

	public async findById(
		id: string,
	): Promise<Result<BastionRecord, BastionRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(bastions)
				.where(eq(bastions.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return fail({
					code: "BASTION_NOT_FOUND",
					message: `Bastião ${id} não encontrado.`,
				});
			}
			return ok(bastionSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "BASTION_REPOSITORY_READ_FAILED",
				message: "Could not read bastion record.",
				details: { cause: String(error) },
			});
		}
	}

	public async saveModule(
		record: BastionModuleRecord,
	): Promise<Result<BastionModuleRecord, BastionRepositoryFailure>> {
		try {
			await this.db
				.insert(bastionModules)
				.values({
					id: record.id,
					bastionId: record.bastionId,
					moduleId: record.moduleId,
					tier: record.tier,
					progressCurrent: record.progressCurrent,
					progressMax: record.progressMax,
					isBroken: record.isBroken ? 1 : 0,
					createdAt: record.createdAt,
					updatedAt: record.updatedAt,
				})
				.onConflictDoUpdate({
					target: bastionModules.id,
					set: {
						tier: record.tier,
						progressCurrent: record.progressCurrent,
						progressMax: record.progressMax,
						isBroken: record.isBroken ? 1 : 0,
						updatedAt: record.updatedAt,
					},
				})
				.run();
			return ok(record);
		} catch (error: unknown) {
			return fail({
				code: "BASTION_REPOSITORY_WRITE_FAILED",
				message: "Could not persist bastion module record.",
				details: { cause: String(error) },
			});
		}
	}

	public async findModuleById(
		id: string,
	): Promise<Result<BastionModuleRecord, BastionRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(bastionModules)
				.where(eq(bastionModules.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return fail({
					code: "BASTION_MODULE_NOT_FOUND",
					message: `Módulo do Bastião ${id} não encontrado.`,
				});
			}
			return ok(
				bastionModuleSelectSchema.parse({
					...row,
					isBroken: row.isBroken === 1 || row.isBroken === true,
				}),
			);
		} catch (error: unknown) {
			return fail({
				code: "BASTION_REPOSITORY_READ_FAILED",
				message: "Could not read bastion module record.",
				details: { cause: String(error) },
			});
		}
	}

	public async findModulesByBastionId(
		bastionId: string,
	): Promise<Result<readonly BastionModuleRecord[], BastionRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(bastionModules)
				.where(eq(bastionModules.bastionId, bastionId))
				.all();
			const mapped = rows.map((r: any) => {
				return bastionModuleSelectSchema.parse({
					...r,
					isBroken: r.isBroken === 1 || r.isBroken === true,
				});
			});
			return ok(mapped);
		} catch (error: unknown) {
			return fail({
				code: "BASTION_REPOSITORY_READ_FAILED",
				message: "Could not read bastion modules.",
				details: { cause: String(error) },
			});
		}
	}

	public async deleteModule(
		id: string,
	): Promise<Result<void, BastionRepositoryFailure>> {
		try {
			await this.db
				.delete(bastionModules)
				.where(eq(bastionModules.id, id))
				.run();
			return ok(undefined);
		} catch (error: unknown) {
			return fail({
				code: "BASTION_REPOSITORY_WRITE_FAILED",
				message: "Could not delete bastion module.",
				details: { cause: String(error) },
			});
		}
	}

	public async loadFirstBastion(): Promise<
		Result<
			{ bastion: BastionRecord | null; modules: BastionModuleRecord[] },
			BastionRepositoryFailure
		>
	> {
		try {
			const bRows = await this.db.select().from(bastions).limit(1).all();
			const bRow = bRows[0];
			if (!bRow) {
				return ok({ bastion: null, modules: [] });
			}

			const bastion = bastionSelectSchema.parse(bRow);

			const mRows = await this.db
				.select()
				.from(bastionModules)
				.where(eq(bastionModules.bastionId, bastion.id))
				.all();

			const modules = mRows.map((r: any) => {
				return bastionModuleSelectSchema.parse({
					...r,
					isBroken: r.isBroken === 1 || r.isBroken === true,
				});
			});

			return ok({ bastion, modules });
		} catch (error: unknown) {
			return fail({
				code: "BASTION_REPOSITORY_READ_FAILED",
				message: "Could not load first bastion from SQLite.",
				details: { cause: String(error) },
			});
		}
	}
}
