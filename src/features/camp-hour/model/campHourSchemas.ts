import { z } from "zod/v4";
import {
	type CampActivityRecord,
	campActivitySelectSchema,
} from "$lib/entities/camp-activity";
import {
	type CampAssignmentRecord,
	type CampSessionRecord,
	campAssignmentSelectSchema,
	campSessionSelectSchema,
} from "$lib/entities/camp-session";

const isoTimestamp = z.string().trim().datetime({ offset: true });

export const campHourInputSchema = z.object({
	session: campSessionSelectSchema,
	assignments: z.array(campAssignmentSelectSchema).min(1),
	activities: z.array(campActivitySelectSchema).min(1),
	resolvedAt: isoTimestamp,
});

export const campHourTransitionInputSchema = z.object({
	session: campSessionSelectSchema,
	preparedAt: isoTimestamp,
});

export type CampHourInput = {
	readonly session: CampSessionRecord;
	readonly assignments: readonly CampAssignmentRecord[];
	readonly activities: readonly CampActivityRecord[];
	readonly resolvedAt: string;
};

export type CampHourTransitionInput = {
	readonly session: CampSessionRecord;
	readonly preparedAt: string;
};

export type ParsedCampHourInput = z.infer<typeof campHourInputSchema>;

export function formatCampHourIssues(
	issues: readonly z.ZodIssue[],
): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
