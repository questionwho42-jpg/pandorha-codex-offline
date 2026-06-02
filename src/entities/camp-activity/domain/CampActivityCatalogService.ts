import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type CampActivityRecord,
	campActivityIdSchema,
	campActivitySelectSchema,
} from "../model/campActivitySchema";
import type { CampActivityFailure } from "../model/campActivityTypes";
import type { CampActivityRepository } from "./CampActivityRepository";

/**
 * @description Exposes the initial read-only camp activity catalog without resolving camp effects.
 * @rule docs/system/survival/28-codex-acampamento-descanso-ativo.md - camp actions define the first activity menu.
 */
export class CampActivityCatalogService {
	public constructor(private readonly repository: CampActivityRepository) {}

	public async listActivities(): Promise<
		Result<readonly CampActivityRecord[], CampActivityFailure>
	> {
		const listed = await this.repository.list();
		if (!listed.success) {
			return fail(listed.error);
		}

		const validated: CampActivityRecord[] = [];
		for (const activity of listed.data) {
			const parsed = campActivitySelectSchema.safeParse(activity);
			if (!parsed.success) {
				return corruptedRecordFailure(parsed.error.issues);
			}

			validated.push(parsed.data);
		}

		return ok(validated);
	}

	public async findActivityById(
		id: unknown,
	): Promise<Result<CampActivityRecord, CampActivityFailure>> {
		const parsedId = campActivityIdSchema.safeParse(id);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_CAMP_ACTIVITY_ID",
				message: "Camp activity id does not match the catalog format.",
				details: { issues: formatIssues(parsedId.error.issues) },
			});
		}

		const found = await this.repository.findById(parsedId.data);
		if (!found.success) {
			return fail(found.error);
		}

		const parsed = campActivitySelectSchema.safeParse(found.data);
		if (!parsed.success) {
			return corruptedRecordFailure(parsed.error.issues);
		}

		return ok(parsed.data);
	}
}

function corruptedRecordFailure(
	issues: readonly ZodIssue[],
): Result<never, CampActivityFailure> {
	return fail({
		code: "CORRUPTED_CAMP_ACTIVITY_RECORD",
		message: "Camp activity record failed output validation.",
		details: { issues: formatIssues(issues) },
	});
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
