import { describe, expect, it } from "vitest";
import type { CharacterRecord } from "$lib/entities/character";
import { DIALOGUE_CHOICE_CATALOG } from "$lib/entities/dialogue-choice";
import { NPC_CATALOG } from "$lib/entities/npc";
import type { SocialAppealResolutionResult } from "../model/socialAppealResolutionTypes";
import type { SocialEncounterState } from "../model/socialEncounterTypes";
import {
	createSocialEncounterView,
	mapSocialAppealResolutionFailureToMessage,
	mapSocialEncounterFailureToMessage,
} from "../model/socialEncounterView";

describe("createSocialEncounterView", () => {
	it("shows an initial pt-BR state before negotiation starts", () => {
		const view = createSocialEncounterView({
			characters: [buildCharacter()],
			errorMessage: null,
			lastResolution: null,
			npcs: NPC_CATALOG,
			selectedActorId: "character-lia",
			selectedNpcId: "training-broker",
			state: null,
		});

		expect(view.titleLabel).toBe("Negociação social");
		expect(view.statusLabel).toBe("Nenhuma negociação ativa");
		expect(view.startButtonLabel).toBe("Iniciar negociação");
		expect(view.canStart).toBe(true);
		expect(view.canAppeal).toBe(false);
		expect(view.characterOptions).toEqual([
			{
				id: "character-lia",
				label: "Lia",
				summary: "Nível 1; Social 3; Interação 2.",
			},
		]);
		expect(view.logLines).toEqual([
			"Inicie uma negociação para registrar apelos sociais.",
		]);
	});

	it("maps active negotiation state to readable labels", () => {
		const view = createSocialEncounterView({
			characters: [buildCharacter()],
			errorMessage: null,
			lastResolution: null,
			npcs: NPC_CATALOG,
			selectedActorId: "character-lia",
			selectedNpcId: "training-broker",
			state: buildState({ status: "active", actorId: "character-lia" }),
		});

		expect(view.statusLabel).toBe("Negociação ativa");
		expect(view.attitudeLabel).toBe("Atitude: Desconfiada");
		expect(view.mentalHpLabel).toBe("HP mental 5/8");
		expect(view.patienceLabel).toBe("Paciência 6/6");
		expect(view.progressLabel).toBe("Persuasão 1/3");
		expect(view.selectedCharacterSummary).toBe(
			"Nível 1; Social 3; Interação 2.",
		);
		expect(view.canAppeal).toBe(true);
	});

	it("shows dialogue choice options and selected modifier", () => {
		const view = createSocialEncounterView({
			characters: [buildCharacter()],
			dialogueChoices: DIALOGUE_CHOICE_CATALOG,
			errorMessage: null,
			lastResolution: null,
			npcs: NPC_CATALOG,
			selectedActorId: "character-lia",
			selectedChoiceId: "bargain",
			selectedNpcId: "training-broker",
			state: buildState({ status: "active", actorId: "character-lia" }),
		});

		expect(view.dialogueChoiceOptions).toEqual([
			{ id: "persuade", label: "Persuadir" },
			{ id: "bargain", label: "Barganhar" },
			{ id: "threaten", label: "Pressionar" },
		]);
		expect(view.selectedChoiceDescription).toBe(
			"Oferecer uma troca clara para tornar o acordo mais atraente.",
		);
		expect(view.selectedChoiceModifierLabel).toBe(
			"Modificador do argumento: +1",
		);
		expect(view.canAppeal).toBe(true);

		const pressureView = createSocialEncounterView({
			characters: [buildCharacter()],
			dialogueChoices: DIALOGUE_CHOICE_CATALOG,
			errorMessage: null,
			lastResolution: null,
			npcs: NPC_CATALOG,
			selectedActorId: "character-lia",
			selectedChoiceId: "threaten",
			selectedNpcId: "training-broker",
			state: buildState({ status: "active", actorId: "character-lia" }),
		});
		expect(pressureView.selectedChoiceModifierLabel).toBe(
			"Modificador do argumento: -1",
		);
	});

	it("shows the audited social roll after an appeal is resolved", () => {
		const view = createSocialEncounterView({
			characters: [buildCharacter()],
			errorMessage: null,
			lastResolution: buildResolution(),
			npcs: NPC_CATALOG,
			selectedActorId: "character-lia",
			selectedNpcId: "training-broker",
			state: buildState({ status: "active", actorId: "character-lia" }),
		});

		expect(view.resolutionLabel).toBe(
			"Rolagem 10 + Nível 1 + Social 3 + Interação 2 + Bônus 0 = 16 contra DC 14. Grau: sucesso.",
		);
		expect(view.resolutionSummaryLabel).toBe(
			"Apelo bem-sucedido: a negociação avançou.",
		);
	});

	it("maps every social resolution degree to pt-BR copy", () => {
		const labels = [
			buildResolution("criticalSuccess"),
			buildResolution("successWithCost"),
			buildResolution("failure"),
		].map(
			(lastResolution) =>
				createSocialEncounterView({
					characters: [buildCharacter()],
					errorMessage: null,
					lastResolution,
					npcs: NPC_CATALOG,
					selectedActorId: "character-lia",
					selectedNpcId: "training-broker",
					state: buildState({
						status: "active",
						actorId: "character-lia",
					}),
				}).resolutionLabel,
		);

		expect(labels).toEqual([
			"Rolagem 10 + Nível 1 + Social 3 + Interação 2 + Bônus 0 = 16 contra DC 14. Grau: sucesso crítico.",
			"Rolagem 10 + Nível 1 + Social 3 + Interação 2 + Bônus 0 = 16 contra DC 14. Grau: sucesso com custo.",
			"Rolagem 10 + Nível 1 + Social 3 + Interação 2 + Bônus 0 = 16 contra DC 14. Grau: falha.",
		]);
	});

	it("disables appeal after the encounter is closed", () => {
		const convinced = createSocialEncounterView({
			characters: [buildCharacter()],
			errorMessage: null,
			lastResolution: null,
			npcs: NPC_CATALOG,
			selectedActorId: "character-lia",
			selectedNpcId: "training-broker",
			state: buildState({ status: "convinced", actorId: "character-lia" }),
		});
		const walkedAway = createSocialEncounterView({
			characters: [buildCharacter()],
			errorMessage: null,
			lastResolution: null,
			npcs: NPC_CATALOG,
			selectedActorId: "character-lia",
			selectedNpcId: "training-broker",
			state: buildState({ status: "walked-away", actorId: "character-lia" }),
		});

		expect(convinced.statusLabel).toBe("NPC convencido");
		expect(convinced.canAppeal).toBe(false);
		expect(walkedAway.statusLabel).toBe("NPC encerrou a conversa");
		expect(walkedAway.canAppeal).toBe(false);
	});

	it("maps all supported attitudes and empty NPC or character state", () => {
		const emptyNpc = createSocialEncounterView({
			characters: [buildCharacter()],
			errorMessage: "Erro visível.",
			lastResolution: null,
			npcs: [],
			selectedActorId: "character-lia",
			selectedNpcId: "training-broker",
			state: null,
		});
		const emptyCharacter = createSocialEncounterView({
			characters: [],
			errorMessage: null,
			lastResolution: null,
			npcs: NPC_CATALOG,
			selectedActorId: "",
			selectedNpcId: "training-broker",
			state: null,
		});
		const labels = ["friendly", "neutral", "hostile"].map(
			(attitude) =>
				createSocialEncounterView({
					characters: [buildCharacter()],
					errorMessage: null,
					lastResolution: null,
					npcs: NPC_CATALOG,
					selectedActorId: "character-lia",
					selectedNpcId: "training-broker",
					state: buildState({
						actorId: "character-lia",
						attitude: attitude as SocialEncounterState["attitude"],
					}),
				}).attitudeLabel,
		);

		expect(emptyNpc.emptyStateLabel).toBe(
			"Nenhum NPC de treino está disponível para negociação.",
		);
		expect(emptyNpc.errorMessage).toBe("Erro visível.");
		expect(emptyCharacter.emptyStateLabel).toBe(
			"Crie um personagem na aba Personagens antes de iniciar uma negociação.",
		);
		expect(labels).toEqual([
			"Atitude: Amigável",
			"Atitude: Neutra",
			"Atitude: Hostil",
		]);
	});
});

