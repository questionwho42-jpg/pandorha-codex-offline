import { describe, expect, it } from "vitest";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	CharacterRecord,
	CharacterStatusEffectRecord,
	NewCharacterRecord,
	NewCharacterStatusEffectRecord,
} from "../../model/characterSchema";
import type { CharacterRepositoryFailure } from "../../model/characterTypes";
import type { CharacterRepository } from "../CharacterRepository";
import { RetrainService } from "../RetrainService";

const TEST_TIMESTAMP = "2026-05-05T13:16:00.000Z";

class FakeCharacterRepository implements CharacterRepository {
	public characters = new Map<string, CharacterRecord>();
	public statusEffects = new Map<string, CharacterStatusEffectRecord>();

	public async save(
		record: NewCharacterRecord,
	): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
		const existing = this.characters.get(record.id);
		// biome-ignore lint/suspicious/noExplicitAny: mock override
		const goldVal = (record as any).gold ?? (existing as any)?.gold ?? 0;
		const character = {
			...record,
			gold: goldVal,
			// biome-ignore lint/suspicious/noExplicitAny: mock override
		} as any as CharacterRecord;
		this.characters.set(record.id, character);
		return ok(character);
	}

	public async findById(
		id: string,
	): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
		const char = this.characters.get(id);
		if (!char) {
			return fail({
				code: "CHARACTER_NOT_FOUND",
				message: "Not found",
			});
		}
		return ok(char);
	}

	public async saveStatusEffect(
		effect: NewCharacterStatusEffectRecord,
	): Promise<Result<CharacterStatusEffectRecord, CharacterRepositoryFailure>> {
		const record: CharacterStatusEffectRecord = {
			id: effect.id || crypto.randomUUID(),
			characterId: effect.characterId,
			type: effect.type,
			severity: effect.severity ?? 1,
			severityMax: effect.severityMax ?? 3,
			isAggravated: effect.isAggravated ?? false,
			metadata: effect.metadata ?? null,
			createdAt: effect.createdAt,
			updatedAt: effect.updatedAt || new Date().toISOString(),
		};
		this.statusEffects.set(record.id, record);
		return ok(record);
	}

	public async findStatusEffectsByCharacterId(
		characterId: string,
	): Promise<
		Result<CharacterStatusEffectRecord[], CharacterRepositoryFailure>
	> {
		const list = Array.from(this.statusEffects.values()).filter(
			(e) => e.characterId === characterId,
		);
		return ok(list);
	}

	public async deleteStatusEffect(
		id: string,
	): Promise<Result<void, CharacterRepositoryFailure>> {
		this.statusEffects.delete(id);
		return ok(undefined);
	}
}

function createTestCharacter(
	patch: Partial<CharacterRecord> & { gold?: number } = {},
): CharacterRecord {
	return {
		id: "char-123",
		name: "Kael de Almar",
		concept: "Vanguarda Protetor",
		ancestryId: "human",
		classId: "vanguard",
		backgroundId: "acolyte",
		level: 3,
		experiencePoints: 0,
		physical: 3,
		mental: 2,
		social: 1,
		conflict: 2,
		interaction: 1,
		resistance: 3,
		createdAt: TEST_TIMESTAMP,
		updatedAt: TEST_TIMESTAMP,
		...patch,
	} as CharacterRecord;
}

function expectSuccess<T, E>(result: Result<T, E>): T {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}
	expect.fail("Expected success");
}

function expectFailure<T, E>(result: Result<T, E>): E {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}
	expect.fail("Expected failure");
}

