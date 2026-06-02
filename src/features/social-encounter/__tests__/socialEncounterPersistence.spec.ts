import { describe, expect, it } from "vitest";
import {
	createSocialEncounterRecordsFromState,
	createSocialEncounterStateFromRecords,
} from "../model/socialEncounterPersistence";
import type { SocialEncounterState } from "../model/socialEncounterTypes";

describe("social encounter persistence converters", () => {
	it("converts state to records and back without losing ordered events", () => {
		const state = buildState();

		const records = createSocialEncounterRecordsFromState(state);
		const [encounterRecord] = records.socialEncounters;
		if (!encounterRecord) {
			expect.fail("Expected one persisted social encounter record.");
		}
		const restored = createSocialEncounterStateFromRecords(
			encounterRecord,
			[...records.socialEncounterEvents].reverse(),
		);

		expect(records.socialEncounters).toEqual([
			{
				id: "social-encounter-primary",
				npcId: "training-broker",
				actorId: "session-party",
				status: "active",
				attitude: "skeptical",
				mentalHpCurrent: 5,
				mentalHpMax: 8,
				patienceCurrent: 6,
				patienceMax: 6,
				persuasionProgress: 1,
				persuasionTarget: 3,
				createdAt: "2026-05-20T14:00:00.000Z",
				updatedAt: "2026-05-20T14:01:00.000Z",
			},
		]);
		expect(
			records.socialEncounterEvents.map((event) => event.sequence),
		).toEqual([0, 1]);
		expect(restored).toEqual(state);
	});
});

function buildState(): SocialEncounterState {
	return {
		id: "social-encounter-primary",
		npcId: "training-broker",
		actorId: "session-party",
		status: "active",
		attitude: "skeptical",
		mentalHpCurrent: 5,
		mentalHpMax: 8,
		patienceCurrent: 6,
		patienceMax: 6,
		persuasionProgress: 1,
		persuasionTarget: 3,
		events: [
			{
				type: "social-encounter-started",
				message: "Negociação iniciada com Corretora de Treino.",
				createdAt: "2026-05-20T14:00:00.000Z",
			},
			{
				type: "social-appeal-succeeded",
				message: "Apelo social com Barganhar foi bem-sucedido.",
				createdAt: "2026-05-20T14:01:00.000Z",
				commandId: "social-appeal-1",
			},
		],
		log: [
			"Negociação iniciada com Corretora de Treino.",
			"Apelo social com Barganhar foi bem-sucedido.",
		],
		createdAt: "2026-05-20T14:00:00.000Z",
		updatedAt: "2026-05-20T14:01:00.000Z",
	};
}
