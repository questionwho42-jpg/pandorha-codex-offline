import { describe, expect, it } from "vitest";
import type { ClockRecord } from "$lib/entities/clock";
import {
	type FactionRecord,
	type FactionStandingRecord,
	TRAINING_FACTION_STANDINGS,
	TRAINING_FACTIONS,
} from "$lib/entities/faction";
import { NPC_CATALOG } from "$lib/entities/npc";
import type { NpcRelationshipRecord } from "$lib/entities/npc-relationship";
import {
	createSocialRelationsView,
	mapSocialStandingFailureToMessage,
} from "../model/socialRelationsView";

describe("createSocialRelationsView", () => {
	it("maps training faction standings to pt-BR relation rows", () => {
		const view = createSocialRelationsView({
			errorMessage: null,
			events: [],
			factions: TRAINING_FACTIONS,
			standings: TRAINING_FACTION_STANDINGS,
		});

		expect(view.emptyStateLabel).toBeNull();
		expect(view.npcRows).toEqual([]);
		expect(view.titleLabel).toBe("Relações sociais");
		expect(view.logLines).toEqual([
			"Escolha uma facção de treino para invocar favores ou abater dívida.",
		]);
		expect(view.rows[0]).toMatchObject({
			factionId: "training-thieves-guild",
			label: "Guilda dos Ladrões de Treino",
			kindLabel: "Guilda",
			fameLabel: "Fama 1",
			infamyLabel: "Infâmia 0",
			debtLabel: "Dívida 0/3",
			favorLabel: "Favores 0",
			intrigueLabel: "Intriga 0",
			retaliationClockLabel: null,
			statusLabel: "Patrocinada",
			canInvokeTierOneFavor: true,
			canRedeemTierOneDebt: false,
		});
	});

	it("shows debt controls based on the current debt limit", () => {
		const view = createSocialRelationsView({
			errorMessage: null,
			events: [
				{
					type: "faction-favor-invoked",
					message: "Favor Tier 1 invocado. Dívida de Sangue 2/3; Intriga 2.",
				},
			],
			factions: TRAINING_FACTIONS,
			standings: [
				buildStanding({
					bloodDebt: 2,
					intriguePoints: 2,
				}),
			],
		});

		expect(view.rows[0]).toMatchObject({
			debtLabel: "Dívida 2/3",
			intrigueLabel: "Intriga 2",
			canInvokeTierOneFavor: false,
			canRedeemTierOneDebt: true,
		});
		expect(view.logLines).toEqual([
			"Favor Tier 1 invocado. Dívida de Sangue 2/3; Intriga 2.",
		]);
	});

	it("shows active retaliation clocks on the matching faction", () => {
		const clock: ClockRecord = {
			id: "retaliation-training-thieves-guild-social-encounter-primary",
			label: "Retaliação: Guilda dos Ladrões de Treino",
			currentSlices: 0,
			maxSlices: 4,
			status: "active",
			source: "social-pressure",
			createdAt: "2026-05-26T19:00:00.000Z",
			updatedAt: "2026-05-26T19:00:00.000Z",
		};

		const view = createSocialRelationsView({
			clocks: [clock],
			errorMessage: null,
			events: [],
			factions: TRAINING_FACTIONS,
			standings: TRAINING_FACTION_STANDINGS,
		});

		expect(view.rows[0]).toMatchObject({
			factionId: "training-thieves-guild",
			retaliationClockLabel:
				"Retaliação: Guilda dos Ladrões de Treino - 0/4 fatias",
		});
	});

	it("shows individual NPC relationship rows after persistence exists", () => {
		const view = createSocialRelationsView({
			errorMessage: null,
			events: [],
			factions: TRAINING_FACTIONS,
			npcRelationships: [
				buildNpcRelationship({
					attitude: "skeptical",
					status: "strained",
					pressureDamage: 1,
				}),
			],
			npcs: NPC_CATALOG,
			standings: TRAINING_FACTION_STANDINGS,
		});

		expect(view.npcRows).toEqual([
			{
				npcId: "training-broker",
				label: "Corretora de Treino",
				factionLabel: "Liga Mercante de Treino",
				attitudeLabel: "Atitude cética",
				statusLabel: "Relação tensionada",
				pressureDamageLabel: "Pressão 1",
			},
		]);
	});

	it("maps every NPC relationship attitude, status, and fallback label", () => {
		const view = createSocialRelationsView({
			errorMessage: null,
			events: [],
			factions: TRAINING_FACTIONS,
			npcRelationships: [
				buildNpcRelationship({
					npcId: "training-broker",
					attitude: "friendly",
					status: "stable",
				}),
				buildNpcRelationship({
					npcId: "training-captain",
					attitude: "neutral",
					status: "ally",
				}),
				buildNpcRelationship({
					npcId: "unknown-npc",
					attitude: "hostile",
					status: "enemy",
				}),
				buildNpcRelationship({
					npcId: "guildless-npc",
					attitude: "skeptical",
					status: "strained",
				}),
			],
			npcs: [
				...NPC_CATALOG,
				{
					id: "guildless-npc",
					label: "Contato sem Facção",
					role: "informant",
					factionId: "missing-faction",
					tier: 1,
					mentalHp: 4,
					patience: 3,
					attitude: "skeptical",
					sourceFile: "tests",
					summary: "NPC de teste sem facção catalogada.",
				},
			],
			standings: TRAINING_FACTION_STANDINGS,
		});

		expect(view.npcRows).toEqual([
			{
				npcId: "training-broker",
				label: "Corretora de Treino",
				factionLabel: "Liga Mercante de Treino",
				attitudeLabel: "Atitude amistosa",
				statusLabel: "Relação estável",
				pressureDamageLabel: "Pressão 0",
			},
			{
				npcId: "training-captain",
				label: "Capitão de Treino",
				factionLabel: "Templo da Guerra de Treino",
				attitudeLabel: "Atitude neutra",
				statusLabel: "Aliado",
				pressureDamageLabel: "Pressão 0",
			},
			{
				npcId: "unknown-npc",
				label: "unknown-npc",
				factionLabel: "Facção desconhecida",
				attitudeLabel: "Atitude hostil",
				statusLabel: "Inimigo",
				pressureDamageLabel: "Pressão 0",
			},
			{
				npcId: "guildless-npc",
				label: "Contato sem Facção",
				factionLabel: "Facção desconhecida",
				attitudeLabel: "Atitude cética",
				statusLabel: "Relação tensionada",
				pressureDamageLabel: "Pressão 0",
			},
		]);
	});

	it("maps every faction kind and standing status to visible pt-BR labels", () => {
		const factions: readonly FactionRecord[] = [
			{ ...TRAINING_FACTIONS[0], id: "guild-test", kind: "guild" },
			{ ...TRAINING_FACTIONS[0], id: "temple-test", kind: "temple" },
			{
				...TRAINING_FACTIONS[0],
				id: "noble-house-test",
				kind: "noble-house",
			},
			{ ...TRAINING_FACTIONS[0], id: "company-test", kind: "company" },
		];
		const standings: readonly FactionStandingRecord[] = [
			buildStanding({ factionId: "guild-test", status: "unpledged" }),
			buildStanding({ factionId: "temple-test", status: "sponsored" }),
			buildStanding({ factionId: "noble-house-test", status: "ultimatum" }),
			buildStanding({ factionId: "company-test", status: "hunted" }),
		];

		const view = createSocialRelationsView({
			errorMessage: null,
			events: [],
			factions,
			standings,
		});

		expect(view.rows.map((row) => row.kindLabel)).toEqual([
			"Guilda",
			"Templo",
			"Casa nobre",
			"Companhia",
		]);
		expect(view.rows.map((row) => row.statusLabel)).toEqual([
			"Sem juramento",
			"Patrocinada",
			"Ultimato",
			"Caçada",
		]);
	});

	it("shows empty and error states without technical codes", () => {
		const view = createSocialRelationsView({
			errorMessage: "Não foi possível encontrar a facção desta relação.",
			events: [],
			factions: TRAINING_FACTIONS,
			standings: [],
		});

		expect(view.emptyStateLabel).toBe(
			"Nenhuma facção de treino está disponível nesta sessão.",
		);
		expect(view.errorMessage).toBe(
			"Não foi possível encontrar a facção desta relação.",
		);
	});
});

