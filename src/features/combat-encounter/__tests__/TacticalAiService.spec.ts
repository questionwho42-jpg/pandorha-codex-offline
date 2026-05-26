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
});
