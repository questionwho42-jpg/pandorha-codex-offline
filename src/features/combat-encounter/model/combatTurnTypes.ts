export type CombatTurnEventType =
	| "turnStarted"
	| "actionSpent"
	| "turnEnded"
	| "tensionIncreased";

export interface CombatTurnEvent {
	readonly id: string;
	readonly type: CombatTurnEventType;
	readonly actorId: string;
	readonly round: number;
	readonly actionCost: number;
	readonly details?: string | undefined;
}

export interface CombatTurnState {
	readonly round: number;
	readonly activeActorId: string;
	readonly activeActorIndex: number;
	readonly actorOrder: readonly string[];
	readonly actionPointsRemaining: number;
	readonly maxActionPoints: number;
	readonly events: readonly CombatTurnEvent[];
	readonly tensionClockSegmentsMax?: number | undefined;
	readonly tensionClockSegmentsFilled?: number | undefined;
	readonly isAlarmTriggered?: boolean | undefined;
}

export interface CombatTurnStartInput {
	readonly actorOrder: readonly string[];
}

export interface CombatTurnActionInput {
	readonly state: CombatTurnState;
	readonly actorId: string;
	readonly actionCost: number;
}

export interface CombatTurnEndInput {
	readonly state: CombatTurnState;
	readonly actorId: string;
}

export type CombatTurnFailureCode =
	| "INVALID_TURN_INPUT"
	| "UNKNOWN_TURN_ACTOR"
	| "INACTIVE_TURN_ACTOR"
	| "INSUFFICIENT_ACTION_POINTS";

export type CombatTurnFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface CombatTurnFailure {
	readonly code: CombatTurnFailureCode;
	readonly message: string;
	readonly details?: CombatTurnFailureDetails;
}
