import type { CharacterRecord } from "$lib/entities/character";
import {
	applyStatusEffects,
	BaseCharacterStats,
	type ICharacterStats,
} from "$lib/entities/character/domain/StatusEffectDecorator";
import type { CharacterClassRecord } from "$lib/entities/character-class";
import type { DamageAffinity } from "$lib/shared/damage";
import type { CharacterCraftedItemRecord } from "../../../entities/equipment/model/craftingSchema";
import {
	BaseCraftingDamageProfile,
	type ICraftingDamageProfile,
	RunedDamageDecorator,
	SharpDamageDecorator,
} from "../domain/CraftingDamageDecorators";
import type { CombatEncounterActorRef } from "./combatEncounterTypes";

export type CombatTrainingAttackProfileSource = "sessionCharacter" | "training";

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
}

export interface CombatTrainingAttackProfileInput {
	readonly attacker: CombatEncounterActorRef;
	readonly characters: readonly CharacterRecord[];
	readonly activeEffects?: readonly { type: string }[];
	readonly characterClasses?: readonly CharacterClassRecord[];
}

const TRAINING_BASE_DICE_TOTAL = 4;
const TRAINING_EXTRA_MODIFIER_TOTAL = 3;
const TRAINING_MATRIX_VALUE = 2;

export function createCombatTrainingAttackProfile(
	input: CombatTrainingAttackProfileInput,
	equippedWeapon?: CharacterCraftedItemRecord,
): CombatTrainingAttackProfile {
	const selectedCharacter = input.characters.find(
		(character) => character.id === input.attacker.id,
	);

	if (!selectedCharacter) {
		return {
			affinities: [],
			baseDiceTotal: TRAINING_BASE_DICE_TOTAL,
			damageReduction: 0,
			damageType: "physical",
			extraModifierTotal: TRAINING_EXTRA_MODIFIER_TOTAL,
			helperText:
				"Aria usa um perfil fixo de treino. Personagens da sessão usam a própria Matriz Física.",
			matrixLabel: `Matriz Física: ${TRAINING_MATRIX_VALUE}`,
			matrixValue: TRAINING_MATRIX_VALUE,
			source: "training",
			summaryLabel: `Dano: ${TRAINING_BASE_DICE_TOTAL} + Físico ${TRAINING_MATRIX_VALUE} + bônus ${TRAINING_EXTRA_MODIFIER_TOTAL}`,
			vulnerabilityBonusDamage: 0,
		};
	}

	// Montamos a cebola de decoradores de dano
	let profile: ICraftingDamageProfile = new BaseCraftingDamageProfile(
		TRAINING_BASE_DICE_TOTAL,
		TRAINING_EXTRA_MODIFIER_TOTAL,
		"physical",
		0,
	);

	if (equippedWeapon) {
		if (equippedWeapon.isSharp === 1) {
			profile = new SharpDamageDecorator(profile);
		}
		if (equippedWeapon.isRunic === 1) {
			profile = new RunedDamageDecorator(profile);
		}
	}

	const affinities: readonly DamageAffinity[] =
		profile.damageType === "ether"
			? (["ether"] as unknown as readonly DamageAffinity[])
			: [];

	// Aplicamos os decoradores de status debilitados
	const selectedClass = input.characterClasses?.find(
		(c) => c.id === selectedCharacter.classId,
	);
	let stats: ICharacterStats = new BaseCharacterStats(selectedCharacter, {
		id: selectedClass?.id ?? selectedCharacter.classId,
		baseHp: selectedClass?.baseHp ?? 10,
	});

	if (input.activeEffects) {
		stats = applyStatusEffects(stats, input.activeEffects);
	}

	return {
		affinities,
		baseDiceTotal: profile.baseDamage,
		damageReduction: 0,
		damageType: profile.damageType,
		extraModifierTotal: profile.extraModifier,
		helperText: equippedWeapon
			? `Atacando com ${equippedWeapon.label}. Propriedades: ${equippedWeapon.isSharp === 1 ? "[Afiada] " : ""}${equippedWeapon.isRunic === 1 ? "[Rúnica]" : ""}`
			: "Dano de treino usando a Matriz Física da ficha selecionada. Arma, dado base e bônus ainda são fixos.",
		matrixLabel: `Matriz Física: ${stats.physical}`,
		matrixValue: stats.physical,
		source: "sessionCharacter",
		summaryLabel: `Dano: ${profile.baseDamage} + Físico ${stats.physical} + bônus ${profile.extraModifier}${profile.extraMargin > 0 ? ` + margem ${profile.extraMargin}` : ""}`,
		vulnerabilityBonusDamage: 0,
	};
}
