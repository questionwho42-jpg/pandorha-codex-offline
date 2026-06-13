import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	InvestigationRecord,
	NewInvestigationRecord,
} from "../model/investigationSchema";
import type { InvestigationRepository } from "./InvestigationRepository";

export type ResearchFailureCode =
	| "INVESTIGATION_NOT_FOUND"
	| "INVALID_RESEARCH_STATE"
	| "INSUFFICIENT_FUNDS"
	| "INSUFFICIENT_MENTAL"
	| "REPOSITORY_ERROR";

export interface ResearchFailure {
	readonly code: ResearchFailureCode;
	readonly message: string;
}

export interface ResearchRollInput {
	readonly investigationId: string;
	readonly rollValue: number;
	readonly modifier: number;
	readonly hasPoliglotaSupremo?: boolean;
	readonly spendGoldExtreme?: boolean;
	readonly currentGold?: number;
	readonly researcherEe?: number;
	readonly advanceTimeTicks?: boolean;
}

export interface ResearchRollResult {
	readonly record: InvestigationRecord;
	readonly success: boolean;
	readonly isCritical: boolean;
	readonly translatedPercent: number;
	readonly log: string;
	readonly goldSpent: number;
	readonly eeConsumed: number;
	readonly ticksConsumed: number;
	readonly runicReward?:
		| {
				readonly type: "rune_stone" | "ancient_relic" | "insight_scroll";
				readonly label: string;
		  }
		| undefined;
}

/**
 * @description Servico que encapsula as regras de Pesquisa, Criptografia, Lore e Grandes Enigmas.
 * @rule docs/system/survival/regras-pesquisa-lore-criptografia-linguas-antigas.md
 */
export class ResearchService {
	constructor(private readonly repository: InvestigationRepository) {}

	/**
	 * Inicia um novo projeto de pesquisa.
	 */
	public async createProject(params: {
		readonly id: string;
		readonly targetId: string;
		readonly targetName: string;
		readonly type: "lore" | "cryptography" | "great_enigma";
		readonly tier: number;
		readonly dc: number;
		readonly successesRequired: number;
		readonly failuresMax: number;
		readonly timestamp: string;
	}): Promise<Result<InvestigationRecord, ResearchFailure>> {
		const newRecord: NewInvestigationRecord = {
			id: params.id,
			targetId: params.targetId,
			targetName: params.targetName,
			type: params.type,
			tier: params.tier,
			dc: params.dc,
			successesRequired: params.successesRequired,
			successesAccumulated: 0,
			failuresMax: params.failuresMax,
			failuresAccumulated: 0,
			status: "active",
			goldCostPerTest: params.type === "great_enigma" ? 10 : 0,
			translatedPercent: 0,
			discoveredSecrets: "",
			createdAt: params.timestamp,
			updatedAt: params.timestamp,
		};

		const saveResult = await this.repository.save(newRecord);
		if (!saveResult.success) {
			return fail({
				code: "REPOSITORY_ERROR",
				message: saveResult.error.message,
			});
		}

		return ok(saveResult.data);
	}

