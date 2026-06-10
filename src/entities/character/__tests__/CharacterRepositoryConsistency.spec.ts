import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/sql-js";
import initSqlJs from "sql.js";
import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { DrizzleCharacterRepository } from "../infrastructure/DrizzleCharacterRepository";
import type {
	CharacterStatusEffectRecord,
	NewCharacterRecord,
	NewCharacterStatusEffectRecord,
} from "../model/characterSchema";
import type { CharacterRepositoryFailure } from "../model/characterTypes";
import { CharacterBuilder } from "../testing/CharacterBuilder";
import { InMemoryCharacterRepository } from "../testing/InMemoryCharacterRepository";

const TEST_TIMESTAMP = "2026-06-10T12:00:00.000Z";

const projectRoot = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
	"..",
);

const migrationsRoot = join(projectRoot, "drizzle");
const sqlJsWasmPath = join(
	projectRoot,
	"node_modules",
	"sql.js",
	"dist",
	"sql-wasm.wasm",
);

const findSqlFiles = (directory: string): string[] => {
	if (!existsSync(directory)) {
		return [];
	}

	return readdirSync(directory, { withFileTypes: true })
		.flatMap((entry) => {
			const entryPath = join(directory, entry.name);

			if (entry.isDirectory()) {
				return findSqlFiles(entryPath);
			}

			return entry.isFile() && entry.name.endsWith(".sql") ? [entryPath] : [];
		})
		.sort();
};

const loadMigrationSql = (): string => {
	return findSqlFiles(migrationsRoot)
		.map((filePath) => readFileSync(filePath, "utf8"))
		.join("\n");
};

describe("Character Repository Consistency (InMemory vs Drizzle SQLite)", () => {
	const initRealDatabase = async () => {
		const migrationSql = loadMigrationSql();
		const SQL = await initSqlJs({
			locateFile: () => sqlJsWasmPath,
		});
		const database = new SQL.Database();
		database.run(migrationSql);
		return database;
	};

	const runConsistencyTest = async (
		testFn: (repos: {
			inMemory: InMemoryCharacterRepository;
			drizzle: DrizzleCharacterRepository;
		}) => Promise<void>,
	) => {
		const sqliteDb = await initRealDatabase();
		try {
			const drizzleDb = drizzle(sqliteDb);
			const drizzleRepo = new DrizzleCharacterRepository(drizzleDb);
			const inMemoryRepo = new InMemoryCharacterRepository();

			await testFn({ inMemory: inMemoryRepo, drizzle: drizzleRepo });
		} finally {
			sqliteDb.close();
		}
	};

	it("should behave identically when saving and retrieving a valid character record", async () => {
		await runConsistencyTest(async ({ inMemory, drizzle }) => {
			const newChar: NewCharacterRecord = {
				...CharacterBuilder.valid().buildCreateInput(),
				id: "char-1",
				experiencePoints: 10,
				tensionMeter: 2,
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
			};

			// 1. Salva em ambos
			const memSaveResult = await inMemory.save(newChar);
			const dbSaveResult = await drizzle.save(newChar);

			const savedMem = expectSuccess(memSaveResult);
			const savedDb = expectSuccess(dbSaveResult);

			// Ambos devem retornar o registro correspondente
			expect(savedMem).toEqual(newChar);
			expect(savedDb).toEqual(newChar);

			// 2. Recupera por ID em ambos
			const memFindResult = await inMemory.findById("char-1");
			const dbFindResult = await drizzle.findById("char-1");

			const foundMem = expectSuccess(memFindResult);
			const foundDb = expectSuccess(dbFindResult);

			expect(foundMem).toEqual(newChar);
			expect(foundDb).toEqual(newChar);
		});
	});

	it("should behave identically when finding a non-existent character ID", async () => {
		await runConsistencyTest(async ({ inMemory, drizzle }) => {
			const memResult = await inMemory.findById("missing-id");
			const dbResult = await drizzle.findById("missing-id");

			const errMem = expectFailure(memResult);
			const errDb = expectFailure(dbResult);

			expect(errMem.code).toBe("CHARACTER_NOT_FOUND");
			expect(errDb.code).toBe("CHARACTER_NOT_FOUND");
			expect(errMem.details).toEqual({ id: "missing-id" });
			expect(errDb.details).toEqual({ id: "missing-id" });
		});
	});

	it("should behave identically when saving, retrieving, and deleting status effects", async () => {
		await runConsistencyTest(async ({ inMemory, drizzle }) => {
			// Pre-requisito: Salvar o personagem correspondente por causa de chaves estrangeiras
			const newChar: NewCharacterRecord = {
				...CharacterBuilder.valid().buildCreateInput(),
				id: "char-status-test",
				experiencePoints: 0,
				tensionMeter: 0,
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
			};
			await inMemory.save(newChar);
			await drizzle.save(newChar);

			const effect: NewCharacterStatusEffectRecord = {
				id: "eff-1",
				characterId: "char-status-test",
				type: "eter_fever",
				severity: 3,
				severityMax: 5,
				isAggravated: true,
				durationTurns: null,
				metadata: null,
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
			};

			const expectedEffectRecord: CharacterStatusEffectRecord = {
				...effect,
				updatedAt: TEST_TIMESTAMP,
			};

			// 1. Salva o efeito em ambos
			const memSaveEffect = await inMemory.saveStatusEffect(effect);
			const dbSaveEffect = await drizzle.saveStatusEffect(effect);

			const savedEffMem = expectSuccess(memSaveEffect);
			const savedEffDb = expectSuccess(dbSaveEffect);

			expect(savedEffMem).toEqual(expectedEffectRecord);
			expect(savedEffDb).toEqual(expectedEffectRecord);

			// 2. Busca efeitos pelo ID do personagem
			const memFindEffects =
				await inMemory.findStatusEffectsByCharacterId("char-status-test");
			const dbFindEffects =
				await drizzle.findStatusEffectsByCharacterId("char-status-test");

			const listMem = expectSuccess(memFindEffects);
			const listDb = expectSuccess(dbFindEffects);

			expect(listMem).toEqual([expectedEffectRecord]);
			expect(listDb).toEqual([expectedEffectRecord]);

			// 3. Deleta o efeito em ambos
			const memDelete = await inMemory.deleteStatusEffect("eff-1");
			const dbDelete = await drizzle.deleteStatusEffect("eff-1");

			expectSuccess(memDelete);
			expectSuccess(dbDelete);

			// 4. Busca novamente: a lista agora deve estar vazia
			const memFindEffectsAfter =
				await inMemory.findStatusEffectsByCharacterId("char-status-test");
			const dbFindEffectsAfter =
				await drizzle.findStatusEffectsByCharacterId("char-status-test");

			expect(expectSuccess(memFindEffectsAfter)).toEqual([]);
			expect(expectSuccess(dbFindEffectsAfter)).toEqual([]);
		});
	});
});

function expectSuccess<T>(result: Result<T, CharacterRepositoryFailure>): T {
	if (!result.success) {
		console.log("ACTUAL FAILURE ENCOUNTERED:", result.error);
	}
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}
	expect.fail(`Expected success but got error code: ${result.error.code}`);
}

function expectFailure<T>(
	result: Result<T, CharacterRepositoryFailure>,
): CharacterRepositoryFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}
	expect.fail("Expected failure but got success");
}
