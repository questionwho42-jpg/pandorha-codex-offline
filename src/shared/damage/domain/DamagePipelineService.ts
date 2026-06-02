import { PANDORHA_RULES } from "$lib/shared/game-rules";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	damagePipelineInputSchema,
	formatDamagePipelineIssues,
} from "../model/damageSchemas";
import type {
	DamageAffinityKind,
	DamagePipelineFailure,
	DamagePipelineInput,
	DamagePipelineResult,
} from "../model/damageTypes";

/**
 * @rule docs/system/combat/18-tratado-de-dano.md - Dano Total = dados + matriz + modificadores; critico dobra antes de RD.
 * @rule docs/system/combat/03-01-imunidades-resistencias-e-vulnerabilidades.md - RD, resistencia, vulnerabilidade e imunidade.
 */
export class DamagePipelineService {
	public calculateDamage(
		input: unknown,
	): Result<DamagePipelineResult, DamagePipelineFailure> {
		const parsed = damagePipelineInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail({
				code: "INVALID_DAMAGE_INPUT",
				message: "Damage pipeline input failed validation.",
				details: { issues: formatDamagePipelineIssues(parsed.error.issues) },
			});
		}

		const baseDamage = calculateBaseDamage(parsed.data);
		const criticalMultiplier = parsed.data.isCriticalHit
			? PANDORHA_RULES.DAMAGE.CRITICAL_MULTIPLIER
			: 1;
		const afterCritical = baseDamage * criticalMultiplier;
		const afterReduction = Math.max(
			PANDORHA_RULES.DAMAGE.MIN_DAMAGE,
			afterCritical - parsed.data.damageReduction,
		);
		const appliedAffinities = collectMatchingAffinityKinds(parsed.data);
		const finalDamage = applyAffinities({
			afterReduction,
			vulnerabilityBonusDamage: parsed.data.vulnerabilityBonusDamage,
			appliedAffinities,
		});

		return ok({
			damageType: parsed.data.damageType,
			baseDamage,
			afterCritical,
			afterReduction,
			finalDamage,
			appliedAffinities,
			breakdown: {
				baseDiceTotal: parsed.data.baseDiceTotal,
				matrixValue: parsed.data.matrixValue,
				extraModifierTotal: parsed.data.extraModifierTotal,
				criticalMultiplier,
				damageReduction: parsed.data.damageReduction,
				vulnerabilityBonusDamage: parsed.data.vulnerabilityBonusDamage,
			},
		});
	}
}

function calculateBaseDamage(input: DamagePipelineInput): number {
	return input.baseDiceTotal + input.matrixValue + input.extraModifierTotal;
}

function collectMatchingAffinityKinds(
	input: DamagePipelineInput,
): readonly DamageAffinityKind[] {
	return [
		...new Set(
			input.affinities
				.filter((affinity) => affinity.damageType === input.damageType)
				.map((affinity) => affinity.kind),
		),
	];
}

function applyAffinities(input: {
	readonly afterReduction: number;
	readonly vulnerabilityBonusDamage: number;
	readonly appliedAffinities: readonly DamageAffinityKind[];
}): number {
	const affinitySet = new Set(input.appliedAffinities);

	if (affinitySet.has("immunity")) {
		return PANDORHA_RULES.DAMAGE.MIN_DAMAGE;
	}

	const hasResistance = affinitySet.has("resistance");
	const hasVulnerability = affinitySet.has("vulnerability");

	if (hasResistance && hasVulnerability) {
		return input.afterReduction;
	}

	if (hasResistance) {
		return Math.floor(
			input.afterReduction * PANDORHA_RULES.DAMAGE.RESISTANCE_MULTIPLIER,
		);
	}

	if (hasVulnerability) {
		return input.afterReduction + input.vulnerabilityBonusDamage;
	}

	return input.afterReduction;
}
