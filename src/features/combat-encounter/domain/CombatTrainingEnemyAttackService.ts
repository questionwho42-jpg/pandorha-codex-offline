import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { ResolutionDegree } from "$lib/shared/resolution";
import type { CombatResolutionPort } from "../model/combatEncounterTypes";
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

/**
 * @description Resolves a non-persistent training target attack against the selected session character armor class.
 */
export class CombatTrainingEnemyAttackService {
	public constructor(
		private readonly resolutionService: CombatResolutionPort,
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

		return ok({
			attacker,
			defender,
			defenderArmorClass,
			log: [
				`${attacker.label} atacou ${defender.label} em treino contra CA ${defenderArmorClass.armorClass}.`,
				`Resultado do alvo: ${formatDegreeLabel(resolution.data.degree)}, total ${resolution.data.total} contra CA ${defenderArmorClass.armorClass}. Dano e HP real não foram alterados.`,
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
