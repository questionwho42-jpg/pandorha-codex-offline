import type { AncestryRecord } from "$lib/entities/ancestry";
import type { BackgroundRecord } from "$lib/entities/background";
import type { CharacterRecord } from "$lib/entities/character";
import { ArmorStatsDecorator } from "$lib/entities/character/domain/ArmorStatsDecorator";
import {
	applyStatusEffects,
	BaseCharacterStats,
	EncumberedStatusDecorator,
	type ICharacterStats,
} from "$lib/entities/character/domain/StatusEffectDecorator";
import type { CharacterStatusEffectRecord } from "$lib/entities/character/model/characterSchema";
import type { CharacterClassRecord } from "$lib/entities/character-class";
import type { CharacterCraftedItemRecord } from "$lib/entities/equipment/model/craftingSchema";
import { OFFICIAL_EQUIPMENT } from "$lib/entities/equipment/model/equipmentCatalog";

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
	armorClass: number;
	movementSpeed: number;
	stealthPenalty: number;
}>;

export type CharacterListCatalogs = Readonly<{
	ancestries?: readonly AncestryRecord[];
	backgrounds?: readonly BackgroundRecord[];
	characterClasses?: readonly CharacterClassRecord[];
	statusEffects?: readonly CharacterStatusEffectRecord[];
	craftedItems?: readonly CharacterCraftedItemRecord[];
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
			catalogs.craftedItems ?? [],
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
	bleeding: "Sangramento",
	silenced: "Silenciado",
	immobilized: "Imobilizado",
	unconscious: "Inconsciente",
	moribund: "Moribundo",
	avatar_guerra: "Avatar da Guerra",
	surto_tempo: "Surto de Tempo",
	cacada_selvagem: "Caçada Selvagem",
	rede_intrigas: "Rede de Intrigas",
};

function toCharacterListItem(
	character: CharacterRecord,
	labelMaps: CharacterListLabelMaps,
	statusEffects: readonly CharacterStatusEffectRecord[],
	characterClasses: readonly CharacterClassRecord[],
	craftedItems: readonly CharacterCraftedItemRecord[],
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

	stats = applyStatusEffects(stats, characterEffects);

	const characterCraftedItems = craftedItems.filter(
		(item) => item.characterId === character.id,
	);

	let equippedWeight = 0;
	let armorBonus = 0;
	let isHeavy = false;
	let isNoisy = false;
	let shieldBonus = 0;

	for (const item of characterCraftedItems) {
		if (item.isEquipped === 1) {
			const equipmentInfo = OFFICIAL_EQUIPMENT.find(
				(eq) => eq.id === item.equipmentId,
			);
			let weight: number = equipmentInfo ? equipmentInfo.slotCost : 1;
			if (item.isReinforced === 1) {
				weight = Math.max(1, weight - 1);
			}
			equippedWeight += weight;

			if (equipmentInfo) {
				if (equipmentInfo.kind === "armor") {
					if (equipmentInfo.id === "leather-armor") {
						armorBonus = 2;
					} else if (equipmentInfo.id === "plate-armor") {
						armorBonus = 5;
						isHeavy = true;
						isNoisy = true;
					}
				} else if (equipmentInfo.kind === "shield") {
					if (equipmentInfo.id === "round-shield") {
						shieldBonus = 1;
					}
				}
			}
		}
	}

	const encumberedStats = new EncumberedStatusDecorator(stats, equippedWeight);
	const finalStats = new ArmorStatsDecorator(encumberedStats, {
		armorBonus,
		isHeavy,
		isNoisy,
		shieldBonus,
	});

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
			makeStat("Físico", finalStats.physical, character.physical),
			makeStat("Mental", finalStats.mental, character.mental),
			makeStat("Social", finalStats.social, character.social),
		],
		applications: [
			makeStat("Conflito", finalStats.conflict, character.conflict),
			makeStat("Interação", finalStats.interaction, character.interaction),
			makeStat("Resistência", finalStats.resistance, character.resistance),
		],
		statusEffects: uiStatusEffects,
		allowsNaturalRecovery: finalStats.allowsNaturalRecovery,
		armorClass: finalStats.armorClass,
		movementSpeed: finalStats.movementSpeedBase,
		stealthPenalty: finalStats.stealthPenalty,
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
