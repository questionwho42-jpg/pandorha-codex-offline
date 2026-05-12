import {
	CharacterDerivedStatsService,
	type CharacterRecord,
} from "$lib/entities/character";
import type { CharacterClassRecord } from "$lib/entities/character-class";
import type { CombatEncounterActorRef } from "./combatEncounterTypes";

export type CombatAttackerStatsStatus = "derived" | "training" | "unavailable";

export interface CombatAttackerStatsView {
	readonly carrySlotLimit: number | null;
	readonly carrySlotLimitLabel: string;
	readonly classLabel: string;
	readonly heading: string;
	readonly helperText: string;
	readonly initiativeBase: number | null;
	readonly initiativeLabel: string;
	readonly maxHp: number | null;
	readonly maxHpLabel: string;
	readonly sourceLabel: string;
	readonly status: CombatAttackerStatsStatus;
}

export interface CombatAttackerStatsViewInput {
	readonly attacker: CombatEncounterActorRef;
	readonly characterClasses: readonly CharacterClassRecord[];
	readonly characters: readonly CharacterRecord[];
}

const derivedStatsService = new CharacterDerivedStatsService();

export function createCombatAttackerStatsView(
	input: CombatAttackerStatsViewInput,
): CombatAttackerStatsView {
	const selectedCharacter = input.characters.find(
		(character) => character.id === input.attacker.id,
	);
	if (!selectedCharacter) {
		return createTrainingStatsView();
	}

	const selectedClass = input.characterClasses.find(
		(characterClass) => characterClass.id === selectedCharacter.classId,
	);
	if (!selectedClass) {
		return createUnavailableStatsView(
			"N\u00e3o foi poss\u00edvel localizar a classe deste personagem nesta sess\u00e3o.",
		);
	}

	const derivedStats = derivedStatsService.calculateCharacterDerivedStats({
		character: selectedCharacter,
		characterClass: {
			id: selectedClass.id,
			baseHp: selectedClass.baseHp,
		},
	});
	if (!derivedStats.success) {
		return createUnavailableStatsView(
			"N\u00e3o foi poss\u00edvel calcular os atributos derivados deste personagem.",
		);
	}

	return {
		carrySlotLimit: derivedStats.data.carrySlotLimit,
		carrySlotLimitLabel: `Carga: ${derivedStats.data.carrySlotLimit} slots`,
		classLabel: `Classe: ${selectedClass.label}`,
		heading: "Ficha no combate",
		helperText:
			"Valores informativos da ficha atual. Ataque, dano, equipamento e HP real ainda usam o treino determin\u00edstico.",
		initiativeBase: derivedStats.data.initiativeBase,
		initiativeLabel: `Iniciativa: ${derivedStats.data.initiativeBase}`,
		maxHp: derivedStats.data.maxHp,
		maxHpLabel: `HP m\u00e1ximo: ${derivedStats.data.maxHp}`,
		sourceLabel: "Personagem da sess\u00e3o",
		status: "derived",
	};
}

function createTrainingStatsView(): CombatAttackerStatsView {
	return {
		carrySlotLimit: null,
		carrySlotLimitLabel: "Carga: n\u00e3o aplicada",
		classLabel: "Classe: treino",
		heading: "Ficha no combate",
		helperText:
			"Aria usa valores fixos de treino. Crie e selecione um personagem para ver atributos derivados da ficha.",
		initiativeBase: null,
		initiativeLabel: "Iniciativa: n\u00e3o aplicada",
		maxHp: null,
		maxHpLabel: "HP m\u00e1ximo: n\u00e3o aplicado",
		sourceLabel: "Atacante de treino",
		status: "training",
	};
}

function createUnavailableStatsView(
	helperText: string,
): CombatAttackerStatsView {
	return {
		carrySlotLimit: null,
		carrySlotLimitLabel: "Carga: indispon\u00edvel",
		classLabel: "Classe: indispon\u00edvel",
		heading: "Ficha no combate",
		helperText,
		initiativeBase: null,
		initiativeLabel: "Iniciativa: indispon\u00edvel",
		maxHp: null,
		maxHpLabel: "HP m\u00e1ximo: indispon\u00edvel",
		sourceLabel: "Personagem da sess\u00e3o",
		status: "unavailable",
	};
}
