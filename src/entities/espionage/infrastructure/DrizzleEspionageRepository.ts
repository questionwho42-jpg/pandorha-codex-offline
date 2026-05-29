import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	EspionageRepository,
	EspionageRepositoryFailure,
} from "../domain/EspionageRepository";
import {
	type EspionageCellRecord,
	espionageCellSelectSchema,
	espionageCells,
	type NewEspionageCellRecord,
} from "../model/espionageSchema";

export class DrizzleEspionageRepository implements EspionageRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance
	public constructor(private readonly db: any) {}

	public async save(
		record: NewEspionageCellRecord,
	): Promise<Result<EspionageCellRecord, EspionageRepositoryFailure>> {
		try {
			await this.db
				.insert(espionageCells)
				.values(record)
				.onConflictDoUpdate({
					target: espionageCells.id,
					set: {
						campaignId: record.campaignId,
						factionId: record.factionId,
						regionId: record.regionId,
						tenenteCompanionId: record.tenenteCompanionId,
						specializedAxis: record.specializedAxis,
						tier: record.tier,
						isLockdown: record.isLockdown,
						lockdownWeeksRemaining: record.lockdownWeeksRemaining,
						vigilanceHeat: record.vigilanceHeat,
						methodOfControl: record.methodOfControl,
						updatedAt: record.updatedAt,
					},
				})
				.run();

			const result = await this.findById(record.id);
			if (!result.success) {
				return fail(result.error);
			}
			return ok(result.data);
		} catch (error: unknown) {
			return fail({
				code: "ESPIONAGE_REPOSITORY_WRITE_FAILED",
				message: "Não foi possível persistir a célula de espionagem.",
				details: { cause: String(error) },
			});
		}
	}

	public async findById(
		id: string,
	): Promise<Result<EspionageCellRecord, EspionageRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(espionageCells)
				.where(eq(espionageCells.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return fail({
					code: "ESPIONAGE_CELL_NOT_FOUND",
					message: `Célula de espionagem com ID ${id} não encontrada.`,
				});
			}
			return ok(espionageCellSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "ESPIONAGE_REPOSITORY_READ_FAILED",
				message: "Erro ao carregar registro de célula de espionagem.",
				details: { cause: String(error) },
			});
		}
	}

	public async listByCampaign(
		campaignId: string,
	): Promise<
		Result<readonly EspionageCellRecord[], EspionageRepositoryFailure>
	> {
		try {
			const rows = await this.db
				.select()
				.from(espionageCells)
				.where(eq(espionageCells.campaignId, campaignId))
				.all();
			const list = rows.map((r: unknown) => espionageCellSelectSchema.parse(r));
			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "ESPIONAGE_REPOSITORY_READ_FAILED",
				message: "Erro ao listar células de espionagem da campanha.",
				details: { cause: String(error) },
			});
		}
	}

	public async deleteCell(
		id: string,
	): Promise<Result<void, EspionageRepositoryFailure>> {
		try {
			await this.db
				.delete(espionageCells)
				.where(eq(espionageCells.id, id))
				.run();
			return ok(undefined);
		} catch (error: unknown) {
			return fail({
				code: "ESPIONAGE_REPOSITORY_WRITE_FAILED",
				message: `Erro ao remover célula de espionagem com ID ${id}.`,
				details: { cause: String(error) },
			});
		}
	}
}
