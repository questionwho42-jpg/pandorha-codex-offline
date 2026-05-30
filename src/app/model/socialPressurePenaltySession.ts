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
import {
	InMemoryNpcRelationshipRepository,
	type NpcRelationshipRecord,
	NpcRelationshipService,
} from "$lib/entities/npc-relationship";
import type { WorldStateFlagView } from "$lib/entities/world-state";
import {
	createSocialPressureInfamyFlag,
	hasSocialPressureInfamyFlag,
	hasSocialPressurePenaltyFlag,
	type SocialPressurePenaltyIntent,
	upsertSocialPressureInfamyFlag,
	upsertSocialPressurePenaltyFlag,
} from "$lib/features/social-encounter/model-api";
import { SocialRetaliationClockService } from "$lib/features/social-retaliation";
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
	readonly npcRelationshipApplied: boolean;
	readonly npcRelationships: readonly NpcRelationshipRecord[];
	readonly retaliationClockAdvanced: boolean;
	readonly retaliationClockCreated: boolean;
	readonly worldState: readonly WorldStateFlagView[];
}

export type SocialPressurePenaltySessionFailureCode =
	| "SOCIAL_PRESSURE_NPC_NOT_FOUND"
	| "SOCIAL_PRESSURE_STANDING_NOT_FOUND"
	| "SOCIAL_PRESSURE_FAME_LOSS_FAILED"
	| "SOCIAL_PRESSURE_INFAMY_GAIN_FAILED"
	| "SOCIAL_PRESSURE_NPC_RELATIONSHIP_FAILED"
	| "SOCIAL_PRESSURE_RETALIATION_ADVANCE_FAILED"
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
	readonly npcRelationships: readonly NpcRelationshipRecord[];
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
			npcRelationshipApplied: false,
			npcRelationships: input.npcRelationships,
			retaliationClockAdvanced: false,
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
		const finalized = await finalizeSocialPressureConsequence({
			clocks: clockResult.data.clocks,
			intent: input.intent,
			npcRelationships: input.npcRelationships,
			updatedAt: input.intent.worldStateFlag.updatedAt,
		});
		if (!finalized.success) {
			return fail(finalized.error);
		}

		return ok({
			applied: true,
			clocks: finalized.data.clocks,
			factionStandings,
			infamyApplied: true,
			npcRelationshipApplied: finalized.data.npcRelationshipApplied,
			npcRelationships: finalized.data.npcRelationships,
			retaliationClockAdvanced: finalized.data.retaliationClockAdvanced,
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
	const finalized = await finalizeSocialPressureConsequence({
		clocks: clockResult.data.clocks,
		intent: input.intent,
		npcRelationships: input.npcRelationships,
		updatedAt: input.intent.worldStateFlag.updatedAt,
	});
	if (!finalized.success) {
		return fail(finalized.error);
	}

	return ok({
		applied: true,
		clocks: finalized.data.clocks,
		factionStandings,
		infamyApplied: false,
		npcRelationshipApplied: finalized.data.npcRelationshipApplied,
		npcRelationships: finalized.data.npcRelationships,
		retaliationClockAdvanced: finalized.data.retaliationClockAdvanced,
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

async function finalizeSocialPressureConsequence(input: {
	readonly clocks: readonly ClockRecord[];
	readonly intent: SocialPressurePenaltyIntent;
	readonly npcRelationships: readonly NpcRelationshipRecord[];
	readonly updatedAt: string;
}): Promise<
	Result<
		{
			readonly clocks: readonly ClockRecord[];
			readonly npcRelationshipApplied: boolean;
			readonly npcRelationships: readonly NpcRelationshipRecord[];
			readonly retaliationClockAdvanced: boolean;
		},
		SocialPressurePenaltySessionFailure
	>
> {
	const pressureKey = createSocialPressureTriggerId(input.intent);
	const relationshipResult = await recordNpcRelationshipPressure({
		intent: input.intent,
		npcRelationships: input.npcRelationships,
		pressureKey,
		updatedAt: input.updatedAt,
	});
	if (!relationshipResult.success) {
		return fail(relationshipResult.error);
	}

	const advanced = await advanceRetaliationClocksFromPressure({
		appliedTriggerIds: relationshipResult.data.wasAlreadyApplied
			? [pressureKey]
			: [],
		clocks: input.clocks,
		triggerId: pressureKey,
		triggeredAt: input.updatedAt,
	});
	if (!advanced.success) {
		return fail(advanced.error);
	}

	return ok({
		clocks: advanced.data.clocks,
		npcRelationshipApplied: relationshipResult.data.applied,
		npcRelationships: relationshipResult.data.npcRelationships,
		retaliationClockAdvanced: advanced.data.advanced,
	});
}

async function recordNpcRelationshipPressure(input: {
	readonly intent: SocialPressurePenaltyIntent;
	readonly npcRelationships: readonly NpcRelationshipRecord[];
	readonly pressureKey: string;
	readonly updatedAt: string;
}): Promise<
	Result<
		{
			readonly applied: boolean;
			readonly npcRelationships: readonly NpcRelationshipRecord[];
			readonly wasAlreadyApplied: boolean;
		},
		SocialPressurePenaltySessionFailure
	>
> {
	const repository = new InMemoryNpcRelationshipRepository({
		records: input.npcRelationships,
	});
	const service = new NpcRelationshipService(repository);
	const relationship = await findOrCreateRelationship({
		npcId: input.intent.npcId,
		service,
		updatedAt: input.updatedAt,
	});
	if (!relationship.success) {
		return fail(relationship.error);
	}

	const wasAlreadyApplied = hasPressureKey(
		relationship.data,
		input.pressureKey,
	);
	if (!wasAlreadyApplied.success) {
		return fail(wasAlreadyApplied.error);
	}

	const recorded = await service.recordPressureConsequence({
		pressureKey: input.pressureKey,
		relationship: relationship.data,
		severity: "pressure",
		updatedAt: input.updatedAt,
	});
	if (!recorded.success) {
		return fail({
			code: "SOCIAL_PRESSURE_NPC_RELATIONSHIP_FAILED",
			message: "NPC relationship could not record social pressure.",
			details: recorded.error,
		});
	}

	return ok({
		applied: recorded.data.applied,
		npcRelationships: repository.all(),
		wasAlreadyApplied: wasAlreadyApplied.data,
	});
}

async function findOrCreateRelationship(input: {
	readonly npcId: string;
	readonly service: NpcRelationshipService;
	readonly updatedAt: string;
}): Promise<
	Result<NpcRelationshipRecord, SocialPressurePenaltySessionFailure>
> {
	const found = await input.service.findRelationshipByNpcId(input.npcId);
	if (found.success) {
		return ok(found.data);
	}

	if (found.error.code !== "NPC_RELATIONSHIP_NOT_FOUND") {
		return fail({
			code: "SOCIAL_PRESSURE_NPC_RELATIONSHIP_FAILED",
			message: "NPC relationship lookup failed for social pressure.",
			details: found.error,
		});
	}

	const created = await input.service.createRelationship({
		initialAttitude: "neutral",
		npcId: input.npcId,
		updatedAt: input.updatedAt,
	});
	if (!created.success) {
		return fail({
			code: "SOCIAL_PRESSURE_NPC_RELATIONSHIP_FAILED",
			message: "NPC relationship could not be created for social pressure.",
			details: created.error,
		});
	}

	return ok(created.data.relationship);
}

async function advanceRetaliationClocksFromPressure(input: {
	readonly appliedTriggerIds: readonly string[];
	readonly clocks: readonly ClockRecord[];
	readonly triggerId: string;
	readonly triggeredAt: string;
}): Promise<
	Result<
		{ readonly clocks: readonly ClockRecord[]; readonly advanced: boolean },
		SocialPressurePenaltySessionFailure
	>
> {
	const clockService = new ClockService(
		new InMemoryClockRepository({ records: input.clocks }),
	);
	const advanced = await new SocialRetaliationClockService({
		advanceClock: (command) => clockService.advanceClock(command),
	}).advanceFromTrigger({
		appliedTriggerIds: [...input.appliedTriggerIds],
		clocks: input.clocks,
		slices: 1,
		triggerId: input.triggerId,
		triggeredAt: input.triggeredAt,
	});
	if (!advanced.success) {
		return fail({
			code: "SOCIAL_PRESSURE_RETALIATION_ADVANCE_FAILED",
			message: "Social-pressure retaliation clocks could not be advanced.",
			details: advanced.error,
		});
	}

	return ok({
		clocks: advanced.data.clocks,
		advanced: advanced.data.advancedClocks.length > 0,
	});
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

function hasPressureKey(
	relationship: NpcRelationshipRecord,
	pressureKey: string,
): Result<boolean, SocialPressurePenaltySessionFailure> {
	try {
		const parsed = JSON.parse(relationship.appliedPressureKeysJson) as unknown;
		if (
			!Array.isArray(parsed) ||
			parsed.some((entry) => typeof entry !== "string")
		) {
			return fail({
				code: "SOCIAL_PRESSURE_NPC_RELATIONSHIP_FAILED",
				message: "NPC relationship pressure ledger is not valid.",
				details: { npcId: relationship.npcId },
			});
		}

		return ok(parsed.includes(pressureKey));
	} catch (error: unknown) {
		return fail({
			code: "SOCIAL_PRESSURE_NPC_RELATIONSHIP_FAILED",
			message: "NPC relationship pressure ledger could not be read.",
			details: { cause: stringifyCause(error), npcId: relationship.npcId },
		});
	}
}

function createSocialPressureTriggerId(
	intent: Pick<SocialPressurePenaltyIntent, "encounterId">,
): string {
	return `social-pressure-${intent.encounterId}`;
}

function stringifyCause(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