	/**
	 * Executa um teste de progresso em um projeto de pesquisa.
	 */
	public async executeResearchTest(
		input: ResearchRollInput,
	): Promise<Result<ResearchRollResult, ResearchFailure>> {
		const findResult = await this.repository.findById(input.investigationId);
		if (!findResult.success) {
			return fail({
				code: "INVESTIGATION_NOT_FOUND",
				message: "Projeto de pesquisa não encontrado.",
			});
		}

		const project = findResult.data;
		if (project.status !== "active") {
			return fail({
				code: "INVALID_RESEARCH_STATE",
				message: "O projeto de pesquisa já está concluído ou falhou.",
			});
		}

		const isPoliglotaInstant =
			project.type === "cryptography" && input.hasPoliglotaSupremo;
		if (
			!isPoliglotaInstant &&
			input.researcherEe !== undefined &&
			input.researcherEe < 1
		) {
			return fail({
				code: "INSUFFICIENT_MENTAL",
				message:
					"Esforço Extra (EE) insuficiente para guiar a pesquisa (mínimo 1 EE).",
			});
		}

		let goldSpent = 0;
		if (input.spendGoldExtreme) {
			if (input.currentGold !== undefined && input.currentGold < 25) {
				return fail({
					code: "INSUFFICIENT_FUNDS",
					message:
						"Ouro insuficiente para investigação arcana extrema (necessário 25 PO).",
				});
			}
			goldSpent = 25;
		}

		const eeConsumed = isPoliglotaInstant ? 0 : 1;
		const ticksConsumed = input.advanceTimeTicks ? 1 : 0;

		// 1. Caso de Tradução Instantânea (Poliglota Supremo) para Criptografia
		if (isPoliglotaInstant) {
			const updated: NewInvestigationRecord = {
				...project,
				successesAccumulated: project.successesRequired,
				translatedPercent: 100,
				status: "completed_perfect",
				discoveredSecrets:
					"Segredo revelado instantaneamente por Poliglota Supremo.",
				updatedAt: new Date().toISOString(),
			};

			const saveResult = await this.repository.save(updated);
			if (!saveResult.success) {
				return fail({
					code: "REPOSITORY_ERROR",
					message: saveResult.error.message,
				});
			}

			return ok({
				record: saveResult.data,
				success: true,
				isCritical: true,
				translatedPercent: 100,
				log: "Poliglota Supremo: Tradução instantânea realizada com sucesso em silêncio!",
				goldSpent,
				eeConsumed,
				ticksConsumed,
				runicReward: {
					type: "rune_stone",
					label: "Runa Eleriana de Combate",
				},
			});
		}

		// 2. Rolar teste
		const totalRoll = input.rollValue + input.modifier;
		const dc = project.dc;
		const isSuccess = totalRoll >= dc;
		const isCriticalSuccess =
			input.rollValue === 20 || (isSuccess && totalRoll - dc >= 5);
		const isPartialFailure = !isSuccess && totalRoll >= dc - 4;

		let nextSuccesses = project.successesAccumulated;
		let nextFailures = project.failuresAccumulated;
		let nextStatus:
			| "active"
			| "completed_perfect"
			| "completed_standard"
			| "completed_poor"
			| "failed" = project.status;
		let nextTranslatedPercent = project.translatedPercent;
		let discoveredSecrets = project.discoveredSecrets;
		let logMessage = "";

		if (isSuccess) {
			nextSuccesses = Math.min(
				project.successesRequired,
				project.successesAccumulated + (isCriticalSuccess ? 2 : 1),
			);

			// Progresso de tradução
			nextTranslatedPercent = Math.min(
				100,
				Math.floor((nextSuccesses / project.successesRequired) * 100),
			);

			if (project.type === "cryptography" && isCriticalSuccess) {
				discoveredSecrets =
					"Segredo Íntimo do Autor revelado (Dossiê de Alvo obtido).";
				logMessage = `Sucesso Crítico! Margem de +5 ou d20 natural. Revelado segredo íntimo: ${discoveredSecrets}`;
			} else {
				logMessage = `Sucesso no teste de pesquisa (Total ${totalRoll} vs DC ${dc}). Progresso adicionado.`;
			}
		} else if (isPartialFailure) {
			// Regra de Ouro (Falha Parcial)
			if (project.type === "cryptography") {
				nextTranslatedPercent = Math.max(project.translatedPercent, 80);
				nextFailures += 1;
				logMessage =
					"Falha Parcial (Regra de Ouro)! Traduzido 80% do texto (com runas embaralhadas na UI). +1 falha acumulada.";
			} else if (input.spendGoldExtreme) {
				logMessage =
					"Falha evitada com Investigação Arcana Extrema! Gasto de 25 PO revelou fraquezas e limpou trilhas falsas.";
			} else {
				nextFailures += 1;
				logMessage = `Falha Parcial na pesquisa. +1 falha acumulada (Total ${totalRoll} vs DC ${dc}).`;
			}
		} else {
			// Falha total
			if (input.spendGoldExtreme) {
				logMessage =
					"Falha evitada com Investigação Arcana Extrema! Gasto de 25 PO impediu a gravação de falha.";
			} else {
				nextFailures += 1;
				logMessage = `Falha total no teste de pesquisa (Total ${totalRoll} vs DC ${dc}). +1 falha acumulada.`;
			}
		}

		// Checar limites de conclusão/falha
		if (nextSuccesses >= project.successesRequired) {
			nextStatus =
				nextFailures === 0
					? "completed_perfect"
					: nextFailures === 1
						? "completed_standard"
						: "completed_poor";
			logMessage += " Projeto concluído com sucesso!";
		} else if (nextFailures >= project.failuresMax) {
			nextStatus = "failed";
			logMessage += " Projeto de pesquisa falhou definitivamente.";
		}

		const updated: NewInvestigationRecord = {
			...project,
			successesAccumulated: nextSuccesses,
			failuresAccumulated: nextFailures,
			status: nextStatus,
			translatedPercent: nextTranslatedPercent,
			discoveredSecrets,
			updatedAt: new Date().toISOString(),
		};

		const saveResult = await this.repository.save(updated);
		if (!saveResult.success) {
			return fail({
				code: "REPOSITORY_ERROR",
				message: saveResult.error.message,
			});
		}

		let runicReward:
			| {
					type: "rune_stone" | "ancient_relic" | "insight_scroll";
					label: string;
			  }
			| undefined;
		const isCompleted =
			nextStatus === "completed_perfect" ||
			nextStatus === "completed_standard" ||
			nextStatus === "completed_poor";
		if (isCompleted) {
			if (project.type === "cryptography") {
				runicReward = { type: "rune_stone", label: "Runa Eleriana de Combate" };
			} else if (project.type === "great_enigma") {
				runicReward = {
					type: "ancient_relic",
					label: "Fragmento do Bastião Ancestral",
				};
			} else if (project.type === "lore") {
				runicReward = {
					type: "insight_scroll",
					label: "Papiro de Insight Oculto",
				};
			}
		}

		return ok({
			record: saveResult.data,
			success:
				isSuccess || (isPartialFailure && project.type === "cryptography"),
			isCritical: isCriticalSuccess,
			translatedPercent: nextTranslatedPercent,
			log: logMessage,
			goldSpent,
			eeConsumed,
			ticksConsumed,
			runicReward,
		});
	}
}
