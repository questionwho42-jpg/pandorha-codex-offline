import { describe, expect, it } from "vitest";
import { fail as resultFail } from "$lib/shared/lib/result";
import type { SocialConflictState, SocialTarget } from "../../model-api";
import {
	type NegotiationRoundInput,
	NegotiationService,
} from "../NegotiationService";

describe("NegotiationService", () => {
	const dummyTarget = (): SocialTarget => ({
		id: "merchant",
		label: "Mercador",
		tier: 2,
		mentalStat: 10,
		resistanceStat: 10,
		attitude: "neutral",
		patience: { baseValue: 20, currentValue: 20 },
		persuasion: { totalSegments: 5, completedSegments: 0 },
		fatigueCounters: {},
	});

	const dummyConflictState = (): SocialConflictState => ({
		id: "conflict-1",
		participantIds: ["hero", "merchant"],
		currentRound: 1,
		maxRounds: 5,
		bargainOffers: [],
	});

	const service = new NegotiationService();

	it("advances persuasion track by 1 segment on standard success", () => {
		const target = dummyTarget();
		const input: NegotiationRoundInput = {
			oratorId: "hero",
			axis: "social",
			rollValue: 15,
			dc: 15, // Margin = 0 (Standard Success)
			maneuver: "none",
			target,
			conflictState: dummyConflictState(),
			events: [],
		};

		const result = service.resolveRound(input);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.target.persuasion.completedSegments).toBe(1);
			expect(result.data.target.patience.currentValue).toBe(20); // No patience damage
			expect(result.data.isCompleted).toBe(false);
			expect(result.data.isFailed).toBe(false);
		}
	});

	it("advances persuasion track by 2 segments on critical success", () => {
		const target = dummyTarget();
		const input: NegotiationRoundInput = {
			oratorId: "hero",
			axis: "social",
			rollValue: 20,
			dc: 15, // Margin = 5 (Critical Success)
			maneuver: "none",
			target,
			conflictState: dummyConflictState(),
			events: [],
		};

		const result = service.resolveRound(input);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.target.persuasion.completedSegments).toBe(2);
			expect(result.data.target.patience.currentValue).toBe(15); // Critical success margin 5 reduces patience by 5
		}
	});

	it("reduces patience reserve by the absolute margin on failure", () => {
		const target = dummyTarget();
		const input: NegotiationRoundInput = {
			oratorId: "hero",
			axis: "social",
			rollValue: 12,
			dc: 15, // Margin = -3 (Failure)
			maneuver: "none",
			target,
			conflictState: dummyConflictState(),
			events: [],
		};

		const result = service.resolveRound(input);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.target.persuasion.completedSegments).toBe(0);
			expect(result.data.target.patience.currentValue).toBe(17); // 20 - 3 = 17
		}
	});

	it("applies social fatigue penalty of -2 when using the same axis in consecutive rounds", () => {
		const target = dummyTarget();
		const firstInput: NegotiationRoundInput = {
			oratorId: "hero",
			axis: "social",
			rollValue: 15,
			dc: 15, // Margin = 0
			maneuver: "none",
			target,
			conflictState: dummyConflictState(),
			events: [],
		};

		const firstResult = service.resolveRound(firstInput);
		expect(firstResult.success).toBe(true);
		if (firstResult.success) {
			const secondInput: NegotiationRoundInput = {
				oratorId: "hero",
				axis: "social", // Same axis!
				rollValue: 15,
				dc: 15, // Should become margin = -2 due to social fatigue
				maneuver: "none",
				target: firstResult.data.target,
				conflictState: firstResult.data.conflictState,
				events: firstResult.data.events,
			};

			const secondResult = service.resolveRound(secondInput);
			expect(secondResult.success).toBe(true);
			if (secondResult.success) {
				// Margin -2 means failure, reduces patience by 2
				expect(secondResult.data.target.patience.currentValue).toBe(18);
				expect(secondResult.data.target.persuasion.completedSegments).toBe(1); // Didn't increase
			}
		}
	});

	it("applies Venomous Flattery to grant +2 to margin", () => {
		const target = dummyTarget();
		const input: NegotiationRoundInput = {
			oratorId: "hero",
			axis: "social",
			rollValue: 13,
			dc: 15, // Margin: -2 + 2 = 0 (Standard Success)
			maneuver: "venomous_flattery",
			target,
			conflictState: dummyConflictState(),
			events: [],
		};

		const result = service.resolveRound(input);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.target.persuasion.completedSegments).toBe(1);
			expect(result.data.target.patience.currentValue).toBe(20);
		}
	});

	it("applies Mystic Charm to set target attitude to friendly", () => {
		const target = dummyTarget();
		const input: NegotiationRoundInput = {
			oratorId: "hero",
			axis: "social",
			rollValue: 15,
			dc: 15,
			maneuver: "mystic_charm",
			target,
			conflictState: dummyConflictState(),
			events: [],
		};

		const result = service.resolveRound(input);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.target.attitude).toBe("friendly");
		}
	});

	it("applies Group Sense to generate a favor offer if margin >= 2", () => {
		const target = dummyTarget();
		const input: NegotiationRoundInput = {
			oratorId: "hero",
			axis: "social",
			rollValue: 17,
			dc: 15, // Margin = 2
			maneuver: "group_sense",
			target,
			conflictState: dummyConflictState(),
			events: [],
		};

		const result = service.resolveRound(input);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.conflictState.bargainOffers).toHaveLength(1);
			expect(result.data.conflictState.bargainOffers[0]?.type).toBe("favor");
		}
	});

	describe("Ether Contract", () => {
		it("applies Ether Contract to grant +4 bonus to margin on success", () => {
			const target = dummyTarget();
			const input: NegotiationRoundInput = {
				oratorId: "hero",
				axis: "social",
				rollValue: 11,
				dc: 15, // Margin: -4 + 4 = 0 (Standard Success)
				maneuver: "ether_contract",
				target,
				conflictState: dummyConflictState(),
				events: [],
			};

			const result = service.resolveRound(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.target.persuasion.completedSegments).toBe(1);
				expect(result.data.target.patience.currentValue).toBe(20);
				expect(result.data.recoilDamage).toBe(false);
			}
		});

		it("triggers recoilDamage flag and log message on failed Ether Contract", () => {
			const target = dummyTarget();
			const input: NegotiationRoundInput = {
				oratorId: "hero",
				axis: "social",
				rollValue: 10,
				dc: 15, // Margin: -5 + 4 = -1 (Failure)
				maneuver: "ether_contract",
				target,
				conflictState: dummyConflictState(),
				events: [],
			};

			const result = service.resolveRound(input);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.target.persuasion.completedSegments).toBe(0);
				expect(result.data.target.patience.currentValue).toBe(19); // Reduces by 1
				expect(result.data.recoilDamage).toBe(true); // Pact broken!
				expect(result.data.logMessage).toContain("💥 VIOLAÇÃO DE PACTO!");
			}
		});
	});

	it("retorna falha se a paciencia inicial do target ja for menor ou igual a zero", () => {
		const target = dummyTarget();
		target.patience.currentValue = 0;
		const input: NegotiationRoundInput = {
			oratorId: "hero",
			axis: "social",
			rollValue: 15,
			dc: 15,
			maneuver: "none",
			target,
			conflictState: dummyConflictState(),
			events: [],
		};

		const result = service.resolveRound(input);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("PATIENCE_EXHAUSTED");
		}
	});

	it("retorna erro de negociacao se o servico de combate social falhar", async () => {
		const { SocialCombatService } = await import("../SocialCombatService");

		class FailSocialCombatService extends SocialCombatService {
			public override applyArgument() {
				return resultFail({
					code: "INVALID_ARGUMENT" as const,
					message: "Erro de teste simulado de combate social",
				});
			}
		}
		const failCombatService = new FailSocialCombatService({
			now: () => new Date().toISOString(),
		});
		const failService = new NegotiationService(failCombatService);

		const target = dummyTarget();
		const input: NegotiationRoundInput = {
			oratorId: "hero",
			axis: "social",
			rollValue: 15,
			dc: 15,
			maneuver: "none",
			target,
			conflictState: dummyConflictState(),
			events: [],
		};

		const result = failService.resolveRound(input);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("NEGOTIATION_ERROR");
			expect(result.error.message).toBe(
				"Erro de teste simulado de combate social",
			);
		}
	});

	it("should initialize correctly when passing a custom clock object instead of SocialCombatService", () => {
		const customClock = { now: () => "2026-06-11T12:00:00Z" };
		const customService = new NegotiationService(customClock);
		expect(customService).toBeDefined();
	});

	it("does not apply social fatigue penalty when consecutive rounds use different axes", () => {
		const target = dummyTarget();
		const firstInput: NegotiationRoundInput = {
			oratorId: "hero",
			axis: "social",
			rollValue: 15,
			dc: 15,
			maneuver: "none",
			target,
			conflictState: dummyConflictState(),
			events: [],
		};

		const firstResult = service.resolveRound(firstInput);
		expect(firstResult.success).toBe(true);
		if (firstResult.success) {
			const secondInput: NegotiationRoundInput = {
				oratorId: "hero",
				axis: "mental",
				rollValue: 15,
				dc: 15,
				maneuver: "none",
				target: firstResult.data.target,
				conflictState: firstResult.data.conflictState,
				events: firstResult.data.events,
			};

			const secondResult = service.resolveRound(secondInput);
			expect(secondResult.success).toBe(true);
			if (secondResult.success) {
				expect(secondResult.data.target.persuasion.completedSegments).toBe(2);
				expect(secondResult.data.target.patience.currentValue).toBe(20);
			}
		}
	});
});
