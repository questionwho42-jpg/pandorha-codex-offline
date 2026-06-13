import { describe, expect, it } from "vitest";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	BaseCraftedEquipment,
	ElementAffinityDecorator,
	InfusedRuneDecorator,
	RunicEquipmentDecorator,
} from "../domain/CraftingQualityDecorators";
import { SynergyForgeService } from "../domain/SynergyForgeService";
import { DrizzleCraftingRepository } from "../infrastructure/DrizzleCraftingRepository";
import type { CharacterCraftedItemRecord } from "../model/craftingSchema";
import type { CraftingFailure } from "../model/craftingTypes";

class MockCraftingRepository extends DrizzleCraftingRepository {
	public items: CharacterCraftedItemRecord[] = [];
	public shouldFailFind = false;
	public shouldFailUpdate = false;

	public constructor() {
		super(null as any);
	}

	public override async findCraftedItemsByCharacterId(
		characterId: string,
	): Promise<Result<readonly CharacterCraftedItemRecord[], CraftingFailure>> {
		if (this.shouldFailFind) {
			return fail({
				code: "CRAFTING_DATABASE_ERROR" as const,
				message: "Erro simulado de busca",
			});
		}
		return ok(this.items.filter((it) => it.characterId === characterId));
	}

	public override async updateCraftedItem(
		item: CharacterCraftedItemRecord,
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		if (this.shouldFailUpdate) {
			return fail({
				code: "CRAFTING_DATABASE_ERROR" as const,
				message: "Erro simulado de salvamento",
			});
		}
		const idx = this.items.findIndex((it) => it.id === item.id);
		if (idx !== -1) {
			this.items[idx] = item;
		} else {
			this.items.push(item);
		}
		return ok(item);
	}
}

