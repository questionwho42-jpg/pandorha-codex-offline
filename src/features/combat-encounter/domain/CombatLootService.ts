import type { CharacterRepository } from "$lib/entities/character/domain/CharacterRepository";
import type { CraftingRepository } from "$lib/entities/equipment/domain/CraftingRepository";
import { OFFICIAL_EQUIPMENT } from "$lib/entities/equipment/model/equipmentCatalog";
import type { DiceService } from "$lib/shared/dice";
import { ok, type Result } from "$lib/shared/lib/result";
import type { Monster } from "../model/monsterCatalog";
import type { TacticalAiActor } from "./TacticalAiService";

export interface CombatLootFailure {
	readonly code: string;
	readonly message: string;
}

export class CombatLootService {
	public constructor(
		private readonly characterRepository: CharacterRepository,
		private readonly craftingRepository: CraftingRepository,
		private readonly diceService: DiceService,
	) {}

	public async distributeRewards(params: {
		readonly party: readonly TacticalAiActor[];
		readonly monsters: readonly Monster[];
		readonly batedorId: string;
	}): Promise<
		Result<
			{
				readonly updatedParty: TacticalAiActor[];
				readonly lootsConcedidos: {
					readonly characterId: string;
					readonly label: string;
					readonly equipmentId: string;
				}[];
				readonly xpConcedido: number;
				readonly logs: string[];
			},
			CombatLootFailure
		>
	> {
		const updatedParty = params.party.map((char) => ({ ...char }));
		const logs: string[] = [];
		const lootsConcedidos: {
			characterId: string;
			label: string;
			equipmentId: string;
		}[] = [];

		// 1. Somar XP total concedida pelos monstros derrotados
		const totalXp = params.monsters.reduce(
			(sum, monster) => sum + monster.xpValue,
			0,
		);
		if (totalXp <= 0) {
			return ok({
				updatedParty,
				lootsConcedidos,
				xpConcedido: 0,
				logs: ["Nenhuma recompensa de XP ou Loot foi gerada neste combate."],
			});
		}

		logs.push(
			`🎉 Vitória! Total de XP acumulada dos monstros derrotados: ${totalXp}.`,
		);

		// 2. Distribuir XP e atualizar HP dos Andarilhos vivos no banco SQLite
		for (const char of updatedParty) {
			if (char.currentHp <= 0 || char.isDying) {
				logs.push(
					`💀 Andarilho ${char.name} está caído/morto e não pôde receber XP.`,
				);
				continue;
			}

			// Busca o personagem original
			const findRes = await this.characterRepository.findById(char.id);
			if (findRes.success) {
				const original = findRes.data;
				const updatedXp = original.experiencePoints + totalXp;

				// Salva o novo XP do Andarilho
				const saveRes = await this.characterRepository.save({
					...original,
					experiencePoints: updatedXp,
				});

				if (saveRes.success) {
					logs.push(
						`✨ ${char.name} recebeu ${totalXp} XP. (XP total: ${updatedXp}). HP final: ${char.currentHp}/${char.maxHp}.`,
					);
				} else {
					logs.push(
						`⚠️ Não foi possível salvar progresso de XP para ${char.name}: ${saveRes.error.message}`,
					);
				}
			} else {
				logs.push(
					`⚠️ Não foi possível localizar o registro de ${char.name} no banco de dados.`,
				);
			}
		}

		// 3. Simulação de Loot físico baseado no batedor do Hexcrawl
		const batedor = updatedParty.find((c) => c.id === params.batedorId);
		if (batedor && batedor.currentHp > 0 && !batedor.isDying) {
			// Rola chance de obter item de loot
			const lootRollRes = this.diceService.rollDie({
				sides: 100,
				reason: "Chance de obter espólios físicos de combate",
			});

			if (lootRollRes.success) {
				const chanceRoll = lootRollRes.data.naturalRoll;
				// Chance de loot padrão: 50%
				if (chanceRoll <= 50) {
					// Sorteia um item do catálogo oficial
					const itemRoll = this.diceService.rollDie({
						sides: OFFICIAL_EQUIPMENT.length,
						reason: "Sorteio de tipo de item de loot",
					});

					if (itemRoll.success) {
						const selectedEq =
							OFFICIAL_EQUIPMENT[itemRoll.data.naturalRoll - 1];
						if (selectedEq) {
							const nextId = `loot-${selectedEq.id}-${Date.now().toString(36)}`;

							// Cria registro de item artesanal para o batedor
							const newItem = {
								id: nextId,
								characterId: batedor.id,
								equipmentId: selectedEq.id,
								label: `Espólio: ${selectedEq.label}`,
								isSharp: 0,
								isReinforced: 0,
								isRunic: 0,
								isEquipped: 0,
								durabilityCurrent: selectedEq.durabilityCurrent,
								durabilityMax: selectedEq.durabilityMax,
								durability: "mint" as const,
								createdAt: new Date().toISOString(),
							};

							const saveItemRes =
								await this.craftingRepository.saveCraftedItem(newItem);
							if (saveItemRes.success) {
								lootsConcedidos.push({
									characterId: batedor.id,
									label: newItem.label,
									equipmentId: selectedEq.id,
								});
								logs.push(
									`🎒 Loot Encontrado! ${batedor.name} resgatou [${selectedEq.label}] dos espólios de guerra. O item foi adicionado desequipado ao inventário.`,
								);
							}
						}
					}
				}
			}
		}

		return ok({
			updatedParty,
			lootsConcedidos,
			xpConcedido: totalXp,
			logs,
		});
	}
}
