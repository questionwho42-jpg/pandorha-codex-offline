import { describe, expect, it } from "vitest";
import type { ZodIssue } from "zod/v4";
import type { CombatRealDamageReceivedEvent } from "../model/combatRealDamageEvent";
import {
	type CombatRealHitPointsReplayInput,
	formatCombatRealHitPointsReplayIssues,
	replayCombatRealHitPoints,
} from "../model/combatRealHitPointsReplay";

describe("combat real hit points replay", () => {
	it("replays matching real damage events without mutating the ledger", () => {
		const eventLedger: readonly CombatRealDamageReceivedEvent[] = [
			createRealDamageEvent({
				id: "real-damage-1",
				damageAmount: 3,
			}),
			createRealDamageEvent({
				id: "other-target-damage",
				targetId: "session-character-2",
				targetLabel: "Taro",
				damageAmount: 99,
			}),
			createRealDamageEvent({
				id: "real-damage-2",
				damageAmount: 6,
			}),
		];

		const result = replayCombatRealHitPoints({
			target: createTarget(),
			eventLedger,
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(eventLedger).toEqual([
			createRealDamageEvent({
				id: "real-damage-1",
				damageAmount: 3,
			}),
			createRealDamageEvent({
				id: "other-target-damage",
				targetId: "session-character-2",
				targetLabel: "Taro",
				damageAmount: 99,
			}),
			createRealDamageEvent({
				id: "real-damage-2",
				damageAmount: 6,
			}),
		]);
		expect(result.data).toEqual({
			appliedDamageTotal: 9,
			currentHitPoints: 5,
			isTerminal: false,
			matchedEventCount: 2,
			maxHitPoints: 14,
			summaryLabel: "HP real de Lia: 5/14",
			targetId: "session-character-1",
			targetLabel: "Lia",
		});
	});

	it("clamps overkill at zero and exposes the terminal replay state", () => {
		const result = replayCombatRealHitPoints({
			target: createTarget(),
			eventLedger: [
				createRealDamageEvent({ id: "real-damage-1", damageAmount: 9 }),
				createRealDamageEvent({ id: "real-damage-2", damageAmount: 9 }),
			],
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data).toEqual({
			appliedDamageTotal: 18,
			currentHitPoints: 0,
			isTerminal: true,
			matchedEventCount: 2,
			maxHitPoints: 14,
			summaryLabel: "HP real de Lia: 0/14",
			targetId: "session-character-1",
			targetLabel: "Lia",
		});
	});

	it("fails when a later matching event appears after the target reached zero", () => {
		const result = replayCombatRealHitPoints({
			target: createTarget(),
			eventLedger: [
				createRealDamageEvent({ id: "real-damage-1", damageAmount: 14 }),
				createRealDamageEvent({ id: "real-damage-2", damageAmount: 1 }),
			],
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "REAL_HIT_POINTS_EVENT_AFTER_TERMINAL",
			details: {
				blockedEventId: "real-damage-2",
				currentHitPoints: 0,
				targetId: "session-character-1",
			},
		});
	});

	it("fails when the target is missing", () => {
		const result = replayCombatRealHitPoints({
			target: null,
			eventLedger: [],
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "REAL_HIT_POINTS_TARGET_NOT_FOUND",
		});
	});

	it("fails when the ledger is absent", () => {
		const result = replayCombatRealHitPoints({
			target: createTarget(),
			eventLedger: null,
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "REAL_HIT_POINTS_LEDGER_MISSING",
			details: { targetId: "session-character-1" },
		});
	});

	it("reports schema validation failures as typed Result failures", () => {
		const result = replayCombatRealHitPoints({
			target: { ...createTarget(), maxHitPoints: 0 },
			eventLedger: [],
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error.code).toBe("INVALID_REAL_HIT_POINTS_REPLAY_INPUT");
		expect(result.error.details?.issues).toEqual([
			"target.maxHitPoints: Too small: expected number to be >=1",
		]);
	});

	it("formats root-level validation issues for diagnostics", () => {
		const issue = {
			path: [],
			message: "Root failed",
		} as unknown as ZodIssue;

		expect(formatCombatRealHitPointsReplayIssues([issue])).toEqual([
			"root: Root failed",
		]);
	});
});

function createTarget(
	patch: Partial<NonNullable<CombatRealHitPointsReplayInput["target"]>> = {},
): NonNullable<CombatRealHitPointsReplayInput["target"]> {
	return {
		id: "session-character-1",
		label: "Lia",
		maxHitPoints: 14,
		...patch,
	};
}

function createRealDamageEvent(
	patch: Partial<CombatRealDamageReceivedEvent> = {},
): CombatRealDamageReceivedEvent {
	return {
		id: "real-damage-1",
		type: "realDamageReceived",
		sourceId: "training-guard",
		sourceLabel: "Guarda de Treino",
		targetId: "session-character-1",
		targetLabel: "Lia",
		damageType: "physical",
		damageAmount: 3,
		appliedAffinities: [],
		createdAt: "2026-06-05T19:59:00.000Z",
		message: "Lia recebeu 3 de dano real fisico.",
		...patch,
	};
}
