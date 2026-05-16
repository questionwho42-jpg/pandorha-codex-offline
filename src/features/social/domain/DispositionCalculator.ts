import type { SocialTarget } from "../model-api";

const ATTITUDE_MODIFIERS: Record<SocialTarget["attitude"], number> = {
	friendly: 2,
	neutral: 0,
	skeptical: -2,
	hostile: -4,
	declared_enemy: -8,
};

export function calculatePatience(target: SocialTarget): number {
	const modifier = ATTITUDE_MODIFIERS[target.attitude] ?? 0;
	return target.mentalStat + target.resistanceStat + target.tier + modifier;
}

export function calculateTrackSegments(
	target: SocialTarget,
	complexityPoints: number,
): number {
	return target.tier + complexityPoints;
}

export function applyMentalDamage(
	target: SocialTarget,
	damageAmount: number,
): SocialTarget {
	const newPatienceValue = Math.max(
		0,
		target.patience.currentValue - damageAmount,
	);

	return {
		...target,
		patience: {
			...target.patience,
			currentValue: newPatienceValue,
		},
	};
}

export function calculateFatiguePenalty(
	target: SocialTarget,
	axis: string,
): number {
	const previousAttempts = target.fatigueCounters[axis] ?? 0;
	return previousAttempts === 0 ? 0 : previousAttempts * -2;
}
