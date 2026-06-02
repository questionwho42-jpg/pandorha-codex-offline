import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	CharacterRecord,
	CharacterStatusEffectRecord,
} from "../model/characterSchema";
import type { CharacterRepository } from "./CharacterRepository";

export type RetrainFailureCode =
	| "CHARACTER_NOT_FOUND"
	| "INSUFFICIENT_GOLD"
	| "INSUFFICIENT_DOWNTIME"
	| "REPOSITORY_ERROR"
	| "STATUS_EFFECT_ERROR";

export interface RetrainFailure {
	readonly code: RetrainFailureCode;
	readonly message: string;
}

export interface RetrainResult {
	readonly character: CharacterRecord;
	readonly goldSpent: number;
	readonly downtimeDaysSpent: number;
}

export interface ReconditionResult extends RetrainResult {
	readonly statusEffect: CharacterStatusEffectRecord;
}

/**
 * @description Servico que gerencia as regras de Retreino de Talentos, Familiar e Recondicionamento de Eixos.
 * @rule docs/system/bastion/regras-retreino-downtime-recondicionamento.md
 */
export class RetrainService {
	constructor(private readonly repository: CharacterRepository) {}

	/**
	 * Substitui um talento por outro aplicando custos em ouro e tempo de downtime.
	 */
	public async retrainTalent(params: {
		readonly characterId: string;
		readonly oldTalentId: string;
		readonly newTalentId: string;
		readonly currentDowntimeDays: number;
	}): Promise<Result<RetrainResult, RetrainFailure>> {
		const charRes = await this.repository.findById(params.characterId);
		if (!charRes.success) {
			return fail({
				code: "CHARACTER_NOT_FOUND",
				message: "Personagem não encontrado no registro para retreino.",
			});
		}

		const character = charRes.data;
		const goldCost = character.level * 10;
		const downtimeCost = 3;

		// Valida ouro do personagem
		// biome-ignore lint/suspicious/noExplicitAny: gold is on the character record runtime state
		const charGold = (character as any).gold ?? 0;
		if (charGold < goldCost) {
			return fail({
				code: "INSUFFICIENT_GOLD",
				message: `Ouro insuficiente para retreinar talento. Requer ${goldCost} PO, possui ${charGold} PO.`,
			});
		}

		// Valida tempo de downtime
		if (params.currentDowntimeDays < downtimeCost) {
			return fail({
				code: "INSUFFICIENT_DOWNTIME",
				message: `Tempo de Downtime insuficiente. Requer ${downtimeCost} dias, possui ${params.currentDowntimeDays} dias.`,
			});
		}

		// Deduz ouro e salva personagem
		const updatedChar = {
			...character,
			gold: Math.max(0, charGold - goldCost),
			updatedAt: new Date().toISOString(),
		};

		const saveRes = await this.repository.save(updatedChar);
		if (!saveRes.success) {
			return fail({
				code: "REPOSITORY_ERROR",
				message: "Falha ao salvar modificações do personagem no SQLite.",
			});
		}

		return ok({
			character: saveRes.data,
			goldSpent: goldCost,
			downtimeDaysSpent: downtimeCost,
		});
	}

	/**
	 * Recondiciona um Eixo muscular/mental, ativando o status temporário de Descoordenação Latente.
	 */
	public async reconditionAxis(params: {
		readonly characterId: string;
		readonly axisToReplace: string;
		readonly newAxis: string;
		readonly currentDowntimeDays: number;
	}): Promise<Result<ReconditionResult, RetrainFailure>> {
		const charRes = await this.repository.findById(params.characterId);
		if (!charRes.success) {
			return fail({
				code: "CHARACTER_NOT_FOUND",
				message: "Personagem não encontrado para recondicionamento de eixo.",
			});
		}

		const character = charRes.data;
		const goldCost = character.level * 30; // 3x custo de talento
		const downtimeCost = 9; // 3x tempo de talento

		// biome-ignore lint/suspicious/noExplicitAny: gold runtime check
		const charGold = (character as any).gold ?? 0;
		if (charGold < goldCost) {
			return fail({
				code: "INSUFFICIENT_GOLD",
				message: `Ouro insuficiente para recondicionar eixo. Requer ${goldCost} PO, possui ${charGold} PO.`,
			});
		}

		if (params.currentDowntimeDays < downtimeCost) {
			return fail({
				code: "INSUFFICIENT_DOWNTIME",
				message: `Tempo de Downtime insuficiente para recondicionamento. Requer ${downtimeCost} dias, possui ${params.currentDowntimeDays} dias.`,
			});
		}

		// Deduz ouro
		const updatedChar = {
			...character,
			gold: Math.max(0, charGold - goldCost),
			// Altera o valor correspondente no eixo correspondente
			[params.axisToReplace]: Math.max(
				1,
				(character as any)[params.axisToReplace] - 1,
			),
			[params.newAxis]: ((character as any)[params.newAxis] || 0) + 1,
			updatedAt: new Date().toISOString(),
		};

		const saveRes = await this.repository.save(updatedChar);
		if (!saveRes.success) {
			return fail({
				code: "REPOSITORY_ERROR",
				message: "Falha ao salvar eixos modificados do personagem no SQLite.",
			});
		}

		// Aplica status "latent_discoordination"
		const statusEffectRes = await this.repository.saveStatusEffect({
			id: crypto.randomUUID(),
			characterId: character.id,
			type: "latent_discoordination",
			severity: 3, // 3 testes sob desvantagem
			severityMax: 3,
			isAggravated: false,
			metadata: params.newAxis, // Armazena o eixo sob descoordenação no metadata
			createdAt: new Date().toISOString(),
		});

		if (!statusEffectRes.success) {
			return fail({
				code: "STATUS_EFFECT_ERROR",
				message:
					"Falha ao gravar o status de Descoordenação Latente no personagem.",
			});
		}

		return ok({
			character: saveRes.data,
			goldSpent: goldCost,
			downtimeDaysSpent: downtimeCost,
			statusEffect: statusEffectRes.data,
		});
	}

