export type DamageAffinityKind = "resistance" | "vulnerability" | "immunity";

export interface DamageAffinity {
	readonly damageType: string;
	readonly kind: DamageAffinityKind;
}

export interface DamagePipelineInput {
	readonly damageType: string;
	readonly baseDiceTotal: number;
	readonly matrixValue: number;
	readonly extraModifierTotal: number;
	readonly isCriticalHit: boolean;
	readonly damageReduction: number;
	readonly vulnerabilityBonusDamage: number;
	readonly affinities: readonly DamageAffinity[];
}

export interface DamagePipelineBreakdown {
	readonly baseDiceTotal: number;
	readonly matrixValue: number;
	readonly extraModifierTotal: number;
	readonly criticalMultiplier: number;
	readonly damageReduction: number;
	readonly vulnerabilityBonusDamage: number;
}

export interface DamagePipelineResult {
	readonly damageType: string;
	readonly baseDamage: number;
	readonly afterCritical: number;
	readonly afterReduction: number;
	readonly finalDamage: number;
	readonly appliedAffinities: readonly DamageAffinityKind[];
	readonly breakdown: DamagePipelineBreakdown;
}

export type DamagePipelineFailureCode = "INVALID_DAMAGE_INPUT";

export type DamagePipelineFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface DamagePipelineFailure {
	readonly code: DamagePipelineFailureCode;
	readonly message: string;
	readonly details?: DamagePipelineFailureDetails;
}
