import { describe, expect, it } from "vitest";
import {
	type DamagePipelineFailure,
	type DamagePipelineResult,
	DamagePipelineService,
} from "$lib/shared/damage";
import { DiceService } from "$lib/shared/dice";
import {
	createDeterministicDiceClock,
	createSequentialDiceRollIdProvider,
	SequenceDiceRng,
} from "$lib/shared/dice/testing/SequenceDiceRng";
import { fail, type Result } from "$lib/shared/lib/result";
import {
	type ResolutionFailure,
	type ResolutionResult,
	ResolutionService,
} from "$lib/shared/resolution";
import { CombatEncounterService } from "../domain/CombatEncounterService";
import type {
	CombatDamagePort,
	CombatEncounterClock,
	CombatEncounterFailure,
	CombatEncounterInput,
	CombatEncounterState,
	CombatResolutionPort,
} from "../model/combatEncounterTypes";

describe("CombatEncounterService", () => {
	it("reduces target HP when an attack succeeds", () => {
		const service = createService([0.45]);

		const state = expectCombatSuccess(
			service.resolveAttack(
				createEncounterInput({
					target: createTarget({ currentHitPoints: 18, armorClass: 15 }),
					damage: createDamageInput({ baseDiceTotal: 6, matrixValue: 3 }),
				}),
			),
		);

		expect(state.wasHit).toBe(true);
		expect(state.target.currentHitPoints).toBe(9);
		expect(state.damage?.finalDamage).toBe(9);
		expect(state.events.map((event) => event.type)).toEqual([
			"attackQueued",
			"attackResolved",
			"damageApplied",
		]);
		expect(state.log).toEqual([
			"Aria preparou um ataque contra Guarda de Treino.",
			"Aria acertou Guarda de Treino: sucesso, total 18 contra CA 15.",
			"Guarda de Treino sofreu 9 de dano. HP restante: 9.",
		]);
	});

	it("keeps target HP unchanged when the attack fails", () => {
		const service = createService([0.2]);

		const state = expectCombatSuccess(
			service.resolveAttack(
				createEncounterInput({
					target: createTarget({ currentHitPoints: 18, armorClass: 20 }),
				}),
			),
		);

		expect(state.wasHit).toBe(false);
		expect(state.target.currentHitPoints).toBe(18);
		expect(state.damage).toBeNull();
		expect(state.events.map((event) => event.type)).toEqual([
			"attackQueued",
			"attackResolved",
		]);
		expect(state.log.at(-1)).toBe(
			"Aria errou Guarda de Treino: falha, total 13 contra CA 20. Nenhum dano foi aplicado.",
		);
	});

	it("marks critical resolution as critical damage", () => {
		const service = createService([0.45]);

		const state = expectCombatSuccess(
			service.resolveAttack(
				createEncounterInput({
					attack: createAttack({ level: 5, axisValue: 4, applicationValue: 3 }),
					target: createTarget({ currentHitPoints: 30, armorClass: 13 }),
					damage: createDamageInput({ baseDiceTotal: 5, matrixValue: 2 }),
				}),
			),
		);

		expect(state.resolution.degree).toBe("criticalSuccess");
		expect(state.damage?.breakdown.criticalMultiplier).toBe(2);
		expect(state.damage?.finalDamage).toBe(14);
		expect(state.target.currentHitPoints).toBe(16);
	});

	it("clamps target HP at zero when damage exceeds current HP", () => {
		const service = createService([0.45]);

		const state = expectCombatSuccess(
			service.resolveAttack(
				createEncounterInput({
					target: createTarget({ currentHitPoints: 5, armorClass: 15 }),
					damage: createDamageInput({ baseDiceTotal: 10, matrixValue: 3 }),
				}),
			),
		);

		expect(state.target.currentHitPoints).toBe(0);
		expect(state.log.at(-1)).toBe(
			"Guarda de Treino sofreu 13 de dano. HP restante: 0.",
		);
	});

	it("returns typed failure when the command cannot enter the action queue", () => {
		const service = createService([0.45]);

		const failure = expectCombatFailure(
			service.resolveAttack(
				createEncounterInput({
					command: {
						id: "invalid command id",
						type: "attack",
						createdAt: "2026-05-06T12:00:00.000Z",
					},
				}),
			),
		);

		expect(failure.code).toBe("ACTION_QUEUE_FAILED");
		expect(failure.details?.actionQueueFailureCode).toBe(
			"INVALID_ACTION_COMMAND",
		);
	});

	it("returns typed failure when a queued command is not an attack", () => {
		const service = createService([0.45]);

		const failure = expectCombatFailure(
			service.resolveAttack(
				createEncounterInput({
					command: {
						id: "move-1",
						type: "move",
						createdAt: "2026-05-06T12:00:00.000Z",
					},
				}),
			),
		);

		expect(failure.code).toBe("ACTION_QUEUE_FAILED");
		expect(failure.details?.actionQueueFailureCode).toBe(
			"ACTION_PROCESSOR_FAILED",
		);
	});

	it("returns typed failure when resolution fails", () => {
		const service = new CombatEncounterService(
			new FailingResolutionService(),
			new DamagePipelineService(),
			createDeterministicCombatClock("2026-05-06T12:00:00.000Z"),
		);

		const failure = expectCombatFailure(
			service.resolveAttack(createEncounterInput()),
		);

		expect(failure.code).toBe("RESOLUTION_FAILED");
		expect(failure.details?.resolutionFailureCode).toBe(
			"INVALID_RESOLUTION_INPUT",
		);
	});

	it("returns typed failure when the damage pipeline fails", () => {
		const service = new CombatEncounterService(
			createResolutionService([0.45]),
			new FailingDamageService(),
			createDeterministicCombatClock("2026-05-06T12:00:00.000Z"),
		);

		const failure = expectCombatFailure(
			service.resolveAttack(createEncounterInput()),
		);

		expect(failure.code).toBe("DAMAGE_PIPELINE_FAILED");
		expect(failure.details?.damageFailureCode).toBe("INVALID_DAMAGE_INPUT");
	});

	it("returns typed failure for invalid encounter input", () => {
		const service = createService([0.45]);

		const failure = expectCombatFailure(
			service.resolveAttack(
				createEncounterInput({
					target: createTarget({ currentHitPoints: -1 }),
				}),
			),
		);

		expect(failure.code).toBe("INVALID_COMBAT_ENCOUNTER_INPUT");
		expect(failure.details?.issues).toContain(
			"target.currentHitPoints: Too small: expected number to be >=0",
		);
	});

	it("returns deterministic event timestamps and processed command metadata", () => {
		const service = createService([0.45]);

		const state = expectCombatSuccess(
			service.resolveAttack(createEncounterInput()),
		);

		expect(state.processedCommand).toEqual({
			commandId: "attack-1",
			commandType: "attack",
			processedAt: "2026-05-06T12:00:03.000Z",
		});
		expect(state.events.map((event) => event.createdAt)).toEqual([
			"2026-05-06T12:00:00.000Z",
			"2026-05-06T12:00:01.000Z",
			"2026-05-06T12:00:02.000Z",
		]);
	});

	it("resolves death saves correctly for dying actors", () => {
		const service = createService([0.45]); // naturalRoll = 10
		const actor = {
			id: "aria",
			name: "Aria",
			maxHp: 20,
			currentHp: 0,
			armorClass: 15,
			level: 1,
			physical: 1,
			resistance: 2,
			mental: 1,
			isDying: true,
			deathSuccesses: 0,
			deathFailures: 0,
		};

		const result = service.resolveDeathSaves([actor]);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.updatedParty[0]?.deathSuccesses).toBe(1);
			expect(result.data.updatedParty[0]?.isDying).toBe(true);
			expect(result.data.logs[1]).toContain("Sucesso no teste");
		}

		// 2. Caso de Sucesso Crítico: 20 Natural (0.95 -> naturalRoll = 20) -> Reanima com 1 HP
		const serviceCrit = createService([0.95]);
		const resultCrit = serviceCrit.resolveDeathSaves([actor]);
		expect(resultCrit.success).toBe(true);
		if (resultCrit.success) {
			expect(resultCrit.data.updatedParty[0]?.currentHp).toBe(1);
			expect(resultCrit.data.updatedParty[0]?.isDying).toBe(false);
			expect(resultCrit.data.logs[1]).toContain("SUCESSO CRÍTICO");
		}

		// 3. Caso de Falha Crítica: 1 Natural (0.0 -> naturalRoll = 1) -> Acumula 2 falhas
		const serviceFumble = createService([0.0]);
		const resultFumble = serviceFumble.resolveDeathSaves([actor]);
		expect(resultFumble.success).toBe(true);
		if (resultFumble.success) {
			expect(resultFumble.data.updatedParty[0]?.deathFailures).toBe(2);
			expect(resultFumble.data.logs[1]).toContain("FALHA CRÍTICA");
		}

		// 4. Acúmulo de 3 Sucessos -> Estabiliza
		const serviceEstabiliza = createService([0.45]);
		const actorQuaseEstabilizado = { ...actor, deathSuccesses: 2 };
		const resultEst = serviceEstabiliza.resolveDeathSaves([
			actorQuaseEstabilizado,
		]);
		expect(resultEst.success).toBe(true);
		if (resultEst.success) {
			expect(resultEst.data.updatedParty[0]?.isDying).toBe(false);
			expect(resultEst.data.logs.some((l) => l.includes("ESTABILIZOU"))).toBe(
				true,
			);
		}

		// 5. Acúmulo de 3 Falhas -> Morte Definitiva
		const serviceMorte = createService([0.1]); // d20 = 3 -> Falha
		const actorQuaseMorto = { ...actor, deathFailures: 2 };
		const resultMorte = serviceMorte.resolveDeathSaves([actorQuaseMorto]);
		expect(resultMorte.success).toBe(true);
		if (resultMorte.success) {
			expect(
				resultMorte.data.logs.some((l) => l.includes("MORTE DEFINITIVA")),
			).toBe(true);
		}
	});

	it("resolves first aid correctly", () => {
		const service = createService([0.45, 0.45]); // d20 = 10
		const helper = {
			id: "aria",
			name: "Aria",
			maxHp: 20,
			currentHp: 15,
			armorClass: 15,
			level: 1,
			physical: 1,
			resistance: 1,
			mental: 3,
			isDying: false,
			deathSuccesses: 0,
			deathFailures: 0,
		};
		const target = {
			id: "boris",
			name: "Boris",
			maxHp: 20,
			currentHp: 0,
			armorClass: 12,
			level: 1,
			physical: 1,
			resistance: 1,
			mental: 1,
			isDying: true,
			deathSuccesses: 0,
			deathFailures: 0,
		};

		// 1. Sucesso: 10 + level 1 + mental 3 = 14 vs CD 13 (10 + level 1 + physical 1 + resistance 1)
		const result = service.resolveFirstAid({
			helper,
			target,
			hasFirstAidKit: false,
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.updatedTarget.isDying).toBe(false);
			expect(result.data.logs[1]).toContain("SUCESSO");
		}

		// 2. Falha: target com HP > 0 é inválido
		const targetInvalido = { ...target, currentHp: 5 };
		const resultFalhaTarget = service.resolveFirstAid({
			helper,
			target: targetInvalido,
			hasFirstAidKit: false,
		});
		expect(resultFalhaTarget.success).toBe(false);
		if (!resultFalhaTarget.success) {
			expect(resultFalhaTarget.error.code).toBe("INVALID_TARGET_FOR_FIRST_AID");
		}

		// 3. Falha: usando kit de primeiros socorros (CD 15), totalRoll = 14 (10 + 1 + 3).
		const resultFalhaKit = service.resolveFirstAid({
			helper,
			target,
			hasFirstAidKit: true,
		});
		expect(resultFalhaKit.success).toBe(true);
		if (resultFalhaKit.success) {
			expect(resultFalhaKit.data.updatedTarget.isDying).toBe(true);
			expect(resultFalhaKit.data.logs[1]).toContain("FALHA");
		}
	});

	it("resolves retreat correctly", () => {
		const service = createService([0.7]); // d20 = 15
		const party = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 15,
				armorClass: 15,
				level: 1,
				physical: 2,
				resistance: 1,
				mental: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];
		const monsters = [
			{
				id: "goblin-1",
				label: "Goblin",
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

		// 1. Fuga bem-sucedida: d20 = 15 + physical 2 = 17 vs CD 12 (10 + iniciativa do monstro 2)
		const result = service.resolveRetreat({ party, monsters });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.success).toBe(true);
			expect(result.data.logs[1]).toContain("FUGA BEM-SUCEDIDA");
		}

		// 2. Fuga falha: d20 = 1 (0.0 -> naturalRoll = 1) -> Total 3 vs CD 12 -> Falha
		const serviceFalha = createService([0.0]);
		const resultFalha = serviceFalha.resolveRetreat({ party, monsters });
		expect(resultFalha.success).toBe(true);
		if (resultFalha.success) {
			expect(resultFalha.data.success).toBe(false);
			expect(resultFalha.data.logs[1]).toContain("FALHA NA FUGA");
		}
	});

	it("retorna falha de missing dice service nos metodos que exigem dados", () => {
		const serviceNoDice = new CombatEncounterService(
			createResolutionService([0.5]),
			new DamagePipelineService(),
			createDeterministicCombatClock("2026-05-06T12:00:00.000Z"),
			undefined, // sem diceService
		);

		const party = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 0,
				armorClass: 15,
				level: 1,
				physical: 1,
				resistance: 1,
				mental: 1,
				isDying: true,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const resDeath = serviceNoDice.resolveDeathSaves(party);
		expect(resDeath.success).toBe(false);
		if (!resDeath.success) {
			expect(resDeath.error.code).toBe("MISSING_DICE_SERVICE");
		}

		const resFirstAid = serviceNoDice.resolveFirstAid({
			helper: { ...party[0]!, currentHp: 10, isDying: false },
			target: party[0]!,
			hasFirstAidKit: false,
		});
		expect(resFirstAid.success).toBe(false);
		if (!resFirstAid.success) {
			expect(resFirstAid.error.code).toBe("MISSING_DICE_SERVICE");
		}

		const resRetreat = serviceNoDice.resolveRetreat({
			party: [{ ...party[0]!, currentHp: 10, isDying: false }],
			monsters: [],
		});
		expect(resRetreat.success).toBe(false);
		if (!resRetreat.success) {
			expect(resRetreat.error.code).toBe("MISSING_DICE_SERVICE");
		}
	});

	it("retorna falha se o d20/dado falhar nos metodos correspondentes", () => {
		class FailingDiceService extends DiceService {
			public constructor() {
				super(
					new SequenceDiceRng([0.5]),
					createSequentialDiceRollIdProvider("fail-roll"),
					createDeterministicDiceClock("2026-05-06T12:00:00.000Z"),
				);
			}
			public override rollD20() {
				return fail({ message: "Erro no d20" }) as any;
			}
			public override rollDie() {
				return fail({ message: "Erro no die" }) as any;
			}
		}

		const failingDice = new FailingDiceService();
		const serviceFailingDice = new CombatEncounterService(
			createResolutionService([0.5]),
			new DamagePipelineService(),
			createDeterministicCombatClock("2026-05-06T12:00:00.000Z"),
			failingDice,
		);

		const party = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 0,
				armorClass: 15,
				level: 1,
				physical: 1,
				resistance: 1,
				mental: 1,
				isDying: true,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const resDeath = serviceFailingDice.resolveDeathSaves(party);
		expect(resDeath.success).toBe(false);
		if (!resDeath.success) {
			expect(resDeath.error.code).toBe("DICE_ROLL_ERROR");
		}

		const resFirstAid = serviceFailingDice.resolveFirstAid({
			helper: { ...party[0]!, currentHp: 10, isDying: false },
			target: party[0]!,
			hasFirstAidKit: false,
		});
		expect(resFirstAid.success).toBe(false);
		if (!resFirstAid.success) {
			expect(resFirstAid.error.code).toBe("DICE_ROLL_ERROR");
		}

		const resRetreat = serviceFailingDice.resolveRetreat({
			party: [{ ...party[0]!, currentHp: 10, isDying: false }],
			monsters: [
				{
					id: "goblin-1",
					label: "Goblin",
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
			],
		});
		expect(resRetreat.success).toBe(false);
		if (!resRetreat.success) {
			expect(resRetreat.error.code).toBe("DICE_ROLL_ERROR");
		}
	});

	it("retorna falha se tentar fazer fuga sem herois ativos", () => {
		const service = createService([0.5]);
		const party = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 0, // Inativo
				armorClass: 15,
				level: 1,
				physical: 1,
				resistance: 1,
				mental: 1,
				isDying: true,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const res = service.resolveRetreat({ party, monsters: [] });
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("NO_ACTIVE_HEROES_TO_RETREAT");
		}
	});

	it("retorna sucesso de fuga automatica se nao houver monstros vivos", () => {
		const service = createService([0.5]);
		const party = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 10,
				armorClass: 15,
				level: 1,
				physical: 1,
				resistance: 1,
				mental: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const res = service.resolveRetreat({ party, monsters: [] });
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.success).toBe(true);
			expect(res.data.logs[0]).toContain(
				"Nenhum inimigo ativo. Fuga automática bem-sucedida!",
			);
		}
	});
});

