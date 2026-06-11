import { describe, expect, it } from "vitest";
import type {
	CharacterRecord,
	CharacterStatusEffectRecord,
} from "$lib/entities/character/model/characterSchema";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { TrapDowntimeCharacterService } from "../domain/TrapDecorators";
import { TrapService } from "../domain/TrapService";
import type { TrapRecord } from "../model/trapSchema";

class InMemoryFakeCharacterService implements TrapDowntimeCharacterService {
	public shouldFail = false;
	public readonly effects: {
		characterId: string;
		type: string;
		severity: number;
		severityMax: number;
		isAggravated: boolean;
	}[] = [];

	public async saveStatusEffect(effect: {
		characterId: string;
		type: string;
		severity: number;
		severityMax: number;
		isAggravated: boolean;
	}): Promise<Result<CharacterStatusEffectRecord, unknown>> {
		if (this.shouldFail) {
			return fail(new Error("Erro de gravação simulado"));
		}
		this.effects.push(effect);
		return ok({
			id: `eff-${this.effects.length}`,
			characterId: effect.characterId,
			type: effect.type as "eter_fever" | "wound_infection" | "viper_poison",
			severity: effect.severity,
			severityMax: effect.severityMax,
			isAggravated: effect.isAggravated,
			metadata: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});
	}
}

const fakeHero: CharacterRecord = {
	id: "hero-1",
	name: "Aragorn",
	concept: "Guerreiro Guardião",
	ancestryId: "human",
	classId: "warrior",
	backgroundId: "noble",
	level: 3,
	experiencePoints: 0,
	tensionMeter: 0,
	physical: 4,
	mental: 3,
	social: 2,
	conflict: 3,
	interaction: 2,
	resistance: 4,
	createdAt: "2026-05-19T00:00:00Z",
	updatedAt: "2026-05-19T00:00:00Z",
};

const fakeMechanicalTrap: TrapRecord = {
	id: "trap-mech-1",
	tileId: "tile-1",
	name: "Lâminas Retráteis",
	type: "mechanical",
	severity: "simple",
	dc: 5, // DC base = 10 + 5 + 1 (simples) = 16
	damage: 20,
	isDetected: false,
	isDisarmed: false,
	isTriggered: false,
	effects: JSON.stringify(["wound_infection"]),
	createdAt: "2026-05-19T00:00:00Z",
	updatedAt: "2026-05-19T00:00:00Z",
};

const fakeMagicalTrap: TrapRecord = {
	id: "trap-mag-1",
	tileId: "tile-1",
	name: "Nuvem de Esporos Malditos",
	type: "magical",
	severity: "deadly",
	dc: 10, // DC base = 10 + 10 + 5 (mortal) = 25
	damage: 30,
	isDetected: false,
	isDisarmed: false,
	isTriggered: false,
	effects: JSON.stringify(["viper_poison", "eter_fever"]),
	createdAt: "2026-05-19T00:00:00Z",
	updatedAt: "2026-05-19T00:00:00Z",
};

