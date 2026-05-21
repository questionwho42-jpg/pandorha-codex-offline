import { describe, expect, it } from "vitest";
import {
	DIALOGUE_NODE_CATALOG,
	DIALOGUE_OPTION_CATALOG,
	type DialogueNodeRecord,
	type DialogueOptionRecord,
	DialogueTreeCatalogService,
	type DialogueTreeFailure,
	InMemoryDialogueTreeCatalogRepository,
} from "$lib/entities/dialogue-tree";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { DialogueTraversalService } from "../domain/DialogueTraversalService";
import type { SocialEncounterEvent } from "../model/socialEncounterTypes";

describe("DialogueTraversalService", () => {
	it("selects a dialogue option and emits a ledger event", async () => {
		const service = createService();

		const result = await service.selectOption({
			npcId: "training-broker",
			currentNodeId: "training-broker-opening",
			optionId: "training-broker-option-bargain",
			selectedAt: "2026-05-21T12:00:00.000Z",
			events: [],
		});

		expect(result).toMatchObject({
			success: true,
			data: {
				selectedChoiceId: "bargain",
				nextNode: { id: "training-broker-bargain-response" },
				event: {
					type: "dialogue-option-selected",
					commandId: "training-broker-option-bargain",
				},
			},
		});
		if (!result.success) {
			return;
		}
		expect(result.data.event.message).toContain("Barganhar");
	});

	it("rejects invalid traversal input", async () => {
		const service = createService();

		const result = await service.selectOption({
			npcId: "training-broker",
			currentNodeId: "invalid node",
			optionId: "training-broker-option-bargain",
			selectedAt: "not-a-date",
			events: [],
		});

		expect(result).toMatchObject({
			success: false,
			error: { code: "INVALID_DIALOGUE_TRAVERSAL_INPUT" },
		});
	});

	it("rejects a dialogue node from another NPC", async () => {
		const service = createService();

		const result = await service.selectOption({
			npcId: "other-npc",
			currentNodeId: "training-broker-opening",
			optionId: "training-broker-option-bargain",
			selectedAt: "2026-05-21T12:00:00.000Z",
			events: [],
		});

		expect(result).toMatchObject({
			success: false,
			error: { code: "DIALOGUE_NODE_MISMATCH" },
		});
	});

	it("rejects an unavailable option for the current node", async () => {
		const service = createService();

		const result = await service.selectOption({
			npcId: "training-broker",
			currentNodeId: "training-broker-opening",
			optionId: "missing-option",
			selectedAt: "2026-05-21T12:00:00.000Z",
			events: [],
		});

		expect(result).toMatchObject({
			success: false,
			error: { code: "DIALOGUE_OPTION_MISSING" },
		});
	});

	it("returns lookup failure when the tree repository fails", async () => {
		const repository = new InMemoryDialogueTreeCatalogRepository();
		repository.failNextCall();
		const service = new DialogueTraversalService(
			new DialogueTreeCatalogService(repository),
		);

		const result = await service.selectOption({
			npcId: "training-broker",
			currentNodeId: "training-broker-opening",
			optionId: "training-broker-option-bargain",
			selectedAt: "2026-05-21T12:00:00.000Z",
			events: [],
		});

		expect(result).toMatchObject({
			success: false,
			error: { code: "DIALOGUE_TREE_LOOKUP_FAILED" },
		});
	});

	it("returns lookup failure when options cannot be listed", async () => {
		const service = new DialogueTraversalService({
			findNodeById: async (id) => ok(findCatalogNode(id)),
			listOptionsByNodeId: async () => repositoryFailure(),
		});

		const result = await service.selectOption({
			npcId: "training-broker",
			currentNodeId: "training-broker-opening",
			optionId: "training-broker-option-bargain",
			selectedAt: "2026-05-21T12:00:00.000Z",
			events: [],
		});

		expect(result).toMatchObject({
			success: false,
			error: { code: "DIALOGUE_TREE_LOOKUP_FAILED" },
		});
	});

	it("returns lookup failure when the selected option points to a missing next node", async () => {
		const service = new DialogueTraversalService({
			findNodeById: async (id) =>
				id === "missing-next-node"
					? repositoryFailure()
					: ok(findCatalogNode(id)),
			listOptionsByNodeId: async () =>
				ok([
					{
						...findCatalogOption("training-broker-option-bargain"),
						nextNodeId: "missing-next-node",
					},
				]),
		});

		const result = await service.selectOption({
			npcId: "training-broker",
			currentNodeId: "training-broker-opening",
			optionId: "training-broker-option-bargain",
			selectedAt: "2026-05-21T12:00:00.000Z",
			events: [],
		});

		expect(result).toMatchObject({
			success: false,
			error: { code: "DIALOGUE_TREE_LOOKUP_FAILED" },
		});
	});

	it("replays dialogue option events to recover the current node", async () => {
		const service = createService();

		const result = await service.findCurrentNode({
			npcId: "training-broker",
			startNodeId: "training-broker-opening",
			events: [
				createStartedEvent(),
				{
					type: "dialogue-option-selected",
					message: "Opção de diálogo escolhida: Barganhar.",
					createdAt: "2026-05-21T12:01:00.000Z",
					commandId: "training-broker-option-bargain",
				},
			],
		});

		expect(result).toMatchObject({
			success: true,
			data: {
				currentNodeId: "training-broker-bargain-response",
			},
		});
	});

	it("returns the start node when no dialogue option was selected", async () => {
		const service = createService();

		const result = await service.findCurrentNode({
			npcId: "training-broker",
			startNodeId: "training-broker-opening",
			events: [createStartedEvent()],
		});

		expect(result).toMatchObject({
			success: true,
			data: {
				currentNodeId: "training-broker-opening",
			},
		});
	});

	it("returns lookup failure when the start node cannot be found during replay", async () => {
		const service = new DialogueTraversalService({
			findNodeById: async () => repositoryFailure(),
			listOptionsByNodeId: async () => ok([]),
		});

		const result = await service.findCurrentNode({
			npcId: "training-broker",
			startNodeId: "training-broker-opening",
			events: [],
		});

		expect(result).toMatchObject({
			success: false,
			error: { code: "DIALOGUE_TREE_LOOKUP_FAILED" },
		});
	});

	it("rejects dialogue events without an option id during replay", async () => {
		const service = createService();

		const result = await service.findCurrentNode({
			npcId: "training-broker",
			startNodeId: "training-broker-opening",
			events: [
				{
					type: "dialogue-option-selected",
					message: "Opção de diálogo sem id.",
					createdAt: "2026-05-21T12:01:00.000Z",
				},
			],
		});

		expect(result).toMatchObject({
			success: false,
			error: { code: "DIALOGUE_OPTION_MISSING" },
		});
	});

	it("rejects missing replay options", async () => {
		const service = createService();

		const result = await service.findCurrentNode({
			npcId: "training-broker",
			startNodeId: "training-broker-opening",
			events: [
				{
					type: "dialogue-option-selected",
					message: "Opção inexistente.",
					createdAt: "2026-05-21T12:01:00.000Z",
					commandId: "missing-option",
				},
			],
		});

		expect(result).toMatchObject({
			success: false,
			error: { code: "DIALOGUE_OPTION_MISSING" },
		});
	});

	it("returns lookup failure when replay cannot list options", async () => {
		const service = new DialogueTraversalService({
			findNodeById: async (id) => ok(findCatalogNode(id)),
			listOptionsByNodeId: async () => repositoryFailure(),
		});

		const result = await service.findCurrentNode({
			npcId: "training-broker",
			startNodeId: "training-broker-opening",
			events: [
				{
					type: "dialogue-option-selected",
					message: "Opção de diálogo escolhida: Barganhar.",
					createdAt: "2026-05-21T12:01:00.000Z",
					commandId: "training-broker-option-bargain",
				},
			],
		});

		expect(result).toMatchObject({
			success: false,
			error: { code: "DIALOGUE_TREE_LOOKUP_FAILED" },
		});
	});

	it("rejects invalid current-node replay input", async () => {
		const service = createService();

		const result = await service.findCurrentNode({
			npcId: "training-broker",
			startNodeId: "invalid node",
			events: [],
		});

		expect(result).toMatchObject({
			success: false,
			error: { code: "INVALID_DIALOGUE_TRAVERSAL_INPUT" },
		});
	});

	it("keeps social event typing compatible with dialogue option events", () => {
		const event: SocialEncounterEvent = {
			type: "dialogue-option-selected",
			message: "Opção de diálogo escolhida: Barganhar.",
			createdAt: "2026-05-21T12:01:00.000Z",
			commandId: "training-broker-option-bargain",
		};

		expect(event.type).toBe("dialogue-option-selected");
	});
});

function createService(): DialogueTraversalService {
	return new DialogueTraversalService(
		new DialogueTreeCatalogService(
			new InMemoryDialogueTreeCatalogRepository(
				DIALOGUE_NODE_CATALOG,
				DIALOGUE_OPTION_CATALOG,
			),
		),
	);
}

function createStartedEvent(): SocialEncounterEvent {
	return {
		type: "social-encounter-started",
		message: "Negociação iniciada com Corretora de Treino.",
		createdAt: "2026-05-21T12:00:00.000Z",
	};
}

function findCatalogNode(id: string): DialogueNodeRecord {
	const node = DIALOGUE_NODE_CATALOG.find((candidate) => candidate.id === id);
	if (!node) {
		expect.fail(`Expected catalog node ${id}.`);
	}

	return node;
}

function findCatalogOption(id: string): DialogueOptionRecord {
	const option = DIALOGUE_OPTION_CATALOG.find(
		(candidate) => candidate.id === id,
	);
	if (!option) {
		expect.fail(`Expected catalog option ${id}.`);
	}

	return option;
}

function repositoryFailure(): Result<never, DialogueTreeFailure> {
	return fail({
		code: "REPOSITORY_FAILURE",
		message: "Dialogue tree repository failed in test.",
	});
}
