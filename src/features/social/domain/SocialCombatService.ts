import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { SocialAction, SocialTarget } from "../model-api";
import {
	applyMentalDamage,
	calculateFatiguePenalty,
} from "./DispositionCalculator";

export interface SocialCombatEvent {
	readonly id: string;
	readonly type: "argumentApplied" | "reactionTriggered";
	readonly actorId: string;
	readonly targetId: string;
	readonly message: string;
	readonly createdAt: string;
	readonly mentalDamage: number;
}

export interface SocialCombatState {
	readonly target: SocialTarget;
	readonly events: readonly SocialCombatEvent[];
	readonly isBroken: boolean;
	readonly log: readonly string[];
}

export interface SocialCombatFailure {
	readonly code: "INVALID_ARGUMENT" | "TARGET_BROKEN";
	readonly message: string;
}

export interface SocialCombatClock {
	now(): string;
}

export class SocialCombatService {
	public constructor(private readonly clock: SocialCombatClock) {}

	public applyArgument(
		target: SocialTarget,
		action: SocialAction,
		marginOfSuccess: number,
		events: readonly SocialCombatEvent[] = [],
	): Result<SocialCombatState, SocialCombatFailure> {
		if (target.patience.currentValue === 0) {
			return fail({
				code: "TARGET_BROKEN",
				message: "O alvo já teve sua paciência quebrada.",
			});
		}

		const fatiguePenalty = calculateFatiguePenalty(target, action.baseAxis);

		const effectiveDamage = Math.max(0, marginOfSuccess + fatiguePenalty);

		const updatedTarget = applyMentalDamage(target, effectiveDamage);

		const updatedFatigue = {
			...updatedTarget.fatigueCounters,
			[action.baseAxis]:
				(updatedTarget.fatigueCounters[action.baseAxis] ?? 0) + 1,
		};
		updatedTarget.fatigueCounters = updatedFatigue;

		const event: SocialCombatEvent = {
			id: `${action.id}-arg`,
			type: "argumentApplied",
			actorId: action.performerId,
			targetId: target.id,
			message: `${action.performerId} argumentou com ${action.baseAxis} e causou ${effectiveDamage} de dano mental.`,
			createdAt: this.clock.now(),
			mentalDamage: effectiveDamage,
		};

		const newEvents = [...events, event];

		return ok({
			target: updatedTarget,
			events: newEvents,
			isBroken: updatedTarget.patience.currentValue === 0,
			log: newEvents.map((e) => e.message),
		});
	}
}
