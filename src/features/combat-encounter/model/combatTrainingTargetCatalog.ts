import type { DamageAffinity, DamageAffinityKind } from "$lib/shared/damage";
import type { CombatEncounterTargetState } from "./combatEncounterTypes";

export type CombatTrainingTargetDefenseAffinityKind = Extract<
	DamageAffinityKind,
	"immunity" | "resistance"
>;

export interface CombatTrainingTargetDefenseAffinity extends DamageAffinity {
	readonly kind: CombatTrainingTargetDefenseAffinityKind;
}

export interface CombatTrainingTarget extends CombatEncounterTargetState {
	readonly affinities: readonly CombatTrainingTargetDefenseAffinity[];
	readonly damageReduction: number;
	readonly description: string;
}

export const TRAINING_TARGETS: readonly CombatTrainingTarget[] = [
	{
		id: "training-guard",
		label: "Guarda de Treino",
		description: "Alvo equilibrado para validar o primeiro ataque.",
		currentHitPoints: 18,
		armorClass: 15,
		damageReduction: 0,
		affinities: [],
	},
	{
		id: "training-bulwark",
		label: "Baluarte de Treino",
		description: "Alvo resistente para validar falhas contra CA alta.",
		currentHitPoints: 24,
		armorClass: 20,
		damageReduction: 2,
		affinities: [{ damageType: "physical", kind: "immunity" }],
	},
	{
		id: "training-duelist",
		label: "Duelista de Treino",
		description: "Alvo ágil para validar reset e novo ataque.",
		currentHitPoints: 14,
		armorClass: 17,
		damageReduction: 1,
		affinities: [{ damageType: "physical", kind: "resistance" }],
	},
] as const;

export type CombatTrainingTargetId = (typeof TRAINING_TARGETS)[number]["id"];

export const DEFAULT_TRAINING_TARGET =
	TRAINING_TARGETS[0] as CombatTrainingTarget;

export function findTrainingTargetById(
	id: string,
): CombatTrainingTarget | undefined {
	return TRAINING_TARGETS.find((target) => target.id === id);
}

export function toCombatEncounterTargetState(
	target: CombatTrainingTarget,
): CombatEncounterTargetState {
	return {
		id: target.id,
		label: target.label,
		currentHitPoints: target.currentHitPoints,
		armorClass: target.armorClass,
	};
}
