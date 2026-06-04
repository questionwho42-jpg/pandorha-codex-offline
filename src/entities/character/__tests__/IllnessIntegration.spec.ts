import { describe, expect, it } from "vitest";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CharacterRepository } from "../domain/CharacterRepository";
import { IllnessService } from "../domain/IllnessService";
import { BaseCharacterStats } from "../domain/StatusEffectDecorator";
import { SessionCharacterRepository } from "../infrastructure/SessionCharacterRepository";
import type {
	CharacterRecord,
	CharacterStatusEffectRecord,
	NewCharacterRecord,
	NewCharacterStatusEffectRecord,
} from "../model/characterSchema";
import type {
	CharacterClock,
	CharacterIdProvider,
	CharacterRepositoryFailure,
} from "../model/characterTypes";

const TEST_TIMESTAMP = "2026-05-17T19:00:00.000Z";

describe("IllnessService - Integração e Testes de Patologias", () => {
	// Mock simplificado do Provedor de ID
	const mockIdProvider: CharacterIdProvider = {
		generate: () => "mock-effect-id-123",
	};

	// Mock simplificado do Clock do sistema
	const mockClock: CharacterClock = {
		now: () => TEST_TIMESTAMP,
	};

	function createTestCharacter(): CharacterRecord {
		return {
			id: "arthus-guerreiro",
			name: "Arthus",
			concept: "Guerreiro do Pântano",
			ancestryId: "human",
			classId: "vanguard",
			backgroundId: "solitary",
			level: 2,
			experiencePoints: 0,
			tensionMeter: 0,
			physical: 3,
			mental: 2,
			social: 1,
			conflict: 2,
			interaction: 1,
			resistance: 3,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
	}

	it("deve infectar um personagem com sucesso persistindo na tabela SQLite de status effects", async () => {
		const repo = new SessionCharacterRepository();
		const service = new IllnessService(repo, mockIdProvider, mockClock);

		const infectionResult = await service.infectCharacter(
			"arthus-guerreiro",
			"eter_fever",
		);
		expect(infectionResult.success).toBe(true);
		if (!infectionResult.success) {
			expect.fail("Infection expected to succeed");
			return;
		}
		expect(infectionResult.data.id).toBe("mock-effect-id-123");
		expect(infectionResult.data.characterId).toBe("arthus-guerreiro");
		expect(infectionResult.data.type).toBe("eter_fever");
		expect(infectionResult.data.createdAt).toBe(TEST_TIMESTAMP);

		// Verificar persistência no repositório
		const effectsResult =
			await repo.findStatusEffectsByCharacterId("arthus-guerreiro");
		expect(effectsResult.success).toBe(true);
		if (!effectsResult.success) {
			expect.fail("Query expected to succeed");
			return;
		}
		const effects = effectsResult.data as CharacterStatusEffectRecord[];
		expect(effects.length).toBe(1);
		const [firstEffect] = effects;
		if (!firstEffect) {
			expect.fail("Expected at least one effect");
			return;
		}
		expect(firstEffect.type).toBe("eter_fever");
	});

	it("deve rejeitar duplicidade de infecção do mesmo tipo no mesmo personagem", async () => {
		const repo = new SessionCharacterRepository();
		const service = new IllnessService(repo, mockIdProvider, mockClock);

		// Primeira infecção
		await service.infectCharacter("arthus-guerreiro", "eter_fever");

		// Segunda infecção (deve falhar)
		const duplicateResult = await service.infectCharacter(
			"arthus-guerreiro",
			"eter_fever",
		);
		expect(duplicateResult.success).toBe(false);
		if (duplicateResult.success) {
			expect.fail("Infection expected to fail");
			return;
		}
		expect(duplicateResult.error.code).toBe("ALREADY_INFECTED");
	});

	it("deve curar uma infecção ativa com sucesso removendo-a da persistência", async () => {
		const repo = new SessionCharacterRepository();
		const service = new IllnessService(repo, mockIdProvider, mockClock);

		// Infectar
		await service.infectCharacter("arthus-guerreiro", "eter_fever");

		// Curar
		const cureResult = await service.cureCharacter(
			"arthus-guerreiro",
			"eter_fever",
		);
		expect(cureResult.success).toBe(true);

		// Verificar que não existe mais na persistência
		const effectsResult =
			await repo.findStatusEffectsByCharacterId("arthus-guerreiro");
		expect(effectsResult.success).toBe(true);
		if (!effectsResult.success) {
			expect.fail("Query expected to succeed");
			return;
		}
		expect(effectsResult.data.length).toBe(0);
	});

	it("deve falhar ao curar uma doença que o personagem não possui", async () => {
		const repo = new SessionCharacterRepository();
		const service = new IllnessService(repo, mockIdProvider, mockClock);

		const cureResult = await service.cureCharacter(
			"arthus-guerreiro",
			"eter_fever",
		);
		expect(cureResult.success).toBe(false);
		if (cureResult.success) {
			expect.fail("Cure expected to fail");
			return;
		}
		expect(cureResult.error.code).toBe("EFFECT_NOT_FOUND");
	});

	it("deve aplicar a cebola de Decoradores reativamente baseando-se nos efeitos ativos", async () => {
		const repo = new SessionCharacterRepository();
		const service = new IllnessService(repo, mockIdProvider, mockClock);

		const character = createTestCharacter();
		const characterClass = { id: "vanguard", baseHp: 10 };
		const baseStats = new BaseCharacterStats(character, characterClass);

		// Inicialmente saudável
		expect(baseStats.physical).toBe(3);
		expect(baseStats.mental).toBe(2);
		expect(baseStats.resistance).toBe(3);
		expect(baseStats.maxHp).toBe(32); // (10 + 3 + 3) * 2 = 32
		expect(baseStats.initiativeBase).toBe(5); // level 2 + mental 2 + interaction 1 = 5
		expect(baseStats.allowsNaturalRecovery).toBe(true);

		// Infectando com Febre do Éter, Infecção de Ferida e Veneno de Víbora
		const mockEffects = [
			{
				id: "effect-1",
				characterId: "arthus-guerreiro",
				type: "eter_fever" as const,
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
				severity: 1,
				severityMax: 3,
				isAggravated: false,
				metadata: null,
			},
			{
				id: "effect-2",
				characterId: "arthus-guerreiro",
				type: "wound_infection" as const,
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
				severity: 1,
				severityMax: 3,
				isAggravated: false,
				metadata: null,
			},
			{
				id: "effect-3",
				characterId: "arthus-guerreiro",
				type: "viper_poison" as const,
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
				severity: 1,
				severityMax: 3,
				isAggravated: false,
				metadata: null,
			},
		];

		const decoratedStats = service.applyStatusDecorators(
			baseStats,
			mockEffects,
		);

		// Resultados esperados (WoundInfection: physical -1, impede cura; EterFever: mental -1, resistance -1; ViperPoison: physical -2, iniciativa -1)
		expect(decoratedStats.physical).toBe(0); // 3 - 1 - 2 = 0 (limite mínimo 0)
		expect(decoratedStats.mental).toBe(1); // 2 - 1 = 1
		expect(decoratedStats.resistance).toBe(2); // 3 - 1 = 2
		expect(decoratedStats.maxHp).toBe(24); // (baseHp: 10 + physical: 0 + resistance: 2) * level: 2 = 24
		expect(decoratedStats.initiativeBase).toBe(3); // (level: 2 + mental: 1 + interaction: 1) - 1 = 3
		expect(decoratedStats.allowsNaturalRecovery).toBe(false); // WoundInfection impede cura!
	});

	it("deve resolver rolagens de resistência de Vigor de forma matematicamente precisa", () => {
		const repo = new SessionCharacterRepository();
		const service = new IllnessService(repo, mockIdProvider, mockClock);

		const character = createTestCharacter();
		const baseStats = new BaseCharacterStats(character, {
			id: "vanguard",
			baseHp: 10,
		});

		// Modificador = level: 2 + physical: 3 + resistance: 3 = 8
		// Sucesso: total (d20: 10 + 8 = 18) >= DC: 15
		const testSuccess = service.rollResistanceTest(baseStats, 15, 10);
		expect(testSuccess.roll).toBe(10);
		expect(testSuccess.modifier).toBe(8);
		expect(testSuccess.total).toBe(18);
		expect(testSuccess.success).toBe(true);

		// Falha: total (d20: 4 + 8 = 12) < DC: 15
		const testFailure = service.rollResistanceTest(baseStats, 15, 4);
		expect(testFailure.roll).toBe(4);
		expect(testFailure.modifier).toBe(8);
		expect(testFailure.total).toBe(12);
		expect(testFailure.success).toBe(false);
	});

	it("deve falhar ao curar enfermidade se a busca pelos efeitos de status no repositório falhar", async () => {
		class FetchFailureCharacterRepository implements CharacterRepository {
			public async save(
				_record: NewCharacterRecord,
			): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
					message: "Erro",
				});
			}
			public async findById(
				_id: string,
			): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
				return fail({ code: "CHARACTER_NOT_FOUND" as const, message: "Erro" });
			}
			public async saveStatusEffect(
				_effect: NewCharacterStatusEffectRecord,
			): Promise<
				Result<CharacterStatusEffectRecord, CharacterRepositoryFailure>
			> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
					message: "Erro",
				});
			}
			public async findStatusEffectsByCharacterId(
				_characterId: string,
			): Promise<
				Result<CharacterStatusEffectRecord[], CharacterRepositoryFailure>
			> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
					message: "Erro de banco simulado na busca",
				});
			}
			public async deleteStatusEffect(
				_id: string,
			): Promise<Result<void, CharacterRepositoryFailure>> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
					message: "Erro",
				});
			}
		}

		const repo = new FetchFailureCharacterRepository();
		const service = new IllnessService(repo, mockIdProvider, mockClock);

		const result = await service.cureCharacter(
			"arthus-guerreiro",
			"eter_fever",
		);
		expect(result.success).toBe(false);
		if (result.success) {
			expect.fail("Expected failure");
			return;
		}
		expect(result.error.code).toBe("FETCH_STATUS_EFFECTS_FAILED");
	});

	it("deve falhar ao curar enfermidade se a deleção do status effect no repositório falhar", async () => {
		class DeleteFailureCharacterRepository implements CharacterRepository {
			public async save(
				_record: NewCharacterRecord,
			): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
					message: "Erro",
				});
			}
			public async findById(
				_id: string,
			): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
				return fail({ code: "CHARACTER_NOT_FOUND" as const, message: "Erro" });
			}
			public async saveStatusEffect(
				_effect: NewCharacterStatusEffectRecord,
			): Promise<
				Result<CharacterStatusEffectRecord, CharacterRepositoryFailure>
			> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
					message: "Erro",
				});
			}
			public async findStatusEffectsByCharacterId(
				characterId: string,
			): Promise<
				Result<CharacterStatusEffectRecord[], CharacterRepositoryFailure>
			> {
				return ok([
					{
						id: "effect-active-123",
						characterId,
						type: "eter_fever",
						severity: 2,
						severityMax: 4,
						isAggravated: false,
						createdAt: TEST_TIMESTAMP,
						updatedAt: TEST_TIMESTAMP,
						metadata: null,
					},
				]);
			}
			public async deleteStatusEffect(
				_id: string,
			): Promise<Result<void, CharacterRepositoryFailure>> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
					message: "Erro de banco simulado na deleção",
				});
			}
		}

		const repo = new DeleteFailureCharacterRepository();
		const service = new IllnessService(repo, mockIdProvider, mockClock);

		const result = await service.cureCharacter(
			"arthus-guerreiro",
			"eter_fever",
		);
		expect(result.success).toBe(false);
		if (result.success) {
			expect.fail("Expected failure");
			return;
		}
		expect(result.error.code).toBe("DELETE_STATUS_EFFECT_FAILED");
		expect(result.error.message).toBe("Erro de banco simulado na deleção");
	});

	it("deve falhar ao infectar personagem se a busca pelos efeitos de status no repositório falhar", async () => {
		class FetchFailureCharacterRepository implements CharacterRepository {
			public async save(
				_record: NewCharacterRecord,
			): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
					message: "Erro",
				});
			}
			public async findById(
				_id: string,
			): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
				return fail({ code: "CHARACTER_NOT_FOUND" as const, message: "Erro" });
			}
			public async saveStatusEffect(
				_effect: NewCharacterStatusEffectRecord,
			): Promise<
				Result<CharacterStatusEffectRecord, CharacterRepositoryFailure>
			> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
					message: "Erro",
				});
			}
			public async findStatusEffectsByCharacterId(
				_characterId: string,
			): Promise<
				Result<CharacterStatusEffectRecord[], CharacterRepositoryFailure>
			> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
					message: "Erro de banco simulado na busca",
				});
			}
			public async deleteStatusEffect(
				_id: string,
			): Promise<Result<void, CharacterRepositoryFailure>> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
					message: "Erro",
				});
			}
		}

		const repo = new FetchFailureCharacterRepository();
		const service = new IllnessService(repo, mockIdProvider, mockClock);

		const result = await service.infectCharacter(
			"arthus-guerreiro",
			"eter_fever",
		);
		expect(result.success).toBe(false);
		if (result.success) {
			expect.fail("Expected failure");
			return;
		}
		expect(result.error.code).toBe("FETCH_STATUS_EFFECTS_FAILED");
	});

	it("deve falhar ao infectar personagem se a gravação do status effect no repositório falhar", async () => {
		class SaveFailureCharacterRepository implements CharacterRepository {
			public async save(
				_record: NewCharacterRecord,
			): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
					message: "Erro",
				});
			}
			public async findById(
				_id: string,
			): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
				return fail({ code: "CHARACTER_NOT_FOUND" as const, message: "Erro" });
			}
			public async saveStatusEffect(
				_effect: NewCharacterStatusEffectRecord,
			): Promise<
				Result<CharacterStatusEffectRecord, CharacterRepositoryFailure>
			> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
					message: "Erro de gravação simulado",
				});
			}
			public async findStatusEffectsByCharacterId(
				_characterId: string,
			): Promise<
				Result<CharacterStatusEffectRecord[], CharacterRepositoryFailure>
			> {
				return ok([]); // Sem infecções
			}
			public async deleteStatusEffect(
				_id: string,
			): Promise<Result<void, CharacterRepositoryFailure>> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
					message: "Erro",
				});
			}
		}

		const repo = new SaveFailureCharacterRepository();
		const service = new IllnessService(repo, mockIdProvider, mockClock);

		const result = await service.infectCharacter(
			"arthus-guerreiro",
			"eter_fever",
		);
		expect(result.success).toBe(false);
		if (result.success) {
			expect.fail("Expected failure");
			return;
		}
		expect(result.error.code).toBe("PERSIST_STATUS_EFFECT_FAILED");
		expect(result.error.message).toBe("Erro de gravação simulado");
	});

	it("deve ignorar silenciosamente efeitos de status desconhecidos ao aplicar decoradores", () => {
		const repo = new SessionCharacterRepository();
		const service = new IllnessService(repo, mockIdProvider, mockClock);
		const character = createTestCharacter();
		const baseStats = new BaseCharacterStats(character, {
			id: "vanguard",
			baseHp: 10,
		});

		const mockEffects = [
			{
				id: "effect-unknown",
				characterId: "arthus-guerreiro",
				type: "unknown_effect_type" as unknown as CharacterStatusEffectRecord["type"],
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
				severity: 1,
				severityMax: 3,
				isAggravated: false,
				metadata: null,
			},
		];

		const decoratedStats = service.applyStatusDecorators(
			baseStats,
			mockEffects,
		);
		expect(decoratedStats.physical).toBe(3);
	});

	describe("processWeeklyIllnessProgress", () => {
		it("deve reduzir a gravidade da doença e curar se chegar a 0 após sucesso no vigor", async () => {
			const repo = new SessionCharacterRepository();
			const service = new IllnessService(repo, mockIdProvider, mockClock);

			const character = createTestCharacter();
			await repo.save(character);

			// Infecta
			const infectRes = await service.infectCharacter(
				character.id,
				"wound_infection",
			);
			expect(infectRes.success).toBe(true);

			// Vigor do personagem = level (2) + physical (3 - 1 do decorator de wound_infection) + resistance (3) = 7
			// DC = 12. Precisamos de sucesso -> d20: 10 + 7 = 17 >= 12
			const progressRes = await service.processWeeklyIllnessProgress(
				character.id,
				10,
			);
			expect(progressRes.success).toBe(true);
			if (progressRes.success) {
				expect(progressRes.data.length).toBe(1);
				const first = progressRes.data[0];
				if (first) {
					expect(first.diseaseType).toBe("wound_infection");
					expect(first.rollResult.success).toBe(true);
					expect(first.newSeverity).toBe(1);
					expect(first.curated).toBe(false);
				}
			}

			// Segundo turno de recesso -> rola 10 e passa novamente -> severity cai de 1 para 0 -> curado!
			const progressRes2 = await service.processWeeklyIllnessProgress(
				character.id,
				10,
			);
			expect(progressRes2.success).toBe(true);
			if (progressRes2.success) {
				const first = progressRes2.data[0];
				if (first) {
					expect(first.newSeverity).toBe(0);
					expect(first.curated).toBe(true);
				}
			}

			// Garante que o status effect sumiu do repositório
			const activeEffects = await repo.findStatusEffectsByCharacterId(
				character.id,
			);
			expect(activeEffects.success).toBe(true);
			if (activeEffects.success) {
				expect(activeEffects.data.length).toBe(0);
			}
		});

		it("deve aumentar a gravidade da doença e agravar se atingir o limite após falha no vigor", async () => {
			const repo = new SessionCharacterRepository();
			const service = new IllnessService(repo, mockIdProvider, mockClock);

			const character = createTestCharacter();
			await repo.save(character);

			// Infecta -> Severidade inicial: 2, Max: 4 (no mock o max é 3? Vamos ver: severityMax no schema é 3 por padrão, no service é 4)
			const infectRes = await service.infectCharacter(
				character.id,
				"eter_fever",
			);
			expect(infectRes.success).toBe(true);

			// Vigor = lvl (2) + physical (3) + resistance (3 - 1 do eter_fever) = 7
			// DC = 14. Precisamos de falha -> d20: 1 + 7 = 8 < 14
			const progressRes = await service.processWeeklyIllnessProgress(
				character.id,
				1,
			);
			expect(progressRes.success).toBe(true);
			if (progressRes.success) {
				const first = progressRes.data[0];
				if (first) {
					expect(first.rollResult.success).toBe(false);
					expect(first.newSeverity).toBe(3);
					expect(first.isAggravated).toBe(false);
				}
			}

			// Outra falha -> deve atingir o severityMax de 4 (pois eter_fever infectRecord define severityMax como 4 no IllnessService)
			const progressRes2 = await service.processWeeklyIllnessProgress(
				character.id,
				1,
			);
			expect(progressRes2.success).toBe(true);
			if (progressRes2.success) {
				const first = progressRes2.data[0];
				if (first) {
					expect(first.newSeverity).toBe(4);
					expect(first.isAggravated).toBe(true);
				}
			}
		});

		it("deve retornar erro se o personagem não for cadastrado", async () => {
			const repo = new SessionCharacterRepository();
			const service = new IllnessService(repo, mockIdProvider, mockClock);

			const progressRes = await service.processWeeklyIllnessProgress(
				"inexistente",
				10,
			);
			expect(progressRes.success).toBe(false);
			if (!progressRes.success) {
				expect(progressRes.error.code).toBe("REPOSITORY_READ_FAILED");
			}
		});
	});

	describe("decrementStatusEffectsDuration", () => {
		it("deve decrementar com sucesso a duração de um efeito tático ativo", async () => {
			const repo = new SessionCharacterRepository();
			const service = new IllnessService(repo, mockIdProvider, mockClock);

			const character = createTestCharacter();
			await repo.save(character);

			// Salvar um status com duração turns = 3
			const effectId = "temp-effect-1";
			await repo.saveStatusEffect({
				id: effectId,
				characterId: character.id,
				type: "eter_fever",
				severity: 1,
				severityMax: 3,
				isAggravated: false,
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
				durationTurns: 3,
			});

			const decResult = await service.decrementStatusEffectsDuration(
				character.id,
			);
			expect(decResult.success).toBe(true);
			if (decResult.success) {
				expect(decResult.data.expiredCount).toBe(0);
				expect(decResult.data.updatedCount).toBe(1);
			}

			// Verificar persistência
			const findRes = await repo.findStatusEffectsByCharacterId(character.id);
			expect(findRes.success).toBe(true);
			if (findRes.success) {
				expect(findRes.data.length).toBe(1);
				expect(findRes.data[0]?.durationTurns).toBe(2);
			}
		});

		it("deve expirar e excluir o efeito se a duração chegar a 0 após o decremento", async () => {
			const repo = new SessionCharacterRepository();
			const service = new IllnessService(repo, mockIdProvider, mockClock);

			const character = createTestCharacter();
			await repo.save(character);

			// Salvar status com duração turns = 1
			const effectId = "temp-effect-2";
			await repo.saveStatusEffect({
				id: effectId,
				characterId: character.id,
				type: "viper_poison",
				severity: 1,
				severityMax: 3,
				isAggravated: false,
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
				durationTurns: 1,
			});

			const decResult = await service.decrementStatusEffectsDuration(
				character.id,
			);
			expect(decResult.success).toBe(true);
			if (decResult.success) {
				expect(decResult.data.expiredCount).toBe(1);
				expect(decResult.data.updatedCount).toBe(0);
			}

			// Verificar que foi deletado
			const findRes = await repo.findStatusEffectsByCharacterId(character.id);
			expect(findRes.success).toBe(true);
			if (findRes.success) {
				expect(findRes.data.length).toBe(0);
			}
		});

		it("deve ignorar efeitos que possuem duração indefinida (null ou undefined)", async () => {
			const repo = new SessionCharacterRepository();
			const service = new IllnessService(repo, mockIdProvider, mockClock);

			const character = createTestCharacter();
			await repo.save(character);

			// Salvar status sem duração (permanente)
			const effectId = "perm-effect-1";
			await repo.saveStatusEffect({
				id: effectId,
				characterId: character.id,
				type: "eter_fever",
				severity: 1,
				severityMax: 3,
				isAggravated: false,
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
				durationTurns: null,
			});

			const decResult = await service.decrementStatusEffectsDuration(
				character.id,
			);
			expect(decResult.success).toBe(true);
			if (decResult.success) {
				expect(decResult.data.expiredCount).toBe(0);
				expect(decResult.data.updatedCount).toBe(0);
			}

			// Verificar que ainda existe inalterado
			const findRes = await repo.findStatusEffectsByCharacterId(character.id);
			expect(findRes.success).toBe(true);
			if (findRes.success) {
				expect(findRes.data.length).toBe(1);
				expect(findRes.data[0]?.durationTurns).toBeNull();
			}
		});

		it("deve falhar se a busca no repositório retornar erro", async () => {
			class FailureRepo extends SessionCharacterRepository {
				public override async findStatusEffectsByCharacterId(
					_characterId: string,
				) {
					return fail({
						code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
						message: "Erro na busca",
					});
				}
			}
			const repo = new FailureRepo();
			const service = new IllnessService(repo, mockIdProvider, mockClock);

			const result = await service.decrementStatusEffectsDuration("algum-id");
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("FETCH_STATUS_EFFECTS_FAILED");
			}
		});
	});
});
