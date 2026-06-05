import {
	CharacterDerivedStatsService,
	type CharacterRecord,
} from "$lib/entities/character";
import type { CharacterClassRecord } from "$lib/entities/character-class";
import type { DamagePipelineResult } from "$lib/shared/damage";
import { fail, ok, type Result } from "$lib/shared/lib/result";

export type CombatTrainingDefenderHitPointsFailureCode =
	| "TRAINING_DEFENDER_CLASS_NOT_FOUND"
	| "TRAINING_DEFENDER_DERIVED_STATS_FAILED";

export type CombatTrainingDefenderHitPointsFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface CombatTrainingDefenderHitPointsFailure {
	readonly code: CombatTrainingDefenderHitPointsFailureCode;
	readonly message: string;
	readonly details?: CombatTrainingDefenderHitPointsFailureDetails;
}

export interface CombatTrainingDefenderHitPointsState {
	readonly characterId: string;
	readonly characterLabel: string;
	readonly currentHitPoints: number;
	readonly isDefeated: boolean;
	readonly maxHitPoints: number;
	readonly summaryLabel: string;
}

export interface CombatTrainingDefenderHitPointsInput {
	readonly character: CharacterRecord;
	readonly characterClasses: readonly CharacterClassRecord[];
}

export interface CombatTrainingDefenderDamageInput {
	readonly state: CombatTrainingDefenderHitPointsState;
	readonly incomingDamage: DamagePipelineResult | null;
}

export interface CombatTrainingDefenderDamageResult {
	readonly state: CombatTrainingDefenderHitPointsState;
	readonly log: readonly string[];
}

const derivedStatsService = new CharacterDerivedStatsService();

/**
 * @rule docs/system/survival/05-00-regras-de-classe.md - HP = [HP Base da Classe + Fisico + Resistencia] x Nivel Atual.
 * @rule docs/system/survival/00-mecanicas-fundamentais.md - 0 HP starts a separate death-state flow, intentionally out of this training slice.
 */
export function createCombatTrainingDefenderHitPoints(
	input: CombatTrainingDefenderHitPointsInput,
): Result<
	CombatTrainingDefenderHitPointsState,
	CombatTrainingDefenderHitPointsFailure
> {
	const characterClass = input.characterClasses.find(
		(candidate) => candidate.id === input.character.classId,
	);
	if (!characterClass) {
		return fail({
			code: "TRAINING_DEFENDER_CLASS_NOT_FOUND",
			message: "Training defender class could not be resolved.",
			details: {
				characterClassId: input.character.classId,
				characterId: input.character.id,
			},
		});
	}

	const derivedStats = derivedStatsService.calculateCharacterDerivedStats({
		character: input.character,
		characterClass: {
			id: characterClass.id,
			baseHp: characterClass.baseHp,
		},
	});
	if (!derivedStats.success) {
		return fail({
			code: "TRAINING_DEFENDER_DERIVED_STATS_FAILED",
			message: "Training defender HP could not be derived.",
			details: {
				characterId: input.character.id,
				derivedStatsFailureCode: derivedStats.error.code,
			},
		});
	}

	return ok(
		createState({
			characterId: input.character.id,
			characterLabel: input.character.name,
			currentHitPoints: derivedStats.data.maxHp,
			maxHitPoints: derivedStats.data.maxHp,
		}),
	);
}

export function applyCombatTrainingDefenderDamage(
	input: CombatTrainingDefenderDamageInput,
): Result<
	CombatTrainingDefenderDamageResult,
	CombatTrainingDefenderHitPointsFailure
> {
	if (input.incomingDamage === null) {
		return ok({ state: input.state, log: [] });
	}

	const nextHitPoints = Math.max(
		0,
		input.state.currentHitPoints - input.incomingDamage.finalDamage,
	);
	const state = createState({
		...input.state,
		currentHitPoints: nextHitPoints,
	});
	const suffix = state.isDefeated
		? "Moribundo e Inconsciente não foram aplicados nesta fatia."
		: "HP real da ficha permanece intacto.";

	return ok({
		state,
		log: [
			`${input.state.characterLabel} sofreu ${input.incomingDamage.finalDamage} de dano de treino. HP de treino: ${state.currentHitPoints}/${state.maxHitPoints}. ${suffix}`,
		],
	});
}

function createState(input: {
	readonly characterId: string;
	readonly characterLabel: string;
	readonly currentHitPoints: number;
	readonly maxHitPoints: number;
}): CombatTrainingDefenderHitPointsState {
	return {
		characterId: input.characterId,
		characterLabel: input.characterLabel,
		currentHitPoints: input.currentHitPoints,
		isDefeated: input.currentHitPoints <= 0,
		maxHitPoints: input.maxHitPoints,
		summaryLabel: `HP de treino de ${input.characterLabel}: ${input.currentHitPoints}/${input.maxHitPoints}`,
	};
}
