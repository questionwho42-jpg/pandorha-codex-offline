import {
	type ActionCommand,
	type ActionCommandProcessor,
	type ActionQueueFailure,
	type ActionQueueProcessedCommand,
	type ActionQueueProcessorFailure,
	ActionQueueService,
} from "$lib/shared/action-queue";
import type { DiceService } from "$lib/shared/dice";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { ResolutionDegree } from "$lib/shared/resolution";
import {
	combatEncounterInputSchema,
	formatCombatEncounterIssues,
} from "../model/combatEncounterSchemas";
import type {
	CombatDamagePort,
	CombatEncounterClock,
	CombatEncounterEvent,
	CombatEncounterFailure,
	CombatEncounterInput,
	CombatEncounterState,
	CombatResolutionPort,
} from "../model/combatEncounterTypes";
import type { Monster } from "../model/monsterCatalog";
import type { TacticalAiActor } from "./TacticalAiService";

const RESOLUTION_DEGREE_LABELS: Record<ResolutionDegree, string> = {
	criticalSuccess: "sucesso crítico",
	success: "sucesso",
	successWithCost: "sucesso com custo",
	failure: "falha",
};

/**
 * @rule docs/architecture/feature_state_machines.md - Combat commands must resolve through ActionQueue and HP changes derive from events.
 * @rule docs/system/survival/00-mecanicas-fundamentais.md - Attack resolution targets CA as the global test DC.
 */
export class CombatEncounterService {
	public constructor(
		private readonly resolutionService: CombatResolutionPort,
		private readonly damageService: CombatDamagePort,
		private readonly clock: CombatEncounterClock,
		private readonly diceService?: DiceService,
	) {}

	public resolveAttack(
		input: unknown,
	): Result<CombatEncounterState, CombatEncounterFailure> {
		const parsed = combatEncounterInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail({
				code: "INVALID_COMBAT_ENCOUNTER_INPUT",
				message: "Combat encounter input failed validation.",
				details: {
					issues: formatCombatEncounterIssues(parsed.error.issues),
				},
			});
		}

		const actionQueue = new ActionQueueService();
		const enqueued = actionQueue.enqueue(parsed.data.command);
		if (!enqueued.success) {
			return fail(createActionQueueFailure(enqueued.error));
		}

		let resolvedState: CombatEncounterState | undefined;
		let pendingFailure: CombatEncounterFailure | null = null;
		const processor = this.createAttackProcessor(parsed.data, {
			onSuccess: (state) => {
				resolvedState = state;
			},
			onFailure: (failure) => {
				pendingFailure = failure;
			},
		});

		const processed = actionQueue.processNext(processor);
		if (!processed.success) {
			if (pendingFailure) {
				return fail(pendingFailure);
			}

			return fail(createActionQueueFailure(processed.error));
		}

