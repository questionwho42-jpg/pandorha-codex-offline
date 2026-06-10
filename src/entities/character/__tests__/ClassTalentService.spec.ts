import { describe, expect, it } from "vitest";
import { fail } from "$lib/shared/lib/result";
import { ClassTalentService } from "../domain/ClassTalentService";
import type { NewCharacterStatusEffectRecord } from "../model/characterSchema";
import { CharacterBuilder } from "../testing/CharacterBuilder";
import { InMemoryCharacterRepository } from "../testing/InMemoryCharacterRepository";

const TEST_TIMESTAMP = "2026-06-02T14:49:35.000Z";

describe("ClassTalentService - Talentos de Classe Táticos", () => {
	it("deve ativar Fôlego Extra para personagem Vanguarda com recursos suficientes", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = new ClassTalentService(
			repository,
			{ generate: () => "effect-1" },
			{ now: () => TEST_TIMESTAMP },
		);

		const vanguardChar = {
			...CharacterBuilder.valid().buildCreateInput(),
			classId: "vanguard",
		};
		await repository.save({
			...vanguardChar,
			id: "vanguard-1",
			experiencePoints: 0,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const result = await service.activateExtraBreath("vanguard-1", 3);
		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.costPv).toBe(2);
			expect(result.data.effect).toMatchObject({
				id: "effect-1",
				characterId: "vanguard-1",
				type: "extra_breath",
				severity: 1,
				severityMax: 1,
				durationTurns: 3,
			});
		}

		const effects =
			await repository.findStatusEffectsByCharacterId("vanguard-1");
		expect(effects.success).toBe(true);
		if (effects.success) {
			expect(effects.data).toHaveLength(1);
			expect(effects.data[0]?.type).toBe("extra_breath");
		}
	});

	it("deve rejeitar Fôlego Extra se os pontos de Vigor (PV) forem insuficientes (< 2)", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = new ClassTalentService(
			repository,
			{ generate: () => "effect-1" },
			{ now: () => TEST_TIMESTAMP },
		);

		const vanguardChar = {
			...CharacterBuilder.valid().buildCreateInput(),
			classId: "vanguard",
		};
		await repository.save({
			...vanguardChar,
			id: "vanguard-1",
			experiencePoints: 0,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const result = await service.activateExtraBreath("vanguard-1", 1);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("INVALID_CHARACTER_INPUT");
			expect(result.error.message).toContain("Vigor (PV) insuficientes");
		}
	});

	it("deve rejeitar Fôlego Extra se o personagem não for Vanguarda", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = new ClassTalentService(
			repository,
			{ generate: () => "effect-1" },
			{ now: () => TEST_TIMESTAMP },
		);

		const weaverChar = {
			...CharacterBuilder.valid().buildCreateInput(),
			classId: "weaver",
		};
		await repository.save({
			...weaverChar,
			id: "weaver-1",
			experiencePoints: 0,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const result = await service.activateExtraBreath("weaver-1", 2);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("INVALID_CHARACTER_INPUT");
			expect(result.error.message).toContain(
				"Apenas personagens da classe Vanguarda",
			);
		}
	});

	it("deve rejeitar Fôlego Extra se o efeito já estiver ativo", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = new ClassTalentService(
			repository,
			{ generate: () => "effect-1" },
			{ now: () => TEST_TIMESTAMP },
		);

		const vanguardChar = {
			...CharacterBuilder.valid().buildCreateInput(),
			classId: "vanguard",
		};
		await repository.save({
			...vanguardChar,
			id: "vanguard-1",
			experiencePoints: 0,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		// Ativa a primeira vez
		const first = await service.activateExtraBreath("vanguard-1", 2);
		expect(first.success).toBe(true);

		// Tenta ativar a segunda vez
		const second = await service.activateExtraBreath("vanguard-1", 2);
		expect(second.success).toBe(false);
		if (!second.success) {
			expect(second.error.code).toBe("ALREADY_INFECTED");
		}
	});

	it("deve ativar Dobrar Tempo para personagem Tecelão com recursos suficientes", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = new ClassTalentService(
			repository,
			{ generate: () => "effect-2" },
			{ now: () => TEST_TIMESTAMP },
		);

		const weaverChar = {
			...CharacterBuilder.valid().buildCreateInput(),
			classId: "weaver",
		};
		await repository.save({
			...weaverChar,
			id: "weaver-1",
			experiencePoints: 0,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const result = await service.activateDoubleTime("weaver-1", 2);
		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.costEe).toBe(2);
			expect(result.data.effect).toMatchObject({
				id: "effect-2",
				characterId: "weaver-1",
				type: "double_time",
				severity: 1,
				severityMax: 1,
				durationTurns: 3,
			});
		}

		const effects = await repository.findStatusEffectsByCharacterId("weaver-1");
		expect(effects.success).toBe(true);
		if (effects.success) {
			expect(effects.data).toHaveLength(1);
			expect(effects.data[0]?.type).toBe("double_time");
		}
	});

	it("deve rejeitar Dobrar Tempo se a Energia Etérica (EE) for insuficiente (< 2)", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = new ClassTalentService(
			repository,
			{ generate: () => "effect-2" },
			{ now: () => TEST_TIMESTAMP },
		);

		const weaverChar = {
			...CharacterBuilder.valid().buildCreateInput(),
			classId: "weaver",
		};
		await repository.save({
			...weaverChar,
			id: "weaver-1",
			experiencePoints: 0,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const result = await service.activateDoubleTime("weaver-1", 1);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("INVALID_CHARACTER_INPUT");
			expect(result.error.message).toContain(
				"Energia Etérica (EE) insuficiente",
			);
		}
	});

	it("deve rejeitar Dobrar Tempo se o personagem não for Tecelão", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = new ClassTalentService(
			repository,
			{ generate: () => "effect-2" },
			{ now: () => TEST_TIMESTAMP },
		);

		const vanguardChar = {
			...CharacterBuilder.valid().buildCreateInput(),
			classId: "vanguard",
		};
		await repository.save({
			...vanguardChar,
			id: "vanguard-1",
			experiencePoints: 0,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const result = await service.activateDoubleTime("vanguard-1", 2);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("INVALID_CHARACTER_INPUT");
			expect(result.error.message).toContain(
				"Apenas personagens da classe Tecelão",
			);
		}
	});

	it("deve rejeitar Dobrar Tempo se o efeito já estiver ativo", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = new ClassTalentService(
			repository,
			{ generate: () => "effect-2" },
			{ now: () => TEST_TIMESTAMP },
		);

		const weaverChar = {
			...CharacterBuilder.valid().buildCreateInput(),
			classId: "weaver",
		};
		await repository.save({
			...weaverChar,
			id: "weaver-1",
			experiencePoints: 0,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		// Ativa primeira vez
		const first = await service.activateDoubleTime("weaver-1", 2);
		expect(first.success).toBe(true);

		// Tenta segunda vez
		const second = await service.activateDoubleTime("weaver-1", 2);
		expect(second.success).toBe(false);
		if (!second.success) {
			expect(second.error.code).toBe("ALREADY_INFECTED");
		}
	});

	describe("Failure branches coverage (Repository Errors)", () => {
		class FailingCharacterRepository extends InMemoryCharacterRepository {
			public findByIdFailure: string | null = null;
			public findStatusEffectsFailure: string | null = null;
			public saveStatusEffectFailure: string | null = null;

			public override async findById(id: string) {
				if (this.findByIdFailure) {
					return fail({
						code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
						message: this.findByIdFailure,
					});
				}
				return super.findById(id);
			}

			public override async findStatusEffectsByCharacterId(
				characterId: string,
			) {
				if (this.findStatusEffectsFailure) {
					return fail({
						code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
						message: this.findStatusEffectsFailure,
					});
				}
				return super.findStatusEffectsByCharacterId(characterId);
			}

			public override async saveStatusEffect(
				effect: NewCharacterStatusEffectRecord,
			) {
				if (this.saveStatusEffectFailure) {
					return fail({
						code: "CHARACTER_REPOSITORY_WRITE_FAILED" as const,
						message: this.saveStatusEffectFailure,
					});
				}
				return super.saveStatusEffect(effect);
			}
		}

		it("deve cobrir falhas de repositório no activateExtraBreath", async () => {
			const repository = new FailingCharacterRepository();
			const service = new ClassTalentService(
				repository,
				{ generate: () => "effect-1" },
				{ now: () => TEST_TIMESTAMP },
			);

			const vanguardChar = {
				...CharacterBuilder.valid().buildCreateInput(),
				classId: "vanguard",
			};
			await repository.save({
				...vanguardChar,
				id: "vanguard-1",
				experiencePoints: 0,
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
			});

			// 1. findById failure
			repository.findByIdFailure = "Erro ao buscar personagem";
			let res = await service.activateExtraBreath("vanguard-1", 3);
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("REPOSITORY_READ_FAILED");
			}
			repository.findByIdFailure = null;

			// 2. findStatusEffectsByCharacterId failure
			repository.findStatusEffectsFailure = "Erro ao buscar status effects";
			res = await service.activateExtraBreath("vanguard-1", 3);
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("FETCH_STATUS_EFFECTS_FAILED");
			}
			repository.findStatusEffectsFailure = null;

			// 3. saveStatusEffect failure
			repository.saveStatusEffectFailure = "Erro ao salvar status effect";
			res = await service.activateExtraBreath("vanguard-1", 3);
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("PERSIST_STATUS_EFFECT_FAILED");
			}
		});

		it("deve cobrir falhas de repositório no activateDoubleTime", async () => {
			const repository = new FailingCharacterRepository();
			const service = new ClassTalentService(
				repository,
				{ generate: () => "effect-1" },
				{ now: () => TEST_TIMESTAMP },
			);

			const weaverChar = {
				...CharacterBuilder.valid().buildCreateInput(),
				classId: "weaver",
			};
			await repository.save({
				...weaverChar,
				id: "weaver-1",
				experiencePoints: 0,
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
			});

			// 1. findById failure
			repository.findByIdFailure = "Erro ao buscar personagem";
			let res = await service.activateDoubleTime("weaver-1", 3);
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("REPOSITORY_READ_FAILED");
			}
			repository.findByIdFailure = null;

			// 2. findStatusEffectsByCharacterId failure
			repository.findStatusEffectsFailure = "Erro ao buscar status effects";
			res = await service.activateDoubleTime("weaver-1", 3);
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("FETCH_STATUS_EFFECTS_FAILED");
			}
			repository.findStatusEffectsFailure = null;

			// 3. saveStatusEffect failure
			repository.saveStatusEffectFailure = "Erro ao salvar status effect";
			res = await service.activateDoubleTime("weaver-1", 3);
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("PERSIST_STATUS_EFFECT_FAILED");
			}
		});
	});
});