describe("RetrainService", () => {
	it("should retrain a talent successfully when gold and downtime are sufficient", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 100 });
		await repo.save(char);

		const res = await service.retrainTalent({
			characterId: char.id,
			oldTalentId: "talent-old",
			newTalentId: "talent-new",
			currentDowntimeDays: 10,
		});

		const data = expectSuccess(res);
		expect(data.goldSpent).toBe(30); // 3 (level) * 10
		expect(data.downtimeDaysSpent).toBe(3);
		expect((data.character as any).gold).toBe(70);
	});

	it("should fail talent retraining if gold is insufficient", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 10 });
		await repo.save(char);

		const res = await service.retrainTalent({
			characterId: char.id,
			oldTalentId: "talent-old",
			newTalentId: "talent-new",
			currentDowntimeDays: 10,
		});

		const err = expectFailure(res);
		expect(err.code).toBe("INSUFFICIENT_GOLD");
	});

	it("should fail talent retraining if downtime days are insufficient", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 100 });
		await repo.save(char);

		const res = await service.retrainTalent({
			characterId: char.id,
			oldTalentId: "talent-old",
			newTalentId: "talent-new",
			currentDowntimeDays: 2,
		});

		const err = expectFailure(res);
		expect(err.code).toBe("INSUFFICIENT_DOWNTIME");
	});

	it("should recondition an axis successfully, updating values and applying latent discoordination status", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 200, physical: 3, mental: 2 });
		await repo.save(char);

		const res = await service.reconditionAxis({
			characterId: char.id,
			axisToReplace: "physical",
			newAxis: "mental",
			currentDowntimeDays: 15,
		});

		const data = expectSuccess(res);
		expect(data.goldSpent).toBe(90); // 3 (level) * 30 PO
		expect(data.downtimeDaysSpent).toBe(9); // 9 dias

		// Atributos atualizados (physical 3 -> 2, mental 2 -> 3)
		expect(data.character.physical).toBe(2);
		expect(data.character.mental).toBe(3);
		expect((data.character as any).gold).toBe(110);

		// Status de descoordenação gravado
		expect(data.statusEffect.type).toBe("latent_discoordination");
		expect(data.statusEffect.severity).toBe(3);
		expect(data.statusEffect.metadata).toBe("mental");
	});

	it("should retrain familiar successfully for flat cost of 50 gold and 3 days", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 100 });
		await repo.save(char);

		const res = await service.retrainFamiliar({
			characterId: char.id,
			currentDowntimeDays: 5,
		});

		const data = expectSuccess(res);
		expect(data.goldSpent).toBe(50);
		expect(data.downtimeDaysSpent).toBe(3);
		expect((data.character as any).gold).toBe(50);
	});

	it("should manage latent discoordination lifecycle properly under registerTestUsage", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 100 });
		await repo.save(char);

		// Cria status manualmente
		const _effect = expectSuccess(
			await repo.saveStatusEffect({
				id: "eff-1",
				characterId: char.id,
				type: "latent_discoordination",
				severity: 3,
				severityMax: 3,
				isAggravated: false,
				metadata: "mental",
				createdAt: TEST_TIMESTAMP,
			}),
		);

		// Teste 1: Teste com outro eixo não afeta o status
		const test1 = expectSuccess(
			await service.registerTestUsage(char.id, "physical"),
		);
		expect(test1.active).toBe(false);
		expect(repo.statusEffects.get("eff-1")?.severity).toBe(3);

		// Teste 2: Teste com o eixo correto decrementa
		const test2 = expectSuccess(
			await service.registerTestUsage(char.id, "mental"),
		);
		expect(test2.active).toBe(true);
		expect(test2.testsLeft).toBe(2);
		expect(repo.statusEffects.get("eff-1")?.severity).toBe(2);

		// Teste 3: Decrementa até expirar (2 -> 1 -> 0)
		await service.registerTestUsage(char.id, "mental");
		const finalTest = expectSuccess(
			await service.registerTestUsage(char.id, "mental"),
		);
		expect(finalTest.active).toBe(false);
		expect(finalTest.testsLeft).toBe(0);
		// Efeito de status deve ser removido do repositório
		expect(repo.statusEffects.has("eff-1")).toBe(false);
	});

	it("deve retornar erro de repositorio ao falhar na deleção do status de descoordenação", async () => {
		class FailingDeleteRepo extends FakeCharacterRepository {
			public override async deleteStatusEffect(): Promise<
				Result<void, CharacterRepositoryFailure>
			> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED",
					message: "Erro simulado de deleção",
				});
			}
		}
		const repo = new FailingDeleteRepo();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 100 });
		await repo.save(char);

		await repo.saveStatusEffect({
			id: "eff-1",
			characterId: char.id,
			type: "latent_discoordination",
			severity: 1,
			severityMax: 3,
			isAggravated: false,
			metadata: "mental",
			createdAt: TEST_TIMESTAMP,
		});

		const res = await service.registerTestUsage(char.id, "mental");
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("STATUS_EFFECT_ERROR");
			expect(res.error.message).toBe(
				"Falha ao expirar status de Descoordenação Latente.",
			);
		}
	});

	it("deve retornar erro de repositorio ao falhar na atualização do status de descoordenação", async () => {
		class FailingSaveEffectRepo extends FakeCharacterRepository {
			public override async saveStatusEffect(): Promise<
				Result<CharacterStatusEffectRecord, CharacterRepositoryFailure>
			> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED",
					message: "Erro simulado de salvamento de status",
				});
			}
		}
		const repo = new FailingSaveEffectRepo();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 100 });
		await repo.save(char);

		// Coloca manualmente no map interno para pular o saveStatusEffect inicial
		repo.statusEffects.set("eff-1", {
			id: "eff-1",
			characterId: char.id,
			type: "latent_discoordination",
			severity: 3,
			severityMax: 3,
			isAggravated: false,
			metadata: "mental",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const res = await service.registerTestUsage(char.id, "mental");
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("STATUS_EFFECT_ERROR");
			expect(res.error.message).toBe(
				"Falha ao atualizar contador de Descoordenação Latente.",
			);
		}
	});

	it("deve retornar erro de repositorio ao falhar no salvamento do personagem no retrainFamiliar", async () => {
		class FailingSaveCharRepo extends FakeCharacterRepository {
			public override async save(): Promise<
				Result<CharacterRecord, CharacterRepositoryFailure>
			> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED",
					message: "Erro simulado de salvamento",
				});
			}
		}
		const repo = new FailingSaveCharRepo();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 100 });
		repo.characters.set(char.id, char);

		const res = await service.retrainFamiliar({
			characterId: char.id,
			currentDowntimeDays: 5,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("REPOSITORY_ERROR");
			expect(res.error.message).toBe(
				"Falha ao salvar dados do personagem no SQLite.",
			);
		}
	});

	it("deve retornar erro de repositorio ao falhar na busca de status effects no registerTestUsage", async () => {
		class FailingFindEffectsRepo extends FakeCharacterRepository {
			public override async findStatusEffectsByCharacterId(): Promise<
				Result<CharacterStatusEffectRecord[], CharacterRepositoryFailure>
			> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED",
					message: "Erro simulado ao buscar status effects",
				});
			}
		}
		const repo = new FailingFindEffectsRepo();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 100 });
		await repo.save(char);

		const res = await service.registerTestUsage(char.id, "mental");
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("REPOSITORY_ERROR");
			expect(res.error.message).toBe(
				"Falha ao buscar status effects do personagem.",
			);
		}
	});

	it("deve retornar erro de ouro insuficiente ao retreinar familiar", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 10 });
		await repo.save(char);

		const res = await service.retrainFamiliar({
			characterId: char.id,
			currentDowntimeDays: 5,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("INSUFFICIENT_GOLD");
		}
	});

	it("deve retornar erro de downtime insuficiente ao retreinar familiar", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 100 });
		await repo.save(char);

		const res = await service.retrainFamiliar({
			characterId: char.id,
			currentDowntimeDays: 2,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("INSUFFICIENT_DOWNTIME");
		}
	});

	it("deve retornar erro de downtime insuficiente ao recondicionar eixo", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 1000 });
		await repo.save(char);

		const res = await service.reconditionAxis({
			characterId: char.id,
			axisToReplace: "physical",
			newAxis: "mental",
			currentDowntimeDays: 5,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("INSUFFICIENT_DOWNTIME");
		}
	});

	it("deve retornar erro de salvamento de personagem ao recondicionar eixo", async () => {
		class FailingSaveCharRepo extends FakeCharacterRepository {
			public override async save(): Promise<
				Result<CharacterRecord, CharacterRepositoryFailure>
			> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED",
					message: "Erro simulado de salvamento",
				});
			}
		}
		const repo = new FailingSaveCharRepo();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 1000 });
		repo.characters.set(char.id, char);

		const res = await service.reconditionAxis({
			characterId: char.id,
			axisToReplace: "physical",
			newAxis: "mental",
			currentDowntimeDays: 10,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("REPOSITORY_ERROR");
			expect(res.error.message).toBe(
				"Falha ao salvar eixos modificados do personagem no SQLite.",
			);
		}
	});

	it("deve retornar erro de status effect ao falhar em reconditionAxis", async () => {
		class FailingSaveEffectRepo extends FakeCharacterRepository {
			public override async saveStatusEffect(): Promise<
				Result<CharacterStatusEffectRecord, CharacterRepositoryFailure>
			> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED",
					message: "Erro simulado de salvamento de status",
				});
			}
		}
		const repo = new FailingSaveEffectRepo();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 100 });
		await repo.save(char);

		const res = await service.reconditionAxis({
			characterId: char.id,
			axisToReplace: "physical",
			newAxis: "mental",
			currentDowntimeDays: 10,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("STATUS_EFFECT_ERROR");
			expect(res.error.message).toBe(
				"Falha ao gravar o status de Descoordenação Latente no personagem.",
			);
		}
	});

	it("deve retornar erro de personagem nao encontrado em retrainFamiliar", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);

		const res = await service.retrainFamiliar({
			characterId: "non-existent",
			currentDowntimeDays: 5,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("CHARACTER_NOT_FOUND");
		}
	});

	it("deve retornar erro de personagem nao encontrado em reconditionAxis", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);

		const res = await service.reconditionAxis({
			characterId: "non-existent",
			axisToReplace: "physical",
			newAxis: "mental",
			currentDowntimeDays: 10,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("CHARACTER_NOT_FOUND");
		}
	});

	it("deve retornar erro de ouro insuficiente ao recondicionar eixo", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 10 });
		await repo.save(char);

		const res = await service.reconditionAxis({
			characterId: char.id,
			axisToReplace: "physical",
			newAxis: "mental",
			currentDowntimeDays: 10,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("INSUFFICIENT_GOLD");
		}
	});

	it("deve retornar erro de personagem nao encontrado em retrainTalent", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);

		const res = await service.retrainTalent({
			characterId: "non-existent",
			oldTalentId: "talent-1",
			newTalentId: "talent-2",
			currentDowntimeDays: 5,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("CHARACTER_NOT_FOUND");
		}
	});

	it("deve retornar erro de salvamento de personagem ao retrainTalent", async () => {
		class FailingSaveCharRepo extends FakeCharacterRepository {
			public override async save(): Promise<
				Result<CharacterRecord, CharacterRepositoryFailure>
			> {
				return fail({
					code: "CHARACTER_REPOSITORY_WRITE_FAILED",
					message: "Erro simulado de salvamento",
				});
			}
		}
		const repo = new FailingSaveCharRepo();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: 100 });
		repo.characters.set(char.id, char);

		const res = await service.retrainTalent({
			characterId: char.id,
			oldTalentId: "talent-1",
			newTalentId: "talent-2",
			currentDowntimeDays: 5,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("REPOSITORY_ERROR");
			expect(res.error.message).toBe(
				"Falha ao salvar modificações do personagem no SQLite.",
			);
		}
	});

	it("deve cobrir fallback de ouro indefinido ao tentar retrainTalent", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: undefined as unknown as number });
		repo.characters.set(char.id, char);

		const res = await service.retrainTalent({
			characterId: char.id,
			oldTalentId: "talent-old",
			newTalentId: "talent-new",
			currentDowntimeDays: 10,
		});

		const err = expectFailure(res);
		expect(err.code).toBe("INSUFFICIENT_GOLD");
	});

	it("deve cobrir fallback de ouro indefinido ao tentar reconditionAxis", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: undefined as unknown as number });
		repo.characters.set(char.id, char);

		const res = await service.reconditionAxis({
			characterId: char.id,
			axisToReplace: "physical",
			newAxis: "mental",
			currentDowntimeDays: 10,
		});

		const err = expectFailure(res);
		expect(err.code).toBe("INSUFFICIENT_GOLD");
	});

	it("deve cobrir fallback de ouro indefinido ao tentar retrainFamiliar", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);
		const char = createTestCharacter({ gold: undefined as unknown as number });
		repo.characters.set(char.id, char);

		const res = await service.retrainFamiliar({
			characterId: char.id,
			currentDowntimeDays: 5,
		});

		const err = expectFailure(res);
		expect(err.code).toBe("INSUFFICIENT_GOLD");
	});

	it("deve cobrir fallback de novo eixo nao existente no personagem ao tentar reconditionAxis", async () => {
		const repo = new FakeCharacterRepository();
		const service = new RetrainService(repo);
		const char = createTestCharacter({
			gold: 200,
			physical: 3,
			mental: undefined as unknown as number,
		});
		repo.characters.set(char.id, char);

		const res = await service.reconditionAxis({
			characterId: char.id,
			axisToReplace: "physical",
			newAxis: "mental",
			currentDowntimeDays: 15,
		});

		const data = expectSuccess(res);
		expect(data.character.mental).toBe(1);
	});
});
