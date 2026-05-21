import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";
import { socialEncounterEventSchema } from "./socialEncounterSchemas";

const slug = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(120);
const isoTimestamp = z.iso.datetime();

export const dialogueTraversalSelectInputSchema = z.object({
	npcId: slug,
	currentNodeId: slug,
	optionId: slug,
	selectedAt: isoTimestamp,
	events: z.array(socialEncounterEventSchema),
});

export const dialogueTraversalCurrentNodeInputSchema = z.object({
	npcId: slug,
	startNodeId: slug,
	events: z.array(socialEncounterEventSchema),
});

export type DialogueTraversalSelectInput = z.infer<
	typeof dialogueTraversalSelectInputSchema
>;
export type DialogueTraversalCurrentNodeInput = z.infer<
	typeof dialogueTraversalCurrentNodeInputSchema
>;

export function formatDialogueTraversalIssues(
	issues: readonly ZodIssue[],
): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
