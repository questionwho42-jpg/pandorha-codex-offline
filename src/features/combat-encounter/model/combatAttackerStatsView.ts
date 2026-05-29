import {
	type CharacterRecord,
	characterSelectSchema,
} from "$lib/entities/character";
import {
	BaseCharacterStats,
	BleedingDecorator,
	EncumberedStatusDecorator,
	EterFeverDecorator,
	HungryDecorator,
	type ICharacterStats,
	ImmobilizedDecorator,
	SilencedDecorator,
	ViperPoisonDecorator,
	WoundInfectionDecorator,
} from "$lib/entities/character/domain/StatusEffectDecorator";
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
	readonly activeEffectsLabels: readonly {
		type: string;
		label: string;
		color: string;
	}[];
}

export interface CombatAttackerStatsViewInput {
	readonly attacker: CombatEncounterActorRef;
	readonly characterClasses: readonly CharacterClassRecord[];
	readonly characters: readonly CharacterRecord[];
	readonly equippedWeight?: number;
	readonly activeEffects?: readonly { type: string }[];
}

export function createCombatAttackerStatsView(
	input: CombatAttackerStatsViewInput,
): CombatAttackerStatsView {
	const selectedCharacter = input.characters.find(
		(character) => character.id === input.attacker.id,
	);
	if (!selectedCharacter) {
		return createTrainingStatsView();
	}

	const validationResult = characterSelectSchema.safeParse(selectedCharacter);
	if (!validationResult.success) {
		return createUnavailableStatsView(
			"Não foi possível calcular os atributos derivados deste personagem.",
		);
	}

	const selectedClass = input.characterClasses.find(
		(characterClass) => characterClass.id === selectedCharacter.classId,
	);
	if (!selectedClass) {
		return createUnavailableStatsView(
			"Não foi possível localizar a classe deste personagem nesta sessão.",
		);
	}

	const baseStats = new BaseCharacterStats(selectedCharacter, {
		id: selectedClass.id,
		baseHp: selectedClass.baseHp,
	});

	// Aplicação recursiva do Decorator (Efeito Cebola 🧅) para Doenças/Debuffs
	let decoratedStats: ICharacterStats = baseStats;
	const activeEffectsLabels: { type: string; label: string; color: string }[] =
		[];

	if (input.activeEffects) {
		for (const effect of input.activeEffects) {
			if (effect.type === "eter_fever") {
				decoratedStats = new EterFeverDecorator(decoratedStats);
				activeEffectsLabels.push({
					type: "eter_fever",
					label: "🤒 Febre de Éter (-1 Mente, -1 Resistência)",
					color: "#c084fc", // Violeta elegante
				});
			} else if (effect.type === "wound_infection") {
				decoratedStats = new WoundInfectionDecorator(decoratedStats);
				activeEffectsLabels.push({
					type: "wound_infection",
					label: "🩸 Infecção de Ferida (-1 Físico, Sem Cura Natural)",
					color: "#ef4444", // Vermelho sangue
				});
			} else if (effect.type === "viper_poison") {
				decoratedStats = new ViperPoisonDecorator(decoratedStats);
				activeEffectsLabels.push({
					type: "viper_poison",
					label: "🤢 Veneno de Víbora (-2 Físico, -1 Iniciativa)",
					color: "#22c55e", // Verde-ácido / Toxina
				});
			} else if (effect.type === "hungry") {
				decoratedStats = new HungryDecorator(decoratedStats);
				activeEffectsLabels.push({
					type: "hungry",
					label: "🍗 Faminto (-1 Físico, -1 Mente, Sem Cura Natural)",
					color: "#f97316", // Laranja vibrante para aviso alimentar
				});
			} else if (effect.type === "bleeding") {
				decoratedStats = new BleedingDecorator(decoratedStats);
				activeEffectsLabels.push({
					type: "bleeding",
					label: "🩸 Sangramento (-1 Físico, Sem Cura Natural)",
					color: "#f43f5e", // Rosa avermelhado
				});
			} else if (effect.type === "silenced") {
				decoratedStats = new SilencedDecorator(decoratedStats);
				activeEffectsLabels.push({
					type: "silenced",
					label: "🔇 Silenciado (-1 Mente, -1 Interação)",
					color: "#3b82f6", // Azul místico
				});
			} else if (effect.type === "immobilized") {
				decoratedStats = new ImmobilizedDecorator(decoratedStats);
				activeEffectsLabels.push({
					type: "immobilized",
					label: "🕸️ Imobilizado (Velocidade 0, -2 Conflito, -2 Iniciativa)",
					color: "#6b7280", // Cinza ferro / Preso
				});
			}
		}
	}

	const finalStats = new EncumberedStatusDecorator(
		decoratedStats,
		input.equippedWeight ?? 0,
	);

	const encumbState = finalStats.encumbranceState;
	let helperText =
		"Valores informativos da ficha atual. Ataque, dano, equipamento e HP real ainda usam o treino determinístico.";

	if (activeEffectsLabels.length > 0) {
		helperText = `⚠️ ATENÇÃO: O personagem está debilitado por ${activeEffectsLabels.length} aflição(ões) do Códex!`;
	}

	if (encumbState === "encumbered") {
		helperText =
			"🚨 PERSONAGEM LENTO: Penalidade de -2 de Iniciativa aplicada devido ao peso equipado!";
	} else if (encumbState === "overloaded") {
		helperText =
			"⚠️ PERSONAGEM IMOBILIZADO: Sobrecarga extrema! Ataques bloqueados e velocidade zero!";
	}

	return {
		carrySlotLimit: finalStats.carrySlotLimit,
		carrySlotLimitLabel: `Carga: ${finalStats.currentCarryWeight}/${finalStats.carrySlotLimit} slots (${encumbState.toUpperCase()})`,
		classLabel: `Classe: ${selectedClass.label}`,
		heading: "Ficha no combate",
		helperText,
		initiativeBase: finalStats.initiativeBase,
		initiativeLabel: `Iniciativa: ${finalStats.initiativeBase}`,
		maxHp: finalStats.maxHp,
		maxHpLabel: `HP máximo: ${finalStats.maxHp}`,
		sourceLabel: "Personagem da sessão",
		status: "derived",
		activeEffectsLabels,
	};
}

function createTrainingStatsView(): CombatAttackerStatsView {
	return {
		carrySlotLimit: null,
		carrySlotLimitLabel: "Carga: não aplicada",
		classLabel: "Classe: treino",
		heading: "Ficha no combate",
		helperText:
			"Aria usa valores fixos de treino. Crie e selecione um personagem para ver atributos derivados da ficha.",
		initiativeBase: null,
		initiativeLabel: "Iniciativa: não aplicada",
		maxHp: null,
		maxHpLabel: "HP máximo: não aplicado",
		sourceLabel: "Atacante de treino",
		status: "training",
		activeEffectsLabels: [],
	};
}

function createUnavailableStatsView(
	helperText: string,
): CombatAttackerStatsView {
	return {
		carrySlotLimit: null,
		carrySlotLimitLabel: "Carga: indisponível",
		classLabel: "Classe: indisponível",
		heading: "Ficha no combate",
		helperText,
		initiativeBase: null,
		initiativeLabel: "Iniciativa: indisponível",
		maxHp: null,
		maxHpLabel: "HP máximo: indisponível",
		sourceLabel: "Personagem da sessão",
		status: "unavailable",
		activeEffectsLabels: [],
	};
}
