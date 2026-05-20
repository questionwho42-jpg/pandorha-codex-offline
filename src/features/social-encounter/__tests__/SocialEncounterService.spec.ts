import { describe, expect, it } from "vitest";
import { InMemoryNpcCatalogRepository } from "$lib/entities/npc";
import {
	SocialEncounterService,
	type SocialEncounterState,
} from "$lib/features/social-encounter/model-api";
import type { ActionCommand } from "$lib/shared/action-queue";

describe("SocialEncounterService", () => {
	it("starts an encounter with training broker using NPC resources", async () => {
		const service = createService();

		const result = await service.startEncounter({
			id: "encounter-one",
			actorId: "hero-one",
			npcId: "training-broker",
			requestComplexity: 2,
			createdAt: "2026-05-20T12:00:00.000Z",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}

		expect(result.data).toMatchObject({
			id: "encounter-one",
			actorId: "hero-one",
			npcId: "training-broker",
			status: "active",
			attitude: "skeptical",
			mentalHpCurrent: 8,
			mentalHpMax: 8,
			patienceCurrent: 6,
			patienceMax: 6,
			persuasionProgress: 0,
			persuasionTarget: 3,
		});
		expect(result.data.log).toEqual([
			"Negociação iniciada com Corretora de Treino. Trilha 3; Paciência 6.",
		]);
	});

	it("returns typed NPC lookup failure when NPC is missing", async () => {
		const service = createService();

		const result = await service.startEncounter({
			id: "encounter-one",
			actorId: "hero-one",
			npcId: "missing-npc",
			requestComplexity: 2,
			createdAt: "2026-05-20T12:00:00.000Z",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error.code).toBe("NPC_LOOKUP_FAILED");
	});

	it("returns invalid input before looking up NPC", async () => {
		const service = createService();

		const result = await service.startEncounter({
			id: "encounter-one",
			actorId: "",
			npcId: "training-broker",
			requestComplexity: 2,
			createdAt: "2026-05-20T12:00:00.000Z",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error.code).toBe("INVALID_SOCIAL_ENCOUNTER_INPUT");
	});

	it("returns typed NPC lookup failure when repository fails", async () => {
		const repository = new InMemoryNpcCatalogRepository();
		repository.failNextCall();
		const service = new SocialEncounterService(repository);

		const result = await service.startEncounter({
			id: "encounter-one",
			actorId: "hero-one",
			npcId: "training-broker",
			requestComplexity: 2,
			createdAt: "2026-05-20T12:00:00.000Z",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error.code).toBe("NPC_LOOKUP_FAILED");
	});

	it("applies a successful social appeal and records deterministic log", async () => {
		const service = createService();
		const state = await startBrokerEncounter(service);

		const result = service.resolveAppeal({
			state,
			command: createSocialAppealCommand("appeal-one"),
			outcome: {
				kind: "success",
				mentalDamage: 3,
				persuasionProgress: 1,
			},
			resolvedAt: "2026-05-20T12:01:00.000Z",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.status).toBe("active");
		expect(result.data.mentalHpCurrent).toBe(5);
		expect(result.data.persuasionProgress).toBe(1);
		expect(result.data.log).toContain(
			"Apelo social bem-sucedido. HP mental 5/8; Progresso 1/3.",
		);
	});

	it("convinces the NPC when mental HP reaches zero", async () => {
		const service = createService();
		const state = await startBrokerEncounter(service);

		const result = service.resolveAppeal({
			state,
			command: createSocialAppealCommand("appeal-one"),
			outcome: {
				kind: "success",
				mentalDamage: 8,
				persuasionProgress: 1,
			},
			resolvedAt: "2026-05-20T12:01:00.000Z",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.status).toBe("convinced");
		expect(result.data.mentalHpCurrent).toBe(0);
		expect(result.data.log).toContain("O NPC foi convencido pelo apelo.");
	});

	it("convinces the NPC when persuasion track is completed", async () => {
		const service = createService();
		const state = await startBrokerEncounter(service);

		const result = service.resolveAppeal({
			state,
			command: createSocialAppealCommand("appeal-one"),
			outcome: {
				kind: "success",
				mentalDamage: 1,
				persuasionProgress: 3,
			},
			resolvedAt: "2026-05-20T12:01:00.000Z",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.status).toBe("convinced");
		expect(result.data.persuasionProgress).toBe(3);
	});

	it("applies a failed social appeal and reduces patience", async () => {
		const service = createService();
		const state = await startBrokerEncounter(service);

		const result = service.resolveAppeal({
			state,
			command: createSocialAppealCommand("appeal-one"),
			outcome: {
				kind: "failure",
				patienceDamage: 2,
			},
			resolvedAt: "2026-05-20T12:01:00.000Z",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.status).toBe("active");
		expect(result.data.patienceCurrent).toBe(4);
		expect(result.data.log).toContain("Apelo social falhou. Paciência 4/6.");
	});

	it("ends as walked away when patience reaches zero", async () => {
		const service = createService();
		const state = await startBrokerEncounter(service);

		const result = service.resolveAppeal({
			state,
			command: createSocialAppealCommand("appeal-one"),
			outcome: {
				kind: "failure",
				patienceDamage: 6,
			},
			resolvedAt: "2026-05-20T12:01:00.000Z",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.status).toBe("walked-away");
		expect(result.data.patienceCurrent).toBe(0);
		expect(result.data.log).toContain("O NPC encerrou a negociação.");
	});

	it("rejects commands that are not social appeals", async () => {
		const service = createService();
		const state = await startBrokerEncounter(service);

		const result = service.resolveAppeal({
			state,
			command: { ...createSocialAppealCommand("appeal-one"), type: "attack" },
			outcome: {
				kind: "success",
				mentalDamage: 1,
				persuasionProgress: 1,
			},
			resolvedAt: "2026-05-20T12:01:00.000Z",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error.code).toBe("INVALID_SOCIAL_APPEAL_COMMAND");
	});

	it("rejects appeals when encounter is already finished", async () => {
		const service = createService();
		const state = {
			...(await startBrokerEncounter(service)),
			status: "convinced",
		} satisfies SocialEncounterState;

		const result = service.resolveAppeal({
			state,
			command: createSocialAppealCommand("appeal-one"),
			outcome: {
				kind: "success",
				mentalDamage: 1,
				persuasionProgress: 1,
			},
			resolvedAt: "2026-05-20T12:01:00.000Z",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error.code).toBe("SOCIAL_ENCOUNTER_NOT_ACTIVE");
	});

	it("returns action queue failure for invalid command payload", async () => {
		const service = createService();
		const state = await startBrokerEncounter(service);

		const result = service.resolveAppeal({
			state,
			command: {
				id: "appeal-one",
				type: "social-appeal",
				createdAt: "not-a-date",
			},
			outcome: {
				kind: "success",
				mentalDamage: 1,
				persuasionProgress: 1,
			},
			resolvedAt: "2026-05-20T12:01:00.000Z",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error.code).toBe("ACTION_QUEUE_FAILED");
	});

	it("returns invalid input without mutating the provided state", async () => {
		const service = createService();
		const state = await startBrokerEncounter(service);

		const result = service.resolveAppeal({
			state,
			command: createSocialAppealCommand("appeal-one"),
			outcome: {
				kind: "success",
				mentalDamage: 1,
				persuasionProgress: 1,
			},
			resolvedAt: "invalid-date",
		});

		expect(result.success).toBe(false);
		if (result.success) {
			return;
		}
		expect(result.error.code).toBe("INVALID_SOCIAL_ENCOUNTER_INPUT");
		expect(state.mentalHpCurrent).toBe(8);
		expect(state.patienceCurrent).toBe(6);
		expect(state.events).toHaveLength(1);
	});
});

function createService(): SocialEncounterService {
	return new SocialEncounterService(new InMemoryNpcCatalogRepository());
}

async function startBrokerEncounter(
	service: SocialEncounterService,
): Promise<SocialEncounterState> {
	const result = await service.startEncounter({
		id: "encounter-one",
		actorId: "hero-one",
		npcId: "training-broker",
		requestComplexity: 2,
		createdAt: "2026-05-20T12:00:00.000Z",
	});

	if (!result.success) {
		expect(result.success).toBe(true);
		return createFallbackEncounterState();
	}

	return result.data;
}

function createSocialAppealCommand(id: string): ActionCommand {
	return {
		id,
		type: "social-appeal",
		source: "test",
		createdAt: "2026-05-20T12:01:00.000Z",
		payload: {
			actorId: "hero-one",
			npcId: "training-broker",
		},
	};
}

function createFallbackEncounterState(): SocialEncounterState {
	return {
		id: "fallback-encounter",
		actorId: "hero-one",
		npcId: "training-broker",
		status: "active",
		attitude: "neutral",
		mentalHpCurrent: 1,
		mentalHpMax: 1,
		patienceCurrent: 1,
		patienceMax: 1,
		persuasionProgress: 0,
		persuasionTarget: 1,
		events: [
			{
				type: "social-encounter-started",
				message: "Fallback de teste.",
				createdAt: "2026-05-20T12:00:00.000Z",
			},
		],
		log: ["Fallback de teste."],
		createdAt: "2026-05-20T12:00:00.000Z",
		updatedAt: "2026-05-20T12:00:00.000Z",
	};
}
