import type { SocialRepository } from "$lib/entities/social/domain/SocialRepository";
import type {
	BloodDebtRecord,
	FactionRecord,
	ReputationRecord,
} from "$lib/entities/social/model/socialSchema";
import { generateId } from "$lib/shared/lib/id";
import { fail, ok, type Result } from "$lib/shared/lib/result";

export interface SocialStandingFailure {
	readonly code: "PERSISTENCE_ERROR" | "FACTION_NOT_FOUND";
	readonly message: string;
	readonly details?: unknown;
}

export class SocialStandingService {
	public constructor(private readonly repository: SocialRepository) {}

	/**
	 * Registra uma mudança na reputação do personagem com uma facção.
	 */
	public async updateReputation(
		characterId: string,
		factionId: string,
		delta: number,
	): Promise<Result<ReputationRecord, SocialStandingFailure>> {
		const existingResult = await this.repository.findReputation(
			characterId,
			factionId,
		);

		let record: ReputationRecord;

		if (existingResult.success) {
			record = {
				...existingResult.data,
				value: existingResult.data.value + delta,
				updatedAt: new Date().toISOString(),
			};
		} else if (existingResult.error.code === "REPUTATION_NOT_FOUND") {
			record = {
				id: generateId("rep"),
				characterId,
				factionId,
				value: delta,
				updatedAt: new Date().toISOString(),
			};
		} else {
			return fail({
				code: "PERSISTENCE_ERROR",
				message: "Erro ao acessar o repositório de reputação.",
				details: existingResult.error,
			});
		}

		const saveResult = await this.repository.saveReputation(record);
		if (!saveResult.success) {
			return fail({
				code: "PERSISTENCE_ERROR",
				message: "Erro ao salvar a reputação.",
				details: saveResult.error,
			});
		}

		return ok(saveResult.data);
	}

	/**
	 * Registra uma nova dívida de sangue.
	 */
	public async addBloodDebt(
		characterId: string,
		targetName: string,
		value: number,
	): Promise<Result<BloodDebtRecord, SocialStandingFailure>> {
		const debt: BloodDebtRecord = {
			id: generateId("debt"),
			characterId,
			targetName,
			debtValue: value,
			isPaid: false,
			createdAt: new Date().toISOString(),
		};

		const saveResult = await this.repository.saveBloodDebt(debt);
		if (!saveResult.success) {
			return fail({
				code: "PERSISTENCE_ERROR",
				message: "Erro ao salvar a dívida de sangue.",
				details: saveResult.error,
			});
		}

		return ok(saveResult.data);
	}

	/**
	 * Lista o standing social completo do personagem.
	 */
	public async getCharacterStanding(characterId: string) {
		const reputations =
			await this.repository.listReputationsByCharacter(characterId);
		const debts = await this.repository.listBloodDebtsByCharacter(characterId);

		return {
			reputations: reputations.success ? reputations.data : [],
			debts: debts.success ? debts.data : [],
		};
	}

	/**
	 * Verifica se o descanso do Andarilho está bloqueado.
	 * Regra de Negócio: O descanso é bloqueado se a dívida acumulada ativa for maior que 3 vezes a fama acumulada positiva.
	 * (Dívida total > Fama total * 3) -> Estado: Marcado pela Dívida.
	 */
	public async isRestBlocked(characterId: string): Promise<boolean> {
		const standing = await this.getCharacterStanding(characterId);

		const totalDebt = standing.debts
			.filter((d: BloodDebtRecord) => !d.isPaid)
			.reduce((acc: number, d: BloodDebtRecord) => acc + d.debtValue, 0);

		const totalFame = standing.reputations.reduce(
			(acc: number, r: ReputationRecord) => acc + Math.max(0, r.value),
			0,
		);

		return totalDebt > totalFame * 3;
	}

	/**
	 * Inicializa facções padrão se não existirem.
	 */
	public async ensureBaseFactions(): Promise<void> {
		const factions: FactionRecord[] = [
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

		for (const f of factions) {
			await this.repository.saveFaction(f);
		}
	}
}