	/**
	 * Retreina truques e habilidades de um familiar místico em 3 dias por 50 PO fixos.
	 */
	public async retrainFamiliar(params: {
		readonly characterId: string;
		readonly currentDowntimeDays: number;
	}): Promise<Result<RetrainResult, RetrainFailure>> {
		const charRes = await this.repository.findById(params.characterId);
		if (!charRes.success) {
			return fail({
				code: "CHARACTER_NOT_FOUND",
				message: "Personagem não encontrado para retreino do familiar.",
			});
		}

		const character = charRes.data;
		const goldCost = 50;
		const downtimeCost = 3;

		// biome-ignore lint/suspicious/noExplicitAny: gold runtime check
		const charGold = (character as any).gold ?? 0;
		if (charGold < goldCost) {
			return fail({
				code: "INSUFFICIENT_GOLD",
				message: `Ouro insuficiente para retreinar familiar. Requer 50 PO, possui ${charGold} PO.`,
			});
		}

		if (params.currentDowntimeDays < downtimeCost) {
			return fail({
				code: "INSUFFICIENT_DOWNTIME",
				message: `Downtime insuficiente. Requer 3 dias, possui ${params.currentDowntimeDays} dias.`,
			});
		}

		const updatedChar = {
			...character,
			gold: Math.max(0, charGold - goldCost),
			updatedAt: new Date().toISOString(),
		};

		const saveRes = await this.repository.save(updatedChar);
		if (!saveRes.success) {
			return fail({
				code: "REPOSITORY_ERROR",
				message: "Falha ao salvar dados do personagem no SQLite.",
			});
		}

		return ok({
			character: saveRes.data,
			goldSpent: goldCost,
			downtimeDaysSpent: downtimeCost,
		});
	}

	/**
	 * Decrementa a quantidade de testes sob descoordenação latente quando o eixo afetado for utilizado.
	 */
	public async registerTestUsage(
		characterId: string,
		axisUsed: string,
	): Promise<
		Result<
			{ readonly active: boolean; readonly testsLeft: number },
			RetrainFailure
		>
	> {
		const effectsRes =
			await this.repository.findStatusEffectsByCharacterId(characterId);
		if (!effectsRes.success) {
			return fail({
				code: "REPOSITORY_ERROR",
				message: "Falha ao buscar status effects do personagem.",
			});
		}

		const latentEffect = effectsRes.data.find(
			(e) => e.type === "latent_discoordination" && e.metadata === axisUsed,
		);

		if (!latentEffect) {
			return ok({ active: false, testsLeft: 0 });
		}

		const nextSeverity = latentEffect.severity - 1;
		if (nextSeverity <= 0) {
			// Remove o efeito de status completamente
			const delRes = await this.repository.deleteStatusEffect(latentEffect.id);
			if (!delRes.success) {
				return fail({
					code: "STATUS_EFFECT_ERROR",
					message: "Falha ao expirar status de Descoordenação Latente.",
				});
			}
			return ok({ active: false, testsLeft: 0 });
		}

		// Atualiza severidade (testes restantes)
		const updatedEffect = {
			...latentEffect,
			severity: nextSeverity,
			updatedAt: new Date().toISOString(),
		};

		const saveEffectRes = await this.repository.saveStatusEffect(updatedEffect);
		if (!saveEffectRes.success) {
			return fail({
				code: "STATUS_EFFECT_ERROR",
				message: "Falha ao atualizar contador de Descoordenação Latente.",
			});
		}

		return ok({
			active: true,
			testsLeft: nextSeverity,
		});
	}
}
