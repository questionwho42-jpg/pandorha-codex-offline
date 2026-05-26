import { describe, expect, it } from "vitest";
import {
	DIALOGUE_NODE_CATALOG,
	DIALOGUE_OPTION_CATALOG,
} from "$lib/entities/dialogue-tree";
import {
	createSocialDialogueTreeView,
	resolveDialogueChoiceIdFromEvents,
} from "../model/socialDialogueTreeView";
import type { SocialEncounterState } from "../model/socialEncounterTypes";

describe("createSocialDialogueTreeView", () => {
	it("shows the start node before a negotiation starts", () => {
		const view = createSocialDialogueTreeView({
			nodes: DIALOGUE_NODE_CATALOG,
			options: DIALOGUE_OPTION_CATALOG,
			selectedNpcId: "training-broker",
			state: null,
		});

		expect(view.currentNodeId).toBe("training-broker-opening");
		expect(view.currentNodeText).toContain("proposta concreta");
		expect(view.options).toEqual([]);
		expect(view.canChooseOption).toBe(false);
		expect(view.stateLabel).toBe("Inicie a negociação para escolher uma fala.");
	});

	it("shows the available opening options during an active negotiation", () => {
		const view = createSocialDialogueTreeView({
			nodes: DIALOGUE_NODE_CATALOG,
			options: DIALOGUE_OPTION_CATALOG,
			selectedNpcId: "training-broker",
			state: buildState([]),
		});

		expect(view.options.map((option) => option.label)).toEqual([
			"Persuadir",
			"Barganhar",
			"Pressionar",
		]);
		expect(view.options.map((option) => option.isAvailable)).toEqual([
			true,
			true,
			true,
		]);
		expect(view.canChooseOption).toBe(true);
		expect(view.stateLabel).toBe("Escolha uma fala antes de fazer o apelo.");
	});

	it("marks HP-gated options as blocked without hiding them", () => {
		const view = createSocialDialogueTreeView({
			nodes: DIALOGUE_NODE_CATALOG,
			options: DIALOGUE_OPTION_CATALOG,
			selectedNpcId: "training-broker",
			state: buildState([], { mentalHpCurrent: 5 }),
		});

		expect(view.canChooseOption).toBe(true);
		expect(view.options).toEqual([
			expect.objectContaining({
				label: "Persuadir",
				isAvailable: true,
				blockedReason: null,
			}),
			expect.objectContaining({
				label: "Barganhar",
				isAvailable: true,
				blockedReason: null,
			}),
			expect.objectContaining({
				label: "Pressionar",
				isAvailable: false,
				blockedReason:
					"Exige HP mental 6 ou maior para sustentar a pressão social.",
			}),
		]);
	});

	it("shows the informant tree with a blocked pressure option at starting HP", () => {
		const view = createSocialDialogueTreeView({
			nodes: DIALOGUE_NODE_CATALOG,
			options: DIALOGUE_OPTION_CATALOG,
			selectedNpcId: "training-informant",
			state: buildState([], {
				npcId: "training-informant",
				mentalHpCurrent: 6,
				mentalHpMax: 6,
			}),
		});

		expect(view.currentNodeId).toBe("training-informant-opening");
		expect(view.currentNodeText).toContain("garantia");
		expect(view.options).toEqual([
			expect.objectContaining({
				label: "Persuadir",
				isAvailable: true,
			}),
			expect.objectContaining({
				label: "Barganhar",
				isAvailable: true,
			}),
			expect.objectContaining({
				label: "Pressionar",
				isAvailable: false,
				blockedReason:
					"Exige HP mental 7 ou maior para pressionar o informante sem quebrar a cena.",
			}),
		]);
	});

	it("shows the captain tree with duty and escort options", () => {
		const view = createSocialDialogueTreeView({
			nodes: DIALOGUE_NODE_CATALOG,
			options: DIALOGUE_OPTION_CATALOG,
			selectedNpcId: "training-captain",
			state: buildState([], {
				npcId: "training-captain",
				mentalHpCurrent: 10,
				mentalHpMax: 10,
			}),
		});

		expect(view.currentNodeId).toBe("training-captain-opening");
		expect(view.currentNodeText).toContain("moral da tropa");
		expect(view.options).toEqual([
			expect.objectContaining({
				label: "Persuadir",
				isAvailable: true,
				blockedReason: null,
			}),
			expect.objectContaining({
				label: "Barganhar",
				isAvailable: true,
				blockedReason: null,
			}),
			expect.objectContaining({
				label: "Pressionar",
				isAvailable: true,
				blockedReason: null,
			}),
		]);
	});

	it("blocks the captain pressure option when mental HP is too low", () => {
		const view = createSocialDialogueTreeView({
			nodes: DIALOGUE_NODE_CATALOG,
			options: DIALOGUE_OPTION_CATALOG,
			selectedNpcId: "training-captain",
			state: buildState([], {
				npcId: "training-captain",
				mentalHpCurrent: 7,
				mentalHpMax: 10,
			}),
		});

		expect(view.options.at(2)).toMatchObject({
			label: "Pressionar",
			isAvailable: false,
			blockedReason:
				"Exige HP mental 8 ou maior para pressionar o capitão sem quebrar a moral da tropa.",
		});
	});

	it("keeps blocked reason empty when a gated option has no user-facing copy", () => {
		const optionsWithoutBlockedCopy = DIALOGUE_OPTION_CATALOG.map((option) =>
			option.id === "training-broker-option-threaten"
				? { ...option, blockedReason: undefined }
				: option,
		);

		const view = createSocialDialogueTreeView({
			nodes: DIALOGUE_NODE_CATALOG,
			options: optionsWithoutBlockedCopy,
			selectedNpcId: "training-broker",
			state: buildState([], { mentalHpCurrent: 5 }),
		});

		expect(view.options.at(2)).toMatchObject({
			label: "Pressionar",
			isAvailable: false,
			blockedReason: null,
		});
	});

	it("replays a selected option and shows the response node", () => {
		const view = createSocialDialogueTreeView({
			nodes: DIALOGUE_NODE_CATALOG,
			options: DIALOGUE_OPTION_CATALOG,
			selectedNpcId: "training-broker",
			state: buildState([
				{
					type: "dialogue-option-selected",
					message: "Opção de diálogo escolhida: Barganhar.",
					createdAt: "2026-05-21T12:01:00.000Z",
					commandId: "training-broker-option-bargain",
				},
			]),
		});

		expect(view.currentNodeId).toBe("training-broker-bargain-response");
		expect(view.currentNodeText).toContain("troca proposta");
		expect(view.options).toEqual([]);
		expect(view.canChooseOption).toBe(false);
		expect(view.stateLabel).toBe(
			"Argumento escolhido. Faça o apelo social para resolver a tentativa.",
		);
	});

	it("ignores unrelated events and broken option targets while replaying history", () => {
		const brokenOptions = DIALOGUE_OPTION_CATALOG.map((option) =>
			option.id === "training-broker-option-bargain"
				? { ...option, nextNodeId: "missing-node" }
				: option,
		);
		const view = createSocialDialogueTreeView({
			nodes: DIALOGUE_NODE_CATALOG,
			options: brokenOptions,
			selectedNpcId: "training-broker",
			state: buildState([
				{
					type: "social-appeal-queued",
					message: "Apelo social preparado.",
					createdAt: "2026-05-21T12:00:30.000Z",
				},
				{
					type: "dialogue-option-selected",
					message: "Opção sem referência técnica.",
					createdAt: "2026-05-21T12:00:45.000Z",
				},
				{
					type: "dialogue-option-selected",
					message: "Opção de diálogo escolhida: Barganhar.",
					createdAt: "2026-05-21T12:01:00.000Z",
					commandId: "training-broker-option-bargain",
				},
			]),
		});

		expect(view.currentNodeId).toBe("training-broker-opening");
		expect(view.currentNodeText).toContain("proposta concreta");
		expect(view.canChooseOption).toBe(true);
	});

	it("shows closed negotiation state without options", () => {
		const view = createSocialDialogueTreeView({
			nodes: DIALOGUE_NODE_CATALOG,
			options: DIALOGUE_OPTION_CATALOG,
			selectedNpcId: "training-broker",
			state: buildState([], { status: "convinced" }),
		});

		expect(view.canChooseOption).toBe(false);
		expect(view.stateLabel).toBe("Esta negociação já foi encerrada.");
	});

	it("handles missing dialogue tree for an NPC", () => {
		const view = createSocialDialogueTreeView({
			nodes: DIALOGUE_NODE_CATALOG,
			options: DIALOGUE_OPTION_CATALOG,
			selectedNpcId: "training-missing",
			state: null,
		});

		expect(view.currentNodeId).toBeNull();
		expect(view.currentNodeText).toBe(
			"Nenhuma árvore de diálogo disponível para este NPC.",
		);
		expect(view.stateLabel).toBe("Diálogo indisponível.");
	});
});

