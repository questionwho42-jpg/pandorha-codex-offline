import { describe, expect, it, vi } from "vitest";
import type { CharacterRecord } from "$lib/entities/character";
import { createSocialDialogueChoiceProfile } from "$lib/features/social-encounter/model-api";
import { createSocialEncounterSession } from "./socialEncounterSession";

describe("createSocialEncounterSession", () => {
	it("creates deterministic training inputs for social encounter UI", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-05-20T14:00:00.000Z"));
		const session = createSocialEncounterSession();
		const character = buildCharacter();

		const startInput = session.createStartInput(
			"training-broker",
			character.id,
		);
		const bargain = session.dialogueChoices.find(
			(choice) => choice.id === "bargain",
		);
		expect(bargain).toBeDefined();
		if (bargain === undefined) {
			expect.fail("Expected bargain choice in social encounter session.");
		}
		const profile = createSocialDialogueChoiceProfile({
			character,
			choice: bargain,
			state: buildState(character.id),
		});
		expect(profile.success).toBe(true);
		if (!profile.success) {
			expect.fail(`Expected profile success, got ${profile.error.code}`);
		}
		const appealResolutionInput = session.createAppealResolutionInput(
			buildState(character.id),
			character,
			profile.data,
		);
		const resolution = session.appealResolutionService.resolveAppealOutcome(
			appealResolutionInput,
		);
		expect(resolution.success).toBe(true);
		if (!resolution.success) {
			expect.fail(`Expected resolution success, got ${resolution.error.code}`);
		}
		const appealInput = session.createAppealInput(
			buildState(character.id),
			resolution.data,
			profile.data,
		);

		expect(session.npcs.map((npc) => npc.id)).toContain("training-broker");
		expect(session.dialogueChoices.map((choice) => choice.id)).toEqual([
			"persuade",
			"bargain",
			"threaten",
		]);
		expect(session.dialogueNodes.map((node) => node.id)).toContain(
			"training-broker-opening",
		);
		expect(session.dialogueOptions.map((option) => option.id)).toContain(
			"training-broker-option-bargain",
		);
		expect(startInput).toEqual({
			id: "social-encounter-primary",
			actorId: "character-lia",
			npcId: "training-broker",
			requestComplexity: 2,
			createdAt: "2026-05-20T14:00:00.000Z",
		});
		expect(appealResolutionInput).toEqual({
			reason: "Apelo social de Lia com Barganhar contra training-broker",
			level: 1,
			social: 3,
			interaction: 2,
			itemBonus: 1,
			dc: 14,
		});
		expect(resolution.data.resolution).toMatchObject({
			degree: "success",
			total: 17,
			dc: 14,
		});
		expect(appealInput.command).toMatchObject({
			id: "social-appeal-1",
			type: "social-appeal",
			source: "social-appeal-character-ui",
			payload: {
				actorId: "character-lia",
				npcId: "training-broker",
				choiceId: "bargain",
				choiceTag: "bargain",
				choiceLabel: "Barganhar",
			},
		});
		expect(appealInput.outcome).toEqual({
			kind: "success",
			mentalDamage: 3,
			persuasionProgress: 1,
		});
		vi.useRealTimers();
	});
});

function buildCharacter(): CharacterRecord {
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
		createdAt: "2026-05-20T14:00:00.000Z",
		updatedAt: "2026-05-20T14:00:00.000Z",
	};
}

function buildState(actorId: string) {
	return {
		id: "social-encounter-primary",
		npcId: "training-broker",
		actorId,
		status: "active" as const,
		attitude: "skeptical" as const,
		mentalHpCurrent: 8,
		mentalHpMax: 8,
		patienceCurrent: 6,
		patienceMax: 6,
		persuasionProgress: 0,
		persuasionTarget: 3,
		events: [],
		log: [],
		createdAt: "2026-05-20T14:00:00.000Z",
		updatedAt: "2026-05-20T14:00:00.000Z",
	};
}
