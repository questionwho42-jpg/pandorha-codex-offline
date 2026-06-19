import {
	type CampaignEventRecord as EventHistoryRecord,
	campaignEventSelectSchema as eventHistorySelectSchema,
	type NewCampaignEventRecord as NewEventHistoryRecord,
} from "$lib/entities/campaign";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { SiegeRepository } from "../domain/SiegeRepository";
import {
	type NewSiegeEventRecord,
	type SiegeEventRecord,
	siegeEventSelectSchema,
} from "../model/siegeSchema";
import type { SiegeRepositoryFailure } from "../model/siegeTypes";

export class InMemorySiegeRepository implements SiegeRepository {
	private readonly siegeEvents = new Map<string, SiegeEventRecord>();
	private readonly eventHistory: EventHistoryRecord[] = [];

	public async saveSiegeEvent(
		record: NewSiegeEventRecord,
	): Promise<Result<SiegeEventRecord, SiegeRepositoryFailure>> {
		try {
			const parsed = siegeEventSelectSchema.parse({
				...record,
				status: record.status ?? "active",
				dangerLevel: record.dangerLevel ?? 1,
				damagePoints: record.damagePoints ?? 0,
			});
			this.siegeEvents.set(parsed.id, parsed);
			return ok(parsed);
		} catch (error: unknown) {
			return fail({
				code: "SIEGE_REPOSITORY_WRITE_FAILED",
				message: "Erro ao salvar evento de cerco em memória.",
				details: error,
			});
		}
	}

	public async findById(
		id: string,
	): Promise<Result<SiegeEventRecord, SiegeRepositoryFailure>> {
		const event = this.siegeEvents.get(id);
		if (!event) {
			return fail({
				code: "SIEGE_NOT_FOUND",
				message: `Evento de cerco com ID ${id} não encontrado.`,
			});
		}
		return ok(event);
	}

	public async findActiveSiege(
		campaignId: string,
	): Promise<Result<SiegeEventRecord | null, SiegeRepositoryFailure>> {
		const active = Array.from(this.siegeEvents.values()).find(
			(e) => e.campaignId === campaignId && e.status === "active",
		);
		return ok(active || null);
	}

	public async saveEventHistory(
		record: NewEventHistoryRecord,
	): Promise<Result<EventHistoryRecord, SiegeRepositoryFailure>> {
		try {
			const parsed = eventHistorySelectSchema.parse(record);
			this.eventHistory.push(parsed);
			return ok(parsed);
		} catch (error: unknown) {
			return fail({
				code: "EVENT_HISTORY_WRITE_FAILED",
				message: "Erro ao salvar histórico de eventos em memória.",
				details: error,
			});
		}
	}

	public async listEventHistory(
		campaignId: string,
	): Promise<Result<EventHistoryRecord[], SiegeRepositoryFailure>> {
		const history = this.eventHistory.filter(
			(h) => h.campaignId === campaignId,
		);
		return ok(history);
	}
}
