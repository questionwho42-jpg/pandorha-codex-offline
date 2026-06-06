import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { ResolutionDegree } from "$lib/shared/resolution";
import type {
	CombatDamagePort,
	CombatResolutionPort,
} from "../model/combatEncounterTypes";
import {
	type CombatTrainingEnemyAttackFailure,
	type CombatTrainingEnemyAttackResult,
	combatTrainingEnemyAttackInputSchema,
	createValidatedCombatTrainingEnemyDefenseProfile,
	formatCombatTrainingEnemyAttackIssues,
} from "../model/combatTrainingEnemyAttack";

const TRAINING_ENEMY_ATTACK = {
	reason: "Ataque de treino do alvo",
	level: 1,
	axisValue: 2,
	applicationValue: 2,
	itemBonus: 0,
} as const;

const TRAINING_ENEMY_DAMAGE = {
	damageType: "physical",
	baseDiceTotal: 4,
	matrixValue: 2,
	extraModifierTotal: 0,
	damageReduction: 0,
	vulnerabilityBonusDamage: 0,
	affinities: [],
} as const;

/**
 * @description Resolves a non-persistent training target attack against the selected session character armor class.
 */
export class CombatTrainingEnemyAttackService {
	public constructor(
		private readonly resolutionService: CombatResolutionPort,
		private readonly damageService: CombatDamagePort,
	) {}

	public resolveTrainingEnemyAttack(
		input: unknown,
	): Result<CombatTrainingEnemyAttackResult, CombatTrainingEnemyAttackFailure> {
		const parsed = combatTrainingEnemyAttackInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail({
				code: "INVALID_TRAINING_ENEMY_ATTACK_INPUT",
				message: "Training enemy attack input failed validation.",
				details: {
					issues: formatCombatTrainingEnemyAttackIssues(parsed.error.issues),
				},
			});
		}

		const { attacker, defender, defenderCharacter, defenderDefenseProfile } =
			parsed.data;
		if (defender.id !== defenderCharacter.id) {
			return fail({
				code: "INVALID_TRAINING_ENEMY_ATTACK_INPUT",
				message:
					"Training enemy attack defender must match the selected session character.",
				details: {
					defenderId: defender.id,
					defenderCharacterId: defenderCharacter.id,
				},
			});
		}

		const defenderArmorClass = createValidatedCombatTrainingEnemyDefenseProfile(
			{
				defenderCharacter,
				defenderDefenseProfile,
			},
		);

		const resolution = this.resolutionService.resolveGlobalTest({
			...TRAINING_ENEMY_ATTACK,
			dc: defenderArmorClass.armorClass,
		});
		if (!resolution.success) {
			return fail({
				code: "RESOLUTION_FAILED",
				message: "Training enemy attack resolution failed.",
				details: { resolutionFailureCode: resolution.error.code },
				cause: resolution.error,
			});
		}

		const wasHit = resolution.data.degree !== "failure";
		if (!wasHit) {
			return ok({
				attacker,
				defender,
				defenderArmorClass,
				incomingDamage: null,
				log: [
					`${attacker.label} atacou ${defender.label} em treino contra CA ${defenderArmorClass.armorClass}.`,
					`Resultado do alvo: ${formatDegreeLabel(resolution.data.degree)}, total ${resolution.data.total} contra CA ${defenderArmorClass.armorClass}. Nenhum dano de treino foi calculado.`,
				],
				resolution: resolution.data,
				wasHit,
			});
		}

		const incomingDamage = this.damageService.calculateDamage({
			...TRAINING_ENEMY_DAMAGE,
			isCriticalHit: resolution.data.degree === "criticalSuccess",
		});
		if (!incomingDamage.success) {
			return fail({
				code: "DAMAGE_PIPELINE_FAILED",
				message: "Training enemy attack failed while calculating damage.",
				details: { damageFailureCode: incomingDamage.error.code },
				cause: incomingDamage.error,
			});
		}

		return ok({
			attacker,
			defender,
			defenderArmorClass,
			incomingDamage: incomingDamage.data,
			log: [
				`${attacker.label} atacou ${defender.label} em treino contra CA ${defenderArmorClass.armorClass}.`,
				`Resultado do alvo: ${formatDegreeLabel(resolution.data.degree)}, total ${resolution.data.total} contra CA ${defenderArmorClass.armorClass}.`,
				`Dano de treino calculado: ${incomingDamage.data.finalDamage} físico. HP real ainda não foi alterado.`,
			],
			resolution: resolution.data,
			wasHit,
		});
	}
}

function formatDegreeLabel(degree: ResolutionDegree): string {
	switch (degree) {
		case "criticalSuccess":
			return "sucesso crítico";
		case "success":
			return "sucesso";
		case "successWithCost":
			return "sucesso com custo";
		case "failure":
			return "falha";
	}
}
