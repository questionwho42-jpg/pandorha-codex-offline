import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	FactionRepository,
	FactionRepositoryFailure,
} from "../domain/FactionRepository";
import type {
	BloodDebtRecord,
	CampaignSocialLedgerRecord,
	ReputationRecord,
} from "../model/socialSchema";

export class FactionService {
	public constructor(private readonly repository: FactionRepository) {}

	public async initializeSocialLedger(
		campaignId: string,
		timestamp: string,
	): Promise<Result<CampaignSocialLedgerRecord, FactionRepositoryFailure>> {
		const existingResult = await this.repository.getLedger(campaignId);
		if (!existingResult.success) {
			return fail(existingResult.error);
		}

		if (existingResult.data) {
			return ok(existingResult.data);
		}

		const newLedger: CampaignSocialLedgerRecord = {
			id: campaignId,
			fameXp: 0,
			fameLevel: 0,
			favorPoints: 0,
			updatedAt: timestamp,
		};

		return this.repository.saveLedger(newLedger);
	}

	public async addFameXp(
		campaignId: string,
		xp: number,
		timestamp: string,
	): Promise<Result<CampaignSocialLedgerRecord, FactionRepositoryFailure>> {
		const ledgerResult = await this.repository.getLedger(campaignId);
		if (!ledgerResult.success) {
			return fail(ledgerResult.error);
		}

		if (!ledgerResult.data) {
			return fail({
				code: "SOCIAL_LEDGER_NOT_FOUND",
				message: `Ledger social de campanha '${campaignId}' não encontrado.`,
			});
		}

		const ledger = ledgerResult.data;
		const newXp = ledger.fameXp + xp;

		// Progressão de Nível de Fama
		// Nível 0: < 100 XP
		// Nível 1: 100 a 249 XP (exige 100)
		// Nível 2: 250 a 499 XP (exige 250)
		// Nível 3: 500 a 999 XP (exige 500)
		// Nível 4: >= 1000 XP (exige 1000)
		let newLevel = 0;
		if (newXp >= 1000) {
			newLevel = 4;
		} else if (newXp >= 500) {
			newLevel = 3;
		} else if (newXp >= 250) {
			newLevel = 2;
		} else if (newXp >= 100) {
			newLevel = 1;
		}

		const updatedLedger: CampaignSocialLedgerRecord = {
			...ledger,
			fameXp: newXp,
			fameLevel: newLevel,
			updatedAt: timestamp,
		};

		return this.repository.saveLedger(updatedLedger);
	}

	public async adjustReputation(
		characterId: string,
		factionId: string,
		amount: number,
		timestamp: string,
	): Promise<Result<ReputationRecord, FactionRepositoryFailure>> {
		const repResult = await this.repository.findReputation(
			characterId,
			factionId,
		);
		if (!repResult.success) {
			return fail(repResult.error);
		}

		let reputation: ReputationRecord;
		if (!repResult.data) {
			reputation = {
				id: `${characterId}_${factionId}`,
				characterId,
				factionId,
				value: amount,
				updatedAt: timestamp,
			};
		} else {
			reputation = {
				...repResult.data,
				value: repResult.data.value + amount,
				updatedAt: timestamp,
			};
		}

		return this.repository.saveReputation(reputation);
	}

	public async addBloodDebt(
		characterId: string,
		targetName: string,
		amount: number,
		timestamp: string,
	): Promise<Result<BloodDebtRecord, FactionRepositoryFailure>> {
		const newDebt: BloodDebtRecord = {
			id: crypto.randomUUID(),
			characterId,
			targetName,
			debtValue: amount,
			isPaid: false,
			createdAt: timestamp,
		};

		return this.repository.saveBloodDebt(newDebt);
	}

	public async payBloodDebt(
		debtId: string,
		goldAmount: number,
		_timestamp: string,
	): Promise<Result<BloodDebtRecord, FactionRepositoryFailure>> {
		const debtResult = await this.repository.findBloodDebtById(debtId);
		if (!debtResult.success) {
			return fail(debtResult.error);
		}

		if (!debtResult.data) {
			return fail({
				code: "BLOOD_DEBT_NOT_FOUND",
				message: `Dívida de sangue com ID '${debtId}' não encontrada.`,
			});
		}

		const debt = debtResult.data;
		if (debt.isPaid) {
			return ok(debt);
		}

		const pointsToPay = Math.floor(goldAmount / 500);
		if (pointsToPay <= 0) {
			return fail({
				code: "GOLD_INSUFFICIENT",
				message:
					"Ouro insuficiente para abater sequer 1 ponto de dívida. (Custo: 500 PO por ponto)",
			});
		}

		const remainingDebt = Math.max(0, debt.debtValue - pointsToPay);
		const isPaid = remainingDebt === 0;

		const updatedDebt: BloodDebtRecord = {
			...debt,
			debtValue: remainingDebt,
			isPaid,
		};

		return this.repository.saveBloodDebt(updatedDebt);
	}

	public async checkRestBlock(
		characterId: string,
		factionId: string,
	): Promise<Result<boolean, FactionRepositoryFailure>> {
		const repResult = await this.repository.findReputation(
			characterId,
			factionId,
		);
		if (!repResult.success) {
			return fail(repResult.error);
		}

		const reputationValue = repResult.data ? repResult.data.value : 0;
		const limit = reputationValue * 3;

		const debtsResult =
			await this.repository.findBloodDebtsByCharacter(characterId);
		if (!debtsResult.success) {
			return fail(debtsResult.error);
		}

		const unpaidDebtsSum = debtsResult.data
			.filter((d) => !d.isPaid)
			.reduce((sum, d) => sum + d.debtValue, 0);

		const isBlocked = unpaidDebtsSum > limit;
		return ok(isBlocked);
	}
}
