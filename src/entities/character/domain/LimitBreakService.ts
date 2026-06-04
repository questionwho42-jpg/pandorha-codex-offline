import { ok, type Result } from "$lib/shared/lib/result";
import type { CharacterRecord } from "../model/characterSchema";

export interface LimitBreakFailure {
	readonly code: "INVALID_TENSION_METER";
	readonly message: string;
}

export type LimitBreakTrigger =
	| "massive_damage"
	| "adjacent_ally_down"
	| "lethal_precision";

/**
 * @description Orquestra o acúmulo e consumo do medidor de tensão para Limit Break (Fase 70)
 */
export class LimitBreakService {
	public accumulateTension(
		character: CharacterRecord,
		trigger: LimitBreakTrigger,
	): Result<CharacterRecord, LimitBreakFailure> {
		let amount = 0;
		switch (trigger) {
			case "massive_damage":
				amount = 30;
				break;
			case "adjacent_ally_down":
				amount = 40;
				break;
			case "lethal_precision":
				amount = 30;
				break;
		}

		const currentTension = character.tensionMeter ?? 0;
		const newTension = Math.min(100, Math.max(0, currentTension + amount));

		const updated: CharacterRecord = {
			...character,
			tensionMeter: newTension,
			updatedAt: new Date().toISOString(),
		};

		return ok(updated);
	}

	public consumeLimitBreak(
		character: CharacterRecord,
	): Result<CharacterRecord, LimitBreakFailure> {
		const updated: CharacterRecord = {
			...character,
			tensionMeter: 0,
			updatedAt: new Date().toISOString(),
		};

		return ok(updated);
	}
}
