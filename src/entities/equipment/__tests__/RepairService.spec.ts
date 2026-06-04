/* biome-ignore-start lint/style/noNonNullAssertion: legacy test assertions */
import { beforeEach, describe, expect, it } from "vitest";
import type { ICharacterStats } from "$lib/entities/character/domain/StatusEffectDecorator";
import { DiceService } from "$lib/shared/dice";
import {
	createDeterministicDiceClock,
	createSequentialDiceRollIdProvider,
	SequenceDiceRng,
} from "$lib/shared/dice/testing/SequenceDiceRng";
import { fail, type Result } from "$lib/shared/lib/result";
import { ResolutionService } from "$lib/shared/resolution";
import type {
	ResolutionFailure,
	ResolutionResult,
} from "$lib/shared/resolution/model/resolutionTypes";
import { RepairService } from "../domain/RepairService";
import type { CharacterCraftedItemRecord } from "../model/craftingSchema";
import type { CraftingFailure } from "../model/craftingTypes";
import { InMemoryCraftingRepository } from "./InMemoryCraftingRepository";

// Subclasse fake do repositório para simular falhas sob demanda
class FailingCraftingRepository extends InMemoryCraftingRepository {
	public shouldFailUpdate = false;

	public override async updateCraftedItem(
		item: CharacterCraftedItemRecord,
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		if (this.shouldFailUpdate) {
			return fail({
				code: "CRAFTING_REPOSITORY_WRITE_FAILED",
				message: "Erro de atualizacao no repositorio",
			});
		}
		return super.updateCraftedItem(item);
	}
}

// Subclasse fake do ResolutionService para simular falhas sob demanda
class FailingResolutionService extends ResolutionService {
	public shouldFail = false;

	public override resolveGlobalTest(
		input: unknown,
	): Result<ResolutionResult, ResolutionFailure> {
		if (this.shouldFail) {
			return fail({
				code: "DICE_ROLL_FAILED",
				message: "Erro de teste global",
			});
		}
		return super.resolveGlobalTest(input);
	}
}

