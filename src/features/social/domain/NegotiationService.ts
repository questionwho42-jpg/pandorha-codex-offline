import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	SocialAction,
	SocialConflictState,
	SocialTarget,
} from "../model-api";
import {
	type SocialCombatEvent,
	SocialCombatService,
} from "./SocialCombatService";
import {
	BasicSocialAttack,
	EtherContractDecorator,
	GroupSenseDecorator,
	type ISocialAttack,
	MysticCharmDecorator,
	VenomousFlatteryDecorator,
} from "./SocialManeuvers";

export interface NegotiationRoundInput {
	readonly oratorId: string;
	readonly axis: string;
	readonly rollValue: number;
	readonly dc: number;
	readonly maneuver:
		| "none"
		| "group_sense"
		| "venomous_flattery"
		| "mystic_charm"
		| "ether_contract";
	readonly target: SocialTarget;
	readonly conflictState: SocialConflictState;
	readonly events: readonly SocialCombatEvent[];
}

export interface NegotiationRoundResult {
	readonly target: SocialTarget;
	readonly conflictState: SocialConflictState;
	readonly events: readonly SocialCombatEvent[];
	readonly isCompleted: boolean; // True if persuasion track completed
	readonly isFailed: boolean; // True if patience reserve depleted
	readonly recoilDamage: boolean; // True if ether contract failed
	readonly logMessage: string;
}

export interface NegotiationFailure {
	readonly code: "PATIENCE_EXHAUSTED" | "NEGOTIATION_ERROR";
	readonly message: string;
}

export class NegotiationService {
	private readonly combatService: SocialCombatService;

	public constructor(
		clockOrCombatService?: { now(): string } | SocialCombatService,
	) {
		if (clockOrCombatService instanceof SocialCombatService) {
			this.combatService = clockOrCombatService;
		} else {
			this.combatService = new SocialCombatService(
				clockOrCombatService ?? { now: () => new Date().toISOString() },
			);
		}
	}

	/**
	 * Resolves a negotiation round applying active social combat rules,
	 * social fatigue, and updating both the patience reserve and persuasion track.
	 */
	public resolveRound(
		input: NegotiationRoundInput,
	): Result<NegotiationRoundResult, NegotiationFailure> {
		if (input.target.patience.currentValue <= 0) {
			return fail({
				code: "PATIENCE_EXHAUSTED",
				message: "O alvo já perdeu toda a paciência e não quer negociar.",
			});
		}

		// 1. Calculate Social Fatigue: -2 penalty if the same axis was used in the previous round
		let socialFatiguePenalty = 0;
		if (input.events.length > 0) {
			const lastEvent = input.events[input.events.length - 1];
			if (lastEvent && lastEvent.message.includes(input.axis)) {
				socialFatiguePenalty = -2;
			}
		}

		// Calculate initial margin of success before decorators
		const baseMargin = input.rollValue - input.dc + socialFatiguePenalty;

		// 2. Build Decorator Chain for Active Maneuver
		let attackChain: ISocialAttack = new BasicSocialAttack();
		if (input.maneuver === "group_sense") {
			attackChain = new GroupSenseDecorator(attackChain);
		} else if (input.maneuver === "venomous_flattery") {
			attackChain = new VenomousFlatteryDecorator(attackChain);
		} else if (input.maneuver === "mystic_charm") {
			attackChain = new MysticCharmDecorator(attackChain);
		} else if (input.maneuver === "ether_contract") {
			attackChain = new EtherContractDecorator(attackChain);
		}

		// 3. Execute Attack Chain to modify margin and target state
		const attackContext = attackChain.execute({
			margin: baseMargin,
			target: { ...input.target },
			generatedFavors: 0,
			log: [],
		});

		const finalMargin = attackContext.margin;
		let updatedTarget = attackContext.target;
		const recoilDamage = (attackContext as any).recoilDamage === true;

		// 4. Apply Combat Service logic to reduce patience (as HP damage)
		const action: SocialAction = {
			id: `negotiation-${Date.now()}`,
			type: "persuasion",
			baseAxis: input.axis,
			dc: input.dc,
			performerId: input.oratorId,
			targetId: updatedTarget.id,
		};

		// Run the underlying social combat calculation
		const combatResult = this.combatService.applyArgument(
			updatedTarget,
			action,
			finalMargin,
			input.events,
		);

		if (!combatResult.success) {
			return fail({
				code: "NEGOTIATION_ERROR",
				message: combatResult.error.message,
			});
		}

		updatedTarget = combatResult.data.target;
		const newEvents = combatResult.data.events;

		// 5. Update Persuasion Track or reduce NPC patience on failure
		let trackIncrement = 0;
		let patienceReduction = 0;

		if (finalMargin >= 0) {
			// Success: advance persuasion track
			if (finalMargin >= 5) {
				trackIncrement = 2; // Critical Success
			} else {
				trackIncrement = 1; // Standard Success
			}
		} else {
			// Failure: reduce patience reserve
			patienceReduction = Math.abs(finalMargin);
		}

		// Update persuasion segments
		const completedSegments = Math.min(
			updatedTarget.persuasion.totalSegments,
			updatedTarget.persuasion.completedSegments + trackIncrement,
		);

		updatedTarget = {
			...updatedTarget,
			patience: {
				...updatedTarget.patience,
				currentValue: Math.max(
					0,
					updatedTarget.patience.currentValue - patienceReduction,
				),
			},
			persuasion: {
				...updatedTarget.persuasion,
				completedSegments,
			},
		};

		// 6. Build logs and check completion flags
		const isCompleted =
			completedSegments >= updatedTarget.persuasion.totalSegments;
		const isFailed = updatedTarget.patience.currentValue <= 0;

		let logMessage = `${input.oratorId} argumentou com ${input.axis}. `;
		if (socialFatiguePenalty < 0) {
			logMessage += "⚠️ Fadiga Social aplicada (-2 na margem). ";
		}
		if (finalMargin >= 0) {
			logMessage += `Sucesso! Trilha avançou em +${trackIncrement} segmentos.`;
		} else {
			logMessage += `Falha! Paciência do alvo reduzida em -${patienceReduction}.`;
		}

		if (attackContext.log.length > 0) {
			logMessage += " " + attackContext.log.join(" ");
		}

		// Update round counter in conflict state
		const updatedConflictState: SocialConflictState = {
			...input.conflictState,
			currentRound: input.conflictState.currentRound + 1,
			bargainOffers:
				input.maneuver === "group_sense" && finalMargin >= 2
					? [
							...input.conflictState.bargainOffers,
							{
								id: `favor-${Date.now()}`,
								type: "favor",
								favorType: "minor",
								valueInGold: 100,
								description: "Favor Menor (Senso de Grupo)",
							},
						]
					: input.conflictState.bargainOffers,
		};

		return ok({
			target: updatedTarget,
			conflictState: updatedConflictState,
			events: newEvents,
			isCompleted,
			isFailed,
			recoilDamage,
			logMessage,
		});
	}
}
