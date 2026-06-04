import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";

const slugSchema = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);

export const hexcrawlMovementInputSchema = z
	.object({
		partyId: slugSchema,
		currentTileId: slugSchema,
		targetTileId: slugSchema,
		createdAt: z.iso.datetime(),
		activeCharacterId: z.string().trim().optional(),
	})
	.strict();

export type HexcrawlMovementInput = z.infer<typeof hexcrawlMovementInputSchema>;

export function formatHexcrawlMovementIssues(
	issues: readonly ZodIssue[],
): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
