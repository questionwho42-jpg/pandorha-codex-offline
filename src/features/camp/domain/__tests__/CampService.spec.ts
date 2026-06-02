import { beforeEach, describe, expect, it } from "vitest";
import type { DiceService } from "$lib/shared/dice/domain/DiceService";
import { fail, ok } from "$lib/shared/lib/result";
import { InMemoryCampRepository } from "../../../../entities/camp/infrastructure/InMemoryCampRepository";
import { CampService } from "../CampService";
import {
	AbrigoTermicoDecorator,
	BanqueteDecorator,
	StandardRecovery,
} from "../recoveryDecorators";

describe("CampService", () => {
	let repository: InMemoryCampRepository;
	let service: CampService;

	beforeEach(() => {
		repository = new InMemoryCampRepository();
		service = new CampService(repository);
	});

	it("should create a camp session and persist it in the repository", async () => {
		const result = await service.createSession("camp-1", {
			totalTime: 12,
			sleepHours: 8,
		});
		expect(result.success).toBe(true);
		if (result.success) {
			const session = result.data;
			expect(session.id).toBe("camp-1");
			expect(session.totalTime).toBe(12);
			expect(session.sleepHours).toBe(8);
			expect(session.availableActions).toBe(4); // 12 - 8
			expect(session.dangerCounter).toBe(0);

			const found = await repository.findById("camp-1");
			expect(found.success).toBe(true);
		}
	});

	it("should fallback to 8 sleep hours if not specified", async () => {
		const result = await service.createSession("camp-2", { totalTime: 10 });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.sleepHours).toBe(8);
			expect(result.data.availableActions).toBe(2);
		}
	});

	it("should support custom sleep hours for non-human ancestries", async () => {
		const result = await service.createSession("camp-3", {
			totalTime: 12,
			sleepHours: 4,
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.availableActions).toBe(8); // 12 - 4
		}
	});

	it("should toggle fire correctly adding/removing +3 danger and active fire activity", async () => {
		const createRes = await service.createSession("camp-fire", {
			totalTime: 10,
		});
		expect(createRes.success).toBe(true);

		// Ativa Fogueira
		const activeRes = await service.toggleFogueira("camp-fire", true);
		expect(activeRes.success).toBe(true);
		if (activeRes.success) {
			expect(activeRes.data.dangerCounter).toBe(3);
			const activities = JSON.parse(activeRes.data.activeActivitiesJson);
			expect(activities.some((act: any) => act.id === "fogueira_ativa")).toBe(
				true,
			);
		}

		// Ativar novamente não duplica
		const activeRes2 = await service.toggleFogueira("camp-fire", true);
		expect(activeRes2.success).toBe(true);
		if (activeRes2.success) {
			expect(activeRes2.data.dangerCounter).toBe(3);
			const activities = JSON.parse(activeRes2.data.activeActivitiesJson);
			expect(
				activities.filter((act: any) => act.id === "fogueira_ativa").length,
			).toBe(1);
		}

		// Desativa Fogueira
		const deactiveRes = await service.toggleFogueira("camp-fire", false);
		expect(deactiveRes.success).toBe(true);
		if (deactiveRes.success) {
			expect(deactiveRes.data.dangerCounter).toBe(0);
			const activities = JSON.parse(deactiveRes.data.activeActivitiesJson);
			expect(activities.some((act: any) => act.id === "fogueira_ativa")).toBe(
				false,
			);
		}

		// Desativar novamente não quebra
		const deactiveRes2 = await service.toggleFogueira("camp-fire", false);
		expect(deactiveRes2.success).toBe(true);
		if (deactiveRes2.success) {
			expect(deactiveRes2.data.dangerCounter).toBe(0);
		}
	});

	it("should return failure when toggling fire in a missing session", async () => {
		const res = await service.toggleFogueira("missing-session", true);
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("CAMP_SESSION_NOT_FOUND");
		}
	});

	it("should fail to execute activity in a missing session", async () => {
		const res = await service.executeActivity(
			"missing",
			{
				id: "cacar",
				name: "Caçar",
				performerId: "char1",
				matrix: "Physical",
				difficulty: 12,
			},
			2,
			10,
		);
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("CAMP_SESSION_NOT_FOUND");
		}
	});

	it("should fail when availableActions is 0", async () => {
		await service.createSession("camp-limit", { totalTime: 8, sleepHours: 8 }); // 0 ações
		const res = await service.executeActivity(
			"camp-limit",
			{
				id: "cacar",
				name: "Caçar",
				performerId: "char1",
				matrix: "Physical",
				difficulty: 12,
			},
			2,
			10,
		);
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("CAMP_REPOSITORY_WRITE_FAILED");
		}
	});

	it("should process normal activity success (+1 danger) and failure (+3 danger)", async () => {
		await service.createSession("camp-act", { totalTime: 12, sleepHours: 8 }); // 4 ações

		// Sucesso: 12 (rolagem) + 2 (mod) >= 12 (diff). Deve gastar 1 ação, somar +1 perigo
		const act1 = await service.executeActivity(
			"camp-act",
			{
				id: "cacar",
				name: "Caçar",
				performerId: "char1",
				matrix: "Physical",
				difficulty: 12,
			},
			2,
			10,
		);
		expect(act1.success).toBe(true);
		if (act1.success) {
			expect(act1.data.success).toBe(true);
			expect(act1.data.dangerAdded).toBe(1);
			expect(act1.data.session.dangerCounter).toBe(1);
			expect(act1.data.session.availableActions).toBe(3);
		}

		// Falha: 5 (rolagem) + 2 (mod) < 12 (diff). Deve gastar 1 ação, somar +3 perigo (total 4)
		const act2 = await service.executeActivity(
			"camp-act",
			{
				id: "cacar",
				name: "Caçar",
				performerId: "char1",
				matrix: "Physical",
				difficulty: 12,
			},
			2,
			5,
		);
		expect(act2.success).toBe(true);
		if (act2.success) {
			expect(act2.data.success).toBe(false);
			expect(act2.data.dangerAdded).toBe(3);
			expect(act2.data.session.dangerCounter).toBe(4);
			expect(act2.data.session.availableActions).toBe(2);
		}
	});

	it("should reduce danger by 2 when Vigília Ativa is successful", async () => {
		await service.createSession("camp-vigilia", {
			totalTime: 12,
			sleepHours: 8,
		});

		// Forçamos o perigo para 5
		const mockSessionRes = await repository.findById("camp-vigilia");
		expect(mockSessionRes.success).toBe(true);
		if (mockSessionRes.success) {
			const s = mockSessionRes.data;
			s.dangerCounter = 5;
			await repository.save(s);
		}

		// Vigília Ativa com Sucesso: 10 + 2 >= 10.
		// Adiciona +1 perigo da hora de atividade e remove -2 por vigília bem-sucedida.
		// Custo final: 5 + 1 - 2 = 4
		const act = await service.executeActivity(
			"camp-vigilia",
			{
				id: "vigilia_ativa",
				name: "Vigília Ativa",
				performerId: "char1",
				matrix: "Physical",
				difficulty: 10,
			},
			2,
			10,
		);
		expect(act.success).toBe(true);
		if (act.success) {
			expect(act.data.success).toBe(true);
			expect(act.data.session.dangerCounter).toBe(4);
		}
	});

	it("should handle collective effort clocks correctly on success and failure", async () => {
		await service.createSession("camp-clock", { totalTime: 12, sleepHours: 8 });

		// Sucesso: 10 + 2 >= 10. Incrementa relógio para 1/3.
		// Esforço coletivo de sucesso adiciona +1 perigo.
		const act1 = await service.executeActivity(
			"camp-clock",
			{
				id: "fortificar_perimetro",
				name: "Fortificar Perímetro",
				performerId: "char1",
				matrix: "Physical",
				difficulty: 10,
			},
			2,
			10,
			true,
			3,
		);
		expect(act1.success).toBe(true);
		if (act1.success) {
			expect(act1.data.success).toBe(true);
			expect(act1.data.dangerAdded).toBe(1);
			expect(act1.data.clockProgress).toEqual({
				current: 1,
				max: 3,
				completed: false,
			});
		}

		// Falha: 5 + 2 < 10. Não incrementa relógio (mantém 1/3).
		// Esforço coletivo falho adiciona +2 perigo.
		const act2 = await service.executeActivity(
			"camp-clock",
			{
				id: "fortificar_perimetro",
				name: "Fortificar Perímetro",
				performerId: "char1",
				matrix: "Physical",
				difficulty: 10,
			},
			2,
			5,
			true,
			3,
		);
		expect(act2.success).toBe(true);
		if (act2.success) {
			expect(act2.data.success).toBe(false);
			expect(act2.data.dangerAdded).toBe(2);
			expect(act2.data.clockProgress).toEqual({
				current: 1,
				max: 3,
				completed: false,
			});
		}

		// Sucesso (total 2/3)
		await service.executeActivity(
			"camp-clock",
			{
				id: "fortificar_perimetro",
				name: "Fortificar Perímetro",
				performerId: "char1",
				matrix: "Physical",
				difficulty: 10,
			},
			2,
			10,
			true,
			3,
		);

		// Sucesso (total 3/3 -> Concluído). Deve remover o relógio do array.
		const actFinal = await service.executeActivity(
			"camp-clock",
			{
				id: "fortificar_perimetro",
				name: "Fortificar Perímetro",
				performerId: "char1",
				matrix: "Physical",
				difficulty: 10,
			},
			2,
			10,
			true,
			3,
		);
		expect(actFinal.success).toBe(true);
		if (actFinal.success) {
			expect(actFinal.data.clockProgress).toEqual({
				current: 3,
				max: 3,
				completed: true,
			});
			const activities = JSON.parse(actFinal.data.session.activeActivitiesJson);
			expect(
				activities.some((act: any) =>
					act.id.startsWith("relogio:fortificar_perimetro"),
				),
			).toBe(false);
		}
	});

	it("should process rollEncounter triggering events and resetting danger", async () => {
		await service.createSession("camp-enc", { totalTime: 12, sleepHours: 8 });

		// Forçamos o perigo para 12
		const mockSessionRes = await repository.findById("camp-enc");
		expect(mockSessionRes.success).toBe(true);
		if (mockSessionRes.success) {
			const s = mockSessionRes.data;
			s.dangerCounter = 12;
			await repository.save(s);
		}

		// Rolagem d20 = 10 (menor ou igual a 12). Deve disparar o encontro 10 e resetar o perigo para 0.
		const encRes1 = await service.rollEncounter("camp-enc", 10);
		expect(encRes1.success).toBe(true);
		if (encRes1.success) {
			expect(encRes1.data.eventTriggered).toBe(true);
			expect(encRes1.data.eventNumber).toBe(10);
			expect(encRes1.data.eventDescription).toContain("Mercador Ambulante");
			expect(encRes1.data.session.dangerCounter).toBe(0);
		}

		// Rolagem d20 = 15 (maior que 0). Não dispara.
		const encRes2 = await service.rollEncounter("camp-enc", 15);
		expect(encRes2.success).toBe(true);
		if (encRes2.success) {
			expect(encRes2.data.eventTriggered).toBe(false);
			expect(encRes2.data.session.dangerCounter).toBe(0);
		}
	});

	it("should map default event description if out of d20 range", async () => {
		await service.createSession("camp-out", { totalTime: 12, sleepHours: 8 });
		const mockSessionRes = await repository.findById("camp-out");
		expect(mockSessionRes.success).toBe(true);
		if (mockSessionRes.success) {
			const s = mockSessionRes.data;
			s.dangerCounter = 100;
			await repository.save(s);
		}

		const encRes = await service.rollEncounter("camp-out", 99);
		expect(encRes.success).toBe(true);
		if (encRes.success) {
			expect(encRes.data.eventDescription).toBe(
				"Evento desconhecido nas sombras do ermo.",
			);
		}
	});

	it("should fail rollEncounter in a missing session", async () => {
		const res = await service.rollEncounter("missing", 10);
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("CAMP_SESSION_NOT_FOUND");
		}
	});

	it("should fail rollEncounter if save failure occurs", async () => {
		await service.createSession("camp-fail", { totalTime: 12, sleepHours: 8 });
		repository.save = async () =>
			fail({ code: "CAMP_REPOSITORY_WRITE_FAILED", message: "Erro" });

		const res = await service.rollEncounter("camp-fail", 10);
		expect(res.success).toBe(false);
	});

	it("should fail executeActivity if save failure occurs", async () => {
		await service.createSession("camp-fail2", { totalTime: 12, sleepHours: 8 });
		repository.save = async () =>
			fail({ code: "CAMP_REPOSITORY_WRITE_FAILED", message: "Erro" });

		const res = await service.executeActivity(
			"camp-fail2",
			{
				id: "cacar",
				name: "Caçar",
				performerId: "char1",
				matrix: "Physical",
				difficulty: 10,
			},
			2,
			10,
		);
		expect(res.success).toBe(false);
	});
});

