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
	"scaffold_domain_service.mjs",
);

test("domain service scaffold creates a shared service structure", async () => {
	const root = await createTemporaryRoot();

	try {
		const result = runScaffold(root, [
			"--layer",
			"shared",
			"--slice",
			"inventory",
			"--service",
			"InventoryCapacityService",
		]);

		assert.equal(result.status, 0, result.stderr);
		const expectedFiles = [
			"src/shared/inventory/index.ts",
			"src/shared/inventory/domain/InventoryCapacityService.ts",
			"src/shared/inventory/model/inventoryCapacityTypes.ts",
			"src/shared/inventory/__tests__/InventoryCapacityService.spec.ts",
			"src/shared/inventory/.context/tech-memory.md",
			"src/shared/inventory/.context/scaling-roadmap.md",
			"src/shared/inventory/.context/plain-english.md",
		];

		for (const expectedFile of expectedFiles) {
			await assertFileExists(path.join(root, expectedFile));
		}

		const serviceContent = await readFile(
			path.join(
				root,
				"src/shared/inventory/domain/InventoryCapacityService.ts",
			),
			"utf8",
		);
		assert.match(serviceContent, /class InventoryCapacityService/);
		assert.match(serviceContent, /Result</);
		assert.doesNotMatch(serviceContent, /throw new Error/);
		assert.doesNotMatch(serviceContent, /export default/);

		const techMemory = await readFile(
			path.join(root, "src/shared/inventory/.context/tech-memory.md"),
			"utf8",
		);
		assert.match(techMemory, /vitest\.config\.mjs/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("domain service scaffold supports features layer", async () => {
	const root = await createTemporaryRoot();

	try {
		const result = runScaffold(root, [
			"--layer",
			"features",
			"--slice",
			"spell-cast",
			"--service",
			"SpellCastBuilderService",
		]);

		assert.equal(result.status, 0, result.stderr);
		await assertFileExists(
			path.join(
				root,
				"src/features/spell-cast/domain/SpellCastBuilderService.ts",
			),
		);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("domain service scaffold refuses to overwrite existing service files", async () => {
	const root = await createTemporaryRoot();

	try {
		const args = [
			"--layer",
			"shared",
			"--slice",
			"inventory",
			"--service",
			"InventoryCapacityService",
		];

		assert.equal(runScaffold(root, args).status, 0);
		const secondRun = runScaffold(root, args);

		assert.notEqual(secondRun.status, 0);
		assert.match(secondRun.stderr, /already exists/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("domain service scaffold rejects unsupported layers", async () => {
	const root = await createTemporaryRoot();

	try {
		const result = runScaffold(root, [
			"--layer",
			"widgets",
			"--slice",
			"inventory",
			"--service",
			"InventoryCapacityService",
		]);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /shared, entities, or features/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("domain service scaffold rejects path traversal", async () => {
	const root = await createTemporaryRoot();

	try {
		const result = runScaffold(root, [
			"--layer",
			"shared",
			"--slice",
			"..\\outside",
			"--service",
			"InventoryCapacityService",
		]);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /Invalid slice/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createTemporaryRoot() {
	return mkdtemp(path.join(os.tmpdir(), "pandorha-domain-scaffold-"));
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
