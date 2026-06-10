import { getRandomValues } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it } from "vitest";
import { DamagePipelineService } from "$lib/shared/damage";
import { DiceService } from "$lib/shared/dice";
import { ResolutionService } from "$lib/shared/resolution";
import { CombatEncounterService } from "../domain/CombatEncounterService";
import { CombatTurnService } from "../domain/CombatTurnService";
import type { TacticalAiActor } from "../domain/TacticalAiService";
import type { CombatEncounterInput } from "../model/combatEncounterTypes";
import { instantiateMonsters, type Monster } from "../model/monsterCatalog";

const randomFloat = (): number => {
	const array = new Uint32Array(1);
	getRandomValues(array);
	return (array[0] ?? 0) / 4294967296;
};

// Configuração do RNG nativo para o Vitest
const createDiceService = (): DiceService => {
	return new DiceService(
		{ next: () => randomFloat() },
		{ generate: () => `roll-${randomFloat().toString(36).slice(2)}` },
		{ now: () => new Date().toISOString() },
	);
};

const createCombatService = (
	diceService: DiceService,
): CombatEncounterService => {
	return new CombatEncounterService(
		new ResolutionService(diceService),
		new DamagePipelineService(),
		{ now: () => new Date().toISOString() },
		diceService,
	);
};

