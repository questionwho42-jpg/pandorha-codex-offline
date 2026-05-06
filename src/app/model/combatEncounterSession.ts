import {
	type CombatEncounterActorRef,
	type CombatEncounterClock,
	type CombatEncounterInput,
	CombatEncounterService,
	type CombatTrainingTarget,
	DEFAULT_TRAINING_TARGET,
	TRAINING_TARGETS,
	toCombatEncounterTargetState,
} from "$lib/features/combat-encounter";
import { DamagePipelineService } from "$lib/shared/damage";
import {
	type DiceClock,
	type DiceRng,
	type DiceRollIdProvider,
	DiceService,
} from "$lib/shared/dice";
import { ResolutionService } from "$lib/shared/resolution";

export type CombatEncounterSession = Readonly<{
	attacker: CombatEncounterActorRef;
	createAttackInput: (
		target: CombatTrainingTarget,
		targetHitPoints: number,
	) => CombatEncounterInput;
	initialTarget: CombatTrainingTarget;
	service: CombatEncounterService;
	trainingTargets: readonly CombatTrainingTarget[];
}>;

const TRAINING_ATTACKER: CombatEncounterActorRef = {
	id: "aria",
	label: "Aria",
};

export function createCombatEncounterSession(): CombatEncounterSession {
	const diceClock = createDeterministicClock("2026-05-06T12:30:00.000Z");
	const encounterClock = createDeterministicClock("2026-05-06T12:31:00.000Z");
	const diceService = new DiceService(
		new LoopingDiceRng([0.45]),
		createSequentialDiceRollIdProvider("combat-roll"),
		diceClock,
	);
	let nextCommandId = 1;

	return {
		attacker: TRAINING_ATTACKER,
		initialTarget: DEFAULT_TRAINING_TARGET,
		service: new CombatEncounterService(
			new ResolutionService(diceService),
			new DamagePipelineService(),
			encounterClock,
		),
		trainingTargets: TRAINING_TARGETS,
		createAttackInput: (target, targetHitPoints) => {
			const commandId = `training-attack-${nextCommandId}`;
			nextCommandId += 1;

			return {
				command: {
					id: commandId,
					type: "attack",
					source: "combat-vertical-slice-ui",
					createdAt: "2026-05-06T12:30:00.000Z",
					payload: {
						attackerId: TRAINING_ATTACKER.id,
						targetId: target.id,
					},
				},
				attacker: TRAINING_ATTACKER,
				target: {
					...toCombatEncounterTargetState(target),
					currentHitPoints: targetHitPoints,
				},
				attack: {
					reason: "Ataque corpo a corpo",
					level: 2,
					axisValue: 3,
					applicationValue: 2,
					itemBonus: 1,
				},
				damage: {
					damageType: "physical",
					baseDiceTotal: 4,
					matrixValue: 2,
					extraModifierTotal: 3,
					damageReduction: 0,
					vulnerabilityBonusDamage: 0,
					affinities: [],
				},
			};
		},
	};
}

class LoopingDiceRng implements DiceRng {
	private index = 0;

	public constructor(private readonly values: readonly number[]) {}

	public next(): number {
		const value = this.values[this.index % this.values.length];
		this.index += 1;
		return value ?? Number.NaN;
	}
}

function createSequentialDiceRollIdProvider(
	prefix: string,
): DiceRollIdProvider {
	let nextId = 1;

	return {
		generate: () => {
			const rollId = `${prefix}-${nextId}`;
			nextId += 1;
			return rollId;
		},
	};
}

function createDeterministicClock(
	startIso: string,
): DiceClock & CombatEncounterClock {
	const startMs = Date.parse(startIso);
	let offsetSeconds = 0;

	return {
		now: () => {
			const createdAt = new Date(startMs + offsetSeconds * 1000).toISOString();
			offsetSeconds += 1;
			return createdAt;
		},
	};
}
