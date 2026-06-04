import { describe, expect, it } from "vitest";
import type { CharacterRepository } from "$lib/entities/character/domain/CharacterRepository";
import type {
	CharacterRecord,
	CharacterStatusEffectRecord,
	NewCharacterRecord,
	NewCharacterStatusEffectRecord,
} from "$lib/entities/character/model/characterSchema";
import type { CharacterRepositoryFailure } from "$lib/entities/character/model/characterTypes";
import type { CraftingRepository } from "$lib/entities/equipment/domain/CraftingRepository";
import type {
	CharacterCraftedItemRecord,
	CraftingRecipeRecord,
	NewCharacterCraftedItemRecord,
	NewCraftingRecipeRecord,
} from "$lib/entities/equipment/model/craftingSchema";
import type { CraftingFailure } from "$lib/entities/equipment/model/craftingTypes";
import { DiceService } from "$lib/shared/dice";
import {
	createDeterministicDiceClock,
	createSequentialDiceRollIdProvider,
	SequenceDiceRng,
} from "$lib/shared/dice/testing/SequenceDiceRng";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { CombatLootService } from "../domain/CombatLootService";
import type { TacticalAiActor } from "../domain/TacticalAiService";
import type { Monster } from "../model/monsterCatalog";

class FakeCharacterRepository implements CharacterRepository {
	public list: CharacterRecord[] = [];

	public async save(
		record: NewCharacterRecord,
	): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
		const existingIdx = this.list.findIndex((c) => c.id === record.id);
		const fullRecord = record as CharacterRecord;
		if (existingIdx >= 0) {
			this.list[existingIdx] = fullRecord;
		} else {
			this.list.push(fullRecord);
		}
		return ok(fullRecord);
	}

	public async findById(
		id: string,
	): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
		const found = this.list.find((c) => c.id === id);
		return found
			? ok(found)
			: fail({ code: "CHARACTER_NOT_FOUND", message: "Character not found" });
	}

	public async saveStatusEffect(
		_effect: NewCharacterStatusEffectRecord,
	): Promise<Result<CharacterStatusEffectRecord, CharacterRepositoryFailure>> {
		return fail({
			code: "CHARACTER_REPOSITORY_WRITE_FAILED",
			message: "Not implemented",
		});
	}

	public async findStatusEffectsByCharacterId(
		_characterId: string,
	): Promise<
		Result<CharacterStatusEffectRecord[], CharacterRepositoryFailure>
	> {
		return ok([]);
	}

	public async deleteStatusEffect(
		_id: string,
	): Promise<Result<void, CharacterRepositoryFailure>> {
		return ok(undefined);
	}
}

class FakeCraftingRepository implements CraftingRepository {
	public list: CharacterCraftedItemRecord[] = [];

	public async saveRecipe(
		_recipe: NewCraftingRecipeRecord,
	): Promise<Result<CraftingRecipeRecord, CraftingFailure>> {
		return fail({
			code: "CRAFTING_DATABASE_ERROR",
			message: "Not implemented",
		});
	}

	public async findRecipeById(
		_id: string,
	): Promise<Result<CraftingRecipeRecord, CraftingFailure>> {
		return fail({
			code: "CRAFTING_DATABASE_ERROR",
			message: "Not implemented",
		});
	}

	public async findAllRecipes(): Promise<
		Result<readonly CraftingRecipeRecord[], CraftingFailure>
	> {
		return ok([]);
	}

	public async saveCraftedItem(
		item: NewCharacterCraftedItemRecord,
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		const fullItem = item as CharacterCraftedItemRecord;
		this.list.push(fullItem);
		return ok(fullItem);
	}

	public async findCraftedItemById(
		id: string,
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		const found = this.list.find((i) => i.id === id);
		return found
			? ok(found)
			: fail({ code: "ITEM_NOT_FOUND", message: "Item not found" });
	}

	public async findCraftedItemsByCharacterId(
		_characterId: string,
	): Promise<Result<readonly CharacterCraftedItemRecord[], CraftingFailure>> {
		return ok([]);
	}

	public async deleteCraftedItem(
		id: string,
	): Promise<Result<void, CraftingFailure>> {
		this.list = this.list.filter((i) => i.id !== id);
		return ok(undefined);
	}

