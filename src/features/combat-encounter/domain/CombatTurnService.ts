import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	combatTurnActionInputSchema,
	combatTurnEndInputSchema,
	combatTurnStartInputSchema,
	formatCombatTurnIssues,
} from "../model/combatTurnSchemas";
import type {
	CombatTurnEndInput,
	CombatTurnEvent,
	CombatTurnEventType,
	CombatTurnFailure,
	CombatTurnStartInput,
	CombatTurnState,
} from "../model/combatTurnTypes";

const BASE_ACTION_POINTS = 3;

/**
 * @rule docs/system/survival/00-mecanicas-fundamentais.md - A combat turn starts with 3 action points.
 * @rule docs/architecture/feature_state_machines.md - Turn state derives from an in-memory ledger of turn events.
 */
export class CombatTurnService {
	public startTurnOrder(
		input: unknown,
	): Result<CombatTurnState, CombatTurnFailure> {
		const parsed = combatTurnStartInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail(createInvalidInputFailure(parsed.error.issues));
		}

		const uniqueActorIds = new Set(parsed.data.actorOrder);
		if (uniqueActorIds.size !== parsed.data.actorOrder.length) {
			return fail({
				code: "INVALID_TURN_INPUT",
				message: "Combat turn input failed validation.",
				details: { issues: ["actorOrder: Actor ids must be unique"] },
			});
		}

		return ok(createInitialState(parsed.data));
	}

	public spendAction(
		input: unknown,
	): Result<CombatTurnState, CombatTurnFailure> {
		const parsed = combatTurnActionInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail(createInvalidInputFailure(parsed.error.issues));
		}

		const actorFailure = validateActiveActor(parsed.data);
		if (actorFailure) {
			return fail(actorFailure);
		}

		if (parsed.data.actionCost > parsed.data.state.actionPointsRemaining) {
			return fail({
				code: "INSUFFICIENT_ACTION_POINTS",
				message: "Combat turn actor does not have enough action points.",
				details: {
					actorId: parsed.data.actorId,
					actionCost: parsed.data.actionCost,
					actionPointsRemaining: parsed.data.state.actionPointsRemaining,
				},
			});
		}

		return ok({
			...copyState(parsed.data.state),
			actionPointsRemaining:
				parsed.data.state.actionPointsRemaining - parsed.data.actionCost,
			events: [
				...parsed.data.state.events,
				createTurnEvent({
					type: "actionSpent",
					actorId: parsed.data.actorId,
					round: parsed.data.state.round,
					actionCost: parsed.data.actionCost,
					nextEventIndex: parsed.data.state.events.length + 1,
				}),
			],
		});
	}

	public endTurn(input: unknown): Result<CombatTurnState, CombatTurnFailure> {
		const parsed = combatTurnEndInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail(createInvalidInputFailure(parsed.error.issues));
		}

		const actorFailure = validateActiveActor(parsed.data);
		if (actorFailure) {
			return fail(actorFailure);
		}

		const nextActorIndex =
			(parsed.data.state.activeActorIndex + 1) %
			parsed.data.state.actorOrder.length;
		const nextRound =
			nextActorIndex === 0
				? parsed.data.state.round + 1
				: parsed.data.state.round;
		const nextActorId = parsed.data.state.actorOrder[nextActorIndex] as string;
		const turnEndedEvent = createTurnEvent({
			type: "turnEnded",
			actorId: parsed.data.actorId,
			round: parsed.data.state.round,
			actionCost: 0,
			nextEventIndex: parsed.data.state.events.length + 1,
		});
		const turnStartedEvent = createTurnEvent({
			type: "turnStarted",
			actorId: nextActorId,
			round: nextRound,
			actionCost: 0,
			nextEventIndex: parsed.data.state.events.length + 2,
		});

		let nextSurprisedActorIds = parsed.data.state.surprisedActorIds
			? [...parsed.data.state.surprisedActorIds]
			: [];
		if (nextSurprisedActorIds.includes(parsed.data.actorId)) {
			nextSurprisedActorIds = nextSurprisedActorIds.filter(
				(id) => id !== parsed.data.actorId,
			);
		}

		const nextState: any = {
			round: nextRound,
			activeActorId: nextActorId,
			activeActorIndex: nextActorIndex,
			actorOrder: [...parsed.data.state.actorOrder],
			actionPointsRemaining: parsed.data.state.maxActionPoints,
			maxActionPoints: parsed.data.state.maxActionPoints,
			events: [...parsed.data.state.events, turnEndedEvent, turnStartedEvent],
		};

		if (parsed.data.state.tensionClockSegmentsMax !== undefined) {
			nextState.tensionClockSegmentsMax =
				parsed.data.state.tensionClockSegmentsMax;
		}
		if (parsed.data.state.tensionClockSegmentsFilled !== undefined) {
			nextState.tensionClockSegmentsFilled =
				parsed.data.state.tensionClockSegmentsFilled;
		}
		if (parsed.data.state.isAlarmTriggered !== undefined) {
			nextState.isAlarmTriggered = parsed.data.state.isAlarmTriggered;
		}
		if (parsed.data.state.isAmbush !== undefined) {
			nextState.isAmbush = parsed.data.state.isAmbush;
		}
		if (parsed.data.state.surprisedActorIds !== undefined) {
			nextState.surprisedActorIds = nextSurprisedActorIds;
		}

		return ok(nextState);
	}

	public increaseTensionClock(
		state: CombatTurnState,
		segments: number,
		actorId: string,
		details?: string,
	): Result<CombatTurnState, CombatTurnFailure> {
		const copied = copyState(state);
		const max = copied.tensionClockSegmentsMax ?? 8;
		const current = copied.tensionClockSegmentsFilled ?? 0;

		const nextFilled = Math.min(max, current + segments);
		const isAlarmTriggered = nextFilled >= max;

		const nextEventIndex = copied.events.length + 1;
		const event = createTurnEvent({
			type: "tensionIncreased",
			actorId,
			round: copied.round,
			actionCost: 0,
			nextEventIndex,
		});

		if (details !== undefined) {
			(event as any).details = details;
		} else {
			(event as any).details = `Tensão aumentada em +${segments} fatias.`;
		}

		const nextState: any = {
			...copied,
			tensionClockSegmentsMax: max,
			tensionClockSegmentsFilled: nextFilled,
			isAlarmTriggered: copied.isAlarmTriggered || isAlarmTriggered,
			events: [...copied.events, event],
		};

		return ok(nextState);
	}
}

