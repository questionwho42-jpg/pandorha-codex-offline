import { describe, expect, it } from "vitest";
import type { WorldStateFlagView } from "$lib/entities/world-state";
import {
	createSocialEncounterConsequenceFlag,
	createSocialEncounterConsequenceView,
	upsertSocialEncounterConsequenceFlag,
} from "../model/socialEncounterConsequences";
import type { SocialEncounterState } from "../model/socialEncounterTypes";

describe("social encounter WorldState consequences", () => {
	it("does not create a flag for active negotiations", () => {
		const flag = createSocialEncounterConsequenceFlag({
			state: buildState({ status: "active" }),
			updatedAt: "2026-05-21T00:00:00.000Z",
		});

		expect(flag).toBeNull();
	});

	it("creates a convinced NPC flag with structured value", () => {
		const flag = createSocialEncounterConsequenceFlag({
			state: buildState({ status: "convinced" }),
			updatedAt: "2026-05-21T00:00:00.000Z",
		});

		expect(flag).toEqual({
			key: "npc:training-broker:convinced",
			value: {
				actorId: "character-lia",
				encounterId: "social-encounter-primary",
				npcId: "training-broker",
				outcome: "convinced",
				summary:
					"O NPC aceitou o argumento principal e esta consequência foi registrada no estado do mundo.",
			},
			updatedAt: "2026-05-21T00:00:00.000Z",
		});
	});

	it("creates a walked-away NPC flag with user-facing copy", () => {
		const flag = createSocialEncounterConsequenceFlag({
			state: buildState({ status: "walked-away" }),
			updatedAt: "2026-05-21T00:00:00.000Z",
		});

		expect(flag?.key).toBe("npc:training-broker:walked-away");
		expect(flag?.value).toMatchObject({
			outcome: "walked-away",
			summary:
				"O NPC encerrou a conversa sem aceitar o pedido e esta consequência foi registrada no estado do mundo.",
		});
	});

	it("upserts consequence flags without duplicating keys", () => {
		const first = createRequiredFlag("convinced", "2026-05-21T00:00:00.000Z");
		const second = createRequiredFlag("convinced", "2026-05-21T00:01:00.000Z");
		const unrelated: WorldStateFlagView = {
			key: "plot:training:opened",
			value: true,
			updatedAt: "2026-05-21T00:00:00.000Z",
		};

		const flags = upsertSocialEncounterConsequenceFlag(
			upsertSocialEncounterConsequenceFlag([unrelated], first),
			second,
		);

		expect(flags).toHaveLength(2);
		expect(flags).toContain(unrelated);
		expect(flags.find((flag) => flag.key === first.key)?.updatedAt).toBe(
			"2026-05-21T00:01:00.000Z",
		);
	});

	it("creates a consequence view from saved WorldState flags", () => {
		const flag = createRequiredFlag("convinced", "2026-05-21T00:00:00.000Z");

		const view = createSocialEncounterConsequenceView({
			state: buildState({ status: "convinced" }),
			worldState: [flag],
		});

		expect(view).toEqual({
			key: "npc:training-broker:convinced",
			label: "Consequência: NPC convencido",
			summary:
				"O NPC aceitou o argumento principal e esta consequência foi registrada no estado do mundo.",
		});
	});

	it("creates the walked-away consequence view from saved WorldState flags", () => {
		const flag = createRequiredFlag("walked-away", "2026-05-21T00:00:00.000Z");

		const view = createSocialEncounterConsequenceView({
			state: buildState({ status: "walked-away" }),
			worldState: [flag],
		});

		expect(view).toEqual({
			key: "npc:training-broker:walked-away",
			label: "Consequência: negociação perdida",
			summary:
				"O NPC encerrou a conversa sem aceitar o pedido e esta consequência foi registrada no estado do mundo.",
		});
	});

	it("hides consequence view for active, missing or corrupted flags", () => {
		const corruptedValues: readonly WorldStateFlagView["value"][] = [
			{ outcome: "unknown" },
			null,
			[],
			{
				actorId: 42,
				encounterId: "social-encounter-primary",
				npcId: "training-broker",
				outcome: "convinced",
				summary: "Valor corrompido.",
			},
			{
				actorId: "character-lia",
				encounterId: 42,
				npcId: "training-broker",
				outcome: "convinced",
				summary: "Valor corrompido.",
			},
			{
				actorId: "character-lia",
				encounterId: "social-encounter-primary",
				npcId: 42,
				outcome: "convinced",
				summary: "Valor corrompido.",
			},
			{
				actorId: "character-lia",
				encounterId: "social-encounter-primary",
				npcId: "training-broker",
				outcome: "convinced",
				summary: 42,
			},
		];

		expect(
			createSocialEncounterConsequenceView({
				state: buildState({ status: "active" }),
				worldState: [createRequiredFlag("convinced")],
			}),
		).toBeNull();
		expect(
			createSocialEncounterConsequenceView({
				state: buildState({ status: "convinced" }),
				worldState: [],
			}),
		).toBeNull();
		for (const value of corruptedValues) {
			expect(
				createSocialEncounterConsequenceView({
					state: buildState({ status: "convinced" }),
					worldState: [
						{
							key: "npc:training-broker:convinced",
							value,
							updatedAt: "2026-05-21T00:00:00.000Z",
						},
					],
				}),
			).toBeNull();
		}
	});
});

function createRequiredFlag(
	status: Extract<SocialEncounterState["status"], "convinced" | "walked-away">,
	updatedAt = "2026-05-21T00:00:00.000Z",
): WorldStateFlagView {
	const flag = createSocialEncounterConsequenceFlag({
		state: buildState({ status }),
		updatedAt,
	});
	expect(flag).not.toBeNull();
	if (!flag) {
		expect.fail("Expected social consequence flag.");
	}

	return flag;
}

function buildState(
	patch: Partial<SocialEncounterState>,
): SocialEncounterState {
	return {
		id: "social-encounter-primary",
		npcId: "training-broker",
		actorId: "character-lia",
		status: "active",
		attitude: "skeptical",
		mentalHpCurrent: 0,
		mentalHpMax: 8,
		patienceCurrent: 6,
		patienceMax: 6,
		persuasionProgress: 3,
		persuasionTarget: 3,
		events: [],
		log: [],
		createdAt: "2026-05-21T00:00:00.000Z",
		updatedAt: "2026-05-21T00:00:00.000Z",
		...patch,
	};
}
