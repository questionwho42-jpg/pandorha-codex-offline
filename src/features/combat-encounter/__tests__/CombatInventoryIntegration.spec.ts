import { describe, expect, it } from "vitest";
import type { CharacterRecord } from "$lib/entities/character";
import type { CharacterCraftedItemRecord } from "../../../entities/equipment/model/craftingSchema";
import {
	BaseCraftingDamageProfile,
	RunedDamageDecorator,
	SharpDamageDecorator,
} from "../domain/CraftingDamageDecorators";
import { createCombatTrainingAttackProfile } from "../model/combatTrainingAttackProfile";

describe("Combat Inventory & Damage Decorators Integration", () => {
	describe("Damage Decorators (Isolated & Nested)", () => {
		it("returns correct values for BaseCraftingDamageProfile", () => {
			const profile = new BaseCraftingDamageProfile(4, 3, "physical", 0);
			expect(profile.baseDamage).toBe(4);
			expect(profile.extraModifier).toBe(3);
			expect(profile.damageType).toBe("physical");
			expect(profile.extraMargin).toBe(0);
		});

		it("applies SharpDamageDecorator modifiers correctly (+2 margin, +1 damage)", () => {
			const base = new BaseCraftingDamageProfile(4, 3, "physical", 0);
			const sharp = new SharpDamageDecorator(base);

			expect(sharp.baseDamage).toBe(4);
			expect(sharp.extraModifier).toBe(4); // 3 + 1
			expect(sharp.damageType).toBe("physical");
			expect(sharp.extraMargin).toBe(2); // 0 + 2
		});

		it("applies RunedDamageDecorator type conversion correctly to ether", () => {
			const base = new BaseCraftingDamageProfile(4, 3, "physical", 0);
			const runed = new RunedDamageDecorator(base);

			expect(runed.baseDamage).toBe(4);
			expect(runed.extraModifier).toBe(3);
			expect(runed.damageType).toBe("ether");
			expect(runed.extraMargin).toBe(0);
		});

		it("nests both Sharp and Runed decorators (cebola pattern 🧅) harmoniously", () => {
			const base = new BaseCraftingDamageProfile(4, 3, "physical", 0);
			const runedSharp = new RunedDamageDecorator(
				new SharpDamageDecorator(base),
			);

			expect(runedSharp.baseDamage).toBe(4);
			expect(runedSharp.extraModifier).toBe(4); // Sharp bonus applied
			expect(runedSharp.damageType).toBe("ether"); // Runed conversion applied
			expect(runedSharp.extraMargin).toBe(2); // Sharp margin applied
		});
	});

	describe("createCombatTrainingAttackProfile with Equipped Weapons", () => {
		const mockCharacter: CharacterRecord = {
			id: "char-1",
			name: "Sentinela de Teste",
			concept: "Guerreiro",
			ancestryId: "human",
			backgroundId: "soldier",
			classId: "vanguard",
			conflict: 2,
			experiencePoints: 0,
			createdAt: "2026-05-17T00:00:00Z",
			interaction: 2,
			level: 1,
			mental: 2,
			physical: 3, // Matriz Física = 3
			resistance: 2,
			social: 2,
			updatedAt: "2026-05-17T00:00:00Z",
		};

		const mockInput = {
			attacker: { id: "char-1", label: "Sentinela de Teste", physical: 3 },
			characters: [mockCharacter],
		};

		it("uses base training profile when no weapon is equipped", () => {
			const profile = createCombatTrainingAttackProfile(mockInput, undefined);

			expect(profile.baseDiceTotal).toBe(4);
			expect(profile.matrixValue).toBe(3);
			expect(profile.extraModifierTotal).toBe(3);
			expect(profile.damageType).toBe("physical");
			expect(profile.helperText).toContain("ainda são fixos");
		});

		it("integrates a Sharp weapon correctly", () => {
			const sharpWeapon: CharacterCraftedItemRecord = {
				id: "weapon-1",
				characterId: "char-1",
				equipmentId: "sword-1",
				label: "Espada de Latão Afiada",
				isSharp: 1,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 1,
				durabilityCurrent: 50,
				durabilityMax: 50,
				createdAt: "2026-05-17T00:00:00Z",
			};

			const profile = createCombatTrainingAttackProfile(mockInput, sharpWeapon);

			expect(profile.baseDiceTotal).toBe(4);
			expect(profile.extraModifierTotal).toBe(4); // Base 3 + 1 (Sharp)
			expect(profile.damageType).toBe("physical");
			expect(profile.helperText).toContain("Espada de Latão Afiada");
			expect(profile.helperText).toContain("[Afiada]");
		});

		it("integrates a Runic weapon correctly", () => {
			const runicWeapon: CharacterCraftedItemRecord = {
				id: "weapon-2",
				characterId: "char-1",
				equipmentId: "sword-2",
				label: "Cajado Rúnico",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 1,
				isEquipped: 1,
				durabilityCurrent: 50,
				durabilityMax: 50,
				createdAt: "2026-05-17T00:00:00Z",
			};

			const profile = createCombatTrainingAttackProfile(mockInput, runicWeapon);

			expect(profile.baseDiceTotal).toBe(4);
			expect(profile.extraModifierTotal).toBe(3);
			expect(profile.damageType).toBe("ether");
			expect(profile.affinities).toContain("ether");
			expect(profile.helperText).toContain("Cajado Rúnico");
			expect(profile.helperText).toContain("[Rúnica]");
		});

		it("integrates a combined Sharp + Runic weapon correctly", () => {
			const epicWeapon: CharacterCraftedItemRecord = {
				id: "weapon-3",
				characterId: "char-1",
				equipmentId: "blade-3",
				label: "Lâmina Éter-Afiada",
				isSharp: 1,
				isReinforced: 0,
				isRunic: 1,
				isEquipped: 1,
				durabilityCurrent: 50,
				durabilityMax: 50,
				createdAt: "2026-05-17T00:00:00Z",
			};

			const profile = createCombatTrainingAttackProfile(mockInput, epicWeapon);

			expect(profile.baseDiceTotal).toBe(4);
			expect(profile.extraModifierTotal).toBe(4); // Sharp bonus
			expect(profile.damageType).toBe("ether"); // Runic conversion
			expect(profile.affinities).toContain("ether");
			expect(profile.helperText).toContain("Lâmina Éter-Afiada");
			expect(profile.helperText).toContain("[Afiada]");
			expect(profile.helperText).toContain("[Rúnica]");
		});
	});
});