describe("mapSocialStandingFailureToMessage", () => {
	it("maps every social standing failure to user-facing pt-BR copy", () => {
		expect(
			mapSocialStandingFailureToMessage({
				code: "INVALID_SOCIAL_STANDING_INPUT",
				message: "invalid",
			}),
		).toBe("Revise os dados da relação antes de continuar.");
		expect(
			mapSocialStandingFailureToMessage({
				code: "FACTION_NOT_FOUND",
				message: "missing",
			}),
		).toBe("Não foi possível encontrar a facção desta relação.");
		expect(
			mapSocialStandingFailureToMessage({
				code: "FACTION_LOOKUP_FAILED",
				message: "failed",
			}),
		).toBe("Não foi possível encontrar a facção desta relação.");
		expect(
			mapSocialStandingFailureToMessage({
				code: "DEBT_LIMIT_EXCEEDED",
				message: "limit",
			}),
		).toBe(
			"Este favor alcançaria o limite de Dívida de Sangue. Abata dívida antes de pedir outro favor.",
		);
		expect(
			mapSocialStandingFailureToMessage({
				code: "INVALID_FAVOR_TIER",
				message: "tier",
			}),
		).toBe("Este tier de favor ainda não está disponível.");
		expect(
			mapSocialStandingFailureToMessage({
				code: "OPERATION_NOT_ALLOWED",
				message: "status",
			}),
		).toBe("Esta facção não pode conceder favores no estado atual.");
	});
});

function buildStanding(
	patch: Partial<FactionStandingRecord>,
): FactionStandingRecord {
	return {
		...TRAINING_FACTION_STANDINGS[0],
		...patch,
	};
}

function buildNpcRelationship(
	patch: Partial<NpcRelationshipRecord> = {},
): NpcRelationshipRecord {
	return {
		npcId: "training-broker",
		attitude: "neutral",
		status: "stable",
		pressureDamage: 0,
		appliedPressureKeysJson: "[]",
		updatedAt: "2026-05-27T12:00:00.000Z",
		...patch,
	};
}
