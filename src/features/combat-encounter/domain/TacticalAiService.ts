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
	position?: { x: number; y: number };
	debuffs?: string[];
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
		const updatedParty = params.party.map((char) => ({
			...char,
			debuffs: [...(char.debuffs || [])],
		}));
		const updatedMonsters = params.monsters.map((monster) => ({
			...monster,
			debuffs: [...(monster.debuffs || [])],
			spellsCount: monster.spellsCount || 0,
		}));
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

			if (!monster.role) {
				// Comportamento Legacy/Default: focar o Andarilho vivo com menor HP atual
				let target = aliveTargets[0] as TacticalAiActor;
				for (const candidate of aliveTargets) {
					if (candidate.currentHp < target.currentHp) {
						target = candidate;
					}
				}

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
			} else {
				// Comportamento Utility AI (Fase 58)
				interface MonsterAction {
					readonly type: "physical_attack" | "movement" | "debuff" | "cast";
					readonly target: TacticalAiActor;
					readonly score: number;
				}

				const actions: MonsterAction[] = [];

				for (const T of aliveTargets) {
					const distance = this.calculateDistance(monster, T);
					let physicalScore = 0;
					let movementScore = 0;
					let debuffScore = 0;
					let castScore = 0;

					switch (monster.role) {
						case "brute": {
							const hpRatio = T.currentHp / T.maxHp;
							const acRatio = T.armorClass / 25;
							physicalScore =
								distance <= 1
									? 50 + (1 / (1 + distance)) * 30 + hpRatio * 10 + acRatio * 10
									: 0;
							movementScore =
								distance <= 1 ? 10 : 40 + (distance / (1 + distance)) * 20;
							debuffScore = 15;
							castScore = monster.spellsCount > 0 ? 25 : -100;
							break;
						}
						case "sniper": {
							const hpRatio = T.currentHp / T.maxHp;
							const acRatio = T.armorClass / 25;
							physicalScore =
								40 +
								(distance / (1 + distance)) * 20 +
								(1 - hpRatio) * 20 +
								(1 - acRatio) * 20;
							movementScore = distance < 2 ? 75 : 20;
							debuffScore = 10;
							castScore =
								monster.spellsCount > 0
									? 55 + (distance / (1 + distance)) * 15
									: -100;
							break;
						}
						default: {
							const hasDebuff = T.debuffs!.length > 0;
							physicalScore =
								distance <= 1 ? 30 + (1 / (1 + distance)) * 10 : 0;
							movementScore = distance <= 1 ? 10 : 35;
							debuffScore =
								70 + (hasDebuff ? -50 : 25) + (1 - T.resistance / 10) * 10;
							castScore = monster.spellsCount > 0 ? 65 : -100;
							break;
						}
					}

					actions.push({
						type: "physical_attack",
						target: T,
						score: physicalScore,
					});
					actions.push({ type: "movement", target: T, score: movementScore });
					actions.push({ type: "debuff", target: T, score: debuffScore });

					if (monster.spellsCount > 0 && castScore > -100) {
						actions.push({ type: "cast", target: T, score: castScore });
					}
				}

				let maxScore = -Infinity;
				for (const act of actions) {
					if (act.score > maxScore) {
						maxScore = act.score;
					}
				}

				const bestActions = actions.filter(
					(act) => Math.abs(act.score - maxScore) < 0.0001,
				);

				let chosenAction: MonsterAction;
				if (bestActions.length === 1) {
					chosenAction = bestActions[0]!;
				} else {
					bestActions.sort((a, b) => {
						if (a.type !== b.type) {
							return a.type.localeCompare(b.type);
						}
						return a.target.id.localeCompare(b.target.id);
					});

					const rollRes = this.diceService.rollDie({
						sides: bestActions.length,
						reason: `Desempate de acao de IA para ${monster.label}`,
					});
					if (!rollRes.success) {
						return fail({
							code: "DICE_ROLL_ERROR",
							message: rollRes.error.message,
						});
					}
					chosenAction = bestActions[rollRes.data.naturalRoll - 1]!;
				}

				// Executa a ação escolhida
				const target = updatedParty.find(
					(p) => p.id === chosenAction.target.id,
				) as TacticalAiActor;
				switch (chosenAction.type) {
					case "physical_attack": {
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
						break;
					}
					case "movement": {
						const mx = monster.position ? monster.position.x : 0;
						const my = monster.position ? monster.position.y : 0;
						const tx = target.position ? target.position.x : 0;
						const ty = target.position ? target.position.y : 0;
						const dx = mx - tx;
						const dy = my - ty;

						let newX = mx;
						let newY = my;

						const isRetreat =
							monster.role === "sniper" &&
							this.calculateDistance(monster, target) < 2;

						if (isRetreat) {
							if (dx === 0 && dy === 0) {
								newX = mx + 1;
							} else {
								newX = mx + Math.sign(dx);
								newY = my + Math.sign(dy);
							}
							logs.push(
								`🏃 ${monster.label} recuou para longe de ${target.name}. Nova posição: (${newX}, ${newY}).`,
							);
						} else {
							newX = mx - Math.sign(dx);
							newY = my - Math.sign(dy);
							logs.push(
								`🏃 ${monster.label} se aproximou de ${target.name}. Nova posição: (${newX}, ${newY}).`,
							);
						}

						monster.position = { x: newX, y: newY };
						break;
					}
					case "debuff": {
						target.debuffs!.push("enfraquecido");
						logs.push(
							`✨ ${monster.label} aplicou debuff 'enfraquecido' em ${target.name}.`,
						);
						break;
					}
					default: {
						monster.spellsCount = monster.spellsCount - 1;
						const dmgRollRes = this.diceService.rollDie({
							sides: 6,
							reason: `Dano de magia de ${monster.label}`,
						});
						if (!dmgRollRes.success) {
							return fail({
								code: "DICE_ROLL_ERROR",
								message: dmgRollRes.error.message,
							});
						}
						const damage = dmgRollRes.data.naturalRoll + monster.level;
						target.currentHp = Math.max(0, target.currentHp - damage);

						let statusText = "";
						if (target.currentHp === 0) {
							target.isDying = true;
							target.deathSuccesses = 0;
							target.deathFailures = 0;
							statusText = " (CAIU A 0 HP! Entrou em estado Moribundo)";
						}
						logs.push(
							`🔮 ${monster.label} conjurou uma magia em ${target.name} causando ${damage} de dano. HP restante: ${target.currentHp}${statusText}`,
						);
						break;
					}
				}
			}
		}

		return ok({
			updatedParty,
			updatedMonsters,
			logs,
		});
	}

	private calculateDistance(
		m: { readonly position?: { x: number; y: number } },
		t: { readonly position?: { x: number; y: number } },
	): number {
		const mx = m.position ? m.position.x : 0;
		const my = m.position ? m.position.y : 0;
		const tx = t.position ? t.position.x : 0;
		const ty = t.position ? t.position.y : 0;
		return Math.sqrt((mx - tx) ** 2 + (my - ty) ** 2);
	}

	private rollMonsterDamage(
		monster: Monster,
		isCritical: boolean,
	): Result<number, TacticalAiFailure> {
		const match = monster.damageDice.match(/^(\d+)d(\d+)$/);
		if (!match) {
			const fallbackRoll = isCritical ? 12 : 6;
			return ok(fallbackRoll + monster.damageBonus);
		}

		const [, qtyStr, sidesStr] = match as [string, string, string];
		const qty = Number.parseInt(qtyStr, 10);
		const sides = Number.parseInt(sidesStr, 10);

		let sum = 0;
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
