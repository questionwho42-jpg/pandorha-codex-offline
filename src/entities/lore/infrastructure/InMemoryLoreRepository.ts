import { ok, type Result } from "$lib/shared/lib/result";
import type {
	ILoreRepository,
	LoreRepositoryFailure,
} from "../domain/ILoreRepository";
import type {
	CampaignRumorRecord,
	LoreEncounterRecord,
} from "../model/loreSchema";

export class InMemoryLoreRepository implements ILoreRepository {
	public encounters: LoreEncounterRecord[] = [];
	public rumors: CampaignRumorRecord[] = [];

	public async saveEncounter(
		encounter: LoreEncounterRecord,
	): Promise<Result<LoreEncounterRecord, LoreRepositoryFailure>> {
		const idx = this.encounters.findIndex((e) => e.id === encounter.id);
		if (idx >= 0) {
			this.encounters[idx] = encounter;
		} else {
			this.encounters.push(encounter);
		}
		return ok(encounter);
	}

	public async findEncounterById(
		id: string,
	): Promise<Result<LoreEncounterRecord | null, LoreRepositoryFailure>> {
		const e = this.encounters.find((e) => e.id === id);
		return ok(e ?? null);
	}

	public async listEncountersByTile(
		tileId: string,
	): Promise<Result<readonly LoreEncounterRecord[], LoreRepositoryFailure>> {
		return ok(this.encounters.filter((e) => e.tileId === tileId));
	}

	public async listAllEncounters(): Promise<
		Result<readonly LoreEncounterRecord[], LoreRepositoryFailure>
	> {
		return ok(this.encounters);
	}

	public async saveRumor(
		rumor: CampaignRumorRecord,
	): Promise<Result<CampaignRumorRecord, LoreRepositoryFailure>> {
		const idx = this.rumors.findIndex((r) => r.id === rumor.id);
		if (idx >= 0) {
			this.rumors[idx] = rumor;
		} else {
			this.rumors.push(rumor);
		}
		return ok(rumor);
	}

	public async findRumorById(
		id: string,
	): Promise<Result<CampaignRumorRecord | null, LoreRepositoryFailure>> {
		const r = this.rumors.find((r) => r.id === id);
		return ok(r ?? null);
	}

	public async listRumorsByTile(
		tileId: string,
	): Promise<Result<readonly CampaignRumorRecord[], LoreRepositoryFailure>> {
		return ok(this.rumors.filter((r) => r.tileId === tileId));
	}

	public async listAllRumors(): Promise<
		Result<readonly CampaignRumorRecord[], LoreRepositoryFailure>
	> {
		return ok(this.rumors);
	}
}
