import type { ZodIssue } from "zod/v4";
import type { ClockRecord } from "$lib/entities/clock";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type ParsedSocialRetaliationClockAdvanceInput,
	socialRetaliationClockAdvanceInputSchema,
} from "../model/socialRetaliationClockSchemas";
import type {
	SocialRetaliationClockAdvanceResult,
	SocialRetaliationClockEvent,
	SocialRetaliationClockFailure,
	SocialRetaliationClockProgressPort,
} from "../model/socialRetaliationClockTypes";

/**
 * @description Advances only social-pressure retaliation clocks from explicit, caller-owned triggers.
 * @rule docs/process/vertical-slice-qa.md - T66-T70 pressure consequences create saved retaliation clocks but do not advance them automatically.
 */
export class SocialRetaliationClockService {
	public constructor(
		private readonly clockPort: SocialRetaliationClockProgressPort,
	) {}

	public async advanceFromTrigger(
		input: unknown,
	): Promise<
		Result<SocialRetaliationClockAdvanceResult, SocialRetaliationClockFailure>
	> {
		const parsedInput =
			socialRetaliationClockAdvanceInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return fail({
				code: "INVALID_SOCIAL_RETALIATION_CLOCK_INPUT",
				message: "Social retaliation clock input failed validation.",
				details: { issues: formatIssues(parsedInput.error.issues) },
			});
		}

		const inputData = parsedInput.data;
		if (inputData.appliedTriggerIds.includes(inputData.triggerId)) {
			return ok(createSkippedResult(inputData));
		}

		const targetClocks = inputData.clocks.filter(isActiveSocialPressureClock);
		if (targetClocks.length === 0) {
			return ok(createNoTargetsResult(inputData));
		}

		const overflow = targetClocks.find(
			(clock) => clock.currentSlices + inputData.slices > clock.maxSlices,
		);
		if (overflow) {
			return fail({
				code: "SOCIAL_RETALIATION_CLOCK_OVERFLOW",
				message: "Social retaliation trigger would exceed a clock limit.",
				details: {
					clockId: overflow.id,
					currentSlices: overflow.currentSlices,
					attemptedSlices: inputData.slices,
					maxSlices: overflow.maxSlices,
				},
			});
		}

		return this.advanceTargetClocks(inputData, targetClocks);
	}

	private async advanceTargetClocks(
		input: ParsedSocialRetaliationClockAdvanceInput,
		targetClocks: readonly ClockRecord[],
	): Promise<
		Result<SocialRetaliationClockAdvanceResult, SocialRetaliationClockFailure>
	> {
		let clocks: readonly ClockRecord[] = input.clocks;
		const advancedClocks: ClockRecord[] = [];
		const events: SocialRetaliationClockEvent[] = [];

		for (const clock of targetClocks) {
			const advanced = await this.clockPort.advanceClock({
				clockId: clock.id,
				slices: input.slices,
				updatedAt: input.triggeredAt,
			});
			if (!advanced.success) {
				return fail({
					code: "SOCIAL_RETALIATION_CLOCK_ADVANCE_FAILED",
					message: "Social retaliation clock could not be advanced.",
					details: { clockId: clock.id, failure: advanced.error },
				});
			}

			clocks = replaceClock(clocks, advanced.data);
			advancedClocks.push(advanced.data);
			events.push(createAdvancedEvent(advanced.data, input));
		}

		return ok({
			clocks,
			advancedClocks,
			appliedTriggerIds: [...input.appliedTriggerIds, input.triggerId],
			events,
		});
	}
}

function createSkippedResult(
	input: ParsedSocialRetaliationClockAdvanceInput,
): SocialRetaliationClockAdvanceResult {
	return {
		clocks: input.clocks,
		advancedClocks: [],
		appliedTriggerIds: input.appliedTriggerIds,
		events: [
			{
				type: "social-retaliation-trigger-skipped",
				triggerId: input.triggerId,
				message: `Gatilho de retaliação social ${input.triggerId} já foi aplicado.`,
				createdAt: input.triggeredAt,
			},
		],
	};
}

function createNoTargetsResult(
	input: ParsedSocialRetaliationClockAdvanceInput,
): SocialRetaliationClockAdvanceResult {
	return {
		clocks: input.clocks,
		advancedClocks: [],
		appliedTriggerIds: [...input.appliedTriggerIds, input.triggerId],
		events: [
			{
				type: "social-retaliation-trigger-had-no-targets",
				triggerId: input.triggerId,
				message: `Gatilho de retaliação social ${input.triggerId} não encontrou clocks ativos.`,
				createdAt: input.triggeredAt,
			},
		],
	};
}

function createAdvancedEvent(
	clock: ClockRecord,
	input: ParsedSocialRetaliationClockAdvanceInput,
): SocialRetaliationClockEvent {
	return {
		type: "social-retaliation-clock-advanced",
		clockId: clock.id,
		message: `${clock.label} avançou ${input.slices} ${formatSliceLabel(input.slices)} por pressão social.`,
		createdAt: input.triggeredAt,
	};
}

function isActiveSocialPressureClock(clock: ClockRecord): boolean {
	return clock.source === "social-pressure" && clock.status === "active";
}

function replaceClock(
	clocks: readonly ClockRecord[],
	advancedClock: ClockRecord,
): readonly ClockRecord[] {
	return clocks.map((clock) =>
		clock.id === advancedClock.id ? advancedClock : clock,
	);
}

function formatSliceLabel(slices: number): string {
	return slices === 1 ? "fatia" : "fatias";
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
