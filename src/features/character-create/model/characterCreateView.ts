import type { AncestryTraitFailure } from "$lib/entities/ancestry";
import type {
	CharacterCreateInput,
	CharacterFailure,
} from "$lib/entities/character";

const DEFAULT_HUMAN_TRAIT_IDS = [
	"human-diligencia-erudita",
	"human-lingua-de-prata",
	"human-vontade-indomavel",
] as const;

export type CharacterCreateDraft = {
	name: string;
	concept: string;
	ancestryId: string;
	ancestryTraitIds: string[];
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
		ancestryTraitIds: [...DEFAULT_HUMAN_TRAIT_IDS],
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

export function changeCharacterDraftAncestry(
	draft: CharacterCreateDraft,
	ancestryId: string,
	availableTraitIds: readonly string[],
): CharacterCreateDraft {
	return {
		...draft,
		ancestryId,
		ancestryTraitIds: availableTraitIds.slice(0, 3),
	};
}

export function toggleCharacterDraftTrait(
	draft: CharacterCreateDraft,
	traitId: string,
	checked: boolean,
): CharacterCreateDraft {
	const ancestryTraitIds = checked
		? appendUnique(draft.ancestryTraitIds, traitId)
		: draft.ancestryTraitIds.filter(
				(selectedTraitId) => selectedTraitId !== traitId,
			);

	return {
		...draft,
		ancestryTraitIds,
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

export function toAncestryTraitSelectionInput(
	draft: CharacterCreateDraft,
): Readonly<{ ancestryId: string; traitIds: readonly string[] }> {
	return {
		ancestryId: draft.ancestryId,
		traitIds: draft.ancestryTraitIds,
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

export function mapAncestryTraitSelectionFailure(
	failure: AncestryTraitFailure,
): string {
	switch (failure.code) {
		case "INVALID_ANCESTRY_TRAIT_SELECTION":
			return "Escolha exatamente 3 traços da ancestralidade selecionada.";
		case "DUPLICATE_ANCESTRY_TRAIT_SELECTION":
			return "Remova traços repetidos e mantenha exatamente 3 escolhas.";
		case "ANCESTRY_TRAIT_ANCESTRY_MISMATCH":
			return "Um dos traços escolhidos não pertence à ancestralidade selecionada. Escolha novamente.";
		case "ANCESTRY_TRAIT_NOT_FOUND":
			return "Um dos traços escolhidos não está disponível nesta versão. Escolha outro traço.";
		case "INVALID_ANCESTRY_ID":
			return "Escolha uma ancestralidade válida antes de criar o personagem.";
		case "ANCESTRY_TRAIT_REPOSITORY_READ_FAILED":
			return "Não foi possível validar os traços nesta sessão. Tente criar novamente.";
		case "CORRUPTED_ANCESTRY_TRAIT_RECORD":
			return "Os dados de traços carregados estão inválidos. Recarregue a página e tente novamente.";
		case "CORRUPTED_ANCESTRY_TRAIT_LINK":
			return "A ligação entre ancestralidade e traços está inválida. Recarregue a página e tente novamente.";
	}
}

function appendUnique(values: readonly string[], value: string): string[] {
	if (values.includes(value)) {
		return [...values];
	}

	return [...values, value];
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
