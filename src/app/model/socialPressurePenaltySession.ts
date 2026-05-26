import type { FactionStandingRecord } from "$lib/entities/faction";
import type { NpcRecord } from "$lib/entities/npc";
import type { WorldStateFlagView } from "$lib/entities/world-state";
import {
	hasSocialPressurePenaltyFlag,
	type SocialPressurePenaltyIntent,
	upsertSocialPressurePenaltyFlag,
} from "$lib/features/social-encounter/model-api";
import type {
	SocialStandingChangeResult,
	SocialStandingFailure,
} from "$lib/features/social-standing";
import { fail, ok, type Result } from "$lib/shared/lib/result";

export interface SocialPressurePenaltySessionState {
	readonly applied: boolean;
	readonly factionStandings: readonly FactionStandingRecord[];
	readonly worldState: readonly WorldStateFlagView[];
}

export type SocialPressurePenaltySessionFailureCode =
	| "SOCIAL_PRESSURE_NPC_NOT_FOUND"
	| "SOCIAL_PRESSURE_STANDING_NOT_FOUND"
	| "SOCIAL_PRESSURE_FAME_LOSS_FAILED";

export interface SocialPressurePenaltySessionFailure {
	readonly code: SocialPressurePenaltySessionFailureCode;
	readonly message: string;
	readonly details?: unknown;
}

export async function applySocialPressurePenaltyIntent(input: {
	readonly intent: SocialPressurePenaltyIntent;
	readonly factionStandings: readonly FactionStandingRecord[];
	readonly loseFame: (
		standing: FactionStandingRecord,
		levels?: number,
	) => Promise<Result<SocialStandingChangeResult, SocialStandingFailure>>;
	readonly npcs: readonly NpcRecord[];
	readonly worldState: readonly WorldStateFlagView[];
}): Promise<
	Result<SocialPressurePenaltySessionState, SocialPressurePenaltySessionFailure>
> {
	if (
		hasSocialPressurePenaltyFlag(input.worldState, input.intent.encounterId)
	) {
		return ok({
			applied: false,
			factionStandings: input.factionStandings,
			worldState: input.worldState,
		});
	}

	const npc = input.npcs.find(
		(candidate) => candidate.id === input.intent.npcId,
	);
	if (!npc) {
		return fail({
			code: "SOCIAL_PRESSURE_NPC_NOT_FOUND",
			message: "NPC was not found for social pressure consequence.",
			details: { npcId: input.intent.npcId },
		});
	}

	const standing = input.factionStandings.find(
		(candidate) => candidate.factionId === npc.factionId,
	);
	if (!standing) {
		return fail({
			code: "SOCIAL_PRESSURE_STANDING_NOT_FOUND",
			message:
				"Faction standing was not found for social pressure consequence.",
			details: { factionId: npc.factionId, npcId: npc.id },
		});
	}

	const fameLoss = await input.loseFame(standing, 1);
	if (!fameLoss.success) {
		return fail({
			code: "SOCIAL_PRESSURE_FAME_LOSS_FAILED",
			message: "Faction fame loss failed for social pressure consequence.",
			details: fameLoss.error,
		});
	}

	const factionStandings = replaceFactionStanding(
		input.factionStandings,
		fameLoss.data.standing,
	);
	const worldState = upsertSocialPressurePenaltyFlag(
		input.worldState,
		input.intent.worldStateFlag,
	);

	return ok({
		applied: true,
		factionStandings,
		worldState,
	});
}

function replaceFactionStanding(
	standings: readonly FactionStandingRecord[],
	nextStanding: FactionStandingRecord,
): readonly FactionStandingRecord[] {
	return standings.map((standing) =>
		standing.factionId === nextStanding.factionId ? nextStanding : standing,
	);
}
