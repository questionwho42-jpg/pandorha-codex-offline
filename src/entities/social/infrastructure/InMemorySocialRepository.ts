import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	SocialRepository,
	SocialRepositoryFailure,
} from "../domain/SocialRepository";
import type {
	BloodDebtRecord,
	FactionRecord,
	ReputationRecord,
} from "../model/socialSchema";

export class InMemorySocialRepository implements SocialRepository {
	public factions: FactionRecord[] = [];
	public reputations: ReputationRecord[] = [];
	public debts: BloodDebtRecord[] = [];

	public constructor() {
		// Inicializa facções padrão para simulações
		this.factions = [
			{
				id: "fac-ether",
				name: "Guardiões do Ether",
				description: "Protetores da magia ancestral e da ordem.",
				alignment: "order",
			},
			{
				id: "fac-ruin",
				name: "Sectários da Ruína",
				description: "Aqueles que buscam a entropia e o caos.",
				alignment: "chaos",
			},
			{
				id: "fac-bronze",
				name: "Sindicato de Bronze",
				description: "Mercadores e pragmáticos que valorizam o lucro.",
				alignment: "neutral",
			},
		];
	}

	public async saveFaction(
		faction: FactionRecord,
	): Promise<Result<FactionRecord, SocialRepositoryFailure>> {
		const idx = this.factions.findIndex((f) => f.id === faction.id);
		if (idx >= 0) {
			this.factions[idx] = faction;
		} else {
			this.factions.push(faction);
		}
		return ok(faction);
	}

	public async findFactionById(
		id: string,
	): Promise<Result<FactionRecord, SocialRepositoryFailure>> {
		const f = this.factions.find((f) => f.id === id);
		if (!f) return fail({ code: "FACTION_NOT_FOUND", message: "Not found" });
		return ok(f);
	}

	public async listFactions(): Promise<
		Result<readonly FactionRecord[], SocialRepositoryFailure>
	> {
		return ok(this.factions);
	}

	public async saveReputation(
		reputation: ReputationRecord,
	): Promise<Result<ReputationRecord, SocialRepositoryFailure>> {
		const idx = this.reputations.findIndex(
			(r) =>
				r.characterId === reputation.characterId &&
				r.factionId === reputation.factionId,
		);
		if (idx >= 0) {
			this.reputations[idx] = reputation;
		} else {
			this.reputations.push(reputation);
		}
		return ok(reputation);
	}

	public async findReputation(
		characterId: string,
		factionId: string,
	): Promise<Result<ReputationRecord, SocialRepositoryFailure>> {
		const r = this.reputations.find(
			(r) => r.characterId === characterId && r.factionId === factionId,
		);
		if (!r) return fail({ code: "REPUTATION_NOT_FOUND", message: "Not found" });
		return ok(r);
	}

	public async listReputationsByCharacter(
		characterId: string,
	): Promise<Result<readonly ReputationRecord[], SocialRepositoryFailure>> {
		return ok(this.reputations.filter((r) => r.characterId === characterId));
	}

	public async saveBloodDebt(
		debt: BloodDebtRecord,
	): Promise<Result<BloodDebtRecord, SocialRepositoryFailure>> {
		const idx = this.debts.findIndex((d) => d.id === debt.id);
		if (idx >= 0) {
			this.debts[idx] = debt;
		} else {
			this.debts.push(debt);
		}
		return ok(debt);
	}

	public async listBloodDebtsByCharacter(
		characterId: string,
	): Promise<Result<readonly BloodDebtRecord[], SocialRepositoryFailure>> {
		return ok(this.debts.filter((d) => d.characterId === characterId));
	}
}
