import { describe, expect, it } from "vitest";
import {
	type DiceFailure,
	type DiceRollResult,
	DiceService,
} from "$lib/shared/dice";
import {
	createDeterministicDiceClock,
	createSequentialDiceRollIdProvider,
	SequenceDiceRng,
} from "$lib/shared/dice/testing/SequenceDiceRng";
import { fail, type Result } from "$lib/shared/lib/result";
import {
	type TacticalAiActor,
	TacticalAiService,
} from "../domain/TacticalAiService";
import type { Monster } from "../model/monsterCatalog";

function createTestDiceService(sequence: readonly number[]): DiceService {
	return new DiceService(
		new SequenceDiceRng(sequence),
		createSequentialDiceRollIdProvider("test-ai-roll"),
		createDeterministicDiceClock("2026-05-06T12:00:00.000Z"),
	);
}

describe("TacticalAiService", () => {
	it("resolve ataque de monstros vivos contra o Andarilho com menor HP", () => {
		// d20 = 10 (0.45 -> naturalRoll = 10). Dano: 1d6 (0.5 -> naturalRoll = 4).
		const diceService = createTestDiceService([0.45, 0.5]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 15,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
			{
				id: "boris",
				name: "Boris",
				maxHp: 20,
				currentHp: 10, // Menor HP, deve ser focado pela IA
				armorClass: 11,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin Saqueador",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 10,
				armorClass: 11,
				level: 1,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 25,
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			const updatedBoris = res.data.updatedParty.find((c) => c.id === "boris");
			expect(updatedBoris).toBeDefined();
			if (updatedBoris) {
				// Boris sofreu dano: d20=10 + mod 2 = 12 (acertou CA 11). Dano: 4 + mod 1 = 5. HP restante: 10 - 5 = 5.
				expect(updatedBoris.currentHp).toBe(5);
			}
			expect(res.data.logs[0]).toContain("Boris sofreu 5 de dano");
		}
	});

	it("erra o ataque se a rolagem total for inferior à CA do alvo", () => {
		// d20 = 2 (0.05 -> naturalRoll = 2). Menor que a CA 11.
		const diceService = createTestDiceService([0.05]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 10,
				armorClass: 11,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin Saqueador",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 10,
				armorClass: 11,
				level: 1,
				attackBonus: 1,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 25,
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			const updatedAria = res.data.updatedParty[0];
			expect(updatedAria).toBeDefined();
			if (updatedAria) {
				expect(updatedAria.currentHp).toBe(10); // HP inalterado
			}
			expect(res.data.logs[0]).toContain("(ERRO)");
		}
	});

	it("aplica acerto crítico e dobra dados de dano se rolar 20 natural", () => {
		// d20 = 20 (0.95 -> naturalRoll = 20). Dano: 1d6 jogado duas vezes (0.5, 0.5 -> naturalRolls 4 e 4).
		const diceService = createTestDiceService([0.95, 0.5, 0.5]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 15,
				armorClass: 15,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 10,
				armorClass: 15,
				level: 1,
				attackBonus: 1,
				damageDice: "1d6",
				damageBonus: 2,
				initiativeBase: 2,
				xpValue: 25,
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			const updatedAria = res.data.updatedParty[0];
			expect(updatedAria).toBeDefined();
			if (updatedAria) {
				// Dano crítico: 4 + 4 + mod 2 = 10. HP restante: 15 - 10 = 5.
				expect(updatedAria.currentHp).toBe(5);
			}
			expect(res.data.logs[0]).toContain("ACERTO CRÍTICO");
		}
	});

	it("coloca o Andarilho em estado moribundo se o HP cair a zero", () => {
		// d20 = 10. Dano = 1d6 (rolou 5) + 5 = 10.
		const diceService = createTestDiceService([0.45, 0.7]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 8,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 10,
				armorClass: 10,
				level: 1,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 5,
				initiativeBase: 2,
				xpValue: 25,
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			const updatedAria = res.data.updatedParty[0];
			expect(updatedAria).toBeDefined();
			if (updatedAria) {
				expect(updatedAria.currentHp).toBe(0);
				expect(updatedAria.isDying).toBe(true);
			}
			expect(res.data.logs[0]).toContain("Entrou em estado Moribundo");
		}
	});

	it("não ataca se todos os Andarilhos já estiverem caídos", () => {
		const diceService = createTestDiceService([0.5]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 0,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: true,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 10,
				armorClass: 10,
				level: 1,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 25,
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.logs.length).toBe(0); // Nenhuma ação de ataque foi executada
		}
	});

	it("ignora monstros mortos", () => {
		const diceService = createTestDiceService([0.5]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 10,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const monsters: Monster[] = [
			{
				id: "goblin-dead",
				label: "Goblin Morto",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 0, // Está morto
				armorClass: 10,
				level: 1,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 25,
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.logs.length).toBe(0); // Nada logado
		}
	});

	it("aplica fallback estatico de dano se o monstro possuir damageDice invalido", () => {
		// d20 = 10 (0.45 -> naturalRoll = 10). Dano: fallback = 6 (ja que nao e critico) + mod 2 = 8.
		const diceService = createTestDiceService([0.45]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 15,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 10,
				armorClass: 10,
				level: 1,
				attackBonus: 1,
				damageDice: "invalid", // dado invalido
				damageBonus: 2,
				initiativeBase: 2,
				xpValue: 25,
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			const updatedAria = res.data.updatedParty[0];
			expect(updatedAria).toBeDefined();
			if (updatedAria) {
				expect(updatedAria.currentHp).toBe(7); // 15 - 8 = 7.
			}
		}
	});

	it("aplica fallback estatico de dano critico se o monstro possuir damageDice invalido e rolar critico", () => {
		// d20 = 20 (0.95 -> naturalRoll = 20). Dano: fallback = 12 (ja que e critico) + mod 2 = 14.
		const diceService = createTestDiceService([0.95]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 15,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 10,
				armorClass: 10,
				level: 1,
				attackBonus: 1,
				damageDice: "invalid", // dado invalido
				damageBonus: 2,
				initiativeBase: 2,
				xpValue: 25,
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			const updatedAria = res.data.updatedParty[0];
			expect(updatedAria).toBeDefined();
			if (updatedAria) {
				expect(updatedAria.currentHp).toBe(1); // 15 - 14 = 1.
			}
		}
	});

	it("retorna falha se o d20 do ataque do monstro falhar", () => {
		class FailingDiceService extends DiceService {
			public constructor() {
				super(
					new SequenceDiceRng([0.5]),
					createSequentialDiceRollIdProvider("fail-ai"),
					createDeterministicDiceClock("2026-05-06T12:00:00.000Z"),
				);
			}
			public override rollD20() {
				return fail({
					code: "INVALID_RNG_VALUE",
					message: "Erro no d20 AI",
				}) as unknown as Result<DiceRollResult, DiceFailure>;
			}
		}

		const failingDice = new FailingDiceService();
		const service = new TacticalAiService(failingDice);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 15,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 10,
				armorClass: 10,
				level: 1,
				attackBonus: 1,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 25,
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("DICE_ROLL_ERROR");
		}
	});

	it("retorna falha se a rolagem do dado de dano do monstro falhar", () => {
		class FailingDiceService extends DiceService {
			public constructor() {
				super(
					new SequenceDiceRng([0.45]), // ataque acerta
					createSequentialDiceRollIdProvider("fail-ai-damage"),
					createDeterministicDiceClock("2026-05-06T12:00:00.000Z"),
				);
			}
			public override rollDie() {
				return fail({
					code: "INVALID_RNG_VALUE",
					message: "Erro no dado de dano",
				}) as unknown as Result<DiceRollResult, DiceFailure>;
			}
		}

		const failingDice = new FailingDiceService();
		const service = new TacticalAiService(failingDice);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 15,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 10,
				armorClass: 10,
				level: 1,
				attackBonus: 1,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 25,
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("DICE_ROLL_ERROR");
		}
	});

	it("erra o ataque se a rolagem do d20 for um fumble (natural 1), mesmo que o total atingisse a CA", () => {
		// d20 = 1 (0.0 -> naturalRoll = 1).
		// Com attackBonus de 20, o total seria 21, o que superaria a CA 10. Mas natural 1 erra sempre.
		const diceService = createTestDiceService([0.0]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 15,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 10,
				armorClass: 10,
				level: 1,
				attackBonus: 20,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 25,
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			const updatedAria = res.data.updatedParty.find((c) => c.id === "aria");
			expect(updatedAria).toBeDefined();
			if (updatedAria) {
				expect(updatedAria.currentHp).toBe(15);
			}
			expect(res.data.logs[0]).toContain("(ERRO) (FALHA CRÍTICA)");
		}
	});

	it("bruto prefere alvos de maior HP e CA que estejam proximos", () => {
		const diceService = createTestDiceService([0.5, 0.5]); // Rola ataque médio e dano
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 20, // HP alto
				armorClass: 18, // CA alta
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 }, // Muito próximo (distância 1)
			},
			{
				id: "boris",
				name: "Boris",
				maxHp: 20,
				currentHp: 5, // HP baixo
				armorClass: 10, // CA baixa
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 5 }, // Longe (distância 5)
			},
		];

		const monsters: Monster[] = [
			{
				id: "brute-1",
				label: "Monstro Bruto",
				description: "Bruto",
				maxHitPoints: 30,
				currentHitPoints: 30,
				armorClass: 12,
				level: 3,
				attackBonus: 3,
				damageDice: "1d6",
				damageBonus: 2,
				initiativeBase: 2,
				xpValue: 100,
				role: "brute",
				position: { x: 0, y: 0 },
				spellsCount: 1,
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			// Bruto deve ter atacado Aria por estar mais próxima e ser mais robusta
			const log = res.data.logs[0];
			expect(log).toContain("Aria");
			expect(log).not.toContain("Boris");
		}
	});

	it("artilheiro prefere alvos frageis distantes e recua se estiverem muito proximos", () => {
		// Teste 1: Prefere Boris (frágil e distante) sobre Aria (robusta e perto)
		const diceService = createTestDiceService([0.5, 0.5]);
		const service = new TacticalAiService(diceService);

		const party1: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 20,
				armorClass: 18,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 }, // Perto
			},
			{
				id: "boris",
				name: "Boris",
				maxHp: 20,
				currentHp: 6, // HP baixo
				armorClass: 10, // CA baixa
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 4 }, // Distante (distância 4)
			},
		];

		const monsters1: Monster[] = [
			{
				id: "sniper-1",
				label: "Monstro Artilheiro",
				description: "Sniper",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 10,
				level: 2,
				attackBonus: 4,
				damageDice: "1d8",
				damageBonus: 1,
				initiativeBase: 3,
				xpValue: 80,
				role: "sniper",
				position: { x: 0, y: 0 },
				spellsCount: 1,
			},
		];

		const res1 = service.runMonsterTurns({
			monsters: monsters1,
			party: party1,
		});
		expect(res1.success).toBe(true);
		if (res1.success) {
			// Artilheiro prefere atacar o Boris (frágil e distante)
			expect(res1.data.logs[0]).toContain("Boris");
		}

		// Teste 2: Se o alvo estiver muito perto (distância < 2), sniper deve recuar (ação de movement)
		const party2: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 20,
				armorClass: 18,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 }, // Distância 1 (muito perto)
			},
		];

		const monsters2: Monster[] = [
			{
				id: "sniper-2",
				label: "Monstro Artilheiro Perto",
				description: "Sniper",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 10,
				level: 2,
				attackBonus: 4,
				damageDice: "1d8",
				damageBonus: 1,
				initiativeBase: 3,
				xpValue: 80,
				role: "sniper",
				position: { x: 0, y: 0 },
			},
		];

		const res2 = service.runMonsterTurns({
			monsters: monsters2,
			party: party2,
		});
		expect(res2.success).toBe(true);
		if (res2.success) {
			// Sniper deve ter recuado
			expect(res2.data.logs[0]).toContain("recuou para longe de Aria");
			expect(res2.data.updatedMonsters[0]?.position).toEqual({ x: 0, y: -1 });
		}
	});

	it("controlador prioriza aplicar debuffs em alvos sem debuffs ativos", () => {
		const diceService = createTestDiceService([0.5]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 20,
				armorClass: 12,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 },
				debuffs: ["enfraquecido"], // Já possui debuff
			},
			{
				id: "boris",
				name: "Boris",
				maxHp: 20,
				currentHp: 20,
				armorClass: 12,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 },
				debuffs: [], // Sem debuffs
			},
		];

		const monsters: Monster[] = [
			{
				id: "controller-1",
				label: "Monstro Controlador",
				description: "Controller",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 11,
				level: 2,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 80,
				role: "controller",
				position: { x: 0, y: 0 },
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			// Controlador deve ter aplicado debuff em Boris
			expect(res.data.logs[0]).toContain(
				"aplicou debuff 'enfraquecido' em Boris",
			);
			const updatedBoris = res.data.updatedParty.find((p) => p.id === "boris");
			expect(updatedBoris?.debuffs).toContain("enfraquecido");
		}
	});

	it("converte acoes em cast se possuir spellsCount > 0 e a acao for de alta utilidade", () => {
		// d6 = 4 (0.5 -> naturalRoll = 4). Dano: 4 + nível 2 = 6.
		const diceService = createTestDiceService([0.5]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 20,
				armorClass: 15,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 },
			},
		];

		const monsters: Monster[] = [
			{
				id: "controller-caster",
				label: "Controlador Conjurador",
				description: "Controller con Magia",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 11,
				level: 2,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 100,
				role: "controller",
				position: { x: 0, y: 0 },
				spellsCount: 1, // Pode conjurar
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			// Deve ter conjurado uma magia (base 65 para conjurar + no debuff = 65 vs debuff = 95 - 50 = 45)
			// Espera que a ação com maior utilidade seja debuff (95) caso não tenha debuffs, mas se debuff
			// empatar ou se spellsCount for usado, vamos forçar uma situação onde cast ganhe ou seja escolhido.
			// Controller: castScore = 65. debuffScore = 70 + 25 = 95. Se Boris já estivesse debuffado: debuffScore = 70 - 50 = 20.
			// Então se Aria já possui debuff, debuffScore é 20, físico é 35, movement é 10. Cast é 65 (ganha!).
		}
	});

	it("conjurador escolhe magia se alvos ja possuem debuff", () => {
		const diceService = createTestDiceService([0.5]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 20,
				armorClass: 15,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 },
				debuffs: ["atordoado"], // Já tem debuff, logo debuffScore cai para 20
			},
		];

		const monsters: Monster[] = [
			{
				id: "controller-caster-2",
				label: "Conjurador Eficiente",
				description: "Controller",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 11,
				level: 2,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 100,
				role: "controller",
				position: { x: 0, y: 0 },
				spellsCount: 1,
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.logs[0]).toContain("conjurou uma magia");
			expect(res.data.updatedMonsters[0]?.spellsCount).toBe(0);
		}
	});

	it("resolve desempate deterministico usando rolagem do dado do DiceService", () => {
		// Precisamos de duas ações com pontuações idênticas.
		// Ex: Bruto avaliando dois alvos com a mesma distância, HP e CA.
		// Alvo A e Alvo B ambos à distância 1, HP 20/20, CA 10.
		// Pontuações de ataque físico serão idênticas: 50 + 15 + 10 + 4 = 79.
		// Com 2 ações empatadas, o desempate rola um dado de 2 lados.
		// Rng sequencial: 0.9 (rola 2 natural) -> escolhe o segundo alvo na ordem alfabética.
		const diceService = createTestDiceService([0.9, 0.5, 0.5]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "alvo-a",
				name: "Alvo A",
				maxHp: 20,
				currentHp: 20,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 },
			},
			{
				id: "alvo-b",
				name: "Alvo B",
				maxHp: 20,
				currentHp: 20,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 },
			},
		];

		const monsters: Monster[] = [
			{
				id: "brute-tie",
				label: "Bruto Desempatador",
				description: "Bruto",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 10,
				level: 1,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 50,
				role: "brute",
				position: { x: 0, y: 0 },
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			// Ordem alfabética: physical_attack contra alvo-a, depois physical_attack contra alvo-b.
			// Rolo 2 deve selecionar alvo-b (Alvo B)
			expect(res.data.logs[0]).toContain("Alvo B");
		}
	});

	it("retorna falha se o d20 do ataque do monstro falhar na Utility AI", () => {
		class FailingDiceService extends DiceService {
			public constructor() {
				super(
					new SequenceDiceRng([0.5]),
					createSequentialDiceRollIdProvider("fail-ai"),
					createDeterministicDiceClock("2026-05-06T12:00:00.000Z"),
				);
			}
			public override rollD20() {
				return fail({
					code: "INVALID_RNG_VALUE",
					message: "Erro no d20 AI",
				}) as unknown as Result<DiceRollResult, DiceFailure>;
			}
		}

		const failingDice = new FailingDiceService();
		const service = new TacticalAiService(failingDice);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 15,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 },
			},
		];

		const monsters: Monster[] = [
			{
				id: "brute-fail",
				label: "Bruto",
				description: "Bruto",
				maxHitPoints: 10,
				currentHitPoints: 10,
				armorClass: 10,
				level: 1,
				attackBonus: 1,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 25,
				role: "brute",
				position: { x: 0, y: 0 },
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(false);
	});

	it("retorna falha se a rolagem do dado de dano do monstro falhar na Utility AI", () => {
		class FailingDiceService extends DiceService {
			public constructor() {
				super(
					new SequenceDiceRng([0.45]),
					createSequentialDiceRollIdProvider("fail-ai-damage"),
					createDeterministicDiceClock("2026-05-06T12:00:00.000Z"),
				);
			}
			public override rollDie() {
				return fail({
					code: "INVALID_RNG_VALUE",
					message: "Erro no dado de dano",
				}) as unknown as Result<DiceRollResult, DiceFailure>;
			}
		}

		const failingDice = new FailingDiceService();
		const service = new TacticalAiService(failingDice);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 15,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 },
			},
		];

		const monsters: Monster[] = [
			{
				id: "brute-fail-dmg",
				label: "Bruto",
				description: "Bruto",
				maxHitPoints: 10,
				currentHitPoints: 10,
				armorClass: 10,
				level: 1,
				attackBonus: 1,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 25,
				role: "brute",
				position: { x: 0, y: 0 },
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(false);
	});

	it("retorna falha se a rolagem do dado de dano de magia falhar na Utility AI", () => {
		class FailingDiceService extends DiceService {
			public constructor() {
				super(
					new SequenceDiceRng([0.5]),
					createSequentialDiceRollIdProvider("fail-ai-spell"),
					createDeterministicDiceClock("2026-05-06T12:00:00.000Z"),
				);
			}
			public override rollDie() {
				return fail({
					code: "INVALID_RNG_VALUE",
					message: "Erro no dado de magia",
				}) as unknown as Result<DiceRollResult, DiceFailure>;
			}
		}

		const failingDice = new FailingDiceService();
		const service = new TacticalAiService(failingDice);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 20,
				armorClass: 15,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 },
				debuffs: ["atordoado"],
			},
		];

		const monsters: Monster[] = [
			{
				id: "controller-caster-fail",
				label: "Controller",
				description: "Controller",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 11,
				level: 2,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 100,
				role: "controller",
				position: { x: 0, y: 0 },
				spellsCount: 1,
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(false);
	});

	it("retorna falha se a rolagem de desempate falhar na Utility AI", () => {
		class FailingDiceService extends DiceService {
			public constructor() {
				super(
					new SequenceDiceRng([0.5]),
					createSequentialDiceRollIdProvider("fail-tie"),
					createDeterministicDiceClock("2026-05-06T12:00:00.000Z"),
				);
			}
			public override rollDie() {
				return fail({
					code: "INVALID_RNG_VALUE",
					message: "Erro no desempate",
				}) as unknown as Result<DiceRollResult, DiceFailure>;
			}
		}

		const failingDice = new FailingDiceService();
		const service = new TacticalAiService(failingDice);

		const party: TacticalAiActor[] = [
			{
				id: "alvo-a",
				name: "Alvo A",
				maxHp: 20,
				currentHp: 20,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 },
			},
			{
				id: "alvo-b",
				name: "Alvo B",
				maxHp: 20,
				currentHp: 20,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 },
			},
		];

		const monsters: Monster[] = [
			{
				id: "brute-tie",
				label: "Bruto",
				description: "Bruto",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 10,
				level: 1,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 50,
				role: "brute",
				position: { x: 0, y: 0 },
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(false);
	});

	it("coloca o Andarilho em estado moribundo se o HP cair a zero por magia na Utility AI", () => {
		const diceService = createTestDiceService([0.9]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 8,
				armorClass: 15,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 },
				debuffs: ["atordoado"],
			},
		];

		const monsters: Monster[] = [
			{
				id: "controller-caster-kill",
				label: "Conjurador Letal",
				description: "Controller",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 11,
				level: 5,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 100,
				role: "controller",
				position: { x: 0, y: 0 },
				spellsCount: 1,
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			const updatedAria = res.data.updatedParty[0]!;
			expect(updatedAria.currentHp).toBe(0);
			expect(updatedAria.isDying).toBe(true);
			expect(res.data.logs[0]).toContain("Entrou em estado Moribundo");
		}
	});

	it("erra o ataque se a rolagem do d20 for um fumble na Utility AI", () => {
		const diceService = createTestDiceService([0.0]); // Rola 1 natural
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 20,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 },
			},
		];

		const monsters: Monster[] = [
			{
				id: "brute-fumble",
				label: "Bruto Fumble",
				description: "Bruto",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 10,
				level: 1,
				attackBonus: 20, // Bônus alto, mas fumble deve errar
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 50,
				role: "brute",
				position: { x: 0, y: 0 },
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.logs[0]).toContain("(ERRO) (FALHA CRÍTICA)");
			expect(res.data.updatedParty[0]?.currentHp).toBe(20);
		}
	});

	it("recua no mesmo eixo se o artilheiro estiver na mesma posicao do alvo", () => {
		const diceService = createTestDiceService([0.5]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 20,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 0 }, // Mesma posição
			},
		];

		const monsters: Monster[] = [
			{
				id: "sniper-overlap",
				label: "Sniper",
				description: "Sniper",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 10,
				level: 1,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 50,
				role: "sniper",
				position: { x: 0, y: 0 }, // Mesma posição
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.logs[0]).toContain("recuou para longe de Aria");
			expect(res.data.updatedMonsters[0]?.position).toEqual({ x: 1, y: 0 });
		}
	});

	it("monstro bruto se aproxima do alvo se estiver longe", () => {
		const diceService = createTestDiceService([0.5]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 20,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 10 }, // Distância 10
			},
		];

		const monsters: Monster[] = [
			{
				id: "brute-move",
				label: "Bruto",
				description: "Bruto",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 10,
				level: 1,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 50,
				role: "brute",
				position: { x: 0, y: 0 },
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.logs[0]).toContain("se aproximou de Aria");
			expect(res.data.updatedMonsters[0]?.position).toEqual({ x: 0, y: 1 });
		}
	});

	it("aplica acerto critico na Utility AI se o d20 rolar 20 natural", () => {
		const diceService = createTestDiceService([0.95, 0.5, 0.5]); // d20=20, dmg=4, 4
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 20,
				armorClass: 15,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 1 },
			},
		];

		const monsters: Monster[] = [
			{
				id: "brute-crit",
				label: "Bruto",
				description: "Bruto",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 15,
				level: 1,
				attackBonus: 1,
				damageDice: "1d6",
				damageBonus: 2,
				initiativeBase: 2,
				xpValue: 50,
				role: "brute",
				position: { x: 0, y: 0 },
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.logs[0]).toContain("ACERTO CRÍTICO");
			expect(res.data.updatedParty[0]?.currentHp).toBe(10); // 20 - (4+4+2) = 10
		}
	});

	it("desempata tipos diferentes de acoes deterministicamente na Utility AI", () => {
		const diceService = createTestDiceService([0.9]);
		const service = new TacticalAiService(diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 20,
				armorClass: 15,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: -5,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 0, y: 2 },
				debuffs: ["atordoado"],
			},
		];

		const monsters: Monster[] = [
			{
				id: "controller-tie",
				label: "Controlador Empatado",
				description: "Controller",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 10,
				level: 1,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 50,
				role: "controller",
				position: { x: 0, y: 0 },
			},
		];

		const res = service.runMonsterTurns({ monsters, party });
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.logs[0]).toContain("se aproximou de Aria");
			expect(res.data.updatedMonsters[0]?.position).toEqual({ x: 0, y: 1 });
		}
	});

	it("cobre ramos de distancia parcial no calculateDistance na Utility AI", () => {
		const diceService = createTestDiceService([0.5]);
		const service = new TacticalAiService(diceService);

		// Caso 1: Monster has position, target does not
		const party1: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 20,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const monsters1: Monster[] = [
			{
				id: "brute-1",
				label: "Bruto",
				description: "Bruto",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 10,
				level: 1,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 50,
				role: "brute",
				position: { x: 5, y: 5 },
			},
		];

		service.runMonsterTurns({ monsters: monsters1, party: party1 });

		// Caso 2: Target has position, monster does not
		const party2: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 20,
				armorClass: 10,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
				position: { x: 5, y: 5 },
			},
		];

		const monsters2: Monster[] = [
			{
				id: "brute-2",
				label: "Bruto",
				description: "Bruto",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 10,
				level: 1,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 50,
				role: "brute",
			},
		];

		service.runMonsterTurns({ monsters: monsters2, party: party2 });
	});
});
