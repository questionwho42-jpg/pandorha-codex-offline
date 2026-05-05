import type { AncestryRecord } from "$lib/entities/ancestry";
import type { BackgroundRecord } from "$lib/entities/background";
import type { CharacterRecord } from "$lib/entities/character";
import type { CharacterClassRecord } from "$lib/entities/character-class";

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

export type CharacterListCatalogs = Readonly<{
	ancestries?: readonly AncestryRecord[];
	backgrounds?: readonly BackgroundRecord[];
	characterClasses?: readonly CharacterClassRecord[];
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
	catalogs: CharacterListCatalogs = {},
): CharacterListView {
	const labelMaps = createLabelMaps(catalogs);
	const items = characters.map((character) =>
		toCharacterListItem(character, labelMaps),
	);

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

type CharacterListLabelMaps = Readonly<{
	ancestryLabels: ReadonlyMap<string, string>;
	backgroundLabels: ReadonlyMap<string, string>;
	classLabels: ReadonlyMap<string, string>;
}>;

function toCharacterListItem(
	character: CharacterRecord,
	labelMaps: CharacterListLabelMaps,
): CharacterListItem {
	return {
		id: character.id,
		name: character.name,
		concept: character.concept,
		levelLabel: `Nível ${character.level}`,
		identityLabel: [
			labelMaps.ancestryLabels.get(character.ancestryId) ??
				character.ancestryId,
			labelMaps.classLabels.get(character.classId) ?? character.classId,
			labelMaps.backgroundLabels.get(character.backgroundId) ??
				character.backgroundId,
		].join(" · "),
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

function createLabelMaps(
	catalogs: CharacterListCatalogs,
): CharacterListLabelMaps {
	return {
		ancestryLabels: createLabelMap(catalogs.ancestries ?? []),
		backgroundLabels: createLabelMap(catalogs.backgrounds ?? []),
		classLabels: createLabelMap(catalogs.characterClasses ?? []),
	};
}

function createLabelMap(
	records: readonly { id: string; label: string }[],
): ReadonlyMap<string, string> {
	return new Map(records.map((record) => [record.id, record.label]));
}
