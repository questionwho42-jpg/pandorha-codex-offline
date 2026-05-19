import type {
	CampActivityId,
	CampActivityRecord,
} from "$lib/entities/camp-activity";
import type { CampSessionRecord } from "$lib/entities/camp-session";
import type { ClockRecord } from "$lib/entities/clock";
import { PANDORHA_RULES } from "$lib/shared/game-rules";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	campHourInputSchema,
	formatCampHourIssues,
	type ParsedCampHourInput,
} from "../model/campHourSchemas";
import type {
	CampClockProgressPort,
	CampHourEvent,
	CampHourFailure,
	CampHourResult,
} from "../model/campHourTypes";

/**
 * @description Resolves one deterministic camp hour without rolls, events, persistence, or UI state.
 * @rule docs/system/survival/28-codex-acampamento-descanso-ativo.md - camp activity phase advances danger and group clocks.
 */
export class CampHourService {
	public constructor(private readonly clockPort: CampClockProgressPort) {}

	public async resolveHour(
		input: unknown,
	): Promise<Result<CampHourResult, CampHourFailure>> {
		const parsedInput = campHourInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return fail({
				code: "INVALID_CAMP_HOUR_INPUT",
				message: "Camp hour input failed validation.",
				details: { issues: formatCampHourIssues(parsedInput.error.issues) },
			});
		}

		const inputData = parsedInput.data;
		if (inputData.session.status !== "planning") {
			return fail({
				code: "CAMP_SESSION_NOT_PLANNING",
				message: "Camp hour can only be resolved from planning state.",
				details: { sessionId: inputData.session.id },
			});
		}

		const activitiesById = new Map(
			inputData.activities.map((activity) => [activity.id, activity]),
		);
		const checked = validateAssignments(inputData, activitiesById);
		if (!checked.success) {
			return fail(checked.error);
		}

		const clockResult = await advanceFortifyClockIfNeeded(
			inputData,
			this.clockPort,
			checked.data.fortifyAssignmentCount,
		);
		if (!clockResult.success) {
			return fail(clockResult.error);
		}

		return ok(createResult(inputData, checked.data, clockResult.data));
	}
}

interface AssignmentValidationResult {
	readonly watchCoverageMaintained: boolean;
	readonly fortifyAssignmentCount: number;
	readonly actionEvents: readonly CampHourEvent[];
}

function validateAssignments(
	input: ParsedCampHourInput,
	activitiesById: ReadonlyMap<CampActivityId, CampActivityRecord>,
): Result<AssignmentValidationResult, CampHourFailure> {
	const assignedCharacterIds = new Set<string>();
	const actionEvents: CampHourEvent[] = [];
	let watchCoverageMaintained = false;
	let fortifyAssignmentCount = 0;

	for (const assignment of input.assignments) {
		if (assignment.sessionId !== input.session.id) {
			return fail({
				code: "CAMP_ASSIGNMENT_SESSION_MISMATCH",
				message: "Camp assignment belongs to a different session.",
				details: { assignmentId: assignment.id, sessionId: input.session.id },
			});
		}

		if (assignment.hour !== input.session.currentHour) {
			return fail({
				code: "CAMP_ASSIGNMENT_HOUR_MISMATCH",
				message: "Camp assignment belongs to a different hour.",
				details: {
					assignmentId: assignment.id,
					currentHour: input.session.currentHour,
				},
			});
		}

		if (assignedCharacterIds.has(assignment.characterId)) {
			return fail({
				code: "DUPLICATE_CAMP_CHARACTER_ASSIGNMENT",
				message: "Each character can receive at most one camp action per hour.",
				details: { characterId: assignment.characterId },
			});
		}
		assignedCharacterIds.add(assignment.characterId);

		const activity = activitiesById.get(assignment.activityId);
		if (!activity) {
			return fail({
				code: "UNKNOWN_CAMP_ACTIVITY",
				message: "Camp assignment references an unknown activity.",
				details: { activityId: assignment.activityId },
			});
		}

		if (activity.id === "watch") {
			watchCoverageMaintained = true;
		}
		if (activity.id === "fortify-perimeter") {
			fortifyAssignmentCount += 1;
		}
		actionEvents.push({
			type: "camp-action-registered",
			message: `${assignment.characterId} executa ${activity.label}.`,
			characterId: assignment.characterId,
			activityId: assignment.activityId,
			createdAt: input.resolvedAt,
		});
	}

	return ok({ watchCoverageMaintained, fortifyAssignmentCount, actionEvents });
}

async function advanceFortifyClockIfNeeded(
	input: ParsedCampHourInput,
	clockPort: CampClockProgressPort,
	fortifyAssignmentCount: number,
): Promise<Result<ClockRecord | null, CampHourFailure>> {
	if (fortifyAssignmentCount === 0) {
		return ok(null);
	}

	if (!input.session.fortifyClockId) {
		return fail({
			code: "MISSING_CAMP_CLOCK",
			message: "Fortify perimeter requires a linked camp clock.",
			details: { sessionId: input.session.id },
		});
	}

	const advanced = await clockPort.advanceClock({
		clockId: input.session.fortifyClockId,
		slices:
			fortifyAssignmentCount *
			PANDORHA_RULES.CAMP.FORTIFY_PERIMETER_PROGRESS_PER_ASSIGNMENT,
		updatedAt: input.resolvedAt,
	});
	if (!advanced.success) {
		return fail({
			code: "CAMP_CLOCK_ADVANCE_FAILED",
			message: "Camp hour could not advance the linked camp clock.",
			details: { failure: advanced.error },
		});
	}

	return ok(advanced.data);
}

function createResult(
	input: ParsedCampHourInput,
	checked: AssignmentValidationResult,
	advancedClock: ClockRecord | null,
): CampHourResult {
	const session = resolveSession(input.session, input.resolvedAt);

	return {
		session,
		assignments: input.assignments,
		watchCoverageMaintained: checked.watchCoverageMaintained,
		advancedClock,
		events: createEvents(input, checked, advancedClock),
	};
}

function resolveSession(
	session: CampSessionRecord,
	resolvedAt: string,
): CampSessionRecord {
	return {
		...session,
		danger: session.danger + PANDORHA_RULES.CAMP.BASE_DANGER_INCREASE_PER_HOUR,
		status: "resolved",
		updatedAt: resolvedAt,
	};
}

function createEvents(
	input: ParsedCampHourInput,
	checked: AssignmentValidationResult,
	advancedClock: ClockRecord | null,
): readonly CampHourEvent[] {
	const events: CampHourEvent[] = [...checked.actionEvents];

	if (checked.watchCoverageMaintained) {
		events.push({
			type: "camp-watch-covered",
			message: "A vigília mantém cobertura mínima do acampamento.",
			createdAt: input.resolvedAt,
		});
	}

	if (advancedClock) {
		events.push({
			type: "camp-clock-advanced",
			message: `Fortificar perímetro avançou ${checked.fortifyAssignmentCount} fatias.`,
			createdAt: input.resolvedAt,
		});
	}

	events.push({
		type: "camp-danger-increased",
		message: `O Contador de Perigo sobe para ${input.session.danger + PANDORHA_RULES.CAMP.BASE_DANGER_INCREASE_PER_HOUR}.`,
		createdAt: input.resolvedAt,
	});
	events.push({
		type: "camp-hour-resolved",
		message: `Hora ${input.session.currentHour} do acampamento resolvida.`,
		createdAt: input.resolvedAt,
	});

	return events;
}
