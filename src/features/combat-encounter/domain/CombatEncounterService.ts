import {
	type ActionCommand,
	type ActionCommandProcessor,
	type ActionQueueFailure,
	type ActionQueueProcessedCommand,
	type ActionQueueProcessorFailure,
	ActionQueueService,
} from "$lib/shared/action-queue";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { ResolutionDegree } from "$lib/shared/resolution";
import {
	combatEncounterInputSchema,
	formatCombatEncounterIssues,
} from "../model/combatEncounterSchemas";
import type {
	CombatDamagePort,
	CombatEncounterClock,
	CombatEncounterDamageInput,
	CombatEncounterEvent,
	CombatEncounterFailure,
	CombatEncounterInput,
	CombatEncounterState,
	CombatResolutionPort,
	CombatWeaponDamageDiceExpression,
	CombatWeaponDamageDiceInput,
	CombatWeaponDamageDicePort,
} from "../model/combatEncounterTypes";

const RESOLUTION_DEGREE_LABELS: Record<ResolutionDegree, string> = {
	criticalSuccess: "sucesso crítico",
	success: "sucesso",
	successWithCost: "sucesso com custo",
	failure: "falha",
};

type ResolvedWeaponDamageRoll = Readonly<{
	roll: NonNullable<CombatEncounterState["weaponDamageRoll"]>;
	weaponDice: CombatWeaponDamageDiceInput;
}>;

/**
 * @rule docs/architecture/feature_state_machines.md - Combat commands must resolve through ActionQueue and HP changes derive from events.
 * @rule docs/system/survival/00-mecanicas-fundamentais.md - Attack resolution targets CA as the global test DC.
 */
export class CombatEncounterService {
	public constructor(
		private readonly resolutionService: CombatResolutionPort,
		private readonly damageService: CombatDamagePort,
		private readonly clock: CombatEncounterClock,
		private readonly weaponDamageDiceService?: CombatWeaponDamageDicePort,
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

		const weaponDamageRoll = this.rollWeaponDamageDie(input.damage);
		if (!weaponDamageRoll.success) {
			return fail(weaponDamageRoll.error);
		}

		const damageInput = createDamagePipelineInput({
			damage: input.damage,
			baseDiceTotalOverride: weaponDamageRoll.data?.roll.naturalRoll,
			isCriticalHit: resolution.data.degree === "criticalSuccess",
		});
		const damage = this.damageService.calculateDamage(damageInput);

		if (!damage.success) {
			return fail({
				code: "DAMAGE_PIPELINE_FAILED",
				message: "Combat encounter failed while calculating damage.",
				details: { damageFailureCode: damage.error.code },
				cause: damage.error,
			});
		}

		const weaponDamageEvent =
			weaponDamageRoll.data === null
				? null
				: createWeaponDamageRolledEvent({
						command,
						input,
						roll: weaponDamageRoll.data.roll,
						weaponDice: weaponDamageRoll.data.weaponDice,
						createdAt: this.clock.now(),
					});
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
				weaponDamageRoll: weaponDamageRoll.data?.roll ?? null,
				events:
					weaponDamageEvent === null
						? [...resolvedEvents, damageEvent]
						: [...resolvedEvents, weaponDamageEvent, damageEvent],
			}),
		);
	}

	private rollWeaponDamageDie(
		damage: CombatEncounterDamageInput,
	): Result<ResolvedWeaponDamageRoll | null, CombatEncounterFailure> {
		if (damage.weaponDice === undefined) {
			return ok(null);
		}

		if (this.weaponDamageDiceService === undefined) {
			return fail({
				code: "WEAPON_DAMAGE_DICE_FAILED",
				message: "Combat encounter has weapon dice but no dice service.",
				details: { reason: "missing weapon damage dice service" },
			});
		}

		const rolled = this.weaponDamageDiceService.rollDie({
			sides: getWeaponDiceSides(damage.weaponDice.expression),
			reason: `Dano de arma: ${damage.weaponDice.label} (${damage.weaponDice.expression})`,
		});

		if (!rolled.success) {
			return fail({
				code: "WEAPON_DAMAGE_DICE_FAILED",
				message: "Combat encounter failed while rolling weapon damage dice.",
				details: { diceFailureCode: rolled.error.code },
				cause: rolled.error,
			});
		}

		return ok({
			roll: rolled.data,
			weaponDice: damage.weaponDice,
		});
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
	readonly weaponDamageRoll?: CombatEncounterState["weaponDamageRoll"];
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
		weaponDamageRoll: input.weaponDamageRoll ?? null,
		events: input.events,
		log: input.events.map((event) => event.message),
		processedCommand: {
			commandId: "pending",
			commandType: "attack",
			processedAt: "pending",
		},
	};
}

function createDamagePipelineInput(input: {
	readonly damage: CombatEncounterDamageInput;
	readonly baseDiceTotalOverride: number | undefined;
	readonly isCriticalHit: boolean;
}) {
	const { weaponDice: _weaponDice, ...damage } = input.damage;

	return {
		...damage,
		baseDiceTotal: input.baseDiceTotalOverride ?? damage.baseDiceTotal,
		isCriticalHit: input.isCriticalHit,
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

function createWeaponDamageRolledEvent(input: {
	readonly command: ActionCommand;
	readonly input: CombatEncounterInput;
	readonly roll: NonNullable<CombatEncounterState["weaponDamageRoll"]>;
	readonly weaponDice: CombatWeaponDamageDiceInput;
	readonly createdAt: string;
}): CombatEncounterEvent {
	return {
		id: `${input.command.id}-weapon-damage`,
		type: "weaponDamageRolled",
		actorId: input.input.attacker.id,
		targetId: input.input.target.id,
		message: `${input.weaponDice.label} rolou ${input.roll.naturalRoll} em ${input.weaponDice.expression} para dano da arma (auditoria ${input.roll.auditEntry.rollId}). Matriz ${input.input.damage.matrixValue}, modificadores ${input.input.damage.extraModifierTotal}.`,
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

function getWeaponDiceSides(
	expression: CombatWeaponDamageDiceExpression,
): number {
	switch (expression) {
		case "1d4":
			return 4;
		case "1d8":
			return 8;
	}
}
