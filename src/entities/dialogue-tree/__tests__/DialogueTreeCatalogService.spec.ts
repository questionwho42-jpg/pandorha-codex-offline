import { describe, expect, it } from "vitest";
import { DIALOGUE_CHOICE_CATALOG } from "$lib/entities/dialogue-choice";
import { DialogueTreeCatalogService } from "../domain/DialogueTreeCatalogService";
import {
	DIALOGUE_NODE_CATALOG,
	DIALOGUE_OPTION_CATALOG,
} from "../model/dialogueTreeCatalog";
import type {
	DialogueNodeRecord,
	DialogueOptionRecord,
} from "../model/dialogueTreeSchema";
import { dialogueOptionSelectSchema } from "../model/dialogueTreeSchema";
import { InMemoryDialogueTreeCatalogRepository } from "../testing/InMemoryDialogueTreeCatalogRepository";

describe("DialogueTreeCatalogService", () => {
	it("exposes the training broker tree with four nodes and three options", async () => {
		const service = createService();

		const nodes = await service.listNodesByNpcId("training-broker");
		const options = await service.listOptionsByNodeId(
			"training-broker-opening",
		);

		expect(nodes.success).toBe(true);
		expect(options.success).toBe(true);
		if (!nodes.success || !options.success) {
			return;
		}
		expect(nodes.data).toHaveLength(4);
		expect(options.data.map((option) => option.choiceId)).toEqual([
			"persuade",
			"bargain",
			"threaten",
		]);
	});

	it("exposes the training informant tree with one blocked pressure option", async () => {
		const service = createService();

		const nodes = await service.listNodesByNpcId("training-informant");
		const options = await service.listOptionsByNodeId(
			"training-informant-opening",
		);

		expect(nodes.success).toBe(true);
		expect(options.success).toBe(true);
		if (!nodes.success || !options.success) {
			return;
		}
		expect(nodes.data.map((node) => node.id)).toEqual([
			"training-informant-opening",
			"training-informant-persuade-response",
			"training-informant-bargain-response",
			"training-informant-threaten-response",
		]);
		expect(options.data).toEqual([
			expect.objectContaining({
				id: "training-informant-option-persuade",
				choiceId: "persuade",
			}),
			expect.objectContaining({
				id: "training-informant-option-bargain",
				choiceId: "bargain",
			}),
			expect.objectContaining({
				id: "training-informant-option-threaten",
				choiceId: "threaten",
				minimumMentalHp: 7,
				blockedReason:
					"Exige HP mental 7 ou maior para pressionar o informante sem quebrar a cena.",
			}),
		]);
	});

	it("exposes the training captain tree with duty, escort cost, and pressure options", async () => {
		const service = createService();

		const nodes = await service.listNodesByNpcId("training-captain");
		const options = await service.listOptionsByNodeId(
			"training-captain-opening",
		);

		expect(nodes.success).toBe(true);
		expect(options.success).toBe(true);
		if (!nodes.success || !options.success) {
			return;
		}
		expect(nodes.data.map((node) => node.id)).toEqual([
			"training-captain-opening",
			"training-captain-persuade-response",
			"training-captain-bargain-response",
			"training-captain-threaten-response",
		]);
		expect(
			nodes.data.every(
				(node) =>
					node.sourceFile === "docs/system/survival/06-npcs-e-aliados.md",
			),
		).toBe(true);
		expect(options.data).toEqual([
			expect.objectContaining({
				id: "training-captain-option-persuade",
				choiceId: "persuade",
			}),
			expect.objectContaining({
				id: "training-captain-option-bargain",
				choiceId: "bargain",
				minimumFactionFame: 1,
				factionFameBlockedReason:
					"Exige Fama 1 com a facção do capitão para negociar custo de escolta.",
			}),
			expect.objectContaining({
				id: "training-captain-option-threaten",
				choiceId: "threaten",
				minimumMentalHp: 8,
				blockedReason:
					"Exige HP mental 8 ou maior para pressionar o capitão sem quebrar a moral da tropa.",
			}),
		]);
	});

	it("keeps technical ids in English ASCII", () => {
		const technicalId = /^[a-z][a-z0-9-]*$/;

		for (const node of DIALOGUE_NODE_CATALOG) {
			expect(node.id).toMatch(technicalId);
			expect(node.npcId).toMatch(technicalId);
		}
		for (const option of DIALOGUE_OPTION_CATALOG) {
			expect(option.id).toMatch(technicalId);
			expect(option.nodeId).toMatch(technicalId);
			expect(option.choiceId).toMatch(technicalId);
			expect(option.nextNodeId).toMatch(technicalId);
		}
	});

	it("ensures options point to existing nodes and dialogue choices", () => {
		const nodeIds = new Set(DIALOGUE_NODE_CATALOG.map((node) => node.id));
		const choiceIds = new Set(
			DIALOGUE_CHOICE_CATALOG.map((choice) => choice.id),
		);

		for (const option of DIALOGUE_OPTION_CATALOG) {
			expect(nodeIds.has(option.nodeId)).toBe(true);
			expect(nodeIds.has(option.nextNodeId)).toBe(true);
			expect(choiceIds.has(option.choiceId)).toBe(true);
		}
	});

	it("finds a dialogue node by id", async () => {
		const service = createService();

		const found = await service.findNodeById("training-broker-opening");

		expect(found).toMatchObject({
			success: true,
			data: {
				label: "Abertura da corretora",
				kind: "start",
				sourceFile: "docs/system/survival/regras-negociacao.md",
			},
		});
	});

	it("lists options by node in stable order", async () => {
		const service = createService();

		const result = await service.listOptionsByNodeId("training-broker-opening");

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.map((option) => option.label)).toEqual([
			"Persuadir",
			"Barganhar",
			"Pressionar",
		]);
	});

	it("exposes optional mental HP requirements for gated dialogue options", async () => {
		const service = createService();

		const result = await service.listOptionsByNodeId("training-broker-opening");

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		const [persuade, bargain, threaten] = result.data;
		expect(persuade).toMatchObject({ id: "training-broker-option-persuade" });
		expect(persuade).not.toHaveProperty("minimumMentalHp");
		expect(persuade).not.toHaveProperty("blockedReason");
		expect(bargain).toMatchObject({ id: "training-broker-option-bargain" });
		expect(bargain).not.toHaveProperty("minimumMentalHp");
		expect(bargain).not.toHaveProperty("blockedReason");
		expect(threaten).toMatchObject({
			id: "training-broker-option-threaten",
			minimumMentalHp: 6,
			blockedReason:
				"Exige HP mental 6 ou maior para sustentar a pressão social.",
		});
	});

	it("validates optional WorldState and Fame dialogue requirements", () => {
		const validWorldStateRequirement = dialogueOptionSelectSchema.safeParse({
			...DIALOGUE_OPTION_CATALOG[0],
			requiredWorldStateKey: "npc:training-broker:trusted",
			requiredWorldStateValue: true,
			worldStateBlockedReason: "Exige confiança registrada com este NPC.",
		});
		const invalidWorldStateNamespace = dialogueOptionSelectSchema.safeParse({
			...DIALOGUE_OPTION_CATALOG[0],
			requiredWorldStateKey: "system:training-broker:trusted",
			requiredWorldStateValue: true,
			worldStateBlockedReason: "Exige confiança registrada com este NPC.",
		});
		const missingFameReason = dialogueOptionSelectSchema.safeParse({
			...DIALOGUE_OPTION_CATALOG[0],
			minimumFactionFame: 1,
		});

		expect(validWorldStateRequirement.success).toBe(true);
		expect(invalidWorldStateNamespace.success).toBe(false);
		expect(missingFameReason.success).toBe(false);
	});

	it("rejects invalid ids without calling the repository", async () => {
		const repository = new InMemoryDialogueTreeCatalogRepository();
		repository.failNextCall();
		const service = new DialogueTreeCatalogService(repository);

		const invalidNpc = await service.listNodesByNpcId("NPC INVÁLIDO");
		const invalidNode = await service.findNodeById("node inválido");
		const invalidOptions = await service.listOptionsByNodeId("node inválido");

		expect(invalidNpc).toMatchObject({
			success: false,
			error: { code: "INVALID_NPC_ID" },
		});
		expect(invalidNode).toMatchObject({
			success: false,
			error: { code: "INVALID_DIALOGUE_NODE_ID" },
		});
		expect(invalidOptions).toMatchObject({
			success: false,
			error: { code: "INVALID_DIALOGUE_NODE_ID" },
		});
	});

	it("returns a typed failure for missing nodes", async () => {
		const service = createService();

		const result = await service.findNodeById("missing-node");

		expect(result).toMatchObject({
			success: false,
			error: { code: "MISSING_DIALOGUE_NODE" },
		});
	});

	it("returns a typed failure for corrupted node records", async () => {
		const service = new DialogueTreeCatalogService(
			new InMemoryDialogueTreeCatalogRepository([
				{ ...DIALOGUE_NODE_CATALOG[0], label: "" } as DialogueNodeRecord,
			]),
		);

		const result = await service.listNodesByNpcId("training-broker");

		expect(result).toMatchObject({
			success: false,
			error: { code: "CORRUPTED_DIALOGUE_NODE_RECORD" },
		});
	});

	it("returns a typed failure for corrupted found nodes", async () => {
		const service = new DialogueTreeCatalogService(
			new InMemoryDialogueTreeCatalogRepository([
				{ ...DIALOGUE_NODE_CATALOG[0], bodyText: "" } as DialogueNodeRecord,
			]),
		);

		const result = await service.findNodeById("training-broker-opening");

		expect(result).toMatchObject({
			success: false,
			error: { code: "CORRUPTED_DIALOGUE_NODE_RECORD" },
		});
	});

	it("returns a typed failure for corrupted option records", async () => {
		const service = new DialogueTreeCatalogService(
			new InMemoryDialogueTreeCatalogRepository(DIALOGUE_NODE_CATALOG, [
				{
					...DIALOGUE_OPTION_CATALOG[0],
					visibleText: "",
				} as DialogueOptionRecord,
			]),
		);

		const result = await service.listOptionsByNodeId("training-broker-opening");

		expect(result).toMatchObject({
			success: false,
			error: { code: "CORRUPTED_DIALOGUE_OPTION_RECORD" },
		});
	});

	it("returns repository failures while listing nodes", async () => {
		const repository = new InMemoryDialogueTreeCatalogRepository();
		repository.failNextCall();
		const service = new DialogueTreeCatalogService(repository);

		const result = await service.listNodesByNpcId("training-broker");

		expect(result).toMatchObject({
			success: false,
			error: { code: "REPOSITORY_FAILURE" },
		});
	});

	it("returns repository failures while finding nodes", async () => {
		const repository = new InMemoryDialogueTreeCatalogRepository();
		repository.failNextCall();
		const service = new DialogueTreeCatalogService(repository);

		const result = await service.findNodeById("training-broker-opening");

		expect(result).toMatchObject({
			success: false,
			error: { code: "REPOSITORY_FAILURE" },
		});
	});

	it("returns repository failures while listing options", async () => {
		const repository = new InMemoryDialogueTreeCatalogRepository();
		repository.failNextCall();
		const service = new DialogueTreeCatalogService(repository);

		const result = await service.listOptionsByNodeId("training-broker-opening");

		expect(result).toMatchObject({
			success: false,
			error: { code: "REPOSITORY_FAILURE" },
		});
	});
});

function createService(): DialogueTreeCatalogService {
	return new DialogueTreeCatalogService(
		new InMemoryDialogueTreeCatalogRepository(),
	);
}
