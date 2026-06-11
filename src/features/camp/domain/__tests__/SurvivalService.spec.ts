import { describe, expect, it } from "vitest";
import { InMemoryCampRepository } from "$lib/entities/camp/infrastructure/InMemoryCampRepository";
import type { CharacterRepository } from "$lib/entities/character/domain/CharacterRepository";
import type {
	CharacterRecord,
	CharacterStatusEffectRecord,
} from "$lib/entities/character/model/characterSchema";
import type { CharacterRepositoryFailure } from "$lib/entities/character/model/characterTypes";
import type { WorldStateRepository } from "$lib/entities/world-state/domain/WorldStateRepository";
import type { WorldStateEntryRecord } from "$lib/entities/world-state/model/worldStateSchema";
import type { WorldTileRecord } from "$lib/entities/world-tile";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { CampService } from "../CampService";
import { SurvivalService } from "../SurvivalService";

// Mock implementation of WorldStateRepository
class MockWorldStateRepository implements WorldStateRepository {
	public flags = new Map<string, string>();

	public async setFlag(flag: {
		key: string;
		valueJson: string;
		updatedAt: string;
	}): Promise<Result<WorldStateEntryRecord, any>> {
		this.flags.set(flag.key, flag.valueJson);
		return ok({
			key: flag.key,
			valueJson: flag.valueJson,
			updatedAt: flag.updatedAt,
		});
	}

	public async getFlag(
		key: string,
	): Promise<Result<WorldStateEntryRecord, any>> {
		if (this.flags.has(key)) {
			return ok({
				key,
				valueJson: this.flags.get(key)!,
				updatedAt: new Date().toISOString(),
			});
		}
		return fail({ code: "WORLD_STATE_FLAG_NOT_FOUND", message: "Not found" });
	}

	public async listFlagsByPrefix(
		prefix: string,
	): Promise<Result<readonly WorldStateEntryRecord[], any>> {
		const result: WorldStateEntryRecord[] = [];
		for (const [key, valueJson] of this.flags.entries()) {
			if (key.startsWith(prefix)) {
				result.push({
					key,
					valueJson,
					updatedAt: new Date().toISOString(),
				});
			}
		}
		return ok(result);
	}
}

// Mock implementation of CharacterRepository
class MockCharacterRepository implements CharacterRepository {
	public characters = new Map<string, CharacterRecord>();
	public statusEffects: CharacterStatusEffectRecord[] = [];

	public async findStatusEffectsByCharacterId(
		characterId: string,
	): Promise<
		Result<CharacterStatusEffectRecord[], CharacterRepositoryFailure>
	> {
		return ok(
			this.statusEffects.filter((eff) => eff.characterId === characterId),
		);
	}

	public async saveStatusEffect(
		effect: any,
	): Promise<Result<CharacterStatusEffectRecord, CharacterRepositoryFailure>> {
		const existingIndex = this.statusEffects.findIndex(
			(eff) => eff.id === effect.id,
		);
		if (existingIndex !== -1) {
			this.statusEffects[existingIndex] = effect;
		} else {
			this.statusEffects.push(effect);
		}
		return ok(effect);
	}

	public async findById(
		id: string,
	): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
		const char = this.characters.get(id);
		if (char) return ok(char);
		return fail({
			code: "CHARACTER_NOT_FOUND",
			message: "Not found",
		} as any);
	}

	public async save(
		character: any,
	): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
		this.characters.set(character.id, character);
		return ok(character);
	}

	public async deleteStatusEffect(
		id: string,
	): Promise<Result<void, CharacterRepositoryFailure>> {
		this.statusEffects = this.statusEffects.filter((eff) => eff.id !== id);
		return ok(undefined);
	}
}

function createFakeCharacter(
	id: string,
	name: string,
	physical = 3,
): CharacterRecord {
	return {
		id,
		name,
		concept: "Test Vagabond",
		ancestryId: "human",
		classId: "vanguard",
		backgroundId: "solitary",
		level: 1,
		experiencePoints: 0,
		tensionMeter: 0,
		physical,
		mental: 2,
		social: 2,
		conflict: 2,
		interaction: 1,
		resistance: 2,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};
}

