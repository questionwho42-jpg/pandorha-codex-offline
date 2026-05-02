import { PANDORHA_RULES } from "$lib/shared/game-rules";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CharacterCreateInput } from "./characterSchema";
import type { CharacterFailure, CharacterTier } from "./characterTypes";

const CHARACTER_LEVEL_TIERS: readonly {
	readonly tier: CharacterTier;
	readonly minLevel: number;
	readonly maxLevel: number;
	readonly cap: number;
}[] = [
	{
		tier: 1,
		minLevel: 1,
		maxLevel: 5,
		cap: PANDORHA_RULES.CHARACTER_CREATION.TIER_CAPS.TIER_1,
	},
	{
		tier: 2,
		minLevel: 6,
		maxLevel: 10,
		cap: PANDORHA_RULES.CHARACTER_CREATION.TIER_CAPS.TIER_2,
	},
	{
		tier: 3,
		minLevel: 11,
		maxLevel: 15,
		cap: PANDORHA_RULES.CHARACTER_CREATION.TIER_CAPS.TIER_3,
	},
	{
		tier: 4,
		minLevel: 16,
		maxLevel: 20,
		cap: PANDORHA_RULES.CHARACTER_CREATION.TIER_CAPS.TIER_4,
	},
];

const AXIS_FIELDS = ["physical", "mental", "social"] as const;
const APPLICATION_FIELDS = ["conflict", "interaction", "resistance"] as const;

type AxisField = (typeof AXIS_FIELDS)[number];
type ApplicationField = (typeof APPLICATION_FIELDS)[number];

/**
 * @description Resolve o Tier de aptidão usado pelos caps de Eixos e Aplicações.
 * @rule docs/system/survival/00-mecanicas-fundamentais.md - Criação de Personagem (Regra dos 6/6)
 */
export function getCharacterTierForLevel(
	level: number,
): Result<CharacterTier, CharacterFailure> {
	const tier = CHARACTER_LEVEL_TIERS.find(
		(candidate) => level >= candidate.minLevel && level <= candidate.maxLevel,
	);

	if (!tier) {
		return fail({
			code: "INVALID_CHARACTER_INPUT",
			message: "Character level must be between 1 and 20.",
			details: { level },
		});
	}

	return ok(tier.tier);
}

/**
 * @description Valida a distribuição 3x3 inicial de um personagem.
 * @rule docs/system/survival/00-mecanicas-fundamentais.md - Eixos, Aplicações e Caps por Tier
 */
export function validateCharacterCreationRules(
	input: CharacterCreateInput,
): Result<CharacterCreateInput, CharacterFailure> {
	const tier = CHARACTER_LEVEL_TIERS.find(
		(candidate) =>
			input.level >= candidate.minLevel && input.level <= candidate.maxLevel,
	);

	if (!tier) {
		return fail({
			code: "INVALID_CHARACTER_INPUT",
			message: "Character level must be between 1 and 20.",
			details: { level: input.level },
		});
	}

	const axisTotal = sumFields(input, AXIS_FIELDS);
	if (axisTotal !== PANDORHA_RULES.CHARACTER_CREATION.POINTS_EIXOS) {
		return fail({
			code: "INVALID_AXIS_DISTRIBUTION",
			message: "Character axes must spend exactly 6 points.",
			details: {
				expected: PANDORHA_RULES.CHARACTER_CREATION.POINTS_EIXOS,
				received: axisTotal,
			},
		});
	}

	const applicationTotal = sumFields(input, APPLICATION_FIELDS);
	if (
		applicationTotal !== PANDORHA_RULES.CHARACTER_CREATION.POINTS_APLICACOES
	) {
		return fail({
			code: "INVALID_APPLICATION_DISTRIBUTION",
			message: "Character applications must spend exactly 6 points.",
			details: {
				expected: PANDORHA_RULES.CHARACTER_CREATION.POINTS_APLICACOES,
				received: applicationTotal,
			},
		});
	}

	const axisCapFailure = findCapFailure(input, AXIS_FIELDS, tier.cap);
	if (axisCapFailure) {
		return axisCapFailure;
	}

	const applicationCapFailure = findCapFailure(
		input,
		APPLICATION_FIELDS,
		tier.cap,
	);
	if (applicationCapFailure) {
		return applicationCapFailure;
	}

	return ok(input);
}

function sumFields(
	input: CharacterCreateInput,
	fields: readonly (AxisField | ApplicationField)[],
): number {
	return fields.reduce((total, field) => total + input[field], 0);
}

function findCapFailure(
	input: CharacterCreateInput,
	fields: readonly (AxisField | ApplicationField)[],
	cap: number,
): Result<never, CharacterFailure> | null {
	const overCapField = fields.find((field) => input[field] > cap);

	if (!overCapField) {
		return null;
	}

	return fail({
		code: "INVALID_TIER_CAP",
		message: "Character aptitude exceeds the current Tier cap.",
		details: {
			field: overCapField,
			cap,
			received: input[overCapField],
		},
	});
}
