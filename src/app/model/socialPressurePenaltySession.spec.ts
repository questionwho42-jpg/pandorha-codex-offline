import { describe, expect, it } from "vitest";
import type { ClockRecord } from "$lib/entities/clock";
import type { FactionStandingRecord } from "$lib/entities/faction";
import {
	TRAINING_FACTION_STANDINGS,
	TRAINING_FACTIONS,
} from "$lib/entities/faction";
import { NPC_CATALOG } from "$lib/entities/npc";
import type { WorldStateFlagView } from "$lib/entities/world-state";
import type { SocialPressurePenaltyIntent } from "$lib/features/social-encounter/model-api";
import type {
	SocialStandingChangeResult,
	SocialStandingFailure,
} from "$lib/features/social-standing";
import { ok, type Result } from "$lib/shared/lib/result";
import { applySocialPressurePenaltyIntent } from "./socialPressurePenaltySession";

describe("applySocialPressurePenaltyIntent", () => {
	it("applies pressure fame loss once and records the WorldState flag", async () => {
		const fakeLoseFame = createFakeLoseFame();
		const fakeGainInfamy = createFakeGainInfamy();
		const standing = buildMerchantStanding({ fameLevel: 1 });
		const intent = buildIntent();

		const first = await applySocialPressurePenaltyIntent({
			clocks: [],
			factions: TRAINING_FACTIONS,
			intent,
			factionStandings: [standing],
			gainInfamy: fakeGainInfamy.gainInfamy,
			loseFame: fakeLoseFame.loseFame,
			npcs: NPC_CATALOG,
			worldState: [],
		});
		expect(first.success).toBe(true);
		if (!first.success) {
			expect.fail(`Expected success, received ${first.error.code}`);
		}

		expect(first.data.applied).toBe(true);
		expect(first.data.infamyApplied).toBe(false);
		expect(first.data.retaliationClockCreated).toBe(false);
		expect(first.data.clocks).toEqual([]);
		expect(first.data.factionStandings[0]).toMatchObject({
			factionId: "training-merchant-league",
			fameLevel: 0,
		});
		expect(first.data.worldState).toContainEqual(intent.worldStateFlag);
		expect(fakeLoseFame.calls).toBe(1);

		const repeated = await applySocialPressurePenaltyIntent({
			clocks: first.data.clocks,
			factions: TRAINING_FACTIONS,
			intent,
			factionStandings: first.data.factionStandings,
			gainInfamy: fakeGainInfamy.gainInfamy,
			loseFame: fakeLoseFame.loseFame,
			npcs: NPC_CATALOG,
			worldState: first.data.worldState,
		});
		expect(repeated.success).toBe(true);
		if (!repeated.success) {
			expect.fail(`Expected success, received ${repeated.error.code}`);
		}

		expect(repeated.data.applied).toBe(false);
		expect(repeated.data.factionStandings[0]?.fameLevel).toBe(0);
		expect(repeated.data.worldState).toHaveLength(1);
		expect(fakeLoseFame.calls).toBe(1);
		expect(fakeGainInfamy.calls).toBe(0);
	});

	it("applies Infâmia and creates a retaliation clock when Fame is already zero", async () => {
		const fakeLoseFame = createFakeLoseFame();
		const fakeGainInfamy = createFakeGainInfamy();
		const standing = buildMerchantStanding({ fameLevel: 0, infamyLevel: 0 });
		const intent = buildIntent();

		const result = await applySocialPressurePenaltyIntent({
			clocks: [],
			factions: TRAINING_FACTIONS,
			intent,
			factionStandings: [standing],
			gainInfamy: fakeGainInfamy.gainInfamy,
			loseFame: fakeLoseFame.loseFame,
			npcs: NPC_CATALOG,
			worldState: [],
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			expect.fail(`Expected success, received ${result.error.code}`);
		}

		expect(result.data.infamyApplied).toBe(true);
		expect(result.data.retaliationClockCreated).toBe(true);
		expect(result.data.factionStandings[0]).toMatchObject({
			fameLevel: 0,
			infamyLevel: 1,
		});
		expect(result.data.worldState.map((flag) => flag.key)).toEqual([
			"npc:training-broker:social-pressure-penalty:social-encounter-primary",
			"npc:training-broker:pressure-infamy:social-encounter-primary",
		]);
		expect(result.data.clocks).toEqual([
			expect.objectContaining({
				id: "retaliation-training-merchant-league-social-encounter-primary",
				label: "Retaliação: Liga Mercante de Treino",
				currentSlices: 0,
				maxSlices: 4,
				status: "active",
				source: "social-pressure",
			}),
		]);
		expect(fakeLoseFame.calls).toBe(0);
		expect(fakeGainInfamy.calls).toBe(1);
	});

	it("creates one retaliation clock when Fame loss triggers ultimatum", async () => {
		const fakeLoseFame = createFakeLoseFame();
		const fakeGainInfamy = createFakeGainInfamy();
		const existingClock = buildRetaliationClock();

		const result = await applySocialPressurePenaltyIntent({
			clocks: [existingClock],
			factions: TRAINING_FACTIONS,
			intent: buildIntent(),
			factionStandings: [buildMerchantStanding({ bloodDebt: 4, fameLevel: 2 })],
			gainInfamy: fakeGainInfamy.gainInfamy,
			loseFame: fakeLoseFame.loseFame,
			npcs: NPC_CATALOG,
			worldState: [],
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			expect.fail(`Expected success, received ${result.error.code}`);
		}

		expect(result.data.retaliationClockCreated).toBe(false);
		expect(result.data.clocks).toEqual([existingClock]);
		expect(result.data.factionStandings[0]).toMatchObject({
			fameLevel: 1,
			status: "ultimatum",
		});
	});

	it("returns typed failures when the NPC or faction standing is missing", async () => {
		const fakeLoseFame = createFakeLoseFame();
		const fakeGainInfamy = createFakeGainInfamy();
		const missingNpc = await applySocialPressurePenaltyIntent({
			clocks: [],
			factions: TRAINING_FACTIONS,
			intent: buildIntent({ npcId: "unknown-npc" }),
			factionStandings: TRAINING_FACTION_STANDINGS,
			gainInfamy: fakeGainInfamy.gainInfamy,
			loseFame: fakeLoseFame.loseFame,
			npcs: NPC_CATALOG,
			worldState: [],
		});
		const missingStanding = await applySocialPressurePenaltyIntent({
			clocks: [],
			factions: TRAINING_FACTIONS,
			intent: buildIntent(),
			factionStandings: [],
			gainInfamy: fakeGainInfamy.gainInfamy,
			loseFame: fakeLoseFame.loseFame,
			npcs: NPC_CATALOG,
			worldState: [],
		});

		expect(missingNpc).toMatchObject({
			success: false,
			error: { code: "SOCIAL_PRESSURE_NPC_NOT_FOUND" },
		});
		expect(missingStanding).toMatchObject({
			success: false,
			error: { code: "SOCIAL_PRESSURE_STANDING_NOT_FOUND" },
		});
		expect(fakeLoseFame.calls).toBe(0);
		expect(fakeGainInfamy.calls).toBe(0);
	});
});

function createFakeLoseFame(): {
	readonly calls: number;
	readonly loseFame: (
		standing: FactionStandingRecord,
		levels?: number,
	) => Promise<Result<SocialStandingChangeResult, SocialStandingFailure>>;
} {
	let calls = 0;

	return {
		get calls() {
			return calls;
		},
		loseFame: async (standing, levels = 1) => {
			calls += 1;
			const fameLevel = Math.max(0, standing.fameLevel - levels);
			const debtLimit = fameLevel * 3;
			return ok({
				standing: {
					...standing,
					fameLevel,
					status:
						standing.bloodDebt > debtLimit ? "ultimatum" : standing.status,
				},
				debtLimit,
				event: {
					type: "faction-fame-lost",
					message: `Fama com a facção caiu para ${fameLevel}. Limite de Dívida ${debtLimit}.`,
				},
			});
		},
	};
}

function createFakeGainInfamy(): {
	readonly calls: number;
	readonly gainInfamy: (
		standing: FactionStandingRecord,
		levels?: number,
	) => Promise<Result<SocialStandingChangeResult, SocialStandingFailure>>;
} {
	let calls = 0;

	return {
		get calls() {
			return calls;
		},
		gainInfamy: async (standing, levels = 1) => {
			calls += 1;
			const infamyLevel = Math.min(5, standing.infamyLevel + levels);
			return ok({
				standing: {
					...standing,
					infamyLevel,
				},
				debtLimit: standing.fameLevel * 3,
				event: {
					type: "faction-infamy-gained",
					message: `Infâmia com a facção aumentou para ${infamyLevel}.`,
				},
			});
		},
	};
}

function buildIntent(
	patch: Partial<SocialPressurePenaltyIntent> = {},
): SocialPressurePenaltyIntent {
	const npcId = patch.npcId ?? "training-broker";
	const encounterId = patch.encounterId ?? "social-encounter-primary";
	const worldStateFlag: WorldStateFlagView =
		patch.worldStateFlag ??
		({
			key: `npc:${npcId}:social-pressure-penalty:${encounterId}`,
			value: {
				actorId: "character-lia",
				dialogueChoiceId: "threaten",
				dialogueChoiceLabel: "Pressionar",
				dialogueOptionId: "training-broker-option-threaten",
				encounterId,
				kind: "social-pressure-fame-penalty",
				npcId,
				summary:
					"Pressionar este NPC aplicou perda de 1 nível de Fama à facção associada.",
			},
			updatedAt: "2026-05-21T00:00:00.000Z",
		} satisfies WorldStateFlagView);

	return {
		actorId: "character-lia",
		dialogueChoiceId: "threaten",
		dialogueChoiceLabel: "Pressionar",
		dialogueOptionId: "training-broker-option-threaten",
		encounterId,
		npcId,
		worldStateFlag,
		...patch,
	};
}

function buildMerchantStanding(
	patch: Partial<FactionStandingRecord> = {},
): FactionStandingRecord {
	const standing = TRAINING_FACTION_STANDINGS.find(
		(candidate) => candidate.factionId === TRAINING_FACTIONS[2]?.id,
	);
	expect(standing).toBeDefined();
	if (!standing) {
		expect.fail("Missing merchant training standing.");
	}

	return {
		...standing,
		...patch,
	};
}

function buildRetaliationClock(): ClockRecord {
	return {
		id: "retaliation-training-merchant-league-social-encounter-primary",
		label: "Retaliação: Liga Mercante de Treino",
		currentSlices: 0,
		maxSlices: 4,
		status: "active",
		source: "social-pressure",
		createdAt: "2026-05-21T00:00:00.000Z",
		updatedAt: "2026-05-21T00:00:00.000Z",
	};
}
