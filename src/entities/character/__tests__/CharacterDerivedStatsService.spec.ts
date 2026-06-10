import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { CharacterDerivedStatsService } from "../domain/CharacterDerivedStatsService";
import type {
	CharacterDerivedStatsFailure,
	CharacterDerivedStatsResult,
} from "../model/characterDerivedStatsTypes";
import {
	canCharacterLevelUp,
	getXpRequiredForLevel,
} from "../model/characterRules";
import type { CharacterRecord } from "../model/characterSchema";

const TEST_TIMESTAMP = "2026-05-05T13:16:00.000Z";

describe("CharacterDerivedStatsService", () => {
	it("calculates level-one Vanguarda derived stats from class base HP and character attributes", () => {
		const service = new CharacterDerivedStatsService();

		const result = service.calculateCharacterDerivedStats({
			character: createCharacter({ classId: "vanguard" }),
			characterClass: { id: "vanguard", baseHp: 10 },
		});
		const stats = expectDerivedStatsSuccess(result);

		expect(stats).toEqual({
			maxHp: 16,
			initiativeBase: 3,
			carrySlotLimit: 12,
			armorClass: 14,
			stealthPenalty: 0,
		});
	});

	it("calculates level-one Tecelão derived stats without applying special magic resources", () => {
		const service = new CharacterDerivedStatsService();

		const result = service.calculateCharacterDerivedStats({
			character: createCharacter({
				classId: "weaver",
				physical: 2,
				mental: 3,
				interaction: 2,
				resistance: 1,
			}),
			characterClass: { id: "weaver", baseHp: 6 },
		});
		const stats = expectDerivedStatsSuccess(result);

		expect(stats).toEqual({
			maxHp: 9,
			initiativeBase: 6,
			carrySlotLimit: 9,
			armorClass: 13,
			stealthPenalty: 0,
		});
	});

	it("multiplies max HP retroactively by character level", () => {
		const service = new CharacterDerivedStatsService();

		const result = service.calculateCharacterDerivedStats({
			character: createCharacter({
				classId: "vanguard",
				level: 3,
				physical: 2,
				resistance: 2,
			}),
			characterClass: { id: "vanguard", baseHp: 10 },
		});
		const stats = expectDerivedStatsSuccess(result);

		expect(stats.maxHp).toBe(42);
	});

	it("rejects a class source that does not match the character class id", () => {
		const service = new CharacterDerivedStatsService();

		const result = service.calculateCharacterDerivedStats({
			character: createCharacter({ classId: "missing" }),
			characterClass: { id: "vanguard", baseHp: 10 },
		});
		const failure = expectDerivedStatsFailure(result);

		expect(failure).toMatchObject({
			code: "CHARACTER_CLASS_MISMATCH",
			details: {
				characterClassId: "missing",
				resolvedClassId: "vanguard",
			},
		});
	});

	it("rejects corrupted character records before calculating derived values", () => {
		const service = new CharacterDerivedStatsService();

		const result = service.calculateCharacterDerivedStats({
			character: {
				...createCharacter({ classId: "vanguard" }),
				name: "",
			},
			characterClass: { id: "vanguard", baseHp: 10 },
		});
		const failure = expectDerivedStatsFailure(result);

		expect(failure.code).toBe("INVALID_DERIVED_STATS_INPUT");
		expect(failure.details?.issues).toContain(
			"character.name: Too small: expected string to have >=1 characters",
		);
	});

	it("reports root-level input failures", () => {
		const service = new CharacterDerivedStatsService();

		const result = service.calculateCharacterDerivedStats(null);
		const failure = expectDerivedStatsFailure(result);
		const issues = failure.details?.issues;

		expect(failure.code).toBe("INVALID_DERIVED_STATS_INPUT");
		expect(Array.isArray(issues)).toBe(true);
		if (!Array.isArray(issues)) {
			expect.fail("Expected issues to be an array.");
		}
		expect(issues.at(0)).toMatch(/^root:/);
	});

	it("rejects corrupted class sources before calculating derived values", () => {
		const service = new CharacterDerivedStatsService();

		const result = service.calculateCharacterDerivedStats({
			character: createCharacter({ classId: "vanguard" }),
			characterClass: { id: "vanguard", baseHp: 0 },
		});
		const failure = expectDerivedStatsFailure(result);

		expect(failure.code).toBe("INVALID_DERIVED_STATS_INPUT");
		expect(failure.details?.issues).toContain(
			"characterClass.baseHp: Too small: expected number to be >=1",
		);
	});

	it("applies frost weather modifier by subtracting 1 from physical", () => {
		const service = new CharacterDerivedStatsService();

		const result = service.calculateCharacterDerivedStats({
			character: createCharacter({
				classId: "vanguard",
				physical: 3,
				resistance: 3,
			}),
			characterClass: { id: "vanguard", baseHp: 10 },
			climaExtremo: "frost",
		});
		const stats = expectDerivedStatsSuccess(result);

		// physical = 3 - 1 = 2
		// maxHp = (10 + 2 + 3) * 1 = 15 (normally 16)
		// carrySlotLimit = 2 + 3 + 6 = 11 (normally 12)
		// armorClass = 10 + 1 + 2 = 13 (normally 14)
		expect(stats.maxHp).toBe(15);
		expect(stats.carrySlotLimit).toBe(11);
		expect(stats.armorClass).toBe(13);
	});

	it("applies heat weather modifier by subtracting 1 from mental", () => {
		const service = new CharacterDerivedStatsService();

		const result = service.calculateCharacterDerivedStats({
			character: createCharacter({
				classId: "vanguard",
				mental: 1,
				interaction: 1,
			}),
			characterClass: { id: "vanguard", baseHp: 10 },
			climaExtremo: "heat",
		});
		const stats = expectDerivedStatsSuccess(result);

		// mental = 1 - 1 = 0
		// initiativeBase = 1 (level) + 0 (mental) + 1 (interaction) = 2 (normally 3)
		expect(stats.initiativeBase).toBe(2);
	});

	it("applies storm weather modifier by subtracting 1 from initiativeBase and armorClass", () => {
		const service = new CharacterDerivedStatsService();

		const result = service.calculateCharacterDerivedStats({
			character: createCharacter({
				classId: "vanguard",
				physical: 3,
				mental: 1,
				interaction: 1,
			}),
			characterClass: { id: "vanguard", baseHp: 10 },
			climaExtremo: "storm",
		});
		const stats = expectDerivedStatsSuccess(result);

		// initiativeBase = 1 + 1 + 1 - 1 = 2 (normally 3)
		// armorClass = 10 + 1 + 3 - 1 = 13 (normally 14)
		expect(stats.initiativeBase).toBe(2);
		expect(stats.armorClass).toBe(13);
	});
});

