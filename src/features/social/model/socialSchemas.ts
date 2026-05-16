import type { ZodIssue } from "zod/v4";
import { z } from "zod/v4";

export const socialAttitudeSchema = z.enum([
	"friendly",
	"neutral",
	"skeptical",
	"hostile",
	"declared_enemy",
]);

export const patienceReserveSchema = z
	.object({
		baseValue: z.number().int().min(0),
		currentValue: z.number().int().min(0),
	})
	.strict();

export const persuasionTrackSchema = z
	.object({
		totalSegments: z.number().int().min(1),
		completedSegments: z.number().int().min(0),
	})
	.strict();

const socialTargetIdSchema = z
	.string()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);

export const socialTargetSchema = z
	.object({
		id: socialTargetIdSchema,
		label: z.string().trim().min(1).max(80),
		tier: z.number().int().min(1).max(5),
		mentalStat: z.number().int(),
		resistanceStat: z.number().int(),
		attitude: socialAttitudeSchema,
		patience: patienceReserveSchema,
		persuasion: persuasionTrackSchema,
		fatigueCounters: z.record(z.string(), z.number().int().min(0)),
	})
	.strict();

export const socialActionTypeSchema = z.enum([
	"persuasion",
	"diplomacy",
	"bargain",
	"intimidation",
	"mystic_charm",
]);

export const socialActionSchema = z
	.object({
		id: z.string().uuid(),
		type: socialActionTypeSchema,
		baseAxis: z.string().trim().min(1),
		dc: z.number().int().min(1),
		performerId: socialTargetIdSchema,
		targetId: socialTargetIdSchema,
	})
	.strict();

export const favorTypeSchema = z.enum(["minor", "major"]);

export const bargainOfferSchema = z
	.object({
		id: z.string().uuid(),
		type: z.enum(["gold", "item", "favor", "information"]),
		valueInGold: z.number().int().min(0),
		description: z.string().trim().min(1),
		favorType: favorTypeSchema.optional(),
	})
	.strict();

export const socialConflictStateSchema = z
	.object({
		id: z.string().uuid(),
		participantIds: z.array(socialTargetIdSchema),
		currentRound: z.number().int().min(1),
		maxRounds: z.number().int().min(1),
		bargainOffers: z.array(bargainOfferSchema),
	})
	.strict();

export function formatSocialIssues(
	issues: readonly ZodIssue[],
): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
