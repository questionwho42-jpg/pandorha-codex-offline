import { describe, expect, it } from "vitest";
import { CountermagicService } from "../domain/CountermagicService";

describe("CountermagicService (TDD - Abjuracao e Interrupcao Arcana)", () => {
	const service = new CountermagicService();

	describe("resolveCountermagic", () => {
		it("deve anular automaticamente magias de circulo 3 ou inferior caso o abjurador tenha reacao", () => {
			const result = service.resolveCountermagic({
				abjuradorId: "abjurador-1",
				abjuradorLevel: 2,
				abjuradorMental: 3,
				abjuradorConflict: 1,
				hasReaction: true,
				spellCircle: 3,
				rollValue: 1, // Rolagem baixa nao importa no circulo inferior
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(true);
				expect(result.data.log).toContain("anulada automaticamente");
			}
		});

		it("deve falhar se o abjurador nao tiver reacao disponivel", () => {
			const result = service.resolveCountermagic({
				abjuradorId: "abjurador-1",
				abjuradorLevel: 2,
				abjuradorMental: 3,
				abjuradorConflict: 1,
				hasReaction: false,
				spellCircle: 3,
				rollValue: 10,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("INSUFFICIENT_REACTION");
			}
		});

		it("deve retornar erro se o circulo da magia for invalido", () => {
			const result = service.resolveCountermagic({
				abjuradorId: "abjurador-1",
				abjuradorLevel: 2,
				abjuradorMental: 3,
				abjuradorConflict: 1,
				hasReaction: true,
				spellCircle: -1,
				rollValue: 10,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("INVALID_COUNTER_INPUT");
			}
		});

		it("deve retornar erro se o circulo da magia for maior que 10", () => {
			const result = service.resolveCountermagic({
				abjuradorId: "abjurador-1",
				abjuradorLevel: 2,
				abjuradorMental: 3,
				abjuradorConflict: 1,
				hasReaction: true,
				spellCircle: 11,
				rollValue: 10,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("INVALID_COUNTER_INPUT");
			}
		});

		it("deve anular magias de circulo 4 ou superior se o total do teste superou a CD", () => {
			// CD: 10 + 4 = 14
			// Total: 5 (roll) + 2 (level) + 3 (mental) + 4 (conflict) = 14
			const result = service.resolveCountermagic({
				abjuradorId: "abjurador-1",
				abjuradorLevel: 2,
				abjuradorMental: 3,
				abjuradorConflict: 4,
				abjuradorItemBonus: 0,
				hasReaction: true,
				spellCircle: 4,
				rollValue: 5,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(true);
				expect(result.data.log).toContain("superou a CD");
			}
		});

		it("deve falhar na anulacao de magias de circulo 4 ou superior se o total do teste for inferior a CD", () => {
			// CD: 10 + 5 = 15
			// Total: 2 (roll) + 2 (level) + 3 (mental) + 2 (conflict) + 1 (item) = 10
			const result = service.resolveCountermagic({
				abjuradorId: "abjurador-1",
				abjuradorLevel: 2,
				abjuradorMental: 3,
				abjuradorConflict: 2,
				abjuradorItemBonus: 1,
				hasReaction: true,
				spellCircle: 5,
				rollValue: 2,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(false);
				expect(result.data.log).toContain("nao atingiu a CD");
			}
		});

		it("deve usar 0 como bonus de item caso nao seja fornecido", () => {
			// CD: 10 + 4 = 14
			// Total: 8 (roll) + 2 (level) + 3 (mental) + 0 (conflict) = 13 (sem bonus de item)
			const result = service.resolveCountermagic({
				abjuradorId: "abjurador-1",
				abjuradorLevel: 2,
				abjuradorMental: 3,
				abjuradorConflict: 0,
				hasReaction: true,
				spellCircle: 4,
				rollValue: 8,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(false);
				expect(result.data.log).toContain("nao atingiu a CD");
			}
		});
	});

	describe("calculateMagicDamage", () => {
		it("deve reduzir dano pela metade caso tenha resistencia", () => {
			const damage = service.calculateMagicDamage({
				baseDamage: 10,
				hasResistance: true,
				hasVulnerability: false,
			});
			expect(damage).toBe(5);
		});

		it("deve dobrar o dano caso tenha vulnerabilidade", () => {
			const damage = service.calculateMagicDamage({
				baseDamage: 10,
				hasResistance: false,
				hasVulnerability: true,
			});
			expect(damage).toBe(20);
		});

		it("deve manter o dano base caso tenha resistencia e vulnerabilidade (anulacao mutua)", () => {
			const damage = service.calculateMagicDamage({
				baseDamage: 10,
				hasResistance: true,
				hasVulnerability: true,
			});
			expect(damage).toBe(10);
		});

		it("deve manter o dano base se nao possuir nenhuma modificacao", () => {
			const damage = service.calculateMagicDamage({
				baseDamage: 10,
				hasResistance: false,
				hasVulnerability: false,
			});
			expect(damage).toBe(10);
		});
	});

	describe("resolveReflectMagic", () => {
		it("deve refletir magia se passou na salvaguarda e houver alvos disponiveis", () => {
			const reflect = service.resolveReflectMagic({
				savingThrowPassed: true,
				spellDamage: 12,
				availableTargets: ["target-1", "target-2"],
				randomValue: 0.7, // Sorteia o segundo alvo (target-2) pois 0.7 * 2 = 1.4 -> Floor = 1
			});

			expect(reflect.reflected).toBe(true);
			expect(reflect.targetId).toBe("target-2");
			expect(reflect.reflectedDamage).toBe(12);
		});

		it("nao deve refletir magia se falhou na salvaguarda", () => {
			const reflect = service.resolveReflectMagic({
				savingThrowPassed: false,
				spellDamage: 12,
				availableTargets: ["target-1"],
				randomValue: 0.1,
			});

			expect(reflect.reflected).toBe(false);
		});

		it("nao deve refletir magia se nao houver alvos disponiveis", () => {
			const reflect = service.resolveReflectMagic({
				savingThrowPassed: true,
				spellDamage: 12,
				availableTargets: [],
				randomValue: 0.1,
			});

			expect(reflect.reflected).toBe(false);
		});
	});
});
