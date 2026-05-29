import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { WorldStateService } from "../../world-state";
import type {
	InvestigationRecord,
	NewInvestigationRecord,
} from "../model/investigationSchema";
import type {
	InvestigationClock,
	InvestigationFailure,
	InvestigationIdProvider,
} from "../model/investigationTypes";
import type { InvestigationRepository } from "./InvestigationRepository";

export interface StartInvestigationParams {
	targetId: string;
	targetName: string;
	type: "short_rest" | "weekly_metropolis";
	tier: number;
	dc: number;
}

export interface RollResearchTestParams {
	id: string;
	d20Roll: number;
	modifier: number;
	useVigorCost?: boolean; // Se o sucesso com custo consome Vigor em vez de dobrar ouro
}

export class InvestigationService {
	public constructor(
		private readonly repository: InvestigationRepository,
		private readonly worldStateService: WorldStateService,
		private readonly idProvider: InvestigationIdProvider,
		private readonly clock: InvestigationClock,
	) {}

	public async startInvestigation(
		params: StartInvestigationParams,
	): Promise<Result<InvestigationRecord, InvestigationFailure>> {
		// Validações básicas de limites e campos
		if (!params.targetId || !params.targetName) {
			return fail({
				code: "INVALID_INVESTIGATION_INPUT",
				message: "O alvo da investigação é obrigatório.",
			});
		}

		if (params.tier < 1 || params.tier > 4) {
			return fail({
				code: "INVALID_INVESTIGATION_INPUT",
				message: "O tier deve estar entre 1 e 4.",
			});
		}

		if (params.dc < 1) {
			return fail({
				code: "INVALID_INVESTIGATION_INPUT",
				message: "A classe de dificuldade (DC) deve ser válida.",
			});
		}

		// Checa se já existe uma investigação ativa para o mesmo alvo
		const activeListResult = await this.repository.listActive();
		if (!activeListResult.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: "Não foi possível verificar investigações ativas.",
			});
		}

		const alreadyActive = activeListResult.data.some(
			(i) => i.targetId === params.targetId,
		);
		if (alreadyActive) {
			return fail({
				code: "INVESTIGATION_ALREADY_EXISTS",
				message: "Já existe uma investigação ativa para este alvo.",
			});
		}

		// Configuração de regras baseadas no tipo de projeto
		let successesRequired = 3;
		let failuresMax = 1;
		let goldCostPerTest = 0;

		if (params.type === "weekly_metropolis") {
			// Média (6) ou Longa (9) dependendo do Tier
			successesRequired = params.tier <= 2 ? 6 : 9;
			// 2 ou 3 falhas de tolerância
			failuresMax = params.tier <= 2 ? 2 : 3;
			const costMap = {
				1: 25,
				2: 100,
				3: 500,
				4: 2000,
			} as const;
			goldCostPerTest = costMap[params.tier as 1 | 2 | 3 | 4];
		}

		const timestamp = this.clock.now();
		const record: NewInvestigationRecord = {
			id: this.idProvider.generate(),
			targetId: params.targetId,
			targetName: params.targetName,
			type: params.type,
			tier: params.tier,
			dc: params.dc,
			successesRequired,
			successesAccumulated: 0,
			failuresMax,
			failuresAccumulated: 0,
			status: "active",
			goldCostPerTest,
			createdAt: timestamp,
			updatedAt: timestamp,
		};

		const saved = await this.repository.save(record);
		if (!saved.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: "Erro ao salvar novo projeto de investigação no banco.",
			});
		}

		return ok(saved.data);
	}

	public async rollResearchTest(params: RollResearchTestParams): Promise<
		Result<
			{
				rollResult: number;
				successMargin: number;
				outcome: "critical" | "success" | "success_with_cost" | "failure";
				investigation: InvestigationRecord;
				rewards?: {
					eeRecovered?: number;
					tokensAwarded?: number;
					vigorCost?: number;
					goldCostMultiplier?: number;
				};
			},
			InvestigationFailure
		>
	> {
		const found = await this.repository.findById(params.id);
		if (!found.success) {
			return fail({
				code: "INVALID_INVESTIGATION_INPUT",
				message: "Investigação informada não existe.",
			});
		}

		const investigation = found.data;
		if (investigation.status !== "active") {
			return fail({
				code: "INVESTIGATION_FINISHED",
				message: "Esta investigação já foi concluída ou falhou.",
			});
		}

		const totalRoll = params.d20Roll + params.modifier;
		const margin = totalRoll - investigation.dc;

		let outcome: "critical" | "success" | "success_with_cost" | "failure" =
			"failure";
		let successesToAdd = 0;
		let failuresToAdd = 0;
		const rewards: {
			eeRecovered?: number;
			tokensAwarded?: number;
			vigorCost?: number;
			goldCostMultiplier?: number;
		} = {};

		// Avalia o resultado da rolagem de acordo com o Códex de Investigação
		if (margin >= 10 || params.d20Roll === 20) {
			outcome = "critical";
			successesToAdd = 2;
			rewards.eeRecovered = 1; // Recupera 1 EE
		} else if (margin >= 0) {
			outcome = "success";
			successesToAdd = 1;
		} else if (margin >= -4) {
			outcome = "success_with_cost";
			successesToAdd = 1;
			if (params.useVigorCost) {
				rewards.vigorCost = 1; // Consome 1 Vigor (PV)
			} else {
				rewards.goldCostMultiplier = 2; // Custo em ouro do teste é dobrado
			}
		} else {
			outcome = "failure";
			failuresToAdd = 1;
		}

		// Atualiza o progresso do projeto
		investigation.successesAccumulated += successesToAdd;
		investigation.failuresAccumulated += failuresToAdd;
		investigation.updatedAt = this.clock.now();

		// Determina o fechamento
		if (investigation.successesAccumulated >= investigation.successesRequired) {
			// Sucesso final! Determina a qualidade com base nas falhas
			if (investigation.failuresAccumulated === 0) {
				investigation.status = "completed_perfect";
				rewards.tokensAwarded = 3; // 3 Tokens de Insight
			} else if (
				investigation.failuresAccumulated <= investigation.failuresMax
			) {
				investigation.status = "completed_standard";
				rewards.tokensAwarded = 1; // 1 Token de Insight
			} else {
				investigation.status = "completed_poor";
				rewards.tokensAwarded = 0;
			}

			// Se houver tokens concedidos, salva no estado global do WorldState
			if (rewards.tokensAwarded && rewards.tokensAwarded > 0) {
				const timestamp = this.clock.now();
				const targetResult = await this.worldStateService.setNarrativeFlag({
					key: "plot:insight_target_id",
					value: investigation.targetId,
					updatedAt: timestamp,
				});
				const tokensResult = await this.worldStateService.setNarrativeFlag({
					key: "plot:insight_tokens_count",
					value: rewards.tokensAwarded,
					updatedAt: timestamp,
				});

				if (!targetResult.success || !tokensResult.success) {
					return fail({
						code: "NARRATIVE_FLAG_FAILED",
						message:
							"Não foi possível registrar os tokens de insight do grupo.",
					});
				}
			}
		} else if (investigation.failuresAccumulated > investigation.failuresMax) {
			// Fracasso no projeto
			investigation.status = "failed";
		}

		const saved = await this.repository.save(investigation);
		if (!saved.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: "Não foi possível salvar o progresso da investigação.",
			});
		}

		return ok({
			rollResult: totalRoll,
			successMargin: margin,
			outcome,
			investigation: saved.data,
			rewards,
		});
	}

	public async spendInsightToken(params: {
		targetId: string;
	}): Promise<Result<{ remainingTokens: number }, InvestigationFailure>> {
		// Recupera o ID do alvo ativo de Insight do WorldState
		const activeTargetResult = await this.worldStateService.getFlag(
			"plot:insight_target_id",
		);
		if (!activeTargetResult.success) {
			return fail({
				code: "INVALID_INVESTIGATION_RECORD",
				message: "Nenhuma reserva de insight ativa no grupo.",
			});
		}

		if (activeTargetResult.data.value !== params.targetId) {
			return fail({
				code: "INVALID_INVESTIGATION_INPUT",
				message:
					"O alvo informado não corresponde à reserva de insight do grupo.",
			});
		}

		// Recupera o saldo de tokens
		const tokensResult = await this.worldStateService.getFlag(
			"plot:insight_tokens_count",
		);
		if (!tokensResult.success) {
			return fail({
				code: "INVALID_INVESTIGATION_RECORD",
				message: "Erro ao obter contagem de tokens de insight do grupo.",
			});
		}

		const currentCount = Number(tokensResult.data.value) || 0;
		if (currentCount <= 0) {
			return fail({
				code: "INSUFFICIENT_FUNDS",
				message:
					"Não há tokens de insight restantes para gastar contra este alvo.",
			});
		}

		const remaining = currentCount - 1;
		const timestamp = this.clock.now();
		const saved = await this.worldStateService.setNarrativeFlag({
			key: "plot:insight_tokens_count",
			value: remaining,
			updatedAt: timestamp,
		});

		if (!saved.success) {
			return fail({
				code: "NARRATIVE_FLAG_FAILED",
				message: "Falha ao atualizar saldo de tokens no world-state.",
			});
		}

		return ok({ remainingTokens: remaining });
	}
}
