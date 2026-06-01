import {
	type EquipmentFailure,
	type EquipmentLoadoutInput,
	EquipmentLoadoutService,
	type EquipmentLoadoutSnapshot,
	type EquipmentRecord,
	InMemoryEquipmentCatalogRepository,
	OFFICIAL_EQUIPMENT,
} from "$lib/entities/equipment";
import {
	type CombatEncounterActorRef,
	type CombatEncounterClock,
	type CombatEncounterInput,
	CombatEncounterService,
	type CombatTrainingAttackProfile,
	type CombatTrainingTarget,
	DEFAULT_COMBAT_TRAINING_ATTACKER,
	DEFAULT_TRAINING_TARGET,
	TRAINING_TARGETS,
	toCombatEncounterTargetState,
} from "$lib/features/combat-encounter/model-api";
import { DamagePipelineService } from "$lib/shared/damage";
import {
	type DiceClock,
	type DiceRng,
	type DiceRollIdProvider,
	DiceService,
} from "$lib/shared/dice";
import type { Result } from "$lib/shared/lib/result";
import { ResolutionService } from "$lib/shared/resolution";

const DEFAULT_COMBAT_WEAPON_ID = "longsword";

export type CombatEncounterSession = Readonly<{
	attacker: CombatEncounterActorRef;
	buildEquipmentLoadout: (
		input: EquipmentLoadoutInput,
	) => Promise<Result<EquipmentLoadoutSnapshot, EquipmentFailure>>;
	createAttackInput: (
		attacker: CombatEncounterActorRef,
		target: CombatTrainingTarget,
		targetHitPoints: number,
		attackProfile: CombatTrainingAttackProfile,
	) => CombatEncounterInput;
	defaultWeaponId: string;
	equipmentWeapons: readonly EquipmentRecord[];
	initialTarget: CombatTrainingTarget;
	service: CombatEncounterService;
	trainingTargets: readonly CombatTrainingTarget[];
}>;

export function createCombatEncounterSession(): CombatEncounterSession {
	const diceClock = createDeterministicClock("2026-05-06T12:30:00.000Z");
	const encounterClock = createDeterministicClock("2026-05-06T12:31:00.000Z");
	const diceService = new DiceService(
		new LoopingDiceRng([0.45]),
		createSequentialDiceRollIdProvider("combat-roll"),
		diceClock,
	);
	const equipmentRepository = new InMemoryEquipmentCatalogRepository({
		consumables: [],
		equipment: OFFICIAL_EQUIPMENT,
	});
	const loadoutService = new EquipmentLoadoutService(equipmentRepository);
	let nextCommandId = 1;

	return {
		attacker: DEFAULT_COMBAT_TRAINING_ATTACKER,
		buildEquipmentLoadout: (input) => loadoutService.buildLoadout(input),
		defaultWeaponId: DEFAULT_COMBAT_WEAPON_ID,
		equipmentWeapons: OFFICIAL_EQUIPMENT.filter(
			(equipment) => equipment.kind === "weapon",
		),
		initialTarget: DEFAULT_TRAINING_TARGET,
		service: new CombatEncounterService(
			new ResolutionService(diceService),
			new DamagePipelineService(),
			encounterClock,
		),
		trainingTargets: TRAINING_TARGETS,
		createAttackInput: (attacker, target, targetHitPoints, attackProfile) => {
			const commandId = `training-attack-${nextCommandId}`;
			nextCommandId += 1;
			const combatAttacker = toCombatEncounterActorRef(attacker);

			return {
				command: {
					id: commandId,
					type: "attack",
					source: "combat-vertical-slice-ui",
					createdAt: "2026-05-06T12:30:00.000Z",
					payload: {
						attackerId: combatAttacker.id,
						targetId: target.id,
					},
				},
				attacker: combatAttacker,
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
					damageType: attackProfile.damageType,
					baseDiceTotal: attackProfile.baseDiceTotal,
					matrixValue: attackProfile.matrixValue,
					extraModifierTotal: attackProfile.extraModifierTotal,
					damageReduction: attackProfile.damageReduction,
					vulnerabilityBonusDamage: attackProfile.vulnerabilityBonusDamage,
					affinities: attackProfile.affinities,
				},
			};
		},
	};
}

function toCombatEncounterActorRef(
	attacker: CombatEncounterActorRef,
): CombatEncounterActorRef {
	return {
		id: attacker.id,
		label: attacker.label,
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
