import { describe, expect, it } from "vitest";
import type { ZodIssue } from "zod/v4";
import type { DamagePipelineResult } from "$lib/shared/damage";
import {
	type CombatRealDamageEventInput,
	type CombatRealDamageReceivedEvent,
	createCombatRealDamageReceivedEvent,
	formatCombatRealDamageEventIssues,
} from "../model/combatRealDamageEvent";

const CREATED_AT = "2026-06-05T18:45:00.000Z";

describe("combat real damage event contract", () => {
	it("appends a real damage received event without mutating hit points", () => {
		const existingLedger: readonly CombatRealDamageReceivedEvent[] = [
			createExistingEvent(),
		];

		const result = createCombatRealDamageReceivedEvent({
			...createInput(),
			eventLedger: existingLedger,
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(existingLedger).toEqual([createExistingEvent()]);
		expect(result.data.event).toEqual({
			id: "real-damage-2",
			type: "realDamageReceived",
			sourceId: "training-guard",
			sourceLabel: "Guarda de Treino",
			targetId: "session-character-1",
			targetLabel: "Lia",
			damageType: "physical",
			damageAmount: 6,
			appliedAffinities: [],
			createdAt: CREATED_AT,
			message:
				"Lia recebeu 6 de dano real fisico. Evento registrado; HP real depende de replay aprovado do ledger.",
		});
		expect(result.data.eventLedger).toEqual([
			createExistingEvent(),
			result.data.event,
		]);
		expect(result.data.log).toEqual([
			"Lia recebeu 6 de dano real fisico. Evento registrado; HP real depende de replay aprovado do ledger.",
		]);
		expect("currentHitPoints" in result.data.event).toBe(false);
		expect("nextHitPoints" in result.data.event).toBe(false);
	});

	it("keeps non-physical damage labels technical until official copy exists", () => {
		const result = createCombatRealDamageReceivedEvent({
			...createInput(),
			incomingDamage: createDamageResult({
				damageType: "fire",
				finalDamage: 4,
			}),
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.event).toMatchObject({
			damageType: "fire",
			damageAmount: 4,
			message:
				"Lia recebeu 4 de dano real fire. Evento registrado; HP real depende de replay aprovado do ledger.",
		});
	});

	it("fails when the real damage target is missing", () => {
		const result = createCombatRealDamageReceivedEvent({
			...createInput(),
			target: null,
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "REAL_DAMAGE_TARGET_NOT_FOUND",
			details: { sourceId: "training-guard" },
		});
	});

	it("fails when the real damage ledger is absent", () => {
		const result = createCombatRealDamageReceivedEvent({
			...createInput(),
			eventLedger: null,
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "REAL_DAMAGE_LEDGER_MISSING",
			details: { targetId: "session-character-1" },
		});
	});

	it("fails when the incoming damage is absent or zero", () => {
		const missingDamage = createCombatRealDamageReceivedEvent({
			...createInput(),
			incomingDamage: null,
		});
		const zeroDamage = createCombatRealDamageReceivedEvent({
			...createInput(),
			incomingDamage: createDamageResult({ finalDamage: 0 }),
		});

		expect(missingDamage.success).toBe(false);
		if (!missingDamage.success) {
			expect(missingDamage.error).toMatchObject({
				code: "REAL_DAMAGE_INVALID_DAMAGE",
				details: { targetId: "session-character-1" },
			});
		}
		expect(zeroDamage.success).toBe(false);
		if (!zeroDamage.success) {
			expect(zeroDamage.error).toMatchObject({
				code: "REAL_DAMAGE_INVALID_DAMAGE",
				details: { finalDamage: 0, targetId: "session-character-1" },
			});
		}
	});

	it("blocks the real damage event when the target is already terminal", () => {
		const input = createInput();
		const result = createCombatRealDamageReceivedEvent({
			...input,
			target: {
				id: "session-character-1",
				label: "Lia",
				currentHitPoints: 0,
				maxHitPoints: 14,
				isTerminal: true,
			},
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "REAL_DAMAGE_TERMINAL_BLOCKED",
			details: {
				currentHitPoints: 0,
				isTerminal: true,
				targetId: "session-character-1",
			},
		});
	});

	it("blocks the real damage event when hit points already reached zero", () => {
		const result = createCombatRealDamageReceivedEvent({
			...createInput(),
			target: {
				id: "session-character-1",
				label: "Lia",
				currentHitPoints: 0,
				maxHitPoints: 14,
				isTerminal: false,
			},
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error).toMatchObject({
			code: "REAL_DAMAGE_TERMINAL_BLOCKED",
			details: {
				currentHitPoints: 0,
				isTerminal: false,
				targetId: "session-character-1",
			},
		});
	});

	it("reports schema validation failures as typed Result failures", () => {
		const result = createCombatRealDamageReceivedEvent({
			...createInput(),
			eventId: "",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error.code).toBe("INVALID_REAL_DAMAGE_EVENT_INPUT");
		expect(result.error.details?.issues).toEqual([
			"eventId: Invalid string: must match pattern /^[a-z][a-z0-9-]*$/",
		]);
	});

	it("formats root-level validation issues for diagnostics", () => {
		const issue = {
			path: [],
			message: "Root failed",
		} as unknown as ZodIssue;

		expect(formatCombatRealDamageEventIssues([issue])).toEqual([
			"root: Root failed",
		]);
	});
});

function createInput(): CombatRealDamageEventInput {
	return {
		eventId: "real-damage-2",
		createdAt: CREATED_AT,
		source: { id: "training-guard", label: "Guarda de Treino" },
		target: {
			id: "session-character-1",
			label: "Lia",
			currentHitPoints: 14,
			maxHitPoints: 14,
			isTerminal: false,
		},
		incomingDamage: createDamageResult({ finalDamage: 6 }),
		eventLedger: [],
	};
}

function createExistingEvent(): CombatRealDamageReceivedEvent {
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
		createdAt: "2026-06-05T18:44:00.000Z",
		message:
			"Lia recebeu 3 de dano real fisico. Evento registrado; HP real depende de replay aprovado do ledger.",
	};
}

function createDamageResult(input: {
	readonly damageType?: string;
	readonly finalDamage: number;
}): DamagePipelineResult {
	return {
		damageType: input.damageType ?? "physical",
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
