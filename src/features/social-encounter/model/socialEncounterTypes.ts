import type { z } from "zod/v4";
import type { NpcFailure, NpcRecord } from "$lib/entities/npc";
import type {
	ActionCommand,
	ActionQueueFailure,
	ActionQueueProcessedCommand,
} from "$lib/shared/action-queue";
import type { Result } from "$lib/shared/lib/result";
import type {
	socialAppealOutcomeSchema,
	socialEncounterEventSchema,
	socialEncounterStateSchema,
	socialEncounterStatusSchema,
} from "./socialEncounterSchemas";

export type SocialEncounterStatus = z.infer<typeof socialEncounterStatusSchema>;
export type SocialEncounterEvent = z.infer<typeof socialEncounterEventSchema>;
export type SocialEncounterState = z.infer<typeof socialEncounterStateSchema>;
export type SocialAppealOutcome = z.infer<typeof socialAppealOutcomeSchema>;

export type SocialEncounterFailureCode =
	| "INVALID_SOCIAL_ENCOUNTER_INPUT"
	| "NPC_LOOKUP_FAILED"
	| "SOCIAL_ENCOUNTER_NOT_ACTIVE"
	| "INVALID_SOCIAL_APPEAL_COMMAND"
	| "ACTION_QUEUE_FAILED";

export interface SocialEncounterFailure {
	readonly code: SocialEncounterFailureCode;
	readonly message: string;
	readonly details?: unknown;
	readonly cause?: NpcFailure | ActionQueueFailure;
}

export interface SocialEncounterNpcPort {
	findNpcById(id: string): Promise<Result<NpcRecord, NpcFailure>>;
}

export interface SocialEncounterQueuedAppeal {
	readonly state: SocialEncounterState;
	readonly command: ActionCommand;
	readonly outcome: SocialAppealOutcome;
	readonly resolvedAt: string;
}

export interface SocialEncounterProcessorResult {
	readonly state: SocialEncounterState;
	readonly processedCommand: ActionQueueProcessedCommand;
}