	public async updateCraftedItemEquipStatus(
		_id: string,
		_isEquipped: number,
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		return fail({
			code: "CRAFTING_DATABASE_ERROR",
			message: "Not implemented",
		});
	}

	public async updateCraftedItemDurability(
		id: string,
		durabilityCurrent: number,
		durability: "mint" | "damaged" | "broken",
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		const item = this.list.find((i) => i.id === id);
		if (!item) {
			return fail({
				code: "ITEM_NOT_FOUND",
				message: "Item not found",
			});
		}
		const updated = { ...item, durabilityCurrent, durability };
		const idx = this.list.findIndex((i) => i.id === id);
		this.list[idx] = updated;
		return ok(updated);
	}

	public async updateCraftedItem(
		item: CharacterCraftedItemRecord,
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		const idx = this.list.findIndex((i) => i.id === item.id);
		if (idx === -1) {
			return fail({
				code: "ITEM_NOT_FOUND",
				message: "Item not found",
			});
		}
		this.list[idx] = item;
		return ok(item);
	}
}

function createTestDiceService(sequence: readonly number[]): DiceService {
	return new DiceService(
		new SequenceDiceRng(sequence),
		createSequentialDiceRollIdProvider("test-loot-roll"),
		createDeterministicDiceClock("2026-05-06T12:00:00.000Z"),
	);
}