describe("resolveDialogueChoiceIdFromEvents", () => {
	it("uses the latest dialogue option event when available", () => {
		const choiceId = resolveDialogueChoiceIdFromEvents(
			buildState([
				{
					type: "dialogue-option-selected",
					message: "Opção de diálogo escolhida: Barganhar.",
					createdAt: "2026-05-21T12:01:00.000Z",
					commandId: "training-broker-option-bargain",
				},
			]).events,
			DIALOGUE_OPTION_CATALOG,
			"persuade",
		);

		expect(choiceId).toBe("bargain");
	});

	it("keeps fallback when no event or option exists", () => {
		expect(
			resolveDialogueChoiceIdFromEvents(
				[],
				DIALOGUE_OPTION_CATALOG,
				"persuade",
			),
		).toBe("persuade");
		expect(
			resolveDialogueChoiceIdFromEvents(
				[
					{
						type: "dialogue-option-selected",
						message: "Opção sem referência técnica.",
						createdAt: "2026-05-21T12:01:00.000Z",
					},
				],
				DIALOGUE_OPTION_CATALOG,
				"persuade",
			),
		).toBe("persuade");
		expect(
			resolveDialogueChoiceIdFromEvents(
				[
					{
						type: "dialogue-option-selected",
						message: "Opção inexistente.",
						createdAt: "2026-05-21T12:01:00.000Z",
						commandId: "missing-option",
					},
				],
				DIALOGUE_OPTION_CATALOG,
				"persuade",
			),
		).toBe("persuade");
	});
});

function buildState(
	events: SocialEncounterState["events"],
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
		events,
		log: events.map((event) => event.message),
		createdAt: "2026-05-21T12:00:00.000Z",
		updatedAt: "2026-05-21T12:00:00.000Z",
		...patch,
	};
}
