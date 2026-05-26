import type { DiceService } from "$lib/shared/dice";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { Monster } from "../model/monsterCatalog";

export interface TacticalAiActor {
	readonly id: string;
	readonly name: string;
	readonly maxHp: number;
	currentHp: number;
	readonly armorClass: number;
	readonly level: number;
	readonly physical: number;
	readonly mental: number;
	readonly resistance: number;
	isDying: boolean;
	deathSuccesses: number;
	deathFailures: number;
}

export interface TacticalAiFailure {
	readonly code: string;
	readonly message: string;
}

export class TacticalAiService {
	public constructor(private readonly diceService: DiceService) {}

	public runMonsterTurns(params: {
		readonly monsters: readonly Monster[];
		readonly party: readonly TacticalAiActor[];
	}): Result<
		{
			readonly updatedParty: TacticalAiActor[];
			readonly updatedMonsters: Monster[];
			readonly logs: string[];
		},
		TacticalAiFailure
	> {
		const updatedParty = params.party.map((char) => ({ ...char }));
		const updatedMonsters = params.monsters.map((monster) => ({ ...monster }));
		const logs: string[] = [];

		for (const monster of updatedMonsters) {
			// Apenas monstros vivos agem
			if (monster.currentHitPoints <= 0) {
				continue;
			}

			// Seleciona alvos vivos (não moribundos)
			const aliveTargets = updatedParty.filter(
				(c) => c.currentHp > 0 && !c.isDying,
			);
			if (aliveTargets.length === 0) {
				// Se todos estão caídos, o monstro não ataca mais
				continue;
			}

			// Tática: focar o Andarilho vivo com menor HP atual
			let target = aliveTargets[0] as TacticalAiActor;
			for (const candidate of aliveTargets) {
				if (candidate.currentHp < target.currentHp) {
					target = candidate;
				}
			}

			// Rola ataque d20
			const attackRollRes = this.diceService.rollD20({
				reason: `Ataque de ${monster.label} contra ${target.name}`,
			});
			if (!attackRollRes.success) {
				return fail({
					code: "DICE_ROLL_ERROR",
					message: attackRollRes.error.message,
				});
			}

			const naturalRoll = attackRollRes.data.naturalRoll;
			const totalAttack = naturalRoll + monster.attackBonus;
			const isCritical = naturalRoll === 20;
			const isFumble = naturalRoll === 1;

			let hit = false;
			if (isCritical) {
				hit = true;
			} else if (isFumble) {
				hit = false;
			} else {
				hit = totalAttack >= target.armorClass;
			}

			if (hit) {
				// Rola dano
				const rollDamageRes = this.rollMonsterDamage(monster, isCritical);
				if (!rollDamageRes.success) {
					return fail(rollDamageRes.error);
				}

				const damage = rollDamageRes.data;
				target.currentHp = Math.max(0, target.currentHp - damage);

				let statusText = "";
				if (target.currentHp === 0) {
					target.isDying = true;
					target.deathSuccesses = 0;
					target.deathFailures = 0;
					statusText = " (CAIU A 0 HP! Entrou em estado Moribundo)";
				}

				const hitType = isCritical ? "ACERTO CRÍTICO" : "ACERTO";
				logs.push(
					`⚔️ ${monster.label} atacou ${target.name}: rolou d20=${naturalRoll} + mod=${monster.attackBonus} | Total ${totalAttack} vs CA ${target.armorClass} (${hitType}). ${target.name} sofreu ${damage} de dano. HP restante: ${target.currentHp}${statusText}`,
				);
			} else {
				const fumbleText = isFumble ? " (FALHA CRÍTICA)" : "";
				logs.push(
					`💨 ${monster.label} atacou ${target.name}: rolou d20=${naturalRoll} + mod=${monster.attackBonus} | Total ${totalAttack} vs CA ${target.armorClass} (ERRO)${fumbleText}.`,
				);
			}
		}

		return ok({
			updatedParty,
			updatedMonsters,
			logs,
		});
	}

	private rollMonsterDamage(
		monster: Monster,
		isCritical: boolean,
	): Result<number, TacticalAiFailure> {
		// Analisa a string do dado de dano (ex: "1d6" ou "2d4")
		const match = monster.damageDice.match(/^(\d+)d(\d+)$/);
		if (!match) {
			const fallbackRoll = isCritical ? 12 : 6;
			return ok(fallbackRoll + monster.damageBonus);
		}

		const [, qtyStr, sidesStr] = match as [string, string, string];
		const qty = Number.parseInt(qtyStr, 10);
		const sides = Number.parseInt(sidesStr, 10);

		let sum = 0;
		// Crítico dobra a quantidade de dados jogados
		const rollQty = isCritical ? qty * 2 : qty;

		for (let i = 0; i < rollQty; i++) {
			const res = this.diceService.rollDie({
				sides,
				reason: `Rolar dano de ${monster.label}`,
			});
			if (!res.success) {
				return fail({
					code: "DICE_ROLL_ERROR",
					message: res.error.message,
				});
			}
			sum += res.data.naturalRoll;
		}

		return ok(sum + monster.damageBonus);
	}
}
