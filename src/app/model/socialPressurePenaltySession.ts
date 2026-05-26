import {
	type ClockRecord,
	ClockService,
	InMemoryClockRepository,
} from "$lib/entities/clock";
import type {
	FactionRecord,
	FactionStandingRecord,
} from "$lib/entities/faction";
import type { NpcRecord } from "$lib/entities/npc";
import type { WorldStateFlagView } from "$lib/entities/world-state";
import {
	createSocialPressureInfamyFlag,
	hasSocialPressureInfamyFlag,
	hasSocialPressurePenaltyFlag,
	type SocialPressurePenaltyIntent,
	upsertSocialPressureInfamyFlag,
	upsertSocialPressurePenaltyFlag,
} from "$lib/features/social-encounter/model-api";
import type {
	SocialStandingChangeResult,
	SocialStandingFailure,
} from "$lib/features/social-standing";
import { fail, ok, type Result } from "$lib/shared/lib/result";

export interface SocialPressurePenaltySessionState {
	readonly applied: boolean;
	readonly clocks: readonly ClockRecord[];
	readonly factionStandings: readonly FactionStandingRecord[];
	readonly infamyApplied: boolean;
	readonly retaliationClockCreated: boolean;
	readonly worldState: readonly WorldStateFlagView[];
}

export type SocialPressurePenaltySessionFailureCode =
	| "SOCIAL_PRESSURE_NPC_NOT_FOUND"
	| "SOCIAL_PRESSURE_STANDING_NOT_FOUND"
	| "SOCIAL_PRESSURE_FAME_LOSS_FAILED"
	| "SOCIAL_PRESSURE_INFAMY_GAIN_FAILED"
	| "SOCIAL_PRESSURE_RETALIATION_CLOCK_FAILED";

export interface SocialPressurePenaltySessionFailure {
	readonly code: SocialPressurePenaltySessionFailureCode;
	readonly message: string;
	readonly details?: unknown;
}

export async function applySocialPressurePenaltyIntent(input: {
	readonly clocks: readonly ClockRecord[];
	readonly factions: readonly FactionRecord[];
	readonly intent: SocialPressurePenaltyIntent;
	readonly factionStandings: readonly FactionStandingRecord[];
	readonly gainInfamy: (
		standing: FactionStandingRecord,
		levels?: number,
	) => Promise<Result<SocialStandingChangeResult, SocialStandingFailure>>;
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
			clocks: input.clocks,
			factionStandings: input.factionStandings,
			infamyApplied: false,
			retaliationClockCreated: false,
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

	if (
		standing.fameLevel === 0 &&
		!hasSocialPressureInfamyFlag(input.worldState, input.intent.encounterId)
	) {
		const infamyGain = await input.gainInfamy(standing, 1);
		if (!infamyGain.success) {
			return fail({
				code: "SOCIAL_PRESSURE_INFAMY_GAIN_FAILED",
				message: "Faction infamy gain failed for social pressure consequence.",
				details: infamyGain.error,
			});
		}

		const factionStandings = replaceFactionStanding(
			input.factionStandings,
			infamyGain.data.standing,
		);
		const worldStateWithPressure = upsertSocialPressurePenaltyFlag(
			input.worldState,
			input.intent.worldStateFlag,
		);
		const worldState = upsertSocialPressureInfamyFlag(
			worldStateWithPressure,
			createSocialPressureInfamyFlag({
				intent: input.intent,
				updatedAt: input.intent.worldStateFlag.updatedAt,
			}),
		);
		const clockResult = await createRetaliationClock({
			clocks: input.clocks,
			encounterId: input.intent.encounterId,
			factions: input.factions,
			npc,
			updatedAt: input.intent.worldStateFlag.updatedAt,
		});
		if (!clockResult.success) {
			return fail(clockResult.error);
		}

		return ok({
			applied: true,
			clocks: clockResult.data.clocks,
			factionStandings,
			infamyApplied: true,
			retaliationClockCreated: clockResult.data.created,
			worldState,
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
	const shouldCreateRetaliationClock =
		fameLoss.data.standing.status === "ultimatum";
	const clockResult = shouldCreateRetaliationClock
		? await createRetaliationClock({
				clocks: input.clocks,
				encounterId: input.intent.encounterId,
				factions: input.factions,
				npc,
				updatedAt: input.intent.worldStateFlag.updatedAt,
			})
		: ok({ clocks: input.clocks, created: false });
	if (!clockResult.success) {
		return fail(clockResult.error);
	}

	return ok({
		applied: true,
		clocks: clockResult.data.clocks,
		factionStandings,
		infamyApplied: false,
		retaliationClockCreated: clockResult.data.created,
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

async function createRetaliationClock(input: {
	readonly clocks: readonly ClockRecord[];
	readonly encounterId: string;
	readonly factions: readonly FactionRecord[];
	readonly npc: NpcRecord;
	readonly updatedAt: string;
}): Promise<
	Result<
		{ readonly clocks: readonly ClockRecord[]; readonly created: boolean },
		SocialPressurePenaltySessionFailure
	>
> {
	const clockId = `retaliation-${input.npc.factionId}-${input.encounterId}`;
	if (input.clocks.some((clock) => clock.id === clockId)) {
		return ok({ clocks: input.clocks, created: false });
	}

	const faction = input.factions.find(
		(candidate) => candidate.id === input.npc.factionId,
	);
	const label = `Retaliação: ${faction?.label ?? input.npc.factionId}`;
	const repository = new InMemoryClockRepository({ records: input.clocks });
	const service = new ClockService(repository);
	const created = await service.createClock({
		id: clockId,
		label,
		maxSlices: 4,
		source: "social-pressure",
		createdAt: input.updatedAt,
		updatedAt: input.updatedAt,
	});
	if (!created.success) {
		return fail({
			code: "SOCIAL_PRESSURE_RETALIATION_CLOCK_FAILED",
			message: "Retaliation clock could not be created.",
			details: created.error,
		});
	}

	return ok({
		clocks: [...input.clocks, created.data],
		created: true,
	});
}