function createFakeTile(
	id: string,
	biome: "road" | "forest" | "watch" | "ruins" | "marsh" | "barrow" | "ridge",
	regionTier = 1,
): WorldTileRecord {
	return {
		id,
		label: `Tile ${id}`,
		q: 0,
		r: 0,
		biome,
		regionTier,
		isKnown: true,
		isMapped: false,
		isBlocked: false,
		encounterSignal: "none",
		sourceFile: "map.json",
		summary: "Test Tile Summary",
	};
}

describe("SurvivalService", () => {
	it("deve carregar rações do World State, consumir provisões diárias e salvar o restante", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		// Configurar 5 rações no World State
		await worldStateRepo.setFlag({
			key: "system:camp_provisions",
			valueJson: JSON.stringify(5),
			updatedAt: new Date().toISOString(),
		});

		// 2 personagens na equipe, 0 montarias -> requer 2 rações
		const char1 = createFakeCharacter("char-1", "Kaelen");
		const char2 = createFakeCharacter("char-2", "Eldrin");
		charRepo.characters.set(char1.id, char1);
		charRepo.characters.set(char2.id, char2);

		const result = await survivalService.processDailySurvival({
			characterIds: ["char-1", "char-2"],
			mountsCount: 0,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.consumed).toBe(2);
			expect(result.data.remaining).toBe(3);
			expect(result.data.exhaustionApplied).toHaveLength(0);
		}

		// Validar se o World State foi atualizado para 3
		const provisionsFlag = await worldStateRepo.getFlag(
			"system:camp_provisions",
		);
		expect(provisionsFlag.success).toBe(true);
		if (provisionsFlag.success) {
			expect(JSON.parse(provisionsFlag.data.valueJson)).toBe(3);
		}
	});

	it("deve aplicar exaustão progressiva por falta de provisões", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		// Configurar 0 rações no World State
		await worldStateRepo.setFlag({
			key: "system:camp_provisions",
			valueJson: JSON.stringify(0),
			updatedAt: new Date().toISOString(),
		});

		const char1 = createFakeCharacter("char-1", "Kaelen");
		charRepo.characters.set(char1.id, char1);

		const result = await survivalService.processDailySurvival({
			characterIds: ["char-1"],
			mountsCount: 0,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.consumed).toBe(0);
			expect(result.data.remaining).toBe(0);
			expect(result.data.exhaustionApplied).toContain("char-1:body_fatigue");
		}
	});

	it("deve aplicar testes de resistência a clima extremo de frio (frost) e calor (heat) e aplicar exaustão em falha", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		const char1 = createFakeCharacter("char-1", "Kaelen", 3); // Físico = 3
		charRepo.characters.set(char1.id, char1);

		// Frio Extremo (Barrow / Ridge) -> CD Final = 9 + Tier 1 * 3 + Clima 3 + Terreno 3 = 18
		const coldTile = createFakeTile("cold-tile", "ridge", 1);

		// Teste 1: Sucesso no teste de Vigor (d20 = 15 + mod 3 = 18 >= 18)
		const resSuccess = await survivalService.processWeatherSurvival({
			characterIds: ["char-1"],
			targetTile: coldTile,
			visibilidadeNula: false,
			diceRolls: { "char-1": 15 },
		});
		expect(resSuccess.success).toBe(true);
		expect(charRepo.statusEffects).toHaveLength(0);

		// Teste 2: Falha no teste de Vigor (d20 = 10 + mod 3 = 13 < 18)
		const resFail = await survivalService.processWeatherSurvival({
			characterIds: ["char-1"],
			targetTile: coldTile,
			visibilidadeNula: false,
			diceRolls: { "char-1": 10 },
		});
		expect(resFail.success).toBe(true);
		expect(charRepo.statusEffects.map((e) => e.type)).toContain("body_fatigue");
	});

	it("deve aplicar dano direto de tempestade (storm) em falha de teste físico", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		const char1 = createFakeCharacter("char-1", "Kaelen", 3);
		charRepo.characters.set(char1.id, char1);

		// Tempestade (Forest) -> CD Final = 9 + Tier 2 * 3 + Clima 3 + Terreno 3 = 21
		const stormTile = createFakeTile("storm-tile", "forest", 2);

		// Falha no teste (d20 = 10 + mod 3 = 13 < 21) -> sofre dano direto
		const result = await survivalService.processWeatherSurvival({
			characterIds: ["char-1"],
			targetTile: stormTile,
			visibilidadeNula: false,
			diceRolls: { "char-1": 10 },
			overrideStormDamage: 25, // Dano fixo override para teste determinístico
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.damageApplied).toContainEqual({
				characterId: "char-1",
				damage: 25,
			});
		}
		// Sem efeito de exaustão para tempestade mística
		expect(charRepo.statusEffects).toHaveLength(0);
	});

	it("deve tratar erro ao parsear provisões e assumir padrão", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		await worldStateRepo.setFlag({
			key: "system:camp_provisions",
			valueJson: "invalid-json{",
			updatedAt: new Date().toISOString(),
		});

		const char1 = createFakeCharacter("char-1", "Kaelen");
		charRepo.characters.set(char1.id, char1);

		const result = await survivalService.processDailySurvival({
			characterIds: ["char-1"],
			mountsCount: 0,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.consumed).toBe(1);
			expect(result.data.remaining).toBe(2);
		}
	});

	it("deve processar progressão de enfermidades no final do dia", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		await worldStateRepo.setFlag({
			key: "system:camp_provisions",
			valueJson: JSON.stringify(5),
			updatedAt: new Date().toISOString(),
		});

		const char1 = createFakeCharacter("char-1", "Kaelen");
		charRepo.characters.set(char1.id, char1);

		charRepo.statusEffects.push({
			id: "eff-1",
			characterId: "char-1",
			type: "eter_fever",
			severity: 1,
			severityMax: 3,
			isAggravated: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		const result = await survivalService.processDailySurvival({
			characterIds: ["char-1"],
			mountsCount: 0,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.illnessProgress.length).toBeGreaterThan(0);
			const progress = result.data.illnessProgress[0];
			expect(progress).toBeDefined();
			if (progress) {
				expect(progress.characterId).toBe("char-1");
				expect(progress.diseaseType).toBe("eter_fever");
			}
		}
	});

	it("deve rolar dano de tempestade usando dados normais se overrideStormDamage não for fornecido", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		const char1 = createFakeCharacter("char-1", "Kaelen", 3);
		charRepo.characters.set(char1.id, char1);

		const stormTile = createFakeTile("storm-tile", "forest", 2);

		const result = await survivalService.processWeatherSurvival({
			characterIds: ["char-1"],
			targetTile: stormTile,
			visibilidadeNula: false,
			diceRolls: { "char-1": 10 },
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.damageApplied.length).toBe(1);
			const dmg = result.data.damageApplied[0];
			expect(dmg).toBeDefined();
			if (dmg) {
				expect(dmg.characterId).toBe("char-1");
				expect(dmg.damage).toBeGreaterThanOrEqual(4);
				expect(dmg.damage).toBeLessThanOrEqual(40);
			}
		}
	});

	it("deve retornar erro se a gravação de efeito de exaustão falhar", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		charRepo.saveStatusEffect = async () => {
			return fail({
				code: "DB_ERROR",
				message: "Database write failure",
			} as any);
		};

		const char1 = createFakeCharacter("char-1", "Kaelen", 3);
		charRepo.characters.set(char1.id, char1);

		const coldTile = createFakeTile("cold-tile", "ridge", 1);

		const result = await survivalService.processWeatherSurvival({
			characterIds: ["char-1"],
			targetTile: coldTile,
			visibilidadeNula: false,
			diceRolls: { "char-1": 1 },
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("DB_ERROR");
		}
	});

	it("deve rolar d20 usando o DiceService padrão se diceRolls não for fornecido", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		const char1 = createFakeCharacter("char-1", "Kaelen", 3);
		charRepo.characters.set(char1.id, char1);

		const coldTile = createFakeTile("cold-tile", "ridge", 1);

		const result = await survivalService.processWeatherSurvival({
			characterIds: ["char-1"],
			targetTile: coldTile,
			visibilidadeNula: false,
		});

		expect(result.success).toBe(true);
	});

	it("deve retornar erro em processWeatherSurvival se findStatusEffectsByCharacterId falhar", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		charRepo.findStatusEffectsByCharacterId = async () => {
			return fail({
				code: "DB_ERROR",
				message: "Find status effects failed",
			} as any);
		};

		const char1 = createFakeCharacter("char-1", "Kaelen", 3);
		charRepo.characters.set(char1.id, char1);

		const coldTile = createFakeTile("cold-tile", "ridge", 1);

		const result = await survivalService.processWeatherSurvival({
			characterIds: ["char-1"],
			targetTile: coldTile,
			visibilidadeNula: false,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("DB_ERROR");
		}
	});

	it("deve avançar a exaustão de um personagem que já possui exaustão ativa", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		const char1 = createFakeCharacter("char-1", "Kaelen", 3);
		charRepo.characters.set(char1.id, char1);

		charRepo.statusEffects.push({
			id: "eff-1",
			characterId: "char-1",
			type: "body_fatigue",
			severity: 1,
			severityMax: 3,
			isAggravated: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		const coldTile = createFakeTile("cold-tile", "ridge", 1);

		const result = await survivalService.processWeatherSurvival({
			characterIds: ["char-1"],
			targetTile: coldTile,
			visibilidadeNula: false,
			diceRolls: { "char-1": 1 },
		});

		expect(result.success).toBe(true);
		expect(charRepo.statusEffects.map((e) => e.type)).toContain("mental_fog");
	});

	it("deve retornar ok imediatamente se o bioma do tile não tiver clima extremo", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		const char1 = createFakeCharacter("char-1", "Kaelen");
		charRepo.characters.set(char1.id, char1);

		const roadTile = createFakeTile("road-tile", "road", 1);

		const result = await survivalService.processWeatherSurvival({
			characterIds: ["char-1"],
			targetTile: roadTile,
			visibilidadeNula: false,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.damageApplied).toHaveLength(0);
			expect(result.data.exhaustionApplied).toHaveLength(0);
		}
	});

	it("deve retornar erro se processWeatherSurvival for chamado com id de personagem inválido", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		const coldTile = createFakeTile("cold-tile", "ridge", 1);

		const result = await survivalService.processWeatherSurvival({
			characterIds: ["invalid-char-id"],
			targetTile: coldTile,
			visibilidadeNula: false,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("CHARACTER_NOT_FOUND");
		}
	});

	it("deve retornar erro se campService.processAdventureDayEnd falhar em processDailySurvival", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		await worldStateRepo.setFlag({
			key: "system:camp_provisions",
			valueJson: JSON.stringify(5),
			updatedAt: new Date().toISOString(),
		});

		campService.processAdventureDayEnd = async () => {
			return fail({ code: "CAMP_ERROR", message: "Camp day end failure" });
		};

		const char1 = createFakeCharacter("char-1", "Kaelen");
		charRepo.characters.set(char1.id, char1);

		const result = await survivalService.processDailySurvival({
			characterIds: ["char-1"],
			mountsCount: 0,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("CAMP_ERROR");
		}
	});

	it("deve aplicar testes de clima de calor extremo no bioma de pântano (marsh)", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		const char1 = createFakeCharacter("char-1", "Kaelen", 3);
		charRepo.characters.set(char1.id, char1);

		const marshTile = createFakeTile("marsh-tile", "marsh", 1);

		const result = await survivalService.processWeatherSurvival({
			characterIds: ["char-1"],
			targetTile: marshTile,
			visibilidadeNula: false,
			diceRolls: { "char-1": 1 },
		});

		expect(result.success).toBe(true);
		expect(charRepo.statusEffects.map((e) => e.type)).toContain("body_fatigue");
	});

	it("deve gravar rações iniciais no World State se getFlag falhar em processDailySurvival", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		// Sem setar flag no worldStateRepo -> getFlag retornará erro/falha, acionando o branch else
		const char1 = createFakeCharacter("char-1", "Kaelen");
		charRepo.characters.set(char1.id, char1);

		const result = await survivalService.processDailySurvival({
			characterIds: ["char-1"],
			mountsCount: 0,
		});

		expect(result.success).toBe(true);
		const currentProvisions = await worldStateRepo.getFlag(
			"system:camp_provisions",
		);
		expect(currentProvisions.success).toBe(true);
		if (currentProvisions.success) {
			// valor inicial = 3, consumiu 1 -> sobra 2
			expect(JSON.parse(currentProvisions.data.valueJson)).toBe(2);
		}
	});

	it("não deve aplicar exaustão adicional se o personagem já estiver morto", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		const char1 = createFakeCharacter("char-1", "Kaelen", 3);
		charRepo.characters.set(char1.id, char1);

		// Adicionar o status "dead" de exaustão
		charRepo.statusEffects.push({
			id: "eff-dead",
			characterId: "char-1",
			type: "dead",
			severity: 1,
			severityMax: 3,
			isAggravated: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		const coldTile = createFakeTile("cold-tile", "ridge", 1);

		const result = await survivalService.processWeatherSurvival({
			characterIds: ["char-1"],
			targetTile: coldTile,
			visibilidadeNula: false,
			diceRolls: { "char-1": 1 }, // força falha no teste
		});

		expect(result.success).toBe(true);
		// Não deve ter adicionado efeitos extras além do "dead" original
		expect(charRepo.statusEffects).toHaveLength(1);
		expect(charRepo.statusEffects[0]?.type).toBe("dead");
	});

	it("deve retornar erro em processDailySurvival se findStatusEffectsByCharacterId falhar", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		charRepo.findStatusEffectsByCharacterId = async () => {
			return fail({
				code: "DB_READ_ERROR",
				message: "Failed to read character status effects",
			} as any);
		};

		// Forçar falta de provisões para disparar a consulta de status effects de exaustão
		await worldStateRepo.setFlag({
			key: "system:camp_provisions",
			valueJson: JSON.stringify(0),
			updatedAt: new Date().toISOString(),
		});

		const char1 = createFakeCharacter("char-1", "Kaelen");
		charRepo.characters.set(char1.id, char1);

		const result = await survivalService.processDailySurvival({
			characterIds: ["char-1"],
			mountsCount: 0,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("DB_READ_ERROR");
		}
	});

	it("deve retornar erro em processDailySurvival se saveStatusEffect falhar", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);
		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		charRepo.saveStatusEffect = async () => {
			return fail({
				code: "DB_WRITE_ERROR",
				message: "Failed to write status effect",
			} as any);
		};

		const char1 = createFakeCharacter("char-1", "Kaelen");
		charRepo.characters.set(char1.id, char1);

		// Forçar exaustão para tentar salvar o status
		await worldStateRepo.setFlag({
			key: "system:camp_provisions",
			valueJson: JSON.stringify(0),
			updatedAt: new Date().toISOString(),
		});

		const result = await survivalService.processDailySurvival({
			characterIds: ["char-1"],
			mountsCount: 0,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("DB_WRITE_ERROR");
		}
	});

	it("deve usar DiceService e IllnessService padrões se não forem fornecidos", async () => {
		const worldStateRepo = new MockWorldStateRepository();
		const charRepo = new MockCharacterRepository();
		const campRepo = new InMemoryCampRepository();
		const campService = new CampService(campRepo);

		const survivalService = new SurvivalService(
			worldStateRepo,
			charRepo,
			campService,
		);

		const char1 = createFakeCharacter("char-1", "Kaelen");
		charRepo.characters.set(char1.id, char1);

		// Adicionar febre do éter
		charRepo.statusEffects.push({
			id: "eff-1",
			characterId: "char-1",
			type: "eter_fever",
			severity: 1,
			severityMax: 3,
			isAggravated: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		const originalRandom = Math.random;
		// Mock temporário para forçar falha no teste físico interno da febre
		Math.random = () => 0.01;

		try {
			const result = await survivalService.processDailySurvival({
				characterIds: ["char-1"],
				mountsCount: 0,
			});
			expect(result.success).toBe(true);

			const stormTile = createFakeTile("storm-tile", "forest", 2);
			const weatherRes = await survivalService.processWeatherSurvival({
				characterIds: ["char-1"],
				targetTile: stormTile,
				visibilidadeNula: true,
			});
			expect(weatherRes.success).toBe(true);

			// Forçar a execução dos callbacks padrões idProvider.generate e clock.now do IllnessService interno
			const illnessRes = await (
				survivalService as any
			).illnessService.infectCharacter("char-1", "wound_infection");
			expect(illnessRes.success).toBe(true);
		} finally {
			Math.random = originalRandom;
		}
	});
});