		return ok({
			...(resolvedState as CombatEncounterState),
			processedCommand: processed.data,
		});
	}

	private createAttackProcessor(
		input: CombatEncounterInput,
		callbacks: {
			readonly onSuccess: (state: CombatEncounterState) => void;
			readonly onFailure: (failure: CombatEncounterFailure) => void;
		},
	): ActionCommandProcessor {
		return {
			process: (
				command: ActionCommand,
			): Result<ActionQueueProcessedCommand, ActionQueueProcessorFailure> => {
				if (command.type !== "attack") {
					return fail({
						code: "PROCESSOR_REJECTED_COMMAND",
						message: "Combat encounter processor only accepts attack commands.",
						details: { commandType: command.type },
					});
				}

				const resolved = this.resolveQueuedAttack(input, command);
				if (!resolved.success) {
					callbacks.onFailure(resolved.error);
					return fail({
						code: "PROCESSOR_REJECTED_COMMAND",
						message: "Combat encounter processor stopped the attack.",
						details: { combatFailureCode: resolved.error.code },
					});
				}

				callbacks.onSuccess(resolved.data);
				return ok({
					commandId: command.id,
					commandType: command.type,
					processedAt: this.clock.now(),
				});
			},
		};
	}

	private resolveQueuedAttack(
		input: CombatEncounterInput,
		command: ActionCommand,
	): Result<CombatEncounterState, CombatEncounterFailure> {
		const events = [
			createAttackQueuedEvent({
				command,
				input,
				createdAt: this.clock.now(),
			}),
		];
		const resolution = this.resolutionService.resolveGlobalTest({
			...input.attack,
			dc: input.target.armorClass,
		});

		if (!resolution.success) {
			return fail({
				code: "RESOLUTION_FAILED",
				message: "Combat encounter failed while resolving the attack.",
				details: { resolutionFailureCode: resolution.error.code },
				cause: resolution.error,
			});
		}

		const wasHit = isHitResolution(resolution.data.degree);
		const attackResolvedEvent = createAttackResolvedEvent({
			command,
			input,
			resolution: resolution.data,
			wasHit,
			createdAt: this.clock.now(),
		});
		const resolvedEvents = [...events, attackResolvedEvent];

		if (!wasHit) {
			return ok(
				createState({
					input,
					resolution: resolution.data,
					events: resolvedEvents,
				}),
			);
		}

		const damage = this.damageService.calculateDamage({
			...input.damage,
			isCriticalHit: resolution.data.degree === "criticalSuccess",
		});

		if (!damage.success) {
			return fail({
				code: "DAMAGE_PIPELINE_FAILED",
				message: "Combat encounter failed while calculating damage.",
				details: { damageFailureCode: damage.error.code },
				cause: damage.error,
			});
		}

		const damageEvent = createDamageAppliedEvent({
			command,
			input,
			damageAmount: damage.data.finalDamage,
			createdAt: this.clock.now(),
		});

		return ok(
			createState({
				input,
				resolution: resolution.data,
				damage: damage.data,
				events: [...resolvedEvents, damageEvent],
			}),
		);
	}

	public resolveDeathSaves(party: readonly TacticalAiActor[]): Result<
		{
			readonly updatedParty: TacticalAiActor[];
			readonly logs: string[];
		},
		{ readonly code: string; readonly message: string }
	> {
		if (!this.diceService) {
			return fail({
				code: "MISSING_DICE_SERVICE",
				message: "Dice service is required for resolving death saves.",
			});
		}

		const updatedParty = party.map((char) => ({ ...char }));
		const logs: string[] = [];

		for (const char of updatedParty) {
			if (char.currentHp === 0 && char.isDying) {
				const rollRes = this.diceService.rollD20({
					reason: `Teste de Estabilizacao de Morte para ${char.name}`,
				});

				if (!rollRes.success) {
					return fail({
						code: "DICE_ROLL_ERROR",
						message: rollRes.error.message,
					});
				}

				const naturalRoll = rollRes.data.naturalRoll;
				const cdTarget = 10 + char.level + char.physical + char.resistance;
				const totalRoll =
					naturalRoll + char.physical + char.resistance + char.level;

				logs.push(
					`🩸 Teste de Morte de ${char.name}: rolou d20=${naturalRoll} + mod=${char.physical + char.resistance + char.level} | Total ${totalRoll} vs CD ${cdTarget}.`,
				);

				if (naturalRoll === 20) {
					char.currentHp = 1;
					char.isDying = false;
					char.deathSuccesses = 0;
					char.deathFailures = 0;
					logs.push(
						`🌟 SUCESSO CRÍTICO! ${char.name} recuperou a consciência com 1 HP!`,
					);
				} else if (naturalRoll === 1) {
					char.deathFailures += 2;
					logs.push(
						`💀 FALHA CRÍTICA! ${char.name} acumulou mais 2 falhas. (${char.deathFailures}/3 falhas).`,
					);
				} else if (totalRoll >= cdTarget) {
					char.deathSuccesses += 1;
					logs.push(
						`👍 Sucesso no teste. (${char.deathSuccesses}/3 sucessos).`,
					);
				} else {
					char.deathFailures += 1;
					logs.push(`👎 Falha no teste. (${char.deathFailures}/3 falhas).`);
				}

				if (char.deathSuccesses >= 3) {
					char.isDying = false;
					char.deathSuccesses = 0;
					char.deathFailures = 0;
					logs.push(
						`🩹 ${char.name} ESTABILIZOU! Ele permanece inconsciente com 0 HP, mas não corre mais risco de morte imediata.`,
					);
				} else if (char.deathFailures >= 3) {
					logs.push(
						`🪦 MORTE DEFINITIVA: ${char.name} sucumbiu aos ferimentos e faleceu.`,
					);
				}
			}
		}

		return ok({
			updatedParty,
			logs,
		});
	}

	public resolveFirstAid(params: {
		readonly helper: TacticalAiActor;
		readonly target: TacticalAiActor;
		readonly hasFirstAidKit: boolean;
	}): Result<
		{
			readonly updatedTarget: TacticalAiActor;
			readonly logs: string[];
		},
		{ readonly code: string; readonly message: string }
	> {
		if (!this.diceService) {
			return fail({
				code: "MISSING_DICE_SERVICE",
				message: "Dice service is required for resolving first aid.",
			});
		}

		if (!params.target.isDying || params.target.currentHp > 0) {
			return fail({
				code: "INVALID_TARGET_FOR_FIRST_AID",
				message: "Target is not in a dying state.",
			});
		}

		const updatedTarget = { ...params.target };
		const logs: string[] = [];

		const cdTarget = params.hasFirstAidKit
			? 15
			: 10 +
				params.target.level +
				params.target.physical +
				params.target.resistance;

		const rollRes = this.diceService.rollD20({
			reason: `Primeiros Socorros de ${params.helper.name} em ${params.target.name}`,
		});

		if (!rollRes.success) {
			return fail({
				code: "DICE_ROLL_ERROR",
				message: rollRes.error.message,
			});
		}

		const naturalRoll = rollRes.data.naturalRoll;
		const totalRoll = naturalRoll + params.helper.level + params.helper.mental;

		logs.push(
			`🩹 Primeiros Socorros: ${params.helper.name} tentou salvar ${params.target.name}. Rolou d20=${naturalRoll} + mod=${params.helper.level + params.helper.mental} | Total ${totalRoll} vs CD ${cdTarget}.`,
		);

		if (totalRoll >= cdTarget) {
			updatedTarget.isDying = false;
			updatedTarget.deathSuccesses = 0;
			updatedTarget.deathFailures = 0;
			logs.push(
				`💖 SUCESSO! ${params.target.name} foi estabilizado por ${params.helper.name}!`,
			);
		} else {
			logs.push(
				`❌ FALHA! ${params.helper.name} não conseguiu estabilizar ${params.target.name}.`,
			);
		}

		return ok({
			updatedTarget,
			logs,
		});
	}

	public resolveRetreat(params: {
		readonly party: readonly TacticalAiActor[];
		readonly monsters: readonly Monster[];
	}): Result<
		{
			readonly success: boolean;
			readonly logs: string[];
		},
		{ readonly code: string; readonly message: string }
	> {
		if (!this.diceService) {
			return fail({
				code: "MISSING_DICE_SERVICE",
				message: "Dice service is required for resolving retreat.",
			});
		}

		const activeHeroes = params.party.filter(
			(c) => c.currentHp > 0 && !c.isDying,
		);
		if (activeHeroes.length === 0) {
			return fail({
				code: "NO_ACTIVE_HEROES_TO_RETREAT",
				message: "No active party members to initiate a retreat.",
			});
		}

		const aliveMonsters = params.monsters.filter((m) => m.currentHitPoints > 0);
		if (aliveMonsters.length === 0) {
			return ok({
				success: true,
				logs: ["Nenhum inimigo ativo. Fuga automática bem-sucedida!"],
			});
		}

		let highestMonsterInit = 0;
		for (const m of aliveMonsters) {
			if (m.initiativeBase > highestMonsterInit) {
				highestMonsterInit = m.initiativeBase;
			}
		}

		const cdTarget = 10 + highestMonsterInit;
		const sumPhysical = activeHeroes.reduce((sum, c) => sum + c.physical, 0);
		const avgPhysical = Math.floor(sumPhysical / activeHeroes.length);

		const rollRes = this.diceService.rollD20({
			reason: "Teste Fisico do grupo para Fuga de Combate",
		});

		if (!rollRes.success) {
			return fail({
				code: "DICE_ROLL_ERROR",
				message: rollRes.error.message,
			});
		}

		const naturalRoll = rollRes.data.naturalRoll;
		const totalRoll = naturalRoll + avgPhysical;
		const logs: string[] = [];

		logs.push(
			`🏃 Fuga de Combate: Teste Fisico médio do grupo. Rolou d20=${naturalRoll} + mod=${avgPhysical} | Total ${totalRoll} vs CD ${cdTarget} (10 + Iniciativa Monstro ${highestMonsterInit}).`,
		);

		if (totalRoll >= cdTarget) {
			logs.push(
				"💨 FUGA BEM-SUCEDIDA! O grupo escapou de volta para o hexágono anterior. A exaustão extrema da retirada aplica a condição Exausto em todos os membros ativos.",
			);
			return ok({
				success: true,
				logs,
			});
		} else {
			logs.push(
				"❌ FALHA NA FUGA! O grupo não conseguiu escapar. Os monstros aproveitaram o recuo desordenado e ganharam uma rodada de perseguição livre!",
			);
			return ok({
				success: false,
				logs,
			});
		}
	}
}

