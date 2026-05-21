import { describe, expect, it } from "vitest";
import type { CharacterRecord } from "$lib/entities/character";
import { DIALOGUE_CHOICE_CATALOG } from "$lib/entities/dialogue-choice";
import {
	createSocialDialogueChoiceProfile,
	type SocialDialogueChoiceProfileFailure,
} from "../model/socialDialogueChoiceProfile";
import type { SocialEncounterState } from "../model/socialEncounterTypes";

describe("createSocialDialogueChoiceProfile", () => {
	it("maps Persuadir with modifier 0 into a simple command payload", () => {
		const result = createSocialDialogueChoiceProfile({
			character: buildCharacter(),
			choice: getChoice("persuade"),
			state: buildState(),
		});

		expect(result).toEqual({
			success: true,
			data: {
				appealModifier: 0,
				appealModifierLabel: "+0",
				choiceId: "persuade",
				choiceLabel: "Persuadir",
				choiceTag: "persuade",
				choiceVisibleText:
					"Apelar para confiança, lógica social e benefício mútuo.",
				commandPayload: {
					actorId: "character-lia",
					choiceId: "persuade",
					choiceLabel: "Persuadir",
					choiceTag: "persuade",
					npcId: "training-broker",
				},
				resolutionItemBonus: 0,
			},
		});
	});

	it("maps Barganhar with modifier +1", () => {
		const result = createSocialDialogueChoiceProfile({
			character: buildCharacter(),
			choice: getChoice("bargain"),
			state: buildState(),
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			expect.fail("Expected a valid bargain profile.");
		}
		expect(result.data.appealModifier).toBe(1);
		expect(result.data.appealModifierLabel).toBe("+1");
		expect(result.data.resolutionItemBonus).toBe(1);
		expect(result.data.commandPayload.choiceTag).toBe("bargain");
	});

	it("maps Pressionar with modifier -1", () => {
		const result = createSocialDialogueChoiceProfile({
			character: buildCharacter(),
			choice: getChoice("threaten"),
			state: buildState(),
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			expect.fail("Expected a valid pressure profile.");
		}
		expect(result.data.appealModifier).toBe(-1);
		expect(result.data.appealModifierLabel).toBe("-1");
		expect(result.data.resolutionItemBonus).toBe(-1);
		expect(result.data.commandPayload.choiceLabel).toBe("Pressionar");
	});

	it("returns typed failure for invalid input", () => {
		const result = createSocialDialogueChoiceProfile({
			character: buildCharacter(),
			choice: { ...getChoice("persuade"), id: "Persuadir" },
			state: buildState(),
		});

		expectFailure(result, "INVALID_SOCIAL_DIALOGUE_CHOICE_PROFILE");
	});

	it("returns typed failure for invalid character or state records", () => {
		const invalidCharacter = createSocialDialogueChoiceProfile({
			character: { ...buildCharacter(), name: "" },
			choice: getChoice("persuade"),
			state: buildState(),
		});
		const invalidState = createSocialDialogueChoiceProfile({
			character: buildCharacter(),
			choice: getChoice("persuade"),
			state: buildState({
				status: "finished" as SocialEncounterState["status"],
			}),
		});

		expectFailure(invalidCharacter, "INVALID_SOCIAL_DIALOGUE_CHOICE_PROFILE");
		expectFailure(invalidState, "INVALID_SOCIAL_DIALOGUE_CHOICE_PROFILE");
	});

	it("returns typed failure when every profile boundary is invalid", () => {
		const result = createSocialDialogueChoiceProfile({
			character: { ...buildCharacter(), name: "" },
			choice: {
				...getChoice("persuade"),
				tag: "unknown" as ReturnType<typeof getChoice>["tag"],
			},
			state: buildState({
				status: "finished" as SocialEncounterState["status"],
			}),
		});

		expectFailure(result, "INVALID_SOCIAL_DIALOGUE_CHOICE_PROFILE");
	});

	it("returns typed failure when the selected character is not the encounter actor", () => {
		const result = createSocialDialogueChoiceProfile({
			character: buildCharacter({ id: "character-ivo" }),
			choice: getChoice("persuade"),
			state: buildState({ actorId: "character-lia" }),
		});

		expectFailure(result, "SOCIAL_DIALOGUE_CHOICE_ACTOR_MISMATCH");
	});
});

function getChoice(id: "persuade" | "bargain" | "threaten") {
	const choice = DIALOGUE_CHOICE_CATALOG.find(
		(candidate) => candidate.id === id,
	);
	expect(choice).toBeDefined();
	if (choice === undefined) {
		expect.fail(`Missing dialogue choice ${id}.`);
	}
	return choice;
}

function buildCharacter(patch: Partial<CharacterRecord> = {}): CharacterRecord {
	return {
		id: "character-lia",
		name: "Lia",
		concept: "Negociadora de treino",
		ancestryId: "human",
		classId: "vanguard",
		backgroundId: "faith-shelter",
		level: 1,
		physical: 1,
		mental: 2,
		social: 3,
		conflict: 1,
		interaction: 2,
		resistance: 3,
		createdAt: "2026-05-21T10:00:00.000Z",
		updatedAt: "2026-05-21T10:00:00.000Z",
		...patch,
	};
}

function buildState(
	patch: Partial<SocialEncounterState> = {},
): SocialEncounterState {
	return {
		id: "social-encounter-primary",
		npcId: "training-broker",
		actorId: "character-lia",
		status: "active",
		attitude: "skeptical",
		mentalHpCurrent: 8,
		mentalHpMax: 8,
		patienceCurrent: 6,
		patienceMax: 6,
		persuasionProgress: 0,
		persuasionTarget: 3,
		events: [],
		log: [],
		createdAt: "2026-05-21T10:00:00.000Z",
		updatedAt: "2026-05-21T10:00:00.000Z",
		...patch,
	};
}

function expectFailure(
	result:
		| ReturnType<typeof createSocialDialogueChoiceProfile>
		| {
				readonly success: false;
				readonly error: SocialDialogueChoiceProfileFailure;
		  },
	code: SocialDialogueChoiceProfileFailure["code"],
): void {
	expect(result.success).toBe(false);
	if (result.success) {
		expect.fail("Expected a failure result.");
	}
	expect(result.error.code).toBe(code);
}
