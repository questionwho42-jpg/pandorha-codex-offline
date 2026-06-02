import { describe, expect, it } from "vitest";
import { StealthCombatService } from "../domain/StealthCombatService";

describe("StealthCombatService (TDD - Infiltracao, Furtividade e Relogio de Tensao)", () => {
	const service = new StealthCombatService();

	describe("Relogio de Tensao (Tension Clock)", () => {
		it("deve inicializar o relogio de tensao com o maximo de segmentos baseado na vigilancia", () => {
			const clock0 = service.initTensionClock(0);
			expect(clock0.maxSegments).toBe(12);
			expect(clock0.filledSegments).toBe(0);
			expect(clock0.alarmTriggered).toBe(false);

			const clock1 = service.initTensionClock(1);
			expect(clock1.maxSegments).toBe(10);

			const clock2 = service.initTensionClock(2);
			expect(clock2.maxSegments).toBe(8);

			const clock3 = service.initTensionClock(3);
			expect(clock3.maxSegments).toBe(6);
		});

		it("deve adicionar fatias de tensao e disparar o alarme se atingir o maximo", () => {
			const state = service.initTensionClock(2); // max 8
			const next1 = service.addTensionSegments(state, 3);
			expect(next1.filledSegments).toBe(3);
			expect(next1.alarmTriggered).toBe(false);

			const next2 = service.addTensionSegments(next1, 5);
			expect(next2.filledSegments).toBe(8);
			expect(next2.alarmTriggered).toBe(true);

			// Nao deve passar do limite
			const next3 = service.addTensionSegments(next2, 2);
			expect(next3.filledSegments).toBe(8);
			expect(next3.alarmTriggered).toBe(true);
		});
	});

	describe("checkGuardVision", () => {
		it("deve falhar se a percepcao passiva for negativa", () => {
			const res = service.checkGuardVision({
				position: "flank",
				stealthRoll: 10,
				stealthModifier: 2,
				guardPassivePerception: -1,
			});
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("INVALID_STEALTH_INPUT");
			}
		});

		it("deve passar automaticamente no ponto cego", () => {
			const res = service.checkGuardVision({
				position: "blind_spot",
				stealthRoll: 1,
				stealthModifier: 0,
				guardPassivePerception: 20,
			});
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.detected).toBe(false);
				expect(res.data.tensionSegmentsAdded).toBe(0);
			}
		});

		it("deve gerenciar cone frontal (deteccao automatica vs desvios)", () => {
			// Deteccao automatica sem recursos
			const resNormal = service.checkGuardVision({
				position: "frontal_cone",
				stealthRoll: 20,
				stealthModifier: 10,
				guardPassivePerception: 10,
			});
			expect(resNormal.success).toBe(true);
			if (resNormal.success) {
				expect(resNormal.data.detected).toBe(true);
				expect(resNormal.data.tensionSegmentsAdded).toBe(2);
			}

			// Sobreviver com sombras
			const resShadows = service.checkGuardVision({
				position: "frontal_cone",
				stealthRoll: 5,
				stealthModifier: 0,
				guardPassivePerception: 15,
				useShadows: true,
			});
			expect(resShadows.success).toBe(true);
			if (resShadows.success) {
				expect(resShadows.data.detected).toBe(false);
				expect(resShadows.data.tensionSegmentsAdded).toBe(0);
			}

			// Sobreviver com deslizamento furtivo
			const resSlide = service.checkGuardVision({
				position: "frontal_cone",
				stealthRoll: 1,
				stealthModifier: 0,
				guardPassivePerception: 15,
				useStealthySlide: true,
			});
			expect(resSlide.success).toBe(true);
			if (resSlide.success) {
				expect(resSlide.data.detected).toBe(false);
				expect(resSlide.data.tensionSegmentsAdded).toBe(0);
			}
		});

		it("deve gerenciar flancos (visao periferica) com rolagens de dados", () => {
			// Sucesso
			const resSuccess = service.checkGuardVision({
				position: "flank",
				stealthRoll: 12,
				stealthModifier: 3, // total 15
				guardPassivePerception: 15,
			});
			expect(resSuccess.success).toBe(true);
			if (resSuccess.success) {
				expect(resSuccess.data.detected).toBe(false);
				expect(resSuccess.data.tensionSegmentsAdded).toBe(0);
			}

			// Falha
			const resFail = service.checkGuardVision({
				position: "flank",
				stealthRoll: 8,
				stealthModifier: 3, // total 11
				guardPassivePerception: 15,
			});
			expect(resFail.success).toBe(true);
			if (resFail.success) {
				expect(resFail.data.detected).toBe(true);
				expect(resFail.data.tensionSegmentsAdded).toBe(2);
			}
		});
	});

	describe("resolveTakedown", () => {
		it("deve retornar erro se o alvo ja estiver morto/nocauteado", () => {
			const res = service.resolveTakedown({
				type: "strike",
				rollValue: 10,
				modifier: 2,
				targetLevel: 2,
				casterLevel: 2,
				isElite: false,
				targetHp: 0,
				targetMaxHp: 10,
			});
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("INVALID_STEALTH_INPUT");
			}
		});

		it("deve resolver Golpe Ligeiro (strike) silencioso ou barulhento", () => {
			// Fatal -> Silencioso
			const resFatal = service.resolveTakedown({
				type: "strike",
				rollValue: 5,
				modifier: 5, // total 10 -> critico 20 de dano
				targetLevel: 2,
				casterLevel: 2,
				isElite: false,
				targetHp: 15,
				targetMaxHp: 15,
			});
			expect(resFatal.success).toBe(true);
			if (resFatal.success) {
				expect(resFatal.data.success).toBe(true);
				expect(resFatal.data.targetNewHp).toBe(0);
				expect(resFatal.data.tensionSegmentsAdded).toBe(0);
			}

			// Nao fatal -> Barulho + Inicia combate
			const resNoFatal = service.resolveTakedown({
				type: "strike",
				rollValue: 2,
				modifier: 3, // total 5 -> critico 10 de dano
				targetLevel: 2,
				casterLevel: 2,
				isElite: false,
				targetHp: 20,
				targetMaxHp: 20,
			});
			expect(resNoFatal.success).toBe(true);
			if (resNoFatal.success) {
				expect(resNoFatal.data.success).toBe(false);
				expect(resNoFatal.data.targetNewHp).toBe(10);
				expect(resNoFatal.data.tensionSegmentsAdded).toBe(2);
			}
		});

		it("deve resolver Submissao (submission) com regra de ouro e falha", () => {
			// Sucesso total (DC = 10 + 2*2 = 14)
			const resTotal = service.resolveTakedown({
				type: "submission",
				rollValue: 12,
				modifier: 3, // total 15 vs DC 14
				targetLevel: 2,
				casterLevel: 2,
				isElite: false,
				targetHp: 10,
				targetMaxHp: 10,
			});
			expect(resTotal.success).toBe(true);
			if (resTotal.success) {
				expect(resTotal.data.success).toBe(true);
				expect(resTotal.data.targetNewHp).toBe(0);
				expect(resTotal.data.tensionSegmentsAdded).toBe(0);
			}

			// Regra de Ouro (Falha por <= 4) -> total 11 vs DC 14
			const resGold = service.resolveTakedown({
				type: "submission",
				rollValue: 8,
				modifier: 3,
				targetLevel: 2,
				casterLevel: 2,
				isElite: false,
				targetHp: 10,
				targetMaxHp: 10,
			});
			expect(resGold.success).toBe(true);
			if (resGold.success) {
				expect(resGold.data.success).toBe(true);
				expect(resGold.data.targetNewHp).toBe(0);
				expect(resGold.data.tensionSegmentsAdded).toBe(1); // barulho
			}

			// Falha total (Falha por > 4) -> total 8 vs DC 14
			const resFail = service.resolveTakedown({
				type: "submission",
				rollValue: 5,
				modifier: 3,
				targetLevel: 2,
				casterLevel: 2,
				isElite: false,
				targetHp: 10,
				targetMaxHp: 10,
			});
			expect(resFail.success).toBe(true);
			if (resFail.success) {
				expect(resFail.data.success).toBe(false);
				expect(resFail.data.targetNewHp).toBe(10);
				expect(resFail.data.tensionSegmentsAdded).toBe(2);
			}
		});

		it("deve resolver Execucao Tatica contra alvo normal e elite", () => {
			// Nivel menor impede execucao
			const resLevelErr = service.resolveTakedown({
				type: "tactical_execution",
				rollValue: 10,
				modifier: 0,
				targetLevel: 5,
				casterLevel: 3,
				isElite: false,
				targetHp: 30,
				targetMaxHp: 30,
			});
			expect(resLevelErr.success).toBe(false);
			if (!resLevelErr.success) {
				expect(resLevelErr.error.code).toBe("STEALTH_ACTION_FAILED");
			}

			// Alvo normal -> morte automatica silenciosa
			const resNormal = service.resolveTakedown({
				type: "tactical_execution",
				rollValue: 10,
				modifier: 0,
				targetLevel: 3,
				casterLevel: 3,
				isElite: false,
				targetHp: 30,
				targetMaxHp: 30,
			});
			expect(resNormal.success).toBe(true);
			if (resNormal.success) {
				expect(resNormal.data.success).toBe(true);
				expect(resNormal.data.targetNewHp).toBe(0);
				expect(resNormal.data.vigorCost).toBe(2);
				expect(resNormal.data.tensionSegmentsAdded).toBe(0);
			}

			// Alvo Elite -> 30% dano e Sangramento
			const resElite = service.resolveTakedown({
				type: "tactical_execution",
				rollValue: 10,
				modifier: 0,
				targetLevel: 3,
				casterLevel: 3,
				isElite: true,
				targetHp: 100,
				targetMaxHp: 100,
			});
			expect(resElite.success).toBe(true);
			if (resElite.success) {
				expect(resElite.data.success).toBe(true);
				expect(resElite.data.targetNewHp).toBe(70);
				expect(resElite.data.applyBleeding).toBe(true);
				expect(resElite.data.vigorCost).toBe(2);
				expect(resElite.data.tensionSegmentsAdded).toBe(0);
			}
		});

		it("deve retornar falha se o tipo de abate for invalido", () => {
			const res = service.resolveTakedown({
				type: "invalid" as any,
				rollValue: 10,
				modifier: 0,
				targetLevel: 2,
				casterLevel: 2,
				isElite: false,
				targetHp: 10,
				targetMaxHp: 10,
			});
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("INVALID_STEALTH_INPUT");
			}
		});
	});

	describe("Evidence Cleanup", () => {
		it("deve limpar com sucesso se passar no teste", () => {
			const res = service.resolveEvidenceCleanup({
				rollValue: 12,
				modifier: 3, // total 15
				dc: 15,
			});
			expect(res.success).toBe(true);
			expect(res.segmentsAdded).toBe(0);
		});

		it("deve limpar com custo (regra de ouro) se falhar por <= 4", () => {
			const res = service.resolveEvidenceCleanup({
				rollValue: 8,
				modifier: 3, // total 11 vs DC 15
				dc: 15,
			});
			expect(res.success).toBe(true);
			expect(res.segmentsAdded).toBe(1);
		});

		it("deve falhar completamente se errar por > 4", () => {
			const res = service.resolveEvidenceCleanup({
				rollValue: 5,
				modifier: 3, // total 8 vs DC 15
				dc: 15,
			});
			expect(res.success).toBe(false);
			expect(res.segmentsAdded).toBe(2);
		});
	});

	describe("Lockpicking (Fechaduras)", () => {
		it("deve remover PR no sucesso", () => {
			const res = service.resolveLockpicking({
				rollValue: 10,
				modifier: 5, // total 15
				dc: 15,
				currentPr: 3,
			});
			expect(res.prRemoved).toBe(1);
			expect(res.segmentsAdded).toBe(0);
		});

		it("deve remover PR com barulho na regra de ouro", () => {
			const res = service.resolveLockpicking({
				rollValue: 8,
				modifier: 3, // total 11 vs DC 15
				dc: 15,
				currentPr: 3,
			});
			expect(res.prRemoved).toBe(1);
			expect(res.segmentsAdded).toBe(1);
		});

		it("deve falhar sem barulho nem remoção na falha total", () => {
			const res = service.resolveLockpicking({
				rollValue: 5,
				modifier: 3, // total 8 vs DC 15
				dc: 15,
				currentPr: 3,
			});
			expect(res.prRemoved).toBe(0);
			expect(res.segmentsAdded).toBe(0);
		});
	});

	describe("Visual Dodge (Desvio emergencial)", () => {
		it("deve desviar com sucesso", () => {
			const res = service.resolveVisualDodge({
				rollValue: 10,
				modifier: 5, // total 15 vs 15
				perception: 15,
			});
			expect(res.success).toBe(true);
			expect(res.segmentsAdded).toBe(0);
		});

		it("deve falhar e ser detectado", () => {
			const res = service.resolveVisualDodge({
				rollValue: 5,
				modifier: 5, // total 10 vs 15
				perception: 15,
			});
			expect(res.success).toBe(false);
			expect(res.segmentsAdded).toBe(2);
		});
	});

	describe("Poleiro Climb", () => {
		it("deve alcancar poleiro com sucesso", () => {
			const res = service.resolvePoleiroClimb({
				rollValue: 10,
				modifier: 5,
				dc: 15,
			});
			expect(res.success).toBe(true);
			expect(res.isHanging).toBe(false);
			expect(res.segmentsAdded).toBe(0);
		});

		it("deve ficar pendurado na regra de ouro", () => {
			const res = service.resolvePoleiroClimb({
				rollValue: 8,
				modifier: 3,
				dc: 15,
			});
			expect(res.success).toBe(true);
			expect(res.isHanging).toBe(true);
			expect(res.vigorCost).toBe(1);
			expect(res.segmentsAdded).toBe(0);
		});

		it("deve cair e fazer barulho na falha total", () => {
			const res = service.resolvePoleiroClimb({
				rollValue: 5,
				modifier: 3,
				dc: 15,
			});
			expect(res.success).toBe(false);
			expect(res.isHanging).toBe(false);
			expect(res.segmentsAdded).toBe(2);
		});
	});
});
