import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const coreValidator = path.join(
	repoRoot,
	".agents/skills/core-conventions/scripts/validate.mjs",
);
const hardStopValidator = path.join(
	repoRoot,
	".agents/skills/self-review-checklist/scripts/hard_stop.mjs",
);
const jsonValidator = path.join(
	repoRoot,
	".agents/skills/self-review-checklist/scripts/run_json_tests.mjs",
);

test("core conventions validator accepts safe TypeScript and Svelte files", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runNode(coreValidator, [
			path.join(root, "safe.ts"),
			path.join(root, "safe.svelte"),
		]);

		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /validation passed/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("core conventions validator rejects forbidden code patterns", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runNode(coreValidator, [
			path.join(root, "unsafe.ts"),
			path.join(root, "unsafe.svelte"),
		]);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /export default/);
		assert.match(result.stderr, /throw new Error/);
		assert.match(result.stderr, /Tailwind default color/);
		assert.match(result.stderr, /<style>/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("self review hard stop rejects mock usage", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runNode(hardStopValidator, [path.join(root, "mocked.ts")]);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /jest\.mock/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("self review json validator accepts valid JSON and rejects invalid JSON", async () => {
	const root = await createFixtureRoot();

	try {
		const validResult = runNode(jsonValidator, [path.join(root, "valid.json")]);
		const invalidResult = runNode(jsonValidator, [
			path.join(root, "invalid.json"),
		]);

		assert.equal(validResult.status, 0, validResult.stderr);
		assert.notEqual(invalidResult.status, 0);
		assert.match(invalidResult.stderr, /Invalid JSON/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createFixtureRoot() {
	const root = await mkdtemp(path.join(os.tmpdir(), "pandorha-skill-"));
	await mkdir(root, { recursive: true });
	await writeFile(rootPath(root, "safe.ts"), "export const value = 1;\n");
	await writeFile(
		rootPath(root, "safe.svelte"),
		'<section class="bg-void text-bone border-ether">Seguro</section>\n',
	);
	await writeFile(
		rootPath(root, "unsafe.ts"),
		'export default function bad() { throw new Error("bad"); }\n',
	);
	await writeFile(
		rootPath(root, "unsafe.svelte"),
		'<style>.bad{}</style><section class="bg-red-500">Ruim</section>\n',
	);
	await writeFile(rootPath(root, "mocked.ts"), 'jest.mock("./thing");\n');
	await writeFile(rootPath(root, "valid.json"), '{"ok": true}\n');
	await writeFile(rootPath(root, "invalid.json"), '{"ok": true\n');
	return root;
}

function rootPath(root, fileName) {
	return path.join(root, fileName);
}

function runNode(scriptPath, args) {
	return spawnSync(process.execPath, [scriptPath, ...args], {
		cwd: repoRoot,
		encoding: "utf8",
	});
}
