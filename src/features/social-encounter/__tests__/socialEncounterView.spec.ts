import { describe, expect, it } from "vitest";
import { NPC_CATALOG } from "$lib/entities/npc";
import type { SocialEncounterState } from "../model/socialEncounterTypes";
import {
	createSocialEncounterView,
	mapSocialEncounterFailureToMessage,
} from "../model/socialEncounterView";

describe("createSocialEncounterView", () => {
	it("shows an initial pt-BR state before negotiation starts", () => {
		const view = createSocialEncounterView({
			errorMessage: null,
			npcs: NPC_CATALOG,
			selectedNpcId: "training-broker",
			state: null,
		});

		expect(view.titleLabel).toBe("Negociação social");
		expect(view.statusLabel).toBe("Nenhuma negociação ativa");
		expect(view.startButtonLabel).toBe("Iniciar negociação");
		expect(view.canStart).toBe(true);
		expect(view.canAppeal).toBe(false);
		expect(view.logLines).toEqual([
			"Inicie uma negociação para registrar apelos sociais.",
		]);
	});

	it("maps active negotiation state to readable labels", () => {
		const view = createSocialEncounterView({
			errorMessage: null,
			npcs: NPC_CATALOG,
			selectedNpcId: "training-broker",
			state: buildState({ status: "active" }),
		});

		expect(view.statusLabel).toBe("Negociação ativa");
		expect(view.attitudeLabel).toBe("Atitude: Desconfiada");
		expect(view.mentalHpLabel).toBe("HP mental 5/8");
		expect(view.patienceLabel).toBe("Paciência 6/6");
		expect(view.progressLabel).toBe("Persuasão 1/3");
		expect(view.canAppeal).toBe(true);
	});

	it("disables appeal after the encounter is closed", () => {
		const convinced = createSocialEncounterView({
			errorMessage: null,
			npcs: NPC_CATALOG,
			selectedNpcId: "training-broker",
			state: buildState({ status: "convinced" }),
		});
		const walkedAway = createSocialEncounterView({
			errorMessage: null,
			npcs: NPC_CATALOG,
			selectedNpcId: "training-broker",
			state: buildState({ status: "walked-away" }),
		});

		expect(convinced.statusLabel).toBe("NPC convencido");
		expect(convinced.canAppeal).toBe(false);
		expect(walkedAway.statusLabel).toBe("NPC encerrou a conversa");
		expect(walkedAway.canAppeal).toBe(false);
	});

	it("maps all supported attitudes and empty NPC state", () => {
		const empty = createSocialEncounterView({
			errorMessage: "Erro visível.",
			npcs: [],
			selectedNpcId: "training-broker",
			state: null,
		});
		const labels = ["friendly", "neutral", "hostile"].map(
			(attitude) =>
				createSocialEncounterView({
					errorMessage: null,
					npcs: NPC_CATALOG,
					selectedNpcId: "training-broker",
					state: buildState({
						attitude: attitude as SocialEncounterState["attitude"],
					}),
				}).attitudeLabel,
		);

		expect(empty.emptyStateLabel).toBe(
			"Nenhum NPC de treino está disponível para negociação.",
		);
		expect(empty.errorMessage).toBe("Erro visível.");
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
	});
});

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
