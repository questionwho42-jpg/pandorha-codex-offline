import type { DialogueOptionRecord } from "$lib/entities/dialogue-tree";
import type {
	WorldStateFlagView,
	WorldStateValue,
} from "$lib/entities/world-state";
import type { SocialEncounterState } from "./socialEncounterTypes";

type SocialEncounterTerminalStatus = Extract<
	SocialEncounterState["status"],
	"convinced" | "walked-away"
>;

export interface SocialEncounterConsequenceView {
	readonly key: string;
	readonly label: string;
	readonly summary: string;
}

export interface SocialEncounterConsequenceValue {
	readonly actorId: string;
	readonly dialogueChoiceId?: string;
	readonly dialogueChoiceLabel?: string;
	readonly dialogueOptionId?: string;
	readonly encounterId: string;
	readonly npcId: string;
	readonly outcome: SocialEncounterTerminalStatus;
	readonly summary: string;
}

export function createSocialEncounterConsequenceFlag(input: {
	readonly state: SocialEncounterState;
	readonly dialogueOptions?: readonly DialogueOptionRecord[];
	readonly updatedAt: string;
}): WorldStateFlagView | null {
	if (!isTerminalSocialEncounter(input.state.status)) {
		return null;
	}

	const selectedOption = findLatestSelectedDialogueOption(
		input.state,
		input.dialogueOptions ?? [],
	);
	const summary = createConsequenceSummary(input.state.status, selectedOption);
	const value = {
		actorId: input.state.actorId,
		...(selectedOption
			? {
					dialogueChoiceId: selectedOption.choiceId,
					dialogueChoiceLabel: selectedOption.label,
					dialogueOptionId: selectedOption.id,
				}
			: {}),
		encounterId: input.state.id,
		npcId: input.state.npcId,
		outcome: input.state.status,
		summary,
	} satisfies SocialEncounterConsequenceValue;

	return {
		key: createSocialEncounterConsequenceKey(input.state),
		value,
		updatedAt: input.updatedAt,
	};
}

export function upsertSocialEncounterConsequenceFlag(
	flags: readonly WorldStateFlagView[],
	flag: WorldStateFlagView,
): readonly WorldStateFlagView[] {
	const withoutCurrent = flags.filter(
		(candidate) => candidate.key !== flag.key,
	);
	return [...withoutCurrent, flag];
}

export function createSocialEncounterConsequenceView(input: {
	readonly state: SocialEncounterState | null;
	readonly worldState: readonly WorldStateFlagView[];
}): SocialEncounterConsequenceView | null {
	if (!input.state || !isTerminalSocialEncounter(input.state.status)) {
		return null;
	}

	const key = createSocialEncounterConsequenceKey(input.state);
	const flag = input.worldState.find((candidate) => candidate.key === key);
	const value = parseConsequenceValue(flag?.value);
	if (!value) {
		return null;
	}

	return {
		key,
		label:
			value.outcome === "convinced"
				? "Consequência: NPC convencido"
				: "Consequência: negociação perdida",
		summary: value.summary,
	};
}

function createSocialEncounterConsequenceKey(
	state: Pick<SocialEncounterState, "npcId" | "status">,
): string {
	return `npc:${state.npcId}:${state.status}`;
}

function createConsequenceSummary(
	status: SocialEncounterTerminalStatus,
	selectedOption: DialogueOptionRecord | null,
): string {
	if (!selectedOption) {
		return status === "convinced"
			? "O NPC aceitou o argumento principal e esta consequência foi registrada no estado do mundo."
			: "O NPC encerrou a conversa sem aceitar o pedido e esta consequência foi registrada no estado do mundo.";
	}

	if (status === "walked-away") {
		switch (selectedOption.choiceId) {
			case "persuade":
				return "A proposta de confiança não sustentou a conversa e esta consequência foi registrada no estado do mundo.";
			case "bargain":
				return "A troca proposta não foi suficiente para manter o NPC na conversa e esta consequência foi registrada no estado do mundo.";
			case "threaten":
				return "A pressão social esgotou a paciência do NPC e esta consequência foi registrada no estado do mundo.";
			default:
				return "O NPC encerrou a conversa sem aceitar o pedido e esta consequência foi registrada no estado do mundo.";
		}
	}

	switch (selectedOption.choiceId) {
		case "persuade":
			return "O NPC aceitou a proposta pela via da confiança e esta consequência foi registrada no estado do mundo.";
		case "bargain":
			return "O NPC aceitou a troca proposta e esta consequência foi registrada no estado do mundo.";
		case "threaten":
			return "O NPC cedeu à pressão social e esta consequência foi registrada no estado do mundo.";
		default:
			return "O NPC aceitou o argumento principal e esta consequência foi registrada no estado do mundo.";
	}
}

function isTerminalSocialEncounter(
	status: SocialEncounterState["status"],
): status is SocialEncounterTerminalStatus {
	return status === "convinced" || status === "walked-away";
}

function parseConsequenceValue(
	value: WorldStateValue | undefined,
): SocialEncounterConsequenceValue | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return null;
	}

	const candidate = value as Partial<
		Record<keyof SocialEncounterConsequenceValue, unknown>
	>;
	if (
		typeof candidate.actorId !== "string" ||
		typeof candidate.encounterId !== "string" ||
		typeof candidate.npcId !== "string" ||
		typeof candidate.summary !== "string" ||
		!isOptionalString(candidate.dialogueChoiceId) ||
		!isOptionalString(candidate.dialogueChoiceLabel) ||
		!isOptionalString(candidate.dialogueOptionId) ||
		(candidate.outcome !== "convinced" && candidate.outcome !== "walked-away")
	) {
		return null;
	}

	return {
		actorId: candidate.actorId,
		...(candidate.dialogueChoiceId
			? { dialogueChoiceId: candidate.dialogueChoiceId }
			: {}),
		...(candidate.dialogueChoiceLabel
			? { dialogueChoiceLabel: candidate.dialogueChoiceLabel }
			: {}),
		...(candidate.dialogueOptionId
			? { dialogueOptionId: candidate.dialogueOptionId }
			: {}),
		encounterId: candidate.encounterId,
		npcId: candidate.npcId,
		outcome: candidate.outcome,
		summary: candidate.summary,
	};
}

function findLatestSelectedDialogueOption(
	state: SocialEncounterState,
	options: readonly DialogueOptionRecord[],
): DialogueOptionRecord | null {
	const selectedEvent = [...state.events]
		.reverse()
		.find((event) => event.type === "dialogue-option-selected");
	if (!selectedEvent?.commandId) {
		return null;
	}

	return (
		options.find((option) => option.id === selectedEvent.commandId) ?? null
	);
}

function isOptionalString(value: unknown): value is string | undefined {
	return value === undefined || typeof value === "string";
}
