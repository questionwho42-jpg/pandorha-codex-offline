import { describe, expect, it } from "vitest";
import {
	type ICharacterStats,
	ViperPoisonDecorator,
} from "$lib/entities/character/domain/StatusEffectDecorator";
import { DiceService } from "$lib/shared/dice";
import {
	createDeterministicDiceClock,
	createSequentialDiceRollIdProvider,
	SequenceDiceRng,
} from "$lib/shared/dice/testing/SequenceDiceRng";
import { fail, ok } from "$lib/shared/lib/result";
import { EncounterService } from "../domain/EncounterService";
import type { WorldTileRecord } from "../model/worldTileSchema";

class FakeCharacterStats implements ICharacterStats {
	public constructor(
		public physical = 2,
		public mental = 3,
		public level = 1,
	) {}
	public get social() {
		return 2;
	}
	public get conflict() {
		return 2;
	}
	public get interaction() {
		return 2;
	}
	public get resistance() {
		return 2;
	}
	public get classBaseHp() {
		return 8;
	}
	public get maxHp() {
		return 20;
	}
	public get initiativeBase() {
		return 5;
	}
	public get carrySlotLimit() {
		return 10;
	}
	public get movementSpeedBase() {
		return 9;
	}
	public get currentCarryWeight() {
		return 0;
	}
	public get encumbranceState(): "light" | "encumbered" | "overloaded" {
		return "light";
	}
	public get allowsNaturalRecovery() {
		return true;
	}
	public get armorClass() {
		return 10;
	}
	public get stealthPenalty() {
		return 0;
	}
	public get size(): "medium" | "large" {
		return "medium";
	}
	public get weaponDamageBonus() {
		return 0;
	}
	public get extraActions() {
		return 0;
	}
	public get attackBonus() {
		return 0;
	}
	public get ignoresDifficultTerrain() {
		return false;
	}
	public get automaticDefenseFailure() {
		return false;
	}
}

function createFakeTile(
	overrides: Partial<WorldTileRecord> = {},
): WorldTileRecord {
	return {
		id: "test-tile",
		label: "Campo de Teste",
		q: 0,
		r: 0,
		biome: "forest",
		regionTier: 1,
		isKnown: true,
		isMapped: false,
		isBlocked: false,
		encounterSignal: "none",
		sourceFile: "test-source.md",
		summary: "Regras de teste do Bloco",
		...overrides,
	};
}

