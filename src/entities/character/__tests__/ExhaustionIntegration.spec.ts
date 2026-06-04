import { describe, expect, it } from "vitest";
import { fail, ok } from "$lib/shared/lib/result";
import { InMemoryCampRepository } from "../../../entities/camp/infrastructure/InMemoryCampRepository";
import { CampService } from "../../../features/camp/domain/CampService";
import {
	applyStatusEffects,
	BaseCharacterStats,
	BodyFatigueDecorator,
	CellularCollapseDecorator,
} from "../domain/StatusEffectDecorator";
import type { CharacterRecord } from "../model/characterSchema";

// Define Svelte 5 runes globals before importing the state to bypass compile-time macro issues in pure Node.js test environment
// @ts-expect-error global mock
globalThis.$state = <T>(val: T) => val;
// @ts-expect-error global mock
globalThis.$derived = <T>(fn: () => T) => {
	try {
		return fn();
	} catch {
		// biome-ignore lint/suspicious/noExplicitAny: mock return
		return undefined as any;
	}
};
// @ts-expect-error global mock
globalThis.$effect = (_fn: () => void) => {};

// Import chatState dynamically after globals are defined
const { chatState } = await import(
	"../../../features/chat/model/chatState.svelte"
);

const TEST_TIMESTAMP = "2026-06-03T00:00:00.000Z";

function createCharacter(
	patch: Partial<CharacterRecord> = {},
): CharacterRecord {
	return {
		id: "char-1",
		name: "Kaelen",
		concept: "Andarilho do Deserto",
		ancestryId: "human",
		classId: "vanguard",
		backgroundId: "solitary",
		level: 1,
		experiencePoints: 0,
		tensionMeter: 0,
		physical: 3,
		mental: 2,
		social: 2,
		conflict: 2,
		interaction: 1,
		resistance: 3,
		createdAt: TEST_TIMESTAMP,
		updatedAt: TEST_TIMESTAMP,
		...patch,
	};
}

