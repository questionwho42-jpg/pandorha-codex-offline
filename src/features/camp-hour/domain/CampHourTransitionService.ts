import type { CampSessionRecord } from "$lib/entities/camp-session";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	campHourTransitionInputSchema,
	formatCampHourIssues,
} from "../model/campHourSchemas";
import type { CampHourTransitionFailure } from "../model/campHourTypes";

/**
 * @description Prepares one resolved camp session for its next manually planned hour.
 * @rule docs/process/camp-multi-hour-orchestration-gate.md - the next hour is explicit and preserves the resolved state until requested.
 */
export class CampHourTransitionService {
	public prepareNextHour(
		input: unknown,
	): Result<CampSessionRecord, CampHourTransitionFailure> {
		const parsedInput = campHourTransitionInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return fail({
				code: "INVALID_CAMP_HOUR_TRANSITION_INPUT",
				message: "Camp hour transition input failed validation.",
				details: { issues: formatCampHourIssues(parsedInput.error.issues) },
			});
		}

		const { session, preparedAt } = parsedInput.data;
		if (session.status !== "resolved") {
			return fail({
				code: "CAMP_SESSION_NOT_RESOLVED",
				message: "Camp session must be resolved before preparing another hour.",
				details: { sessionId: session.id },
			});
		}

		if (session.currentHour >= 24) {
			return fail({
				code: "CAMP_HOUR_LIMIT_REACHED",
				message: "Camp session reached the supported hour limit.",
				details: { currentHour: session.currentHour, sessionId: session.id },
			});
		}

		return ok({
			...session,
			currentHour: session.currentHour + 1,
			status: "planning",
			updatedAt: preparedAt,
		});
	}
}
