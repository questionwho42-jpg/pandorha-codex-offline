import type { CharacterRecord } from "$lib/entities/character";
import type {
	EquipmentWeaponAttackProfile,
	EquipmentWeaponMatrix,
} from "$lib/entities/equipment";
import type { DamageAffinity } from "$lib/shared/damage";
import type { CombatEncounterActorRef } from "./combatEncounterTypes";

export type CombatTrainingAttackProfileSource =
	| "equipmentWeapon"
	| "sessionCharacter"
	| "training";

export interface CombatTrainingAttackProfile {
	readonly affinities: readonly DamageAffinity[];
	readonly baseDiceTotal: number;
	readonly damageReduction: number;
	readonly damageType: string;
	readonly extraModifierTotal: number;
	readonly helperText: string;
	readonly matrixLabel: string;
	readonly matrixValue: number;
	readonly source: CombatTrainingAttackProfileSource;
	readonly summaryLabel: string;
	readonly vulnerabilityBonusDamage: number;
	readonly weaponDiceExpression?: string;
	readonly weaponLabel?: string;
}

export interface CombatTrainingAttackProfileInput {
	readonly attacker: CombatEncounterActorRef;
	readonly characters: readonly CharacterRecord[];
	readonly equippedWeapon?: EquipmentWeaponAttackProfile;
}

const TRAINING_BASE_DICE_TOTAL = 4;
const TRAINING_EXTRA_MODIFIER_TOTAL = 3;
const TRAINING_MATRIX_VALUE = 2;

export function createCombatTrainingAttackProfile(
	input: CombatTrainingAttackProfileInput,
): CombatTrainingAttackProfile {
	const selectedCharacter = input.characters.find(
		(character) => character.id === input.attacker.id,
	);

	if (!selectedCharacter) {
		return createProfile({
			helperText:
				"Aria usa um perfil fixo de treino. Personagens da sess\u00e3o usam a pr\u00f3pria Matriz F\u00edsica.",
			matrixValue: TRAINING_MATRIX_VALUE,
			source: "training",
		});
	}

	if (input.equippedWeapon) {
		return createEquipmentWeaponProfile({
			character: selectedCharacter,
			weapon: input.equippedWeapon,
		});
	}

	return createProfile({
		helperText:
			"Dano de treino usando a Matriz F\u00edsica da ficha selecionada. Arma, dado base e b\u00f4nus ainda s\u00e3o fixos.",
		matrixValue: selectedCharacter.physical,
		source: "sessionCharacter",
	});
}

function createProfile(input: {
	readonly helperText: string;
	readonly matrixValue: number;
	readonly source: CombatTrainingAttackProfileSource;
}): CombatTrainingAttackProfile {
	return {
		affinities: [],
		baseDiceTotal: TRAINING_BASE_DICE_TOTAL,
		damageReduction: 0,
		damageType: "physical",
		extraModifierTotal: TRAINING_EXTRA_MODIFIER_TOTAL,
		helperText: input.helperText,
		matrixLabel: `Matriz F\u00edsica: ${input.matrixValue}`,
		matrixValue: input.matrixValue,
		source: input.source,
		summaryLabel: `Dano: ${TRAINING_BASE_DICE_TOTAL} + F\u00edsico ${input.matrixValue} + b\u00f4nus ${TRAINING_EXTRA_MODIFIER_TOTAL}`,
		vulnerabilityBonusDamage: 0,
	};
}

function createEquipmentWeaponProfile(input: {
	readonly character: CharacterRecord;
	readonly weapon: EquipmentWeaponAttackProfile;
}): CombatTrainingAttackProfile {
	const matrix = getCharacterMatrix(input.character, input.weapon.matrix);

	return {
		affinities: [],
		baseDiceTotal: input.weapon.baseDiceTotal,
		damageReduction: 0,
		damageType: input.weapon.damageType,
		extraModifierTotal: 0,
		helperText: `Perfil de arma real usando ${input.weapon.label}. O dado ainda entra como total determin\u00edstico de treino; dano completo e durabilidade por ataque ficam para fase posterior.`,
		matrixLabel: `${matrix.label}: ${matrix.value}`,
		matrixValue: matrix.value,
		source: "equipmentWeapon",
		summaryLabel: `${input.weapon.label}: ${input.weapon.diceExpression} (treino ${input.weapon.baseDiceTotal}) + ${matrix.shortLabel} ${matrix.value}`,
		vulnerabilityBonusDamage: 0,
		weaponDiceExpression: input.weapon.diceExpression,
		weaponLabel: input.weapon.label,
	};
}

function getCharacterMatrix(
	character: CharacterRecord,
	matrix: EquipmentWeaponMatrix,
): {
	readonly label: string;
	readonly shortLabel: string;
	readonly value: number;
} {
	const values: Record<
		EquipmentWeaponMatrix,
		{
			readonly label: string;
			readonly shortLabel: string;
			readonly value: number;
		}
	> = {
		mental: {
			label: "Matriz Mental",
			shortLabel: "Mental",
			value: character.mental,
		},
		physical: {
			label: "Matriz F\u00edsica",
			shortLabel: "F\u00edsico",
			value: character.physical,
		},
		social: {
			label: "Matriz Social",
			shortLabel: "Social",
			value: character.social,
		},
	};

	return values[matrix];
}
