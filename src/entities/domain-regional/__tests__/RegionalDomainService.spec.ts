import { describe, expect, it } from "vitest";
import { RegionalDomainService } from "../domain/RegionalDomainService";
import { InMemoryRegionalDomainRepository } from "../infrastructure/InMemoryRegionalDomainRepository";
import type {
	RegionalDomainClock,
	RegionalDomainIdProvider,
} from "../model/regionalDomainTypes";

const TEST_TIMESTAMP = "2026-05-27T11:00:00.000Z";

class FakeClock implements RegionalDomainClock {
	public now(): string {
		return TEST_TIMESTAMP;
	}
}

class FakeIdProvider implements RegionalDomainIdProvider {
	private count = 0;
	public generate(): string {
		this.count += 1;
		return `domain-${this.count}`;
	}
}

function createSetup() {
	const repository = new InMemoryRegionalDomainRepository();
	const idProvider = new FakeIdProvider();
	const clock = new FakeClock();
	const service = new RegionalDomainService(repository, idProvider, clock);
	return { repository, idProvider, clock, service };
}

describe("RegionalDomainService", () => {
	describe("createDomain", () => {
		it("cria um domínio regional com sucesso para tier válido", async () => {
			const { service } = createSetup();
			const result = await service.createDomain({ tier: 2 });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toMatchObject({
					id: "domain-1",
					tier: 2,
					physicalLevel: 0,
					mentalLevel: 0,
					socialLevel: 0,
					regentId: null,
					weeksAway: 0,
					createdAt: TEST_TIMESTAMP,
					updatedAt: TEST_TIMESTAMP,
				});
			}
		});

		it("falha ao criar domínio com tier inválido", async () => {
			const { service } = createSetup();
			const resLow = await service.createDomain({ tier: 0 });
			const resHigh = await service.createDomain({ tier: 5 });
			expect(resLow.success).toBe(false);
			expect(resHigh.success).toBe(false);
		});

		it("falha se o repositório falhar ao salvar", async () => {
			const { service, repository } = createSetup();
			repository.save = async () => ({
				success: false,
				error: {
					code: "REGIONAL_DOMAIN_REPOSITORY_WRITE_FAILED",
					message: "Mocked failure",
				},
			});
			const res = await service.createDomain({ tier: 1 });
			expect(res.success).toBe(false);
		});
	});

	describe("upgradeMatrix", () => {
		it("evolui o nível de uma matriz respeitando a regra 5/3/1", async () => {
			const { service } = createSetup();
			const createRes = await service.createDomain({ tier: 1 });
			const id = createRes.success ? createRes.data.id : "";

			// Sobe physical para 1
			const res1 = await service.upgradeMatrix({ id, matrix: "physical" });
			expect(res1.success).toBe(true);
			expect(res1.success ? res1.data.physicalLevel : 0).toBe(1);

			// Sobe mental para 1
			const res2 = await service.upgradeMatrix({ id, matrix: "mental" });
			expect(res2.success).toBe(true);

			// Sobe social para 1
			const res3 = await service.upgradeMatrix({ id, matrix: "social" });
			expect(res3.success).toBe(true);
			// Níveis atuais: [1, 1, 1]

			// Sobe physical para 2 (sorted: [2, 1, 1]) -> Válido (2<=5, 1<=3, 1<=1)
			const res4 = await service.upgradeMatrix({ id, matrix: "physical" });
			expect(res4.success).toBe(true);

			// Sobe mental para 2 (sorted: [2, 2, 1]) -> Válido
			const res5 = await service.upgradeMatrix({ id, matrix: "mental" });
			expect(res5.success).toBe(true);

			// Tenta subir social para 2 (sorted: [2, 2, 2]) -> Inválido ( sorted[2] <= 1 )
			const resFail = await service.upgradeMatrix({ id, matrix: "social" });
			expect(resFail.success).toBe(false);
		});

		it("impede evolução se o nível da matriz exceder 5", async () => {
			const { service, repository } = createSetup();
			const createRes = await service.createDomain({ tier: 1 });
			const domain = createRes.success ? createRes.data : null;
			if (!domain) {
				expect(domain).not.toBeNull();
				return;
			}

			// Força o nível físico para 5
			await repository.save({
				...domain,
				physicalLevel: 5,
			});

			const res = await service.upgradeMatrix({
				id: domain.id,
				matrix: "physical",
			});
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.message).toBe(
					"Nenhuma matriz pode exceder o nível 5.",
				);
			}
		});

		it("retorna erro se o domínio não for encontrado", async () => {
			const { service } = createSetup();
			const res = await service.upgradeMatrix({
				id: "non-existent",
				matrix: "physical",
			});
			expect(res.success).toBe(false);
		});

		it("falha se o repositório falhar ao salvar após evolução", async () => {
			const { service, repository } = createSetup();
			const createRes = await service.createDomain({ tier: 1 });
			const id = createRes.success ? createRes.data.id : "";

			repository.save = async (record) => {
				if (record.physicalLevel > 0) {
					return {
						success: false,
						error: {
							code: "REGIONAL_DOMAIN_REPOSITORY_WRITE_FAILED",
							message: "Mocked save error",
						},
					};
				}
				// Para a gravação inicial funcionar
				return {
					success: true,
					data: {
						...record,
						physicalLevel: record.physicalLevel ?? 0,
						mentalLevel: record.mentalLevel ?? 0,
						socialLevel: record.socialLevel ?? 0,
						weeksAway: record.weeksAway ?? 0,
					},
				};
			};

			const res = await service.upgradeMatrix({ id, matrix: "physical" });
			expect(res.success).toBe(false);
		});
	});

	describe("hireRegent", () => {
		it("associa regentId e remove com sucesso", async () => {
			const { service } = createSetup();
			const createRes = await service.createDomain({ tier: 1 });
			const id = createRes.success ? createRes.data.id : "";

			const resHire = await service.hireRegent({ id, regentId: "regent-123" });
			expect(resHire.success).toBe(true);
			expect(resHire.success ? resHire.data.regentId : null).toBe("regent-123");

			const resFire = await service.hireRegent({ id, regentId: null });
			expect(resFire.success).toBe(true);
			expect(resFire.success ? resFire.data.regentId : "").toBeNull();
		});

		it("retorna erro se o domínio não existir", async () => {
			const { service } = createSetup();
			const res = await service.hireRegent({
				id: "non-existent",
				regentId: "regent-1",
			});
			expect(res.success).toBe(false);
		});

		it("falha se o repositório falhar no save", async () => {
			const { service, repository } = createSetup();
			const createRes = await service.createDomain({ tier: 1 });
			const id = createRes.success ? createRes.data.id : "";

			repository.save = async (record) => {
				if (record.regentId !== null) {
					return {
						success: false,
						error: {
							code: "REGIONAL_DOMAIN_REPOSITORY_WRITE_FAILED",
							message: "Failed",
						},
					};
				}
				return {
					success: true,
					data: {
						...record,
						physicalLevel: record.physicalLevel ?? 0,
						mentalLevel: record.mentalLevel ?? 0,
						socialLevel: record.socialLevel ?? 0,
						weeksAway: record.weeksAway ?? 0,
					},
				};
			};

			const res = await service.hireRegent({ id, regentId: "reg-1" });
			expect(res.success).toBe(false);
		});
	});

	describe("weeksAway", () => {
		it("incrementa e reseta semanas de ausência corretamente", async () => {
			const { service } = createSetup();
			const createRes = await service.createDomain({ tier: 1 });
			const id = createRes.success ? createRes.data.id : "";

			const resAdd = await service.addWeeksAway({ id, weeks: 3 });
			expect(resAdd.success).toBe(true);
			expect(resAdd.success ? resAdd.data.weeksAway : 0).toBe(3);

			const resAddInvalid = await service.addWeeksAway({ id, weeks: -1 });
			expect(resAddInvalid.success).toBe(false);

			const resReset = await service.resetWeeksAway({ id });
			expect(resReset.success).toBe(true);
			expect(resReset.success ? resReset.data.weeksAway : -1).toBe(0);
		});

		it("retorna erro se o domínio não existir no add ou reset", async () => {
			const { service } = createSetup();
			const res1 = await service.addWeeksAway({ id: "non-existent", weeks: 2 });
			const res2 = await service.resetWeeksAway({ id: "non-existent" });
			expect(res1.success).toBe(false);
			expect(res2.success).toBe(false);
		});

		it("falha se o repositório falhar no save", async () => {
			const { service, repository } = createSetup();
			const createRes = await service.createDomain({ tier: 1 });
			const id = createRes.success ? createRes.data.id : "";

			repository.save = async (record) => {
				if (record.weeksAway > 0) {
					return {
						success: false,
						error: {
							code: "REGIONAL_DOMAIN_REPOSITORY_WRITE_FAILED",
							message: "Failed",
						},
					};
				}
				return {
					success: true,
					data: {
						...record,
						physicalLevel: record.physicalLevel ?? 0,
						mentalLevel: record.mentalLevel ?? 0,
						socialLevel: record.socialLevel ?? 0,
						weeksAway: record.weeksAway ?? 0,
					},
				};
			};

			const res1 = await service.addWeeksAway({ id, weeks: 2 });
			expect(res1.success).toBe(false);

			// Test reset failure
			repository.save = async (record) => {
				if (record.weeksAway === 0) {
					return {
						success: false,
						error: {
							code: "REGIONAL_DOMAIN_REPOSITORY_WRITE_FAILED",
							message: "Failed",
						},
					};
				}
				return {
					success: true,
					data: {
						...record,
						physicalLevel: record.physicalLevel ?? 0,
						mentalLevel: record.mentalLevel ?? 0,
						socialLevel: record.socialLevel ?? 0,
						weeksAway: record.weeksAway ?? 0,
					},
				};
			};
			const res2 = await service.resetWeeksAway({ id });
			expect(res2.success).toBe(false);
		});
	});

	describe("resolveStabilityCheck", () => {
		it("calcula CD de estabilidade com modificador de ausência correto e determina crise", async () => {
			const { service } = createSetup();
			const createRes = await service.createDomain({ tier: 1 });
			const id = createRes.success ? createRes.data.id : "";

			// Sem regente, weeksAway = 2. Ausência CD = 15 + 2 * 2 = 19.
			await service.addWeeksAway({ id, weeks: 2 });
			await service.upgradeMatrix({ id, matrix: "physical" }); // physical Level = 1

			// Rolagem: d20(10) + Atributo(3) + Level(1) = 14. CD = 19 -> Crise!
			const res1 = await service.resolveStabilityCheck({
				id,
				matrix: "physical",
				leaderAttribute: 3,
				d20Roll: 10,
			});

			expect(res1.success).toBe(true);
			if (res1.success) {
				expect(res1.data.cd).toBe(19);
				expect(res1.data.roll).toBe(14);
				expect(res1.data.hasCrisis).toBe(true);
			}

			// Testa para mental e social também
			await service.upgradeMatrix({ id, matrix: "mental" }); // Level 1
			await service.upgradeMatrix({ id, matrix: "social" }); // Level 1

			const resM = await service.resolveStabilityCheck({
				id,
				matrix: "mental",
				leaderAttribute: 3,
				d20Roll: 10,
			});
			expect(resM.success).toBe(true);
			expect(resM.success ? resM.data.roll : 0).toBe(14);

			const resS = await service.resolveStabilityCheck({
				id,
				matrix: "social",
				leaderAttribute: 3,
				d20Roll: 10,
			});
			expect(resS.success).toBe(true);
			expect(resS.success ? resS.data.roll : 0).toBe(14);

			// Rolagem: d20(18) + Atributo(3) + Level(1) = 22. CD = 19 -> Sucesso!
			const res2 = await service.resolveStabilityCheck({
				id,
				matrix: "physical",
				leaderAttribute: 3,
				d20Roll: 18,
			});
			expect(res2.success).toBe(true);
			if (res2.success) {
				expect(res2.data.hasCrisis).toBe(false);
			}
		});

		it("aplica mitigação de Regente (ausência CD +1/semana)", async () => {
			const { service } = createSetup();
			const createRes = await service.createDomain({ tier: 1 });
			const id = createRes.success ? createRes.data.id : "";

			await service.addWeeksAway({ id, weeks: 2 });
			await service.hireRegent({ id, regentId: "reg-1" });

			// Com regente, weeksAway = 2. CD = 15 + 2 * 1 = 17.
			const res = await service.resolveStabilityCheck({
				id,
				matrix: "physical",
				leaderAttribute: 0,
				d20Roll: 10,
			});
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.cd).toBe(17);
			}
		});

		it("retorna erro se o d20 for inválido", async () => {
			const { service } = createSetup();
			const createRes = await service.createDomain({ tier: 1 });
			const id = createRes.success ? createRes.data.id : "";

			const resLow = await service.resolveStabilityCheck({
				id,
				matrix: "physical",
				leaderAttribute: 0,
				d20Roll: 0,
			});
			const resHigh = await service.resolveStabilityCheck({
				id,
				matrix: "physical",
				leaderAttribute: 0,
				d20Roll: 21,
			});
			expect(resLow.success).toBe(false);
			expect(resHigh.success).toBe(false);
		});

		it("retorna erro se o domínio não for encontrado", async () => {
			const { service } = createSetup();
			const res = await service.resolveStabilityCheck({
				id: "non-existent",
				matrix: "physical",
				leaderAttribute: 0,
				d20Roll: 10,
			});
			expect(res.success).toBe(false);
		});
	});

	describe("collectTaxes", () => {
		it("calcula renda baseada no tier e resolve o teste com desvantagem", async () => {
			const { service } = createSetup();
			const createRes = await service.createDomain({ tier: 2 });
			const id = createRes.success ? createRes.data.id : "";

			// Tier 2 -> Renda = 500.
			// Teste com Desvantagem (CD +5) -> CD = 15 + 5 = 20.
			// d20Roll1 = 15, d20Roll2 = 8. Desvantagem pega o menor = 8.
			// Roll = 8 + Carisma(2) + SocialLevel(0) = 10. CD = 20 -> Crise!
			const res = await service.collectTaxes({
				id,
				leaderCarisma: 2,
				d20Roll1: 15,
				d20Roll2: 8,
			});

			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.revenue).toBe(500);
				expect(res.data.stabilityRoll).toBe(10);
				expect(res.data.cd).toBe(20);
				expect(res.data.hasCrisis).toBe(true);
			}
		});

		it("aplica mitigação de Regente no teste de estabilidade de impostos", async () => {
			const { service } = createSetup();
			const createRes = await service.createDomain({ tier: 2 });
			const id = createRes.success ? createRes.data.id : "";

			await service.addWeeksAway({ id, weeks: 2 });
			await service.hireRegent({ id, regentId: "reg-1" });

			// CD = 15 + 5 (impostos) + 2 weeks * 1 (com regente) = 22.
			const res = await service.collectTaxes({
				id,
				leaderCarisma: 0,
				d20Roll1: 10,
				d20Roll2: 10,
			});
			expect(res.success).toBe(true);
			expect(res.success ? res.data.cd : 0).toBe(22);
		});

		it("retorna erro se os d20 forem inválidos", async () => {
			const { service } = createSetup();
			const createRes = await service.createDomain({ tier: 1 });
			const id = createRes.success ? createRes.data.id : "";

			const resLow = await service.collectTaxes({
				id,
				leaderCarisma: 0,
				d20Roll1: 0,
				d20Roll2: 10,
			});
			const resHigh = await service.collectTaxes({
				id,
				leaderCarisma: 0,
				d20Roll1: 10,
				d20Roll2: 25,
			});
			expect(resLow.success).toBe(false);
			expect(resHigh.success).toBe(false);
		});

		it("retorna erro se o domínio não for encontrado", async () => {
			const { service } = createSetup();
			const res = await service.collectTaxes({
				id: "non-existent",
				leaderCarisma: 0,
				d20Roll1: 10,
				d20Roll2: 10,
			});
			expect(res.success).toBe(false);
		});
	});

	describe("resolveCrisis", () => {
		it("resolve crise por Delegação cobrando ouro", async () => {
			const { service } = createSetup();
			const createRes = await service.createDomain({ tier: 2 });
			const id = createRes.success ? createRes.data.id : "";

			// Sobe physical para 1, mental para 1, social para 1
			await service.upgradeMatrix({ id, matrix: "physical" });
			await service.upgradeMatrix({ id, matrix: "mental" });
			await service.upgradeMatrix({ id, matrix: "social" });

			// Custo para delegar Tier 2 (base 500) * Level 1 = 500 PO
			const resP = await service.resolveCrisis({
				id,
				matrix: "physical",
				resolution: "delegate",
			});
			expect(resP.success).toBe(true);
			expect(resP.success ? resP.data.costPaid : 0).toBe(500);

			const resM = await service.resolveCrisis({
				id,
				matrix: "mental",
				resolution: "delegate",
			});
			expect(resM.success).toBe(true);
			expect(resM.success ? resM.data.costPaid : 0).toBe(500);

			const resS = await service.resolveCrisis({
				id,
				matrix: "social",
				resolution: "delegate",
			});
			expect(resS.success).toBe(true);
			expect(resS.success ? resS.data.costPaid : 0).toBe(500);
		});

		it("resolve crise por Negligência reduzindo nível da matriz", async () => {
			const { service } = createSetup();
			const createRes = await service.createDomain({ tier: 2 });
			const id = createRes.success ? createRes.data.id : "";

			await service.upgradeMatrix({ id, matrix: "physical" });
			await service.upgradeMatrix({ id, matrix: "mental" });
			await service.upgradeMatrix({ id, matrix: "social" });

			const resP = await service.resolveCrisis({
				id,
				matrix: "physical",
				resolution: "negligence",
			});
			expect(resP.success).toBe(true);
			expect(resP.success ? resP.data.domain.physicalLevel : -1).toBe(0);

			const resM = await service.resolveCrisis({
				id,
				matrix: "mental",
				resolution: "negligence",
			});
			expect(resM.success).toBe(true);
			expect(resM.success ? resM.data.domain.mentalLevel : -1).toBe(0);

			const resS = await service.resolveCrisis({
				id,
				matrix: "social",
				resolution: "negligence",
			});
			expect(resS.success).toBe(true);
			expect(resS.success ? resS.data.domain.socialLevel : -1).toBe(0);
		});

		it("retorna erro se o domínio não for encontrado no resolveCrisis", async () => {
			const { service } = createSetup();
			const res = await service.resolveCrisis({
				id: "non-existent",
				matrix: "physical",
				resolution: "negligence",
			});
			expect(res.success).toBe(false);
		});

		it("falha se o repositório falhar ao salvar após resolução da crise", async () => {
			const { service, repository } = createSetup();
			const createRes = await service.createDomain({ tier: 1 });
			const id = createRes.success ? createRes.data.id : "";

			repository.save = async () => ({
				success: false,
				error: {
					code: "REGIONAL_DOMAIN_REPOSITORY_WRITE_FAILED",
					message: "Mocked failure",
				},
			});

			const res = await service.resolveCrisis({
				id,
				matrix: "physical",
				resolution: "negligence",
			});
			expect(res.success).toBe(false);
		});
	});

	describe("reallocateLevels", () => {
		it("realoca os níveis das matrizes cobrando o custo de revolução", async () => {
			const { service } = createSetup();
			const createRes = await service.createDomain({ tier: 2 });
			const id = createRes.success ? createRes.data.id : "";

			// Sobe physical para 2, mental para 1 (inicial)
			await service.upgradeMatrix({ id, matrix: "physical" });
			await service.upgradeMatrix({ id, matrix: "physical" });
			await service.upgradeMatrix({ id, matrix: "mental" });

			// Realoca para physical: 1, mental: 2, social: 0 (regra 5/3/1 ok)
			// Custo de Revolução Tier 2 (base 2500 PO)
			const res = await service.reallocateLevels({
				id,
				physical: 1,
				mental: 2,
				social: 0,
			});

			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.cost).toBe(2500);
				expect(res.data.domain.physicalLevel).toBe(1);
				expect(res.data.domain.mentalLevel).toBe(2);
				expect(res.data.domain.socialLevel).toBe(0);
			}
		});

		it("impede realocação se algum nível for maior que 5", async () => {
			const { service } = createSetup();
			const createRes = await service.createDomain({ tier: 1 });
			const id = createRes.success ? createRes.data.id : "";

			const res = await service.reallocateLevels({
				id,
				physical: 6,
				mental: 0,
				social: 0,
			});
			expect(res.success).toBe(false);
		});

		it("impede realocação se violar a regra 5/3/1", async () => {
			const { service } = createSetup();
			const createRes = await service.createDomain({ tier: 1 });
			const id = createRes.success ? createRes.data.id : "";

			const res = await service.reallocateLevels({
				id,
				physical: 4,
				mental: 4,
				social: 0,
			});
			expect(res.success).toBe(false);
		});

		it("retorna erro se o domínio não existir na realocação", async () => {
			const { service } = createSetup();
			const res = await service.reallocateLevels({
				id: "non-existent",
				physical: 1,
				mental: 1,
				social: 1,
			});
			expect(res.success).toBe(false);
		});

		it("falha se o repositório falhar ao salvar após realocação", async () => {
			const { service, repository } = createSetup();
			const createRes = await service.createDomain({ tier: 1 });
			const id = createRes.success ? createRes.data.id : "";

			repository.save = async () => ({
				success: false,
				error: {
					code: "REGIONAL_DOMAIN_REPOSITORY_WRITE_FAILED",
					message: "Mocked failure",
				},
			});

			const res = await service.reallocateLevels({
				id,
				physical: 1,
				mental: 1,
				social: 1,
			});
			expect(res.success).toBe(false);
		});
	});
});
