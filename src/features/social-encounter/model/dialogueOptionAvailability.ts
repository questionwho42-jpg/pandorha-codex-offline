import type { DialogueOptionRecord } from "$lib/entities/dialogue-tree";
import type {
	WorldStateFlagView,
	WorldStateValue,
} from "$lib/entities/world-state";

export type DialogueOptionAvailabilityBlockKind =
	| "mental-hp"
	| "world-state"
	| "faction-fame";

export interface DialogueOptionAvailabilityBlock {
	readonly kind: DialogueOptionAvailabilityBlockKind;
	readonly blockedReason: string | null;
	readonly details: Readonly<Record<string, unknown>>;
}

export type DialogueOptionAvailability =
	| { readonly isAvailable: true; readonly block: null }
	| {
			readonly isAvailable: false;
			readonly block: DialogueOptionAvailabilityBlock;
	  };

export interface DialogueOptionAvailabilityInput {
	readonly factionFameLevel?: number | undefined;
	readonly mentalHpCurrent: number;
	readonly option: DialogueOptionRecord;
	readonly worldState?: readonly WorldStateFlagView[] | undefined;
}

export function evaluateDialogueOptionAvailability(
	input: DialogueOptionAvailabilityInput,
): DialogueOptionAvailability {
	const mentalHpBlock = evaluateMentalHpRequirement(input);
	if (mentalHpBlock) {
		return { isAvailable: false, block: mentalHpBlock };
	}

	const worldStateBlock = evaluateWorldStateRequirement(input);
	if (worldStateBlock) {
		return { isAvailable: false, block: worldStateBlock };
	}

	const fameBlock = evaluateFactionFameRequirement(input);
	if (fameBlock) {
		return { isAvailable: false, block: fameBlock };
	}

	return { isAvailable: true, block: null };
}

function evaluateMentalHpRequirement(
	input: DialogueOptionAvailabilityInput,
): DialogueOptionAvailabilityBlock | null {
	if (
		input.option.minimumMentalHp === undefined ||
		input.mentalHpCurrent >= input.option.minimumMentalHp
	) {
		return null;
	}

	return {
		kind: "mental-hp",
		blockedReason: input.option.blockedReason ?? null,
		details: {
			optionId: input.option.id,
			minimumMentalHp: input.option.minimumMentalHp,
			mentalHpCurrent: input.mentalHpCurrent,
		},
	};
}

function evaluateWorldStateRequirement(
	input: DialogueOptionAvailabilityInput,
): DialogueOptionAvailabilityBlock | null {
	if (input.option.requiredWorldStateKey === undefined) {
		return null;
	}

	const flag = input.worldState?.find(
		(candidate) => candidate.key === input.option.requiredWorldStateKey,
	);
	const expected = input.option.requiredWorldStateValue;
	const isSatisfied =
		flag !== undefined &&
		(expected === undefined || isSameWorldStateValue(flag.value, expected));
	if (isSatisfied) {
		return null;
	}

	return {
		kind: "world-state",
		blockedReason: input.option.worldStateBlockedReason ?? null,
		details: {
			optionId: input.option.id,
			requiredWorldStateKey: input.option.requiredWorldStateKey,
			requiredWorldStateValue: expected,
		},
	};
}

function evaluateFactionFameRequirement(
	input: DialogueOptionAvailabilityInput,
): DialogueOptionAvailabilityBlock | null {
	if (input.option.minimumFactionFame === undefined) {
		return null;
	}

	if (
		input.factionFameLevel !== undefined &&
		input.factionFameLevel >= input.option.minimumFactionFame
	) {
		return null;
	}

	return {
		kind: "faction-fame",
		blockedReason: input.option.factionFameBlockedReason ?? null,
		details: {
			optionId: input.option.id,
			minimumFactionFame: input.option.minimumFactionFame,
			factionFameLevel: input.factionFameLevel,
		},
	};
}

function isSameWorldStateValue(
	actual: WorldStateValue,
	expected: string | number | boolean,
): boolean {
	return (
		typeof actual !== "object" && actual !== null && Object.is(actual, expected)
	);
}
