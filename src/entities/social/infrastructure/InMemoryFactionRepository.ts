import { ok, type Result } from "$lib/shared/lib/result";
import type {
	FactionRepository,
	FactionRepositoryFailure,
} from "../domain/FactionRepository";
import type {
	BloodDebtRecord,
	CampaignSocialLedgerRecord,
	ReputationRecord,
} from "../model/socialSchema";

export class InMemoryFactionRepository implements FactionRepository {
	private ledgers = new Map<string, CampaignSocialLedgerRecord>();
	private reputations = new Map<string, ReputationRecord>();
	private bloodDebts = new Map<string, BloodDebtRecord>();

	public async saveLedger(
		record: CampaignSocialLedgerRecord,
	): Promise<Result<CampaignSocialLedgerRecord, FactionRepositoryFailure>> {
		this.ledgers.set(record.id, record);
		return ok(record);
	}

	public async getLedger(
		id: string,
	): Promise<
		Result<CampaignSocialLedgerRecord | null, FactionRepositoryFailure>
	> {
		const ledger = this.ledgers.get(id) || null;
		return ok(ledger);
	}

	public async saveReputation(
		record: ReputationRecord,
	): Promise<Result<ReputationRecord, FactionRepositoryFailure>> {
		this.reputations.set(record.id, record);
		return ok(record);
	}

	public async findReputation(
		characterId: string,
		factionId: string,
	): Promise<Result<ReputationRecord | null, FactionRepositoryFailure>> {
		for (const rep of this.reputations.values()) {
			if (rep.characterId === characterId && rep.factionId === factionId) {
				return ok(rep);
			}
		}
		return ok(null);
	}

	public async saveBloodDebt(
		record: BloodDebtRecord,
	): Promise<Result<BloodDebtRecord, FactionRepositoryFailure>> {
		this.bloodDebts.set(record.id, record);
		return ok(record);
	}

	public async findBloodDebtsByCharacter(
		characterId: string,
	): Promise<Result<BloodDebtRecord[], FactionRepositoryFailure>> {
		const list: BloodDebtRecord[] = [];
		for (const debt of this.bloodDebts.values()) {
			if (debt.characterId === characterId) {
				list.push(debt);
			}
		}
		return ok(list);
	}

	public async findBloodDebtById(
		id: string,
	): Promise<Result<BloodDebtRecord | null, FactionRepositoryFailure>> {
		const debt = this.bloodDebts.get(id) || null;
		return ok(debt);
	}
}
