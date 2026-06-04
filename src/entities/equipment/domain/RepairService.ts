import type { ICharacterStats } from "$lib/entities/character/domain/StatusEffectDecorator";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { ResolutionService } from "$lib/shared/resolution";
import type { CharacterCraftedItemRecord } from "../model/craftingSchema";
import type { CraftingFailure } from "../model/craftingTypes";
import { OFFICIAL_EQUIPMENT } from "../model/equipmentCatalog";
import type { CraftingRepository } from "./CraftingRepository";

export class RepairService {
	public constructor(
		private readonly repository: CraftingRepository,
		private readonly resolutionService: ResolutionService,
	) {}

	/**
	 * Calcula o custo de reparo em moedas de cobre:
	 * - 50% do valor base se for mágico (runas ativas) ou isMagical estiver setado
	 * - 30% do valor base se estiver quebrado (broken ou durabilityCurrent === 0)
	 * - 10% do valor base se estiver danificado (damaged)
	 * - 0 de outra forma (mint / integro)
	 */
	public calculateRepairCost(
		item: CharacterCraftedItemRecord,
		isMagical = false,
	): number {
		const baseEquipment = OFFICIAL_EQUIPMENT.find(
			(eq) => eq.id === item.equipmentId,
		);
		const basePrice = baseEquipment ? baseEquipment.priceCopper : 1000; // default para segurança

		if (isMagical || item.isRunic === 1) {
			return Math.floor(basePrice * 0.5);
		}

		if (item.durability === "broken" || item.durabilityCurrent === 0) {
			return Math.floor(basePrice * 0.3);
		}

		if (item.durability === "damaged") {
			return Math.floor(basePrice * 0.1);
		}

		return 0;
	}

	/**
	 * Realiza o teste de reparo do item.
	 * Fórmula: Mental + Interação + Nível contra o difficultyClass do item.
	 * Se não tiver kit de reparo, aplica penalidade de -4 no teste.
	 * Sucesso/Crítico: restaura durabilidade ao máximo e marca estado como "mint". Deduz moedas de cobre.
	 * Falha Crítica (1 natural) em item mágico/rúnico: remove as runas (zera isRunic).
	 */
	public async performRepair(params: {
		character: ICharacterStats;
		item: CharacterCraftedItemRecord;
		hasRepairKit: boolean;
		difficultyClass: number;
		isMagical?: boolean;
		availableGoldCopper: number;
	}): Promise<
		Result<
			{
				item: CharacterCraftedItemRecord;
				goldSpent: number;
				success: boolean;
				diceRollTotal?: number;
			},
			CraftingFailure
		>
	> {
		const isMagical = params.isMagical ?? false;
		const cost = this.calculateRepairCost(params.item, isMagical);

		if (params.availableGoldCopper < cost) {
			return fail({
				code: "INSUFFICIENT_GOLD",
				message: `Cobre insuficiente para reparo. Necessário: ${cost}, Disponível: ${params.availableGoldCopper}.`,
			});
		}

		const resolutionInput = {
			reason: `Reparo de ${params.item.label}`,
			level: params.character.level,
			axisValue: params.character.mental,
			applicationValue: params.character.interaction,
			itemBonus: params.hasRepairKit ? 0 : -4,
			dc: params.difficultyClass,
		};

		const rollResult =
			this.resolutionService.resolveGlobalTest(resolutionInput);
		if (!rollResult.success) {
			return fail({
				code: "RESOLUTION_FAILED",
				message: `Falha ao rolar teste de reparo: ${rollResult.error.message}`,
			});
		}

		const roll = rollResult.data;
		let updatedItem = { ...params.item };
		let goldSpent = 0;
		let success = false;

		if (roll.degree === "success" || roll.degree === "criticalSuccess") {
			success = true;
			goldSpent = cost;
			updatedItem.durabilityCurrent = params.item.durabilityMax;
			updatedItem.durability = "mint";

			const saveResult = await this.repository.updateCraftedItem(updatedItem);
			if (!saveResult.success) {
				return fail(saveResult.error);
			}
			updatedItem = saveResult.data;
		} else {
			// Falha
			if (roll.isNaturalFailure && (isMagical || params.item.isRunic === 1)) {
				updatedItem.isRunic = 0;
				const saveResult = await this.repository.updateCraftedItem(updatedItem);
				if (!saveResult.success) {
					return fail(saveResult.error);
				}
				updatedItem = saveResult.data;
			}
		}

		return ok({
			item: updatedItem,
			goldSpent,
			success,
			diceRollTotal: roll.total,
		});
	}
}
