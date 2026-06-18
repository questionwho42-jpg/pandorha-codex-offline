import { describe, expect, it } from "vitest";
import type {
	AncestryRecord,
	AncestryTraitRecord,
} from "$lib/entities/ancestry";
import type { BackgroundRecord } from "$lib/entities/background";
import type {
	CharacterRecord,
	CharacterTraitSelectionRecord,
} from "$lib/entities/character";
import type { CharacterClassRecord } from "$lib/entities/character-class";
import { createCharacterListView } from "../model/characterListView";

const character: CharacterRecord = {
	id: "character-kael",
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
	createdAt: "2026-05-03T13:14:25.000Z",
	updatedAt: "2026-05-03T13:14:25.000Z",
};

describe("createCharacterListView", () => {
	it("returns an empty state when there are no characters", () => {
		const view = createCharacterListView([]);

		expect(view).toEqual({
			countLabel: "Nenhum personagem",
			emptyState: {
				title: "Nenhum personagem criado ainda",
				description:
					"Use o formulário de criação para adicionar o primeiro personagem desta sessão.",
			},
			items: [],
		});
	});

	it("maps character records to readable list items", () => {
		const view = createCharacterListView([character], {
			ancestries: [{ id: "human", label: "Humano" } as AncestryRecord],
			backgrounds: [{ id: "acolyte", label: "Acólito" } as BackgroundRecord],
			characterClasses: [
				{ id: "vanguard", label: "Vanguarda" } as CharacterClassRecord,
			],
		});

		expect(view.emptyState).toBeUndefined();
		expect(view.countLabel).toBe("1 personagem");
		expect(view.items).toEqual([
			{
				id: "character-kael",
				name: "Kael de Almar",
				concept: "Vanguarda protetor da caravana",
				levelLabel: "Nível 1",
				identityLabel: "Humano · Vanguarda · Acólito",
				axes: [
					{ label: "Físico", value: 3 },
					{ label: "Mental", value: 1 },
					{ label: "Social", value: 2 },
				],
				applications: [
					{ label: "Conflito", value: 2 },
					{ label: "Interação", value: 1 },
					{ label: "Resistência", value: 3 },
				],
			},
		]);
	});

	it("falls back to raw ids when catalog labels are missing", () => {
		const view = createCharacterListView([character]);

		expect(view.items[0]?.identityLabel).toBe("human · vanguard · acolyte");
	});

	it("maps persisted ancestry trait selections with catalog labels and id fallbacks", () => {
		const view = createCharacterListView([character], {
			ancestryTraits: [
				{
					id: "human-lingua-de-prata",
					label: "LÃ­ngua de Prata",
					description: "Sabe escolher as palavras certas.",
				} as AncestryTraitRecord,
				{
					id: "human-diligencia-erudita",
					label: "DiligÃªncia Erudita",
					description: "Aprende com disciplina rara.",
				} as AncestryTraitRecord,
			],
			traitSelections: [
				createTraitSelection("human-lingua-de-prata", 2),
				createTraitSelection("human-missing-trait", 3),
				createTraitSelection("human-diligencia-erudita", 1),
			],
		});

		expect(view.items[0]?.ancestryTraits).toEqual([
			{
				id: "human-diligencia-erudita",
				label: "DiligÃªncia Erudita",
				description: "Aprende com disciplina rara.",
			},
			{
				id: "human-lingua-de-prata",
				label: "LÃ­ngua de Prata",
				description: "Sabe escolher as palavras certas.",
			},
			{
				id: "human-missing-trait",
				label: "human-missing-trait",
				description: "human-missing-trait",
			},
		]);
	});

	it("uses plural count copy for multiple characters", () => {
		const view = createCharacterListView([
			character,
			{ ...character, id: "character-mira", name: "Mira de Umbra" },
		]);

		expect(view.countLabel).toBe("2 personagens");
	});
});

function createTraitSelection(
	traitId: string,
	sequence: 1 | 2 | 3,
): CharacterTraitSelectionRecord {
	return {
		id: `trait-selection-${sequence}`,
		characterId: character.id,
		sequence,
		traitId,
		createdAt: "2026-06-17T20:49:00.000Z",
	};
}
