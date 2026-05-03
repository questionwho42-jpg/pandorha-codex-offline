import type {
	CharacterCreateInput,
	CharacterFailure,
} from "$lib/entities/character";

export type CharacterCreateDraft = {
	name: string;
	concept: string;
	ancestryId: string;
	classId: string;
	backgroundId: string;
	level: number;
	physical: number;
	mental: number;
	social: number;
	conflict: number;
	interaction: number;
	resistance: number;
};

export function createDefaultCharacterCreateDraft(): CharacterCreateDraft {
	return {
		name: "",
		concept: "",
		ancestryId: "human",
		classId: "vanguarda",
		backgroundId: "abrigo-da-fe",
		level: 1,
		physical: 2,
		mental: 2,
		social: 2,
		conflict: 2,
		interaction: 2,
		resistance: 2,
	};
}

export function toCharacterCreateInput(
	draft: CharacterCreateDraft,
): CharacterCreateInput {
	return {
		name: draft.name,
		concept: draft.concept,
		ancestryId: draft.ancestryId,
		classId: draft.classId,
		backgroundId: draft.backgroundId,
		level: draft.level,
		physical: draft.physical,
		mental: draft.mental,
		social: draft.social,
		conflict: draft.conflict,
		interaction: draft.interaction,
		resistance: draft.resistance,
	};
}

export function mapCharacterCreateFailure(failure: CharacterFailure): string {
	switch (failure.code) {
		case "INVALID_AXIS_DISTRIBUTION":
			return `Os Eixos somam ${formatNumberDetail(failure.details?.received)}. Ajuste Físico, Mental e Social para somarem exatamente 6.`;
		case "INVALID_APPLICATION_DISTRIBUTION":
			return `As Aplicações somam ${formatNumberDetail(failure.details?.received)}. Ajuste Conflito, Interação e Resistência para somarem exatamente 6.`;
		case "INVALID_TIER_CAP":
			return `${formatFieldDetail(failure.details?.field)} está em ${formatNumberDetail(failure.details?.received)}, mas o limite para o nível atual é ${formatNumberDetail(failure.details?.cap)}.`;
		case "INVALID_CHARACTER_INPUT":
			return "Preencha nome, conceito e todos os campos numéricos antes de criar o personagem.";
		case "INVALID_CHARACTER_RECORD":
			return "O personagem foi montado com dados inválidos. Revise o formulário e tente novamente.";
		case "REPOSITORY_WRITE_FAILED":
			return "Não foi possível salvar o personagem nesta sessão. Tente criar novamente.";
	}
}

function formatNumberDetail(value: unknown): string {
	if (typeof value === "number") {
		return String(value);
	}

	return "um valor inválido";
}

function formatFieldDetail(value: unknown): string {
	if (typeof value !== "string") {
		return "Um campo";
	}

	const labels: Readonly<Record<string, string>> = {
		conflict: "Conflito",
		interaction: "Interação",
		mental: "Mental",
		physical: "Físico",
		resistance: "Resistência",
		social: "Social",
	};

	return labels[value] ?? "Um campo";
}