function createService(sequence: readonly number[]): CombatEncounterService {
	const diceService = new DiceService(
		new SequenceDiceRng(sequence),
		createSequentialDiceRollIdProvider("combat-roll"),
		createDeterministicDiceClock("2026-05-06T11:59:00.000Z"),
	);

	return new CombatEncounterService(
		new ResolutionService(diceService),
		new DamagePipelineService(),
		createDeterministicCombatClock("2026-05-06T12:00:00.000Z"),
		diceService,
	);
}

function createResolutionService(
	sequence: readonly number[],
): ResolutionService {
	const diceService = new DiceService(
		new SequenceDiceRng(sequence),
		createSequentialDiceRollIdProvider("combat-roll"),
		createDeterministicDiceClock("2026-05-06T11:59:00.000Z"),
	);

	return new ResolutionService(diceService);
}

function createEncounterInput(
	overrides: Partial<CombatEncounterInput> = {},
): CombatEncounterInput {
	return {
		command: createAttackCommand(),
		attacker: {
			id: "aria",
			label: "Aria",
		},
		target: createTarget(),
		attack: createAttack(),
		damage: createDamageInput(),
		...overrides,
	};
}

function createAttackCommand() {
	return {
		id: "attack-1",
		type: "attack",
		source: "CombatEncounterService.spec",
		createdAt: "2026-05-06T12:00:00.000Z",
		payload: { attackerId: "aria", targetId: "training-guard" },
	};
}

