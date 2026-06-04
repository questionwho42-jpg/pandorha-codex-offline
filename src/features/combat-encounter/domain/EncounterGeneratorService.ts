import { fail, ok, type Result } from "$lib/shared/lib/result";
import { instantiateMonsters, type Monster } from "../model/monsterCatalog";

export interface EncounterGeneratorFailure {
	readonly code: string;
	readonly message: string;
}

const TIER_TEMPLATES: Record<number, string[]> = {
	1: ["Bando de Goblins Saqueadores", "Alcateia de Lobos Famintos"],
	2: ["Fortaleza de Lich Adormecido", "Basilisco das Ruínas"],
	3: ["Ninho de Wyverns", "Monolito da Loucura Absoluta"],
	4: ["Covil de Dragão Jovem"],
	5: ["Avatares de Deuses Mortos", "Devorador de Mundos Menor"],
};

export class EncounterGeneratorService {
	public generateEncounter(params: {
		readonly q: number;
		readonly r: number;
		readonly regionTier: number;
		readonly averagePartyLevel: number;
	}): Result<
		{
			readonly encounterName: string;
			readonly monsters: Monster[];
		},
		EncounterGeneratorFailure
	> {
		if (params.regionTier <= 0) {
			return fail({
				code: "INVALID_REGION_TIER",
				message: "Region tier must be greater than 0.",
			});
		}

		if (params.averagePartyLevel <= 0) {
			return fail({
				code: "INVALID_PARTY_LEVEL",
				message: "Average party level must be greater than 0.",
			});
		}

		const clampedTier = Math.max(1, Math.min(5, params.regionTier));
		const templates = TIER_TEMPLATES[clampedTier]!;

		const seed = Math.abs(
			params.q * 1000 +
				params.r * 100 +
				params.regionTier * 10 +
				params.averagePartyLevel,
		);
		const index = seed % templates.length;
		const encounterName = templates[index] ?? "Combate Desconhecido";

		const baseMonsters = instantiateMonsters(encounterName);

		const scaledMonsters = baseMonsters.map((monster) => {
			const diff = params.averagePartyLevel - monster.level;
			const hpMultiplier = 1 + diff * 0.15;
			const scaledMaxHp = Math.max(
				1,
				Math.round(monster.maxHitPoints * hpMultiplier),
			);
			const scaledAttackBonus = Math.max(
				0,
				monster.attackBonus + Math.round(diff * 0.5),
			);
			const scaledDamageBonus = Math.max(
				0,
				monster.damageBonus + Math.round(diff * 0.5),
			);
			const scaledXpValue = Math.max(
				10,
				Math.round(monster.xpValue * (1 + diff * 0.1)),
			);

			return {
				...monster,
				maxHitPoints: scaledMaxHp,
				currentHitPoints: scaledMaxHp,
				attackBonus: scaledAttackBonus,
				damageBonus: scaledDamageBonus,
				xpValue: scaledXpValue,
			};
		});

		return ok({
			encounterName,
			monsters: scaledMonsters,
		});
	}
}
