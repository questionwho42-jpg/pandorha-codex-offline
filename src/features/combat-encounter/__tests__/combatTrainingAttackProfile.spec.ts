import { describe, expect, it } from "vitest";
import type { CharacterRecord } from "$lib/entities/character";
import type { EquipmentWeaponAttackProfile } from "$lib/entities/equipment";
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

	it("uses a real equipped weapon profile for a session character attack", () => {
		const profile = createCombatTrainingAttackProfile({
			attacker: { id: "session-character-1", label: "Lia" },
			characters: [createCharacterRecord({ physical: 3 })],
			equippedWeapon: createWeaponProfile({
				id: "longsword",
				label: "Espada Longa",
			}),
		});

		expect(profile).toMatchObject({
			baseDiceTotal: 4,
			damageType: "physical",
			extraModifierTotal: 0,
			matrixLabel: "Matriz F\u00edsica: 3",
			matrixValue: 3,
			source: "equipmentWeapon",
			summaryLabel: "Espada Longa: 1d8 (rolado no ataque) + F\u00edsico 3",
			weaponDiceExpression: "1d8",
			weaponLabel: "Espada Longa",
		});
		expect(profile.helperText).toBe(
			"Perfil de arma real usando Espada Longa. O dado da arma ser\u00e1 rolado no ataque; dano completo e durabilidade por ataque ficam para fase posterior.",
		);
	});

	it("marks future weapon dice expressions as pending instead of enabling rolls", () => {
		const profile = createCombatTrainingAttackProfile({
			attacker: { id: "session-character-1", label: "Lia" },
			characters: [createCharacterRecord({ physical: 3 })],
			equippedWeapon: createWeaponProfile({
				diceExpression: "2d6",
				label: "Martelo Futuro",
			}),
		});

		expect(profile.summaryLabel).toBe(
			"Martelo Futuro: 2d6 (contrato pendente) + F\u00edsico 3",
		);
		expect(profile.weaponDiceExpression).toBeUndefined();
		expect(profile.helperText).toBe(
			"Perfil de arma real usando Martelo Futuro. Esta express\u00e3o de dado ainda n\u00e3o entra no contrato de rolagem; dano completo e durabilidade por ataque ficam para fase posterior.",
		);
	});

	it("keeps official 1d4 weapons inside the auditable roll contract", () => {
		const profile = createCombatTrainingAttackProfile({
			attacker: { id: "session-character-1", label: "Lia" },
			characters: [createCharacterRecord({ physical: 3 })],
			equippedWeapon: createWeaponProfile({
				diceExpression: "1d4",
				id: "dagger",
				label: "Adaga",
			}),
		});

		expect(profile.summaryLabel).toBe(
			"Adaga: 1d4 (rolado no ataque) + F\u00edsico 3",
		);
		expect(profile.weaponDiceExpression).toBe("1d4");
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

function createWeaponProfile(
	patch: Partial<EquipmentWeaponAttackProfile> = {},
): EquipmentWeaponAttackProfile {
	return {
		baseDiceTotal: 4,
		damageType: "physical",
		diceExpression: "1d8",
		durabilityCurrent: 100,
		durabilityMax: 100,
		handsRequired: 1,
		id: "longsword",
		label: "Espada Longa",
		matrix: "physical",
		mechanicalSummary: "1d8/1d10, Versatil. Item unico de treino.",
		slotCost: 2,
		sourceFile: "docs/system/survival/04-arsenal-e-economia.md",
		tags: ["versatile"],
		...patch,
	};
}
