import { describe, expect, it } from "vitest";
import { fail, type Result } from "$lib/shared/lib/result";
import { WorldStateService } from "../../world-state";
import { InMemoryWorldStateRepository } from "../../world-state/testing/InMemoryWorldStateRepository";
import { InvestigationService } from "../domain/InvestigationService";
import { InMemoryInvestigationRepository } from "../infrastructure/InMemoryInvestigationRepository";
import type { InvestigationRecord } from "../model/investigationSchema";
import type {
	InvestigationClock,
	InvestigationIdProvider,
} from "../model/investigationTypes";

const TEST_TIMESTAMP = "2026-05-27T09:00:00.000Z";

class FakeIdProvider implements InvestigationIdProvider {
	private count = 0;
	public generate(): string {
		this.count += 1;
		return `test-id-${this.count}`;
	}
}

class FakeClock implements InvestigationClock {
	public now(): string {
		return TEST_TIMESTAMP;
	}
}

import type { NewInvestigationRecord } from "../model/investigationSchema";
import type { InvestigationRepositoryFailure } from "../model/investigationTypes";

class FailingInvestigationRepository extends InMemoryInvestigationRepository {
	private saveFailure = false;
	private listFailure = false;
	private findFailure = false;

	public setSaveFailure(value: boolean) {
		this.saveFailure = value;
	}

	public setListFailure(value: boolean) {
		this.listFailure = value;
	}

	public setFindFailure(value: boolean) {
		this.findFailure = value;
	}

	public override async save(
		record: NewInvestigationRecord,
	): Promise<Result<InvestigationRecord, InvestigationRepositoryFailure>> {
		if (this.saveFailure) {
			return fail({
				code: "INVESTIGATION_REPOSITORY_WRITE_FAILED",
				message: "Mocked save failure",
			});
		}
		return super.save(record);
	}

	public override async listActive(): Promise<
		Result<InvestigationRecord[], InvestigationRepositoryFailure>
	> {
		if (this.listFailure) {
			return fail({
				code: "INVESTIGATION_REPOSITORY_WRITE_FAILED",
				message: "Mocked listActive failure",
			});
		}
		return super.listActive();
	}

	public override async findById(
		id: string,
	): Promise<Result<InvestigationRecord, InvestigationRepositoryFailure>> {
		if (this.findFailure) {
			return fail({
				code: "INVESTIGATION_NOT_FOUND",
				message: "Mocked findById failure",
			});
		}
		return super.findById(id);
	}
}

function createSetup() {
	const repository = new FailingInvestigationRepository();
	const worldStateRepo = new InMemoryWorldStateRepository();
	const worldStateService = new WorldStateService(worldStateRepo);
	const idProvider = new FakeIdProvider();
	const clock = new FakeClock();
	const service = new InvestigationService(
		repository,
		worldStateService,
		idProvider,
		clock,
	);

	return { repository, worldStateRepo, worldStateService, service };
}

