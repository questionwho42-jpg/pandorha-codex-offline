import { describe, expect, it } from "vitest";
import type { ClockFailure, ClockRecord } from "$lib/entities/clock";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { SocialRetaliationClockService } from "../domain/SocialRetaliationClockService";

describe("SocialRetaliationClockService", () => {
	it("allows explicit social-pressure triggers to reach the clock advancement path", () => {
		const service = new SocialRetaliationClockService(
			new FakeRetaliationClockPort([]),
		);

		const result = service.decideAdvanceGate({
			cause: "social-pressure",
			triggerId: "social-pressure-social-encounter-primary",
			triggeredAt: "2026-06-01T10:00:00.000Z",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data).toEqual({
			allowed: true,
			cause: "social-pressure",
			nextAction: "advance-from-trigger",
			reason:
				"Pressão social explícita pode avançar clocks de retaliação social.",
			triggerId: "social-pressure-social-encounter-primary",
		});
	});

	it("blocks automatic social retaliation advancement until official rules exist", () => {
		const service = new SocialRetaliationClockService(
			new FakeRetaliationClockPort([]),
		);

		for (const cause of [
			"long-rest",
			"elapsed-time",
			"social-scene",
			"manual-player-action",
		] as const) {
			const result = service.decideAdvanceGate({
				cause,
				triggerId: `${cause}-candidate`,
				triggeredAt: "2026-06-01T10:05:00.000Z",
			});

			expect(result.success).toBe(true);
			if (!result.success) {
				return;
			}

			expect(result.data).toMatchObject({
				allowed: false,
				cause,
				nextAction: "wait-for-official-rule",
				triggerId: `${cause}-candidate`,
			});
			expect(result.data.reason).toContain("sem regra oficial");
		}
	});

	it("rejects malformed advance gate input", () => {
		const result = new SocialRetaliationClockService(
			new FakeRetaliationClockPort([]),
		).decideAdvanceGate({
			cause: "downtime",
			triggerId: "",
			triggeredAt: "not-a-date",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("INVALID_SOCIAL_RETALIATION_CLOCK_INPUT");
		expect(result.error.details).toMatchObject({
			issues: expect.arrayContaining([
				expect.stringMatching(/^cause:/),
				expect.stringMatching(/^triggerId:/),
				expect.stringMatching(/^triggeredAt:/),
			]),
		});
	});

	it("advances active social-pressure clocks from one explicit trigger", async () => {
		const port = new FakeRetaliationClockPort([
			buildClock({ id: "retaliation-training-merchant-league-primary" }),
			buildClock({
				id: "camp-watch",
				label: "Vigilia",
				source: "camp",
			}),
		]);

		const result = await new SocialRetaliationClockService(
			port,
		).advanceFromTrigger({
			appliedTriggerIds: [],
			clocks: port.records,
			slices: 1,
			triggerId: "social-pressure-follow-up-001",
			triggeredAt: "2026-05-26T21:00:00.000Z",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(port.advanceCalls).toEqual([
			{
				clockId: "retaliation-training-merchant-league-primary",
				slices: 1,
				updatedAt: "2026-05-26T21:00:00.000Z",
			},
		]);
		expect(result.data.advancedClocks).toMatchObject([
			{
				id: "retaliation-training-merchant-league-primary",
				currentSlices: 1,
				source: "social-pressure",
				status: "active",
			},
		]);
		expect(
			result.data.clocks.find((clock) => clock.id === "camp-watch"),
		).toMatchObject({
			currentSlices: 0,
			source: "camp",
		});
		expect(result.data.appliedTriggerIds).toEqual([
			"social-pressure-follow-up-001",
		]);
		expect(result.data.events).toEqual([
			{
				clockId: "retaliation-training-merchant-league-primary",
				createdAt: "2026-05-26T21:00:00.000Z",
				message:
					"Retaliação: Liga Mercante de Treino avançou 1 fatia por pressão social.",
				type: "social-retaliation-clock-advanced",
			},
		]);
	});

	it("is idempotent for an already applied trigger", async () => {
		const clock = buildClock({ currentSlices: 2 });
		const port = new FakeRetaliationClockPort([clock]);

		const result = await new SocialRetaliationClockService(
			port,
		).advanceFromTrigger({
			appliedTriggerIds: ["social-pressure-follow-up-001"],
			clocks: [clock],
			slices: 1,
			triggerId: "social-pressure-follow-up-001",
			triggeredAt: "2026-05-26T21:00:00.000Z",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(port.advanceCalls).toEqual([]);
		expect(result.data.clocks).toEqual([clock]);
		expect(result.data.advancedClocks).toEqual([]);
		expect(result.data.appliedTriggerIds).toEqual([
			"social-pressure-follow-up-001",
		]);
		expect(result.data.events).toEqual([
			{
				createdAt: "2026-05-26T21:00:00.000Z",
				message:
					"Gatilho de retaliação social social-pressure-follow-up-001 já foi aplicado.",
				triggerId: "social-pressure-follow-up-001",
				type: "social-retaliation-trigger-skipped",
			},
		]);
	});

	it("completes a retaliation clock at its final slice", async () => {
		const port = new FakeRetaliationClockPort([
			buildClock({ currentSlices: 3, maxSlices: 4 }),
		]);

		const result = await new SocialRetaliationClockService(
			port,
		).advanceFromTrigger({
			appliedTriggerIds: [],
			clocks: port.records,
			slices: 1,
			triggerId: "social-pressure-follow-up-002",
			triggeredAt: "2026-05-26T21:10:00.000Z",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data.advancedClocks[0]).toMatchObject({
			currentSlices: 4,
			status: "completed",
		});
	});

	it("records an explicit trigger when there are no active social-pressure targets", async () => {
		const campClock = buildClock({
			id: "camp-watch",
			label: "Vigilia",
			source: "camp",
		});
		const completedRetaliationClock = buildClock({
			id: "retaliation-training-merchant-league-complete",
			currentSlices: 4,
			status: "completed",
		});
		const port = new FakeRetaliationClockPort([
			campClock,
			completedRetaliationClock,
		]);

		const result = await new SocialRetaliationClockService(
			port,
		).advanceFromTrigger({
			appliedTriggerIds: [],
			clocks: port.records,
			slices: 1,
			triggerId: "social-pressure-follow-up-005",
			triggeredAt: "2026-05-26T21:25:00.000Z",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(port.advanceCalls).toEqual([]);
		expect(result.data.clocks).toEqual([campClock, completedRetaliationClock]);
		expect(result.data.appliedTriggerIds).toEqual([
			"social-pressure-follow-up-005",
		]);
		expect(result.data.events).toEqual([
			{
				createdAt: "2026-05-26T21:25:00.000Z",
				message:
					"Gatilho de retaliação social social-pressure-follow-up-005 não encontrou clocks ativos.",
				triggerId: "social-pressure-follow-up-005",
				type: "social-retaliation-trigger-had-no-targets",
			},
		]);
	});

	it("formats plural slice progress for larger explicit triggers", async () => {
		const port = new FakeRetaliationClockPort([buildClock()]);

		const result = await new SocialRetaliationClockService(
			port,
		).advanceFromTrigger({
			appliedTriggerIds: [],
			clocks: port.records,
			slices: 2,
			triggerId: "social-pressure-follow-up-006",
			triggeredAt: "2026-05-26T21:30:00.000Z",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data.events[0]?.message).toBe(
			"Retaliação: Liga Mercante de Treino avançou 2 fatias por pressão social.",
		);
	});

	it("fails before writing when a trigger would overflow any target clock", async () => {
		const port = new FakeRetaliationClockPort([
			buildClock({ currentSlices: 3, maxSlices: 4 }),
		]);

		const result = await new SocialRetaliationClockService(
			port,
		).advanceFromTrigger({
			appliedTriggerIds: [],
			clocks: port.records,
			slices: 2,
			triggerId: "social-pressure-follow-up-003",
			triggeredAt: "2026-05-26T21:15:00.000Z",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("SOCIAL_RETALIATION_CLOCK_OVERFLOW");
		expect(port.advanceCalls).toEqual([]);
	});

	it("wraps clock port failures in a typed failure", async () => {
		const port = new FakeRetaliationClockPort([buildClock()]);
		port.failNextAdvance({
			code: "CLOCK_REPOSITORY_WRITE_FAILED",
			message: "Clock storage write failed.",
		});

		const result = await new SocialRetaliationClockService(
			port,
		).advanceFromTrigger({
			appliedTriggerIds: [],
			clocks: port.records,
			slices: 1,
			triggerId: "social-pressure-follow-up-004",
			triggeredAt: "2026-05-26T21:20:00.000Z",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("SOCIAL_RETALIATION_CLOCK_ADVANCE_FAILED");
		expect(result.error.details).toMatchObject({
			clockId: "retaliation-training-merchant-league-primary",
		});
	});

	it("rejects malformed trigger input", async () => {
		const result = await new SocialRetaliationClockService(
			new FakeRetaliationClockPort([]),
		).advanceFromTrigger({
			appliedTriggerIds: [],
			clocks: [],
			slices: 0,
			triggerId: "",
			triggeredAt: "not-a-date",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("INVALID_SOCIAL_RETALIATION_CLOCK_INPUT");
	});

	it("reports root validation issues for non-object trigger input", async () => {
		const result = await new SocialRetaliationClockService(
			new FakeRetaliationClockPort([]),
		).advanceFromTrigger(null);

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}

		expect(result.error.code).toBe("INVALID_SOCIAL_RETALIATION_CLOCK_INPUT");
		expect(result.error.details).toMatchObject({
			issues: [expect.stringMatching(/^root:/)],
		});
	});
});

interface AdvanceCall {
	readonly clockId: string;
	readonly slices: number;
	readonly updatedAt: string;
}

class FakeRetaliationClockPort {
	public records: readonly ClockRecord[];
	public readonly advanceCalls: AdvanceCall[] = [];
	private nextFailure: ClockFailure | null = null;

	public constructor(records: readonly ClockRecord[]) {
		this.records = records;
	}

	public async advanceClock(
		input: AdvanceCall,
	): Promise<Result<ClockRecord, ClockFailure>> {
		this.advanceCalls.push(input);
		if (this.nextFailure) {
			const failure = this.nextFailure;
			this.nextFailure = null;
			return fail(failure);
		}

		const clock = this.records.find((record) => record.id === input.clockId);
		if (!clock) {
			return fail({
				code: "CLOCK_NOT_FOUND",
				message: "Clock was not found in fake port.",
			});
		}

		const currentSlices = clock.currentSlices + input.slices;
		const advanced = {
			...clock,
			currentSlices,
			status: currentSlices === clock.maxSlices ? "completed" : "active",
			updatedAt: input.updatedAt,
		} satisfies ClockRecord;
		this.records = replaceClock(this.records, advanced);
		return ok(advanced);
	}

	public failNextAdvance(failure: ClockFailure): void {
		this.nextFailure = failure;
	}
}

function replaceClock(
	clocks: readonly ClockRecord[],
	advancedClock: ClockRecord,
): readonly ClockRecord[] {
	return clocks.map((clock) =>
		clock.id === advancedClock.id ? advancedClock : clock,
	);
}

function buildClock(patch: Partial<ClockRecord> = {}): ClockRecord {
	return {
		id: "retaliation-training-merchant-league-primary",
		label: "Retaliação: Liga Mercante de Treino",
		currentSlices: 0,
		maxSlices: 4,
		status: "active",
		source: "social-pressure",
		createdAt: "2026-05-26T20:00:00.000Z",
		updatedAt: "2026-05-26T20:00:00.000Z",
		...patch,
	};
}
