import { describe, expect, it } from "vitest";
import type { ZodIssue } from "zod/v4";
import type { DamagePipelineResult } from "$lib/shared/damage";
import type { CombatRealDamageReceivedEvent } from "../model/combatRealDamageEvent";
import {
	type CombatRealDamageLedgerUpdateInput,
	createCombatRealDamageLedgerUpdate,
	formatCombatRealDamageLedgerUpdateIssues,
} from "../model/combatRealDamageLedgerUpdate";

const CREATED_AT = "2026-06-05T20:05:00.000Z";

describe("combat real damage ledger update", () => {
	it("appends a real damage event and returns the replayed hit points", () => {
		const input = createUpdateInput({
			incomingDamage: createDamageResult({ finalDamage: 6 }),
		});

		const result = createCombatRealDamageLedgerUpdate(input);

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(input.eventLedger).toEqual([]);
		expect(result.data.event).toMatchObject({
			id: "real-damage-1",
			type: "realDamageReceived",
			targetId: "session-character-1",
			damageAmount: 6,
		});
		expect(result.data.eventLedger).toEqual([result.data.event]);
		expect(result.data.hitPoints).toEqual({
			appliedDamageTotal: 6,
			currentHitPoints: 8,
			isTerminal: false,
			matchedEventCount: 1,
			maxHitPoints: 14,
			summaryLabel: "HP real de Lia: 8/14",
			targetId: "session-character-1",
			targetLabel: "Lia",
		});
		expect(result.data.log).toEqual([
			"Lia recebeu 6 de dano real fisico. Evento registrado; HP real depende de replay aprovado do ledger.",
			"HP real de Lia: 8/14",
		]);
	});

	it("allows the event that reaches zero and returns a terminal replay", () => {
		const result = createCombatRealDamageLedgerUpdate(
			createUpdateInput({
				eventLedger: [
					createRealDamageEvent({
						id: "real-damage-previous",
						damageAmount: 9,
					}),
				],
				incomingDamage: createDamageResult({ finalDamage: 9 }),
			}),
		);

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.hitPoints).toMatchObject({
			appliedDamageTotal: 18,
			currentHitPoints: 0,
			isTerminal: true,
			matchedEventCount: 2,
		});
	});

	it("blocks new damage when replay already reached terminal HP", () => {
		const result = createCombatRealDamageLedgerUpdate(
			createUpdateInput({
				eventLedger: [
					createRealDamageEvent({
						id: "real-damage-terminal",
						damageAmount: 14,
					}),
				],
				incomingDamage: createDamageResult({ finalDamage: 1 }),
			}),
		);

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "REAL_DAMAGE_EVENT_FAILED",
			details: {
				originalFailureCode: "REAL_DAMAGE_TERMINAL_BLOCKED",
				targetId: "session-character-1",
			},
		});
	});

	it("propagates replay failures before attempting to append", () => {
		const result = createCombatRealDamageLedgerUpdate(
			createUpdateInput({
				eventLedger: [
					createRealDamageEvent({
						id: "real-damage-terminal",
						damageAmount: 14,
					}),
					createRealDamageEvent({
						id: "real-damage-after-terminal",
						damageAmount: 1,
					}),
				],
				incomingDamage: createDamageResult({ finalDamage: 1 }),
			}),
		);

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "REAL_DAMAGE_REPLAY_FAILED",
			details: {
				originalFailureCode: "REAL_HIT_POINTS_EVENT_AFTER_TERMINAL",
				targetId: "session-character-1",
			},
		});
	});

	it("wraps a missing replay target without a target id", () => {
		const result = createCombatRealDamageLedgerUpdate(
			createUpdateInput({ target: null }),
		);

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toEqual({
			code: "REAL_DAMAGE_REPLAY_FAILED",
			message: "Real damage ledger update could not replay hit points.",
			details: {
				originalFailureCode: "REAL_HIT_POINTS_TARGET_NOT_FOUND",
			},
		});
	});

	it("wraps event creation failures", () => {
		const result = createCombatRealDamageLedgerUpdate(
			createUpdateInput({ incomingDamage: null }),
		);

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "REAL_DAMAGE_EVENT_FAILED",
			details: {
				originalFailureCode: "REAL_DAMAGE_INVALID_DAMAGE",
				targetId: "session-character-1",
			},
		});
	});

	it("wraps a replay failure caused by the appended event exceeding the ledger limit", () => {
		const eventLedger = Array.from({ length: 1000 }, (_, index) =>
			createRealDamageEvent({
				id: `unrelated-damage-${index}`,
				targetId: "unrelated-target",
			}),
		);

		const result = createCombatRealDamageLedgerUpdate(
			createUpdateInput({ eventLedger }),
		);

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "REAL_DAMAGE_REPLAY_FAILED",
			details: {
				originalFailureCode: "INVALID_REAL_HIT_POINTS_REPLAY_INPUT",
				targetId: "session-character-1",
			},
		});
	});

	it("reports schema validation failures as typed Result failures", () => {
		const result = createCombatRealDamageLedgerUpdate({
			...createUpdateInput(),
			eventId: "",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error.code).toBe("INVALID_REAL_DAMAGE_LEDGER_UPDATE_INPUT");
		expect(result.error.details?.issues).toEqual([
			"eventId: Invalid string: must match pattern /^[a-z][a-z0-9-]*$/",
		]);
	});

	it("formats root-level validation issues for diagnostics", () => {
		const issue = {
			path: [],
			message: "Root failed",
		} as unknown as ZodIssue;

		expect(formatCombatRealDamageLedgerUpdateIssues([issue])).toEqual([
			"root: Root failed",
		]);
	});
});

function createUpdateInput(
	patch: Partial<CombatRealDamageLedgerUpdateInput> = {},
): CombatRealDamageLedgerUpdateInput {
	return {
		createdAt: CREATED_AT,
		eventId: "real-damage-1",
		eventLedger: [],
		incomingDamage: createDamageResult({ finalDamage: 6 }),
		source: { id: "training-guard", label: "Guarda de Treino" },
		target: { id: "session-character-1", label: "Lia", maxHitPoints: 14 },
		...patch,
	};
}

function createRealDamageEvent(
	patch: Partial<CombatRealDamageReceivedEvent> = {},
): CombatRealDamageReceivedEvent {
	return {
		id: "real-damage-previous",
		type: "realDamageReceived",
		sourceId: "training-guard",
		sourceLabel: "Guarda de Treino",
		targetId: "session-character-1",
		targetLabel: "Lia",
		damageType: "physical",
		damageAmount: 3,
		appliedAffinities: [],
		createdAt: "2026-06-05T20:04:00.000Z",
		message: "Lia recebeu 3 de dano real fisico.",
		...patch,
	};
}

function createDamageResult(input: {
	readonly finalDamage: number;
}): DamagePipelineResult {
	return {
		damageType: "physical",
		baseDamage: input.finalDamage,
		afterCritical: input.finalDamage,
		afterReduction: input.finalDamage,
		finalDamage: input.finalDamage,
		appliedAffinities: [],
		breakdown: {
			baseDiceTotal: 4,
			matrixValue: 2,
			extraModifierTotal: 0,
			criticalMultiplier: 1,
			damageReduction: 0,
			vulnerabilityBonusDamage: 0,
		},
	};
}
