import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(
	repoRoot,
	"scripts",
	"scaffold_catalog_entity.mjs",
);

test("catalog entity scaffold creates the expected entity structure", async () => {
	const root = await createTemporaryRoot();

	try {
		const result = runScaffold(root, [
			"--layer",
			"entities",
			"--slice",
			"relic",
			"--service",
			"RelicCatalogService",
		]);

		assert.equal(result.status, 0, result.stderr);
		const expectedFiles = [
			"src/entities/relic/index.ts",
			"src/entities/relic/model/relicSchema.ts",
			"src/entities/relic/model/relicCatalog.ts",
			"src/entities/relic/model/relicTypes.ts",
			"src/entities/relic/domain/RelicCatalogService.ts",
			"src/entities/relic/domain/RelicCatalogRepository.ts",
			"src/entities/relic/testing/InMemoryRelicCatalogRepository.ts",
			"src/entities/relic/__tests__/RelicCatalogService.spec.ts",
			"src/entities/relic/.context/tech-memory.md",
			"src/entities/relic/.context/scaling-roadmap.md",
			"src/entities/relic/.context/plain-english.md",
		];

		for (const expectedFile of expectedFiles) {
			await assertFileExists(path.join(root, expectedFile));
		}

		const indexContent = await readFile(
			path.join(root, "src/entities/relic/index.ts"),
			"utf8",
		);
		assert.match(indexContent, /RelicCatalogService/);
		assert.match(indexContent, /InMemoryRelicCatalogRepository/);
		assert.doesNotMatch(indexContent, /export default/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("catalog entity scaffold refuses to overwrite existing files", async () => {
	const root = await createTemporaryRoot();

	try {
		const args = [
			"--layer",
			"entities",
			"--slice",
			"relic",
			"--service",
			"RelicCatalogService",
		];

		assert.equal(runScaffold(root, args).status, 0);
		const secondRun = runScaffold(root, args);

		assert.notEqual(secondRun.status, 0);
		assert.match(secondRun.stderr, /already exists/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("catalog entity scaffold rejects path traversal", async () => {
	const root = await createTemporaryRoot();

	try {
		const result = runScaffold(root, [
			"--layer",
			"entities",
			"--slice",
			"..\\outside",
			"--service",
			"RelicCatalogService",
		]);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /Invalid slice/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("catalog entity scaffold only supports the entities layer", async () => {
	const root = await createTemporaryRoot();

	try {
		const result = runScaffold(root, [
			"--layer",
			"features",
			"--slice",
			"relic",
			"--service",
			"RelicCatalogService",
		]);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /entities layer/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("catalog entity scaffold rejects invalid service names", async () => {
	const root = await createTemporaryRoot();

	try {
		const result = runScaffold(root, [
			"--layer",
			"entities",
			"--slice",
			"relic",
			"--service",
			"relicService",
		]);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /Invalid service/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createTemporaryRoot() {
	return mkdtemp(path.join(os.tmpdir(), "pandorha-catalog-scaffold-"));
}

function runScaffold(root, args) {
	return spawnSync(process.execPath, [scriptPath, "--root", root, ...args], {
		cwd: repoRoot,
		encoding: "utf8",
	});
}

async function assertFileExists(filePath) {
	try {
		const fileStat = await stat(filePath);
		assert.equal(fileStat.isFile(), true);
	} catch (error) {
		if (error instanceof Error) {
			error.message = `Expected file to exist: ${filePath}\n${error.message}`;
		}
		throw error;
	}
}
