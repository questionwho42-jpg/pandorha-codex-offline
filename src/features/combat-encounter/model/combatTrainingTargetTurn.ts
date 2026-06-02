import type { CombatTrainingTarget } from "./combatTrainingTargetCatalog";

export interface CombatTrainingTargetTurnLogInput {
	readonly activeActorId: string;
	readonly target: CombatTrainingTarget;
}

export function createCombatTrainingTargetTurnLog(
	input: CombatTrainingTargetTurnLogInput,
): string | null {
	if (input.activeActorId !== input.target.id) {
		return null;
	}

	return `${input.target.label} mant\u00e9m posi\u00e7\u00e3o. O alvo de treino ainda n\u00e3o possui IA nesta vers\u00e3o.`;
}