describe("RepairService (TDD - Durabilidade e Reparo de Equipamentos)", () => {
	let repository: InMemoryCraftingRepository;
	let resolutionService: ResolutionService;
	let service: RepairService;

	function setupDiceService(sequence: readonly number[]): void {
		const diceService = new DiceService(
			new SequenceDiceRng(sequence),
			createSequentialDiceRollIdProvider("repair-test"),
			createDeterministicDiceClock("2026-06-02T12:00:00.000Z"),
		);
		resolutionService = new ResolutionService(diceService);
		service = new RepairService(repository, resolutionService);
	}

	const mockCharacter: ICharacterStats = {
		physical: 2,
		mental: 3,
		social: 1,
		conflict: 2,
		interaction: 2,
		resistance: 2,
		level: 3,
		classBaseHp: 10,
		maxHp: 30,
		maxEe: 10,
		initiativeBase: 8,
		carrySlotLimit: 8,
		movementSpeedBase: 9,
		armorClass: 15,
		stealthPenalty: 0,
		currentCarryWeight: 0,
		encumbranceState: "light",
		allowsNaturalRecovery: true,
		size: "medium",
		weaponDamageBonus: 0,
		extraActions: 0,
		attackBonus: 0,
		ignoresDifficultTerrain: false,
		automaticDefenseFailure: false,
		hasLatentDiscoordination: false,
		latentDiscoordinationAxis: null,
		latentDiscoordinationTestsLeft: 0,
	};

	beforeEach(() => {
		repository = new InMemoryCraftingRepository();
	});

	describe("calculateRepairCost", () => {
		it("deve retornar 0 para itens íntegros (mint)", () => {
			setupDiceService([0.5]);
			const item: CharacterCraftedItemRecord = {
				id: "item-1",
				characterId: "char-1",
				equipmentId: "longsword", // Preço: 5000 cobre
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

			const cost = service.calculateRepairCost(item);
			expect(cost).toBe(0);
		});

		it("deve cobrar 10% para itens danificados (damaged)", () => {
			setupDiceService([0.5]);
			const item: CharacterCraftedItemRecord = {
				id: "item-1",
				characterId: "char-1",
				equipmentId: "longsword",
				label: "Espada Longa",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 1,
				durabilityCurrent: 50,
				durabilityMax: 100,
				durability: "damaged",
				createdAt: "2026-06-02T12:00:00.000Z",
			};

			const cost = service.calculateRepairCost(item);
			expect(cost).toBe(500); // 10% de 5000
		});

		it("deve cobrar 30% para itens quebrados (broken)", () => {
			setupDiceService([0.5]);
			const item: CharacterCraftedItemRecord = {
				id: "item-1",
				characterId: "char-1",
				equipmentId: "leather-armor", // Preço: 10000 cobre
				label: "Armadura de Couro",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 1,
				durabilityCurrent: 0,
				durabilityMax: 100,
				durability: "broken",
				createdAt: "2026-06-02T12:00:00.000Z",
			};

			const cost = service.calculateRepairCost(item);
			expect(cost).toBe(3000); // 30% de 10000
		});

		it("deve cobrar 50% para itens mágicos/rúnicos (isRunic === 1 ou isMagical)", () => {
			setupDiceService([0.5]);
			const item: CharacterCraftedItemRecord = {
				id: "item-1",
				characterId: "char-1",
				equipmentId: "longsword",
				label: "Espada Longa Rúnica",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 1,
				isEquipped: 1,
				durabilityCurrent: 10,
				durabilityMax: 100,
				durability: "damaged",
				createdAt: "2026-06-02T12:00:00.000Z",
			};

			const cost1 = service.calculateRepairCost(item, false);
			expect(cost1).toBe(2500); // 50% de 5000 por ser rúnico

			const normalItem: CharacterCraftedItemRecord = {
				...item,
				isRunic: 0,
			};
			const cost2 = service.calculateRepairCost(normalItem, true);
			expect(cost2).toBe(2500); // 50% de 5000 por isMagical true
		});

		it("deve usar o preco padrao de segurança se o item nao estiver no catalogo oficial", () => {
			setupDiceService([0.5]);
			const item: CharacterCraftedItemRecord = {
				id: "item-1",
				characterId: "char-1",
				equipmentId: "equipamento-inexistente-no-catalogo",
				label: "Item Desconhecido",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 1,
				durabilityCurrent: 0,
				durabilityMax: 100,
				durability: "broken",
				createdAt: "2026-06-02T12:00:00.000Z",
			};

			const cost = service.calculateRepairCost(item);
			expect(cost).toBe(300); // 30% do default 1000 cobre = 300
		});
	});

	describe("performRepair", () => {
		it("deve falhar se o ouro disponível for insuficiente", async () => {
			setupDiceService([0.5]);
			const item: CharacterCraftedItemRecord = {
				id: "item-1",
				characterId: "char-1",
				equipmentId: "longsword",
				label: "Espada Longa",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 1,
				durabilityCurrent: 50,
				durabilityMax: 100,
				durability: "damaged",
				createdAt: "2026-06-02T12:00:00.000Z",
			};
			await repository.saveCraftedItem(item);

			const result = await service.performRepair({
				character: mockCharacter,
				item,
				hasRepairKit: true,
				difficultyClass: 12,
				availableGoldCopper: 200, // Custo: 500
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("INSUFFICIENT_GOLD");
			}
		});

		it("deve consertar com sucesso se passar no teste", async () => {
			// Rola 10 natural. Total = 10 + 3 (level) + 3 (mental) + 2 (interaction) = 18 vs DC 12
			setupDiceService([0.45]);
			const item: CharacterCraftedItemRecord = {
				id: "item-1",
				characterId: "char-1",
				equipmentId: "longsword",
				label: "Espada Longa",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 1,
				durabilityCurrent: 50,
				durabilityMax: 100,
				durability: "damaged",
				createdAt: "2026-06-02T12:00:00.000Z",
			};
			await repository.saveCraftedItem(item);

			const result = await service.performRepair({
				character: mockCharacter,
				item,
				hasRepairKit: true,
				difficultyClass: 12,
				availableGoldCopper: 1000,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(true);
				expect(result.data.goldSpent).toBe(500);
				expect(result.data.item.durabilityCurrent).toBe(100);
				expect(result.data.item.durability).toBe("mint");

				// Validar persistência no repo
				const saved = await repository.findCraftedItemsByCharacterId("char-1");
				expect(saved.success).toBe(true);
				if (saved.success) {
					expect(saved.data[0]!.durabilityCurrent).toBe(100);
					expect(saved.data[0]!.durability).toBe("mint");
				}
			}
		});

		it("deve aplicar penalidade de -4 no teste quando sem kit de reparo", async () => {
			// Rola 5 natural. Total = 5 + 3 (level) + 3 (mental) + 2 (interaction) - 4 (no kit) = 9 vs DC 12 (Falha)
			setupDiceService([0.2]);
			const item: CharacterCraftedItemRecord = {
				id: "item-1",
				characterId: "char-1",
				equipmentId: "longsword",
				label: "Espada Longa",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 1,
				durabilityCurrent: 50,
				durabilityMax: 100,
				durability: "damaged",
				createdAt: "2026-06-02T12:00:00.000Z",
			};
			await repository.saveCraftedItem(item);

			const result = await service.performRepair({
				character: mockCharacter,
				item,
				hasRepairKit: false, // penalidade -4
				difficultyClass: 12,
				availableGoldCopper: 1000,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(false);
				expect(result.data.goldSpent).toBe(0);
				expect(result.data.item.durabilityCurrent).toBe(50);
				expect(result.data.item.durability).toBe("damaged");
			}
		});

		it("deve perder runas (isRunic = 0) sob falha crítica de item mágico/rúnico", async () => {
			// Rola 1 natural (falha crítica)
			setupDiceService([0.0]);
			const item: CharacterCraftedItemRecord = {
				id: "item-1",
				characterId: "char-1",
				equipmentId: "longsword",
				label: "Espada Longa Rúnica",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 1,
				isEquipped: 1,
				durabilityCurrent: 50,
				durabilityMax: 100,
				durability: "damaged",
				createdAt: "2026-06-02T12:00:00.000Z",
			};
			await repository.saveCraftedItem(item);

			const result = await service.performRepair({
				character: mockCharacter,
				item,
				hasRepairKit: true,
				difficultyClass: 12,
				isMagical: true,
				availableGoldCopper: 3000,
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.success).toBe(false);
				expect(result.data.item.isRunic).toBe(0); // Runa quebrada/removida!

				const saved = await repository.findCraftedItemsByCharacterId("char-1");
				expect(saved.success).toBe(true);
				if (saved.success) {
					expect(saved.data[0]!.isRunic).toBe(0);
				}
			}
		});

		it("deve propagar erro se a resolucao global do teste falhar", async () => {
			setupDiceService([0.5]);
			const failingResolution = new FailingResolutionService(
				new DiceService(
					new SequenceDiceRng([0.5]),
					createSequentialDiceRollIdProvider("repair-test"),
					createDeterministicDiceClock("2026-06-02T12:00:00.000Z"),
				),
			);
			failingResolution.shouldFail = true;
			const localService = new RepairService(repository, failingResolution);

			const item: CharacterCraftedItemRecord = {
				id: "item-1",
				characterId: "char-1",
				equipmentId: "longsword",
				label: "Espada Longa",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 1,
				durabilityCurrent: 50,
				durabilityMax: 100,
				durability: "damaged",
				createdAt: "2026-06-02T12:00:00.000Z",
			};
			await repository.saveCraftedItem(item);

			const result = await localService.performRepair({
				character: mockCharacter,
				item,
				hasRepairKit: true,
				difficultyClass: 12,
				availableGoldCopper: 1000,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("RESOLUTION_FAILED");
			}
		});

		it("deve propagar erro se o updateCraftedItem falhar no fluxo de sucesso", async () => {
			setupDiceService([0.45]); // Rola 10 natural -> Sucesso
			const failingRepo = new FailingCraftingRepository();
			failingRepo.shouldFailUpdate = true;

			const localService = new RepairService(failingRepo, resolutionService);

			const item: CharacterCraftedItemRecord = {
				id: "item-1",
				characterId: "char-1",
				equipmentId: "longsword",
				label: "Espada Longa",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 1,
				durabilityCurrent: 50,
				durabilityMax: 100,
				durability: "damaged",
				createdAt: "2026-06-02T12:00:00.000Z",
			};
			await failingRepo.saveCraftedItem(item);

			const result = await localService.performRepair({
				character: mockCharacter,
				item,
				hasRepairKit: true,
				difficultyClass: 12,
				availableGoldCopper: 1000,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("CRAFTING_REPOSITORY_WRITE_FAILED");
			}
		});

		it("deve propagar erro se o updateCraftedItem falhar no fluxo de falha critica", async () => {
			setupDiceService([0.0]); // Rola 1 natural -> Falha critica
			const failingRepo = new FailingCraftingRepository();
			failingRepo.shouldFailUpdate = true;

			const localService = new RepairService(failingRepo, resolutionService);

			const item: CharacterCraftedItemRecord = {
				id: "item-1",
				characterId: "char-1",
				equipmentId: "longsword",
				label: "Espada Longa Rúnica",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 1,
				isEquipped: 1,
				durabilityCurrent: 50,
				durabilityMax: 100,
				durability: "damaged",
				createdAt: "2026-06-02T12:00:00.000Z",
			};
			await failingRepo.saveCraftedItem(item);

			const result = await localService.performRepair({
				character: mockCharacter,
				item,
				hasRepairKit: true,
				difficultyClass: 12,
				availableGoldCopper: 3000,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("CRAFTING_REPOSITORY_WRITE_FAILED");
			}
		});
	});
});
/* biome-ignore-end */