function createCharacter(
	patch: Partial<CharacterRecord> = {},
): CharacterRecord {
	return {
		id: "character-1",
		name: "Kael de Almar",
		concept: "Guardião da caravana",
		ancestryId: "human",
		classId: "vanguard",
		backgroundId: "acolyte",
		level: 1,
		experiencePoints: 0,
		tensionMeter: 0,
		physical: 3,
		mental: 1,
		social: 2,
		conflict: 2,
		interaction: 1,
		resistance: 3,
		createdAt: TEST_TIMESTAMP,
		updatedAt: TEST_TIMESTAMP,
		...patch,
	};
}

function expectDerivedStatsSuccess(
	result: Result<CharacterDerivedStatsResult, CharacterDerivedStatsFailure>,
): CharacterDerivedStatsResult {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectDerivedStatsFailure(
	result: Result<CharacterDerivedStatsResult, CharacterDerivedStatsFailure>,
): CharacterDerivedStatsFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

describe("characterRules progression helpers", () => {
	describe("getXpRequiredForLevel", () => {
		it("deve retornar o limite correto de XP por nível", () => {
			expect(getXpRequiredForLevel(2)).toBe(100);
			expect(getXpRequiredForLevel(3)).toBe(300);
			expect(getXpRequiredForLevel(4)).toBe(600);
			expect(getXpRequiredForLevel(5)).toBe(1000);
		});

		it("deve retornar o padrão 999999 se o nível estiver fora dos limites cadastrados", () => {
			expect(getXpRequiredForLevel(99)).toBe(999999);
		});
	});

	describe("canCharacterLevelUp", () => {
		it("deve retornar true se possuir XP suficiente e nível < 20", () => {
			expect(canCharacterLevelUp(100, 1)).toBe(true);
			expect(canCharacterLevelUp(300, 2)).toBe(true);
			expect(canCharacterLevelUp(1000, 4)).toBe(true);
		});

		it("deve retornar false se não possuir XP suficiente", () => {
			expect(canCharacterLevelUp(50, 1)).toBe(false);
			expect(canCharacterLevelUp(299, 2)).toBe(false);
		});

		it("deve retornar false se o nível for >= 20, independente do XP", () => {
			expect(canCharacterLevelUp(1000000, 20)).toBe(false);
			expect(canCharacterLevelUp(1000000, 21)).toBe(false);
		});
	});
});