describe("Camp Recovery Decorators", () => {
	it("should apply simple recovery without decorators", () => {
		const recovery = new StandardRecovery();
		expect(recovery.calculate(100)).toBe(100);
	});

	it("should apply banquet bonus (+25%)", () => {
		const recovery = new BanqueteDecorator(new StandardRecovery());
		expect(recovery.calculate(100)).toBe(125);
	});

	it("should combine banquet and thermal shelter bonuses", () => {
		const recovery = new AbrigoTermicoDecorator(
			new BanqueteDecorator(new StandardRecovery()),
		);
		expect(recovery.calculate(100)).toBe(130);
	});

	it("should respect decorator order (effect onion)", () => {
		const recovery = new BanqueteDecorator(
			new AbrigoTermicoDecorator(new StandardRecovery()),
		);
		expect(recovery.calculate(100)).toBe(131.25);
	});
});

import { SiegeService } from "../../../../entities/siege/domain/SiegeService";
import { InMemorySiegeRepository } from "../../../../entities/siege/infrastructure/InMemorySiegeRepository";

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

describe("CampService Siege Integration", () => {
	let repository: InMemoryCampRepository;
	let siegeRepo: InMemorySiegeRepository;
	let siegeService: SiegeService;

	beforeEach(() => {
		repository = new InMemoryCampRepository();
		siegeRepo = new InMemorySiegeRepository();
		siegeService = new SiegeService(siegeRepo, fakeDiceService);
	});

	it("should fail if siegeService is not injected in CampService", async () => {
		const serviceWithoutSiege = new CampService(repository);
		const result = await serviceWithoutSiege.processSiegeAtCampStart({
			sessionId: "camp-1",
			campaignId: "camp-1",
			bastionId: "bastion-1",
			infamyValue: 0,
			defenseRollBonus: 0,
			requestedAt: "2026-06-02T12:00:00Z",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("CAMP_REPOSITORY_WRITE_FAILED");
			expect(result.error.message).toContain("Serviço de cerco não injetado");
		}
	});

	it("should successfully process siege at camp start and apply +5 danger penalty if siege starts", async () => {
		const serviceWithSiege = new CampService(repository, siegeService);

		// Criar sessão de acampamento inicial
		await serviceWithSiege.createSession("camp-siege-test", { totalTime: 12 });

		// Infâmia extrema atrai cerco. Deve iniciar um cerco e somar +5 de perigo ao acampamento.
		const result = await serviceWithSiege.processSiegeAtCampStart({
			sessionId: "camp-siege-test",
			campaignId: "campaign-test",
			bastionId: "bastion-test",
			infamyValue: -15, // <= -10 atrai cerco
			defenseRollBonus: 2,
			requestedAt: "2026-06-02T12:00:00Z",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe("siege_started");
		}

		// Validar que o dangerCounter da sessão de acampamento foi incrementado em +5
		const sessionRes = await repository.findById("camp-siege-test");
		expect(sessionRes.success).toBe(true);
		if (sessionRes.success) {
			expect(sessionRes.data.dangerCounter).toBe(5);
		}
	});

	it("should return failure if resolveSiegeAtCamp returns an error", async () => {
		const serviceWithSiege = new CampService(repository, siegeService);
		siegeService.resolveSiegeAtCamp = async () =>
			fail({
				code: "SIEGE_RESOLUTION_FAILED",
				message: "Mocked siege failure",
			});

		const result = await serviceWithSiege.processSiegeAtCampStart({
			sessionId: "camp-siege-test",
			campaignId: "campaign-test",
			bastionId: "bastion-test",
			infamyValue: -15,
			defenseRollBonus: 2,
			requestedAt: "2026-06-02T12:00:00Z",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("CAMP_REPOSITORY_WRITE_FAILED");
			expect(result.error.message).toContain("Erro ao processar cerco");
		}
	});

	it("should handle failure of camp repository findById during siege perigo penalty", async () => {
		const serviceWithSiege = new CampService(repository, siegeService);
		await serviceWithSiege.createSession("camp-siege-test", { totalTime: 12 });

		repository.findById = async () =>
			fail({
				code: "CAMP_SESSION_NOT_FOUND",
				message: "Mocked db failure",
			});

		const result = await serviceWithSiege.processSiegeAtCampStart({
			sessionId: "camp-siege-test",
			campaignId: "campaign-test",
			bastionId: "bastion-test",
			infamyValue: -15,
			defenseRollBonus: 2,
			requestedAt: "2026-06-02T12:00:00Z",
		});

		// A falha ao ler a sessão de acampamento para aplicar perigo não impede o processamento com sucesso
		expect(result.success).toBe(true);
	});

	it("should not apply +5 danger penalty if siege does not start or continue", async () => {
		const serviceWithSiege = new CampService(repository, siegeService);
		await serviceWithSiege.createSession("camp-siege-test-no-penalty", {
			totalTime: 12,
		});

		// Sem infâmia, status "no_siege". Não deve aplicar perigo.
		const result = await serviceWithSiege.processSiegeAtCampStart({
			sessionId: "camp-siege-test-no-penalty",
			campaignId: "campaign-test",
			bastionId: "bastion-test",
			infamyValue: 0,
			defenseRollBonus: 2,
			requestedAt: "2026-06-02T12:00:00Z",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe("no_siege");
		}

		const sessionRes = await repository.findById("camp-siege-test-no-penalty");
		expect(sessionRes.success).toBe(true);
		if (sessionRes.success) {
			expect(sessionRes.data.dangerCounter).toBe(0); // Permanece 0
		}
	});
});
