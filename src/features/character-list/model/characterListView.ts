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

export type CharacterListStat = Readonly<{
	label: string;
	value: number;
}>;

export type CharacterListTrait = Readonly<{
	id: string;
	label: string;
	description: string;
}>;

export type CharacterListItem = Readonly<{
	id: string;
	name: string;
	concept: string;
	levelLabel: string;
	identityLabel: string;
	ancestryTraits?: readonly CharacterListTrait[];
	axes: readonly CharacterListStat[];
	applications: readonly CharacterListStat[];
}>;

export type CharacterListCatalogs = Readonly<{
	ancestries?: readonly AncestryRecord[];
	ancestryTraits?: readonly AncestryTraitRecord[];
	backgrounds?: readonly BackgroundRecord[];
	characterClasses?: readonly CharacterClassRecord[];
	traitSelections?: readonly CharacterTraitSelectionRecord[];
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
	ancestryTraitDetails: ReadonlyMap<string, CharacterListTrait>;
	backgroundLabels: ReadonlyMap<string, string>;
	classLabels: ReadonlyMap<string, string>;
	traitSelectionsByCharacterId: ReadonlyMap<
		string,
		readonly CharacterTraitSelectionRecord[]
	>;
}>;

function toCharacterListItem(
	character: CharacterRecord,
	labelMaps: CharacterListLabelMaps,
): CharacterListItem {
	const ancestryTraits = toCharacterTraitItems(
		labelMaps.traitSelectionsByCharacterId.get(character.id) ?? [],
		labelMaps.ancestryTraitDetails,
	);

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
		...(ancestryTraits.length > 0 ? { ancestryTraits } : {}),
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
		ancestryTraitDetails: createTraitDetailsMap(catalogs.ancestryTraits ?? []),
		backgroundLabels: createLabelMap(catalogs.backgrounds ?? []),
		classLabels: createLabelMap(catalogs.characterClasses ?? []),
		traitSelectionsByCharacterId: createTraitSelectionsByCharacterId(
			catalogs.traitSelections ?? [],
		),
	};
}

function createLabelMap(
	records: readonly { id: string; label: string }[],
): ReadonlyMap<string, string> {
	return new Map(records.map((record) => [record.id, record.label]));
}

function createTraitDetailsMap(
	records: readonly AncestryTraitRecord[],
): ReadonlyMap<string, CharacterListTrait> {
	return new Map(
		records.map((record) => [
			record.id,
			{
				id: record.id,
				label: record.label,
				description: record.description,
			},
		]),
	);
}

function createTraitSelectionsByCharacterId(
	records: readonly CharacterTraitSelectionRecord[],
): ReadonlyMap<string, readonly CharacterTraitSelectionRecord[]> {
	const selectionsByCharacterId = new Map<
		string,
		CharacterTraitSelectionRecord[]
	>();
	for (const record of records) {
		const current = selectionsByCharacterId.get(record.characterId) ?? [];
		current.push(record);
		selectionsByCharacterId.set(record.characterId, current);
	}

	return new Map(
		Array.from(selectionsByCharacterId.entries()).map(
			([characterId, records]) => [
				characterId,
				[...records].sort((left, right) => left.sequence - right.sequence),
			],
		),
	);
}

function toCharacterTraitItems(
	records: readonly CharacterTraitSelectionRecord[],
	traitDetails: ReadonlyMap<string, CharacterListTrait>,
): readonly CharacterListTrait[] {
	return records.map((record) => {
		const details = traitDetails.get(record.traitId);
		return (
			details ?? {
				id: record.traitId,
				label: record.traitId,
				description: record.traitId,
			}
		);
	});
}
