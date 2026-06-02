import type { CharacterRecord } from "$lib/entities/character";
import { characterSelectSchema } from "$lib/entities/character";
import type { DialogueChoiceRecord } from "$lib/entities/dialogue-choice";
import {
	type DialogueChoiceTag,
	dialogueChoiceSelectSchema,
} from "$lib/entities/dialogue-choice";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { socialEncounterStateSchema } from "./socialEncounterSchemas";
import type { SocialEncounterState } from "./socialEncounterTypes";

export interface SocialDialogueChoiceProfile {
	readonly appealModifier: number;
	readonly appealModifierLabel: string;
	readonly choiceId: string;
	readonly choiceLabel: string;
	readonly choiceTag: DialogueChoiceTag;
	readonly choiceVisibleText: string;
	readonly commandPayload: SocialDialogueChoiceCommandPayload;
	readonly resolutionItemBonus: number;
}

export interface SocialDialogueChoiceCommandPayload {
	readonly actorId: string;
	readonly choiceId: string;
	readonly choiceLabel: string;
	readonly choiceTag: DialogueChoiceTag;
	readonly npcId: string;
}

export type SocialDialogueChoiceProfileFailureCode =
	| "INVALID_SOCIAL_DIALOGUE_CHOICE_PROFILE"
	| "SOCIAL_DIALOGUE_CHOICE_ACTOR_MISMATCH";

export interface SocialDialogueChoiceProfileFailure {
	readonly code: SocialDialogueChoiceProfileFailureCode;
	readonly message: string;
	readonly details?: unknown;
}

export function createSocialDialogueChoiceProfile(input: {
	readonly character: CharacterRecord;
	readonly choice: DialogueChoiceRecord;
	readonly state: SocialEncounterState;
}): Result<SocialDialogueChoiceProfile, SocialDialogueChoiceProfileFailure> {
	const parsedCharacter = characterSelectSchema.safeParse(input.character);
	const parsedChoice = dialogueChoiceSelectSchema.safeParse(input.choice);
	const parsedState = socialEncounterStateSchema.safeParse(input.state);
	if (
		!parsedCharacter.success ||
		!parsedChoice.success ||
		!parsedState.success
	) {
		return fail({
			code: "INVALID_SOCIAL_DIALOGUE_CHOICE_PROFILE",
			message: "Social dialogue choice profile input failed validation.",
			details: {
				characterIssueCount: parsedCharacter.success
					? 0
					: parsedCharacter.error.issues.length,
				choiceIssueCount: parsedChoice.success
					? 0
					: parsedChoice.error.issues.length,
				stateIssueCount: parsedState.success
					? 0
					: parsedState.error.issues.length,
			},
		});
	}

	if (parsedState.data.actorId !== parsedCharacter.data.id) {
		return fail({
			code: "SOCIAL_DIALOGUE_CHOICE_ACTOR_MISMATCH",
			message: "Selected character does not match the active social actor.",
			details: {
				characterId: parsedCharacter.data.id,
				stateActorId: parsedState.data.actorId,
			},
		});
	}

	const choice = parsedChoice.data;
	const state = parsedState.data;

	return ok({
		appealModifier: choice.appealModifier,
		appealModifierLabel: formatModifier(choice.appealModifier),
		choiceId: choice.id,
		choiceLabel: choice.label,
		choiceTag: choice.tag,
		choiceVisibleText: choice.visibleText,
		commandPayload: {
			actorId: state.actorId,
			choiceId: choice.id,
			choiceLabel: choice.label,
			choiceTag: choice.tag,
			npcId: state.npcId,
		},
		resolutionItemBonus: choice.appealModifier,
	});
}

function formatModifier(modifier: number): string {
	return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}
