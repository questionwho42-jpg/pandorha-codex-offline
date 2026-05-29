import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { ok } from "$lib/shared/lib/result";
import type { CharacterRepository } from "../domain/CharacterRepository";
import { CharacterService } from "../domain/CharacterService";
import {
	getCharacterTierForLevel,
	validateCharacterCreationRules,
} from "../model/characterRules";
import type {
	CharacterRecord,
	CharacterStatusEffectRecord,
	NewCharacterRecord,
} from "../model/characterSchema";
import type {
	CharacterFailure,
	CharacterRepositoryFailure,
} from "../model/characterTypes";
import { CharacterBuilder } from "../testing/CharacterBuilder";
import { InMemoryCharacterRepository } from "../testing/InMemoryCharacterRepository";

const TEST_TIMESTAMP = "2026-05-02T14:49:35.000Z";

describe("[GDD 00] Character creation 3x3 distribution", () => {
	it("creates a valid level 1 character through Drizzle-Zod validation and the fake repository", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = createService(repository);

		const result = await service.createCharacter(
			CharacterBuilder.valid().buildCreateInput(),
		);
		const character = expectCharacterSuccess(result);

		expect(character).toMatchObject({
			id: "character-1",
			name: "Kael de Almar",
			level: 1,
			physical: 3,
			mental: 1,
			social: 2,
			conflict: 2,
			interaction: 1,
			resistance: 3,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});
		expect(repository.all()).toHaveLength(1);
	});

	it("rejects axes that do not spend exactly 6 points", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = createService(repository);

		const result = await service.createCharacter(
			CharacterBuilder.valid()
				.withAxes({ physical: 2, mental: 1, social: 1 })
				.buildCreateInput(),
		);
		const failure = expectCharacterFailure(result);

		expect(failure.code).toBe("INVALID_AXIS_DISTRIBUTION");
		expect(repository.all()).toHaveLength(0);
	});

	it("rejects applications that do not spend exactly 6 points", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = createService(repository);

		const result = await service.createCharacter(
			CharacterBuilder.valid()
				.withApplications({ conflict: 1, interaction: 1, resistance: 1 })
				.buildCreateInput(),
		);
		const failure = expectCharacterFailure(result);

		expect(failure.code).toBe("INVALID_APPLICATION_DISTRIBUTION");
		expect(repository.all()).toHaveLength(0);
	});

	it("rejects a level 1 aptitude above the Tier I cap", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = createService(repository);

		const result = await service.createCharacter(
			CharacterBuilder.valid()
				.withAxes({ physical: 4, mental: 1, social: 1 })
				.buildCreateInput(),
		);
		const failure = expectCharacterFailure(result);

		expect(failure.code).toBe("INVALID_TIER_CAP");
		expect(repository.all()).toHaveLength(0);
	});

	it("rejects a level 1 application above the Tier I cap", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = createService(repository);

		const result = await service.createCharacter(
			CharacterBuilder.valid()
				.withApplications({ conflict: 4, interaction: 1, resistance: 1 })
				.buildCreateInput(),
		);
		const failure = expectCharacterFailure(result);

		expect(failure.code).toBe("INVALID_TIER_CAP");
		expect(repository.all()).toHaveLength(0);
	});

	it("rejects blank names at the Drizzle-Zod boundary", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = createService(repository);

		const result = await service.createCharacter(
			CharacterBuilder.valid().withName(" ").buildCreateInput(),
		);
		const failure = expectCharacterFailure(result);

		expect(failure.code).toBe("INVALID_CHARACTER_INPUT");
		expect(repository.all()).toHaveLength(0);
	});

	it("reports root-level Drizzle-Zod input failures", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = createService(repository);

		const result = await service.createCharacter(null);
		const failure = expectCharacterFailure(result);

		expect(failure.code).toBe("INVALID_CHARACTER_INPUT");
		expect(failure.details?.issues).toContain(
			"root: Invalid input: expected object, received null",
		);
	});

	it("maps repository failures into a service Result failure", async () => {
		const repository = new InMemoryCharacterRepository();
		repository.failNextSave({
			code: "CHARACTER_REPOSITORY_WRITE_FAILED",
			message: "Injected fake write failure.",
		});
		const service = createService(repository);

		const result = await service.createCharacter(
			CharacterBuilder.valid().buildCreateInput(),
		);
		const failure = expectCharacterFailure(result);

		expect(failure.code).toBe("REPOSITORY_WRITE_FAILED");
		expect(repository.all()).toHaveLength(0);
	});

	it("keeps repository failure details when the fake reports them", async () => {
		const repository = new InMemoryCharacterRepository();
		repository.failNextSave({
			code: "CHARACTER_REPOSITORY_WRITE_FAILED",
			message: "Injected fake write failure.",
			details: { cause: "locked-save-slot" },
		});
		const service = createService(repository);

		const result = await service.createCharacter(
			CharacterBuilder.valid().buildCreateInput(),
		);
		const failure = expectCharacterFailure(result);

		expect(failure.code).toBe("REPOSITORY_WRITE_FAILED");
		expect(failure.details).toEqual({ cause: "locked-save-slot" });
	});

	it("rejects invalid generated ids before persistence", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = new CharacterService(
			repository,
			{ generate: () => " " },
			{ now: () => TEST_TIMESTAMP },
		);

		const result = await service.createCharacter(
			CharacterBuilder.valid().buildCreateInput(),
		);
		const failure = expectCharacterFailure(result);

		expect(failure.code).toBe("INVALID_CHARACTER_RECORD");
		expect(repository.all()).toHaveLength(0);
	});

	it("rejects persisted records that fail output validation", async () => {
		const repository = new CorruptOutputCharacterRepository();
		const service = createService(repository);

		const result = await service.createCharacter(
			CharacterBuilder.valid().buildCreateInput(),
		);
		const failure = expectCharacterFailure(result);

		expect(failure.code).toBe("INVALID_CHARACTER_RECORD");
	});
});

