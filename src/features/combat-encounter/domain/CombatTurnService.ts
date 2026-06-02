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

		return ok({
			round: nextRound,
			activeActorId: nextActorId,
			activeActorIndex: nextActorIndex,
			actorOrder: [...parsed.data.state.actorOrder],
			actionPointsRemaining: parsed.data.state.maxActionPoints,
			maxActionPoints: parsed.data.state.maxActionPoints,
			events: [...parsed.data.state.events, turnEndedEvent, turnStartedEvent],
		});
	}
}

function createInitialState(input: CombatTurnStartInput): CombatTurnState {
	const activeActorId = input.actorOrder[0] as string;

	return {
		round: 1,
		activeActorId,
		activeActorIndex: 0,
		actorOrder: [...input.actorOrder],
		actionPointsRemaining: BASE_ACTION_POINTS,
		maxActionPoints: BASE_ACTION_POINTS,
		events: [
			createTurnEvent({
				type: "turnStarted",
				actorId: activeActorId,
				round: 1,
				actionCost: 0,
				nextEventIndex: 1,
			}),
		],
	};
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
	return {
		round: state.round,
		activeActorId: state.activeActorId,
		activeActorIndex: state.activeActorIndex,
		actorOrder: [...state.actorOrder],
		actionPointsRemaining: state.actionPointsRemaining,
		maxActionPoints: state.maxActionPoints,
		events: state.events.map((event) => ({ ...event })),
	};
}
