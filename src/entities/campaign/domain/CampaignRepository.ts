import type { Result } from "$lib/shared/lib/result";
import type {
	CampaignEventRecord,
	NewCampaignEventRecord,
} from "../model/campaignSchema";

export interface CampaignRepository {
	saveEvent(
		record: NewCampaignEventRecord,
	): Promise<Result<CampaignEventRecord, Error>>;

	listEvents(campaignId: string): Promise<Result<CampaignEventRecord[], Error>>;
}
