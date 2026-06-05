import { describe, expect, it } from "vitest";
import type { CharacterRecord } from "$lib/entities/character";
import type { EquipmentLoadoutDefenseProfile } from "$lib/entities/equipment";
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
import { ResolutionService } from "$lib/shared/resolution";
import { CombatTrainingEnemyAttackService } from "../domain/CombatTrainingEnemyAttackService";
import {
	type CombatTrainingEnemyAttackResult,
	createCombatTrainingEnemyDefenseProfile,
} from "../model/combatTrainingEnemyAttack";

describe("createCombatTrainingEnemyDefenseProfile", () => {
	it("calculates equipped CA from base, level, physical axis, armor, and shield", () => {
		const result = createCombatTrainingEnemyDefenseProfile({
			defenderCharacter: createCharacterRecord(),
			defenderDefenseProfile: createDefenseProfile(),
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data).toEqual({
			armorBonus: 2,
			armorClass: 16,
			auditLabel:
				"CA 16 = 10 base + nível 1 + Físico 2 + armadura 2 + escudo 1",
			baseArmorClass: 10,
			equipmentBonus: 3,
			levelBonus: 1,
			limitedAxisLabel: "Físico",
			limitedAxisValue: 2,
			shieldBonus: 1,
			summaryLabel:
				"CA contra treino: 16 (10 + nível 1 + Físico 2 + defesa equipada 3)",
		});
	});

	it("keeps unarmored session characters valid for a training attack target", () => {
		const result = createCombatTrainingEnemyDefenseProfile({
			defenderCharacter: createCharacterRecord(),
			defenderDefenseProfile: null,
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.armorClass).toBe(13);
		expect(result.data.equipmentBonus).toBe(0);
		expect(result.data.summaryLabel).toBe(
			"CA contra treino: 13 (10 + nível 1 + Físico 2 + defesa equipada 0)",
		);
	});
});

describe("CombatTrainingEnemyAttackService", () => {
	it("rejects structurally invalid training enemy attack input", () => {
		const service = createService([0.45]);

		const result = service.resolveTrainingEnemyAttack({
			attacker: { id: "training-guard", label: "" },
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "INVALID_TRAINING_ENEMY_ATTACK_INPUT",
			message: "Training enemy attack input failed validation.",
		});
	});

	it("resolves the training target attack against the equipped CA without mutating HP", () => {
		const service = createService([0.45]);

		const result = service.resolveTrainingEnemyAttack({
			attacker: { id: "training-guard", label: "Guarda de Treino" },
			defender: { id: "session-character-1", label: "Lia" },
			defenderCharacter: createCharacterRecord(),
			defenderDefenseProfile: createDefenseProfile(),
		});
		const attack = expectTrainingEnemyAttackSuccess(result);

		expect(attack.defenderArmorClass.armorClass).toBe(16);
		expect(attack.wasHit).toBe(true);
		expect(attack.incomingDamage).toMatchObject({
			damageType: "physical",
			baseDamage: 6,
			afterCritical: 6,
			afterReduction: 6,
			finalDamage: 6,
			appliedAffinities: [],
			breakdown: {
				baseDiceTotal: 4,
				matrixValue: 2,
				extraModifierTotal: 0,
				criticalMultiplier: 1,
				damageReduction: 0,
				vulnerabilityBonusDamage: 0,
			},
		});
		expect(attack.resolution).toMatchObject({
			dc: 16,
			degree: "successWithCost",
			total: 15,
		});
		expect(attack.log).toEqual([
			"Guarda de Treino atacou Lia em treino contra CA 16.",
			"Resultado do alvo: sucesso com custo, total 15 contra CA 16.",
			"Dano de treino calculado: 6 físico. HP real ainda não foi alterado.",
		]);
	});

	it("records a regular success when the character has no equipped defense", () => {
		const service = createService([0.45]);

		const result = service.resolveTrainingEnemyAttack({
			attacker: { id: "training-guard", label: "Guarda de Treino" },
			defender: { id: "session-character-1", label: "Lia" },
			defenderCharacter: createCharacterRecord(),
			defenderDefenseProfile: null,
		});
		const attack = expectTrainingEnemyAttackSuccess(result);

		expect(attack.defenderArmorClass.armorClass).toBe(13);
		expect(attack.wasHit).toBe(true);
		expect(attack.resolution).toMatchObject({
			dc: 13,
			degree: "success",
			total: 15,
		});
		expect(attack.log[1]).toContain("sucesso, total 15 contra CA 13");
	});

	it("records a critical success label for a strong training target roll", () => {
		const service = createService([0.95]);

		const result = service.resolveTrainingEnemyAttack({
			attacker: { id: "training-guard", label: "Guarda de Treino" },
			defender: { id: "session-character-1", label: "Lia" },
			defenderCharacter: createCharacterRecord(),
			defenderDefenseProfile: null,
		});
		const attack = expectTrainingEnemyAttackSuccess(result);

		expect(attack.wasHit).toBe(true);
		expect(attack.incomingDamage).toMatchObject({
			baseDamage: 6,
			afterCritical: 12,
			finalDamage: 12,
			breakdown: { criticalMultiplier: 2 },
		});
		expect(attack.resolution).toMatchObject({
			degree: "criticalSuccess",
			total: 25,
		});
		expect(attack.log[1]).toContain("sucesso crítico, total 25");
	});

	it("records a clean miss when equipped CA beats the training attack by more than the cost margin", () => {
		const service = createService([0.2]);

		const result = service.resolveTrainingEnemyAttack({
			attacker: { id: "training-guard", label: "Guarda de Treino" },
			defender: { id: "session-character-1", label: "Lia" },
			defenderCharacter: createCharacterRecord({ physical: 4, level: 2 }),
			defenderDefenseProfile: createDefenseProfile({
				armorClassBonus: 6,
				armorBonus: 5,
				shieldBonus: 1,
			}),
		});
		const attack = expectTrainingEnemyAttackSuccess(result);

		expect(attack.defenderArmorClass.armorClass).toBe(22);
		expect(attack.wasHit).toBe(false);
		expect(attack.incomingDamage).toBeNull();
		expect(attack.resolution).toMatchObject({
			dc: 22,
			degree: "failure",
			total: 10,
		});
		expect(attack.log[1]).toContain("falha, total 10 contra CA 22");
	});

	it("rejects a defender ref that is not the selected session character", () => {
		const service = createService([0.45]);

		const result = service.resolveTrainingEnemyAttack({
			attacker: { id: "training-guard", label: "Guarda de Treino" },
			defender: { id: "aria", label: "Aria" },
			defenderCharacter: createCharacterRecord(),
			defenderDefenseProfile: createDefenseProfile(),
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "INVALID_TRAINING_ENEMY_ATTACK_INPUT",
			message:
				"Training enemy attack defender must match the selected session character.",
		});
	});

	it("returns a resolution failure when the dice service cannot resolve the attack", () => {
		const service = createService([Number.NaN]);

		const result = service.resolveTrainingEnemyAttack({
			attacker: { id: "training-guard", label: "Guarda de Treino" },
			defender: { id: "session-character-1", label: "Lia" },
			defenderCharacter: createCharacterRecord(),
			defenderDefenseProfile: createDefenseProfile(),
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "RESOLUTION_FAILED",
			details: { resolutionFailureCode: "DICE_ROLL_FAILED" },
		});
	});

	it("returns a damage pipeline failure when incoming training damage cannot be calculated", () => {
		const service = createService([0.45], new FailingDamagePipeline());

		const result = service.resolveTrainingEnemyAttack({
			attacker: { id: "training-guard", label: "Guarda de Treino" },
			defender: { id: "session-character-1", label: "Lia" },
			defenderCharacter: createCharacterRecord(),
			defenderDefenseProfile: createDefenseProfile(),
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "DAMAGE_PIPELINE_FAILED",
			details: { damageFailureCode: "INVALID_DAMAGE_INPUT" },
		});
	});
});

function createService(
	sequence: readonly number[],
	damageService:
		| DamagePipelineService
		| FailingDamagePipeline = new DamagePipelineService(),
): CombatTrainingEnemyAttackService {
	return new CombatTrainingEnemyAttackService(
		new ResolutionService(
			new DiceService(
				new SequenceDiceRng(sequence),
				createSequentialDiceRollIdProvider("enemy-attack-roll"),
				createDeterministicDiceClock("2026-06-02T15:00:00.000Z"),
			),
		),
		damageService,
	);
}

function createCharacterRecord(
	patch: Partial<CharacterRecord> = {},
): CharacterRecord {
	return {
		id: "session-character-1",
		name: "Lia",
		concept: "Sentinela de teste",
		ancestryId: "human",
		classId: "vanguard",
		backgroundId: "acolyte",
		level: 1,
		physical: 2,
		mental: 2,
		social: 2,
		conflict: 2,
		interaction: 2,
		resistance: 2,
		createdAt: "2026-05-06T18:19:31.000Z",
		updatedAt: "2026-05-06T18:19:31.000Z",
		...patch,
	};
}

function createDefenseProfile(
	input: {
		readonly armorClassBonus?: number;
		readonly armorBonus?: number;
		readonly shieldBonus?: number;
	} = {},
): EquipmentLoadoutDefenseProfile {
	const armorBonus = input.armorBonus ?? 2;
	const shieldBonus = input.shieldBonus ?? 1;

	return {
		armor: {
			armorClassBonus: armorBonus,
			id: "leather-armor",
			kind: "armor",
			label: "Armadura de Couro",
		},
		armorClassBonus: input.armorClassBonus ?? armorBonus + shieldBonus,
		shield: {
			armorClassBonus: shieldBonus,
			id: "round-shield",
			kind: "shield",
			label: "Escudo Redondo",
		},
		summaryLabel: `CA equipada +${input.armorClassBonus ?? armorBonus + shieldBonus}`,
	};
}

function expectTrainingEnemyAttackSuccess(
	result: ReturnType<
		CombatTrainingEnemyAttackService["resolveTrainingEnemyAttack"]
	>,
): CombatTrainingEnemyAttackResult {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	return result.error as never;
}

class FailingDamagePipeline {
	public calculateDamage(
		_input: unknown,
	): Result<DamagePipelineResult, DamagePipelineFailure> {
		return fail({
			code: "INVALID_DAMAGE_INPUT",
			message: "Damage pipeline test failure.",
		});
	}
}