describe("SynergyForgeService", () => {
	it("deve infundir runa em um item com slots rúnicos disponíveis e atualizar o label", async () => {
		const repo = new MockCraftingRepository();
		const service = new SynergyForgeService(repo);

		// Item rúnico possui 1 slot base + 1 adicional do decorador rúnico = 2 slots
		const item: CharacterCraftedItemRecord = {
			id: "crafted-sword-01",
			characterId: "char-lia",
			equipmentId: "longsword", // No catálogo possui runeSlots = 1 por padrão
			label: "Espada de Treino",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 1, // Runic
			isEquipped: 0,
			durabilityCurrent: 40,
			durabilityMax: 40,
			durability: "mint",
			elementalAffinity: null,
			infusedRunesJson: null,
			createdAt: new Date().toISOString(),
		};
		repo.items.push(item);

		// Infunde primeira runa (rune_stone)
		const res1 = await service.infuseRune({
			characterId: "char-lia",
			itemId: "crafted-sword-01",
			runeType: "rune_stone",
			characterMaterials: { rune_stone: 5 },
		});

		expect(res1.success).toBe(true);
		if (res1.success) {
			expect(res1.data.label).toContain("[Runa: Eleriana]");
			expect(res1.data.infusedRunesJson).toBe(JSON.stringify(["rune_stone"]));
		}

		// Infunde segunda runa (ancient_relic)
		const res2 = await service.infuseRune({
			characterId: "char-lia",
			itemId: "crafted-sword-01",
			runeType: "ancient_relic",
			characterMaterials: { rune_stone: 5, ancient_relic: 2 },
		});

		expect(res2.success).toBe(true);
		if (res2.success) {
			expect(res2.data.infusedRunesJson).toBe(
				JSON.stringify(["rune_stone", "ancient_relic"]),
			);
		}

		// Tentar infundir uma terceira runa deve falhar (excedeu limite de 2 slots)
		const res3 = await service.infuseRune({
			characterId: "char-lia",
			itemId: "crafted-sword-01",
			runeType: "insight_scroll",
			characterMaterials: { insight_scroll: 1 },
		});

		expect(res3.success).toBe(false);
		if (!res3.success) {
			expect(res3.error.code).toBe("INSUFFICIENT_RUNE_SLOTS");
		}
	});

	it("deve falhar ao infundir runa se faltar material/runa no inventário", async () => {
		const repo = new MockCraftingRepository();
		const service = new SynergyForgeService(repo);

		const res = await service.infuseRune({
			characterId: "char-lia",
			itemId: "any",
			runeType: "rune_stone",
			characterMaterials: { rune_stone: 0 }, // Sem runa
		});

		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("INSUFFICIENT_MATERIALS");
		}
	});

	it("deve infundir afinidade elemental em uma arma consumindo essência mística", async () => {
		const repo = new MockCraftingRepository();
		const service = new SynergyForgeService(repo);

		const item: CharacterCraftedItemRecord = {
			id: "crafted-weapon-01",
			characterId: "char-lia",
			equipmentId: "longsword",
			label: "Espada de Treino",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 0,
			durabilityCurrent: 40,
			durabilityMax: 40,
			durability: "mint",
			elementalAffinity: null,
			infusedRunesJson: null,
			createdAt: new Date().toISOString(),
		};
		repo.items.push(item);

		const res = await service.infuseElementalAffinity({
			characterId: "char-lia",
			itemId: "crafted-weapon-01",
			affinity: "fire",
			characterMaterials: { "mystic-essence": 1 },
		});

		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.elementalAffinity).toBe("fire");
			expect(res.data.label).toBe("Espada de Treino de Fogo");
		}

		// Sobrescrevendo a afinidade elemental
		const res2 = await service.infuseElementalAffinity({
			characterId: "char-lia",
			itemId: "crafted-weapon-01",
			affinity: "void",
			characterMaterials: { "mystic-essence": 1 },
		});

		expect(res2.success).toBe(true);
		if (res2.success) {
			expect(res2.data.elementalAffinity).toBe("void");
			expect(res2.data.label).toBe("Espada de Treino do Vazio");
		}
	});

	it("deve falhar ao infundir afinidade elemental em armadura/escudo", async () => {
		const repo = new MockCraftingRepository();
		const service = new SynergyForgeService(repo);

		const item: CharacterCraftedItemRecord = {
			id: "crafted-shield-01",
			characterId: "char-lia",
			equipmentId: "round-shield", // Escudo no catálogo
			label: "Escudo de Treino",
			isSharp: 0,
			isReinforced: 0,
			isRunic: 0,
			isEquipped: 0,
			durabilityCurrent: 40,
			durabilityMax: 40,
			durability: "mint",
			elementalAffinity: null,
			infusedRunesJson: null,
			createdAt: new Date().toISOString(),
		};
		repo.items.push(item);

		const res = await service.infuseElementalAffinity({
			characterId: "char-lia",
			itemId: "crafted-shield-01",
			affinity: "fire",
			characterMaterials: { "mystic-essence": 1 },
		});

		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("INVALID_ITEM_KIND");
		}
	});

	it("deve validar modificadores qualitativos aplicados por ElementAffinityDecorator e InfusedRuneDecorator", () => {
		const baseSword = new BaseCraftedEquipment({
			id: "short-sword-01",
			label: "Espada Curta",
			kind: "weapon",
			slotCost: 2,
			priceCopper: 1500,
			durabilityCurrent: 40,
			durabilityMax: 40,
			mechanicalSummary: "1d6",
			runeSlots: 1,
		});

		// 1. Afinidade de Fogo (+1 dano)
		const fireSword = new ElementAffinityDecorator(baseSword, "fire");
		expect(fireSword.label).toBe("Espada Curta de Fogo");
		expect(fireSword.getDamageBonus()).toBe(1);
		expect(fireSword.getElementalAffinity()).toBe("fire");

		// 2. Afinidade do Vazio (+1 margem crítica)
		const voidSword = new ElementAffinityDecorator(baseSword, "void");
		expect(voidSword.label).toBe("Espada Curta do Vazio");
		expect(voidSword.getCriticalMarginBonus()).toBe(1);
		expect(voidSword.getElementalAffinity()).toBe("void");

		// 3. Runa Infundida (rune_stone: +1 dano, insight_scroll: +2 margem crítica)
		const runicSword = new InfusedRuneDecorator(baseSword, [
			"rune_stone",
			"insight_scroll",
		]);
		expect(runicSword.getDamageBonus()).toBe(1);
		expect(runicSword.getCriticalMarginBonus()).toBe(2);
		expect(runicSword.getInfusedRunesList()).toEqual([
			"rune_stone",
			"insight_scroll",
		]);
	});

	describe("SynergyForgeService - Ramos de Erro e Casos Limite", () => {
		it("infuseRune: deve falhar se findCraftedItemsByCharacterId falhar", async () => {
			const repo = new MockCraftingRepository();
			repo.shouldFailFind = true;
			const service = new SynergyForgeService(repo);

			const res = await service.infuseRune({
				characterId: "char-1",
				itemId: "item-1",
				runeType: "rune_stone",
				characterMaterials: { rune_stone: 1 },
			});
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("CRAFTING_DATABASE_ERROR");
			}
		});

		it("infuseRune: deve falhar se o item com itemId nao for encontrado", async () => {
			const repo = new MockCraftingRepository();
			const service = new SynergyForgeService(repo);

			const res = await service.infuseRune({
				characterId: "char-1",
				itemId: "item-nonexistent",
				runeType: "rune_stone",
				characterMaterials: { rune_stone: 1 },
			});
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("ITEM_NOT_FOUND");
			}
		});

		it("infuseRune: deve falhar se o equipmentId nao for encontrado no catalogo", async () => {
			const repo = new MockCraftingRepository();
			const service = new SynergyForgeService(repo);
			repo.items.push({
				id: "item-invalid-eq",
				characterId: "char-1",
				equipmentId: "invalid-recipe-id",
				label: "Item Invalido",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 0,
				durabilityCurrent: 10,
				durabilityMax: 10,
				durability: "mint",
				elementalAffinity: null,
				infusedRunesJson: null,
				createdAt: new Date().toISOString(),
			});

			const res = await service.infuseRune({
				characterId: "char-1",
				itemId: "item-invalid-eq",
				runeType: "rune_stone",
				characterMaterials: { rune_stone: 1 },
			});
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("RECIPE_NOT_FOUND");
			}
		});

		it("infuseRune: deve falhar se updateCraftedItem falhar", async () => {
			const repo = new MockCraftingRepository();
			repo.shouldFailUpdate = true;
			const service = new SynergyForgeService(repo);
			repo.items.push({
				id: "item-1",
				characterId: "char-1",
				equipmentId: "longsword",
				label: "Espada de Teste",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 0,
				durabilityCurrent: 40,
				durabilityMax: 40,
				durability: "mint",
				elementalAffinity: null,
				infusedRunesJson: null,
				createdAt: new Date().toISOString(),
			});

			const res = await service.infuseRune({
				characterId: "char-1",
				itemId: "item-1",
				runeType: "rune_stone",
				characterMaterials: { rune_stone: 1 },
			});
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("CRAFTING_DATABASE_ERROR");
			}
		});

		it("infuseElementalAffinity: deve falhar se findCraftedItemsByCharacterId falhar", async () => {
			const repo = new MockCraftingRepository();
			repo.shouldFailFind = true;
			const service = new SynergyForgeService(repo);

			const res = await service.infuseElementalAffinity({
				characterId: "char-1",
				itemId: "item-1",
				affinity: "fire",
				characterMaterials: { "mystic-essence": 1 },
			});
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("CRAFTING_DATABASE_ERROR");
			}
		});

		it("infuseElementalAffinity: deve falhar se o item nao for encontrado", async () => {
			const repo = new MockCraftingRepository();
			const service = new SynergyForgeService(repo);

			const res = await service.infuseElementalAffinity({
				characterId: "char-1",
				itemId: "item-nonexistent",
				affinity: "fire",
				characterMaterials: { "mystic-essence": 1 },
			});
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("ITEM_NOT_FOUND");
			}
		});

		it("infuseElementalAffinity: deve falhar se o recipeId nao existir no catalogo", async () => {
			const repo = new MockCraftingRepository();
			const service = new SynergyForgeService(repo);
			repo.items.push({
				id: "item-invalid-eq",
				characterId: "char-1",
				equipmentId: "invalid-recipe-id",
				label: "Item Invalido",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 0,
				durabilityCurrent: 10,
				durabilityMax: 10,
				durability: "mint",
				elementalAffinity: null,
				infusedRunesJson: null,
				createdAt: new Date().toISOString(),
			});

			const res = await service.infuseElementalAffinity({
				characterId: "char-1",
				itemId: "item-invalid-eq",
				affinity: "fire",
				characterMaterials: { "mystic-essence": 1 },
			});
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("RECIPE_NOT_FOUND");
			}
		});

		it("infuseElementalAffinity: deve testar afinidades de gelo e raio e falhar se update falhar", async () => {
			const repo = new MockCraftingRepository();
			const service = new SynergyForgeService(repo);
			const baseItem: Omit<CharacterCraftedItemRecord, "id" | "label"> = {
				characterId: "char-1",
				equipmentId: "longsword",
				isSharp: 0,
				isReinforced: 0,
				isRunic: 0,
				isEquipped: 0,
				durabilityCurrent: 40,
				durabilityMax: 40,
				durability: "mint",
				elementalAffinity: null,
				infusedRunesJson: null,
				createdAt: new Date().toISOString(),
			};
			repo.items.push({ ...baseItem, id: "item-frost", label: "Espada Curta" });
			repo.items.push({
				...baseItem,
				id: "item-lightning",
				label: "Espada Curta",
			});
			repo.items.push({ ...baseItem, id: "item-fail", label: "Espada Curta" });

			// 1. Frost
			const resFrost = await service.infuseElementalAffinity({
				characterId: "char-1",
				itemId: "item-frost",
				affinity: "frost",
				characterMaterials: { "mystic-essence": 1 },
			});
			expect(resFrost.success).toBe(true);
			if (resFrost.success) {
				expect(resFrost.data.label).toBe("Espada Curta de Gelo");
			}

			// 2. Lightning
			const resLightning = await service.infuseElementalAffinity({
				characterId: "char-1",
				itemId: "item-lightning",
				affinity: "lightning",
				characterMaterials: { "mystic-essence": 1 },
			});
			expect(resLightning.success).toBe(true);
			if (resLightning.success) {
				expect(resLightning.data.label).toBe("Espada Curta de Raio");
			}

			// 3. Fail on update
			repo.shouldFailUpdate = true;
			const resFail = await service.infuseElementalAffinity({
				characterId: "char-1",
				itemId: "item-fail",
				affinity: "frost",
				characterMaterials: { "mystic-essence": 1 },
			});
			expect(resFail.success).toBe(false);
			if (!resFail.success) {
				expect(resFail.error.code).toBe("CRAFTING_DATABASE_ERROR");
			}
		});

		it("infuseRune: deve instanciar decorators de sharp, reinforced e runic e tratar materials indefinidos como 0", async () => {
			const repo = new MockCraftingRepository();
			const service = new SynergyForgeService(repo);
			repo.items.push({
				id: "item-all-decorators",
				characterId: "char-1",
				equipmentId: "longsword",
				label: "Espada Suprema",
				isSharp: 1,
				isReinforced: 1,
				isRunic: 1,
				isEquipped: 0,
				durabilityCurrent: 40,
				durabilityMax: 40,
				durability: "mint" as const,
				elementalAffinity: null,
				infusedRunesJson: null,
				createdAt: new Date().toISOString(),
			});

			// Testa a falta de materiais (para cair no ?? 0)
			const resNoMat = await service.infuseRune({
				characterId: "char-1",
				itemId: "item-all-decorators",
				runeType: "rune_stone",
				characterMaterials: {}, // Vazio
			});
			expect(resNoMat.success).toBe(false);

			// Testa com materiais para percorrer os decorators
			const resOk = await service.infuseRune({
				characterId: "char-1",
				itemId: "item-all-decorators",
				runeType: "insight_scroll",
				characterMaterials: { insight_scroll: 1 },
			});
			expect(resOk.success).toBe(true);
			if (resOk.success) {
				expect(resOk.data.label).toContain("[Runa: Insight]");
			}
		});

		it("infuseElementalAffinity: deve tratar mystic-essence indefinido como 0", async () => {
			const repo = new MockCraftingRepository();
			const service = new SynergyForgeService(repo);
			const res = await service.infuseElementalAffinity({
				characterId: "char-1",
				itemId: "any",
				affinity: "fire",
				characterMaterials: {}, // Vazio
			});
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("INSUFFICIENT_MATERIALS");
			}
		});
	});
});
