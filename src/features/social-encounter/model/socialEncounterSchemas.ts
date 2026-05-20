import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";
import { npcAttitudeSchema } from "$lib/entities/npc";

const slug = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);
const isoTimestamp = z.iso.datetime();
const positiveCounter = z.number().int().min(1).max(999);
const nonNegativeCounter = z.number().int().min(0).max(999);

export const socialEncounterStatusSchema = z.enum([
	"active",
	"convinced",
	"walked-away",
]);

export const socialEncounterEventTypeSchema = z.enum([
	"social-encounter-started",
	"social-appeal-queued",
	"social-appeal-succeeded",
	"social-appeal-failed",
	"social-encounter-convinced",
	"social-encounter-walked-away",
]);

export const socialEncounterEventSchema = z.object({
	type: socialEncounterEventTypeSchema,
	message: z.string().trim().min(1).max(240),
	createdAt: isoTimestamp,
	commandId: slug.optional(),
});

export const socialEncounterStateSchema = z.object({
	id: slug,
	npcId: slug,
	actorId: slug,
	status: socialEncounterStatusSchema,
	attitude: npcAttitudeSchema,
	mentalHpCurrent: nonNegativeCounter,
	mentalHpMax: positiveCounter,
	patienceCurrent: nonNegativeCounter,
	patienceMax: positiveCounter,
	persuasionProgress: nonNegativeCounter,
	persuasionTarget: positiveCounter,
	events: z.array(socialEncounterEventSchema),
	log: z.array(z.string().trim().min(1).max(240)),
	createdAt: isoTimestamp,
	updatedAt: isoTimestamp,
});

export const socialEncounterStartInputSchema = z.object({
	id: slug,
	actorId: slug,
	npcId: slug,
	requestComplexity: z.number().int().min(1).max(10),
	createdAt: isoTimestamp,
});

export const socialAppealOutcomeSchema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("success"),
		mentalDamage: positiveCounter,
		persuasionProgress: positiveCounter,
	}),
	z.object({
		kind: z.literal("failure"),
		patienceDamage: positiveCounter,
	}),
]);

export const socialEncounterAppealInputSchema = z.object({
	state: socialEncounterStateSchema,
	command: z.unknown(),
	outcome: socialAppealOutcomeSchema,
	resolvedAt: isoTimestamp,
});

export type SocialEncounterStartInput = z.infer<
	typeof socialEncounterStartInputSchema
>;
export type SocialEncounterAppealInput = z.infer<
	typeof socialEncounterAppealInputSchema
>;

export function formatSocialEncounterIssues(
	issues: readonly ZodIssue[],
): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
