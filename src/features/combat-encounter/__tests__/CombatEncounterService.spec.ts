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

	it("rolls equipped weapon damage dice before sending totals to the damage pipeline", () => {
		const service = new CombatEncounterService(
			createResolutionService([0.45]),
			new DamagePipelineService(),
			createDeterministicCombatClock("2026-05-06T12:00:00.000Z"),
			createWeaponDiceService([0.5]),
		);

		const state = expectCombatSuccess(
			service.resolveAttack({
				...createEncounterInput(),
				attacker: { id: "session-character-1", label: "Nara" },
				damage: {
					...createDamageInput({ baseDiceTotal: 2, matrixValue: 3 }),
					weaponDice: {
						expression: "1d4",
						label: "Adaga",
					},
				},
			}),
		);

		expect(state.damage?.breakdown).toMatchObject({
			baseDiceTotal: 3,
			matrixValue: 3,
			extraModifierTotal: 0,
		});
		expect(state.damage?.finalDamage).toBe(6);
		expect(state.weaponDamageRoll?.auditEntry).toEqual({
			rollId: "weapon-damage-roll-1",
			reason: "Dano de arma: Adaga (1d4)",
			sides: 4,
			naturalRoll: 3,
			createdAt: "2026-05-06T12:05:00.000Z",
		});
		expect(state.events.map((event) => event.type)).toEqual([
			"attackQueued",
			"attackResolved",
			"weaponDamageRolled",
			"damageApplied",
		]);
		expect(state.log).toContain(
			"Adaga rolou 3 em 1d4 para dano da arma (auditoria weapon-damage-roll-1). Matriz 3, modificadores 0.",
		);
	});

	it("returns typed failure when weapon dice are present without a dice service", () => {
		const service = createService([0.45]);

		const failure = expectCombatFailure(
			service.resolveAttack(
				createEncounterInput({
					damage: createDamageInputWithWeaponDice(),
				}),
			),
		);

		expect(failure.code).toBe("WEAPON_DAMAGE_DICE_FAILED");
		expect(failure.details?.reason).toBe("missing weapon damage dice service");
	});

	it("returns typed failure when weapon damage dice rolling fails", () => {
		const service = new CombatEncounterService(
			createResolutionService([0.45]),
			new DamagePipelineService(),
			createDeterministicCombatClock("2026-05-06T12:00:00.000Z"),
			createWeaponDiceService([]),
		);

		const failure = expectCombatFailure(
			service.resolveAttack(
				createEncounterInput({
					damage: createDamageInputWithWeaponDice(),
				}),
			),
		);

		expect(failure.code).toBe("WEAPON_DAMAGE_DICE_FAILED");
		expect(failure.details?.diceFailureCode).toBe("INVALID_RNG_VALUE");
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
});

function createService(sequence: readonly number[]): CombatEncounterService {
	return new CombatEncounterService(
		createResolutionService(sequence),
		new DamagePipelineService(),
		createDeterministicCombatClock("2026-05-06T12:00:00.000Z"),
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

function createWeaponDiceService(sequence: readonly number[]): DiceService {
	return new DiceService(
		new SequenceDiceRng(sequence),
		createSequentialDiceRollIdProvider("weapon-damage-roll"),
		createDeterministicDiceClock("2026-05-06T12:05:00.000Z"),
	);
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

function createDamageInputWithWeaponDice(): CombatEncounterInput["damage"] {
	return {
		...createDamageInput({ baseDiceTotal: 2 }),
		weaponDice: {
			expression: "1d4",
			label: "Adaga",
		},
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
