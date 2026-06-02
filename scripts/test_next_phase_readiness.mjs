import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(repoRoot, "scripts", "next_phase_readiness.mjs");

test("next phase readiness allows a clean tree with untracked output evidence", async () => {
	const root = await createFixtureRoot({
		gitStatus: "?? output/browser.png\n",
	});

	try {
		const result = runReadiness(root);

		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /next phase readiness is valid/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("next phase readiness fails on tracked or staged changes", async () => {
	const root = await createFixtureRoot({
		gitStatus: " M src/app/App.svelte\nA  scripts/new_file.mjs\n",
	});

	try {
		const result = runReadiness(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /src\/app\/App\.svelte|src\\app\\App\.svelte/);
		assert.match(
			result.stderr,
			/scripts\/new_file\.mjs|scripts\\new_file\.mjs/,
		);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("next phase readiness fails on untracked files outside output", async () => {
	const root = await createFixtureRoot({ gitStatus: "?? notes.txt\n" });

	try {
		const result = runReadiness(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /notes\.txt/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("next phase readiness fails when the ledger has an open task", async () => {
	const root = await createFixtureRoot({
		taskLedger: renderTaskLedger({ inProgress: true }),
	});

	try {
		const result = runReadiness(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /in-progress task/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("next phase readiness fails when a required project script is missing", async () => {
	const root = await createFixtureRoot({
		packageJson: renderPackageJson({ omitScript: "qa:dialogue-seeds" }),
	});

	try {
		const result = runReadiness(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /qa:dialogue-seeds/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createFixtureRoot({
	gitStatus = "",
	packageJson = renderPackageJson(),
	taskLedger = renderTaskLedger(),
} = {}) {
	const root = await mkdtemp(path.join(os.tmpdir(), "pandorha-readiness-"));
	const files = {
		"package.json": packageJson,
		"docs/process/task-ledger.md": taskLedger,
		"scripts/dialogue_seed_smoke.mjs": "console.log('ok');\n",
		"git-status.txt": gitStatus,
	};

	for (const [relativePath, content] of Object.entries(files)) {
		const fullPath = path.join(root, relativePath);
		await mkdir(path.dirname(fullPath), { recursive: true });
		await writeFile(fullPath, content);
	}

	return root;
}

function renderPackageJson({ omitScript = null } = {}) {
	const scripts = {
		lint: "echo lint",
		test: "echo test",
		"test:coverage": "echo coverage",
		build: "echo build",
		"quality:gate": "echo quality",
		"qa:vertical-slice": "echo vertical",
		"qa:social-browser-smoke": "echo browser",
		"qa:dialogue-seeds": "echo seeds",
		"qa:next-phase-readiness": "echo readiness",
		"automation:doctor": "echo doctor",
	};
	if (omitScript) {
		delete scripts[omitScript];
	}

	return `${JSON.stringify({ scripts }, null, 2)}\n`;
}

function renderTaskLedger({ inProgress = false } = {}) {
	return `
# Task Ledger

## In Progress
<!-- pandorha-ledger:in-progress -->
${inProgress ? "- status: in-progress\n" : ""}
<!-- /pandorha-ledger:in-progress -->

## Completed
<!-- pandorha-ledger:completed -->
<!-- /pandorha-ledger:completed -->
`;
}

function runReadiness(root) {
	return spawnSync(
		process.execPath,
		[
			scriptPath,
			"--root",
			root,
			"--git-status-fixture",
			path.join(root, "git-status.txt"),
		],
		{
			cwd: repoRoot,
			encoding: "utf8",
		},
	);
}
