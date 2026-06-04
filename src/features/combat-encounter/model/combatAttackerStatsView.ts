import {
	type CharacterRecord,
	characterSelectSchema,
} from "$lib/entities/character";
import { ArmorStatsDecorator } from "$lib/entities/character/domain/ArmorStatsDecorator";
import {
	applyStatusEffects,
	BaseCharacterStats,
	EncumberedStatusDecorator,
	type ICharacterStats,
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
	readonly armorClassLabel: string;
	readonly movementSpeedLabel: string;
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
	readonly armorBonus?: number;
	readonly isHeavy?: boolean;
	readonly isNoisy?: boolean;
	readonly shieldBonus?: number;
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

	// Aplicação de Decoradores via Cebola de Efeitos Reativos Centralizada
	let decoratedStats: ICharacterStats = baseStats;
	const activeEffectsLabels: { type: string; label: string; color: string }[] =
		[];

	const EFFECT_INFO: Record<string, { label: string; color: string }> = {
		eter_fever: {
			label: "🤒 Febre de Éter (-1 Mente, -1 Resistência)",
			color: "#c084fc",
		},
		wound_infection: {
			label: "🩸 Infecção de Ferida (-1 Físico, Sem Cura Natural)",
			color: "#ef4444",
		},
		viper_poison: {
			label: "🤢 Veneno de Víbora (-2 Físico, -1 Iniciativa)",
			color: "#22c55e",
		},
		hungry: {
			label: "🍗 Faminto (-1 Físico, -1 Mente, Sem Cura Natural)",
			color: "#f97316",
		},
		exhausted: {
			label: "💤 Exausto (-1 Físico, -1 Mente, -1 Social)",
			color: "#fbbf24",
		},
		bleeding: {
			label: "🩸 Sangramento (-1 Físico, Sem Cura Natural)",
			color: "#f43f5e",
		},
		silenced: {
			label: "🔇 Silenciado (-1 Mente, -1 Interação)",
			color: "#3b82f6",
		},
		immobilized: {
			label: "🕸️ Imobilizado (Velocidade 0, -2 Conflito, -2 Iniciativa)",
			color: "#6b7280",
		},
		unconscious: {
			label: "💤 Inconsciente (Ações 0, Velocidade 0, Falha em Defesas)",
			color: "#9ca3af",
		},
		moribund: {
			label: "💀 Moribundo (0 HP, Testes de Morte Necessários)",
			color: "#dc2626",
		},
		avatar_guerra: {
			label: "🔥 Avatar da Guerra (+20 HP Temp, Tamanho G, +2 Dano)",
			color: "#f97316",
		},
		surto_tempo: {
			label: "⏳ Surto de Tempo (+1 Ação, +2 Resistência Física)",
			color: "#06b6d4",
		},
		cacada_selvagem: {
			label: "🏹 Caçada Selvagem (+5 Ataque, Ignora Terreno Difícil)",
			color: "#10b981",
		},
		rede_intrigas: {
			label: "🕸️ Rede de Intrigas (Ações Sociais/Cena Retroativas)",
			color: "#8b5cf6",
		},
		extra_breath: {
			label: "🛡️ Fôlego Extra (+2 Resistência, +1 Físico)",
			color: "#10b981",
		},
		double_time: {
			label: "⏳ Dobrar Tempo (+1 Ação Adicional)",
			color: "#06b6d4",
		},
	};

	if (input.activeEffects) {
		decoratedStats = applyStatusEffects(baseStats, input.activeEffects);
		for (const effect of input.activeEffects) {
			const info = EFFECT_INFO[effect.type];
			if (info) {
				activeEffectsLabels.push({
					type: effect.type,
					label: info.label,
					color: info.color,
				});
			}
		}
	}

	const encumberedStats = new EncumberedStatusDecorator(
		decoratedStats,
		input.equippedWeight ?? 0,
	);

	const finalStats = new ArmorStatsDecorator(encumberedStats, {
		armorBonus: input.armorBonus ?? 0,
		isHeavy: input.isHeavy ?? false,
		isNoisy: input.isNoisy ?? false,
		shieldBonus: input.shieldBonus ?? 0,
	});

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
		armorClassLabel: `CA: ${finalStats.armorClass}`,
		movementSpeedLabel: `Velocidade: ${finalStats.movementSpeedBase}m`,
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
		armorClassLabel: "CA: não aplicada",
		movementSpeedLabel: "Velocidade: não aplicada",
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
		armorClassLabel: "CA: indisponível",
		movementSpeedLabel: "Velocidade: indisponível",
		sourceLabel: "Personagem da sessão",
		status: "unavailable",
		activeEffectsLabels: [],
	};
}
