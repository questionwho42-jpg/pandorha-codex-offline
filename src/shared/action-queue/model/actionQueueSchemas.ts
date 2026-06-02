import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";

const slugSchema = z
	.string()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);
const payloadValueSchema = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.null(),
]);

export const actionCommandSchema = z
	.object({
		id: slugSchema,
		type: slugSchema,
		source: z.string().trim().min(1).max(160).optional(),
		createdAt: z.iso.datetime(),
		payload: z.record(z.string(), payloadValueSchema).optional(),
	})
	.strict();

export function formatActionQueueIssues(
	issues: readonly ZodIssue[],
): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