function createActionQueueFailure(
	failure: ActionQueueFailure,
): CombatEncounterFailure {
	return {
		code: "ACTION_QUEUE_FAILED",
		message: "Combat encounter failed while using the action queue.",
		details: { actionQueueFailureCode: failure.code },
		cause: failure,
	};
}

function createState(input: {
	readonly input: CombatEncounterInput;
	readonly resolution: CombatEncounterState["resolution"];
	readonly damage?: CombatEncounterState["damage"];
	readonly events: readonly CombatEncounterEvent[];
}): CombatEncounterState {
	const targetHitPoints = deriveTargetHitPoints({
		initialHitPoints: input.input.target.currentHitPoints,
		events: input.events,
	});

	return {
		attacker: input.input.attacker,
		target: {
			...input.input.target,
			currentHitPoints: targetHitPoints,
		},
		wasHit: input.damage !== undefined,
		resolution: input.resolution,
		damage: input.damage ?? null,
		events: input.events,
		log: input.events.map((event) => event.message),
		processedCommand: {
			commandId: "pending",
			commandType: "attack",
			processedAt: "pending",
		},
	};
}

function deriveTargetHitPoints(input: {
	readonly initialHitPoints: number;
	readonly events: readonly CombatEncounterEvent[];
}): number {
	return input.events.reduce(
		(currentHitPoints, event) =>
			Math.max(0, currentHitPoints - event.damageAmount),
		input.initialHitPoints,
	);
}

