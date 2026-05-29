import { describe, expect, it } from "vitest";
import { CombatTurnService } from "../domain/CombatTurnService";
import type { CombatTurnState } from "../model/combatTurnTypes";

describe("CombatTurnService", () => {
	it("starts on the attacker with round 1 and 3 actions", () => {
		const service = new CombatTurnService();
		const result = service.startTurnOrder({
			actorOrder: ["aria", "training-guard"],
		});

		expect(result).toEqual({
			success: true,
			data: {
				round: 1,
				activeActorId: "aria",
				activeActorIndex: 0,
				actorOrder: ["aria", "training-guard"],
				actionPointsRemaining: 3,
				maxActionPoints: 3,
				events: [
					{
						id: "turn-event-1",
						type: "turnStarted",
						actorId: "aria",
						round: 1,
						actionCost: 0,
					},
				],
			},
		});
	});

	it("spends one action and records the event", () => {
		const service = new CombatTurnService();
		const state = createState();
		const result = service.spendAction({
			state,
			actorId: "aria",
			actionCost: 1,
		});

		expectSuccess(result);
		expect(result.data.actionPointsRemaining).toBe(2);
		expect(result.data.events.at(-1)).toEqual({
			id: "turn-event-2",
			type: "actionSpent",
			actorId: "aria",
			round: 1,
			actionCost: 1,
		});
	});

	it("does not allow spending more actions than the actor has", () => {
		const service = new CombatTurnService();
		const result = service.spendAction({
			state: { ...createState(), actionPointsRemaining: 0 },
			actorId: "aria",
			actionCost: 1,
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "INSUFFICIENT_ACTION_POINTS",
				message: "Combat turn actor does not have enough action points.",
				details: {
					actorId: "aria",
					actionCost: 1,
					actionPointsRemaining: 0,
				},
			},
		});
	});

	it("ends turn from attacker to target and then back to attacker on round 2", () => {
		const service = new CombatTurnService();
		const targetTurn = service.endTurn({
			state: createState(),
			actorId: "aria",
		});

		expectSuccess(targetTurn);
		expect(targetTurn.data).toMatchObject({
			round: 1,
			activeActorId: "training-guard",
			activeActorIndex: 1,
			actionPointsRemaining: 3,
		});

		const attackerTurn = service.endTurn({
			state: targetTurn.data,
			actorId: "training-guard",
		});

		expectSuccess(attackerTurn);
		expect(attackerTurn.data).toMatchObject({
			round: 2,
			activeActorId: "aria",
			activeActorIndex: 0,
			actionPointsRemaining: 3,
		});
		expect(attackerTurn.data.events.at(-1)).toEqual({
			id: "turn-event-5",
			type: "turnStarted",
			actorId: "aria",
			round: 2,
			actionCost: 0,
		});
	});

	it("returns a typed failure for an unknown actor", () => {
		const service = new CombatTurnService();
		const result = service.spendAction({
			state: createState(),
			actorId: "missing-actor",
			actionCost: 1,
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "UNKNOWN_TURN_ACTOR",
				message: "Combat turn actor is not in the turn order.",
				details: { actorId: "missing-actor" },
			},
		});
	});

	it("returns a typed failure for a duplicate actor order", () => {
		const service = new CombatTurnService();
		const result = service.startTurnOrder({
			actorOrder: ["aria", "aria"],
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "INVALID_TURN_INPUT",
				message: "Combat turn input failed validation.",
				details: { issues: ["actorOrder: Actor ids must be unique"] },
			},
		});
	});

	it("returns a typed failure when an inactive actor spends an action", () => {
		const service = new CombatTurnService();
		const result = service.spendAction({
			state: createState(),
			actorId: "training-guard",
			actionCost: 1,
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "INACTIVE_TURN_ACTOR",
				message: "Combat turn actor is not active.",
				details: {
					actorId: "training-guard",
					activeActorId: "aria",
				},
			},
		});
	});

	it("returns a typed failure when an inactive actor ends turn", () => {
		const service = new CombatTurnService();
		const result = service.endTurn({
			state: createState(),
			actorId: "training-guard",
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "INACTIVE_TURN_ACTOR",
				message: "Combat turn actor is not active.",
				details: {
					actorId: "training-guard",
					activeActorId: "aria",
				},
			},
		});
	});

	it("returns a typed failure for invalid action input", () => {
		const service = new CombatTurnService();
		const result = service.spendAction({
			state: createState(),
			actorId: "aria",
			actionCost: 0,
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error.code).toBe("INVALID_TURN_INPUT");
		expect(result.error.details?.issues).toContain(
			"actionCost: Too small: expected number to be >=1",
		);
	});

	it("returns a typed failure for invalid end turn input", () => {
		const service = new CombatTurnService();
		const result = service.endTurn({
			state: {
				...createState(),
				round: 0,
			},
			actorId: "aria",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error.code).toBe("INVALID_TURN_INPUT");
		expect(result.error.details?.issues).toContain(
			"state.round: Too small: expected number to be >=1",
		);
	});

	it("returns a typed failure for invalid input", () => {
		const service = new CombatTurnService();
		const result = service.startTurnOrder({
			actorOrder: ["aria"],
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error.code).toBe("INVALID_TURN_INPUT");
		expect(result.error.details?.issues).toContain(
			"actorOrder: Too small: expected array to have >=2 items",
		);
	});

	it("inicializa o tension clock com segmentos max e preenchidos em 0", () => {
		const service = new CombatTurnService();
		const result = service.startTurnOrder({
			actorOrder: ["aria", "training-guard"],
			tensionClockSegmentsMax: 6,
		} as any);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.tensionClockSegmentsMax).toBe(6);
			expect(result.data.tensionClockSegmentsFilled).toBe(0);
			expect(result.data.isAlarmTriggered).toBe(false);
		}
	});

	it("incrementa fatias do relógio de tensão e dispara alarme quando cheio", () => {
		const service = new CombatTurnService();
		const startState = service.startTurnOrder({
			actorOrder: ["aria", "training-guard"],
			tensionClockSegmentsMax: 4,
		} as any);
		expectSuccess(startState);

		// Incrementa +2 fatias
		const res1 = service.increaseTensionClock(
			startState.data,
			2,
			"aria",
			"Passos pesados no corredor",
		);
		expectSuccess(res1);
		expect(res1.data.tensionClockSegmentsFilled).toBe(2);
		expect(res1.data.isAlarmTriggered).toBe(false);
		expect(res1.data.events.at(-1)?.type).toBe("tensionIncreased");
		expect((res1.data.events.at(-1) as any).details).toBe(
			"Passos pesados no corredor",
		);

		// Incrementa mais +2 fatias (atinge o limite de 4)
		const res2 = service.increaseTensionClock(res1.data, 2, "aria");
		expectSuccess(res2);
		expect(res2.data.tensionClockSegmentsFilled).toBe(4);
		expect(res2.data.isAlarmTriggered).toBe(true); // Alarme disparado!
	});

	it("incrementa tensão com valores do relógio de tensão nulos ou indefinidos no estado", () => {
		const service = new CombatTurnService();
		const state: any = {
			round: 1,
			actorOrder: ["aria"],
			activeActorId: "aria",
			turnIndex: 0,
			events: [],
		};
		const res = service.increaseTensionClock(state, 3, "aria");
		expectSuccess(res);
		expect(res.data.tensionClockSegmentsMax).toBe(8); // fallback 8
		expect(res.data.tensionClockSegmentsFilled).toBe(3); // fallback 0 + 3
	});

	it("preserva os dados do tension clock na transição de turnos", () => {
		const service = new CombatTurnService();
		const startState = service.startTurnOrder({
			actorOrder: ["aria", "training-guard"],
			tensionClockSegmentsMax: 8,
		} as any);
		expectSuccess(startState);

		const stateWithTension = service.increaseTensionClock(
			startState.data,
			3,
			"aria",
		);
		expectSuccess(stateWithTension);

		const endTurnRes = service.endTurn({
			state: stateWithTension.data,
			actorId: "aria",
		});
		expectSuccess(endTurnRes);
		expect(endTurnRes.data.tensionClockSegmentsMax).toBe(8);
		expect(endTurnRes.data.tensionClockSegmentsFilled).toBe(3);
		expect(endTurnRes.data.isAlarmTriggered).toBe(false);
	});
});

function createState(): CombatTurnState {
	return {
		round: 1,
		activeActorId: "aria",
		activeActorIndex: 0,
		actorOrder: ["aria", "training-guard"],
		actionPointsRemaining: 3,
		maxActionPoints: 3,
		events: [
			{
				id: "turn-event-1",
				type: "turnStarted",
				actorId: "aria",
				round: 1,
				actionCost: 0,
			},
		],
	};
}

function expectSuccess<Success, Failure>(
	result:
		| { readonly success: true; readonly data: Success }
		| {
				readonly success: false;
				readonly error: Failure;
		  },
): asserts result is { readonly success: true; readonly data: Success } {
	expect(result.success).toBe(true);
}
