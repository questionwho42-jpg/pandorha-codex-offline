import type {
	ResolutionFailure,
	ResolutionResult,
} from "$lib/shared/resolution";
import type { SocialAppealOutcome } from "./socialEncounterTypes";

export interface SocialAppealResolutionResult {
	readonly resolution: ResolutionResult;
	readonly outcome: SocialAppealOutcome;
	readonly summary: string;
}

export type SocialAppealResolutionFailureCode =
	| "INVALID_SOCIAL_APPEAL_RESOLUTION_INPUT"
	| "SOCIAL_APPEAL_RESOLUTION_FAILED";

export interface SocialAppealResolutionFailure {
	readonly code: SocialAppealResolutionFailureCode;
	readonly message: string;
	readonly details?: Readonly<
		Record<string, string | number | boolean | readonly string[]>
	>;
	readonly cause?: ResolutionFailure;
}
