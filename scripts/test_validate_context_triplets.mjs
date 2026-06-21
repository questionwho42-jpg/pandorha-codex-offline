import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(
	repoRoot,
	"scripts",
	"validate_context_triplets.mjs",
);

test("context triplet validator passes complete context directories", async () => {
	const root = await createRootWithContext({
		"src/features/combat/.context/tech-memory.md": "# Combat Tech Memory\n",
		"src/features/combat/.context/scaling-roadmap.md":
			"# Combat Scaling Roadmap\n",
		"src/features/combat/.context/plain-english.md": "# Combat Para Usuario\n",
	});

	try {
		const result = runValidator(root, ["--format", "json"]);
		const report = JSON.parse(result.stdout);

		assert.equal(result.status, 0, result.stderr);
		assert.equal(report.summary.checkedModules, 1);
		assert.equal(report.summary.issueCount, 0);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("context triplet validator fails when a required file is missing", async () => {
	const root = await createRootWithContext({
		"src/features/combat/.context/tech-memory.md": "# Combat Tech Memory\n",
		"src/features/combat/.context/scaling-roadmap.md":
			"# Combat Scaling Roadmap\n",
	});

	try {
		const result = runValidator(root, ["--format", "json"]);
		const report = JSON.parse(result.stdout);

		assert.notEqual(result.status, 0);
		assert.equal(report.summary.issueCount, 1);
		assert.equal(report.modules[0].issues[0].type, "missing-file");
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("context triplet validator fails when a context file has no H1", async () => {
	const root = await createRootWithContext({
		"src/entities/item/.context/tech-memory.md": "# Item Tech Memory\n",
		"src/entities/item/.context/scaling-roadmap.md": "Scaling without H1\n",
		"src/entities/item/.context/plain-english.md": "# Item Para Usuario\n",
	});

	try {
		const result = runValidator(root, ["--format", "json"]);
		const report = JSON.parse(result.stdout);

		assert.notEqual(result.status, 0);
		assert.equal(report.modules[0].issues[0].type, "missing-h1");
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createRootWithContext(files) {
	const root = await mkdtemp(path.join(os.tmpdir(), "pandorha-context-"));

	for (const [relativePath, content] of Object.entries(files)) {
		const filePath = path.join(root, relativePath);
		await mkdir(path.dirname(filePath), { recursive: true });
		await writeFile(filePath, content, "utf8");
	}

	return root;
}

function runValidator(root, args) {
	return spawnSync(process.execPath, [scriptPath, "--root", root, ...args], {
		cwd: repoRoot,
		encoding: "utf8",
	});
}
