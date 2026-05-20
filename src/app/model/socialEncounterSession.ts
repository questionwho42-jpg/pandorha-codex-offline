import {
	InMemoryNpcCatalogRepository,
	NPC_CATALOG,
	type NpcRecord,
} from "$lib/entities/npc";
import {
	SocialEncounterService,
	type SocialEncounterState,
} from "$lib/features/social-encounter/model-api";

const TRAINING_ACTOR_ID = "session-party";
const REQUEST_COMPLEXITY = 2;

export interface SocialEncounterSession {
	readonly npcs: readonly NpcRecord[];
	readonly service: SocialEncounterService;
	createAppealInput(state: SocialEncounterState): {
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
		readonly outcome: {
			readonly kind: "success";
			readonly mentalDamage: number;
			readonly persuasionProgress: number;
		};
		readonly resolvedAt: string;
	};
	createStartInput(npcId: string): {
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

	return {
		npcs: NPC_CATALOG,
		service,
		createAppealInput,
		createStartInput,
	};
}

function createStartInput(npcId: string) {
	return {
		id: "social-encounter-primary",
		actorId: TRAINING_ACTOR_ID,
		npcId,
		requestComplexity: REQUEST_COMPLEXITY,
		createdAt: new Date().toISOString(),
	};
}

function createAppealInput(state: SocialEncounterState) {
	const createdAt = new Date().toISOString();

	return {
		state,
		command: {
			id: `social-appeal-${state.events.length + 1}`,
			type: "social-appeal" as const,
			source: "training-social-ui",
			createdAt,
			payload: {
				actorId: state.actorId,
				npcId: state.npcId,
			},
		},
		outcome: {
			kind: "success" as const,
			mentalDamage: 3,
			persuasionProgress: 1,
		},
		resolvedAt: createdAt,
	};
}