function createAttackQueuedEvent(input: {
	readonly command: ActionCommand;
	readonly input: CombatEncounterInput;
	readonly createdAt: string;
}): CombatEncounterEvent {
	return {
		id: `${input.command.id}-queued`,
		type: "attackQueued",
		actorId: input.input.attacker.id,
		targetId: input.input.target.id,
		message: `${input.input.attacker.label} preparou um ataque contra ${input.input.target.label}.`,
		createdAt: input.createdAt,
		damageAmount: 0,
	};
}

function createAttackResolvedEvent(input: {
	readonly command: ActionCommand;
	readonly input: CombatEncounterInput;
	readonly resolution: CombatEncounterState["resolution"];
	readonly wasHit: boolean;
	readonly createdAt: string;
}): CombatEncounterEvent {
	const degreeLabel = RESOLUTION_DEGREE_LABELS[input.resolution.degree];
	const hitLabel = input.wasHit ? "acertou" : "errou";
	const suffix = input.wasHit ? "" : " Nenhum dano foi aplicado.";

	return {
		id: `${input.command.id}-resolved`,
		type: "attackResolved",
		actorId: input.input.attacker.id,
		targetId: input.input.target.id,
		message: `${input.input.attacker.label} ${hitLabel} ${input.input.target.label}: ${degreeLabel}, total ${input.resolution.total} contra CA ${input.input.target.armorClass}.${suffix}`,
		createdAt: input.createdAt,
		damageAmount: 0,
	};
}

function createDamageAppliedEvent(input: {
	readonly command: ActionCommand;
	readonly input: CombatEncounterInput;
	readonly damageAmount: number;
	readonly createdAt: string;
}): CombatEncounterEvent {
	const remainingHitPoints = Math.max(
		0,
		input.input.target.currentHitPoints - input.damageAmount,
	);

	return {
		id: `${input.command.id}-damage`,
		type: "damageApplied",
		actorId: input.input.attacker.id,
		targetId: input.input.target.id,
		message: `${input.input.target.label} sofreu ${input.damageAmount} de dano. HP restante: ${remainingHitPoints}.`,
		createdAt: input.createdAt,
		damageAmount: input.damageAmount,
	};
}

function isHitResolution(degree: ResolutionDegree): boolean {
	return degree !== "failure";
}