describe("mapSocialEncounterFailureToMessage", () => {
	it("maps every failure to user-facing copy", () => {
		expect(
			mapSocialEncounterFailureToMessage({
				code: "INVALID_SOCIAL_ENCOUNTER_INPUT",
				message: "invalid",
			}),
		).toBe("Revise os dados da negociação antes de continuar.");
		expect(
			mapSocialEncounterFailureToMessage({
				code: "NPC_LOOKUP_FAILED",
				message: "missing",
			}),
		).toBe("Não foi possível encontrar este NPC de treino.");
		expect(
			mapSocialEncounterFailureToMessage({
				code: "SOCIAL_ENCOUNTER_NOT_ACTIVE",
				message: "closed",
			}),
		).toBe(
			"Esta negociação já foi encerrada. Reinicie para tentar outro apelo.",
		);
		expect(
			mapSocialEncounterFailureToMessage({
				code: "INVALID_SOCIAL_APPEAL_COMMAND",
				message: "command",
			}),
		).toBe("Este apelo social ainda não está disponível nesta versão.");
		expect(
			mapSocialEncounterFailureToMessage({
				code: "ACTION_QUEUE_FAILED",
				message: "queue",
			}),
		).toBe("Não foi possível processar o apelo na fila de ações.");
		expect(mapSocialAppealResolutionFailureToMessage()).toBe(
			"Não foi possível resolver o teste social deste apelo.",
		);
	});
});

