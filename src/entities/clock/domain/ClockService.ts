import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type ClockId,
	type ClockRecord,
	clockAdvanceInputSchema,
	clockCreateInputSchema,
	clockIdSchema,
	clockSelectSchema,
} from "../model/clockSchema";
import type { ClockFailure } from "../model/clockTypes";
import type { ClockRepository } from "./ClockRepository";

/**
 * @description Manages validated progress clocks without depending on SQLite, Worker RPC, or camp orchestration.
 * @rule docs/system/survival/28-codex-acampamento-descanso-ativo.md - Fortificar Perimetro uses a four-slice group clock.
 */
export class ClockService {
	public constructor(private readonly repository: ClockRepository) {}

	public async createClock(
		input: unknown,
	): Promise<Result<ClockRecord, ClockFailure>> {
		const parsedInput = clockCreateInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return invalidInputFailure(parsedInput.error.issues);
		}

		const saved = await this.repository.save({
			...parsedInput.data,
			currentSlices: 0,
			status: "active",
		});
		if (!saved.success) {
			return fail(saved.error);
		}

		return validateRecord(saved.data);
	}

	public async advanceClock(
		input: unknown,
	): Promise<Result<ClockRecord, ClockFailure>> {
		const parsedInput = clockAdvanceInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return invalidInputFailure(parsedInput.error.issues);
		}

		const found = await this.findValidatedClock(parsedInput.data.clockId);
		if (!found.success) {
			return fail(found.error);
		}

		const nextSlices = found.data.currentSlices + parsedInput.data.slices;
		if (nextSlices > found.data.maxSlices) {
			return fail({
				code: "CLOCK_SLICE_OVERFLOW",
				message: "Clock progress cannot exceed its maximum slices.",
				details: {
					clockId: found.data.id,
					currentSlices: found.data.currentSlices,
					attemptedSlices: parsedInput.data.slices,
					maxSlices: found.data.maxSlices,
				},
			});
		}

		const saved = await this.repository.save({
			...found.data,
			currentSlices: nextSlices,
			status: nextSlices === found.data.maxSlices ? "completed" : "active",
			updatedAt: parsedInput.data.updatedAt,
		});
		if (!saved.success) {
			return fail(saved.error);
		}

		return validateRecord(saved.data);
	}

	public async findClockById(
		id: unknown,
	): Promise<Result<ClockRecord, ClockFailure>> {
		const parsedId = clockIdSchema.safeParse(id);
		if (!parsedId.success) {
			return invalidInputFailure(parsedId.error.issues);
		}

		return this.findValidatedClock(parsedId.data);
	}

	private async findValidatedClock(
		id: ClockId,
	): Promise<Result<ClockRecord, ClockFailure>> {
		const found = await this.repository.findById(id);
		if (!found.success) {
			return fail(found.error);
		}

		return validateRecord(found.data);
	}
}

function validateRecord(
	record: ClockRecord,
): Result<ClockRecord, ClockFailure> {
	const parsedRecord = clockSelectSchema.safeParse(record);
	if (!parsedRecord.success) {
		return fail({
			code: "CORRUPTED_CLOCK_RECORD",
			message: "Clock record failed output validation.",
			details: { issues: formatIssues(parsedRecord.error.issues) },
		});
	}

	return ok(parsedRecord.data);
}

function invalidInputFailure(
	issues: readonly ZodIssue[],
): Result<never, ClockFailure> {
	return fail({
		code: "INVALID_CLOCK_INPUT",
		message: "Clock input does not match the expected contract.",
		details: { issues: formatIssues(issues) },
	});
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
