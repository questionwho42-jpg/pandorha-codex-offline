import type { CharacterRecord } from "$lib/entities/character";
import {
	InMemoryNpcCatalogRepository,
	NPC_CATALOG,
	type NpcRecord,
} from "$lib/entities/npc";
import {
	type SocialAppealResolutionResult,
	SocialAppealResolutionService,
	SocialEncounterService,
	type SocialEncounterState,
} from "$lib/features/social-encounter/model-api";
import {
	type DiceClock,
	type DiceRng,
	type DiceRollIdProvider,
	DiceService,
} from "$lib/shared/dice";
import { ResolutionService } from "$lib/shared/resolution";

const REQUEST_COMPLEXITY = 2;
const TRAINING_SOCIAL_APPEAL_DC = 14;
const TRAINING_SOCIAL_ITEM_BONUS = 0;

export interface SocialEncounterSession {
	readonly appealResolutionService: SocialAppealResolutionService;
	readonly npcs: readonly NpcRecord[];
	readonly service: SocialEncounterService;
	createAppealInput(
		state: SocialEncounterState,
		resolution: SocialAppealResolutionResult,
	): {
		readonly state: SocialEncounterState;
		readonly command: {
			readonly id: string;
			readonly type: "social-appeal";
			readonly source: string;
			readonly createdAt: string;
			readonly payload: {
				readonly actorId: string;
				readonly npcId: string;
			};
		};
		readonly outcome: SocialAppealResolutionResult["outcome"];
		readonly resolvedAt: string;
	};
	createAppealResolutionInput(
		state: SocialEncounterState,
		character: CharacterRecord,
	): {
		readonly reason: string;
		readonly level: number;
		readonly social: number;
		readonly interaction: number;
		readonly itemBonus: number;
		readonly dc: number;
	};
	createStartInput(
		npcId: string,
		actorId: string,
	): {
		readonly id: string;
		readonly actorId: string;
		readonly npcId: string;
		readonly requestComplexity: number;
		readonly createdAt: string;
	};
}

export function createSocialEncounterSession(): SocialEncounterSession {
	const service = new SocialEncounterService(
		new InMemoryNpcCatalogRepository(),
	);
	const diceService = new DiceService(
		new LoopingDiceRng([0.45]),
		createSequentialDiceRollIdProvider("social-appeal-roll"),
		createDeterministicClock("2026-05-20T15:30:00.000Z"),
	);

	return {
		appealResolutionService: new SocialAppealResolutionService(
			new ResolutionService(diceService),
		),
		npcs: NPC_CATALOG,
		service,
		createAppealInput,
		createAppealResolutionInput,
		createStartInput,
	};
}

function createStartInput(npcId: string, actorId: string) {
	return {
		id: "social-encounter-primary",
		actorId,
		npcId,
		requestComplexity: REQUEST_COMPLEXITY,
		createdAt: new Date().toISOString(),
	};
}

function createAppealResolutionInput(
	state: SocialEncounterState,
	character: CharacterRecord,
) {
	return {
		reason: `Apelo social de ${character.name} contra ${state.npcId}`,
		level: character.level,
		social: character.social,
		interaction: character.interaction,
		itemBonus: TRAINING_SOCIAL_ITEM_BONUS,
		dc: TRAINING_SOCIAL_APPEAL_DC,
	};
}

function createAppealInput(
	state: SocialEncounterState,
	resolution: SocialAppealResolutionResult,
) {
	const createdAt = new Date().toISOString();

	return {
		state,
		command: {
			id: `social-appeal-${state.events.length + 1}`,
			type: "social-appeal" as const,
			source: "social-appeal-character-ui",
			createdAt,
			payload: {
				actorId: state.actorId,
				npcId: state.npcId,
			},
		},
		outcome: resolution.outcome,
		resolvedAt: createdAt,
	};
}

class LoopingDiceRng implements DiceRng {
	private index = 0;

	public constructor(private readonly values: readonly number[]) {}

	public next(): number {
		const value = this.values[this.index % this.values.length];
		this.index += 1;
		return value ?? Number.NaN;
	}
}

function createSequentialDiceRollIdProvider(
	prefix: string,
): DiceRollIdProvider {
	let nextId = 1;

	return {
		generate: () => {
			const rollId = `${prefix}-${nextId}`;
			nextId += 1;
			return rollId;
		},
	};
}

function createDeterministicClock(startIso: string): DiceClock {
	const startMs = Date.parse(startIso);
	let offsetSeconds = 0;

	return {
		now: () => {
			const createdAt = new Date(startMs + offsetSeconds * 1000).toISOString();
			offsetSeconds += 1;
			return createdAt;
		},
	};
}
