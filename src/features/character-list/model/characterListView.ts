import type { AncestryRecord } from "$lib/entities/ancestry";
import type { BackgroundRecord } from "$lib/entities/background";
import type { CharacterRecord } from "$lib/entities/character";
import {
	BaseCharacterStats,
	EterFeverDecorator,
	HungryDecorator,
	type ICharacterStats,
	ViperPoisonDecorator,
	WoundInfectionDecorator,
} from "$lib/entities/character/domain/StatusEffectDecorator";
import type { CharacterStatusEffectRecord } from "$lib/entities/character/model/characterSchema";
import type { CharacterClassRecord } from "$lib/entities/character-class";

export type CharacterListStat = Readonly<{
	label: string;
	value: number;
	baseValue?: number;
}>;

export type CharacterListStatusEffect = Readonly<{
	id: string;
	type: string;
	label: string;
	severity: number;
	isAggravated: boolean;
}>;

export type CharacterListItem = Readonly<{
	id: string;
	name: string;
	concept: string;
	levelLabel: string;
	identityLabel: string;
	axes: readonly CharacterListStat[];
	applications: readonly CharacterListStat[];
	statusEffects: readonly CharacterListStatusEffect[];
	allowsNaturalRecovery: boolean;
}>;

export type CharacterListCatalogs = Readonly<{
	ancestries?: readonly AncestryRecord[];
	backgrounds?: readonly BackgroundRecord[];
	characterClasses?: readonly CharacterClassRecord[];
	statusEffects?: readonly CharacterStatusEffectRecord[];
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
		toCharacterListItem(
			character,
			labelMaps,
			catalogs.statusEffects ?? [],
			catalogs.characterClasses ?? [],
		),
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

const STATUS_EFFECT_LABELS: Record<string, string> = {
	eter_fever: "Febre de Éter",
	wound_infection: "Infecção de Ferida",
	viper_poison: "Veneno de Víbora",
	hungry: "Faminto",
};

function toCharacterListItem(
	character: CharacterRecord,
	labelMaps: CharacterListLabelMaps,
	statusEffects: readonly CharacterStatusEffectRecord[],
	characterClasses: readonly CharacterClassRecord[],
): CharacterListItem {
	const characterClass = characterClasses.find(
		(c) => c.id === character.classId,
	) ?? {
		id: character.classId,
		baseHp: 10,
	};

	let stats: ICharacterStats = new BaseCharacterStats(
		character,
		characterClass,
	);

	const characterEffects = [...statusEffects]
		.filter((effect) => effect.characterId === character.id)
		.sort(
			(a, b) =>
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		);

	for (const effect of characterEffects) {
		if (effect.type === "eter_fever") {
			stats = new EterFeverDecorator(stats);
		} else if (effect.type === "wound_infection") {
			stats = new WoundInfectionDecorator(stats);
		} else if (effect.type === "viper_poison") {
			stats = new ViperPoisonDecorator(stats);
		} else if (effect.type === "hungry") {
			stats = new HungryDecorator(stats);
		}
	}

	const uiStatusEffects: CharacterListStatusEffect[] = characterEffects.map(
		(effect) => ({
			id: effect.id,
			type: effect.type,
			label: STATUS_EFFECT_LABELS[effect.type] ?? effect.type,
			severity: effect.severity,
			isAggravated: effect.isAggravated,
		}),
	);

	const makeStat = (
		label: string,
		value: number,
		baseValue: number,
	): CharacterListStat => {
		if (value !== baseValue) {
			return { label, value, baseValue };
		}
		return { label, value };
	};

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
			makeStat("Físico", stats.physical, character.physical),
			makeStat("Mental", stats.mental, character.mental),
			makeStat("Social", stats.social, character.social),
		],
		applications: [
			makeStat("Conflito", stats.conflict, character.conflict),
			makeStat("Interação", stats.interaction, character.interaction),
			makeStat("Resistência", stats.resistance, character.resistance),
		],
		statusEffects: uiStatusEffects,
		allowsNaturalRecovery: stats.allowsNaturalRecovery,
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
