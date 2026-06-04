/* biome-ignore-start lint/style/noNonNullAssertion: legacy test assertions */
import { describe, expect, it } from "vitest";
import { fail } from "$lib/shared/lib/result";
import { ResearchService } from "../domain/ResearchService";
import { InMemoryInvestigationRepository } from "../infrastructure/InMemoryInvestigationRepository";
import type { InvestigationRecord } from "../model/investigationSchema";
import type { InvestigationRepositoryFailure } from "../model/investigationTypes";

describe("ResearchService", () => {
	it("cria um novo projeto de pesquisa com sucesso", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		const result = await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Glifos Antigos de Void",
			type: "cryptography",
			tier: 2,
			dc: 14,
			successesRequired: 3,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toMatchObject({
				id: "project-1",
				targetId: "target-123",
				targetName: "Glifos Antigos de Void",
				type: "cryptography",
				tier: 2,
				dc: 14,
				successesRequired: 3,
				successesAccumulated: 0,
				failuresMax: 3,
				failuresAccumulated: 0,
				status: "active",
				goldCostPerTest: 0,
				translatedPercent: 0,
				discoveredSecrets: "",
			});
		}
	});

	it("retorna falha de repositório ao criar projeto com erro de persistência", async () => {
		class FailingRepo extends InMemoryInvestigationRepository {
			public override async save(): Promise<
				| { readonly success: true; readonly data: InvestigationRecord }
				| {
						readonly success: false;
						readonly error: InvestigationRepositoryFailure;
				  }
			> {
				return fail({
					code: "INVESTIGATION_REPOSITORY_WRITE_FAILED",
					message: "Erro simulado no banco.",
				});
			}
		}

		const repo = new FailingRepo();
		const service = new ResearchService(repo);

		const result = await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Glifos Antigos de Void",
			type: "cryptography",
			tier: 2,
			dc: 14,
			successesRequired: 3,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("REPOSITORY_ERROR");
			expect(result.error.message).toBe("Erro simulado no banco.");
		}
	});

	it("retorna erro ao tentar executar teste em projeto inexistente", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		const result = await service.executeResearchTest({
			investigationId: "missing-project",
			rollValue: 10,
			modifier: 2,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("INVESTIGATION_NOT_FOUND");
		}
	});

	it("retorna erro ao tentar testar projeto já concluído ou falhado", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Glifos Antigos de Void",
			type: "cryptography",
			tier: 2,
			dc: 14,
			successesRequired: 1,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		// Executa e conclui o projeto
		const test1 = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 20, // Sucesso crítico imediato
			modifier: 0,
		});
		expect(test1.success).toBe(true);

		// Tenta executar outro teste em projeto concluído
		const test2 = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 15,
			modifier: 0,
		});

		expect(test2.success).toBe(false);
		if (!test2.success) {
			expect(test2.error.code).toBe("INVALID_RESEARCH_STATE");
		}
	});

	it("resolve tradução instantânea via Poliglota Supremo em Criptografia", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Códice Cryptus",
			type: "cryptography",
			tier: 2,
			dc: 15,
			successesRequired: 3,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		const result = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 1,
			modifier: 0,
			hasPoliglotaSupremo: true,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.success).toBe(true);
			expect(result.data.record.status).toBe("completed_perfect");
			expect(result.data.record.translatedPercent).toBe(100);
			expect(result.data.log).toContain("Poliglota Supremo");
		}
	});

	it("executa sucesso crítico e revela o segredo mais íntimo em Criptografia", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Diário Codificado",
			type: "cryptography",
			tier: 1,
			dc: 10,
			successesRequired: 3,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		const result = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 15, // Margem de +5 sobre a DC 10
			modifier: 0,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.success).toBe(true);
			expect(result.data.isCritical).toBe(true);
			expect(result.data.record.discoveredSecrets).toContain("Segredo Íntimo");
		}
	});

	it("executa falha parcial (Regra de Ouro) traduzindo 80% do texto em Criptografia", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Glifos Antigos",
			type: "cryptography",
			tier: 2,
			dc: 15,
			successesRequired: 3,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		const result = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 11, // Falha por 4 (DC 15 - 4 = 11)
			modifier: 0,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.success).toBe(true); // Regra de ouro conta como sucesso
			expect(result.data.translatedPercent).toBe(80);
			expect(result.data.record.failuresAccumulated).toBe(1);
		}
	});

	it("executa falha total em Criptografia", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Glifos Antigos",
			type: "cryptography",
			tier: 2,
			dc: 15,
			successesRequired: 3,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		const result = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 5, // Falha total (menor que DC 15 - 4 = 11)
			modifier: 0,
		});

		expect(result.success).toBe(true); // Computação rodou com sucesso
		if (result.success) {
			expect(result.data.success).toBe(false); // A rolagem em si falhou
			expect(result.data.record.failuresAccumulated).toBe(1);
			expect(result.data.translatedPercent).toBe(0);
		}
	});

	it("executa Investigação Extrema para evitar falha total gastando 25 PO em Lore", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Lore de Dragão",
			type: "lore",
			tier: 2,
			dc: 15,
			successesRequired: 3,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		const result = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 5, // Falha total
			modifier: 0,
			spendGoldExtreme: true,
			currentGold: 100,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.success).toBe(false);
			expect(result.data.record.failuresAccumulated).toBe(0); // Evitou gravação de falha!
			expect(result.data.goldSpent).toBe(25);
		}
	});

	it("executa Investigação Extrema em falha parcial (Regra de Ouro) de Lore", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Lore de Dragão",
			type: "lore",
			tier: 2,
			dc: 15,
			successesRequired: 3,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		const result = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 12, // Falha parcial (DC 15 - 3 = 12)
			modifier: 0,
			spendGoldExtreme: true,
			currentGold: 30,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.success).toBe(false);
			expect(result.data.record.failuresAccumulated).toBe(0); // Evitou a falha
		}
	});

	it("retorna erro ao tentar usar Investigação Extrema sem fundos suficientes", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Lore de Dragão",
			type: "lore",
			tier: 2,
			dc: 15,
			successesRequired: 3,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		const result = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 5,
			modifier: 0,
			spendGoldExtreme: true,
			currentGold: 10, // Ouro insuficiente
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("INSUFFICIENT_FUNDS");
		}
	});

	it("limita e encerra o projeto como falhado ao atingir o limite de falhas acumuladas", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Glifos Antigos",
			type: "cryptography",
			tier: 2,
			dc: 15,
			successesRequired: 3,
			failuresMax: 2,
			timestamp: "2026-05-30T00:00:00Z",
		});

		await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 5,
			modifier: 0,
		});

		const secondTest = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 5,
			modifier: 0,
		});

		expect(secondTest.success).toBe(true);
		if (secondTest.success) {
			expect(secondTest.data.record.status).toBe("failed");
		}
	});

	it("retorna erro de repositório se a atualização do projeto falhar na persistência do teste", async () => {
		class FailingUpdateRepo extends InMemoryInvestigationRepository {
			private count = 0;
			public override async save(record: InvestigationRecord): Promise<
				| { readonly success: true; readonly data: InvestigationRecord }
				| {
						readonly success: false;
						readonly error: InvestigationRepositoryFailure;
				  }
			> {
				this.count++;
				if (this.count > 1) {
					return fail({
						code: "INVESTIGATION_REPOSITORY_WRITE_FAILED",
						message: "Erro na atualização.",
					});
				}
				return super.save(record);
			}
		}

		const repo = new FailingUpdateRepo();
		const service = new ResearchService(repo);

		await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Glifos Antigos",
			type: "cryptography",
			tier: 2,
			dc: 15,
			successesRequired: 3,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		const result = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 20,
			modifier: 0,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("REPOSITORY_ERROR");
			expect(result.error.message).toBe("Erro na atualização.");
		}
	});

	it("executa falha parcial em Lore sem gastar ouro", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Lore de Dragão",
			type: "lore",
			tier: 2,
			dc: 15,
			successesRequired: 3,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		const result = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 12,
			modifier: 0,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.success).toBe(false);
			expect(result.data.record.failuresAccumulated).toBe(1);
		}
	});

	it("conclui projeto com 2 falhas acumuladas resultando em completed_poor", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Lore de Dragão",
			type: "lore",
			tier: 2,
			dc: 15,
			successesRequired: 1,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		const p = repo.investigations.find((i) => i.id === "project-1")!;
		p.failuresAccumulated = 2;

		const result = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 20,
			modifier: 0,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.record.status).toBe("completed_poor");
		}
	});

	it("conclui projeto com exatamente 1 falha acumulada resultando em completed_standard", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Lore de Dragão",
			type: "lore",
			tier: 2,
			dc: 15,
			successesRequired: 1,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		const p = repo.investigations.find((i) => i.id === "project-1")!;
		p.failuresAccumulated = 1;

		const result = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 20,
			modifier: 0,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.record.status).toBe("completed_standard");
		}
	});

	it("retorna erro de repositório se a tradução instantânea falhar na persistência", async () => {
		class FailingPoliglotaRepo extends InMemoryInvestigationRepository {
			public override async save(): Promise<
				| { readonly success: true; readonly data: InvestigationRecord }
				| {
						readonly success: false;
						readonly error: InvestigationRepositoryFailure;
				  }
			> {
				return fail({
					code: "INVESTIGATION_REPOSITORY_WRITE_FAILED",
					message: "Erro simulado no Poliglota.",
				});
			}
		}

		const repo = new FailingPoliglotaRepo();
		const service = new ResearchService(repo);

		repo.investigations.push({
			id: "project-1",
			targetId: "target-123",
			targetName: "Códice Cryptus",
			type: "cryptography",
			tier: 2,
			dc: 15,
			successesRequired: 3,
			successesAccumulated: 0,
			failuresMax: 3,
			failuresAccumulated: 0,
			status: "active",
			goldCostPerTest: 0,
			translatedPercent: 0,
			discoveredSecrets: "",
			createdAt: "2026-05-30T00:00:00Z",
			updatedAt: "2026-05-30T00:00:00Z",
		});

		const result = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 1,
			modifier: 0,
			hasPoliglotaSupremo: true,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("REPOSITORY_ERROR");
			expect(result.error.message).toBe("Erro simulado no Poliglota.");
		}
	});

	it("cria um projeto com tipo great_enigma cobrando 10 PO por teste", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		const result = await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Grande Enigma Rúnico",
			type: "great_enigma",
			tier: 3,
			dc: 18,
			successesRequired: 6,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.goldCostPerTest).toBe(10);
		}
	});

	it("executa sucesso normal (não crítico) acumulando apenas 1 sucesso", async () => {
		const repo = new InMemoryInvestigationRepository();
		const service = new ResearchService(repo);

		await service.createProject({
			id: "project-1",
			targetId: "target-123",
			targetName: "Lore de Dragão",
			type: "lore",
			tier: 2,
			dc: 15,
			successesRequired: 3,
			failuresMax: 3,
			timestamp: "2026-05-30T00:00:00Z",
		});

		const result = await service.executeResearchTest({
			investigationId: "project-1",
			rollValue: 15,
			modifier: 0,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.record.successesAccumulated).toBe(1);
		}
	});
});
/* biome-ignore-end */
