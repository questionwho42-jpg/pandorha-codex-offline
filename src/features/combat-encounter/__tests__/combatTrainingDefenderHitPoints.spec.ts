import { describe, expect, it } from "vitest";
import type { CharacterRecord } from "$lib/entities/character";
import { OFFICIAL_CHARACTER_CLASSES } from "$lib/entities/character-class";
import type { DamagePipelineResult } from "$lib/shared/damage";
import {
	applyCombatTrainingDefenderDamage,
	createCombatTrainingDefenderHitPoints,
	createCombatTrainingDefenderHitPointsView,
} from "../model/combatTrainingDefenderHitPoints";

const TEST_TIMESTAMP = "2026-06-04T21:22:00.000Z";

describe("combat training defender hit points", () => {
	it("creates a non-persistent defender HP ledger from derived character stats", () => {
		const result = createCombatTrainingDefenderHitPoints({
			character: createCharacterRecord(),
			characterClasses: OFFICIAL_CHARACTER_CLASSES,
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data).toEqual({
			characterId: "session-character-1",
			characterLabel: "Lia",
			currentHitPoints: 14,
			isDefeated: false,
			maxHitPoints: 14,
			summaryLabel: "HP de treino de Lia: 14/14",
		});
	});

	it("subtracts incoming training damage without mutating real character HP", () => {
		const state = expectTrainingHpSuccess(
			createCombatTrainingDefenderHitPoints({
				character: createCharacterRecord(),
				characterClasses: OFFICIAL_CHARACTER_CLASSES,
			}),
		);

		const result = applyCombatTrainingDefenderDamage({
			state,
			incomingDamage: createDamageResult({ finalDamage: 6 }),
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data).toEqual({
			state: {
				...state,
				currentHitPoints: 8,
				summaryLabel: "HP de treino de Lia: 8/14",
			},
			log: [
				"Lia sofreu 6 de dano de treino. HP de treino: 8/14. HP real da ficha permanece intacto.",
			],
		});
	});

	it("keeps HP unchanged when the training target misses", () => {
		const state = expectTrainingHpSuccess(
			createCombatTrainingDefenderHitPoints({
				character: createCharacterRecord(),
				characterClasses: OFFICIAL_CHARACTER_CLASSES,
			}),
		);

		const result = applyCombatTrainingDefenderDamage({
			state,
			incomingDamage: null,
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data).toEqual({ state, log: [] });
	});

	it("clamps the local training ledger at zero without applying Moribundo", () => {
		const state = expectTrainingHpSuccess(
			createCombatTrainingDefenderHitPoints({
				character: createCharacterRecord(),
				characterClasses: OFFICIAL_CHARACTER_CLASSES,
			}),
		);

		const result = applyCombatTrainingDefenderDamage({
			state,
			incomingDamage: createDamageResult({ finalDamage: 99 }),
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.state.currentHitPoints).toBe(0);
		expect(result.data.state.isDefeated).toBe(true);
		expect(result.data.state.summaryLabel).toBe("HP de treino de Lia: 0/14");
		expect(result.data.log).toEqual([
			"Lia sofreu 99 de dano de treino. HP de treino: 0/14. Moribundo e Inconsciente não foram aplicados nesta fatia.",
		]);
	});

	it("exposes a terminal training HP view when the local ledger reaches zero", () => {
		const state = expectTrainingHpSuccess(
			createCombatTrainingDefenderHitPoints({
				character: createCharacterRecord(),
				characterClasses: OFFICIAL_CHARACTER_CLASSES,
			}),
		);
		const defeated = expectTrainingDamageSuccess(
			applyCombatTrainingDefenderDamage({
				state,
				incomingDamage: createDamageResult({ finalDamage: 99 }),
			}),
		).state;

		const view = createCombatTrainingDefenderHitPointsView(defeated);

		expect(view).toEqual({
			canReceiveTrainingDamage: false,
			summaryLabel: "HP de treino de Lia: 0/14",
			terminalDescription:
				"Lia chegou a 0 HP de treino. Reinicie o encontro para testar outro dano recebido; HP real, Moribundo e Inconsciente permanecem fora desta fatia.",
			terminalLabel: "Teste recebido encerrado",
		});
	});

	it("blocks repeated incoming training damage after the local ledger is already terminal", () => {
		const state = expectTrainingHpSuccess(
			createCombatTrainingDefenderHitPoints({
				character: createCharacterRecord(),
				characterClasses: OFFICIAL_CHARACTER_CLASSES,
			}),
		);
		const defeated = expectTrainingDamageSuccess(
			applyCombatTrainingDefenderDamage({
				state,
				incomingDamage: createDamageResult({ finalDamage: 99 }),
			}),
		).state;

		const result = applyCombatTrainingDefenderDamage({
			state: defeated,
			incomingDamage: createDamageResult({ finalDamage: 6 }),
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.state).toEqual(defeated);
		expect(result.data.log).toEqual([
			"Lia jÃ¡ estÃ¡ com 0 HP de treino. Reinicie o encontro para testar outro dano recebido; nenhum novo dano de treino foi calculado.",
		]);
	});

	it("fails when the character class cannot be resolved", () => {
		const result = createCombatTrainingDefenderHitPoints({
			character: createCharacterRecord(),
			characterClasses: [],
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "TRAINING_DEFENDER_CLASS_NOT_FOUND",
			details: {
				characterClassId: "vanguard",
				characterId: "session-character-1",
			},
		});
	});

	it("fails when the resolved character class cannot derive valid HP", () => {
		const characterClass = OFFICIAL_CHARACTER_CLASSES.find(
			(candidate) => candidate.id === "vanguard",
		);

		expect(characterClass).toBeDefined();
		if (!characterClass) {
			return;
		}

		const result = createCombatTrainingDefenderHitPoints({
			character: createCharacterRecord(),
			characterClasses: [{ ...characterClass, baseHp: 0 }],
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "TRAINING_DEFENDER_DERIVED_STATS_FAILED",
			details: {
				characterId: "session-character-1",
				derivedStatsFailureCode: "INVALID_DERIVED_STATS_INPUT",
			},
		});
	});
});

function createCharacterRecord(
	patch: Partial<CharacterRecord> = {},
): CharacterRecord {
	return {
		id: "session-character-1",
		name: "Lia",
		concept: "Sentinela de teste",
		ancestryId: "human",
		backgroundId: "acolyte",
		classId: "vanguard",
		conflict: 2,
		createdAt: TEST_TIMESTAMP,
		interaction: 2,
		level: 1,
		mental: 2,
		physical: 2,
		resistance: 2,
		social: 2,
		updatedAt: TEST_TIMESTAMP,
		...patch,
	};
}

function createDamageResult(input: {
	readonly finalDamage: number;
}): DamagePipelineResult {
	return {
		damageType: "physical",
		baseDamage: input.finalDamage,
		afterCritical: input.finalDamage,
		afterReduction: input.finalDamage,
		finalDamage: input.finalDamage,
		appliedAffinities: [],
		breakdown: {
			baseDiceTotal: 4,
			matrixValue: 2,
			extraModifierTotal: 0,
			criticalMultiplier: 1,
			damageReduction: 0,
			vulnerabilityBonusDamage: 0,
		},
	};
}

function expectTrainingHpSuccess(
	result: ReturnType<typeof createCombatTrainingDefenderHitPoints>,
) {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	return result.error as never;
}

function expectTrainingDamageSuccess(
	result: ReturnType<typeof applyCombatTrainingDefenderDamage>,
) {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	return result.error as never;
}
