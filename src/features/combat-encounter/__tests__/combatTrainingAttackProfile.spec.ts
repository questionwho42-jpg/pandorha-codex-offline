import { describe, expect, it } from "vitest";
import type { CharacterRecord } from "$lib/entities/character";
import { DEFAULT_COMBAT_TRAINING_ATTACKER } from "../model/combatSessionAttacker";
import { createCombatTrainingAttackProfile } from "../model/combatTrainingAttackProfile";

const TEST_TIMESTAMP = "2026-05-12T13:04:00.000Z";

describe("createCombatTrainingAttackProfile", () => {
	it("keeps Aria on the fixed training damage profile", () => {
		const profile = createCombatTrainingAttackProfile({
			attacker: DEFAULT_COMBAT_TRAINING_ATTACKER,
			characters: [createCharacterRecord({ physical: 3 })],
		});

		expect(profile).toEqual({
			affinities: [],
			baseDiceTotal: 4,
			damageReduction: 0,
			damageType: "physical",
			extraModifierTotal: 3,
			helperText:
				"Aria usa um perfil fixo de treino. Personagens da sess\u00e3o usam a pr\u00f3pria Matriz F\u00edsica.",
			matrixLabel: "Matriz F\u00edsica: 2",
			matrixValue: 2,
			source: "training",
			summaryLabel: "Dano: 4 + F\u00edsico 2 + b\u00f4nus 3",
			vulnerabilityBonusDamage: 0,
		});
	});

	it("uses the selected session character physical matrix for training damage", () => {
		const profile = createCombatTrainingAttackProfile({
			attacker: { id: "session-character-1", label: "Lia" },
			characters: [createCharacterRecord({ physical: 3 })],
		});

		expect(profile.source).toBe("sessionCharacter");
		expect(profile.matrixValue).toBe(3);
		expect(profile.matrixLabel).toBe("Matriz F\u00edsica: 3");
		expect(profile.summaryLabel).toBe("Dano: 4 + F\u00edsico 3 + b\u00f4nus 3");
		expect(profile.helperText).toBe(
			"Dano de treino usando a Matriz F\u00edsica da ficha selecionada. Arma, dado base e b\u00f4nus ainda s\u00e3o fixos.",
		);
	});

	it("changes only the matrix value when session characters have different physical values", () => {
		const lowPhysicalProfile = createCombatTrainingAttackProfile({
			attacker: { id: "session-character-1", label: "Lia" },
			characters: [createCharacterRecord({ physical: 2 })],
		});
		const highPhysicalProfile = createCombatTrainingAttackProfile({
			attacker: { id: "session-character-2", label: "Nara" },
			characters: [
				createCharacterRecord({ physical: 2 }),
				createCharacterRecord({
					id: "session-character-2",
					name: "Nara",
					physical: 3,
				}),
			],
		});

		expect(lowPhysicalProfile.baseDiceTotal).toBe(
			highPhysicalProfile.baseDiceTotal,
		);
		expect(lowPhysicalProfile.extraModifierTotal).toBe(
			highPhysicalProfile.extraModifierTotal,
		);
		expect(lowPhysicalProfile.matrixValue).toBe(2);
		expect(highPhysicalProfile.matrixValue).toBe(3);
	});

	it("falls back to the fixed training profile when the attacker is not a session character", () => {
		const profile = createCombatTrainingAttackProfile({
			attacker: { id: "unknown-attacker", label: "Visitante" },
			characters: [createCharacterRecord({ physical: 3 })],
		});

		expect(profile.source).toBe("training");
		expect(profile.matrixValue).toBe(2);
		expect(profile.matrixLabel).toBe("Matriz F\u00edsica: 2");
	});

	it("applies sharp and runic weapon decorators and changes damage type/affinities", () => {
		// Arma comum
		const commonProfile = createCombatTrainingAttackProfile(
			{
				attacker: { id: "session-character-1", label: "Lia" },
				characters: [createCharacterRecord({ physical: 3 })],
			},
			{
				id: "weapon-1",
				label: "Espada Comum",
				isSharp: 0,
				isRunic: 0,
				baseDamage: 4,
				extraModifier: 3,
				damageType: "physical",
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
			} as any,
		);
		expect(commonProfile.helperText).toContain("Atacando com Espada Comum");
		expect(commonProfile.damageType).toBe("physical");
		expect(commonProfile.affinities).toEqual([]);

		// Arma afiada
		const sharpProfile = createCombatTrainingAttackProfile(
			{
				attacker: { id: "session-character-1", label: "Lia" },
				characters: [createCharacterRecord({ physical: 3 })],
			},
			{
				id: "weapon-2",
				label: "Adaga Afiada",
				isSharp: 1,
				isRunic: 0,
				baseDamage: 4,
				extraModifier: 3,
				damageType: "physical",
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
			} as any,
		);
		expect(sharpProfile.helperText).toContain("[Afiada]");
		expect(sharpProfile.extraModifierTotal).toBe(4); // Sharp adiciona 1 no modificador extra

		// Arma rúnica
		const runicProfile = createCombatTrainingAttackProfile(
			{
				attacker: { id: "session-character-1", label: "Lia" },
				characters: [createCharacterRecord({ physical: 3 })],
			},
			{
				id: "weapon-3",
				label: "Cajado Rúnico",
				isSharp: 0,
				isRunic: 1,
				baseDamage: 4,
				extraModifier: 3,
				damageType: "physical",
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
			} as any,
		);
		expect(runicProfile.helperText).toContain("[Rúnica]");
		expect(runicProfile.damageType).toBe("ether");
		expect(runicProfile.affinities).toEqual(["ether"]);
	});

	it("applies status effects that debilitate physical matrix", () => {
		const profile = createCombatTrainingAttackProfile({
			attacker: { id: "session-character-1", label: "Lia" },
			characters: [createCharacterRecord({ physical: 3 })],
			activeEffects: [
				{ type: "eter_fever" },
				{ type: "wound_infection" },
				{ type: "viper_poison" },
				{ type: "hungry" },
			],
		});

		expect(profile.matrixValue).toBe(0);
	});

	it("uses character class base Hp fallback when classes are provided", () => {
		const profileWithClass = createCombatTrainingAttackProfile({
			attacker: { id: "session-character-1", label: "Lia" },
			characters: [createCharacterRecord({ physical: 3 })],
			characterClasses: [{ id: "vanguard", baseHp: 12 } as any],
		});
		expect(profileWithClass.matrixValue).toBe(3);

		const profileWithoutClass = createCombatTrainingAttackProfile({
			attacker: { id: "session-character-1", label: "Lia" },
			characters: [createCharacterRecord({ physical: 3 })],
			characterClasses: [],
		});
		expect(profileWithoutClass.matrixValue).toBe(3);
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
