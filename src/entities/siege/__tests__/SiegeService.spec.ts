import { describe, expect, it } from "vitest";
import type { DiceService } from "$lib/shared/dice/domain/DiceService";
import { fail, ok } from "$lib/shared/lib/result";
import { SiegeService } from "../domain/SiegeService";
import { InMemorySiegeRepository } from "../infrastructure/InMemorySiegeRepository";

// Mock minimal para DiceService já que o serviço permite forçar valores para testes deterministicos
const fakeDiceService = {
	rollDie: () =>
		ok({
			naturalRoll: 10,
			sides: 20,
			isNaturalCritical: false,
			isNaturalFailure: false,
			auditEntry: {
				rollId: "roll-123",
				reason: "Test",
				sides: 20,
				naturalRoll: 10,
				createdAt: "2026-06-02T12:00:00Z",
			},
		}),
} as unknown as DiceService;

describe("SiegeService", () => {
	const campaignId = "campaign-1";
	const bastionId = "bastion-1";
	const factionId = "faction-1";
	const requestedAt = "2026-06-02T12:00:00Z";

	it("triggers a new siege event successfully and registers it in history", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);

		const result = await service.triggerSiege({
			campaignId,
			bastionId,
			factionId,
			dangerLevel: 3,
			requestedAt,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe("active");
			expect(result.data.dangerLevel).toBe(3);
			expect(result.data.damagePoints).toBe(0);
		}

		// Validar histórico
		const historyRes = await repo.listEventHistory(campaignId);
		expect(historyRes.success).toBe(true);
		if (historyRes.success) {
			expect(historyRes.data).toHaveLength(1);
			expect(historyRes.data[0]?.eventType).toBe("siege_start");
			expect(historyRes.data[0]?.description).toContain(
				"Fase Macro: O exército da Facção inimiga",
			);
		}
	});

	it("fails to trigger a siege if there is already an active siege for the campaign", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);

		await service.triggerSiege({
			campaignId,
			bastionId,
			factionId,
			dangerLevel: 3,
			requestedAt,
		});

		const secondResult = await service.triggerSiege({
			campaignId,
			bastionId,
			factionId,
			dangerLevel: 2,
			requestedAt,
		});

		expect(secondResult.success).toBe(false);
		if (!secondResult.success) {
			expect(secondResult.error.code).toBe("SIEGE_ALREADY_ACTIVE");
		}
	});

	it("resolves a round where the attack wins and damages the bastion", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);

		const triggerRes = await service.triggerSiege({
			campaignId,
			bastionId,
			factionId,
			dangerLevel: 2,
			requestedAt,
		});
		expect(triggerRes.success).toBe(true);
		const siegeId = triggerRes.success ? triggerRes.data.id : "";

		const roundResult = await service.resolveSiegeRound({
			siegeId,
			defenseRollBonus: 2,
			requestedAt,
			forcedAttackRoll: 15, // 15 + 2 dangerLevel = 17
			forcedDefenseRoll: 10, // 10 + 2 structure = 12
		});

		expect(roundResult.success).toBe(true);
		if (roundResult.success) {
			expect(roundResult.data.isResolved).toBe(false);
			expect(roundResult.data.damageToBastion).toBe(10); // (17 - 12) * 2 = 10
			expect(roundResult.data.logMessage).toContain(
				"As muralhas sofreram 10 de dano!",
			);
		}

		// Validar estado atualizado no banco
		const checkSiege = await repo.findById(siegeId);
		expect(checkSiege.success).toBe(true);
		if (checkSiege.success) {
			expect(checkSiege.data.status).toBe("active");
			expect(checkSiege.data.damagePoints).toBe(10);
		}
	});

	it("resolves a round where the defense wins by margin >= 5 and repels the siege", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);

		const triggerRes = await service.triggerSiege({
			campaignId,
			bastionId,
			factionId,
			dangerLevel: 2,
			requestedAt,
		});
		expect(triggerRes.success).toBe(true);
		const siegeId = triggerRes.success ? triggerRes.data.id : "";

		const roundResult = await service.resolveSiegeRound({
			siegeId,
			defenseRollBonus: 2,
			requestedAt,
			forcedAttackRoll: 5, // 5 + 2 danger = 7
			forcedDefenseRoll: 12, // 12 + 2 structure = 14 -> diferença de 7 (repelido)
		});

		expect(roundResult.success).toBe(true);
		if (roundResult.success) {
			expect(roundResult.data.isResolved).toBe(true);
			expect(roundResult.data.damageToBastion).toBe(0);
			expect(roundResult.data.logMessage).toContain("O cerco foi quebrado!");
		}

		// Validar estado resolvido no banco
		const checkSiege = await repo.findById(siegeId);
		expect(checkSiege.success).toBe(true);
		if (checkSiege.success) {
			expect(checkSiege.data.status).toBe("resolved");
		}
	});

	it("resolves a round where the defense wins by margin < 5 and the siege persists", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);

		const triggerRes = await service.triggerSiege({
			campaignId,
			bastionId,
			factionId,
			dangerLevel: 2,
			requestedAt,
		});
		expect(triggerRes.success).toBe(true);
		const siegeId = triggerRes.success ? triggerRes.data.id : "";

		const roundResult = await service.resolveSiegeRound({
			siegeId,
			defenseRollBonus: 2,
			requestedAt,
			forcedAttackRoll: 10, // 10 + 2 = 12
			forcedDefenseRoll: 11, // 11 + 2 = 13 -> diferença de 1 (continua)
		});

		expect(roundResult.success).toBe(true);
		if (roundResult.success) {
			expect(roundResult.data.isResolved).toBe(false);
			expect(roundResult.data.damageToBastion).toBe(0);
			expect(roundResult.data.logMessage).toContain(
				"O cerco persiste nas fronteiras.",
			);
		}
	});

	it("fails to resolve a round of a siege that is already resolved", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);

		const triggerRes = await service.triggerSiege({
			campaignId,
			bastionId,
			factionId,
			dangerLevel: 2,
			requestedAt,
		});
		expect(triggerRes.success).toBe(true);
		const siegeId = triggerRes.success ? triggerRes.data.id : "";

		// Quebrar cerco
		await service.resolveSiegeRound({
			siegeId,
			defenseRollBonus: 2,
			requestedAt,
			forcedAttackRoll: 5,
			forcedDefenseRoll: 15,
		});

		// Tentar resolver novamente
		const failResult = await service.resolveSiegeRound({
			siegeId,
			defenseRollBonus: 2,
			requestedAt,
		});

		expect(failResult.success).toBe(false);
		if (!failResult.success) {
			expect(failResult.error.code).toBe("NO_ACTIVE_SIEGE");
		}
	});

	it("integrates siege trigger and resolution at camp downtime", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);

		// Caso 1: Sem infâmia, acampamento tranquilo
		const campQuiet = await service.resolveSiegeAtCamp({
			campaignId,
			bastionId,
			infamyValue: -5,
			defenseRollBonus: 2,
			requestedAt,
		});
		expect(campQuiet.success).toBe(true);
		if (campQuiet.success) {
			expect(campQuiet.data.status).toBe("no_siege");
			expect(campQuiet.data.logMessage).toContain(
				"O acampamento transcorreu sem atividade inimiga.",
			);
		}

		// Caso 2: Infâmia extrema atrai cerco
		const campTrigger = await service.resolveSiegeAtCamp({
			campaignId,
			bastionId,
			infamyValue: -15, // <= -10 atrai cerco
			defenseRollBonus: 2,
			requestedAt,
		});
		expect(campTrigger.success).toBe(true);
		if (campTrigger.success) {
			expect(campTrigger.data.status).toBe("siege_started");
			expect(campTrigger.data.logMessage).toContain("atraiu um cerco inimigo!");
		}

		// Caso 3: Com cerco ativo, acampamento resolve rodada
		const campResolve = await service.resolveSiegeAtCamp({
			campaignId,
			bastionId,
			infamyValue: -15,
			defenseRollBonus: 2,
			requestedAt,
			forcedAttackRoll: 15, // 15 + 3 = 18
			forcedDefenseRoll: 10, // 10 + 2 = 12
		});
		expect(campResolve.success).toBe(true);
		if (campResolve.success) {
			expect(campResolve.data.status).toBe("siege_continues");
			expect(campResolve.data.damageToBastion).toBe(18); // (18 - 12) * 3 dangerLevel = 18
		}
	});

	it("fails resolveSiegeRound if the repository returns errors", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);

		const resolveFail = await service.resolveSiegeRound({
			siegeId: "non-existent-uuid",
			defenseRollBonus: 2,
			requestedAt,
		});
		expect(resolveFail.success).toBe(false);
		if (!resolveFail.success) {
			expect(resolveFail.error.code).toBe("REPOSITORY_ERROR");
		}
	});

	it("fails triggerSiege if findActiveSiege fails in repository", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);
		repo.findActiveSiege = async () =>
			fail({ code: "SIEGE_REPOSITORY_WRITE_FAILED", message: "Mocked error" });
		const res = await service.triggerSiege({
			campaignId,
			bastionId,
			factionId,
			dangerLevel: 3,
			requestedAt,
		});
		expect(res.success).toBe(false);
	});

	it("fails triggerSiege if saveSiegeEvent fails in repository", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);
		repo.saveSiegeEvent = async () =>
			fail({ code: "SIEGE_REPOSITORY_WRITE_FAILED", message: "Mocked error" });
		const res = await service.triggerSiege({
			campaignId,
			bastionId,
			factionId,
			dangerLevel: 3,
			requestedAt,
		});
		expect(res.success).toBe(false);
	});

	it("fails resolveSiegeRound if saveSiegeEvent fails in repository", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);
		const triggerRes = await service.triggerSiege({
			campaignId,
			bastionId,
			factionId,
			dangerLevel: 2,
			requestedAt,
		});
		expect(triggerRes.success).toBe(true);
		const siegeId = triggerRes.success ? triggerRes.data.id : "";

		repo.saveSiegeEvent = async () =>
			fail({ code: "SIEGE_REPOSITORY_WRITE_FAILED", message: "Mocked error" });
		const res = await service.resolveSiegeRound({
			siegeId,
			defenseRollBonus: 2,
			requestedAt,
			forcedAttackRoll: 10,
			forcedDefenseRoll: 10,
		});
		expect(res.success).toBe(false);
	});

	it("fails resolveSiegeAtCamp if findActiveSiege fails in repository", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);
		repo.findActiveSiege = async () =>
			fail({ code: "SIEGE_REPOSITORY_WRITE_FAILED", message: "Mocked error" });
		const res = await service.resolveSiegeAtCamp({
			campaignId,
			bastionId,
			infamyValue: -15,
			defenseRollBonus: 2,
			requestedAt,
		});
		expect(res.success).toBe(false);
	});

	it("fails resolveSiegeAtCamp if triggerSiege fails internally", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);
		repo.saveSiegeEvent = async () =>
			fail({ code: "SIEGE_REPOSITORY_WRITE_FAILED", message: "Mocked error" });
		const res = await service.resolveSiegeAtCamp({
			campaignId,
			bastionId,
			infamyValue: -15,
			defenseRollBonus: 2,
			requestedAt,
		});
		expect(res.success).toBe(false);
	});

	it("fails resolveSiegeAtCamp if resolveSiegeRound fails internally", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);
		await service.triggerSiege({
			campaignId,
			bastionId,
			factionId: "rival_faction",
			dangerLevel: 2,
			requestedAt,
		});
		repo.findById = async () =>
			fail({ code: "SIEGE_REPOSITORY_WRITE_FAILED", message: "Mocked error" });
		const res = await service.resolveSiegeAtCamp({
			campaignId,
			bastionId,
			infamyValue: -15,
			defenseRollBonus: 2,
			requestedAt,
		});
		expect(res.success).toBe(false);
	});

	it("resolves a round using real dice rolling (not forced)", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);

		const triggerRes = await service.triggerSiege({
			campaignId,
			bastionId,
			factionId,
			dangerLevel: 2,
			requestedAt,
		});
		expect(triggerRes.success).toBe(true);
		const siegeId = triggerRes.success ? triggerRes.data.id : "";

		const roundResult = await service.resolveSiegeRound({
			siegeId,
			defenseRollBonus: 2,
			requestedAt,
		});

		expect(roundResult.success).toBe(true);
		if (roundResult.success) {
			expect(roundResult.data.isResolved).toBe(false);
			expect(roundResult.data.damageToBastion).toBe(0);
			expect(roundResult.data.logMessage).toContain(
				"O cerco persiste nas fronteiras.",
			);
		}
	});

	it("fails resolveSiegeRound if attack dice roll fails", async () => {
		const repo = new InMemorySiegeRepository();
		const failDice = {
			rollDie: () => fail({ code: "DICE_ERROR", message: "Mocked dice error" }),
		} as unknown as DiceService;
		const service = new SiegeService(repo, failDice);

		const triggerRes = await service.triggerSiege({
			campaignId,
			bastionId,
			factionId,
			dangerLevel: 2,
			requestedAt,
		});
		expect(triggerRes.success).toBe(true);
		const siegeId = triggerRes.success ? triggerRes.data.id : "";

		const res = await service.resolveSiegeRound({
			siegeId,
			defenseRollBonus: 2,
			requestedAt,
		});
		expect(res.success).toBe(false);
	});

	it("fails resolveSiegeRound if defense dice roll fails", async () => {
		const repo = new InMemorySiegeRepository();
		let callCount = 0;
		const failDice = {
			rollDie: () => {
				callCount++;
				if (callCount === 2) {
					return fail({ code: "DICE_ERROR", message: "Mocked dice error" });
				}
				return ok({
					naturalRoll: 10,
					sides: 20,
					isNaturalCritical: false,
					isNaturalFailure: false,
					auditEntry: {
						rollId: "roll-123",
						reason: "Test",
						sides: 20,
						naturalRoll: 10,
						createdAt: "2026-06-02T12:00:00Z",
					},
				});
			},
		} as unknown as DiceService;
		const service = new SiegeService(repo, failDice);

		const triggerRes = await service.triggerSiege({
			campaignId,
			bastionId,
			factionId,
			dangerLevel: 2,
			requestedAt,
		});
		expect(triggerRes.success).toBe(true);
		const siegeId = triggerRes.success ? triggerRes.data.id : "";

		const res = await service.resolveSiegeRound({
			siegeId,
			defenseRollBonus: 2,
			requestedAt,
		});
		expect(res.success).toBe(false);
	});

	it("triggers a new siege event with a custom uuid", async () => {
		const repo = new InMemorySiegeRepository();
		const service = new SiegeService(repo, fakeDiceService);
		const customUuid = "123e4567-e89b-12d3-a456-426614174000";

		const result = await service.triggerSiege({
			campaignId,
			bastionId,
			factionId,
			dangerLevel: 3,
			requestedAt,
			uuid: customUuid,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.id).toBe(customUuid);
		}
	});
});
