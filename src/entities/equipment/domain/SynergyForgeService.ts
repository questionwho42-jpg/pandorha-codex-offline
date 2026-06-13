import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CharacterCraftedItemRecord } from "../model/craftingSchema";
import type { CraftingFailure } from "../model/craftingTypes";
import { OFFICIAL_EQUIPMENT } from "../model/equipmentCatalog";
import {
	BaseCraftedEquipment,
	type ICraftedEquipment,
	ReinforcedEquipmentDecorator,
	RunicEquipmentDecorator,
	SharpEquipmentDecorator,
} from "./CraftingQualityDecorators";
import type { CraftingRepository } from "./CraftingRepository";

export class SynergyForgeService {
	public constructor(private readonly repository: CraftingRepository) {}

	/**
	 * Infunde uma runa em um espaço rúnico vago do item.
	 */
	public async infuseRune(params: {
		readonly characterId: string;
		readonly itemId: string;
		readonly runeType: "rune_stone" | "ancient_relic" | "insight_scroll";
		readonly characterMaterials: Readonly<Record<string, number>>;
	}): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		// 1. Verificar se o personagem possui a runa
		const owned = params.characterMaterials[params.runeType] ?? 0;
		if (owned < 1) {
			return fail({
				code: "INSUFFICIENT_MATERIALS",
				message: `Runa/material ${params.runeType} insuficiente no inventário.`,
			});
		}

		// 2. Buscar o item forjado
		const itemsRes = await this.repository.findCraftedItemsByCharacterId(
			params.characterId,
		);
		if (!itemsRes.success) {
			return fail(itemsRes.error);
		}
		const item = itemsRes.data.find((it) => it.id === params.itemId);
		if (!item) {
			return fail({
				code: "ITEM_NOT_FOUND",
				message: `Item artesanal com ID ${params.itemId} não foi localizado.`,
			});
		}

		// 3. Obter o equipamento base do catálogo
		const baseEquipment = OFFICIAL_EQUIPMENT.find(
			(eq) => eq.id === item.equipmentId,
		);
		if (!baseEquipment) {
			return fail({
				code: "RECIPE_NOT_FOUND",
				message: `O item base com ID ${item.equipmentId} não existe no catálogo de equipamentos oficiais.`,
			});
		}

		// 4. Instanciar a cebola (decorators) para calcular slots máximos
		const baseItem = new BaseCraftedEquipment({
			id: item.id,
			label: baseEquipment.label,
			kind: baseEquipment.kind as "weapon" | "armor" | "shield",
			slotCost: baseEquipment.slotCost,
			priceCopper: baseEquipment.priceCopper,
			durabilityCurrent: item.durabilityCurrent,
			durabilityMax: item.durabilityMax,
			mechanicalSummary: baseEquipment.mechanicalSummary,
			runeSlots: baseEquipment.runeSlots,
		});

		let decorated: ICraftedEquipment = baseItem;
		if (item.isSharp) decorated = new SharpEquipmentDecorator(decorated);
		if (item.isReinforced)
			decorated = new ReinforcedEquipmentDecorator(decorated);
		if (item.isRunic) decorated = new RunicEquipmentDecorator(decorated);

		const maxSlots = decorated.getRuneSlotsCount();

		// 5. Analisar runas já infundidas
		const currentRunes: string[] = item.infusedRunesJson
			? JSON.parse(item.infusedRunesJson)
			: [];
		if (currentRunes.length >= maxSlots) {
			return fail({
				code: "INSUFFICIENT_RUNE_SLOTS",
				message: `Espaços de runa esgotados para este item. Máximo: ${maxSlots}, Atual: ${currentRunes.length}.`,
			});
		}

		// 6. Infundir a nova runa
		const nextRunes = [...currentRunes, params.runeType];
		const runeName =
			params.runeType === "rune_stone"
				? "Eleriana"
				: params.runeType === "ancient_relic"
					? "Ancestral"
					: "Insight";

		// Atualiza o label do item com o sufixo de runa
		const updatedLabel = `${item.label} [Runa: ${runeName}]`;

		const updatedItem: CharacterCraftedItemRecord = {
			...item,
			label: updatedLabel,
			infusedRunesJson: JSON.stringify(nextRunes),
		};

		const saveRes = await this.repository.updateCraftedItem(updatedItem);
		if (!saveRes.success) {
			return fail(saveRes.error);
		}

		return ok(saveRes.data);
	}

	/**
	 * Infunde uma afinidade elemental em uma arma.
	 */
	public async infuseElementalAffinity(params: {
		readonly characterId: string;
		readonly itemId: string;
		readonly affinity: "fire" | "frost" | "lightning" | "void";
		readonly characterMaterials: Readonly<Record<string, number>>;
	}): Promise<Result<CharacterCraftedItemRecord, CraftingFailure>> {
		// Requer 1 mystic-essence para infundir elemento
		const ownedEssence = params.characterMaterials["mystic-essence"] ?? 0;
		if (ownedEssence < 1) {
			return fail({
				code: "INSUFFICIENT_MATERIALS",
				message:
					"Necessário 1 Essência Mística (mystic-essence) para infundir afinidade elemental.",
			});
		}

		// Buscar item
		const itemsRes = await this.repository.findCraftedItemsByCharacterId(
			params.characterId,
		);
		if (!itemsRes.success) {
			return fail(itemsRes.error);
		}
		const item = itemsRes.data.find((it) => it.id === params.itemId);
		if (!item) {
			return fail({
				code: "ITEM_NOT_FOUND",
				message: `Item artesanal com ID ${params.itemId} não foi localizado.`,
			});
		}

		// Obter equipamento base do catálogo para checar se é arma
		const baseEquipment = OFFICIAL_EQUIPMENT.find(
			(eq) => eq.id === item.equipmentId,
		);
		if (!baseEquipment) {
			return fail({
				code: "RECIPE_NOT_FOUND",
				message: `O item base com ID ${item.equipmentId} não existe no catálogo oficial.`,
			});
		}

		if (baseEquipment.kind !== "weapon") {
			return fail({
				code: "INVALID_ITEM_KIND",
				message: "Apenas armas podem receber afinidade elemental.",
			});
		}

		// Atualizar o label removendo afinidade anterior e colocando a nova
		const cleanedLabel = item.label
			.replace(" de Fogo", "")
			.replace(" de Gelo", "")
			.replace(" de Raio", "")
			.replace(" do Vazio", "");

		const suffix =
			params.affinity === "fire"
				? " de Fogo"
				: params.affinity === "frost"
					? " de Gelo"
					: params.affinity === "lightning"
						? " de Raio"
						: " do Vazio";
		const updatedLabel = cleanedLabel + suffix;

		const updatedItem: CharacterCraftedItemRecord = {
			...item,
			label: updatedLabel,
			elementalAffinity: params.affinity,
		};

		const saveRes = await this.repository.updateCraftedItem(updatedItem);
		if (!saveRes.success) {
			return fail(saveRes.error);
		}

		return ok(saveRes.data);
	}
}
