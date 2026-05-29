import { describe, expect, it } from "vitest";
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
});
