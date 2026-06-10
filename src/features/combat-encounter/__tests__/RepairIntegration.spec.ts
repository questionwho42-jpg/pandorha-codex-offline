import { describe, expect, it } from "vitest";
import { InMemoryCraftingRepository } from "$lib/entities/equipment/__tests__/InMemoryCraftingRepository";
import type { CharacterCraftedItemRecord } from "$lib/entities/equipment/model/craftingSchema";
import { DamagePipelineService } from "$lib/shared/damage";
import { DiceService } from "$lib/shared/dice";
import {
	createDeterministicDiceClock,
	createSequentialDiceRollIdProvider,
	SequenceDiceRng,
} from "$lib/shared/dice/testing/SequenceDiceRng";
import { fail } from "$lib/shared/lib/result";
import { ResolutionService } from "$lib/shared/resolution";
import { CombatEncounterService } from "../domain/CombatEncounterService";
import type { CombatEncounterInput } from "../model/combatEncounterTypes";

describe("Repair & Durability Combat Integration (Fase 68)", () => {
	function createService(
		diceSequence: readonly number[],
		repository: InMemoryCraftingRepository,
	): CombatEncounterService {
		const diceService = new DiceService(
			new SequenceDiceRng(diceSequence),
			createSequentialDiceRollIdProvider("combat-integration"),
			createDeterministicDiceClock("2026-06-02T12:00:00.000Z"),
		);

		return new CombatEncounterService(
			new ResolutionService(diceService),
			new DamagePipelineService(),
			{ now: () => "2026-06-02T12:00:00.000Z" },
			diceService,
			repository,
		);
	}

	const defaultInput: CombatEncounterInput = {
		command: {
			id: "attack-1",
			type: "attack",
			createdAt: "2026-06-02T12:00:00.000Z",
		},
		attacker: { id: "attacker-1", label: "Guerreiro Atacante" },
		target: {
			id: "defender-1",
			label: "Inimigo Defensor",
			currentHitPoints: 20,
			armorClass: 10,
		},
		attack: {
			reason: "Ataque com Espada",
			level: 1,
			axisValue: 2,
			applicationValue: 2,
			itemBonus: 0,
		},
		damage: {
			damageType: "physical",
			baseDiceTotal: 4,
			matrixValue: 2,
			extraModifierTotal: 0,
			damageReduction: 0,
			vulnerabilityBonusDamage: 0,
			affinities: [],
		},
	};

	it("deve rebaixar a durabilidade da arma ativa do atacante em 25 pontos em caso de falha crítica (1 natural)", async () => {
		const repository = new InMemoryCraftingRepository();

		const activeWeapon: CharacterCraftedItemRecord = {
			id: "weapon-123",
			characterId: "attacker-1",
			equipmentId: "longsword", // preço de 5000 no catálogo
			label: "Espada Longa do Atacante",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 1,
			durabilityCurrent: 100,
			durabilityMax: 100,
			durability: "mint",
			createdAt: "2026-06-02T12:00:00.000Z",
		};
		await repository.saveCraftedItem(activeWeapon);

		// 0.0 rolls a natural 1 in SequenceDiceRng
		const service = createService([0.0], repository);

		const result = await service.resolveAttackAsync(defaultInput);
		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.resolution.isNaturalFailure).toBe(true);
			expect(result.data.log).toContain(
				"⚠️ A falha crítica causou desgaste físico em [Espada Longa do Atacante]! Durabilidade reduzida para 75/100 (damaged).",
			);
		}

		// Validar persistência do desgaste
		const items = await repository.findCraftedItemsByCharacterId("attacker-1");
		expect(items.success).toBe(true);
		if (items.success) {
			const sword = items.data.find((i) => i.id === "weapon-123");
			expect(sword?.durabilityCurrent).toBe(75);
			expect(sword?.durability).toBe("damaged");
		}
	});

	it("deve quebrar a arma (durability = broken, current = 0) ao atingir 0 de durabilidade", async () => {
		const repository = new InMemoryCraftingRepository();

		const activeWeapon: CharacterCraftedItemRecord = {
			id: "weapon-123",
			characterId: "attacker-1",
			equipmentId: "longsword",
			label: "Espada Desgastada",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 1,
			durabilityCurrent: 20, // menor que 25, vai cair para 0
			durabilityMax: 100,
			durability: "damaged",
			createdAt: "2026-06-02T12:00:00.000Z",
		};
		await repository.saveCraftedItem(activeWeapon);

		const service = createService([0.0], repository);

		const result = await service.resolveAttackAsync(defaultInput);
		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.log).toContain(
				"⚠️ A falha crítica causou desgaste físico em [Espada Desgastada]! Durabilidade reduzida para 0/100 (broken).",
			);
		}

		const items = await repository.findCraftedItemsByCharacterId("attacker-1");
		if (items.success) {
			const sword = items.data.find((i) => i.id === "weapon-123");
			expect(sword?.durabilityCurrent).toBe(0);
			expect(sword?.durability).toBe("broken");
		}
	});

	it("deve rebaixar o escudo do defensor em caso de acerto crítico do atacante", async () => {
		const repository = new InMemoryCraftingRepository();

		const shield: CharacterCraftedItemRecord = {
			id: "shield-123",
			characterId: "defender-1",
			equipmentId: "round-shield",
			label: "Broquel do Defensor",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 1,
			durabilityCurrent: 100,
			durabilityMax: 100,
			durability: "mint",
			createdAt: "2026-06-02T12:00:00.000Z",
		};
		const armor: CharacterCraftedItemRecord = {
			id: "armor-123",
			characterId: "defender-1",
			equipmentId: "leather-armor",
			label: "Armadura do Defensor",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 1,
			durabilityCurrent: 100,
			durabilityMax: 100,
			durability: "mint",
			createdAt: "2026-06-02T12:00:00.000Z",
		};
		await repository.saveCraftedItem(shield);
		await repository.saveCraftedItem(armor);

		// d20 roll needs to yield a critical success.
		// DC = target.armorClass = 10.
		// Roll + Level(1) + Axis(2) + App(2) = Roll + 5.
		// To achieve margin >= 10, roll + 5 >= 20 -> Roll >= 15.
		// 0.95 gives 20 natural, which triggers criticalSuccess
		const service = createService([0.95], repository);

		const result = await service.resolveAttackAsync(defaultInput);
		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.resolution.degree).toBe("criticalSuccess");
			expect(result.data.log).toContain(
				"⚠️ O acerto crítico causou desgaste físico em [Broquel do Defensor]! Durabilidade reduzida para 75/100 (damaged).",
			);
		}

		// Shield must be degraded, but armor must remain intact (shield takes precedence)
		const defenderItems =
			await repository.findCraftedItemsByCharacterId("defender-1");
		if (defenderItems.success) {
			const savedShield = defenderItems.data.find((i) => i.id === "shield-123");
			const savedArmor = defenderItems.data.find((i) => i.id === "armor-123");
			expect(savedShield?.durabilityCurrent).toBe(75);
			expect(savedShield?.durability).toBe("damaged");
			expect(savedArmor?.durabilityCurrent).toBe(100);
			expect(savedArmor?.durability).toBe("mint");
		}
	});

	it("deve rebaixar a armadura do defensor se ele não estiver usando escudo em caso de acerto crítico", async () => {
		const repository = new InMemoryCraftingRepository();

		const armor: CharacterCraftedItemRecord = {
			id: "armor-123",
			characterId: "defender-1",
			equipmentId: "leather-armor",
			label: "Armadura do Defensor",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 1,
			durabilityCurrent: 100,
			durabilityMax: 100,
			durability: "mint",
			createdAt: "2026-06-02T12:00:00.000Z",
		};
		await repository.saveCraftedItem(armor);

		const service = createService([0.95], repository);

		const result = await service.resolveAttackAsync(defaultInput);
		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.log).toContain(
				"⚠️ O acerto crítico causou desgaste físico em [Armadura do Defensor]! Durabilidade reduzida para 75/100 (damaged).",
			);
		}

		const defenderItems =
			await repository.findCraftedItemsByCharacterId("defender-1");
		if (defenderItems.success) {
			const savedArmor = defenderItems.data.find((i) => i.id === "armor-123");
			expect(savedArmor?.durabilityCurrent).toBe(75);
			expect(savedArmor?.durability).toBe("damaged");
		}
	});

	it("deve falhar a validação se o input for inválido em resolveAttackAsync", async () => {
		const repository = new InMemoryCraftingRepository();
		const service = createService([], repository);
		const result = await service.resolveAttackAsync({});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("INVALID_COMBAT_ENCOUNTER_INPUT");
		}
	});

	describe("resolveAttackAsync additional branch coverage", () => {
		class FailingCraftingRepository extends InMemoryCraftingRepository {
			public findFailure: string | null = null;
			public updateFailure: string | null = null;

			public override async findCraftedItemsByCharacterId(characterId: string) {
				if (this.findFailure) {
					return fail({
						code: "CRAFTING_REPOSITORY_READ_FAILED" as const,
						message: this.findFailure,
					});
				}
				return super.findCraftedItemsByCharacterId(characterId);
			}

			public override async updateCraftedItem(
				item: CharacterCraftedItemRecord,
			) {
				if (this.updateFailure) {
					return fail({
						code: "CRAFTING_REPOSITORY_WRITE_FAILED" as const,
						message: this.updateFailure,
					});
				}
				return super.updateCraftedItem(item);
			}
		}

		it("deve ignorar desgaste se a busca por itens do atacante falhar em falha crítica", async () => {
			const repository = new FailingCraftingRepository();
			repository.findFailure = "Erro de banco simulado";
			const service = createService([0.0], repository);

			const result = await service.resolveAttackAsync(defaultInput);
			expect(result.success).toBe(true);
		});

		it("deve ignorar desgaste se o atacante não tiver armas equipadas", async () => {
			const repository = new FailingCraftingRepository();
			const unequippedWeapon: CharacterCraftedItemRecord = {
				id: "weapon-unequipped",
				characterId: "attacker-1",
				equipmentId: "longsword",
				label: "Espada Desequipada",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 0,
				durabilityCurrent: 100,
				durabilityMax: 100,
				durability: "mint",
				createdAt: "2026-06-02T12:00:00.000Z",
			};
			await repository.saveCraftedItem(unequippedWeapon);

			const service = createService([0.0], repository);
			const result = await service.resolveAttackAsync(defaultInput);
			expect(result.success).toBe(true);

			const items =
				await repository.findCraftedItemsByCharacterId("attacker-1");
			expect(items.success).toBe(true);
			if (items.success) {
				expect(items.data[0]?.durabilityCurrent).toBe(100);
			}
		});

		it("deve ignorar desgaste se o atacante tiver um item equipado mas que não é arma", async () => {
			const repository = new FailingCraftingRepository();
			const equippedArmor: CharacterCraftedItemRecord = {
				id: "armor-equipped",
				characterId: "attacker-1",
				equipmentId: "leather-armor",
				label: "Armadura do Atacante",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 1,
				durabilityCurrent: 100,
				durabilityMax: 100,
				durability: "mint",
				createdAt: "2026-06-02T12:00:00.000Z",
			};
			await repository.saveCraftedItem(equippedArmor);

			const service = createService([0.0], repository);
			const result = await service.resolveAttackAsync(defaultInput);
			expect(result.success).toBe(true);

			const items =
				await repository.findCraftedItemsByCharacterId("attacker-1");
			expect(items.success).toBe(true);
			if (items.success) {
				expect(items.data[0]?.durabilityCurrent).toBe(100);
			}
		});

		it("deve ignorar desgaste do defensor se a busca por itens do defensor falhar em acerto crítico", async () => {
			const repository = new FailingCraftingRepository();
			repository.findFailure = "Erro de banco simulado";
			const service = createService([0.95], repository);

			const result = await service.resolveAttackAsync(defaultInput);
			expect(result.success).toBe(true);
		});

		it("deve ignorar desgaste do defensor se o defensor não possuir armadura ou escudo equipados", async () => {
			const repository = new FailingCraftingRepository();
			const service = createService([0.95], repository);

			const result = await service.resolveAttackAsync(defaultInput);
			expect(result.success).toBe(true);
		});

		it("deve ignorar desgaste se a atualização de durabilidade falhar no banco", async () => {
			const repository = new FailingCraftingRepository();
			const activeWeapon: CharacterCraftedItemRecord = {
				id: "weapon-123",
				characterId: "attacker-1",
				equipmentId: "longsword",
				label: "Espada Longa",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 1,
				durabilityCurrent: 100,
				durabilityMax: 100,
				durability: "mint",
				createdAt: "2026-06-02T12:00:00.000Z",
			};
			await repository.saveCraftedItem(activeWeapon);
			repository.updateFailure = "Falha ao atualizar";

			const service = createService([0.0], repository);
			const result = await service.resolveAttackAsync(defaultInput);
			expect(result.success).toBe(true);
		});

		it("deve ignorar desgaste do atacante se o item equipado tiver equipmentId desconhecido", async () => {
			const repository = new FailingCraftingRepository();
			const unknownWeapon: CharacterCraftedItemRecord = {
				id: "weapon-unknown",
				characterId: "attacker-1",
				equipmentId: "non-existent-id",
				label: "Item Desconhecido",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 1,
				durabilityCurrent: 100,
				durabilityMax: 100,
				durability: "mint",
				createdAt: "2026-06-02T12:00:00.000Z",
			};
			await repository.saveCraftedItem(unknownWeapon);

			const service = createService([0.0], repository);
			const result = await service.resolveAttackAsync(defaultInput);
			expect(result.success).toBe(true);

			const items =
				await repository.findCraftedItemsByCharacterId("attacker-1");
			expect(items.success).toBe(true);
			if (items.success) {
				expect(items.data[0]?.durabilityCurrent).toBe(100);
			}
		});

		it("deve ignorar desgaste do defensor se o item equipado tiver equipmentId desconhecido", async () => {
			const repository = new FailingCraftingRepository();
			const unknownShield: CharacterCraftedItemRecord = {
				id: "shield-unknown",
				characterId: "defender-1",
				equipmentId: "non-existent-id",
				label: "Item Desconhecido do Defensor",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 1,
				durabilityCurrent: 100,
				durabilityMax: 100,
				durability: "mint",
				createdAt: "2026-06-02T12:00:00.000Z",
			};
			await repository.saveCraftedItem(unknownShield);

			const service = createService([0.95], repository);
			const result = await service.resolveAttackAsync(defaultInput);
			expect(result.success).toBe(true);

			const items =
				await repository.findCraftedItemsByCharacterId("defender-1");
			expect(items.success).toBe(true);
			if (items.success) {
				expect(items.data[0]?.durabilityCurrent).toBe(100);
			}
		});

		it("deve funcionar normalmente em resolveAttackAsync se o repository não for configurado", async () => {
			const service = new CombatEncounterService(
				new ResolutionService(
					new DiceService(
						new SequenceDiceRng([0.5]),
						createSequentialDiceRollIdProvider("combat-integration-no-repo"),
						createDeterministicDiceClock("2026-06-02T12:00:00.000Z"),
					),
				),
				new DamagePipelineService(),
				{ now: () => "2026-06-02T12:00:00.000Z" },
			);

			const result = await service.resolveAttackAsync(defaultInput);
			expect(result.success).toBe(true);
		});
	});
});