describe("Combat Simulation (Monte Carlo & Balancing Audit)", () => {
	// Setup da party de Andarilhos nível 1
	const createParty = (): TacticalAiActor[] => [
		{
			id: "andarilho-vanguarda",
			name: "Valdo (Vanguarda)",
			maxHp: 15,
			currentHp: 15,
			armorClass: 16,
			level: 1,
			physical: 2,
			mental: 1,
			resistance: 2,
			isDying: false,
			deathSuccesses: 0,
			deathFailures: 0,
		},
		{
			id: "andarilho-tecelao",
			name: "Willa (Tecelão)",
			maxHp: 12,
			currentHp: 12,
			armorClass: 12,
			level: 1,
			physical: 0,
			mental: 3,
			resistance: 1,
			isDying: false,
			deathSuccesses: 0,
			deathFailures: 0,
		},
		{
			id: "andarilho-emissario",
			name: "Emmy (Emissário)",
			maxHp: 13,
			currentHp: 13,
			armorClass: 14,
			level: 1,
			physical: 1,
			mental: 2,
			resistance: 1,
			isDying: false,
			deathSuccesses: 0,
			deathFailures: 0,
		},
	];

	const runEncounter = (
		party: TacticalAiActor[],
		monsters: Monster[],
		diceService: DiceService,
		combatService: CombatEncounterService,
		_applyEquipmentWear: boolean,
	): {
		readonly outcome: "victory" | "defeat" | "stalemate";
		readonly turnsElapsed: number;
		readonly deathSavesRolled: number;
		readonly stabilizedCount: number;
		readonly deathCount: number;
	} => {
		const turnService = new CombatTurnService();

		// Rolar Iniciativas
		const actorInitiatives: { id: string; val: number; isMonster: boolean }[] =
			[];
		for (const actor of party) {
			const roll = diceService.rollD20({ reason: "iniciativa" });
			const val = (roll.success ? roll.data.naturalRoll : 10) + actor.physical;
			actorInitiatives.push({ id: actor.id, val, isMonster: false });
		}
		for (const m of monsters) {
			const roll = diceService.rollD20({ reason: "iniciativa" });
			const val =
				(roll.success ? roll.data.naturalRoll : 10) + m.initiativeBase;
			actorInitiatives.push({ id: m.id, val, isMonster: true });
		}

		// Ordenar por iniciativa decrescente
		actorInitiatives.sort((a, b) => b.val - a.val);
		const actorOrder = actorInitiatives.map((a) => a.id);

		const turnRes = turnService.startTurnOrder({ actorOrder });
		if (!turnRes.success) {
			return {
				outcome: "stalemate",
				turnsElapsed: 0,
				deathSavesRolled: 0,
				stabilizedCount: 0,
				deathCount: 0,
			};
		}

		let turnState = turnRes.data;
		let turnsElapsed = 0;
		let deathSavesRolled = 0;
		let stabilizedCount = 0;
		let deathCount = 0;

		const maxRounds = 100; // Circuit Breaker de segurança

		while (turnsElapsed < maxRounds) {
			const activeId = turnState.activeActorId;

			// Verificar se o combate terminou
			const partyAlive = party.filter(
				(p) => p.currentHp > 0 && !p.deathFailures && p.deathFailures < 3,
			);
			const monstersAlive = monsters.filter((m) => m.currentHitPoints > 0);

			if (monstersAlive.length === 0) {
				return {
					outcome: "victory",
					turnsElapsed,
					deathSavesRolled,
					stabilizedCount,
					deathCount,
				};
			}
			if (partyAlive.length === 0) {
				return {
					outcome: "defeat",
					turnsElapsed,
					deathSavesRolled,
					stabilizedCount,
					deathCount,
				};
			}

			const isPartyActive = party.some((p) => p.id === activeId);

			if (isPartyActive) {
				// Turno de um Andarilho
				const actor = party.find((p) => p.id === activeId);

				if (actor) {
					if (actor.currentHp === 0 && actor.isDying) {
						// Andarilho está Moribundo, realiza Teste de Estabilização
						deathSavesRolled++;
						const deathSaveRes = combatService.resolveDeathSaves([actor]);
						if (deathSaveRes.success) {
							const updated = deathSaveRes.data.updatedParty[0];
							if (updated) {
								actor.currentHp = updated.currentHp;
								actor.isDying = updated.isDying;
								actor.deathSuccesses = updated.deathSuccesses;
								actor.deathFailures = updated.deathFailures;

								if (!actor.isDying && actor.currentHp > 0) {
									stabilizedCount++;
								} else if (actor.deathFailures >= 3) {
									deathCount++;
								}
							}
						}
					} else if (actor.currentHp > 0) {
						// Andarilho age normalmente
						while (
							turnState.actionPointsRemaining > 0 &&
							monsters.some((m) => m.currentHitPoints > 0)
						) {
							// Seleciona o monstro vivo com menor HP
							const aliveMonsters = monsters.filter(
								(m) => m.currentHitPoints > 0,
							);
							if (aliveMonsters.length === 0) break;
							aliveMonsters.sort(
								(a, b) => a.currentHitPoints - b.currentHitPoints,
							);
							const targetMonster = aliveMonsters[0];
							if (!targetMonster) break;

							// Executar Ataque do Andarilho
							const attackInput: CombatEncounterInput = {
								command: {
									id: `cmd-${turnsElapsed}-${turnState.actionPointsRemaining}`,
									type: "attack",
									createdAt: new Date().toISOString(),
								},
								attacker: { id: actor.id, label: actor.name },
								target: {
									id: targetMonster.id,
									label: targetMonster.label,
									currentHitPoints: targetMonster.currentHitPoints,
									armorClass: targetMonster.armorClass,
								},
								attack: {
									reason: "Ataque tático",
									level: actor.level,
									axisValue: actor.physical,
									applicationValue: actor.mental,
									itemBonus: 0,
								},
								damage: {
									damageType: "physical",
									baseDiceTotal: 4,
									matrixValue: actor.physical,
									extraModifierTotal: 0,
									damageReduction: 0,
									vulnerabilityBonusDamage: 0,
									affinities: [],
								},
							};

							const attackRes = combatService.resolveAttack(attackInput);
							if (attackRes.success) {
								targetMonster.currentHitPoints =
									attackRes.data.target.currentHitPoints;
							}

							const spentAction = turnService.spendAction({
								state: turnState,
								actorId: actor.id,
								actionCost: 1,
							});
							if (spentAction.success) {
								turnState = spentAction.data;
							} else {
								break;
							}
						}
					}
				}
			} else {
				// Turno de um Monstro
				const monster = monsters.find((m) => m.id === activeId);
				if (monster && monster.currentHitPoints > 0) {
					// O monstro ataca o Andarilho vivo com menor HP
					const aliveTargets = party.filter(
						(p) => p.currentHp > 0 && !p.isDying,
					);
					if (aliveTargets.length > 0) {
						aliveTargets.sort((a, b) => a.currentHp - b.currentHp);
						const targetWanderer = aliveTargets[0];
						if (targetWanderer) {
							// Rolar d20 vs CA do Andarilho
							const roll = diceService.rollD20({
								reason: `Monstro ataca ${targetWanderer.name}`,
							});
							if (roll.success) {
								const natural = roll.data.naturalRoll;
								const isCrit = natural === 20;
								const total = natural + monster.attackBonus;

								if (
									natural > 1 &&
									(isCrit || total >= targetWanderer.armorClass)
								) {
									// Rolagem de dano do monstro
									const damageParts = monster.damageDice.split("d");
									const qty = Number(damageParts[0] || 1);
									const sides = Number(damageParts[1] || 6);
									let damageTotal = 0;
									const rollQty = isCrit ? qty * 2 : qty;

									for (let i = 0; i < rollQty; i++) {
										const dmgRoll = diceService.rollDie({
											sides,
											reason: "Dano monstro",
										});
										if (dmgRoll.success) {
											damageTotal += dmgRoll.data.naturalRoll;
										}
									}
									damageTotal += monster.damageBonus;

									// Aplicar dano no Andarilho
									targetWanderer.currentHp = Math.max(
										0,
										targetWanderer.currentHp - damageTotal,
									);

									if (targetWanderer.currentHp === 0) {
										targetWanderer.isDying = true;
										targetWanderer.deathSuccesses = 0;
										targetWanderer.deathFailures = 0;
									}
								}
							}
						}
					}
				}
			}

			// Fim do Turno do ator atual -> Passa a vez
			const endRes = turnService.endTurn({
				state: turnState,
				actorId: activeId,
			});
			if (endRes.success) {
				turnState = endRes.data;
			} else {
				break;
			}
			turnsElapsed++;
		}

		return {
			outcome: "stalemate",
			turnsElapsed,
			deathSavesRolled,
			stabilizedCount,
			deathCount,
		};
	};

	it("deve rodar 1.000 iterações de simulação de combate (Modo Arena)", () => {
		const diceService = createDiceService();
		const combatService = createCombatService(diceService);

		let wins = 0;
		let defeats = 0;
		let stalemates = 0;
		let totalTurns = 0;
		let totalDeathSaves = 0;
		let totalStabilized = 0;
		let totalDeaths = 0;

		const iterations = 1000;

		for (let i = 0; i < iterations; i++) {
			const party = createParty();
			const monsters = instantiateMonsters("Bando de Goblins Saqueadores");

			const result = runEncounter(
				party,
				monsters,
				diceService,
				combatService,
				false,
			);

			if (result.outcome === "victory") wins++;
			else if (result.outcome === "defeat") defeats++;
			else stalemates++;

			totalTurns += result.turnsElapsed;
			totalDeathSaves += result.deathSavesRolled;
			totalStabilized += result.stabilizedCount;
			totalDeaths += result.deathCount;
		}

		const winRate = (wins / iterations) * 100;
		const avgTurns = totalTurns / iterations;

		const reportData = {
			mode: "arena",
			iterations,
			wins,
			defeats,
			stalemates,
			win_rate: winRate,
			avg_turns_per_combat: avgTurns,
			total_death_saves_rolled: totalDeathSaves,
			total_stabilized_wanderers: totalStabilized,
			total_dead_wanderers: totalDeaths,
			timestamp: new Date().toISOString(),
		};

		// Certificar que a pasta artifacts existe
		const artifactsPath = resolve(process.cwd(), "artifacts");
		if (!existsSync(artifactsPath)) {
			mkdirSync(artifactsPath, { recursive: true });
		}

		writeFileSync(
			resolve(artifactsPath, "combat_simulation_report.json"),
			`${JSON.stringify(reportData, null, 2)}\n`,
			"utf8",
		);

		const mdReport = `${[
			"# Relatório de Simulação Monte Carlo - Modo Arena",
			"",
			`Gerado em: ${reportData.timestamp}`,
			"",
			"### Estatísticas de Combate",
			"",
			"| Métrica | Valor Obtido |",
			"| --- | --- |",
			`| **Total de Combates Simulados** | ${reportData.iterations} |`,
			`| **Vitórias dos Andarilhos** | ${reportData.wins} (${winRate.toFixed(2)}%) |`,
			`| **Derrotas dos Andarilhos** | ${reportData.defeats} |`,
			`| **Empates/Limite de Rodadas** | ${reportData.stalemates} |`,
			`| **Duração Média do Combate** | ${avgTurns.toFixed(2)} turnos |`,
			`| **Testes de Estabilização Realizados** | ${reportData.total_death_saves_rolled} |`,
			`| **Andarilhos Estabilizados** | ${reportData.total_stabilized_wanderers} |`,
			`| **Andarilhos Mortos Definitivamente** | ${reportData.total_dead_wanderers} |`,
			"",
			"### Guardrails de Balanço",
			`- **Taxa de Vitória Esperada:** Idealmente entre 75% e 95% para encontros equilibrados de nível 1.`,
			`- **Duração Média de Combate:** Idealmente entre 4 e 12 turnos para evitar batalhas arrastadas.`,
		].join("\n")}\n`;

		writeFileSync(
			resolve(artifactsPath, "combat_simulation_report.md"),
			mdReport,
			"utf8",
		);
	});

	it("deve rodar 200 iterações de simulação consecutiva de campanha (Modo Masmorra)", () => {
		const diceService = createDiceService();
		const combatService = createCombatService(diceService);

		let successfulDungeons = 0;
		let failedDungeons = 0;
		let totalCombatesConcluidos = 0;

		const dungeonSimulations = 200; // Menos iterações pois cada masmorra são 5 combates seguidos
		const stagesPerDungeon = 5;

		for (let d = 0; d < dungeonSimulations; d++) {
			const party = createParty();
			let stage = 0;
			let partySurvived = true;

			while (stage < stagesPerDungeon && partySurvived) {
				const monsters = instantiateMonsters("Alcateia de Lobos Famintos");
				const result = runEncounter(
					party,
					monsters,
					diceService,
					combatService,
					true,
				);

				if (result.outcome === "victory") {
					totalCombatesConcluidos++;
					// Sobreviventes se regeneram muito pouco entre combates (Simulando descanso de acampamento curto sem restauração completa)
					for (const member of party) {
						if (member.currentHp > 0 && !member.isDying) {
							member.currentHp = Math.min(member.maxHp, member.currentHp + 2);
						}
					}
					stage++;
				} else {
					partySurvived = false;
				}
			}

			if (partySurvived && stage === stagesPerDungeon) {
				successfulDungeons++;
			} else {
				failedDungeons++;
			}
		}

		const survivalRate = (successfulDungeons / dungeonSimulations) * 100;
		const artifactsPath = resolve(process.cwd(), "artifacts");

		const reportData = {
			mode: "dungeon",
			simulations: dungeonSimulations,
			successful_dungeons: successfulDungeons,
			failed_dungeons: failedDungeons,
			survival_rate: survivalRate,
			total_stages_completed: totalCombatesConcluidos,
			timestamp: new Date().toISOString(),
		};

		writeFileSync(
			resolve(artifactsPath, "combat_dungeon_simulation_report.json"),
			`${JSON.stringify(reportData, null, 2)}\n`,
			"utf8",
		);
	});
});
