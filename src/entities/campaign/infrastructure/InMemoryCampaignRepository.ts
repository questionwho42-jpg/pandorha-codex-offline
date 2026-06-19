import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CampaignRepository } from "../domain/CampaignRepository";
import {
	type CampaignEventRecord,
	campaignEventSelectSchema,
	type NewCampaignEventRecord,
} from "../model/campaignSchema";

export class InMemoryCampaignRepository implements CampaignRepository {
	private readonly events: CampaignEventRecord[] = [];

	public async saveEvent(
		record: NewCampaignEventRecord,
	): Promise<Result<CampaignEventRecord, Error>> {
		try {
			const parsed = campaignEventSelectSchema.parse(record);
			this.events.push(parsed);
			return ok(parsed);
		} catch (error: unknown) {
			return fail(
				error instanceof Error
					? error
					: new Error("Erro ao salvar evento de campanha em memória."),
			);
		}
	}

	public async listEvents(
		campaignId: string,
	): Promise<Result<CampaignEventRecord[], Error>> {
		const filtered = this.events.filter((e) => e.campaignId === campaignId);
		return ok(filtered);
	}
}
