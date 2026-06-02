import { describe, expect, it } from "vitest";
import { ArmorStatsDecorator } from "../domain/ArmorStatsDecorator";
import {
	BaseCharacterStats,
	BleedingDecorator,
	EncumberedStatusDecorator,
	EterFeverDecorator,
	ImmobilizedDecorator,
	LatentDiscoordinationDecorator,
	MoribundDecorator,
	SilencedDecorator,
	UnconsciousDecorator,
	ViperPoisonDecorator,
	WoundInfectionDecorator,
} from "../domain/StatusEffectDecorator";
import {
	AvatarGuerraDecorator,
	CacadaSelvagemDecorator,
	RedeIntrigasDecorator,
	SurtoTempoDecorator,
} from "../domain/UltimateStatsDecorators";
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
		expect(baseStats.armorClass).toBe(14); // sem armadura: 10 + level: 1 + physical: 3 = 14
		expect(baseStats.stealthPenalty).toBe(0);
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

	it("deve aplicar Sangramento (BleedingDecorator) reduzindo physical e impedindo cura natural", () => {
		const character = createCharacter({
			physical: 3,
			resistance: 3,
			level: 1,
		});
		const baseStats = new BaseCharacterStats(character, {
			id: "vanguard",
			baseHp: 10,
		});
		const bleedingStats = new BleedingDecorator(baseStats);

		expect(bleedingStats.physical).toBe(2); // physical -1
		expect(bleedingStats.allowsNaturalRecovery).toBe(false);
	});

	it("deve aplicar Silenciado (SilencedDecorator) reduzindo mental e interaction", () => {
		const character = createCharacter({
			mental: 3,
			interaction: 3,
			level: 1,
		});
		const baseStats = new BaseCharacterStats(character, {
			id: "vanguard",
			baseHp: 10,
		});
		const silencedStats = new SilencedDecorator(baseStats);

		expect(silencedStats.mental).toBe(2); // mental -1
		expect(silencedStats.interaction).toBe(2); // interaction -1
	});

	it("deve aplicar Imobilizado (ImmobilizedDecorator) reduzindo movementSpeedBase para 0, conflict e initiative", () => {
		const character = createCharacter({
			physical: 3,
			mental: 3,
			interaction: 3,
			conflict: 3,
			level: 1,
		});
		const baseStats = new BaseCharacterStats(character, {
			id: "vanguard",
			baseHp: 10,
		});
		const immobilizedStats = new ImmobilizedDecorator(baseStats);

		expect(immobilizedStats.movementSpeedBase).toBe(0);
		expect(immobilizedStats.conflict).toBe(1); // conflict -2
		expect(immobilizedStats.initiativeBase).toBe(5); // original: lvl 1 + mental 3 + interaction 3 = 7. Penalizado: 7 - 2 = 5
	});

	describe("Logística de Carga e Sobrecarga (EncumberedStatusDecorator)", () => {
		it("deve aplicar estado de Carga Leve se o peso não exceder o limite", () => {
			const character = createCharacter({
				physical: 3,
				resistance: 3,
				level: 1,
			});
			const baseStats = new BaseCharacterStats(character, {
				id: "vanguard",
				baseHp: 10,
			});

			// carrySlotLimit = 3 + 3 + 6 = 12 slots. Peso equipado = 5 slots.
			const encumberedStats = new EncumberedStatusDecorator(baseStats, 5);

			expect(encumberedStats.currentCarryWeight).toBe(5);
			expect(encumberedStats.encumbranceState).toBe("light");
			expect(encumberedStats.movementSpeedBase).toBe(9);
			expect(encumberedStats.initiativeBase).toBe(baseStats.initiativeBase);
		});

		it("deve aplicar estado Sobrecarregado (encumbered) se o peso exceder o limite, reduzindo velocidade em 3m e iniciativa em 2", () => {
			const character = createCharacter({
				physical: 3,
				resistance: 3,
				level: 1,
				mental: 1,
				interaction: 1,
			});
			const baseStats = new BaseCharacterStats(character, {
				id: "vanguard",
				baseHp: 10,
			});

			// carrySlotLimit = 12. Peso equipado = 13.
			const encumberedStats = new EncumberedStatusDecorator(baseStats, 13);

			expect(encumberedStats.encumbranceState).toBe("encumbered");
			expect(encumberedStats.movementSpeedBase).toBe(6); // 9 - 3 = 6m
			expect(encumberedStats.initiativeBase).toBe(1); // original: level 1 + mental 1 + interaction 1 = 3. Penalidade: 3 - 2 = 1.
		});

		it("deve aplicar estado Imobilizado (overloaded) se o peso exceder o limite + 5, reduzindo velocidade para 0m", () => {
			const character = createCharacter({
				physical: 3,
				resistance: 3,
				level: 1,
			});
			const baseStats = new BaseCharacterStats(character, {
				id: "vanguard",
				baseHp: 10,
			});

			// carrySlotLimit = 12. Peso equipado = 18.
			const encumberedStats = new EncumberedStatusDecorator(baseStats, 18);

			expect(encumberedStats.encumbranceState).toBe("overloaded");
			expect(encumberedStats.movementSpeedBase).toBe(0); // Imobilizado
			expect(encumberedStats.initiativeBase).toBe(1); // initiative: 3 - 2 = 1.
		});

		it("deve conceder bônus de ancestralidade Anão (+2 slots de carga)", () => {
			const character = createCharacter({
				ancestryId: "dwarf",
				physical: 3,
				resistance: 3,
			});
			const baseStats = new BaseCharacterStats(character, {
				id: "vanguard",
				baseHp: 10,
			});

			// carrySlotLimit = physical: 3 + resistance: 3 + 6 + bonus anão: 2 = 14 slots
			expect(baseStats.carrySlotLimit).toBe(14);
		});

		it("deve encolher a capacidade de carga de forma reativa se doenças afetarem atributos físicos/resistência na cebola", () => {
			const character = createCharacter({
				ancestryId: "dwarf",
				physical: 3,
				resistance: 3,
				level: 1,
			});
			const baseStats = new BaseCharacterStats(character, {
				id: "vanguard",
				baseHp: 10,
			});

			// Febre de Éter (-1 na resistência)
			const diseasedStats = new EterFeverDecorator(baseStats);

			// carrySlotLimit deve encolher de 14 para 13 slots de forma reativa na cebola!
			expect(diseasedStats.carrySlotLimit).toBe(13); // physical: 3 + resistance: 2 + 6 + 2 = 13
		});
	});

	describe("ArmorStatsDecorator & Classe de Armadura", () => {
		it("deve calcular a CA com armadura leve de couro (+2 CA, Físico completo, sem penalidades)", () => {
			const character = createCharacter({
				physical: 3,
				level: 1,
			});
			const baseStats = new BaseCharacterStats(character, {
				id: "vanguard",
				baseHp: 10,
			});
			const equippedStats = new ArmorStatsDecorator(baseStats, {
				armorBonus: 2,
				isHeavy: false,
				isNoisy: false,
				shieldBonus: 0,
			});

			// CA = 10 + Nível: 1 + Couro: 2 + Físico: 3 + Escudo: 0 = 16
			expect(equippedStats.armorClass).toBe(16);
			expect(equippedStats.movementSpeedBase).toBe(9); // velocidade original
			expect(equippedStats.stealthPenalty).toBe(0);
		});

		it("deve calcular a CA com armadura pesada de placas (+5 CA, Físico zerado, -3m velocidade e -2 furtividade)", () => {
			const character = createCharacter({
				physical: 3,
				level: 1,
			});
			const baseStats = new BaseCharacterStats(character, {
				id: "vanguard",
				baseHp: 10,
			});
			const equippedStats = new ArmorStatsDecorator(baseStats, {
				armorBonus: 5,
				isHeavy: true,
				isNoisy: true,
				shieldBonus: 0,
			});

			// CA = 10 + Nível: 1 + Placas: 5 + Físico Limitado: 0 + Escudo: 0 = 16
			expect(equippedStats.armorClass).toBe(16);
			expect(equippedStats.movementSpeedBase).toBe(6); // 9m - 3m = 6m
			expect(equippedStats.stealthPenalty).toBe(-2); // barulhenta
		});

		it("deve somar o escudo redondo na CA (+1 CA)", () => {
			const character = createCharacter({
				physical: 3,
				level: 1,
			});
			const baseStats = new BaseCharacterStats(character, {
				id: "vanguard",
				baseHp: 10,
			});
			const equippedStats = new ArmorStatsDecorator(baseStats, {
				armorBonus: 2, // Couro
				isHeavy: false,
				isNoisy: false,
				shieldBonus: 1, // Escudo Redondo
			});

			// CA = 10 + Nível: 1 + Couro: 2 + Físico: 3 + Escudo: 1 = 17
			expect(equippedStats.armorClass).toBe(17);
		});

		it("deve propagar a redução de Físico reativamente na CA de armadura leve", () => {
			const character = createCharacter({
				physical: 3,
				level: 1,
			});
			const baseStats = new BaseCharacterStats(character, {
				id: "vanguard",
				baseHp: 10,
			});
			const poisonedStats = new ViperPoisonDecorator(baseStats); // physical -2 -> Físico 1
			const equippedStats = new ArmorStatsDecorator(poisonedStats, {
				armorBonus: 2,
				isHeavy: false,
				isNoisy: false,
				shieldBonus: 0,
			});

			// CA = 10 + Nível: 1 + Couro: 2 + Físico Decorado: 1 + Escudo: 0 = 14
			expect(equippedStats.armorClass).toBe(14);
		});
	});

	describe("Efeitos de Condições de Inconsciência e 0 HP", () => {
		it("deve aplicar UnconsciousDecorator reduzindo ações e velocidade a zero, e ativando falha automática de defesa", () => {
			const character = createCharacter();
			const baseStats = new BaseCharacterStats(character, {
				id: "vanguard",
				baseHp: 10,
			});
			const unconsciousStats = new UnconsciousDecorator(baseStats);

			expect(unconsciousStats.extraActions).toBe(0);
			expect(unconsciousStats.movementSpeedBase).toBe(0);
			expect(unconsciousStats.automaticDefenseFailure).toBe(true);
		});

		it("deve aplicar MoribundDecorator herdando comportamento inconsciente", () => {
			const character = createCharacter();
			const baseStats = new BaseCharacterStats(character, {
				id: "vanguard",
				baseHp: 10,
			});
			const moribundStats = new MoribundDecorator(baseStats);

			expect(moribundStats.extraActions).toBe(0);
			expect(moribundStats.movementSpeedBase).toBe(0);
			expect(moribundStats.automaticDefenseFailure).toBe(true);
		});
	});

	describe("Decoradores de Ultimates", () => {
		it("deve aplicar AvatarGuerraDecorator com aumento de tamanho, HP máximo e dano com armas", () => {
			const character = createCharacter({
				physical: 3,
				resistance: 3,
				level: 1,
			});
			const baseStats = new BaseCharacterStats(character, {
				id: "vanguard",
				baseHp: 10,
			});
			const ultimateStats = new AvatarGuerraDecorator(baseStats);

			expect(ultimateStats.size).toBe("large");
			expect(ultimateStats.maxHp).toBe(36); // maxHp base seria 16 + 20 = 36
			expect(ultimateStats.weaponDamageBonus).toBe(2);
		});

		it("deve aplicar SurtoTempoDecorator com aumento de ações e bônus no eixo físico", () => {
			const character = createCharacter({ physical: 3, level: 1 });
			const baseStats = new BaseCharacterStats(character, {
				id: "weaver",
				baseHp: 8,
			});
			const ultimateStats = new SurtoTempoDecorator(baseStats);

			expect(ultimateStats.extraActions).toBe(1);
			expect(ultimateStats.physical).toBe(5); // 3 + 2 = 5
		});

		it("deve aplicar CacadaSelvagemDecorator com bônus de ataque e imunidade a terreno difícil", () => {
			const character = createCharacter({ level: 1 });
			const baseStats = new BaseCharacterStats(character, {
				id: "hunter",
				baseHp: 10,
			});
			const ultimateStats = new CacadaSelvagemDecorator(baseStats);

			expect(ultimateStats.attackBonus).toBe(5);
			expect(ultimateStats.ignoresDifficultTerrain).toBe(true);
		});

		it("deve aplicar RedeIntrigasDecorator sem bônus numéricos específicos", () => {
			const character = createCharacter({ level: 1 });
			const baseStats = new BaseCharacterStats(character, {
				id: "envoy",
				baseHp: 10,
			});
			const ultimateStats = new RedeIntrigasDecorator(baseStats);

			expect(ultimateStats.level).toBe(1);
		});
	});

	describe("Descoordenação Latente (LatentDiscoordinationDecorator)", () => {
		it("deve propagar a flag hasLatentDiscoordination e dados do eixo/testes", () => {
			const character = createCharacter({ level: 1 });
			const baseStats = new BaseCharacterStats(character, {
				id: "vanguard",
				baseHp: 10,
			});
			const discoordStats = new LatentDiscoordinationDecorator(
				baseStats,
				"mental",
				3,
			);

			expect(discoordStats.hasLatentDiscoordination).toBe(true);
			expect(discoordStats.latentDiscoordinationAxis).toBe("mental");
			expect(discoordStats.latentDiscoordinationTestsLeft).toBe(3);
		});
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
		experiencePoints: 0,
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
