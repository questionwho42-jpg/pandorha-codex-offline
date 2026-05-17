import { describe, expect, it } from "vitest";
import {
	BaseCharacterStats,
	EterFeverDecorator,
	ViperPoisonDecorator,
	WoundInfectionDecorator,
} from "../domain/StatusEffectDecorator";
import type { CharacterRecord } from "../model/characterSchema";

const TEST_TIMESTAMP = "2026-05-16T13:16:00.000Z";

describe("StatusEffectDecorator - Efeitos de Status do RPG Pandorha", () => {
	it("deve calcular estatísticas base sem nenhum decorador ativo", () => {
		const character = createCharacter({
			physical: 3,
			mental: 1,
			interaction: 1,
			resistance: 3,
			level: 1,
		});
		const characterClass = { id: "vanguard", baseHp: 10 };

		const baseStats = new BaseCharacterStats(character, characterClass);

		expect(baseStats.physical).toBe(3);
		expect(baseStats.mental).toBe(1);
		expect(baseStats.resistance).toBe(3);
		expect(baseStats.maxHp).toBe(16); // (baseHp: 10 + physical: 3 + resistance: 3) * level: 1 = 16
		expect(baseStats.initiativeBase).toBe(3); // level: 1 + mental: 1 + interaction: 1 = 3
		expect(baseStats.carrySlotLimit).toBe(12); // physical: 3 + resistance: 3 + 6 = 12
	});

	it("deve aplicar Febre de Éter (EterFeverDecorator) reduzindo mental e resistance e recalculando maxHp", () => {
		const character = createCharacter({
			physical: 3,
			mental: 2,
			interaction: 1,
			resistance: 3,
			level: 2,
		});
		const characterClass = { id: "vanguard", baseHp: 10 };

		const baseStats = new BaseCharacterStats(character, characterClass);
		const diseasedStats = new EterFeverDecorator(baseStats);

		// Sem doença
		expect(baseStats.mental).toBe(2);
		expect(baseStats.resistance).toBe(3);
		expect(baseStats.maxHp).toBe(32); // (10 + 3 + 3) * 2 = 32

		// Com doença (Febre de Éter: mental -1, resistance -1)
		expect(diseasedStats.mental).toBe(1);
		expect(diseasedStats.resistance).toBe(2);
		expect(diseasedStats.maxHp).toBe(30); // (10 + physical: 3 + resistance: 2) * 2 = 30
		expect(diseasedStats.initiativeBase).toBe(4); // level: 2 + mental: 1 + interaction: 1 = 4 (original seria 5)
	});

	it("deve aplicar Infecção de Ferida (WoundInfectionDecorator) reduzindo physical e impedindo cura natural", () => {
		const character = createCharacter({
			physical: 3,
			resistance: 3,
			level: 1,
		});
		const characterClass = { id: "vanguard", baseHp: 10 };

		const baseStats = new BaseCharacterStats(character, characterClass);
		const infectedStats = new WoundInfectionDecorator(baseStats);

		expect(infectedStats.physical).toBe(2); // physical -1
		expect(infectedStats.maxHp).toBe(15); // (10 + physical: 2 + resistance: 3) * 1 = 15
		expect(infectedStats.allowsNaturalRecovery).toBe(false); // impede regeneração
	});

	it("deve aplicar Veneno de Víbora (ViperPoisonDecorator) reduzindo physical em 2 e initiative em 1", () => {
		const character = createCharacter({
			physical: 4,
			mental: 1,
			interaction: 1,
			resistance: 2,
			level: 1,
		});
		const characterClass = { id: "vanguard", baseHp: 10 };

		const baseStats = new BaseCharacterStats(character, characterClass);
		const poisonedStats = new ViperPoisonDecorator(baseStats);

		expect(poisonedStats.physical).toBe(2); // physical -2
		expect(poisonedStats.initiativeBase).toBe(2); // initiative base -1 (original seria 3)
	});

	it("deve combinar múltiplos decoradores (efeito cebola recursivo)", () => {
		const character = createCharacter({
			physical: 4,
			mental: 2,
			interaction: 1,
			resistance: 3,
			level: 2,
		});
		const characterClass = { id: "vanguard", baseHp: 10 };

		const baseStats = new BaseCharacterStats(character, characterClass);

		// Embrulha na infecção (-1 físico)
		const infectedStats = new WoundInfectionDecorator(baseStats);

		// E depois na febre (-1 mental, -1 resistência)
		const complexStats = new EterFeverDecorator(infectedStats);

		// Resultados compostos:
		expect(complexStats.physical).toBe(3); // 4 original - 1 infecção = 3
		expect(complexStats.mental).toBe(1); // 2 original - 1 febre = 1
		expect(complexStats.resistance).toBe(2); // 3 original - 1 febre = 2

		// maxHp final recalculado de forma recursiva!
		// maxHp = (baseHp: 10 + physical: 3 + resistance: 2) * level: 2 = 30
		expect(complexStats.maxHp).toBe(30);

		expect(complexStats.allowsNaturalRecovery).toBe(false); // A infecção interna continua impedindo a cura!
	});
});

function createCharacter(
	patch: Partial<CharacterRecord> = {},
): CharacterRecord {
	return {
		id: "character-test",
		name: "Arthus das Sombras",
		concept: "Guerreiro do Éter",
		ancestryId: "human",
		classId: "vanguard",
		backgroundId: "solitary",
		level: 1,
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
