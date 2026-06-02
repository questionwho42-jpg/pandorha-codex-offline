import type { CharacterRecord } from "$lib/entities/character";
import type {
	EquipmentWeaponAttackProfile,
	EquipmentWeaponMatrix,
} from "$lib/entities/equipment";
import type { DamageAffinity } from "$lib/shared/damage";
import type {
	CombatEncounterActorRef,
	CombatWeaponDamageDiceExpression,
} from "./combatEncounterTypes";

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
	readonly weaponDiceExpression?: CombatWeaponDamageDiceExpression;
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
	const weaponDiceExpression = toSupportedWeaponDiceExpression(
		input.weapon.diceExpression,
	);
	const weaponDiceIsSupported = weaponDiceExpression !== null;
	const profile: CombatTrainingAttackProfile = {
		affinities: [],
		baseDiceTotal: input.weapon.baseDiceTotal,
		damageReduction: 0,
		damageType: input.weapon.damageType,
		extraModifierTotal: 0,
		helperText: weaponDiceIsSupported
			? `Perfil de arma real usando ${input.weapon.label}. O dado da arma ser\u00e1 rolado no ataque; dano completo e durabilidade por ataque ficam para fase posterior.`
			: `Perfil de arma real usando ${input.weapon.label}. Esta express\u00e3o de dado ainda n\u00e3o entra no contrato de rolagem; dano completo e durabilidade por ataque ficam para fase posterior.`,
		matrixLabel: `${matrix.label}: ${matrix.value}`,
		matrixValue: matrix.value,
		source: "equipmentWeapon",
		summaryLabel: `${input.weapon.label}: ${input.weapon.diceExpression} (${weaponDiceIsSupported ? "rolado no ataque" : "contrato pendente"}) + ${matrix.shortLabel} ${matrix.value}`,
		vulnerabilityBonusDamage: 0,
		weaponLabel: input.weapon.label,
	};

	return weaponDiceExpression === null
		? profile
		: {
				...profile,
				weaponDiceExpression,
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

function toSupportedWeaponDiceExpression(
	expression: string,
): CombatWeaponDamageDiceExpression | null {
	switch (expression) {
		case "1d4":
			return "1d4";
		case "1d8":
			return "1d8";
		default:
			return null;
	}
}
