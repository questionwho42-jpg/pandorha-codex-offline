export { CombatEncounterService } from "./domain/CombatEncounterService";
export { CombatTrainingEnemyAttackService } from "./domain/CombatTrainingEnemyAttackService";
export { CombatTurnService } from "./domain/CombatTurnService";
export type {
	CombatAttackerStatsStatus,
	CombatAttackerStatsView,
	CombatAttackerStatsViewInput,
} from "./model/combatAttackerStatsView";
export { createCombatAttackerStatsView } from "./model/combatAttackerStatsView";
export {
	combatEncounterActorSchema,
	combatEncounterAttackSchema,
	combatEncounterDamageSchema,
	combatEncounterInputSchema,
	combatEncounterTargetSchema,
	formatCombatEncounterIssues,
} from "./model/combatEncounterSchemas";
export type {
	CombatDamagePort,
	CombatEncounterActorRef,
	CombatEncounterAttackInput,
	CombatEncounterClock,
	CombatEncounterDamageInput,
	CombatEncounterEvent,
	CombatEncounterEventType,
	CombatEncounterFailure,
	CombatEncounterFailureCode,
	CombatEncounterFailureDetails,
	CombatEncounterInput,
	CombatEncounterResolvedCommand,
	CombatEncounterState,
	CombatEncounterTargetState,
	CombatResolutionPort,
	CombatWeaponDamageDiceInput,
} from "./model/combatEncounterTypes";
export {
	type CombatEncounterView,
	type CombatEncounterViewInput,
	createCombatEncounterView,
} from "./model/combatEncounterView";
export {
	type CombatAttackerOption,
	type CombatAttackerSource,
	createCombatAttackerOptions,
	DEFAULT_COMBAT_TRAINING_ATTACKER,
	findCombatAttackerOptionById,
	toCombatEncounterActorFromCharacter,
} from "./model/combatSessionAttacker";
export type {
	CombatTrainingAttackProfile,
	CombatTrainingAttackProfileInput,
	CombatTrainingAttackProfileSource,
} from "./model/combatTrainingAttackProfile";
export { createCombatTrainingAttackProfile } from "./model/combatTrainingAttackProfile";
export type {
	CombatTrainingDefenderDamageInput,
	CombatTrainingDefenderDamageResult,
	CombatTrainingDefenderHitPointsFailure,
	CombatTrainingDefenderHitPointsFailureCode,
	CombatTrainingDefenderHitPointsFailureDetails,
	CombatTrainingDefenderHitPointsInput,
	CombatTrainingDefenderHitPointsState,
} from "./model/combatTrainingDefenderHitPoints";
export {
	applyCombatTrainingDefenderDamage,
	createCombatTrainingDefenderHitPoints,
} from "./model/combatTrainingDefenderHitPoints";
export type {
	CombatTrainingEnemyAttackFailure,
	CombatTrainingEnemyAttackFailureCode,
	CombatTrainingEnemyAttackFailureDetails,
	CombatTrainingEnemyAttackInput,
	CombatTrainingEnemyAttackResult,
	CombatTrainingEnemyDefenseProfile,
	CombatTrainingEnemyDefenseProfileInput,
} from "./model/combatTrainingEnemyAttack";
export {
	combatTrainingEnemyAttackInputSchema,
	combatTrainingEnemyDefenseProfileInputSchema,
	createCombatTrainingEnemyDefenseProfile,
	formatCombatTrainingEnemyAttackIssues,
} from "./model/combatTrainingEnemyAttack";
export {
	type CombatTrainingTarget,
	type CombatTrainingTargetDefenseAffinity,
	type CombatTrainingTargetDefenseAffinityKind,
	type CombatTrainingTargetId,
	DEFAULT_TRAINING_TARGET,
	findTrainingTargetById,
	TRAINING_TARGETS,
	toCombatEncounterTargetState,
} from "./model/combatTrainingTargetCatalog";
export type { CombatTrainingTargetTurnLogInput } from "./model/combatTrainingTargetTurn";
export { createCombatTrainingTargetTurnLog } from "./model/combatTrainingTargetTurn";
export type {
	CombatTurnActionInput,
	CombatTurnEndInput,
	CombatTurnEvent,
	CombatTurnEventType,
	CombatTurnFailure,
	CombatTurnFailureCode,
	CombatTurnFailureDetails,
	CombatTurnStartInput,
	CombatTurnState,
} from "./model/combatTurnTypes";