function createInitialState(input: CombatTurnStartInput): CombatTurnState {
	const activeActorId = input.actorOrder[0] as string;
	const tensionClockSegmentsMax = (input as any).tensionClockSegmentsMax;
	const isAmbush = (input as any).isAmbush;

	const events: any[] = [];

	if (isAmbush) {
		events.push(
			createTurnEvent({
				type: "ambushOpeningStrike",
				actorId: activeActorId,
				round: 1,
				actionCost: 0,
				nextEventIndex: 1,
			}),
		);
	}

	events.push(
		createTurnEvent({
			type: "turnStarted",
			actorId: activeActorId,
			round: 1,
			actionCost: 0,
			nextEventIndex: events.length + 1,
		}),
	);

	const state: any = {
		round: 1,
		activeActorId,
		activeActorIndex: 0,
		actorOrder: [...input.actorOrder],
		actionPointsRemaining: isAmbush ? 4 : BASE_ACTION_POINTS,
		maxActionPoints: BASE_ACTION_POINTS,
		events,
	};

	if (typeof tensionClockSegmentsMax === "number") {
		state.tensionClockSegmentsMax = tensionClockSegmentsMax;
		state.tensionClockSegmentsFilled = 0;
		state.isAlarmTriggered = false;
	}

	if (isAmbush) {
		state.isAmbush = true;
		state.surprisedActorIds = input.actorOrder.slice(1);
	}

	return state;
}

function validateActiveActor(
	input: CombatTurnEndInput,
): CombatTurnFailure | null {
	if (!input.state.actorOrder.includes(input.actorId)) {
		return {
			code: "UNKNOWN_TURN_ACTOR",
			message: "Combat turn actor is not in the turn order.",
			details: { actorId: input.actorId },
		};
	}

	if (input.state.activeActorId !== input.actorId) {
		return {
			code: "INACTIVE_TURN_ACTOR",
			message: "Combat turn actor is not active.",
			details: {
				actorId: input.actorId,
				activeActorId: input.state.activeActorId,
			},
		};
	}

	return null;
}

function createTurnEvent(input: {
	readonly type: CombatTurnEventType;
	readonly actorId: string;
	readonly round: number;
	readonly actionCost: number;
	readonly nextEventIndex: number;
}): CombatTurnEvent {
	return {
		id: `turn-event-${input.nextEventIndex}`,
		type: input.type,
		actorId: input.actorId,
		round: input.round,
		actionCost: input.actionCost,
	};
}

function createInvalidInputFailure(
	issues: Parameters<typeof formatCombatTurnIssues>[0],
): CombatTurnFailure {
	return {
		code: "INVALID_TURN_INPUT",
		message: "Combat turn input failed validation.",
		details: { issues: formatCombatTurnIssues(issues) },
	};
}

function copyState(state: CombatTurnState): CombatTurnState {
	const copied: any = {
		round: state.round,
		activeActorId: state.activeActorId,
		activeActorIndex: state.activeActorIndex,
		actorOrder: [...state.actorOrder],
		actionPointsRemaining: state.actionPointsRemaining,
		maxActionPoints: state.maxActionPoints,
		events: state.events.map((event) => {
			const evt: any = {
				id: event.id,
				type: event.type,
				actorId: event.actorId,
				round: event.round,
				actionCost: event.actionCost,
			};
			if (event.details !== undefined) {
				evt.details = event.details;
			}
			return evt;
		}),
	};

	if (state.tensionClockSegmentsMax !== undefined) {
		copied.tensionClockSegmentsMax = state.tensionClockSegmentsMax;
	}
	if (state.tensionClockSegmentsFilled !== undefined) {
		copied.tensionClockSegmentsFilled = state.tensionClockSegmentsFilled;
	}
	if (state.isAlarmTriggered !== undefined) {
		copied.isAlarmTriggered = state.isAlarmTriggered;
	}
	if (state.isAmbush !== undefined) {
		copied.isAmbush = state.isAmbush;
	}
	if (state.surprisedActorIds !== undefined) {
		copied.surprisedActorIds = [...state.surprisedActorIds];
	}

	return copied;
}
