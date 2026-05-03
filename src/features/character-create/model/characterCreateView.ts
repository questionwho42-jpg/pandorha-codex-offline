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
			return "A soma de Físico, Mental e Social deve ser exatamente 6.";
		case "INVALID_APPLICATION_DISTRIBUTION":
			return "A soma de Conflito, Interação e Resistência deve ser exatamente 6.";
		case "INVALID_TIER_CAP":
			return "Um dos valores ultrapassa o limite permitido para o nível atual.";
		case "INVALID_CHARACTER_INPUT":
			return "Revise os campos obrigatórios antes de criar o personagem.";
		case "INVALID_CHARACTER_RECORD":
			return "O personagem foi montado com dados inválidos. Revise o formulário.";
		case "REPOSITORY_WRITE_FAILED":
			return "Não foi possível salvar o personagem nesta sessão.";
	}
}
