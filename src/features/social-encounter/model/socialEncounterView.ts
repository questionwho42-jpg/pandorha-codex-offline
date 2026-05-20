import type { NpcRecord } from "$lib/entities/npc";
import type {
	SocialEncounterFailure,
	SocialEncounterState,
} from "./socialEncounterTypes";

export interface SocialEncounterNpcOptionView {
	readonly id: string;
	readonly label: string;
	readonly summary: string;
}

export interface SocialEncounterView {
	readonly appealButtonLabel: string;
	readonly attitudeLabel: string;
	readonly canAppeal: boolean;
	readonly canStart: boolean;
	readonly emptyStateLabel: string | null;
	readonly errorMessage: string | null;
	readonly logLines: readonly string[];
	readonly mentalHpLabel: string;
	readonly npcOptions: readonly SocialEncounterNpcOptionView[];
	readonly patienceLabel: string;
	readonly progressLabel: string;
	readonly selectedNpcSummary: string;
	readonly startButtonLabel: string;
	readonly statusLabel: string;
	readonly titleLabel: string;
}

export interface SocialEncounterViewInput {
	readonly errorMessage: string | null;
	readonly npcs: readonly NpcRecord[];
	readonly selectedNpcId: string;
	readonly state: SocialEncounterState | null;
}

export function createSocialEncounterView(
	input: SocialEncounterViewInput,
): SocialEncounterView {
	const selectedNpc = input.npcs.find((npc) => npc.id === input.selectedNpcId);
	const npcOptions = input.npcs.map((npc) => ({
		id: npc.id,
		label: npc.label,
		summary: npc.summary,
	}));

	return {
		appealButtonLabel: "Fazer apelo",
		attitudeLabel: input.state
			? `Atitude: ${mapAttitude(input.state.attitude)}`
			: "Atitude: sem negociação",
		canAppeal: input.state?.status === "active",
		canStart: Boolean(selectedNpc),
		emptyStateLabel:
			input.npcs.length === 0
				? "Nenhum NPC de treino está disponível para negociação."
				: null,
		errorMessage: input.errorMessage,
		logLines: input.state
			? input.state.log
			: ["Inicie uma negociação para registrar apelos sociais."],
		mentalHpLabel: input.state
			? `HP mental ${input.state.mentalHpCurrent}/${input.state.mentalHpMax}`
			: "HP mental --/--",
		npcOptions,
		patienceLabel: input.state
			? `Paciência ${input.state.patienceCurrent}/${input.state.patienceMax}`
			: "Paciência --/--",
		progressLabel: input.state
			? `Persuasão ${input.state.persuasionProgress}/${input.state.persuasionTarget}`
			: "Persuasão 0/0",
		selectedNpcSummary:
			selectedNpc?.summary ??
			"Selecione um NPC de treino para iniciar a negociação.",
		startButtonLabel: input.state
			? "Reiniciar negociação"
			: "Iniciar negociação",
		statusLabel: input.state
			? mapStatus(input.state.status)
			: "Nenhuma negociação ativa",
		titleLabel: "Negociação social",
	};
}

export function mapSocialEncounterFailureToMessage(
	failure: SocialEncounterFailure,
): string {
	switch (failure.code) {
		case "INVALID_SOCIAL_ENCOUNTER_INPUT":
			return "Revise os dados da negociação antes de continuar.";
		case "NPC_LOOKUP_FAILED":
			return "Não foi possível encontrar este NPC de treino.";
		case "SOCIAL_ENCOUNTER_NOT_ACTIVE":
			return "Esta negociação já foi encerrada. Reinicie para tentar outro apelo.";
		case "INVALID_SOCIAL_APPEAL_COMMAND":
			return "Este apelo social ainda não está disponível nesta versão.";
		case "ACTION_QUEUE_FAILED":
			return "Não foi possível processar o apelo na fila de ações.";
	}
}

function mapAttitude(attitude: SocialEncounterState["attitude"]): string {
	switch (attitude) {
		case "friendly":
			return "Amigável";
		case "neutral":
			return "Neutra";
		case "skeptical":
			return "Desconfiada";
		case "hostile":
			return "Hostil";
	}
}

function mapStatus(status: SocialEncounterState["status"]): string {
	switch (status) {
		case "active":
			return "Negociação ativa";
		case "convinced":
			return "NPC convencido";
		case "walked-away":
			return "NPC encerrou a conversa";
	}
}