describe("Cascata de Exaustão - Integração e Decoradores", () => {
	it("deve aplicar individualmente os decoradores concretos de exaustão", () => {
		const char = createCharacter({ physical: 4, mental: 3, social: 2 });
		const baseStats = new BaseCharacterStats(char, {
			id: "vanguard",
			baseHp: 10,
		});

		// Eixos base
		expect(baseStats.physical).toBe(4);
		expect(baseStats.mental).toBe(3);
		expect(baseStats.social).toBe(2);
		expect(baseStats.maxHp).toBe(17); // (10 + 4 + 3) * 1 = 17
		expect(baseStats.maxEe).toBe(4); // level: 1 + mental: 3 = 4
		expect(baseStats.movementSpeedBase).toBe(9);

		// Nível 1: Fadiga Corporal
		const level1 = new BodyFatigueDecorator(baseStats);
		expect(level1.physical).toBe(4); // O atributo físico em si permanece inalterado na cebola, a desvantagem é tratada na rolagem

		// Nível 4: Colapso Celular (HP/EE pela metade, velocidade a 50%)
		const level4 = new CellularCollapseDecorator(baseStats);
		expect(level4.maxHp).toBe(8); // Math.floor(17 * 0.5) = 8
		expect(level4.maxEe).toBe(2); // Math.floor(4 * 0.5) = 2
		expect(level4.movementSpeedBase).toBe(4); // Math.floor(9 * 0.5) = 4
	});

	it("deve empilhar os efeitos através do applyStatusEffects", () => {
		const char = createCharacter({ physical: 4, mental: 3, social: 2 });
		const baseStats = new BaseCharacterStats(char, {
			id: "vanguard",
			baseHp: 10,
		});

		const activeEffects = [
			{ type: "body_fatigue" },
			{ type: "mental_fog" },
			{ type: "spirit_ruin" },
			{ type: "cellular_collapse" },
		];

		const decorated = applyStatusEffects(baseStats, activeEffects);

		expect(decorated.maxHp).toBe(8); // Colapso Celular dividindo maxHp por 2
		expect(decorated.maxEe).toBe(2); // Colapso Celular dividindo maxEe por 2
		expect(decorated.movementSpeedBase).toBe(4); // velocidade base dividida por 2
	});

	it("deve injetar desvantagens nas rolagens do chatState com base nos status de exaustão", () => {
		const effects = [
			{
				id: "eff-1",
				type: "body_fatigue",
				label: "Fadiga Corporal",
				severity: 1,
				isAggravated: false,
			},
			{
				id: "eff-2",
				type: "mental_fog",
				label: "Neblina Mental",
				severity: 1,
				isAggravated: false,
			},
			{
				id: "eff-3",
				type: "spirit_ruin",
				label: "Ruína Espiritual",
				severity: 1,
				isAggravated: false,
			},
		];

		// Validar Físico (deve receber desvantagem)
		const physicalMod = chatState.getStatusModifiersForAttribute(
			"Físico",
			effects,
		);
		expect(physicalMod.forcedRollType).toBe("Desvantagem");
		expect(physicalMod.appliedEffects).toContain("Fadiga Corporal");

		// Validar Mental (deve receber desvantagem)
		const mentalMod = chatState.getStatusModifiersForAttribute(
			"Mental",
			effects,
		);
		expect(mentalMod.forcedRollType).toBe("Desvantagem");
		expect(mentalMod.appliedEffects).toContain("Neblina Mental");

		// Validar Social (deve receber desvantagem)
		const socialMod = chatState.getStatusModifiersForAttribute(
			"Social",
			effects,
		);
		expect(socialMod.forcedRollType).toBe("Desvantagem");
		expect(socialMod.appliedEffects).toContain("Ruína Espiritual");

		// Validar Conflito (não deve ter desvantagem desses status de exaustão)
		const conflictMod = chatState.getStatusModifiersForAttribute(
			"Conflito",
			effects,
		);
		expect(conflictMod.forcedRollType).toBeNull();
	});

	it("deve deduzir provisões diárias no fechamento de dia e aplicar exaustão progressiva por falta", async () => {
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);

		const fakeEffectsStore: Record<string, { type: string }[]> = {
			"char-1": [],
			"char-2": [{ type: "body_fatigue" }],
		};

		interface MockStatusEffect {
			id: string;
			characterId: string;
			type: string;
			severity: number;
			severityMax: number;
			isAggravated: boolean;
			createdAt: string;
		}

		const savedEffects: MockStatusEffect[] = [];

		const params = {
			characterIds: ["char-1", "char-2"],
			mountsCount: 1, // Total de provisões necessárias: 2 + 1 = 3
			currentProvisions: 2, // Faltando 1 provisão (2 < 3)
			findStatusEffects: async (charId: string) => {
				return ok(fakeEffectsStore[charId] || []);
			},
			saveStatusEffect: async (effect: MockStatusEffect) => {
				savedEffects.push(effect);
				return ok(undefined);
			},
		};

		const result = await campService.processAdventureDayEnd(params);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.consumed).toBe(2);
			expect(result.data.remaining).toBe(0);
			// Ambos os personagens devem ter subido de nível na exaustão
			expect(result.data.exhaustionApplied.length).toBe(2);

			// char-1 não tinha exaustão -> deve ter recebido body_fatigue
			const apply1 = result.data.exhaustionApplied.find((a) =>
				a.startsWith("char-1:"),
			);
			expect(apply1).toBe("char-1:body_fatigue");

			// char-2 tinha body_fatigue -> deve ter subido para mental_fog
			const apply2 = result.data.exhaustionApplied.find((a) =>
				a.startsWith("char-2:"),
			);
			expect(apply2).toBe("char-2:mental_fog");
		}
	});

	it("deve falhar se findStatusEffects retornar erro no processAdventureDayEnd", async () => {
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);

		const params = {
			characterIds: ["char-1"],
			mountsCount: 0,
			currentProvisions: 0,
			findStatusEffects: async (_charId: string) => {
				return fail({ code: "LOOKUP_FAILED", message: "Mock lookup error" });
			},
			saveStatusEffect: async (_effect: {
				id: string;
				characterId: string;
				type: string;
				severity: number;
				severityMax: number;
				isAggravated: boolean;
				createdAt: string;
			}) => {
				return ok(undefined);
			},
		};

		const result = await campService.processAdventureDayEnd(params);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("LOOKUP_FAILED");
		}
	});

	it("deve falhar se saveStatusEffect retornar erro no processAdventureDayEnd", async () => {
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);

		const params = {
			characterIds: ["char-1"],
			mountsCount: 0,
			currentProvisions: 0,
			findStatusEffects: async (_charId: string) => {
				return ok([]);
			},
			saveStatusEffect: async (_effect: {
				id: string;
				characterId: string;
				type: string;
				severity: number;
				severityMax: number;
				isAggravated: boolean;
				createdAt: string;
			}) => {
				return fail({ code: "SAVE_FAILED", message: "Mock save error" });
			},
		};

		const result = await campService.processAdventureDayEnd(params);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("SAVE_FAILED");
		}
	});
});
