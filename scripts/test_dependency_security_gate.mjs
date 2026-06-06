import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	chmod,
	mkdir,
	mkdtemp,
	readFile,
	rm,
	writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(
	repoRoot,
	"scripts",
	"dependency_security_gate.mjs",
);

test("dependency security gate passes when no installed package matches an advisory", async () => {
	const root = await createFixtureRoot({
		lockPackages: [{ name: "safe-package", version: "1.0.0" }],
		advisories: [
			createAdvisory({
				packageName: "safe-package",
				vulnerableRange: "<1.0.0",
				severity: "high",
			}),
		],
	});

	try {
		const result = runGate(root);

		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /dependency security gate passed/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("dependency security gate fails when a transitive package matches a high advisory", async () => {
	const root = await createFixtureRoot({
		lockPackages: [
			{ name: "direct-package", version: "2.0.0" },
			{ name: "nested-vulnerable", version: "1.1.0" },
		],
		advisories: [
			createAdvisory({
				packageName: "nested-vulnerable",
				vulnerableRange: "<1.2.0",
				severity: "high",
			}),
		],
	});

	try {
		const result = runGate(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /nested-vulnerable@1\.1\.0/);
		assert.match(result.stderr, /fixture-advisory/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("dependency security gate ignores advisories below the configured audit level", async () => {
	const root = await createFixtureRoot({
		lockPackages: [{ name: "moderate-package", version: "1.0.0" }],
		advisories: [
			createAdvisory({
				packageName: "moderate-package",
				vulnerableRange: "<2.0.0",
				severity: "moderate",
			}),
		],
	});

	try {
		const result = runGate(root);

		assert.equal(result.status, 0, result.stderr);
		assert.doesNotMatch(result.stdout, /vulnerability found/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("dependency security gate warns but passes when the advisory database is stale", async () => {
	const root = await createFixtureRoot({
		generatedAt: "2020-01-01T00:00:00.000Z",
		lockPackages: [{ name: "safe-package", version: "1.0.0" }],
		advisories: [],
	});

	try {
		const result = runGate(root);

		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /advisory database is stale/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("dependency security gate fails when an advisory range is unsupported", async () => {
	const root = await createFixtureRoot({
		lockPackages: [{ name: "unsupported-range-package", version: "1.0.0" }],
		advisories: [
			createAdvisory({
				packageName: "unsupported-range-package",
				vulnerableRange: "^1.0.0",
				severity: "high",
			}),
		],
	});

	try {
		const result = runGate(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /unsupported vulnerableRange/i);
		assert.match(result.stderr, /\^1\.0\.0/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("dependency security gate does not execute npm audit during offline validation", async () => {
	const root = await createFixtureRoot({
		lockPackages: [{ name: "safe-package", version: "1.0.0" }],
		advisories: [],
	});
	const fakeBin = path.join(root, "fake-bin");
	const marker = path.join(root, "npm-called.txt");

	try {
		await mkdir(fakeBin, { recursive: true });
		await writeFile(
			path.join(fakeBin, "npm.cmd"),
			`@echo off\r\necho called > "%PANDORHA_NPM_MARKER%"\r\nexit /b 7\r\n`,
			"utf8",
		);
		const fakeNpmPath = path.join(fakeBin, "npm");
		await writeFile(
			fakeNpmPath,
			'#!/bin/sh\nprintf called > "$PANDORHA_NPM_MARKER"\nexit 7\n',
			"utf8",
		);
		await chmod(fakeNpmPath, 0o755);

		const result = runGate(root, [], {
			PANDORHA_NPM_MARKER: marker,
			PATH: `${fakeBin}${path.delimiter}${process.env.PATH ?? ""}`,
		});

		assert.equal(result.status, 0, result.stderr);
		await assert.rejects(readFile(marker, "utf8"), /ENOENT/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("dependency security gate accepts equals-style CLI options", async () => {
	const root = await createFixtureRoot({
		lockPackages: [{ name: "safe-package", version: "1.0.0" }],
		advisories: [],
	});

	try {
		const result = spawnSync(
			process.execPath,
			[scriptPath, `--root=${root}`, "--audit-level=high", "--format=json"],
			{
				cwd: repoRoot,
				encoding: "utf8",
			},
		);
		assert.equal(result.status, 0, result.stderr);
		const parsed = JSON.parse(result.stdout);
		assert.equal(parsed.status, "passed");
		assert.equal(parsed.auditLevel, "high");
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createFixtureRoot({
	lockPackages,
	advisories,
	generatedAt = new Date().toISOString(),
	staleAfterDays = 30,
}) {
	const root = await mkdtemp(path.join(os.tmpdir(), "pandorha-deps-"));
	await mkdir(path.join(root, "security"), { recursive: true });
	await writeFile(
		path.join(root, "package-lock.json"),
		JSON.stringify(createLockfile(lockPackages), null, 2),
		"utf8",
	);
	await writeFile(
		path.join(root, "security", "npm-advisories.json"),
		JSON.stringify(
			{
				generatedAt,
				source: "test fixture",
				staleAfterDays,
				advisories,
			},
			null,
			2,
		),
		"utf8",
	);

	return root;
}

function createLockfile(lockPackages) {
	return {
		name: "dependency-security-fixture",
		version: "0.0.0",
		lockfileVersion: 3,
		requires: true,
		packages: Object.fromEntries([
			["", { name: "dependency-security-fixture", version: "0.0.0" }],
			...lockPackages.map((entry) => [
				`node_modules/${entry.name}`,
				{ version: entry.version },
			]),
		]),
	};
}

function createAdvisory({
	packageName,
	vulnerableRange,
	severity,
	id = "fixture-advisory",
}) {
	return {
		id,
		packageName,
		vulnerableRange,
		severity,
		title: "Fixture advisory",
		recommendation: "Upgrade the affected package.",
	};
}

function runGate(root, extraArgs = [], extraEnv = {}) {
	return spawnSync(
		process.execPath,
		[scriptPath, "--root", root, "--audit-level", "high", ...extraArgs],
		{
			cwd: repoRoot,
			encoding: "utf8",
			env: { ...process.env, ...extraEnv },
		},
	);
}
