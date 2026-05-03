import type { CharacterRecord } from "$lib/entities/character";

export type CharacterListStat = Readonly<{
	label: string;
	value: number;
}>;

export type CharacterListItem = Readonly<{
	id: string;
	name: string;
	concept: string;
	levelLabel: string;
	identityLabel: string;
	axes: readonly CharacterListStat[];
	applications: readonly CharacterListStat[];
}>;

export type CharacterListEmptyState = Readonly<{
	title: string;
	description: string;
}>;

export type CharacterListView = Readonly<{
	countLabel: string;
	emptyState?: CharacterListEmptyState;
	items: readonly CharacterListItem[];
}>;

export function createCharacterListView(
	characters: readonly CharacterRecord[],
): CharacterListView {
	const items = characters.map(toCharacterListItem);

	if (items.length === 0) {
		return {
			countLabel: "Nenhum personagem",
			emptyState: {
				title: "Nenhum personagem criado ainda",
				description:
					"Use o formulário de criação para adicionar o primeiro personagem desta sessão.",
			},
			items,
		};
	}

	return {
		countLabel: `${items.length} ${items.length === 1 ? "personagem" : "personagens"}`,
		items,
	};
}

function toCharacterListItem(character: CharacterRecord): CharacterListItem {
	return {
		id: character.id,
		name: character.name,
		concept: character.concept,
		levelLabel: `Nível ${character.level}`,
		identityLabel: `Ancestralidade ${character.ancestryId} · Classe ${character.classId}`,
		axes: [
			{ label: "Físico", value: character.physical },
			{ label: "Mental", value: character.mental },
			{ label: "Social", value: character.social },
		],
		applications: [
			{ label: "Conflito", value: character.conflict },
			{ label: "Interação", value: character.interaction },
			{ label: "Resistência", value: character.resistance },
		],
	};
}