function buildCharacter(): CharacterRecord {
	return {
		id: "character-lia",
		name: "Lia",
		concept: "Negociadora de treino",
		ancestryId: "human",
		classId: "vanguard",
		backgroundId: "faith-shelter",
		level: 1,
		physical: 1,
		mental: 2,
		social: 3,
		conflict: 1,
		interaction: 2,
		resistance: 3,
		createdAt: "2026-05-20T14:00:00.000Z",
		updatedAt: "2026-05-20T14:00:00.000Z",
	};
}

function buildResolution(
	degree: SocialAppealResolutionResult["resolution"]["degree"] = "success",
): SocialAppealResolutionResult {
	return {
		resolution: {
			degree,
			total: 16,
			margin: 2,
			dc: 14,
			level: 1,
			axisValue: 3,
			applicationValue: 2,
			itemBonus: 0,
			isNaturalSuccess: false,
			isNaturalFailure: false,
			dice: {
				naturalRoll: 10,
				sides: 20,
				isNaturalCritical: false,
				isNaturalFailure: false,
				auditEntry: {
					rollId: "social-roll-1",
					reason: "Apelo social de Lia",
					sides: 20,
					naturalRoll: 10,
					createdAt: "2026-05-20T15:00:00.000Z",
				},
			},
			breakdown: {
				naturalRoll: 10,
				level: 1,
				axisValue: 3,
				applicationValue: 2,
				itemBonus: 0,
			},
		},
		outcome: {
			kind: "success",
			mentalDamage: 3,
			persuasionProgress: 1,
		},
		summary: "Apelo bem-sucedido: a negociação avançou.",
	};
}

function buildState(
	patch: Partial<SocialEncounterState>,
): SocialEncounterState {
	return {
		id: "social-encounter-primary",
		npcId: "training-broker",
		actorId: "session-party",
		status: "active",
		attitude: "skeptical",
		mentalHpCurrent: 5,
		mentalHpMax: 8,
		patienceCurrent: 6,
		patienceMax: 6,
		persuasionProgress: 1,
		persuasionTarget: 3,
		events: [],
		log: ["Apelo social bem-sucedido."],
		createdAt: "2026-05-20T14:00:00.000Z",
		updatedAt: "2026-05-20T14:01:00.000Z",
		...patch,
	};
}
