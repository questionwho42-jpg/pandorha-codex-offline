import type { z } from "zod/v4";
import type {
	bargainOfferSchema,
	favorTypeSchema,
	patienceReserveSchema,
	persuasionTrackSchema,
	socialActionSchema,
	socialActionTypeSchema,
	socialAttitudeSchema,
	socialConflictStateSchema,
	socialTargetSchema,
} from "./socialSchemas";

export type SocialAttitude = z.infer<typeof socialAttitudeSchema>;
export type PatienceReserve = z.infer<typeof patienceReserveSchema>;
export type PersuasionTrack = z.infer<typeof persuasionTrackSchema>;
export type SocialTarget = z.infer<typeof socialTargetSchema>;
export type SocialActionType = z.infer<typeof socialActionTypeSchema>;
export type SocialAction = z.infer<typeof socialActionSchema>;
export type FavorType = z.infer<typeof favorTypeSchema>;
export type BargainOffer = z.infer<typeof bargainOfferSchema>;
export type SocialConflictState = z.infer<typeof socialConflictStateSchema>;