describe("[GDD 00] Character Tier caps", () => {
	it.each([
		{ level: 1, tier: 1 },
		{ level: 5, tier: 1 },
		{ level: 6, tier: 2 },
		{ level: 10, tier: 2 },
		{ level: 11, tier: 3 },
		{ level: 15, tier: 3 },
		{ level: 16, tier: 4 },
		{ level: 20, tier: 4 },
	])("maps level $level to Tier $tier", ({ level, tier }) => {
		const result = getCharacterTierForLevel(level);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toBe(tier);
		}
	});

	it("rejects levels outside the supported 1-20 range", () => {
		const result = getCharacterTierForLevel(0);
		const failure = expectRuleFailure(result);

		expect(failure.code).toBe("INVALID_CHARACTER_INPUT");
	});

	it("rejects direct rule validation for out-of-range levels", () => {
		const result = validateCharacterCreationRules(
			CharacterBuilder.valid().withLevel(21).buildCreateInput(),
		);
		const failure = expectRuleFailure(result);

		expect(failure.code).toBe("INVALID_CHARACTER_INPUT");
	});
});

function createService(repository: CharacterRepository): CharacterService {
	return new CharacterService(
		repository,
		{ generate: () => "character-1" },
		{ now: () => TEST_TIMESTAMP },
	);
}

function expectCharacterSuccess(
	result: Result<CharacterRecord, CharacterFailure>,
): CharacterRecord {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectCharacterFailure(
	result: Result<CharacterRecord, CharacterFailure>,
): CharacterFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

function expectRuleFailure<Success>(
	result: Result<Success, CharacterFailure>,
): CharacterFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected rule failure, received success.");
}

class CorruptOutputCharacterRepository implements CharacterRepository {
	public async save(
		record: NewCharacterRecord,
	): Promise<Result<CharacterRecord, never>> {
		return ok({ ...record, name: "" });
	}

	public async findById(): Promise<Result<CharacterRecord, never>> {
		return ok({
			...CharacterBuilder.valid().buildCreateInput(),
			id: "character-1",
			experiencePoints: 0,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});
	}

	public async saveStatusEffect(): Promise<
		Result<CharacterStatusEffectRecord, CharacterRepositoryFailure>
	> {
		return {
			success: false,
			error: {
				code: "CHARACTER_REPOSITORY_WRITE_FAILED",
				message: "Not implemented in CorruptOutputCharacterRepository",
			},
		};
	}

	public async findStatusEffectsByCharacterId(): Promise<
		Result<CharacterStatusEffectRecord[], CharacterRepositoryFailure>
	> {
		return {
			success: false,
			error: {
				code: "CHARACTER_REPOSITORY_WRITE_FAILED",
				message: "Not implemented in CorruptOutputCharacterRepository",
			},
		};
	}

	public async deleteStatusEffect(): Promise<
		Result<void, CharacterRepositoryFailure>
	> {
		return {
			success: false,
			error: {
				code: "CHARACTER_REPOSITORY_WRITE_FAILED",
				message: "Not implemented in CorruptOutputCharacterRepository",
			},
		};
	}
}

describe("CharacterService resurrection rules", () => {
	it("deve ressuscitar personagem com sucesso quando ressurreição não estiver bloqueada", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = createService(repository);

		// Primeiro cria o personagem para existir no BD
		await service.createCharacter(CharacterBuilder.valid().buildCreateInput());

		const res = await service.resurrectCharacter("character-1", async () =>
			ok(false),
		);
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.status).toBe("resurrected");
		}
	});

	it("deve bloquear a ressurreição caso exista pendência de alma ou dívida de sangue", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = createService(repository);

		await service.createCharacter(CharacterBuilder.valid().buildCreateInput());

		const res = await service.resurrectCharacter("character-1", async () =>
			ok(true),
		);
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("RESURRECTION_BLOCKED");
		}
	});

	it("deve falhar a ressurreição se a leitura ou gravação do repositório falharem", async () => {
		const repository = new InMemoryCharacterRepository();
		const service = createService(repository);

		// 1. Falha de leitura (não existe no BD)
		const resRead = await service.resurrectCharacter("inexistente", async () =>
			ok(false),
		);
		expect(resRead.success).toBe(false);
		if (!resRead.success) {
			expect(resRead.error.code).toBe("REPOSITORY_READ_FAILED");
		}

		// 2. Falha de escrita
		await service.createCharacter(CharacterBuilder.valid().buildCreateInput());
		repository.failNextSave({
			code: "CHARACTER_REPOSITORY_WRITE_FAILED",
			message: "Erro de escrita",
		});
		const resWrite = await service.resurrectCharacter("character-1", async () =>
			ok(false),
		);
		expect(resWrite.success).toBe(false);
		if (!resWrite.success) {
			expect(resWrite.error.code).toBe("REPOSITORY_WRITE_FAILED");
		}
	});
});
