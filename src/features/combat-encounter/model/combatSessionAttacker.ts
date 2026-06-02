import type { CharacterRecord } from "$lib/entities/character";
import type { CombatEncounterActorRef } from "./combatEncounterTypes";

export type CombatAttackerSource = "training" | "sessionCharacter";

export interface CombatAttackerOption extends CombatEncounterActorRef {
	readonly source: CombatAttackerSource;
}

export const DEFAULT_COMBAT_TRAINING_ATTACKER: CombatAttackerOption = {
	id: "aria",
	label: "Aria",
	source: "training",
};

export function toCombatEncounterActorFromCharacter(
	character: CharacterRecord,
): CombatAttackerOption {
	return {
		id: character.id,
		label: character.name,
		source: "sessionCharacter",
	};
}

export function createCombatAttackerOptions(
	characters: readonly CharacterRecord[],
): readonly CombatAttackerOption[] {
	return [
		DEFAULT_COMBAT_TRAINING_ATTACKER,
		...characters.map(toCombatEncounterActorFromCharacter),
	];
}

export function findCombatAttackerOptionById(
	options: readonly CombatAttackerOption[],
	id: string,
): CombatAttackerOption | undefined {
	return options.find((option) => option.id === id);
}