function createTarget(
	overrides: Partial<CombatEncounterInput["target"]> = {},
): CombatEncounterInput["target"] {
	return {
		id: "training-guard",
		label: "Guarda de Treino",
		currentHitPoints: 18,
		armorClass: 15,
		...overrides,
	};
}

function createAttack(
	overrides: Partial<CombatEncounterInput["attack"]> = {},
): CombatEncounterInput["attack"] {
	return {
		reason: "Ataque corpo a corpo",
		level: 2,
		axisValue: 3,
		applicationValue: 2,
		itemBonus: 1,
		...overrides,
	};
}

function createDamageInput(
	overrides: Partial<CombatEncounterInput["damage"]> = {},
): CombatEncounterInput["damage"] {
	return {
		damageType: "physical",
		baseDiceTotal: 4,
		matrixValue: 2,
		extraModifierTotal: 0,
		damageReduction: 0,
		vulnerabilityBonusDamage: 0,
		affinities: [],
		...overrides,
	};
}

function expectCombatSuccess(
	result: ReturnType<CombatEncounterService["resolveAttack"]>,
): CombatEncounterState {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectCombatFailure(
	result: ReturnType<CombatEncounterService["resolveAttack"]>,
): CombatEncounterFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

function createDeterministicCombatClock(
	startIso: string,
): CombatEncounterClock {
	const startMs = Date.parse(startIso);
	let offsetSeconds = 0;

	return {
		now: () => {
			const createdAt = new Date(startMs + offsetSeconds * 1000).toISOString();
			offsetSeconds += 1;
			return createdAt;
		},
	};
}

class FailingResolutionService implements CombatResolutionPort {
	public resolveGlobalTest(): Result<ResolutionResult, ResolutionFailure> {
		return fail({
			code: "INVALID_RESOLUTION_INPUT",
			message: "Resolution fixture failed.",
			details: { reason: "fixture" },
		});
	}
}

class FailingDamageService implements CombatDamagePort {
	public calculateDamage(): Result<
		DamagePipelineResult,
		DamagePipelineFailure
	> {
		return fail({
			code: "INVALID_DAMAGE_INPUT",
			message: "Damage fixture failed.",
			details: { reason: "fixture" },
		});
	}
}
