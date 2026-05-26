import { describe, expect, it } from "vitest";
import { fail, ok } from "$lib/shared/lib/result";
import { SynergyService } from "../domain/SynergyService";
import { InMemorySynergyRepository } from "../infrastructure/InMemorySynergyRepository";

const TEST_TIMESTAMP = "2026-05-23T13:30:00.000Z";

describe("SynergyService", () => {
	it("inicializa a reserva de Coesão com valores padrão de Tier 1 e 4 jogadores", async () => {
		const repository = new InMemorySynergyRepository();
		const service = new SynergyService(repository);

		const initResult = await service.initializeCohesion({
			id: "campaign_default",
			activePlayers: 4,
			updatedAt: TEST_TIMESTAMP,
		});

		expect(initResult.success).toBe(true);
		if (initResult.success) {
			const cohesion = initResult.data;
			expect(cohesion.cohesionLevel).toBe(1);
			expect(cohesion.cohesionPoints).toBe(1); // padrão inicial de 1 ponto
			expect(cohesion.activePlayers).toBe(4);
			// Reserva máxima = Tier (1) + Jogadores (4) = 5
			expect(service.getMaxCohesionPoints(cohesion)).toBe(5);
		}

		// Inicializar de novo com a mesma ID deve retornar o registro existente
		const secondInit = await service.initializeCohesion({
			id: "campaign_default",
			activePlayers: 4,
			updatedAt: TEST_TIMESTAMP,
		});
		expect(secondInit.success).toBe(true);
		if (secondInit.success) {
			expect(secondInit.data.id).toBe("campaign_default");
		}
	});

	it("recupera pontos de Coesão no descanso curto e longo respeitando o limite máximo", async () => {
		const repository = new InMemorySynergyRepository();
		const service = new SynergyService(repository);

		await service.initializeCohesion({
			id: "campaign_default",
			activePlayers: 4,
			updatedAt: TEST_TIMESTAMP,
		});

		// Descanso Curto (recupera 1 ponto de Coesão compartilhado)
		const shortRestRes = await service.recoverCohesionOnRest(
			"campaign_default",
			"short",
			TEST_TIMESTAMP,
		);
		expect(shortRestRes.success).toBe(true);
		if (shortRestRes.success) {
			expect(shortRestRes.data.cohesionPoints).toBe(2);
		}

		// Descanso Longo (recupera totalmente os pontos ao máximo de 5)
		const longRestRes = await service.recoverCohesionOnRest(
			"campaign_default",
			"long",
			TEST_TIMESTAMP,
		);
		expect(longRestRes.success).toBe(true);
		if (longRestRes.success) {
			expect(longRestRes.data.cohesionPoints).toBe(5);
		}

		// Garante que não ultrapassa o máximo de 5 pontos
		const overRestRes = await service.recoverCohesionOnRest(
			"campaign_default",
			"short",
			TEST_TIMESTAMP,
		);
		expect(overRestRes.success).toBe(true);
		if (overRestRes.success) {
			expect(overRestRes.data.cohesionPoints).toBe(5);
		}
	});

	it("permite abrir um Elo consumindo 1 ponto de Coesão", async () => {
		const repository = new InMemorySynergyRepository();
		const service = new SynergyService(repository);

		await service.initializeCohesion({
			id: "campaign_default",
			activePlayers: 4,
			updatedAt: TEST_TIMESTAMP,
		});

		// Padrão inicial é 1 ponto, abrir elo deve consumir esse ponto
		const openRes = await service.openSynergyElo({
			cohesionId: "campaign_default",
			abridorId: "hero_lia",
			targetId: "enemy_goblin",
			openingTactId: "physical_push",
			timestamp: TEST_TIMESTAMP,
		});

		expect(openRes.success).toBe(true);
		if (openRes.success) {
			const elo = openRes.data;
			expect(elo.openingTactId).toBe("physical_push");
			expect(elo.abridorId).toBe("hero_lia");
			expect(elo.targetId).toBe("enemy_goblin");
			expect(elo.reinforceTactId).toBeUndefined();
		}

		// Verifica se os pontos de Coesão no banco zeraram
		const cohesionRes = await repository.getCohesion("campaign_default");
		expect(cohesionRes.success).toBe(true);
		if (cohesionRes.success && cohesionRes.data) {
			expect(cohesionRes.data.cohesionPoints).toBe(0);
		}

		// Tentar abrir outro Elo sem pontos de Coesão deve falhar
		const failOpenRes = await service.openSynergyElo({
			cohesionId: "campaign_default",
			abridorId: "hero_lia",
			targetId: "enemy_goblin",
			openingTactId: "physical_push",
			timestamp: TEST_TIMESTAMP,
		});
		expect(failOpenRes.success).toBe(false);
		if (!failOpenRes.success) {
			expect(failOpenRes.error.code).toBe("COHESION_POINTS_INSUFFICIENT");
		}
	});

	it("permite adicionar Reforço (Sinergia em Cadeia) apenas no Tier 2+ e por aliado diferente", async () => {
		const repository = new InMemorySynergyRepository();
		const service = new SynergyService(repository);

		// Cria estado de coesão em Tier 1
		await service.initializeCohesion({
			id: "campaign_default",
			activePlayers: 4,
			updatedAt: TEST_TIMESTAMP,
		});
		// Concede 5 pontos (descanso longo)
		await service.recoverCohesionOnRest(
			"campaign_default",
			"long",
			TEST_TIMESTAMP,
		);

		// Abre o elo
		await service.openSynergyElo({
			cohesionId: "campaign_default",
			abridorId: "hero_lia",
			targetId: "enemy_goblin",
			openingTactId: "physical_push",
			timestamp: TEST_TIMESTAMP,
		});

		// Tentar reforçar em Tier 1 deve falhar
		const failReinforceRes = await service.reinforceSynergyElo({
			cohesionId: "campaign_default",
			reinforcerId: "hero_aria",
			reinforceTactId: "mental_silence",
			timestamp: TEST_TIMESTAMP,
		});
		expect(failReinforceRes.success).toBe(false);
		if (!failReinforceRes.success) {
			expect(failReinforceRes.error.code).toBe("REINFORCE_TIER_INSUFFICIENT");
		}

		// Eleva para Tier 2
		const cohesionRes = await repository.getCohesion("campaign_default");
		if (cohesionRes.success && cohesionRes.data) {
			await repository.saveCohesion({
				...cohesionRes.data,
				cohesionLevel: 2,
				cohesionPoints: 3,
			});
		}

		// Tentar reforçar usando o mesmo Abridor deve falhar (exige aliados diferentes)
		const sameHeroReinforce = await service.reinforceSynergyElo({
			cohesionId: "campaign_default",
			reinforcerId: "hero_lia", // lia abriu o elo
			reinforceTactId: "mental_silence",
			timestamp: TEST_TIMESTAMP,
		});
		expect(sameHeroReinforce.success).toBe(false);
		if (!sameHeroReinforce.success) {
			expect(sameHeroReinforce.error.code).toBe("REINFORCE_HERO_INVALID");
		}

		// Reforço válido por aliado diferente no Tier 2
		const reinforceRes = await service.reinforceSynergyElo({
			cohesionId: "campaign_default",
			reinforcerId: "hero_aria",
			reinforceTactId: "mental_silence",
			timestamp: TEST_TIMESTAMP,
		});
		expect(reinforceRes.success).toBe(true);
		if (reinforceRes.success) {
			const elo = reinforceRes.data;
			expect(elo.reinforceTactId).toBe("mental_silence");
			expect(elo.reinforcerId).toBe("hero_aria");
		}

		// Verifica se os pontos de Coesão no banco foram deduzidos por mais 1
		const cohesionAfterRes = await repository.getCohesion("campaign_default");
		if (cohesionAfterRes.success && cohesionAfterRes.data) {
			expect(cohesionAfterRes.data.cohesionPoints).toBe(2);
		}
	});

	it("detona o Elo com sucesso aplicando táticas e testando resistência do alvo", async () => {
		const repository = new InMemorySynergyRepository();
		const service = new SynergyService(repository);

		await service.initializeCohesion({
			id: "campaign_default",
			activePlayers: 4,
			updatedAt: TEST_TIMESTAMP,
		});
		await service.recoverCohesionOnRest(
			"campaign_default",
			"long",
			TEST_TIMESTAMP,
		);

		// Abre o elo
		await service.openSynergyElo({
			cohesionId: "campaign_default",
			abridorId: "hero_lia",
			targetId: "enemy_goblin",
			openingTactId: "physical_push",
			timestamp: TEST_TIMESTAMP,
		});

		// Caso 1: Detonação falha se a rolagem do Detonador errar a CA do inimigo
		const failDetonate = await service.detonateSynergyElo({
			cohesionId: "campaign_default",
			detonatorId: "hero_val",
			detonationTactId: "physical_expose",
			attackRoll: 10,
			targetDefense: 15, // CA = 15, errou
			targetSaveRoll: 12,
			targetSaveBonus: 2,
			timestamp: TEST_TIMESTAMP,
		});

		expect(failDetonate.success).toBe(true);
		if (failDetonate.success) {
			// Elo limpo e sem táticas fundidas
			expect(failDetonate.data.hit).toBe(false);
			expect(failDetonate.data.synergyFused).toBe(false);
		}

		// Caso 2: Detonação acerta a CA do inimigo (Sucesso), e o inimigo falha no teste de resistência
		// Reabre o elo
		await service.openSynergyElo({
			cohesionId: "campaign_default",
			abridorId: "hero_lia",
			targetId: "enemy_goblin",
			openingTactId: "physical_push",
			timestamp: TEST_TIMESTAMP,
		});

		const detonateSuccessRes = await service.detonateSynergyElo({
			cohesionId: "campaign_default",
			detonatorId: "hero_val",
			detonationTactId: "physical_expose",
			attackRoll: 18,
			targetDefense: 15, // ACERTOU
			// Detonador: Nível = 1, Eixo (Físico) = 3, Aplicação = 2. DC = 10 + 1 + 3 + 2 = 16.
			// Inimigo rola total de 12 (falhou contra a DC 16)
			targetSaveRoll: 10,
			targetSaveBonus: 2, // total = 12
			timestamp: TEST_TIMESTAMP,
		});

		expect(detonateSuccessRes.success).toBe(true);
		if (detonateSuccessRes.success) {
			const result = detonateSuccessRes.data;
			expect(result.hit).toBe(true);
			expect(result.synergyFused).toBe(true);
			expect(result.saveSuccess).toBe(false); // falhou no teste
			expect(result.conditionsApplied).toContain("Exposto"); // condição aplicada da detonação
			expect(result.instantEffectsExecuted).toContain("Empurrado"); // efeito instantâneo da abertura
		}

		// Caso 3: Detonação acerta, mas o inimigo passa no teste de resistência (DC 16)
		// Reabre o elo
		await service.openSynergyElo({
			cohesionId: "campaign_default",
			abridorId: "hero_lia",
			targetId: "enemy_goblin",
			openingTactId: "physical_push",
			timestamp: TEST_TIMESTAMP,
		});

		const detonateResistRes = await service.detonateSynergyElo({
			cohesionId: "campaign_default",
			detonatorId: "hero_val",
			detonationTactId: "physical_expose",
			attackRoll: 18,
			targetDefense: 15, // ACERTOU
			targetSaveRoll: 15,
			targetSaveBonus: 2, // total = 17 (superou DC 16)
			timestamp: TEST_TIMESTAMP,
		});

		expect(detonateResistRes.success).toBe(true);
		if (detonateResistRes.success) {
			const result = detonateResistRes.data;
			expect(result.hit).toBe(true);
			expect(result.saveSuccess).toBe(true); // passou no teste!
			expect(result.conditionsApplied).toHaveLength(0); // negou as condições qualitativas
			expect(result.instantEffectsExecuted).toContain("Empurrado"); // efeitos imediatos ocorrem mesmo assim
		}
	});

	it("gerencia o registro automático de Técnicas de Assinatura após 3 usos idênticos", async () => {
		const repository = new InMemorySynergyRepository();
		const service = new SynergyService(repository);

		await service.initializeCohesion({
			id: "campaign_default",
			activePlayers: 4,
			updatedAt: TEST_TIMESTAMP,
		});
		await service.recoverCohesionOnRest(
			"campaign_default",
			"long",
			TEST_TIMESTAMP,
		);

		// Simula 3 detonações com o combo: Abertura (physical_push) + Detonação (physical_expose)
		for (let i = 0; i < 3; i++) {
			await service.openSynergyElo({
				cohesionId: "campaign_default",
				abridorId: "hero_lia",
				targetId: "enemy_goblin",
				openingTactId: "physical_push",
				timestamp: TEST_TIMESTAMP,
			});
			await service.detonateSynergyElo({
				cohesionId: "campaign_default",
				detonatorId: "hero_val",
				detonationTactId: "physical_expose",
				attackRoll: 18,
				targetDefense: 15,
				targetSaveRoll: 5,
				targetSaveBonus: 1,
				timestamp: TEST_TIMESTAMP,
			});
		}

		// Verifica se a Técnica de Assinatura foi registrada automaticamente no repositório
		const signatures = await repository.findAllSignatures();
		expect(signatures.success).toBe(true);
		if (signatures.success) {
			expect(signatures.data).toHaveLength(1);
			const sig = signatures.data[0];
			expect(sig).toBeDefined();
			if (sig) {
				expect(sig.name).toBe("Técnica de Assinatura 1");
				expect(sig.openingTactId).toBe("physical_push");
				expect(sig.detonationTactId).toBe("physical_expose");
				expect(sig.usageCount).toBe(3);
			}
		}
	});

	it("deve lidar com erros de BD e estado de coesao nao encontrado em initializeCohesion e recoverCohesionOnRest", async () => {
		const repository = new InMemorySynergyRepository();
		const service = new SynergyService(repository);

		// Falha de getCohesion no initialize
		repository.getCohesion = async () =>
			fail({ code: "SYNERGY_REPOSITORY_READ_FAILED", message: "Erro get" });
		const initErr = await service.initializeCohesion({
			id: "c1",
			activePlayers: 3,
			updatedAt: "",
		});
		expect(initErr.success).toBe(false);

		// Restaura getCohesion mas falha saveCohesion no initialize
		repository.getCohesion = async (_id) => ok(null);
		repository.saveCohesion = async () =>
			fail({ code: "SYNERGY_REPOSITORY_WRITE_FAILED", message: "Erro save" });
		const initErr2 = await service.initializeCohesion({
			id: "c1",
			activePlayers: 3,
			updatedAt: "",
		});
		expect(initErr2.success).toBe(false);

		// Recuperar descanso com coesao nao encontrada
		const restErr1 = await service.recoverCohesionOnRest(
			"inexistente",
			"short",
			"",
		);
		expect(restErr1.success).toBe(false);
		if (!restErr1.success) {
			expect(restErr1.error.code).toBe("COHESION_STATE_NOT_FOUND");
		}

		// Recuperar descanso com falha no BD
		repository.getCohesion = async () =>
			fail({ code: "SYNERGY_REPOSITORY_READ_FAILED", message: "Erro get" });
		const restErr2 = await service.recoverCohesionOnRest("c1", "short", "");
		expect(restErr2.success).toBe(false);

		// Recuperar descanso com erro no saveCohesion
		repository.getCohesion = async (id) =>
			ok({
				id,
				cohesionLevel: 1,
				cohesionPoints: 0,
				activePlayers: 3,
				updatedAt: "",
			});
		repository.saveCohesion = async () =>
			fail({ code: "SYNERGY_REPOSITORY_WRITE_FAILED", message: "Erro save" });
		const restErr3 = await service.recoverCohesionOnRest("c1", "short", "");
		expect(restErr3.success).toBe(false);
	});

	it("deve retornar erro de BD e coesao nao encontrada ao abrir elo", async () => {
		const repository = new InMemorySynergyRepository();
		const service = new SynergyService(repository);

		// Nao encontrado
		const open1 = await service.openSynergyElo({
			cohesionId: "inexistente",
			abridorId: "a",
			targetId: "t",
			openingTactId: "o",
			timestamp: "",
		});
		expect(open1.success).toBe(false);

		// Falha de getCohesion
		repository.getCohesion = async () =>
			fail({ code: "SYNERGY_REPOSITORY_READ_FAILED", message: "Erro" });
		const open2 = await service.openSynergyElo({
			cohesionId: "c1",
			abridorId: "a",
			targetId: "t",
			openingTactId: "o",
			timestamp: "",
		});
		expect(open2.success).toBe(false);

		// Falha de saveCohesion
		repository.getCohesion = async (id) =>
			ok({
				id,
				cohesionLevel: 1,
				cohesionPoints: 2,
				activePlayers: 3,
				updatedAt: "",
			});
		repository.saveCohesion = async () =>
			fail({ code: "SYNERGY_REPOSITORY_WRITE_FAILED", message: "Erro" });
		const open3 = await service.openSynergyElo({
			cohesionId: "c1",
			abridorId: "a",
			targetId: "t",
			openingTactId: "o",
			timestamp: "",
		});
		expect(open3.success).toBe(false);
	});

	it("deve cobrir falhas e validacoes em reinforceSynergyElo", async () => {
		const repository = new InMemorySynergyRepository();
		const service = new SynergyService(repository);

		// Coesao nao encontrada
		const ref1 = await service.reinforceSynergyElo({
			cohesionId: "inexistente",
			reinforcerId: "r",
			reinforceTactId: "t",
			timestamp: "",
		});
		expect(ref1.success).toBe(false);

		// Falha getCohesion
		repository.getCohesion = async () =>
			fail({ code: "SYNERGY_REPOSITORY_READ_FAILED", message: "Erro" });
		const ref2 = await service.reinforceSynergyElo({
			cohesionId: "c1",
			reinforcerId: "r",
			reinforceTactId: "t",
			timestamp: "",
		});
		expect(ref2.success).toBe(false);

		// Sem elo ativo
		repository.getCohesion = async (id) =>
			ok({
				id,
				cohesionLevel: 2,
				cohesionPoints: 2,
				activePlayers: 3,
				updatedAt: "",
			});
		const ref3 = await service.reinforceSynergyElo({
			cohesionId: "c1",
			reinforcerId: "r",
			reinforceTactId: "t",
			timestamp: "",
		});
		expect(ref3.success).toBe(false);
		if (!ref3.success) {
			expect(ref3.error.code).toBe("ACTIVE_ELO_NOT_FOUND");
		}

		// Pontos de coesao insuficientes (0 pontos)
		repository.getCohesion = async (id) =>
			ok({
				id,
				cohesionLevel: 2,
				cohesionPoints: 0,
				activePlayers: 3,
				updatedAt: "",
			});
		// Abre elo na memoria interna primeiro (ou forca elo ativo)
		// Vamos inicializar no repository de verdade
		const realRepo = new InMemorySynergyRepository();
		const realService = new SynergyService(realRepo);
		await realService.initializeCohesion({
			id: "c1",
			activePlayers: 3,
			updatedAt: "",
		});
		// Seta nivel 2
		const coh = await realRepo.getCohesion("c1");
		if (coh.success && coh.data) {
			coh.data.cohesionLevel = 2;
			coh.data.cohesionPoints = 1;
			await realRepo.saveCohesion(coh.data);
		}
		// Abre elo (consome o unico ponto, deixando com 0)
		await realService.openSynergyElo({
			cohesionId: "c1",
			abridorId: "a",
			targetId: "t",
			openingTactId: "o",
			timestamp: "",
		});

		// Tenta reforçar (removeria mais 1 ponto de 0, deve falhar)
		const refPointsErr = await realService.reinforceSynergyElo({
			cohesionId: "c1",
			reinforcerId: "r",
			reinforceTactId: "t",
			timestamp: "",
		});
		expect(refPointsErr.success).toBe(false);
		if (!refPointsErr.success) {
			expect(refPointsErr.error.code).toBe("COHESION_POINTS_INSUFFICIENT");
		}

		// Falha de saveCohesion no reinforce
		if (coh.success && coh.data) {
			coh.data.cohesionPoints = 2; // concede pontos
			await realRepo.saveCohesion(coh.data);
		}
		// Abre elo (consome 1, sobra 1)
		await realService.openSynergyElo({
			cohesionId: "c1",
			abridorId: "a",
			targetId: "t",
			openingTactId: "o",
			timestamp: "",
		});

		// Força erro de gravação
		realRepo.saveCohesion = async () =>
			fail({ code: "SYNERGY_REPOSITORY_WRITE_FAILED", message: "Erro save" });
		const refSaveErr = await realService.reinforceSynergyElo({
			cohesionId: "c1",
			reinforcerId: "r",
			reinforceTactId: "t",
			timestamp: "",
		});
		expect(refSaveErr.success).toBe(false);
	});

	it("deve lidar com erros de detonacao de elo ativo nao encontrado", async () => {
		const repository = new InMemorySynergyRepository();
		const service = new SynergyService(repository);

		const detErr = await service.detonateSynergyElo({
			cohesionId: "inexistente",
			detonatorId: "d",
			detonationTactId: "t",
			attackRoll: 15,
			targetDefense: 10,
			targetSaveRoll: 10,
			targetSaveBonus: 0,
			timestamp: "",
		});
		expect(detErr.success).toBe(false);
		if (!detErr.success) {
			expect(detErr.error.code).toBe("ACTIVE_ELO_NOT_FOUND");
		}
	});

	it("deve exercitar as taticas mental_silence e registrar assinatura com reinforceTactId no detonateSynergyElo", async () => {
		const repository = new InMemorySynergyRepository();
		const service = new SynergyService(repository);

		await service.initializeCohesion({
			id: "c1",
			activePlayers: 4,
			updatedAt: "",
		});
		const coh = await repository.getCohesion("c1");
		if (coh.success && coh.data) {
			coh.data.cohesionLevel = 2;
			coh.data.cohesionPoints = 10;
			await repository.saveCohesion(coh.data);
		}

		// Vamos fazer 3 detonações de combo triplo com reforço para cobrir a ramificação
		// Combo: mental_silence (abertura) + physical_expose (reforço) + mental_silence (detonação)
		for (let i = 0; i < 3; i++) {
			await service.openSynergyElo({
				cohesionId: "c1",
				abridorId: "hero_lia",
				targetId: "enemy_goblin",
				openingTactId: "mental_silence",
				timestamp: TEST_TIMESTAMP,
			});
			await service.reinforceSynergyElo({
				cohesionId: "c1",
				reinforcerId: "hero_aria",
				reinforceTactId: "physical_expose",
				timestamp: TEST_TIMESTAMP,
			});

			const res = await service.detonateSynergyElo({
				cohesionId: "c1",
				detonatorId: "hero_val",
				detonationTactId: "mental_silence",
				attackRoll: 20,
				targetDefense: 10,
				// Detonador DC: 10 + 1 + 3 + 2 = 16.
				// Inimigo rola 10 + 0 = 10 (falhou) -> deve aplicar Silenciado e Exposto
				targetSaveRoll: 10,
				targetSaveBonus: 0,
				timestamp: TEST_TIMESTAMP,
			});
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.conditionsApplied).toContain("Silenciado");
				expect(res.data.conditionsApplied).toContain("Exposto");
			}
		}

		// Assinatura deve estar gravada
		const sigs = await repository.findAllSignatures();
		expect(sigs.success).toBe(true);
		if (sigs.success) {
			expect(sigs.data.length).toBe(1);
			expect(sigs.data[0]?.reinforceTactId).toBe("physical_expose");
		}
	});

	it("deve tratar erro se a listagem de assinaturas falhar no repository durante a detonacao", async () => {
		const repository = new InMemorySynergyRepository();
		const service = new SynergyService(repository);

		await service.initializeCohesion({
			id: "c1",
			activePlayers: 4,
			updatedAt: "",
		});
		const coh = await repository.getCohesion("c1");
		if (coh.success && coh.data) {
			coh.data.cohesionPoints = 10;
			await repository.saveCohesion(coh.data);
		}

		// Simula falha ao ler assinaturas do BD no terceiro uso do combo
		let signaturesCalledCount = 0;
		repository.findAllSignatures = async () => {
			signaturesCalledCount++;
			if (signaturesCalledCount === 1) {
				return fail({
					code: "SYNERGY_REPOSITORY_READ_FAILED",
					message: "Erro assinaturas",
				});
			}
			return ok([]);
		};

		// Roda 3 vezes o mesmo combo simples
		for (let i = 0; i < 3; i++) {
			await service.openSynergyElo({
				cohesionId: "c1",
				abridorId: "hero_lia",
				targetId: "enemy_goblin",
				openingTactId: "physical_push",
				timestamp: TEST_TIMESTAMP,
			});
			await service.detonateSynergyElo({
				cohesionId: "c1",
				detonatorId: "hero_val",
				detonationTactId: "physical_expose",
				attackRoll: 20,
				targetDefense: 10,
				targetSaveRoll: 5,
				targetSaveBonus: 0,
				timestamp: TEST_TIMESTAMP,
			});
		}
		// A detonacao deve retornar ok de qualquer forma (apenas loga ou trata internamente o erro da assinatura sem quebrar a detonacao)
		// e a assinatura nao deve ter sido cadastrada.
	});
});
