import { and, eq } from "drizzle-orm";
import {
	campaignEventsHistory,
	type CampaignEventRecord as EventHistoryRecord,
	campaignEventSelectSchema as eventHistorySelectSchema,
	type NewCampaignEventRecord as NewEventHistoryRecord,
} from "$lib/entities/campaign";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { SiegeRepository } from "../domain/SiegeRepository";
import {
	campaignSiegeEvents,
	type NewSiegeEventRecord,
	type SiegeEventRecord,
	siegeEventSelectSchema,
} from "../model/siegeSchema";
import type { SiegeRepositoryFailure } from "../model/siegeTypes";

export class DrizzleSiegeRepository implements SiegeRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance
	public constructor(private readonly db: any) {}

	public async saveSiegeEvent(
		record: NewSiegeEventRecord,
	): Promise<Result<SiegeEventRecord, SiegeRepositoryFailure>> {
		try {
			await this.db
				.insert(campaignSiegeEvents)
				.values(record)
				.onConflictDoUpdate({
					target: campaignSiegeEvents.id,
					set: {
						status: record.status,
						dangerLevel: record.dangerLevel,
						damagePoints: record.damagePoints,
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
				code: "SIEGE_REPOSITORY_WRITE_FAILED",
				message: "Não foi possível persistir o evento de cerco.",
				details: { cause: String(error) },
			});
		}
	}

	public async findById(
		id: string,
	): Promise<Result<SiegeEventRecord, SiegeRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(campaignSiegeEvents)
				.where(eq(campaignSiegeEvents.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return fail({
					code: "SIEGE_NOT_FOUND",
					message: `Evento de cerco com ID ${id} não encontrado.`,
				});
			}
			return ok(siegeEventSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_SIEGE_RECORD",
				message: "Erro ao carregar registro de cerco do banco.",
				details: { cause: String(error) },
			});
		}
	}

	public async findActiveSiege(
		campaignId: string,
	): Promise<Result<SiegeEventRecord | null, SiegeRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(campaignSiegeEvents)
				.where(
					and(
						eq(campaignSiegeEvents.campaignId, campaignId),
						eq(campaignSiegeEvents.status, "active"),
					),
				)
				.all();
			const row = rows[0];
			if (!row) {
				return ok(null);
			}
			return ok(siegeEventSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_SIEGE_RECORD",
				message: "Erro ao buscar cerco ativo no banco.",
				details: { cause: String(error) },
			});
		}
	}

	public async saveEventHistory(
		record: NewEventHistoryRecord,
	): Promise<Result<EventHistoryRecord, SiegeRepositoryFailure>> {
		try {
			await this.db.insert(campaignEventsHistory).values(record).run();
			return ok(eventHistorySelectSchema.parse(record));
		} catch (error: unknown) {
			return fail({
				code: "EVENT_HISTORY_WRITE_FAILED",
				message: "Não foi possível registrar o histórico do evento.",
				details: { cause: String(error) },
			});
		}
	}

	public async listEventHistory(
		campaignId: string,
	): Promise<Result<EventHistoryRecord[], SiegeRepositoryFailure>> {
		try {
			const rows = await this.db
				.select()
				.from(campaignEventsHistory)
				.where(eq(campaignEventsHistory.campaignId, campaignId))
				.all();
			const list = rows.map((r: unknown) => eventHistorySelectSchema.parse(r));
			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "CORRUPTED_SIEGE_RECORD",
				message: "Erro ao carregar o feed de histórico de eventos.",
				details: { cause: String(error) },
			});
		}
	}
}
