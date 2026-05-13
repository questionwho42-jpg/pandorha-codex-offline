import { describe, expect, it } from "vitest";
import type { AncestryTraitFailure } from "$lib/entities/ancestry";
import type { CharacterFailure } from "$lib/entities/character";
import {
	changeCharacterDraftAncestry,
	createDefaultCharacterCreateDraft,
	mapAncestryTraitSelectionFailure,
	mapCharacterCreateFailure,
	toAncestryTraitSelectionInput,
	toCharacterCreateInput,
	toggleCharacterDraftTrait,
} from "../model/characterCreateView";

describe("character create view model", () => {
	it("creates a default draft that respects the 6/6 distribution and starts with 3 Humano traits", () => {
		const draft = createDefaultCharacterCreateDraft();

		expect(draft).toMatchObject({
			name: "",
			concept: "",
			ancestryId: "human",
			ancestryTraitIds: [
				"human-diligencia-erudita",
				"human-lingua-de-prata",
				"human-vontade-indomavel",
			],
			classId: "vanguard",
			backgroundId: "acolyte",
			level: 1,
		});
		expect(draft.physical + draft.mental + draft.social).toBe(6);
		expect(draft.conflict + draft.interaction + draft.resistance).toBe(6);
	});

	it("maps a draft to the Character service input contract without persisting traits", () => {
		const input = toCharacterCreateInput({
			...createDefaultCharacterCreateDraft(),
			name: "Kael de Almar",
			concept: "Vanguarda protetor da caravana",
			physical: 3,
			mental: 1,
			social: 2,
			conflict: 2,
			interaction: 1,
			resistance: 3,
		});

		expect(input).toEqual({
			name: "Kael de Almar",
			concept: "Vanguarda protetor da caravana",
			ancestryId: "human",
			classId: "vanguard",
			backgroundId: "acolyte",
			level: 1,
			physical: 3,
			mental: 1,
			social: 2,
			conflict: 2,
			interaction: 1,
			resistance: 3,
		});
	});

	it("maps a draft to the ancestry trait selection service input", () => {
		const input = toAncestryTraitSelectionInput({
			...createDefaultCharacterCreateDraft(),
			ancestryId: "elf",
			ancestryTraitIds: [
				"elf-visao-estelar",
				"elf-passo-de-folha",
				"elf-memoria-arcaica",
			],
		});

		expect(input).toEqual({
			ancestryId: "elf",
			traitIds: [
				"elf-visao-estelar",
				"elf-passo-de-folha",
				"elf-memoria-arcaica",
			],
		});
	});

	it("resets selected traits when the draft ancestry changes", () => {
		const draft = changeCharacterDraftAncestry(
			createDefaultCharacterCreateDraft(),
			"umbral",
			[
				"umbral-visao-do-vazio",
				"umbral-passo-silencioso",
				"umbral-toque-de-geada",
				"umbral-aura-de-inquietude",
			],
		);

		expect(draft.ancestryId).toBe("umbral");
		expect(draft.ancestryTraitIds).toEqual([
			"umbral-visao-do-vazio",
			"umbral-passo-silencioso",
			"umbral-toque-de-geada",
		]);
	});

	it("allows the UI to produce invalid trait counts for domain validation", () => {
		const twoTraits = toggleCharacterDraftTrait(
			createDefaultCharacterCreateDraft(),
			"human-vontade-indomavel",
			false,
		);
		const fourTraits = toggleCharacterDraftTrait(
			createDefaultCharacterCreateDraft(),
			"human-maestria-improvisada",
			true,
		);
		const unchangedTraits = toggleCharacterDraftTrait(
			createDefaultCharacterCreateDraft(),
			"human-vontade-indomavel",
			true,
		);

		expect(twoTraits.ancestryTraitIds).toEqual([
			"human-diligencia-erudita",
			"human-lingua-de-prata",
		]);
		expect(fourTraits.ancestryTraitIds).toEqual([
			"human-diligencia-erudita",
			"human-lingua-de-prata",
			"human-vontade-indomavel",
			"human-maestria-improvisada",
		]);
		expect(unchangedTraits.ancestryTraitIds).toEqual([
			"human-diligencia-erudita",
			"human-lingua-de-prata",
			"human-vontade-indomavel",
		]);
	});

	it("translates every character failure code to actionable pt-BR copy", () => {
		expect(
			mapCharacterCreateFailure(
				characterFailure("INVALID_AXIS_DISTRIBUTION", { received: 8 }),
			),
		).toBe(
			"Os Eixos somam 8. Ajuste Físico, Mental e Social para somarem exatamente 6.",
		);
		expect(
			mapCharacterCreateFailure(
				characterFailure("INVALID_APPLICATION_DISTRIBUTION", { received: 5 }),
			),
		).toBe(
			"As Aplicações somam 5. Ajuste Conflito, Interação e Resistência para somarem exatamente 6.",
		);
		expect(
			mapCharacterCreateFailure(
				characterFailure("INVALID_TIER_CAP", {
					cap: 3,
					field: "physical",
					received: 4,
				}),
			),
		).toBe("Físico está em 4, mas o limite para o nível atual é 3.");
		expect(
			mapCharacterCreateFailure(characterFailure("INVALID_CHARACTER_INPUT")),
		).toBe(
			"Preencha nome, conceito e todos os campos numéricos antes de criar o personagem.",
		);
		expect(
			mapCharacterCreateFailure(characterFailure("INVALID_CHARACTER_RECORD")),
		).toBe(
			"O personagem foi montado com dados inválidos. Revise o formulário e tente novamente.",
		);
		expect(
			mapCharacterCreateFailure(characterFailure("REPOSITORY_WRITE_FAILED")),
		).toBe(
			"Não foi possível salvar o personagem nesta sessão. Tente criar novamente.",
		);
	});

	it("uses safe fallback text for missing technical error details", () => {
		expect(
			mapCharacterCreateFailure(characterFailure("INVALID_AXIS_DISTRIBUTION")),
		).toContain("valor");
		expect(
			mapCharacterCreateFailure(
				characterFailure("INVALID_TIER_CAP", {
					cap: "invalid",
					field: 2,
					received: "invalid",
				}),
			),
		).toContain("Um campo");
		expect(
			mapCharacterCreateFailure(
				characterFailure("INVALID_TIER_CAP", {
					cap: 3,
					field: "unknown",
					received: 4,
				}),
			),
		).toContain("Um campo");
	});

	it("translates ancestry trait failures to actionable pt-BR copy", () => {
		expect(
			mapAncestryTraitSelectionFailure(
				ancestryTraitFailure("INVALID_ANCESTRY_TRAIT_SELECTION"),
			),
		).toBe("Escolha exatamente 3 traços da ancestralidade selecionada.");
		expect(
			mapAncestryTraitSelectionFailure(
				ancestryTraitFailure("DUPLICATE_ANCESTRY_TRAIT_SELECTION"),
			),
		).toBe("Remova traços repetidos e mantenha exatamente 3 escolhas.");
		expect(
			mapAncestryTraitSelectionFailure(
				ancestryTraitFailure("ANCESTRY_TRAIT_ANCESTRY_MISMATCH"),
			),
		).toBe(
			"Um dos traços escolhidos não pertence à ancestralidade selecionada. Escolha novamente.",
		);
		expect(
			mapAncestryTraitSelectionFailure(
				ancestryTraitFailure("ANCESTRY_TRAIT_NOT_FOUND"),
			),
		).toBe(
			"Um dos traços escolhidos não está disponível nesta versão. Escolha outro traço.",
		);
		expect(
			mapAncestryTraitSelectionFailure(
				ancestryTraitFailure("INVALID_ANCESTRY_ID"),
			),
		).toBe("Escolha uma ancestralidade válida antes de criar o personagem.");
		expect(
			mapAncestryTraitSelectionFailure(
				ancestryTraitFailure("ANCESTRY_TRAIT_REPOSITORY_READ_FAILED"),
			),
		).toBe(
			"Não foi possível validar os traços nesta sessão. Tente criar novamente.",
		);
		expect(
			mapAncestryTraitSelectionFailure(
				ancestryTraitFailure("CORRUPTED_ANCESTRY_TRAIT_RECORD"),
			),
		).toBe(
			"Os dados de traços carregados estão inválidos. Recarregue a página e tente novamente.",
		);
		expect(
			mapAncestryTraitSelectionFailure(
				ancestryTraitFailure("CORRUPTED_ANCESTRY_TRAIT_LINK"),
			),
		).toBe(
			"A ligação entre ancestralidade e traços está inválida. Recarregue a página e tente novamente.",
		);
	});
});

function characterFailure(
	code: CharacterFailure["code"],
	details: CharacterFailure["details"] = {},
): CharacterFailure {
	return {
		code,
		details,
		message: "technical failure",
	};
}

function ancestryTraitFailure(
	code: AncestryTraitFailure["code"],
	details: AncestryTraitFailure["details"] = {},
): AncestryTraitFailure {
	return {
		code,
		details,
		message: "technical failure",
	};
}