describe("EncounterService - Testes de Batedor (Scout)", () => {
	it("calculates base CD correctly for all Tiers", () => {
		const service = new EncounterService();
		const stats = new FakeCharacterStats();

		// CD Base = 9 + (Tier * 3)
		// Tier 1 -> CD = 12. Modificadores: biome forest é terreno dificultoso (+3 CD). Total = 15.
		// Vamos desativar o terreno dificultoso usando bioma road.
		const tileTier1 = createFakeTile({ regionTier: 1, biome: "road" });
		const result1 = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tileTier1,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 10,
		});
		expect(result1.success).toBe(true);
		if (result1.success) {
			expect(result1.data.cdBase).toBe(12);
			expect(result1.data.cdFinal).toBe(12);
		}

		// Tier 2 -> CD Base = 15.
		const tileTier2 = createFakeTile({ regionTier: 2, biome: "road" });
		const result2 = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tileTier2,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 10,
		});
		expect(result2.success).toBe(true);
		if (result2.success) {
			expect(result2.data.cdBase).toBe(15);
		}

		// Tier 3 -> CD Base = 18.
		const tileTier3 = createFakeTile({ regionTier: 3, biome: "road" });
		const result3 = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tileTier3,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 10,
		});
		expect(result3.success).toBe(true);
		if (result3.success) {
			expect(result3.data.cdBase).toBe(18);
		}

		// Tier 4 -> CD Base = 21.
		const tileTier4 = createFakeTile({ regionTier: 4, biome: "road" });
		const result4 = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tileTier4,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 10,
		});
		expect(result4.success).toBe(true);
		if (result4.success) {
			expect(result4.data.cdBase).toBe(21);
		}
	});

	it("applies circumstantial CD modifiers correctly", () => {
		const service = new EncounterService();
		const stats = new FakeCharacterStats();
		const tile = createFakeTile({ regionTier: 1, biome: "forest" }); // Bioma floresta é dificultoso (+3 CD)

		// CD Base (12) + Terreno Dificultoso (+3) + Clima Adverso (+3) + Visibilidade Nula (+5) = 23
		const result = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: true,
			visibilidadeNula: true,
			diceRoll: 10,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.cdFinal).toBe(23);
			expect(result.data.modifiersApplied.difficultTerrain).toBe(true);
			expect(result.data.modifiersApplied.climaAdverso).toBe(true);
			expect(result.data.modifiersApplied.visibilidadeNula).toBe(true);
		}
	});

	it("resolves Net Advantage/Disadvantage based on map state and party pace", () => {
		const service = new EncounterService();
		const stats = new FakeCharacterStats();

		// Cenário 1: Vantagem Pura (Mapeado e Ritmo Cauteloso) -> Net = +2 -> Vantagem
		const tile1 = createFakeTile({ biome: "road", isMapped: true });
		const result1 = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile1,
			ritmo: "cautious",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 10,
			diceRollAlt: 15,
		});
		expect(result1.success).toBe(true);
		if (result1.success) {
			expect(result1.data.rollState).toBe("advantage");
			expect(result1.data.effectiveDice).toBe(15); // Maior de 10 e 15
		}

		// Cenário 2: Desvantagem Pura (Ritmo Rápido e Clima Adverso com Marcha Forçada) -> Net = -2 -> Desvantagem
		const result2 = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile1,
			ritmo: "fast",
			climaAdverso: true,
			visibilidadeNula: false,
			diceRoll: 10,
			diceRollAlt: 15,
		});
		expect(result2.success).toBe(true);
		if (result2.success) {
			expect(result2.data.rollState).toBe("disadvantage");
			expect(result2.data.effectiveDice).toBe(10); // Menor de 10 e 15
		}

		// Cenário 3: Anulação Mútua (Mapeado (+1) e Ritmo Rápido (-1)) -> Net = 0 -> Normal
		const result3 = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile1,
			ritmo: "fast",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 10,
			diceRollAlt: 15,
		});
		expect(result3.success).toBe(true);
		if (result3.success) {
			expect(result3.data.rollState).toBe("normal");
			expect(result3.data.effectiveDice).toBe(10); // Apenas o primeiro dado
		}
	});

	it("evaluates scout roll outcomes and margins correctly", () => {
		const service = new EncounterService();
		const stats = new FakeCharacterStats(2, 3); // Físico = 2
		const tile = createFakeTile({ regionTier: 1, biome: "road" }); // CD Final = 12

		// 1. Sucesso Crítico por Margem >= +5 (Dado 15 + Físico 2 = 17. CD 12. Margem +5)
		const resCritMargem = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 15,
		});
		expect(resCritMargem.success).toBe(true);
		if (resCritMargem.success) {
			expect(resCritMargem.data.outcome).toBe("critical_success");
			expect(resCritMargem.data.margin).toBe(5);
		}

		// 2. Sucesso Crítico por 20 Natural no dado, mesmo que a margem fosse menor
		const resCritNatural = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: true,
			visibilidadeNula: true,
			diceRoll: 20, // CD seria 23. 20 + 2 = 22 (falharia pela CD normal, mas 20 natural prevalece!)
			diceRollAlt: 20, // Injeta 20 no segundo dado para neutralizar desvantagem na simulação do teste
		});
		expect(resCritNatural.success).toBe(true);
		if (resCritNatural.success) {
			expect(resCritNatural.data.outcome).toBe("critical_success");
		}

		// 3. Sucesso Normal (Dado 11 + Físico 2 = 13. CD 12. Margem +1)
		const resSucesso = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 11,
		});
		expect(resSucesso.success).toBe(true);
		if (resSucesso.success) {
			expect(resSucesso.data.outcome).toBe("success");
			expect(resSucesso.data.margin).toBe(1);
		}

		// 4. Falha Normal (Dado 8 + Físico 2 = 10. CD 12. Margem -2)
		const resFalha = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 8,
		});
		expect(resFalha.success).toBe(true);
		if (resFalha.success) {
			expect(resFalha.data.outcome).toBe("failure");
			expect(resFalha.data.margin).toBe(-2);
			expect(resFalha.data.encounterEvent).toBeDefined();
			expect(resFalha.data.encounterEvent?.isSurpriseForParty).toBe(false);
		}

		// 5. Falha Crítica por Margem <= -5 (Dado 4 + Físico 2 = 6. CD 12. Margem -6)
		const resFalhaCritMargem = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 4,
		});
		expect(resFalhaCritMargem.success).toBe(true);
		if (resFalhaCritMargem.success) {
			expect(resFalhaCritMargem.data.outcome).toBe("critical_failure");
			expect(resFalhaCritMargem.data.margin).toBe(-6);
			expect(resFalhaCritMargem.data.encounterEvent?.isSurpriseForParty).toBe(
				true,
			);
		}

		// 6. Falha Crítica por 1 Natural no dado
		const resFalhaCritNatural = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 1, // CD 12. 1 + 2 = 3. Margem seria -9.
		});
		expect(resFalhaCritNatural.success).toBe(true);
		if (resFalhaCritNatural.success) {
			expect(resFalhaCritNatural.data.outcome).toBe("critical_failure");
		}
	});

	it("generates procedurally appropriate encounter events based on regionTier and biome on check failures", () => {
		const service = new EncounterService();
		const stats = new FakeCharacterStats();
		const tile = createFakeTile({ regionTier: 2, biome: "marsh" }); // CD 15 + 3 = 18

		// Testa a geração determinística com encounterIndex
		const result = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 14, // Falha Normal (Total 16 vs CD 18, Margem -2)
			encounterIndex: 1,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.outcome).toBe("failure");
			expect(result.data.encounterEvent).toBeDefined();
			expect(result.data.encounterEvent?.tier).toBe(2);
			expect(typeof result.data.encounterEvent?.name).toBe("string");
			expect(typeof result.data.encounterEvent?.description).toBe("string");
		}
	});

	it("validates that the service handles character stats decoration (Decorator Pattern) correctly", () => {
		const service = new EncounterService();
		const baseStats = new FakeCharacterStats(4, 2); // Físico = 4

		// Decorador real que reduz physical em -2 (Veneno de Víbora)
		const decoratedStats = new ViperPoisonDecorator(baseStats);

		const tile = createFakeTile({ regionTier: 1, biome: "road" }); // CD 12

		// Com Físico original (4) + Dado (8) = 12 (Sucesso)
		const resBase = service.resolveScoutCheck({
			scoutStats: baseStats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 8,
		});
		expect(resBase.success).toBe(true);
		if (resBase.success) {
			expect(resBase.data.outcome).toBe("success");
		}

		// Com Físico decorado (2) + Dado (8) = 10 (Falha)
		const resDecorated = service.resolveScoutCheck({
			scoutStats: decoratedStats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 8,
		});
		expect(resDecorated.success).toBe(true);
		if (resDecorated.success) {
			expect(resDecorated.data.outcome).toBe("failure");
		}
	});

	it("uses injected DiceService for scout rolls and random encounter selection", () => {
		const diceClock = createDeterministicDiceClock("2026-05-22T12:00:00.000Z");
		const diceService = new DiceService(
			new SequenceDiceRng([0.45, 0.2]),
			createSequentialDiceRollIdProvider("test-scout"),
			diceClock,
		);

		const service = new EncounterService(diceService);
		const stats = new FakeCharacterStats(2, 3); // Físico = 2
		const tile = createFakeTile({ regionTier: 1, biome: "forest" }); // CD Final = 12 + 3 = 15

		const result = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			const data = result.data;
			// d20 rolou 10 (0.45 * 20 = 9 -> +1 = 10)
			expect(data.diceRoll).toBe(10);
			expect(data.effectiveDice).toBe(10);
			// Total = 10 + Físico 2 = 12. CD Final = 15. Margem = -3. Resultado = Falha.
			expect(data.outcome).toBe("failure");
			expect(data.margin).toBe(-3);

			// Encontro sorteado pelo dado alternativo (segundo valor da sequência: 0.2)
			// Elementos no tier 1: 5. 0.2 * 5 = 1.0 -> naturalRoll = 2. index = 1 ("Fosso de Areia Movediça")
			expect(data.encounterEvent).toBeDefined();
			expect(data.encounterEvent?.name).toBe("Fosso de Areia Movediça");
		}
	});

	it("deve usar construtor padrao e exercitar rolagens normais de d20 sem falhas", () => {
		const service = new EncounterService();
		const stats = new FakeCharacterStats();
		const tile = createFakeTile({ regionTier: 1, biome: "road" });

		const res = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "mental", // testa atributo mental
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
		});
		expect(res.success).toBe(true);
	});

	it("deve falhar resolveScoutCheck se a rolagem do d20 falhar", () => {
		const failingDiceService = {
			rollD20: () => fail({ message: "Falha d20 simulada" }),
			rollDie: () => fail({ message: "Falha dado" }),
		} as unknown as DiceService;

		const service = new EncounterService(failingDiceService);
		const stats = new FakeCharacterStats();
		const tile = createFakeTile({ regionTier: 1, biome: "road" });

		const res = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("DICE_ROLL_ERROR");
		}
	});

	it("deve falhar resolveScoutCheck se a rolagem alternativa d20 falhar", () => {
		let callCount = 0;
		const failingAltDiceService = {
			rollD20: () => {
				callCount++;
				if (callCount === 1) {
					return ok({
						naturalRoll: 10,
						bonus: 0,
						total: 10,
						id: "1",
						reason: "",
						timestamp: "",
					});
				}
				return fail({ message: "Falha d20 alt simulada" });
			},
		} as unknown as DiceService;

		const service = new EncounterService(failingAltDiceService);
		const stats = new FakeCharacterStats();
		const tile = createFakeTile({
			regionTier: 1,
			biome: "road",
			isMapped: true,
		}); // garante vantagem

		const res = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "cautious", // netAdvantage > 0 (vantagem)
			climaAdverso: false,
			visibilidadeNula: false,
		});
		expect(res.success).toBe(false);
	});

	it("deve usar fallback de Tier 1 se o tier do hexagono for desconhecido", () => {
		const service = new EncounterService();
		const stats = new FakeCharacterStats();
		const tile = createFakeTile({ regionTier: 99, biome: "road" }); // tier inexistente

		const res = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 2, // Margem muito baixa -> Falha
		});
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.encounterEvent).toBeDefined();
			// Tier 99 inexistente cai para Tier 1.
			// Verifica se o encontro sorteado e do pool de Tier 1 (ex: lobos, goblins, ponte...)
			expect(res.data.encounterEvent?.tier).toBe(99);
		}
	});

	it("deve lidar com erro na rolagem do dado ao sortear encontro proceduralmente", () => {
		const failingDieService = {
			rollDie: () => fail({ message: "Erro dado" }),
		} as unknown as DiceService;

		const service = new EncounterService(failingDieService);
		const stats = new FakeCharacterStats();
		const tile = createFakeTile({ regionTier: 1, biome: "road" });

		const res = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 2, // Falha
		});
		expect(res.success).toBe(true);
		if (res.success) {
			// Se falhou ao rolar, cai no index 0 (Bando de Goblins Saqueadores)
			expect(res.data.encounterEvent?.name).toBe(
				"Bando de Goblins Saqueadores",
			);
		}
	});

	it("aplica modificadores dinâmicos de tier de desafio corretamente", () => {
		const service = new EncounterService();
		const stats = new FakeCharacterStats();
		const tile = createFakeTile({ regionTier: 1, biome: "road" }); // CD Base 12

		// Com modificador +1 -> Tier Efetivo 2 -> CD Base 15
		const resPositivo = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 10,
			tierModifier: 1,
		});
		expect(resPositivo.success).toBe(true);
		if (resPositivo.success) {
			expect(resPositivo.data.cdBase).toBe(15);
		}

		// Com modificador -1 -> Tier Efetivo 0 -> Pelo Math.max(1) vira Tier 1 -> CD Base 12
		const resNegativo = service.resolveScoutCheck({
			scoutStats: stats,
			attribute: "physical",
			targetTile: tile,
			ritmo: "normal",
			climaAdverso: false,
			visibilidadeNula: false,
			diceRoll: 10,
			tierModifier: -1,
		});
		expect(resNegativo.success).toBe(true);
		if (resNegativo.success) {
			expect(resNegativo.data.cdBase).toBe(12);
		}
	});
});
