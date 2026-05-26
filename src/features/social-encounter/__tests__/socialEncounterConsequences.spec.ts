import { describe, expect, it } from "vitest";
import {
	DIALOGUE_OPTION_CATALOG,
	type DialogueOptionRecord,
} from "$lib/entities/dialogue-tree";
import type { WorldStateFlagView } from "$lib/entities/world-state";
import {
	createSocialEncounterConsequenceFlag,
	createSocialEncounterConsequenceView,
	createSocialPressurePenaltyIntent,
	hasSocialPressurePenaltyFlag,
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

	it("stores bargain metadata from the latest selected dialogue option", () => {
		const flag = createSocialEncounterConsequenceFlag({
			state: buildState({
				status: "convinced",
				events: [
					buildDialogueEvent("training-broker-option-persuade"),
					buildDialogueEvent("training-broker-option-bargain"),
				],
			}),
			dialogueOptions: DIALOGUE_OPTION_CATALOG,
			updatedAt: "2026-05-21T00:00:00.000Z",
		});

		expect(flag?.value).toMatchObject({
			dialogueOptionId: "training-broker-option-bargain",
			dialogueChoiceId: "bargain",
			dialogueChoiceLabel: "Barganhar",
			summary:
				"O NPC aceitou a troca proposta e esta consequência foi registrada no estado do mundo.",
		});
	});

	it("creates explicit consequence summaries for each social dialogue choice", () => {
		const cases: readonly {
			readonly optionId: string;
			readonly expectedChoiceId: string;
			readonly expectedChoiceLabel: string;
			readonly expectedSummary: string;
		}[] = [
			{
				optionId: "training-broker-option-persuade",
				expectedChoiceId: "persuade",
				expectedChoiceLabel: "Persuadir",
				expectedSummary:
					"O NPC aceitou a proposta pela via da confiança e esta consequência foi registrada no estado do mundo.",
			},
			{
				optionId: "training-broker-option-bargain",
				expectedChoiceId: "bargain",
				expectedChoiceLabel: "Barganhar",
				expectedSummary:
					"O NPC aceitou a troca proposta e esta consequência foi registrada no estado do mundo.",
			},
			{
				optionId: "training-broker-option-threaten",
				expectedChoiceId: "threaten",
				expectedChoiceLabel: "Pressionar",
				expectedSummary:
					"O NPC cedeu à pressão social, e a reputação com a facção do NPC perdeu Fama no estado do mundo.",
			},
		];

		for (const testCase of cases) {
			const flag = createSocialEncounterConsequenceFlag({
				state: buildState({
					status: "convinced",
					events: [buildDialogueEvent(testCase.optionId)],
				}),
				dialogueOptions: DIALOGUE_OPTION_CATALOG,
				updatedAt: "2026-05-21T00:00:00.000Z",
			});

			expect(flag?.value).toMatchObject({
				dialogueOptionId: testCase.optionId,
				dialogueChoiceId: testCase.expectedChoiceId,
				dialogueChoiceLabel: testCase.expectedChoiceLabel,
				summary: testCase.expectedSummary,
			});
		}
	});

	it("creates explicit walked-away summaries for each social dialogue choice", () => {
		const cases: readonly {
			readonly option: DialogueOptionRecord;
			readonly expectedSummary: string;
		}[] = [
			{
				option: findRequiredDialogueOption("training-broker-option-persuade"),
				expectedSummary:
					"A proposta de confiança não sustentou a conversa e esta consequência foi registrada no estado do mundo.",
			},
			{
				option: findRequiredDialogueOption("training-broker-option-bargain"),
				expectedSummary:
					"A troca proposta não foi suficiente para manter o NPC na conversa e esta consequência foi registrada no estado do mundo.",
			},
			{
				option: findRequiredDialogueOption("training-broker-option-threaten"),
				expectedSummary:
					"A pressão social esgotou a paciência do NPC, e a reputação com a facção dele perdeu Fama no estado do mundo.",
			},
			{
				option: buildDialogueOption({
					choiceId: "custom-pressure",
					id: "training-broker-option-custom",
					label: "Improvisar",
				}),
				expectedSummary:
					"O NPC encerrou a conversa sem aceitar o pedido e esta consequência foi registrada no estado do mundo.",
			},
		];

		for (const testCase of cases) {
			const flag = createSocialEncounterConsequenceFlag({
				state: buildState({
					status: "walked-away",
					events: [buildDialogueEvent(testCase.option.id)],
				}),
				dialogueOptions: [testCase.option],
				updatedAt: "2026-05-21T00:00:00.000Z",
			});

			expect(flag?.value).toMatchObject({
				dialogueChoiceId: testCase.option.choiceId,
				dialogueChoiceLabel: testCase.option.label,
				dialogueOptionId: testCase.option.id,
				summary: testCase.expectedSummary,
			});
		}
	});

	it("uses generic convinced copy for unknown dialogue choice ids", () => {
		const option = buildDialogueOption({
			choiceId: "custom-offer",
			id: "training-broker-option-custom",
			label: "Improvisar",
		});

		const flag = createSocialEncounterConsequenceFlag({
			state: buildState({
				status: "convinced",
				events: [buildDialogueEvent(option.id)],
			}),
			dialogueOptions: [option],
			updatedAt: "2026-05-21T00:00:00.000Z",
		});

		expect(flag?.value).toMatchObject({
			dialogueChoiceId: "custom-offer",
			dialogueChoiceLabel: "Improvisar",
			dialogueOptionId: "training-broker-option-custom",
			summary:
				"O NPC aceitou o argumento principal e esta consequência foi registrada no estado do mundo.",
		});
	});

	it("keeps the generic summary when dialogue option metadata is unavailable", () => {
		const missingOption: readonly DialogueOptionRecord[] = [];

		const flag = createSocialEncounterConsequenceFlag({
			state: buildState({
				status: "convinced",
				events: [buildDialogueEvent("training-broker-option-bargain")],
			}),
			dialogueOptions: missingOption,
			updatedAt: "2026-05-21T00:00:00.000Z",
		});

		expect(flag?.value).toEqual({
			actorId: "character-lia",
			encounterId: "social-encounter-primary",
			npcId: "training-broker",
			outcome: "convinced",
			summary:
				"O NPC aceitou o argumento principal e esta consequência foi registrada no estado do mundo.",
		});
	});

	it("keeps the generic summary when selected dialogue event has no command id", () => {
		const flag = createSocialEncounterConsequenceFlag({
			state: buildState({
				status: "convinced",
				events: [
					{
						type: "dialogue-option-selected",
						message: "Opção de diálogo escolhida sem id.",
						createdAt: "2026-05-21T00:00:00.000Z",
					},
				],
			}),
			dialogueOptions: DIALOGUE_OPTION_CATALOG,
			updatedAt: "2026-05-21T00:00:00.000Z",
		});

		expect(flag?.value).toEqual({
			actorId: "character-lia",
			encounterId: "social-encounter-primary",
			npcId: "training-broker",
			outcome: "convinced",
			summary:
				"O NPC aceitou o argumento principal e esta consequência foi registrada no estado do mundo.",
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

	it("creates a consequence view from saved WorldState flags with dialogue metadata", () => {
		const flag = createSocialEncounterConsequenceFlag({
			state: buildState({
				status: "convinced",
				events: [buildDialogueEvent("training-broker-option-bargain")],
			}),
			dialogueOptions: DIALOGUE_OPTION_CATALOG,
			updatedAt: "2026-05-21T00:00:00.000Z",
		});

		const view = createSocialEncounterConsequenceView({
			state: buildState({ status: "convinced" }),
			worldState: flag ? [flag] : [],
		});

		expect(view).toEqual({
			key: "npc:training-broker:convinced",
			label: "Consequência: NPC convencido",
			summary:
				"O NPC aceitou a troca proposta e esta consequência foi registrada no estado do mundo.",
		});
	});

	it("creates a pressure penalty intent for terminal Pressionar outcomes", () => {
		const intent = createSocialPressurePenaltyIntent({
			state: buildState({
				status: "convinced",
				events: [buildDialogueEvent("training-broker-option-threaten")],
			}),
			dialogueOptions: DIALOGUE_OPTION_CATALOG,
			worldState: [],
			updatedAt: "2026-05-21T00:00:00.000Z",
		});

		expect(intent).toEqual({
			actorId: "character-lia",
			dialogueChoiceId: "threaten",
			dialogueChoiceLabel: "Pressionar",
			dialogueOptionId: "training-broker-option-threaten",
			encounterId: "social-encounter-primary",
			npcId: "training-broker",
			worldStateFlag: {
				key: "npc:training-broker:social-pressure-penalty:social-encounter-primary",
				value: {
					actorId: "character-lia",
					dialogueChoiceId: "threaten",
					dialogueChoiceLabel: "Pressionar",
					dialogueOptionId: "training-broker-option-threaten",
					encounterId: "social-encounter-primary",
					kind: "social-pressure-fame-penalty",
					npcId: "training-broker",
					summary:
						"Pressionar este NPC aplicou perda de 1 nível de Fama à facção associada.",
				},
				updatedAt: "2026-05-21T00:00:00.000Z",
			},
		});
	});

	it("does not create pressure penalty intents for Persuadir, Barganhar or active states", () => {
		const persuade = createSocialPressurePenaltyIntent({
			state: buildState({
				status: "convinced",
				events: [buildDialogueEvent("training-broker-option-persuade")],
			}),
			dialogueOptions: DIALOGUE_OPTION_CATALOG,
			worldState: [],
			updatedAt: "2026-05-21T00:00:00.000Z",
		});
		const bargain = createSocialPressurePenaltyIntent({
			state: buildState({
				status: "convinced",
				events: [buildDialogueEvent("training-broker-option-bargain")],
			}),
			dialogueOptions: DIALOGUE_OPTION_CATALOG,
			worldState: [],
			updatedAt: "2026-05-21T00:00:00.000Z",
		});
		const activePressure = createSocialPressurePenaltyIntent({
			state: buildState({
				status: "active",
				events: [buildDialogueEvent("training-broker-option-threaten")],
			}),
			dialogueOptions: DIALOGUE_OPTION_CATALOG,
			worldState: [],
			updatedAt: "2026-05-21T00:00:00.000Z",
		});

		expect(persuade).toBeNull();
		expect(bargain).toBeNull();
		expect(activePressure).toBeNull();
	});

	it("keeps pressure penalty intents idempotent by encounter id", () => {
		const firstIntent = createSocialPressurePenaltyIntent({
			state: buildState({
				status: "walked-away",
				events: [buildDialogueEvent("training-broker-option-threaten")],
			}),
			dialogueOptions: DIALOGUE_OPTION_CATALOG,
			worldState: [],
			updatedAt: "2026-05-21T00:00:00.000Z",
		});
		expect(firstIntent).not.toBeNull();
		if (!firstIntent) {
			expect.fail("Expected pressure penalty intent.");
		}

		const worldState = [firstIntent.worldStateFlag];
		const repeatedIntent = createSocialPressurePenaltyIntent({
			state: buildState({
				status: "walked-away",
				events: [buildDialogueEvent("training-broker-option-threaten")],
			}),
			dialogueOptions: DIALOGUE_OPTION_CATALOG,
			worldState,
			updatedAt: "2026-05-21T00:01:00.000Z",
		});

		expect(
			hasSocialPressurePenaltyFlag(worldState, firstIntent.encounterId),
		).toBe(true);
		expect(repeatedIntent).toBeNull();
	});

	it("does not create pressure penalty intents when option metadata is unavailable", () => {
		const intent = createSocialPressurePenaltyIntent({
			state: buildState({
				status: "convinced",
				events: [buildDialogueEvent("training-broker-option-threaten")],
			}),
			dialogueOptions: [],
			worldState: [],
			updatedAt: "2026-05-21T00:00:00.000Z",
		});

		expect(intent).toBeNull();
	});

	it("does not create pressure penalty intents when dialogue options are omitted", () => {
		const intent = createSocialPressurePenaltyIntent({
			state: buildState({
				status: "convinced",
				events: [buildDialogueEvent("training-broker-option-threaten")],
			}),
			worldState: [],
			updatedAt: "2026-05-21T00:00:00.000Z",
		});

		expect(intent).toBeNull();
	});

	it("detects saved pressure penalty flags and ignores corrupted values", () => {
		const validMinimalFlag: WorldStateFlagView = {
			key: "npc:training-broker:social-pressure-penalty:social-encounter-primary",
			value: {
				actorId: "character-lia",
				dialogueChoiceId: "threaten",
				encounterId: "social-encounter-primary",
				kind: "social-pressure-fame-penalty",
				npcId: "training-broker",
				summary:
					"Pressionar este NPC aplicou perda de 1 nível de Fama à facção associada.",
			},
			updatedAt: "2026-05-21T00:00:00.000Z",
		};
		const corruptedValues: readonly WorldStateFlagView["value"][] = [
			null,
			"corrupted",
			[],
			{
				actorId: "character-lia",
				dialogueChoiceId: "threaten",
				encounterId: "social-encounter-primary",
				kind: "unknown-pressure-penalty",
				npcId: "training-broker",
				summary: "Valor corrompido.",
			},
			{
				actorId: 42,
				dialogueChoiceId: "threaten",
				encounterId: "social-encounter-primary",
				kind: "social-pressure-fame-penalty",
				npcId: "training-broker",
				summary: "Valor corrompido.",
			},
			{
				actorId: "character-lia",
				dialogueChoiceId: "bargain",
				encounterId: "social-encounter-primary",
				kind: "social-pressure-fame-penalty",
				npcId: "training-broker",
				summary: "Valor corrompido.",
			},
			{
				actorId: "character-lia",
				dialogueChoiceId: "threaten",
				encounterId: 42,
				kind: "social-pressure-fame-penalty",
				npcId: "training-broker",
				summary: "Valor corrompido.",
			},
			{
				actorId: "character-lia",
				dialogueChoiceId: "threaten",
				encounterId: "social-encounter-primary",
				kind: "social-pressure-fame-penalty",
				npcId: 42,
				summary: "Valor corrompido.",
			},
			{
				actorId: "character-lia",
				dialogueChoiceId: "threaten",
				encounterId: "social-encounter-primary",
				kind: "social-pressure-fame-penalty",
				npcId: "training-broker",
				summary: 42,
			},
			{
				actorId: "character-lia",
				dialogueChoiceId: "threaten",
				dialogueChoiceLabel: 42,
				encounterId: "social-encounter-primary",
				kind: "social-pressure-fame-penalty",
				npcId: "training-broker",
				summary: "Valor corrompido.",
			},
			{
				actorId: "character-lia",
				dialogueChoiceId: "threaten",
				dialogueOptionId: 42,
				encounterId: "social-encounter-primary",
				kind: "social-pressure-fame-penalty",
				npcId: "training-broker",
				summary: "Valor corrompido.",
			},
		];

		expect(
			hasSocialPressurePenaltyFlag(
				[validMinimalFlag],
				"social-encounter-primary",
			),
		).toBe(true);
		expect(
			hasSocialPressurePenaltyFlag([validMinimalFlag], "another-encounter"),
		).toBe(false);
		for (const value of corruptedValues) {
			expect(
				hasSocialPressurePenaltyFlag(
					[
						{
							key: "npc:training-broker:social-pressure-penalty:social-encounter-primary",
							value,
							updatedAt: "2026-05-21T00:00:00.000Z",
						},
					],
					"social-encounter-primary",
				),
			).toBe(false);
		}
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
			{
				actorId: "character-lia",
				encounterId: "social-encounter-primary",
				npcId: "training-broker",
				outcome: "convinced",
				summary: "Valor corrompido.",
				dialogueChoiceId: 42,
			},
			{
				actorId: "character-lia",
				encounterId: "social-encounter-primary",
				npcId: "training-broker",
				outcome: "convinced",
				summary: "Valor corrompido.",
				dialogueChoiceLabel: 42,
			},
			{
				actorId: "character-lia",
				encounterId: "social-encounter-primary",
				npcId: "training-broker",
				outcome: "convinced",
				summary: "Valor corrompido.",
				dialogueOptionId: 42,
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

function buildDialogueEvent(
	commandId: string,
): SocialEncounterState["events"][number] {
	return {
		type: "dialogue-option-selected",
		message: `OpÃ§Ã£o de diÃ¡logo escolhida: ${commandId}.`,
		createdAt: "2026-05-21T00:00:00.000Z",
		commandId,
	};
}

function findRequiredDialogueOption(id: string): DialogueOptionRecord {
	const option = DIALOGUE_OPTION_CATALOG.find(
		(candidate) => candidate.id === id,
	);
	expect(option).toBeDefined();
	if (!option) {
		expect.fail(`Missing dialogue option fixture: ${id}`);
	}

	return option;
}

function buildDialogueOption(
	patch: Pick<DialogueOptionRecord, "choiceId" | "id" | "label">,
): DialogueOptionRecord {
	return {
		id: patch.id,
		nodeId: "training-broker-opening",
		label: patch.label,
		visibleText: "Improvisa uma abordagem fora do catÃ¡logo principal.",
		choiceId: patch.choiceId,
		nextNodeId: "training-broker-bargain-response",
		sortOrder: 99,
		sourceFile: "docs/system/survival/regras-negociacao.md",
		summary: "OpÃ§Ã£o de teste para escolhas sociais desconhecidas.",
	};
}

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
