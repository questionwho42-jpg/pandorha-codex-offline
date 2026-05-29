import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { FactionPatronageRecord } from "../model/socialSchema";
import type {
	FactionRepository,
	FactionRepositoryFailure,
} from "./FactionRepository";

export class PatronageService {
	public constructor(private readonly repository: FactionRepository) {}

	public async getOrCreatePatronage(
		factionId: string,
	): Promise<Result<FactionPatronageRecord, FactionRepositoryFailure>> {
		const findRes = await this.repository.findPatronageByFaction(factionId);
		if (!findRes.success) {
			return fail(findRes.error);
		}

		if (findRes.data) {
			return ok(findRes.data);
		}

		const newPatronage: FactionPatronageRecord = {
			id: crypto.randomUUID(),
			factionId,
			famaLevel: 1,
			bloodDebt: 0,
			relicsCount: 0,
			ultimatumWeeksRemaining: null,
			isAlmaPledged: false,
		};

		return this.repository.savePatronage(newPatronage);
	}

	public async requestFavor(
		factionId: string,
		cost: number,
	): Promise<
		Result<
			{ patronage: FactionPatronageRecord; favorTriggered: boolean },
			FactionRepositoryFailure
		>
	> {
		const patRes = await this.getOrCreatePatronage(factionId);
		if (!patRes.success) {
			return fail(patRes.error);
		}
		const patronage = patRes.data;

		// Limite máximo de Dívida de Sangue = Fama x 3
		const limit = patronage.famaLevel * 3;
		patronage.bloodDebt += cost;

		let favorTriggered = false;
		if (patronage.bloodDebt > limit) {
			// Romper o limite de dívida ativa o Ultimato: Favor Impossível
			patronage.ultimatumWeeksRemaining = 3;
			favorTriggered = true;
		}

		const saveRes = await this.repository.savePatronage(patronage);
		if (!saveRes.success) {
			return fail(saveRes.error);
		}

		return ok({
			patronage: saveRes.data,
			favorTriggered,
		});
	}

	public async processWeeklyPatronageUpdate(): Promise<
		Result<{ updatedCount: number }, FactionRepositoryFailure>
	> {
		const listRes = await this.repository.listPatronages();
		if (!listRes.success) {
			return fail(listRes.error);
		}

		let updatedCount = 0;
		for (const pat of listRes.data) {
			let changed = false;
			if (pat.ultimatumWeeksRemaining !== null) {
				const nextWeeks = pat.ultimatumWeeksRemaining - 1;
				if (nextWeeks <= 0) {
					pat.ultimatumWeeksRemaining = 0;
					pat.isAlmaPledged = true; // Penhora de alma ativada
				} else {
					pat.ultimatumWeeksRemaining = nextWeeks;
				}
				changed = true;
			}

			if (changed) {
				const saveRes = await this.repository.savePatronage(pat);
				if (!saveRes.success) {
					return fail(saveRes.error);
				}
				updatedCount++;
			}
		}

		return ok({ updatedCount });
	}

	public async isResurrectionBlocked(): Promise<
		Result<boolean, FactionRepositoryFailure>
	> {
		const listRes = await this.repository.listPatronages();
		if (!listRes.success) {
			return fail(listRes.error);
		}

		// Se houver qualquer patrocínio com almas penhoradas e dívida ativa, a ressurreição está vetada.
		const isBlocked = listRes.data.some(
			(pat) => pat.isAlmaPledged && pat.bloodDebt > 0,
		);

		return ok(isBlocked);
	}

	public async payFactionDebt(
		factionId: string,
		amount: number,
	): Promise<Result<FactionPatronageRecord, FactionRepositoryFailure>> {
		const patRes = await this.getOrCreatePatronage(factionId);
		if (!patRes.success) {
			return fail(patRes.error);
		}
		const patronage = patRes.data;

		patronage.bloodDebt = Math.max(0, patronage.bloodDebt - amount);

		// Se a dívida for totalmente quitada, limpa o Ultimato e a penhora de almas
		if (patronage.bloodDebt === 0) {
			patronage.ultimatumWeeksRemaining = null;
			patronage.isAlmaPledged = false;
		}

		return this.repository.savePatronage(patronage);
	}
}