describe("TrapService & Decorators Test Suite", () => {
	const trapService = new TrapService();

	describe("Trap DC calculation", () => {
		it("should calculate correct DC for simple severity", () => {
			const dc = trapService.getTrapDC(fakeMechanicalTrap);
			expect(dc).toBe(16);
		});

		it("should calculate correct DC for hidden severity", () => {
			const hiddenTrap = { ...fakeMechanicalTrap, severity: "hidden" as const };
			const dc = trapService.getTrapDC(hiddenTrap);
			expect(dc).toBe(18); // 10 + 5 + 3
		});

		it("should calculate correct DC for deadly severity", () => {
			const dc = trapService.getTrapDC(fakeMagicalTrap);
			expect(dc).toBe(25);
		});
	});

	describe("Trap Detection (Vigília)", () => {
		it("should fail critically on roll = 1", () => {
			const res = trapService.detectTrap(fakeHero, fakeMechanicalTrap, 1);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.isDetected).toBe(false);
				expect(res.data.log).toContain("Falha Crítica (1)");
			}
		});

		it("should return error for invalid roll", () => {
			const res = trapService.detectTrap(fakeHero, fakeMechanicalTrap, 0);
			expect(res.success).toBe(false);
		});

		it("should fail when roll is not high enough to beat DC", () => {
			// DC = 16. Total = roll (5) + lvl (3) + mental (3) + interaction (2) = 13
			const res = trapService.detectTrap(fakeHero, fakeMechanicalTrap, 5);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.isDetected).toBe(false);
				expect(res.data.log).toContain("passou despercebida");
			}
		});

		it("should succeed when roll beats DC", () => {
			// DC = 16. Total = roll (10) + lvl (3) + mental (3) + interaction (2) = 18
			const res = trapService.detectTrap(fakeHero, fakeMechanicalTrap, 10);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.isDetected).toBe(true);
				expect(res.data.log).toContain("foi avistada a tempo");
			}
		});
	});

	describe("Trap Triggering & Evasion / Resistance (Sobrevivência)", () => {
		it("should return error for invalid roll", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			const res = await trapService.resolveTriggeredTrap(
				fakeHero,
				fakeMechanicalTrap,
				25,
				fakeCharService,
			);
			expect(res.success).toBe(false);
		});

		it("should apply half damage and no effects on successful evasion (mechanical)", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			// DC = 16. Total = roll (10) + lvl (3) + conflict (3) = 16
			const res = await trapService.resolveTriggeredTrap(
				fakeHero,
				fakeMechanicalTrap,
				10,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.damageTaken).toBe(10); // 20 / 2
				expect(res.data.appliedEffects).toHaveLength(0);
				expect(res.data.log).toContain("resistiu parcialmente");
			}
			expect(fakeCharService.effects).toHaveLength(0);
		});

		it("should apply full damage and infected wound effect on failed evasion (mechanical)", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			// DC = 16. Total = roll (5) + lvl (3) + conflict (3) = 11
			const res = await trapService.resolveTriggeredTrap(
				fakeHero,
				fakeMechanicalTrap,
				5,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.damageTaken).toBe(20);
				expect(res.data.appliedEffects).toEqual([
					{ type: "wound_infection", severity: 2 },
				]);
				expect(res.data.log).toContain("Infecção de Ferida (Severidade 2)");
			}
			expect(fakeCharService.effects).toHaveLength(1);
			expect(fakeCharService.effects[0]?.type).toBe("wound_infection");
		});

		it("should apply double status effects (Poison + Eter Fever) on failed resistance (magical)", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			// DC = 25. Total = roll (10) + lvl (3) + resistance (4) = 17
			const res = await trapService.resolveTriggeredTrap(
				fakeHero,
				fakeMagicalTrap,
				10,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.damageTaken).toBe(30);
				expect(res.data.appliedEffects).toEqual([
					{ type: "viper_poison", severity: 2 },
					{ type: "eter_fever", severity: 2 },
				]);
				expect(res.data.log).toContain("Veneno de Víbora (Severidade 2)");
				expect(res.data.log).toContain("Febre de Éter (Severidade 2)");
			}
			expect(fakeCharService.effects).toHaveLength(2);
			expect(fakeCharService.effects[0]?.type).toBe("viper_poison");
			expect(fakeCharService.effects[1]?.type).toBe("eter_fever");
		});
	});

	describe("Trap Disarming (Desarme Tático)", () => {
		it("should return error for invalid roll", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			const res = await trapService.disarmTrap(
				fakeHero,
				fakeMechanicalTrap,
				0,
				true,
				fakeCharService,
			);
			expect(res.success).toBe(false);
		});

		it("should award components on critical success (roll = 20)", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			const res = await trapService.disarmTrap(
				fakeHero,
				fakeMechanicalTrap,
				20,
				true,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.isDisarmed).toBe(true);
				expect(res.data.gatheredComponents).toBe(true);
				expect(res.data.damageTaken).toBe(0);
				expect(res.data.log).toContain("Sucesso Crítico");
			}
		});

		it("should award components on critical success due to high margin (total >= dc + 10, roll < 20)", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			const res = await trapService.disarmTrap(
				fakeHero,
				fakeMechanicalTrap,
				18,
				true,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.isDisarmed).toBe(true);
				expect(res.data.gatheredComponents).toBe(true);
				expect(res.data.damageTaken).toBe(0);
				expect(res.data.log).toContain("Sucesso Crítico");
			}
		});

		it("should trigger trap and apply full effects on roll = 1 in disarmTrap", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			const res = await trapService.disarmTrap(
				fakeHero,
				fakeMechanicalTrap,
				1,
				true,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.isDisarmed).toBe(false);
				expect(res.data.damageTaken).toBe(20);
				expect(res.data.effects).toEqual([
					{ type: "wound_infection", severity: 2 },
				]);
				expect(res.data.log).toContain("Falha Feia");
			}
		});

		it("should disarm successfully without components on normal success", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			// DC = 16. Total = roll (10) + lvl (3) + physical (4) + interaction (2) + trained (0) = 19
			const res = await trapService.disarmTrap(
				fakeHero,
				fakeMechanicalTrap,
				10,
				true,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.isDisarmed).toBe(true);
				expect(res.data.gatheredComponents).toBe(false);
				expect(res.data.damageTaken).toBe(0);
				expect(res.data.log).toContain("desarmada com segurança");
			}
		});

		it("should apply half damage and no effects on success with cost (falha por até 4 pontos)", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			// DC = 16. Total = roll (6) + lvl (3) + physical (4) + interaction (2) + trained (0) = 15
			const res = await trapService.disarmTrap(
				fakeHero,
				fakeMechanicalTrap,
				6,
				true,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.isDisarmed).toBe(false);
				expect(res.data.gatheredComponents).toBe(false);
				expect(res.data.damageTaken).toBe(10);
				expect(res.data.log).toContain("Sucesso com Custo");
			}
			expect(fakeCharService.effects).toHaveLength(0);
		});

		it("should suffer full damage and effects on ugly failure (falha por 5+ pontos)", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			// DC = 16. Total = roll (2) + lvl (3) + physical (4) + interaction (2) + trained (0) = 11
			const res = await trapService.disarmTrap(
				fakeHero,
				fakeMechanicalTrap,
				2,
				true,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.isDisarmed).toBe(false);
				expect(res.data.damageTaken).toBe(20);
				expect(res.data.effects).toEqual([
					{ type: "wound_infection", severity: 2 },
				]);
				expect(res.data.log).toContain("Falha Feia");
			}
			expect(fakeCharService.effects).toHaveLength(1);
			expect(fakeCharService.effects[0]?.type).toBe("wound_infection");
		});

		it("should apply destrained penalty (-4) to disarm attempt", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			// DC = 16. Total = roll (10) + lvl (3) + physical (4) + interaction (2) + untrained (-4) = 15
			const res = await trapService.disarmTrap(
				fakeHero,
				fakeMechanicalTrap,
				10,
				false,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				// Deveria cair em Sucesso com Custo devido à penalidade de destreinado
				expect(res.data.isDisarmed).toBe(false);
				expect(res.data.damageTaken).toBe(10);
				expect(res.data.log).toContain("Sucesso com Custo");
			}
		});

		it("should return error if saving status effect fails on triggered trap", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			fakeCharService.shouldFail = true;
			const res = await trapService.resolveTriggeredTrap(
				fakeHero,
				fakeMechanicalTrap,
				5,
				fakeCharService,
			);
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.message).toBe(
					"Falha ao aplicar Infecção de Ferida no herói ferido pela armadilha.",
				);
			}
		});

		it("should return error on disarm if resolveTriggeredTrap fails (ugly failure)", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			fakeCharService.shouldFail = true;
			const res = await trapService.disarmTrap(
				fakeHero,
				fakeMechanicalTrap,
				2,
				true,
				fakeCharService,
			);
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.message).toBe(
					"Falha ao aplicar Infecção de Ferida no herói ferido pela armadilha.",
				);
			}
		});

		it("should force failure on resolveTriggeredTrap when roll is 1, even if total roll beats DC", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			// Modificar atributos do herói para garantir que o total de rolagem seria enorme
			const buffedHero = {
				...fakeHero,
				level: 20,
				conflict: 20,
			};
			// DC da armadilha mecânica simples = 16.
			// Com roll = 1, o total seria 1 + 20 + 20 = 41 (que seria muito maior que 16),
			// mas por ser roll = 1, deve falhar no teste de resistência e sofrer o efeito.
			const res = await trapService.resolveTriggeredTrap(
				buffedHero,
				fakeMechanicalTrap,
				1,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.damageTaken).toBe(20); // Dano total
				expect(res.data.appliedEffects).toEqual([
					{ type: "wound_infection", severity: 2 },
				]);
			}
		});

		it("should return error for invalid roll (>20) in detectTrap", () => {
			const res = trapService.detectTrap(fakeHero, fakeMechanicalTrap, 21);
			expect(res.success).toBe(false);
		});

		it("should return error for invalid roll (>20) in disarmTrap", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			const res = await trapService.disarmTrap(
				fakeHero,
				fakeMechanicalTrap,
				21,
				true,
				fakeCharService,
			);
			expect(res.success).toBe(false);
		});

		it("should return error for invalid roll (<1) in resolveTriggeredTrap", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			const res = await trapService.resolveTriggeredTrap(
				fakeHero,
				fakeMechanicalTrap,
				0,
				fakeCharService,
			);
			expect(res.success).toBe(false);
		});

		it("should use mental attribute for disarming magical traps", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			// Para armadilha mágica (fakeMagicalTrap), o atributo de bônus deve ser o mental do herói (3).
			// DC = 25. Total = roll (16) + lvl (3) + mental (3) + interaction (2) + trained (0) = 24.
			// Com roll = 16, total (24) é menor que DC (25). Mas como total >= dc - 4 (21), deve ser Sucesso com Custo.
			const res = await trapService.disarmTrap(
				fakeHero,
				fakeMagicalTrap,
				16,
				true,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.isDisarmed).toBe(false);
				expect(res.data.damageTaken).toBe(15); // 30 / 2
				expect(res.data.log).toContain("Sucesso com Custo");
			}
		});

		it("should handle trap trigger with null/empty effects", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			const trapWithNoEffects: TrapRecord = {
				...fakeMechanicalTrap,
				effects: null as any,
			};
			// DC = 16. Total = roll (5) + lvl (3) + conflict (3) = 11
			const res = await trapService.resolveTriggeredTrap(
				fakeHero,
				trapWithNoEffects,
				5,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.damageTaken).toBe(20);
				expect(res.data.appliedEffects).toHaveLength(0);
			}
		});

		it("should ignore unknown trap effect types gracefully", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			const unknownTrap: TrapRecord = {
				...fakeMechanicalTrap,
				effects: JSON.stringify(["unknown_effect"]),
			};
			const res = await trapService.resolveTriggeredTrap(
				fakeHero,
				unknownTrap,
				5,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.damageTaken).toBe(20);
				expect(res.data.appliedEffects).toHaveLength(0);
			}
		});

		it("should apply bleeding effect on failed saving throw", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			const bleedingTrap: TrapRecord = {
				...fakeMechanicalTrap,
				id: "trap-bleeding",
				effects: JSON.stringify(["bleeding"]),
			};
			const res = await trapService.resolveTriggeredTrap(
				fakeHero,
				bleedingTrap,
				5,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.appliedEffects).toEqual([
					{ type: "bleeding", severity: 2 },
				]);
				expect(res.data.log).toContain("Sangramento (Severidade 2)");
			}
			expect(fakeCharService.effects[0]?.type).toBe("bleeding");
		});

		it("should apply silenced effect on failed saving throw", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			const silencedTrap: TrapRecord = {
				...fakeMechanicalTrap,
				id: "trap-silenced",
				effects: JSON.stringify(["silenced"]),
			};
			const res = await trapService.resolveTriggeredTrap(
				fakeHero,
				silencedTrap,
				5,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.appliedEffects).toEqual([
					{ type: "silenced", severity: 2 },
				]);
				expect(res.data.log).toContain("Silenciamento (Severidade 2)");
			}
			expect(fakeCharService.effects[0]?.type).toBe("silenced");
		});

		it("should apply immobilized effect on failed saving throw", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			const immobilizedTrap: TrapRecord = {
				...fakeMechanicalTrap,
				id: "trap-immobilized",
				effects: JSON.stringify(["immobilized"]),
			};
			const res = await trapService.resolveTriggeredTrap(
				fakeHero,
				immobilizedTrap,
				5,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.appliedEffects).toEqual([
					{ type: "immobilized", severity: 2 },
				]);
				expect(res.data.log).toContain("Imobilização (Severidade 2)");
			}
			expect(fakeCharService.effects[0]?.type).toBe("immobilized");
		});

		it("should return tensionIncreased = 3 when trigger res is noisy_rune", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			const noisyTrap: TrapRecord = {
				...fakeMechanicalTrap,
				id: "trap-noisy",
				effects: JSON.stringify(["noisy_rune"]),
			};
			const res = await trapService.resolveTriggeredTrap(
				fakeHero,
				noisyTrap,
				5,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.tensionIncreased).toBe(3);
				expect(res.data.log).toContain("+3 fatias de Tensão");
			}
		});

		it("should bubble tensionIncreased on disarm ugly failure", async () => {
			const fakeCharService = new InMemoryFakeCharacterService();
			const noisyTrap: TrapRecord = {
				...fakeMechanicalTrap,
				id: "trap-noisy",
				effects: JSON.stringify(["noisy_rune"]),
			};
			// DC = 16. Total = 2 (roll) + 3 (lvl) + 4 (physical) + 2 (interaction) = 11 (Falha Feia por 5 pontos)
			const res = await trapService.disarmTrap(
				fakeHero,
				noisyTrap,
				2,
				true,
				fakeCharService,
			);
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.isDisarmed).toBe(false);
				expect(res.data.tensionIncreased).toBe(3);
				expect(res.data.log).toContain("+3 fatias de Tensão");
			}
		});
	});
});
