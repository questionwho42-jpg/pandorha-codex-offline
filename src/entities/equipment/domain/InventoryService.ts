import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { ICharacterStats } from "../../character/domain/StatusEffectDecorator";
import { EncumberedStatusDecorator } from "../../character/domain/StatusEffectDecorator";
import type { CharacterCraftedItemRecord } from "../model/craftingSchema";
import type { CraftingFailure } from "../model/craftingTypes";
import { OFFICIAL_EQUIPMENT } from "../model/equipmentCatalog";
import type { CraftingRepository } from "./CraftingRepository";

export interface InventoryState {
	readonly equippedWeight: number;
	readonly decoratedStats: ICharacterStats;
	readonly items: readonly CharacterCraftedItemRecord[];
}

export class InventoryService {
	public constructor(private readonly repository: CraftingRepository) {}

	/**
	 * Equipa um item artesanal definindo isEquipped = 1 no banco SQLite
	 */
	public async equipItem(
		itemId: string,
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		return this.repository.updateCraftedItemEquipStatus(itemId, 1);
	}

	/**
	 * Desequipa um item artesanal definindo isEquipped = 0 no banco SQLite
	 */
	public async unequipItem(
		itemId: string,
	): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		return this.repository.updateCraftedItemEquipStatus(itemId, 0);
	}

	/**
	 * Recupera o inventário do personagem, soma os pesos e monta a cebola de decoradores táticos reativamente.
	 */
	public async getCharacterInventoryState(
		characterId: string,
		baseStats: ICharacterStats,
	): Promise<Result<InventoryState, CraftingFailure>> {
		const itemsResult =
			await this.repository.findCraftedItemsByCharacterId(characterId);
		if (!itemsResult.success) {
			return fail(itemsResult.error);
		}

		const items = itemsResult.data;
		let equippedWeight = 0;

		for (const item of items) {
			if (item.isEquipped === 1) {
				const equipmentInfo = OFFICIAL_EQUIPMENT.find(
					(eq) => eq.id === item.equipmentId,
				);
				// Cada item equipado soma seu slotCost (peso)
				const weight = equipmentInfo ? equipmentInfo.slotCost : 1;
				equippedWeight += weight;
			}
		}

		// Envelopa o personagem no decorador de Sobrecarga
		const decoratedStats = new EncumberedStatusDecorator(
			baseStats,
			equippedWeight,
		);

		return ok({
			equippedWeight,
			decoratedStats,
			items,
		});
	}
}
