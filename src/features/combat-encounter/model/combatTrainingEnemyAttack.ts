import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";
import {
	type CharacterRecord,
	characterSelectSchema,
} from "$lib/entities/character";
import type { EquipmentLoadoutDefenseProfile } from "$lib/entities/equipment";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	ResolutionFailure,
	ResolutionResult,
} from "$lib/shared/resolution";
import {
	combatEncounterActorSchema,
	formatCombatEncounterIssues,
} from "./combatEncounterSchemas";
import type { CombatEncounterActorRef } from "./combatEncounterTypes";

export type CombatTrainingEnemyAttackFailureCode =
	| "INVALID_TRAINING_ENEMY_ATTACK_INPUT"
	| "RESOLUTION_FAILED";

export type CombatTrainingEnemyAttackFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface CombatTrainingEnemyAttackFailure {
	readonly code: CombatTrainingEnemyAttackFailureCode;
	readonly message: string;
	readonly details?: CombatTrainingEnemyAttackFailureDetails;
	readonly cause?: ResolutionFailure;
}

export interface CombatTrainingEnemyDefenseProfile {
	readonly armorBonus: number;
	readonly armorClass: number;
	readonly auditLabel: string;
	readonly baseArmorClass: 10;
	readonly equipmentBonus: number;
	readonly levelBonus: number;
	readonly limitedAxisLabel: "Físico";
	readonly limitedAxisValue: number;
	readonly shieldBonus: number;
	readonly summaryLabel: string;
}

export interface CombatTrainingEnemyDefenseProfileInput {
	readonly defenderCharacter: CharacterRecord;
	readonly defenderDefenseProfile: EquipmentLoadoutDefenseProfile | null;
}

export interface CombatTrainingEnemyAttackInput
	extends CombatTrainingEnemyDefenseProfileInput {
	readonly attacker: CombatEncounterActorRef;
	readonly defender: CombatEncounterActorRef;
}

export interface CombatTrainingEnemyAttackResult {
	readonly attacker: CombatEncounterActorRef;
	readonly defender: CombatEncounterActorRef;
	readonly defenderArmorClass: CombatTrainingEnemyDefenseProfile;
	readonly log: readonly string[];
	readonly resolution: ResolutionResult;
	readonly wasHit: boolean;
}

const armorClassBonusSchema = z.number().int().min(0).max(100);
const equipmentDefenseItemSchema = z
	.object({
		armorClassBonus: armorClassBonusSchema,
		id: z
			.string()
			.regex(/^[a-z][a-z0-9-]*$/)
			.max(80),
		kind: z.enum(["armor", "shield"]),
		label: z.string().trim().min(1).max(120),
	})
	.strict();

const equipmentDefenseProfileSchema = z
	.object({
		armor: equipmentDefenseItemSchema.nullable(),
		armorClassBonus: armorClassBonusSchema,
		shield: equipmentDefenseItemSchema.nullable(),
		summaryLabel: z.string().trim().min(1).max(240),
	})
	.strict();

export const combatTrainingEnemyDefenseProfileInputSchema = z
	.object({
		defenderCharacter: characterSelectSchema,
		defenderDefenseProfile: equipmentDefenseProfileSchema.nullable(),
	})
	.strict();

export const combatTrainingEnemyAttackInputSchema =
	combatTrainingEnemyDefenseProfileInputSchema
		.extend({
			attacker: combatEncounterActorSchema,
			defender: combatEncounterActorSchema,
		})
		.strict();

/**
 * @rule docs/system/survival/00-mecanicas-fundamentais.md - CA = 10 + Nivel + Bonus de Armadura + Eixo Limitado + Escudo.
 * @rule docs/system/survival/04-arsenal-e-economia.md - Couro +2 CA, Placas +5 CA, Escudo Redondo +1 CA.
 */
export function createCombatTrainingEnemyDefenseProfile(
	input: unknown,
): Result<CombatTrainingEnemyDefenseProfile, CombatTrainingEnemyAttackFailure> {
	const parsed = combatTrainingEnemyDefenseProfileInputSchema.safeParse(input);
	if (!parsed.success) {
		return fail({
			code: "INVALID_TRAINING_ENEMY_ATTACK_INPUT",
			message: "Training enemy defense profile input failed validation.",
			details: {
				issues: formatCombatTrainingEnemyAttackIssues(parsed.error.issues),
			},
		});
	}

	return ok({
		...createValidatedCombatTrainingEnemyDefenseProfile(parsed.data),
	});
}

export function createValidatedCombatTrainingEnemyDefenseProfile(
	input: CombatTrainingEnemyDefenseProfileInput,
): CombatTrainingEnemyDefenseProfile {
	const { defenderCharacter, defenderDefenseProfile } = input;
	const armorBonus = defenderDefenseProfile?.armor?.armorClassBonus ?? 0;
	const shieldBonus = defenderDefenseProfile?.shield?.armorClassBonus ?? 0;
	const equipmentBonus = armorBonus + shieldBonus;
	const armorClass =
		10 + defenderCharacter.level + defenderCharacter.physical + equipmentBonus;

	return {
		armorBonus,
		armorClass,
		auditLabel: `CA ${armorClass} = 10 base + nível ${defenderCharacter.level} + Físico ${defenderCharacter.physical} + armadura ${armorBonus} + escudo ${shieldBonus}`,
		baseArmorClass: 10,
		equipmentBonus,
		levelBonus: defenderCharacter.level,
		limitedAxisLabel: "Físico",
		limitedAxisValue: defenderCharacter.physical,
		shieldBonus,
		summaryLabel: `CA contra treino: ${armorClass} (10 + nível ${defenderCharacter.level} + Físico ${defenderCharacter.physical} + defesa equipada ${equipmentBonus})`,
	};
}

export function formatCombatTrainingEnemyAttackIssues(
	issues: readonly ZodIssue[],
): readonly string[] {
	return [...formatCombatEncounterIssues(issues)];
}
