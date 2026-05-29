import { describe, expect, it } from "vitest";
import type { CharacterRecord } from "$lib/entities/character";
import { OFFICIAL_CHARACTER_CLASSES } from "$lib/entities/character-class";
import { createCombatAttackerStatsView } from "../model/combatAttackerStatsView";
import { DEFAULT_COMBAT_TRAINING_ATTACKER } from "../model/combatSessionAttacker";

const TEST_TIMESTAMP = "2026-05-12T12:21:40.000Z";

describe("createCombatAttackerStatsView", () => {
	it("shows training copy for Aria without derived character stats", () => {
		const view = createCombatAttackerStatsView({
			attacker: DEFAULT_COMBAT_TRAINING_ATTACKER,
			characterClasses: OFFICIAL_CHARACTER_CLASSES,
			characters: [createCharacterRecord()],
		});

		expect(view).toEqual({
			classLabel: "Classe: treino",
			carrySlotLimit: null,
			carrySlotLimitLabel: "Carga: não aplicada",
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
		});
	});

	it("shows derived stats for a selected session character", () => {
		const view = createCombatAttackerStatsView({
			attacker: { id: "session-character-1", label: "Lia" },
			characterClasses: OFFICIAL_CHARACTER_CLASSES,
			characters: [createCharacterRecord()],
		});

		expect(view).toEqual({
			classLabel: "Classe: Vanguarda",
			carrySlotLimit: 10,
			carrySlotLimitLabel: "Carga: 0/10 slots (LIGHT)",
			heading: "Ficha no combate",
			helperText:
				"Valores informativos da ficha atual. Ataque, dano, equipamento e HP real ainda usam o treino determinístico.",
			initiativeBase: 5,
			initiativeLabel: "Iniciativa: 5",
			maxHp: 14,
			maxHpLabel: "HP máximo: 14",
			armorClassLabel: "CA: 13",
			movementSpeedLabel: "Velocidade: 9m",
			sourceLabel: "Personagem da sessão",
			status: "derived",
			activeEffectsLabels: [],
		});
	});

	it("shows derived stats with encumbered penalty (-2 initiative)", () => {
		const view = createCombatAttackerStatsView({
			attacker: { id: "session-character-1", label: "Lia" },
			characterClasses: OFFICIAL_CHARACTER_CLASSES,
			characters: [createCharacterRecord()],
			equippedWeight: 12, // Excede o limite de 10 slots
		});

		expect(view.carrySlotLimitLabel).toBe("Carga: 12/10 slots (ENCUMBERED)");
		expect(view.initiativeLabel).toBe("Iniciativa: 3"); // 5 - 2
		expect(view.helperText).toContain("🚨 PERSONAGEM LENTO");
	});

	it("shows an unavailable state when the selected character class is missing", () => {
		const view = createCombatAttackerStatsView({
			attacker: { id: "session-character-1", label: "Lia" },
			characterClasses: [],
			characters: [createCharacterRecord()],
		});

		expect(view.status).toBe("unavailable");
		expect(view.classLabel).toBe("Classe: indispon\u00edvel");
		expect(view.maxHpLabel).toBe("HP m\u00e1ximo: indispon\u00edvel");
		expect(view.initiativeLabel).toBe("Iniciativa: indispon\u00edvel");
		expect(view.carrySlotLimitLabel).toBe("Carga: indispon\u00edvel");
		expect(view.helperText).toBe(
			"N\u00e3o foi poss\u00edvel localizar a classe deste personagem nesta sess\u00e3o.",
		);
	});

	it("shows an unavailable state when derived stats cannot be calculated", () => {
		const view = createCombatAttackerStatsView({
			attacker: { id: "session-character-1", label: "Lia" },
			characterClasses: OFFICIAL_CHARACTER_CLASSES,
			characters: [createCharacterRecord({ name: "" })],
		});

		expect(view.status).toBe("unavailable");
		expect(view.helperText).toBe(
			"N\u00e3o foi poss\u00edvel calcular os atributos derivados deste personagem.",
		);
	});

	it("shows derived stats with active effects (Eter Fever, Wound Infection, Viper Poison, Hungry)", () => {
		const view = createCombatAttackerStatsView({
			attacker: { id: "session-character-1", label: "Lia" },
			characterClasses: OFFICIAL_CHARACTER_CLASSES,
			characters: [createCharacterRecord()],
			activeEffects: [
				{ type: "eter_fever" },
				{ type: "wound_infection" },
				{ type: "viper_poison" },
				{ type: "hungry" },
			],
		});

		expect(view.activeEffectsLabels).toHaveLength(4);
		expect(view.activeEffectsLabels[0]).toEqual({
			type: "eter_fever",
			label: "🤒 Febre de Éter (-1 Mente, -1 Resistência)",
			color: "#c084fc",
		});
		expect(view.helperText).toContain(
			"⚠️ ATENÇÃO: O personagem está debilitado por 4 aflição(ões) do Códex!",
		);
	});

	it("shows derived stats with overloaded penalty", () => {
		const view = createCombatAttackerStatsView({
			attacker: { id: "session-character-1", label: "Lia" },
			characterClasses: OFFICIAL_CHARACTER_CLASSES,
			characters: [createCharacterRecord()],
			equippedWeight: 16,
		});

		expect(view.carrySlotLimitLabel).toBe("Carga: 16/10 slots (OVERLOADED)");
		expect(view.helperText).toContain(
			"⚠️ PERSONAGEM IMOBILIZADO: Sobrecarga extrema!",
		);
	});

	it("shows derived stats with equipped heavy armor (+5 CA, 0 physical bonus, -3m speed)", () => {
		const view = createCombatAttackerStatsView({
			attacker: { id: "session-character-1", label: "Lia" },
			characterClasses: OFFICIAL_CHARACTER_CLASSES,
			characters: [createCharacterRecord()],
			armorBonus: 5,
			isHeavy: true,
			isNoisy: true,
			shieldBonus: 1,
		});

		expect(view.armorClassLabel).toBe("CA: 17"); // 10 + level 1 + placas 5 + physical limit 0 + escudo 1 = 17
		expect(view.movementSpeedLabel).toBe("Velocidade: 6m"); // 9m - 3m = 6m
	});
});

function createCharacterRecord(
	patch: Partial<CharacterRecord> = {},
): CharacterRecord {
	return {
		id: "session-character-1",
		name: "Lia",
		concept: "Sentinela de teste",
		ancestryId: "human",
		backgroundId: "acolyte",
		classId: "vanguard",
		conflict: 2,
		experiencePoints: 0,
		createdAt: TEST_TIMESTAMP,
		interaction: 2,
		level: 1,
		mental: 2,
		physical: 2,
		resistance: 2,
		social: 2,
		updatedAt: TEST_TIMESTAMP,
		...patch,
	};
}
