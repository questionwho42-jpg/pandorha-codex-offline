import type { DialogueNodeRecord } from "$lib/entities/dialogue-tree";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { evaluateDialogueOptionAvailability } from "../model/dialogueOptionAvailability";
import {
	dialogueTraversalCurrentNodeInputSchema,
	dialogueTraversalSelectInputSchema,
	formatDialogueTraversalIssues,
} from "../model/dialogueTraversalSchemas";
import type {
	DialogueTraversalFailure,
	DialogueTraversalResult,
	DialogueTraversalTreePort,
} from "../model/dialogueTraversalTypes";
import type { SocialEncounterEvent } from "../model/socialEncounterTypes";

/**
 * @description Navigates a read-only dialogue tree and emits social ledger events without adding save v5.
 * @rule docs/architecture/blueprint.md - social dialogue uses dialogue nodes and dialogue options.
 * @rule docs/system/survival/regras-negociacao.md - social negotiations should avoid repeated argument spam and expose chosen arguments.
 */
export class DialogueTraversalService {
	public constructor(private readonly tree: DialogueTraversalTreePort) {}

	public async selectOption(
		input: unknown,
	): Promise<Result<DialogueTraversalResult, DialogueTraversalFailure>> {
		const parsed = dialogueTraversalSelectInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail({
				code: "INVALID_DIALOGUE_TRAVERSAL_INPUT",
				message: "Dialogue traversal input failed validation.",
				details: { issues: formatDialogueTraversalIssues(parsed.error.issues) },
			});
		}

		const currentNode = await this.findNodeForNpc(
			parsed.data.currentNodeId,
			parsed.data.npcId,
		);
		if (!currentNode.success) {
			return fail(currentNode.error);
		}

		const options = await this.tree.listOptionsByNodeId(currentNode.data.id);
		if (!options.success) {
			return fail({
				code: "DIALOGUE_TREE_LOOKUP_FAILED",
				message: "Could not list dialogue options for the current node.",
				cause: options.error,
			});
		}

		const selectedOption = options.data.find(
			(option) => option.id === parsed.data.optionId,
		);
		if (!selectedOption) {
			return fail({
				code: "DIALOGUE_OPTION_MISSING",
				message: "Selected dialogue option is not available from this node.",
				details: { optionId: parsed.data.optionId },
			});
		}
		const availability = evaluateDialogueOptionAvailability({
			factionFameLevel: parsed.data.factionFameLevel,
			mentalHpCurrent: parsed.data.mentalHpCurrent,
			option: selectedOption,
			worldState: parsed.data.worldState,
		});
		if (!availability.isAvailable) {
			return fail({
				code: "DIALOGUE_OPTION_BLOCKED",
				message: "Selected dialogue option is blocked by current conditions.",
				details: {
					...availability.block.details,
					blockKind: availability.block.kind,
					blockedReason: availability.block.blockedReason,
				},
			});
		}

		const nextNode = await this.findNodeForNpc(
			selectedOption.nextNodeId,
			parsed.data.npcId,
		);
		if (!nextNode.success) {
			return fail(nextNode.error);
		}

		return ok({
			currentNode: currentNode.data,
			selectedOption,
			nextNode: nextNode.data,
			selectedChoiceId: selectedOption.choiceId,
			event: createOptionSelectedEvent(
				selectedOption.id,
				selectedOption.label,
				nextNode.data.bodyText,
				parsed.data.selectedAt,
			),
		});
	}

	public async findCurrentNode(
		input: unknown,
	): Promise<
		Result<
			{ readonly currentNodeId: string; readonly currentNodeText: string },
			DialogueTraversalFailure
		>
	> {
		const parsed = dialogueTraversalCurrentNodeInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail({
				code: "INVALID_DIALOGUE_TRAVERSAL_INPUT",
				message: "Dialogue current-node input failed validation.",
				details: { issues: formatDialogueTraversalIssues(parsed.error.issues) },
			});
		}

		let currentNode = await this.findNodeForNpc(
			parsed.data.startNodeId,
			parsed.data.npcId,
		);
		if (!currentNode.success) {
			return fail(currentNode.error);
		}

		for (const event of parsed.data.events) {
			if (event.type !== "dialogue-option-selected") {
				continue;
			}

			if (!event.commandId) {
				return fail({
					code: "DIALOGUE_OPTION_MISSING",
					message: "Dialogue option event is missing the option id.",
				});
			}

			const nextNode = await this.findNextNodeFromEvent(
				currentNode.data.id,
				event.commandId,
				parsed.data.npcId,
			);
			if (!nextNode.success) {
				return fail(nextNode.error);
			}

			currentNode = nextNode;
		}

		return ok({
			currentNodeId: currentNode.data.id,
			currentNodeText: currentNode.data.bodyText,
		});
	}

	private async findNextNodeFromEvent(
		currentNodeId: string,
		optionId: string,
		npcId: string,
	): Promise<Result<DialogueNodeRecord, DialogueTraversalFailure>> {
		const options = await this.tree.listOptionsByNodeId(currentNodeId);
		if (!options.success) {
			return fail({
				code: "DIALOGUE_TREE_LOOKUP_FAILED",
				message: "Could not replay dialogue option from the event ledger.",
				cause: options.error,
			});
		}

		const selectedOption = options.data.find(
			(option) => option.id === optionId,
		);
		if (!selectedOption) {
			return fail({
				code: "DIALOGUE_OPTION_MISSING",
				message: "Dialogue option event points to an unavailable option.",
				details: { optionId },
			});
		}

		return this.findNodeForNpc(selectedOption.nextNodeId, npcId);
	}

	private async findNodeForNpc(
		nodeId: string,
		npcId: string,
	): Promise<Result<DialogueNodeRecord, DialogueTraversalFailure>> {
		const node = await this.tree.findNodeById(nodeId);
		if (!node.success) {
			return fail({
				code: "DIALOGUE_TREE_LOOKUP_FAILED",
				message: "Could not find dialogue node.",
				cause: node.error,
			});
		}

		if (node.data.npcId !== npcId) {
			return fail({
				code: "DIALOGUE_NODE_MISMATCH",
				message: "Dialogue node does not belong to the selected NPC.",
				details: { nodeId, npcId },
			});
		}

		return ok(node.data);
	}
}

function createOptionSelectedEvent(
	optionId: string,
	optionLabel: string,
	nextNodeText: string,
	selectedAt: string,
): SocialEncounterEvent {
	return {
		type: "dialogue-option-selected",
		message: `Opção de diálogo escolhida: ${optionLabel}. ${nextNodeText}`,
		createdAt: selectedAt,
		commandId: optionId,
	};
}