describe("CombatLootService", () => {
	it("distribui XP igualmente para aventureiros vivos e salva no banco", async () => {
		const diceService = createTestDiceService([0.9]); // Chance de loot: 90% (não ganha loot)
		const charRepo = new FakeCharacterRepository();
		const craftingRepo = new FakeCraftingRepository();

		const charRecord = {
			id: "aria",
			name: "Aria",
			experiencePoints: 100,
			currentHp: 15,
		};
		await charRepo.save(charRecord as unknown as NewCharacterRecord);

		const service = new CombatLootService(charRepo, craftingRepo, diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 15,
				armorClass: 15,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 0,
				armorClass: 11,
				level: 1,
				attackBonus: 1,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 50,
			},
		];

		const res = await service.distributeRewards({
			party,
			monsters,
			batedorId: "aria",
		});

		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.xpConcedido).toBe(50);
			const findRes = await charRepo.findById("aria");
			expect(findRes.success).toBe(true);
			if (findRes.success) {
				expect(findRes.data.experiencePoints).toBe(150); // 100 base + 50 concedido
			}
			expect(res.data.lootsConcedidos.length).toBe(0);
		}
	});

	it("concede loot físico se a rolagem de chance for bem-sucedida", async () => {
		// d100 = 20 (0.2 -> chance <= 50% de ganhar loot). Sorteio: 0.1 (primeiro item do catálogo: longsword).
		const diceService = createTestDiceService([0.2, 0.1]);
		const charRepo = new FakeCharacterRepository();
		const craftingRepo = new FakeCraftingRepository();

		const charRecord = {
			id: "aria",
			name: "Aria",
			experiencePoints: 100,
			currentHp: 15,
		};
		await charRepo.save(charRecord as unknown as NewCharacterRecord);

		const service = new CombatLootService(charRepo, craftingRepo, diceService);

		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 15,
				armorClass: 15,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 0,
				armorClass: 11,
				level: 1,
				attackBonus: 1,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 50,
			},
		];

		const res = await service.distributeRewards({
			party,
			monsters,
			batedorId: "aria",
		});

		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.lootsConcedidos.length).toBe(1);
			expect(res.data.lootsConcedidos[0]?.equipmentId).toBe("longsword");
			expect(craftingRepo.list.length).toBe(1);
			expect(craftingRepo.list[0]?.characterId).toBe("aria");
		}
	});

	it("não distribui XP para aventureiros caídos ou mortos", async () => {
		const diceService = createTestDiceService([0.9]);
		const charRepo = new FakeCharacterRepository();
		const craftingRepo = new FakeCraftingRepository();

		const charRecord = {
			id: "boris",
			name: "Boris",
			experiencePoints: 100,
			currentHp: 0,
		};
		await charRepo.save(charRecord as unknown as NewCharacterRecord);

		const service = new CombatLootService(charRepo, craftingRepo, diceService);

		const party: TacticalAiActor[] = [
			{
				id: "boris",
				name: "Boris",
				maxHp: 20,
				currentHp: 0, // Está caído
				armorClass: 15,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: true,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];

		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 0,
				armorClass: 11,
				level: 1,
				attackBonus: 1,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 50,
			},
		];

		const res = await service.distributeRewards({
			party,
			monsters,
			batedorId: "boris",
		});

		expect(res.success).toBe(true);
		if (res.success) {
			const findRes = await charRepo.findById("boris");
			expect(findRes.success).toBe(true);
			if (findRes.success) {
				expect(findRes.data.experiencePoints).toBe(100); // Manteve 100, não subiu
			}
		}
	});

	it("registra log de aviso se o findById falhar para o aventureiro vivo", async () => {
		const diceService = createTestDiceService([0.9]);
		class MockableCharacterRepository extends FakeCharacterRepository {
			public override async findById(
				_id: string,
			): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
				return fail({
					code: "CHARACTER_NOT_FOUND",
					message: "Erro de busca simulado",
				});
			}
		}
		const charRepo = new MockableCharacterRepository();
		const craftingRepo = new FakeCraftingRepository();

		const service = new CombatLootService(charRepo, craftingRepo, diceService);
		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 15,
				armorClass: 15,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];
		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 0,
				armorClass: 11,
				level: 1,
				attackBonus: 1,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 50,
			},
		];

		const res = await service.distributeRewards({
			party,
			monsters,
			batedorId: "aria",
		});

		expect(res.success).toBe(true);
		if (res.success) {
			expect(
				res.data.logs.some((l) =>
					l.includes("Não foi possível localizar o registro de Aria"),
				),
			).toBe(true);
		}
	});

	it("registra log de aviso se o save falhar para o aventureiro vivo", async () => {
		const diceService = createTestDiceService([0.9]);
		class MockableCharacterRepository extends FakeCharacterRepository {
			public override async save(
				record: NewCharacterRecord,
			): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
				// Permite o primeiro save na inicialização do teste
				if (this.list.length > 0) {
					return fail({
						code: "CHARACTER_REPOSITORY_WRITE_FAILED",
						message: "Erro de escrita simulado",
					});
				}
				return super.save(record);
			}
		}
		const charRepo = new MockableCharacterRepository();
		const craftingRepo = new FakeCraftingRepository();

		const charRecord = {
			id: "aria",
			name: "Aria",
			experiencePoints: 100,
			currentHp: 15,
		};
		await charRepo.save(charRecord as unknown as NewCharacterRecord);

		const service = new CombatLootService(charRepo, craftingRepo, diceService);
		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 15,
				armorClass: 15,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];
		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 0,
				armorClass: 11,
				level: 1,
				attackBonus: 1,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 50,
			},
		];

		const res = await service.distributeRewards({
			party,
			monsters,
			batedorId: "aria",
		});

		expect(res.success).toBe(true);
		if (res.success) {
			expect(
				res.data.logs.some((l) =>
					l.includes("Não foi possível salvar progresso de XP para Aria"),
				),
			).toBe(true);
		}
	});

	it("retorna sucesso com XP zero se o total de XP dos monstros for zero", async () => {
		const diceService = createTestDiceService([0.9]);
		const charRepo = new FakeCharacterRepository();
		const craftingRepo = new FakeCraftingRepository();

		const service = new CombatLootService(charRepo, craftingRepo, diceService);
		const party: TacticalAiActor[] = [
			{
				id: "aria",
				name: "Aria",
				maxHp: 20,
				currentHp: 15,
				armorClass: 15,
				level: 1,
				physical: 1,
				mental: 1,
				resistance: 1,
				isDying: false,
				deathSuccesses: 0,
				deathFailures: 0,
			},
		];
		const monsters: Monster[] = [
			{
				id: "goblin-1",
				label: "Goblin",
				description: "Goblin",
				maxHitPoints: 10,
				currentHitPoints: 0,
				armorClass: 11,
				level: 1,
				attackBonus: 1,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 0,
			},
		];

		const res = await service.distributeRewards({
			party,
			monsters,
			batedorId: "aria",
		});

		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.xpConcedido).toBe(0);
			expect(res.data.logs[0]).toContain("Nenhuma recompensa de XP");
		}
	});
});