describe("InvestigationService", () => {
	describe("startInvestigation", () => {
		it("inicializa uma pesquisa curta com sucesso", async () => {
			const { service } = createSetup();

			const result = await service.startInvestigation({
				targetId: "monster-1",
				targetName: "Rato Gigante",
				type: "short_rest",
				tier: 1,
				dc: 12,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toMatchObject({
					targetId: "monster-1",
					targetName: "Rato Gigante",
					type: "short_rest",
					tier: 1,
					dc: 12,
					successesRequired: 3,
					failuresMax: 1,
					successesAccumulated: 0,
					failuresAccumulated: 0,
					status: "active",
					goldCostPerTest: 0,
					createdAt: TEST_TIMESTAMP,
				});
			}
		});

		it("inicializa uma pesquisa semanal de metrópole com custos corretos para Tier 1", async () => {
			const { service } = createSetup();

			const result = await service.startInvestigation({
				targetId: "monster-2",
				targetName: "Lobo Atroz",
				type: "weekly_metropolis",
				tier: 1,
				dc: 15,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toMatchObject({
					type: "weekly_metropolis",
					tier: 1,
					successesRequired: 6,
					failuresMax: 2,
					goldCostPerTest: 25,
				});
			}
		});

		it("inicializa uma pesquisa semanal de metrópole com custos corretos para Tier 3", async () => {
			const { service } = createSetup();

			const result = await service.startInvestigation({
				targetId: "monster-3",
				targetName: "Dragão Vermelho",
				type: "weekly_metropolis",
				tier: 3,
				dc: 25,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toMatchObject({
					type: "weekly_metropolis",
					tier: 3,
					successesRequired: 9,
					failuresMax: 3,
					goldCostPerTest: 500,
				});
			}
		});

		it("falha ao inicializar se faltarem campos obrigatórios", async () => {
			const { service } = createSetup();

			const res1 = await service.startInvestigation({
				targetId: "",
				targetName: "Teste",
				type: "short_rest",
				tier: 1,
				dc: 12,
			});
			expect(res1.success).toBe(false);
			if (!res1.success) {
				expect(res1.error.code).toBe("INVALID_INVESTIGATION_INPUT");
			}

			const res2 = await service.startInvestigation({
				targetId: "monster-1",
				targetName: "Teste",
				type: "short_rest",
				tier: 0,
				dc: 12,
			});
			expect(res2.success).toBe(false);

			const res3 = await service.startInvestigation({
				targetId: "monster-1",
				targetName: "Teste",
				type: "short_rest",
				tier: 1,
				dc: 0,
			});
			expect(res3.success).toBe(false);
		});

		it("impede criação de duas pesquisas ativas para o mesmo alvo simultaneamente", async () => {
			const { service } = createSetup();

			await service.startInvestigation({
				targetId: "target-rep",
				targetName: "Alvo Repetido",
				type: "short_rest",
				tier: 1,
				dc: 12,
			});

			const result = await service.startInvestigation({
				targetId: "target-rep",
				targetName: "Alvo Repetido Outro",
				type: "short_rest",
				tier: 1,
				dc: 12,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("INVESTIGATION_ALREADY_EXISTS");
			}
		});

		it("retorna erro se a verificação de investigações ativas falhar", async () => {
			const { service, repository } = createSetup();
			repository.setListFailure(true);

			const result = await service.startInvestigation({
				targetId: "monster-1",
				targetName: "Rato",
				type: "short_rest",
				tier: 1,
				dc: 12,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("REPOSITORY_WRITE_FAILED");
			}
		});

		it("retorna erro se falhar ao salvar a nova investigação", async () => {
			const { service, repository } = createSetup();
			repository.setSaveFailure(true);

			const result = await service.startInvestigation({
				targetId: "monster-1",
				targetName: "Rato",
				type: "short_rest",
				tier: 1,
				dc: 12,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("REPOSITORY_WRITE_FAILED");
			}
		});

		it("inicializa uma pesquisa semanal com custos corretos para Tier 2 e Tier 4", async () => {
			const { service } = createSetup();

			const resTier2 = await service.startInvestigation({
				targetId: "monster-t2",
				targetName: "Tier 2 Monster",
				type: "weekly_metropolis",
				tier: 2,
				dc: 15,
			});
			expect(resTier2.success).toBe(true);
			if (resTier2.success) {
				expect(resTier2.data.goldCostPerTest).toBe(100);
			}

			const resTier4 = await service.startInvestigation({
				targetId: "monster-t4",
				targetName: "Tier 4 Monster",
				type: "weekly_metropolis",
				tier: 4,
				dc: 15,
			});
			expect(resTier4.success).toBe(true);
			if (resTier4.success) {
				expect(resTier4.data.goldCostPerTest).toBe(2000);
			}
		});
	});

	describe("rollResearchTest", () => {
		it("falha se o id da investigação não existir", async () => {
			const { service } = createSetup();

			const result = await service.rollResearchTest({
				id: "missing-project",
				d20Roll: 10,
				modifier: 2,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("INVALID_INVESTIGATION_INPUT");
			}
		});

		it("falha se a investigação já estiver finalizada", async () => {
			const { service, repository } = createSetup();

			const recordResult = await service.startInvestigation({
				targetId: "monster-1",
				targetName: "Rato Gigante",
				type: "short_rest",
				tier: 1,
				dc: 12,
			});
			expect(recordResult.success).toBe(true);
			const project = (recordResult as { data: InvestigationRecord }).data;

			project.status = "completed_perfect";
			await repository.save(project);

			const result = await service.rollResearchTest({
				id: project.id,
				d20Roll: 10,
				modifier: 2,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("INVESTIGATION_FINISHED");
			}
		});

		it("processa um Sucesso Crítico adicionando 2 sucessos e recompensando EE", async () => {
			const { service } = createSetup();

			const recordResult = await service.startInvestigation({
				targetId: "monster-1",
				targetName: "Rato Gigante",
				type: "short_rest",
				tier: 1,
				dc: 12,
			});
			const project = (recordResult as { data: InvestigationRecord }).data;

			const rollResult = await service.rollResearchTest({
				id: project.id,
				d20Roll: 20, // 20 natural
				modifier: 2,
			});

			expect(rollResult.success).toBe(true);
			if (rollResult.success) {
				expect(rollResult.data.outcome).toBe("critical");
				expect(rollResult.data.investigation.successesAccumulated).toBe(2);
				expect(rollResult.data.rewards?.eeRecovered).toBe(1);
			}
		});

		it("processa um Sucesso normal adicionando 1 sucesso", async () => {
			const { service } = createSetup();

			const recordResult = await service.startInvestigation({
				targetId: "monster-1",
				targetName: "Rato Gigante",
				type: "short_rest",
				tier: 1,
				dc: 12,
			});
			const project = (recordResult as { data: InvestigationRecord }).data;

			const rollResult = await service.rollResearchTest({
				id: project.id,
				d20Roll: 10, // total = 10 + 2 = 12 (atinge DC 12)
				modifier: 2,
			});

			expect(rollResult.success).toBe(true);
			if (rollResult.success) {
				expect(rollResult.data.outcome).toBe("success");
				expect(rollResult.data.investigation.successesAccumulated).toBe(1);
				expect(rollResult.data.rewards?.eeRecovered).toBeUndefined();
			}
		});

		it("processa um Sucesso com Custo cobrando ouro por padrão", async () => {
			const { service } = createSetup();

			const recordResult = await service.startInvestigation({
				targetId: "monster-1",
				targetName: "Rato Gigante",
				type: "weekly_metropolis",
				tier: 1,
				dc: 12,
			});
			const project = (recordResult as { data: InvestigationRecord }).data;

			const rollResult = await service.rollResearchTest({
				id: project.id,
				d20Roll: 9, // total = 9 + 2 = 11 (errou por 1 da DC 12)
				modifier: 2,
			});

			expect(rollResult.success).toBe(true);
			if (rollResult.success) {
				expect(rollResult.data.outcome).toBe("success_with_cost");
				expect(rollResult.data.investigation.successesAccumulated).toBe(1);
				expect(rollResult.data.rewards?.goldCostMultiplier).toBe(2);
				expect(rollResult.data.rewards?.vigorCost).toBeUndefined();
			}
		});

		it("processa um Sucesso com Custo cobrando Vigor se useVigorCost estiver true", async () => {
			const { service } = createSetup();

			const recordResult = await service.startInvestigation({
				targetId: "monster-1",
				targetName: "Rato Gigante",
				type: "short_rest",
				tier: 1,
				dc: 12,
			});
			const project = (recordResult as { data: InvestigationRecord }).data;

			const rollResult = await service.rollResearchTest({
				id: project.id,
				d20Roll: 9, // total = 11
				modifier: 2,
				useVigorCost: true,
			});

			expect(rollResult.success).toBe(true);
			if (rollResult.success) {
				expect(rollResult.data.outcome).toBe("success_with_cost");
				expect(rollResult.data.rewards?.vigorCost).toBe(1);
				expect(rollResult.data.rewards?.goldCostMultiplier).toBeUndefined();
			}
		});

		it("processa uma Falha adicionando falha de tolerância", async () => {
			const { service } = createSetup();

			const recordResult = await service.startInvestigation({
				targetId: "monster-1",
				targetName: "Rato Gigante",
				type: "short_rest",
				tier: 1,
				dc: 12,
			});
			const project = (recordResult as { data: InvestigationRecord }).data;

			const rollResult = await service.rollResearchTest({
				id: project.id,
				d20Roll: 5, // total = 7 (errou por 5 da DC 12)
				modifier: 2,
			});

			expect(rollResult.success).toBe(true);
			if (rollResult.success) {
				expect(rollResult.data.outcome).toBe("failure");
				expect(rollResult.data.investigation.successesAccumulated).toBe(0);
				expect(rollResult.data.investigation.failuresAccumulated).toBe(1);
			}
		});

		it("completa perfeitamente uma pesquisa se sucessos exigidos forem batidos com 0 falhas", async () => {
			const { service, worldStateService } = createSetup();

			const recordResult = await service.startInvestigation({
				targetId: "monster-boss",
				targetName: "Lord Sombrio",
				type: "short_rest",
				tier: 1,
				dc: 12,
			});
			const project = (recordResult as { data: InvestigationRecord }).data;

			// Roda 2 rolagens críticas seguidas (2 * 2 sucessos = 4 sucessos, exigidos = 3)
			await service.rollResearchTest({
				id: project.id,
				d20Roll: 20,
				modifier: 2,
			});
			const lastRoll = await service.rollResearchTest({
				id: project.id,
				d20Roll: 20,
				modifier: 2,
			});

			expect(lastRoll.success).toBe(true);
			if (lastRoll.success) {
				expect(lastRoll.data.investigation.status).toBe("completed_perfect");
				expect(lastRoll.data.rewards?.tokensAwarded).toBe(3);
			}

			// Verifica se os tokens de insight foram salvos no WorldState
			const targetIdFlag = await worldStateService.getFlag(
				"plot:insight_target_id",
			);
			const tokensCountFlag = await worldStateService.getFlag(
				"plot:insight_tokens_count",
			);

			expect(targetIdFlag.success).toBe(true);
			expect(tokensCountFlag.success).toBe(true);
			if (targetIdFlag.success && tokensCountFlag.success) {
				expect(targetIdFlag.data.value).toBe("monster-boss");
				expect(tokensCountFlag.data.value).toBe(3);
			}
		});

		it("completa de forma padrão se houver falhas dentro da tolerância", async () => {
			const { service, worldStateService } = createSetup();

			const recordResult = await service.startInvestigation({
				targetId: "monster-standard",
				targetName: "Ogro das Cavernas",
				type: "weekly_metropolis",
				tier: 1,
				dc: 12,
			});
			const project = (recordResult as { data: InvestigationRecord }).data;

			// Adiciona 1 falha de tolerância
			await service.rollResearchTest({
				id: project.id,
				d20Roll: 4,
				modifier: 2,
			});

			// Acumula sucessos até 5 (sucessos exigidos = 6)
			for (let i = 0; i < 5; i++) {
				await service.rollResearchTest({
					id: project.id,
					d20Roll: 12,
					modifier: 0,
				});
			}

			const lastFound = await service.rollResearchTest({
				id: project.id,
				d20Roll: 12,
				modifier: 0,
			});

			expect(lastFound.success).toBe(true);
			if (lastFound.success) {
				expect(lastFound.data.investigation.status).toBe("completed_standard");
				expect(lastFound.data.rewards?.tokensAwarded).toBe(1);
			}

			const tokensCountFlag = await worldStateService.getFlag(
				"plot:insight_tokens_count",
			);
			expect(tokensCountFlag.success).toBe(true);
			if (tokensCountFlag.success) {
				expect(tokensCountFlag.data.value).toBe(1);
			}
		});

		it("falha o projeto se exceder o número de falhas de tolerância", async () => {
			const { service } = createSetup();

			const recordResult = await service.startInvestigation({
				targetId: "monster-diff",
				targetName: "Dragão Negro",
				type: "short_rest", // tolerância = 1 falha
				tier: 3,
				dc: 25,
			});
			const project = (recordResult as { data: InvestigationRecord }).data;

			// Adiciona falha 1
			await service.rollResearchTest({
				id: project.id,
				d20Roll: 2,
				modifier: 0,
			});
			// Adiciona falha 2 (estoura limite 1)
			const res = await service.rollResearchTest({
				id: project.id,
				d20Roll: 2,
				modifier: 0,
			});

			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.investigation.status).toBe("failed");
				expect(res.data.rewards?.tokensAwarded).toBeUndefined();
			}
		});

		it("retorna erro se a busca no repositório falhar por erro de infra", async () => {
			const { service, repository } = createSetup();
			repository.setFindFailure(true);

			const result = await service.rollResearchTest({
				id: "any-id",
				d20Roll: 10,
				modifier: 2,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("INVALID_INVESTIGATION_INPUT");
			}
		});

		it("retorna erro se falhar ao salvar os tokens de insight no WorldState", async () => {
			const { service, worldStateRepo } = createSetup();

			const recordResult = await service.startInvestigation({
				targetId: "monster-boss",
				targetName: "Lord Sombrio",
				type: "short_rest",
				tier: 1,
				dc: 12,
			});
			const project = (recordResult as { data: InvestigationRecord }).data;

			// Roda rolagens críticas
			await service.rollResearchTest({
				id: project.id,
				d20Roll: 20,
				modifier: 2,
			});

			// Força falha no próximo setFlag do WorldState
			worldStateRepo.failNextWrite({
				code: "WORLD_STATE_REPOSITORY_WRITE_FAILED",
				message: "Mocked worldstate write failure",
			});

			const lastRoll = await service.rollResearchTest({
				id: project.id,
				d20Roll: 20,
				modifier: 2,
			});

			expect(lastRoll.success).toBe(false);
			if (!lastRoll.success) {
				expect(lastRoll.error.code).toBe("NARRATIVE_FLAG_FAILED");
			}
		});

		it("retorna erro se falhar ao salvar a atualização da investigação", async () => {
			const { service, repository } = createSetup();

			const recordResult = await service.startInvestigation({
				targetId: "monster-1",
				targetName: "Rato",
				type: "short_rest",
				tier: 1,
				dc: 12,
			});
			const project = (recordResult as { data: InvestigationRecord }).data;

			repository.setSaveFailure(true);

			const result = await service.rollResearchTest({
				id: project.id,
				d20Roll: 10,
				modifier: 2,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("REPOSITORY_WRITE_FAILED");
			}
		});

		it("conclui com status completed_poor se exceder falhas mas bater sucessos de alguma forma (caso de borda)", async () => {
			const { service, repository } = createSetup();

			const recordResult = await service.startInvestigation({
				targetId: "monster-poor",
				targetName: "Criatura Mágica",
				type: "weekly_metropolis",
				tier: 1,
				dc: 12,
			});
			const project = (recordResult as { data: InvestigationRecord }).data;

			project.failuresAccumulated = 3;
			project.successesAccumulated = 5;
			await repository.save(project);

			const lastRoll = await service.rollResearchTest({
				id: project.id,
				d20Roll: 12,
				modifier: 0,
			});

			expect(lastRoll.success).toBe(true);
			if (lastRoll.success) {
				expect(lastRoll.data.investigation.status).toBe("completed_poor");
				expect(lastRoll.data.rewards?.tokensAwarded).toBe(0);
			}
		});
	});

	describe("spendInsightToken", () => {
		it("desconta 1 token da reserva de insight se o alvo corresponder", async () => {
			const { service, worldStateService } = createSetup();

			// Simula os tokens carregados na reserva
			await worldStateService.setNarrativeFlag({
				key: "plot:insight_target_id",
				value: "dragon-red",
				updatedAt: TEST_TIMESTAMP,
			});
			await worldStateService.setNarrativeFlag({
				key: "plot:insight_tokens_count",
				value: 3,
				updatedAt: TEST_TIMESTAMP,
			});

			const spendResult = await service.spendInsightToken({
				targetId: "dragon-red",
			});

			expect(spendResult.success).toBe(true);
			if (spendResult.success) {
				expect(spendResult.data.remainingTokens).toBe(2);
			}

			const currentTokens = await worldStateService.getFlag(
				"plot:insight_tokens_count",
			);
			expect(currentTokens.success).toBe(true);
			if (currentTokens.success) {
				expect(Number(currentTokens.data.value)).toBe(2);
			}
		});

		it("falha ao gastar se o alvo não corresponder à reserva ativa", async () => {
			const { service, worldStateService } = createSetup();

			await worldStateService.setNarrativeFlag({
				key: "plot:insight_target_id",
				value: "dragon-red",
				updatedAt: TEST_TIMESTAMP,
			});
			await worldStateService.setNarrativeFlag({
				key: "plot:insight_tokens_count",
				value: 3,
				updatedAt: TEST_TIMESTAMP,
			});

			const spendResult = await service.spendInsightToken({
				targetId: "lobo-cinzento",
			});

			expect(spendResult.success).toBe(false);
			if (!spendResult.success) {
				expect(spendResult.error.code).toBe("INVALID_INVESTIGATION_INPUT");
			}
		});

		it("falha ao gastar se a contagem de tokens for zero", async () => {
			const { service, worldStateService } = createSetup();

			await worldStateService.setNarrativeFlag({
				key: "plot:insight_target_id",
				value: "dragon-red",
				updatedAt: TEST_TIMESTAMP,
			});
			await worldStateService.setNarrativeFlag({
				key: "plot:insight_tokens_count",
				value: 0,
				updatedAt: TEST_TIMESTAMP,
			});

			const spendResult = await service.spendInsightToken({
				targetId: "dragon-red",
			});

			expect(spendResult.success).toBe(false);
			if (!spendResult.success) {
				expect(spendResult.error.code).toBe("INSUFFICIENT_FUNDS");
			}
		});

		it("falha se o worldState falhar ao buscar o plot:insight_target_id", async () => {
			const { service, worldStateRepo } = createSetup();

			worldStateRepo.failNextLookup({
				code: "WORLD_STATE_FLAG_NOT_FOUND",
				message: "Mocked worldstate lookup failure",
			});

			const result = await service.spendInsightToken({
				targetId: "dragon-red",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("INVALID_INVESTIGATION_RECORD");
			}
		});

		it("falha se o worldState falhar ao buscar plot:insight_tokens_count", async () => {
			const { service, worldStateRepo } = createSetup();

			await worldStateRepo.setFlag({
				key: "plot:insight_target_id",
				valueJson: JSON.stringify("dragon-red"),
				updatedAt: TEST_TIMESTAMP,
			});

			// Sobrescreve getFlag para falhar especificamente ao buscar a contagem de tokens de insight
			const originalGetFlag = worldStateRepo.getFlag.bind(worldStateRepo);
			worldStateRepo.getFlag = async (key) => {
				if (key === "plot:insight_tokens_count") {
					return fail({
						code: "WORLD_STATE_FLAG_NOT_FOUND",
						message: "Mocked lookup failure for tokens count",
					});
				}
				return originalGetFlag(key);
			};

			const result = await service.spendInsightToken({
				targetId: "dragon-red",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("INVALID_INVESTIGATION_RECORD");
			}
		});

		it("falha se falhar ao atualizar o saldo de tokens no worldState", async () => {
			const { service, worldStateRepo } = createSetup();

			await worldStateRepo.setFlag({
				key: "plot:insight_target_id",
				valueJson: JSON.stringify("dragon-red"),
				updatedAt: TEST_TIMESTAMP,
			});
			await worldStateRepo.setFlag({
				key: "plot:insight_tokens_count",
				valueJson: JSON.stringify(3),
				updatedAt: TEST_TIMESTAMP,
			});

			worldStateRepo.failNextWrite({
				code: "WORLD_STATE_REPOSITORY_WRITE_FAILED",
				message: "Mocked write failure",
			});

			const result = await service.spendInsightToken({
				targetId: "dragon-red",
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("NARRATIVE_FLAG_FAILED");
			}
		});

		it("permite gastar o último token zerando a contagem", async () => {
			const { service, worldStateRepo, worldStateService } = createSetup();

			await worldStateRepo.setFlag({
				key: "plot:insight_target_id",
				valueJson: JSON.stringify("dragon-red"),
				updatedAt: TEST_TIMESTAMP,
			});
			await worldStateRepo.setFlag({
				key: "plot:insight_tokens_count",
				valueJson: JSON.stringify(1),
				updatedAt: TEST_TIMESTAMP,
			});

			const result = await service.spendInsightToken({
				targetId: "dragon-red",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.remainingTokens).toBe(0);
			}

			const currentTokens = await worldStateService.getFlag(
				"plot:insight_tokens_count",
			);
			expect(currentTokens.success).toBe(true);
			if (currentTokens.success) {
				expect(Number(currentTokens.data.value)).toBe(0);
			}
		});
	});
});
