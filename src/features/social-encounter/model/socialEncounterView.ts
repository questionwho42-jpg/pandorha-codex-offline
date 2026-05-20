import type { CharacterRecord } from "$lib/entities/character";
import type { NpcRecord } from "$lib/entities/npc";
import type { SocialAppealResolutionResult } from "./socialAppealResolutionTypes";
import type {
	SocialEncounterFailure,
	SocialEncounterState,
} from "./socialEncounterTypes";

export interface SocialEncounterCharacterOptionView {
	readonly id: string;
	readonly label: string;
	readonly summary: string;
}

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
	readonly characterOptions: readonly SocialEncounterCharacterOptionView[];
	readonly emptyStateLabel: string | null;
	readonly errorMessage: string | null;
	readonly logLines: readonly string[];
	readonly mentalHpLabel: string;
	readonly npcOptions: readonly SocialEncounterNpcOptionView[];
	readonly patienceLabel: string;
	readonly progressLabel: string;
	readonly resolutionLabel: string;
	readonly resolutionSummaryLabel: string | null;
	readonly selectedCharacterSummary: string;
	readonly selectedNpcSummary: string;
	readonly startButtonLabel: string;
	readonly statusLabel: string;
	readonly titleLabel: string;
}

export interface SocialEncounterViewInput {
	readonly characters: readonly CharacterRecord[];
	readonly errorMessage: string | null;
	readonly lastResolution: SocialAppealResolutionResult | null;
	readonly npcs: readonly NpcRecord[];
	readonly selectedActorId: string;
	readonly selectedNpcId: string;
	readonly state: SocialEncounterState | null;
}

export function createSocialEncounterView(
	input: SocialEncounterViewInput,
): SocialEncounterView {
	const selectedNpc = input.npcs.find((npc) => npc.id === input.selectedNpcId);
	const selectedCharacter = input.characters.find(
		(character) => character.id === input.selectedActorId,
	);
	const characterOptions = input.characters.map((character) => ({
		id: character.id,
		label: character.name,
		summary: createCharacterSummary(character),
	}));
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
		canAppeal: input.state?.status === "active" && Boolean(selectedCharacter),
		canStart: Boolean(selectedNpc && selectedCharacter),
		characterOptions,
		emptyStateLabel:
			input.npcs.length === 0
				? "Nenhum NPC de treino está disponível para negociação."
				: input.characters.length === 0
					? "Crie um personagem na aba Personagens antes de iniciar uma negociação."
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
		resolutionLabel: input.lastResolution
			? createResolutionLabel(input.lastResolution)
			: "Nenhum apelo resolvido nesta negociação.",
		resolutionSummaryLabel: input.lastResolution?.summary ?? null,
		selectedCharacterSummary:
			selectedCharacter !== undefined
				? createCharacterSummary(selectedCharacter)
				: "Selecione um personagem da sessão para negociar.",
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

export function mapSocialAppealResolutionFailureToMessage(): string {
	return "Não foi possível resolver o teste social deste apelo.";
}

function createCharacterSummary(character: CharacterRecord): string {
	return `Nível ${character.level}; Social ${character.social}; Interação ${character.interaction}.`;
}

function createResolutionLabel(result: SocialAppealResolutionResult): string {
	const { breakdown } = result.resolution;
	return `Rolagem ${breakdown.naturalRoll} + Nível ${breakdown.level} + Social ${breakdown.axisValue} + Interação ${breakdown.applicationValue} + Bônus ${breakdown.itemBonus} = ${result.resolution.total} contra DC ${result.resolution.dc}. Grau: ${mapResolutionDegree(result.resolution.degree)}.`;
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

function mapResolutionDegree(
	degree: SocialAppealResolutionResult["resolution"]["degree"],
): string {
	switch (degree) {
		case "criticalSuccess":
			return "sucesso crítico";
		case "success":
			return "sucesso";
		case "successWithCost":
			return "sucesso com custo";
		case "failure":
			return "falha";
	}
}
