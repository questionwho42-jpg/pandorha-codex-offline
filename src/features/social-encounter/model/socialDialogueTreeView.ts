import type {
	DialogueNodeRecord,
	DialogueOptionRecord,
} from "$lib/entities/dialogue-tree";
import type { SocialEncounterState } from "./socialEncounterTypes";

export interface SocialDialogueOptionView {
	readonly id: string;
	readonly label: string;
	readonly visibleText: string;
	readonly choiceId: string;
}

export interface SocialDialogueTreeView {
	readonly canChooseOption: boolean;
	readonly currentNodeId: string | null;
	readonly currentNodeText: string;
	readonly options: readonly SocialDialogueOptionView[];
	readonly stateLabel: string;
}

export interface SocialDialogueTreeViewInput {
	readonly nodes: readonly DialogueNodeRecord[];
	readonly options: readonly DialogueOptionRecord[];
	readonly selectedNpcId: string;
	readonly state: SocialEncounterState | null;
}

export function createSocialDialogueTreeView(
	input: SocialDialogueTreeViewInput,
): SocialDialogueTreeView {
	const startNode = input.nodes.find(
		(node) => node.npcId === input.selectedNpcId && node.kind === "start",
	);
	if (!startNode) {
		return {
			canChooseOption: false,
			currentNodeId: null,
			currentNodeText: "Nenhuma árvore de diálogo disponível para este NPC.",
			options: [],
			stateLabel: "Diálogo indisponível.",
		};
	}

	const currentNode = input.state
		? replayCurrentNode(startNode, input.nodes, input.options, input.state)
		: startNode;
	const availableOptions = input.state
		? input.options
				.filter((option) => option.nodeId === currentNode.id)
				.sort((left, right) => left.sortOrder - right.sortOrder)
				.map((option) => ({
					id: option.id,
					label: option.label,
					visibleText: option.visibleText,
					choiceId: option.choiceId,
				}))
		: [];

	return {
		canChooseOption:
			input.state?.status === "active" && availableOptions.length > 0,
		currentNodeId: currentNode.id,
		currentNodeText: currentNode.bodyText,
		options: availableOptions,
		stateLabel: createStateLabel(input.state, availableOptions.length),
	};
}

export function resolveDialogueChoiceIdFromEvents(
	events: SocialEncounterState["events"],
	options: readonly DialogueOptionRecord[],
	fallbackChoiceId: string,
): string {
	const selectedEvent = [...events]
		.reverse()
		.find((event) => event.type === "dialogue-option-selected");
	if (!selectedEvent?.commandId) {
		return fallbackChoiceId;
	}

	return (
		options.find((option) => option.id === selectedEvent.commandId)?.choiceId ??
		fallbackChoiceId
	);
}

function replayCurrentNode(
	startNode: DialogueNodeRecord,
	nodes: readonly DialogueNodeRecord[],
	options: readonly DialogueOptionRecord[],
	state: SocialEncounterState,
): DialogueNodeRecord {
	let currentNode = startNode;
	for (const event of state.events) {
		if (event.type !== "dialogue-option-selected" || !event.commandId) {
			continue;
		}

		const selectedOption = options.find(
			(option) =>
				option.nodeId === currentNode.id && option.id === event.commandId,
		);
		const nextNode = nodes.find(
			(node) => node.id === selectedOption?.nextNodeId,
		);
		if (nextNode) {
			currentNode = nextNode;
		}
	}

	return currentNode;
}

function createStateLabel(
	state: SocialEncounterState | null,
	optionCount: number,
): string {
	if (!state) {
		return "Inicie a negociação para escolher uma fala.";
	}

	if (state.status !== "active") {
		return "Esta negociação já foi encerrada.";
	}

	return optionCount > 0
		? "Escolha uma fala antes de fazer o apelo."
		: "Argumento escolhido. Faça o apelo social para resolver a tentativa.";
}
