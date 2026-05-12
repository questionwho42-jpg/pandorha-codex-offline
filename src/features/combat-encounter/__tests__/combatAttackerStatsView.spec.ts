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
			carrySlotLimitLabel: "Carga: n\u00e3o aplicada",
			heading: "Ficha no combate",
			helperText:
				"Aria usa valores fixos de treino. Crie e selecione um personagem para ver atributos derivados da ficha.",
			initiativeBase: null,
			initiativeLabel: "Iniciativa: n\u00e3o aplicada",
			maxHp: null,
			maxHpLabel: "HP m\u00e1ximo: n\u00e3o aplicado",
			sourceLabel: "Atacante de treino",
			status: "training",
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
			carrySlotLimitLabel: "Carga: 10 slots",
			heading: "Ficha no combate",
			helperText:
				"Valores informativos da ficha atual. Ataque, dano, equipamento e HP real ainda usam o treino determin\u00edstico.",
			initiativeBase: 5,
			initiativeLabel: "Iniciativa: 5",
			maxHp: 14,
			maxHpLabel: "HP m\u00e1ximo: 14",
			sourceLabel: "Personagem da sess\u00e3o",
			status: "derived",
		});
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
