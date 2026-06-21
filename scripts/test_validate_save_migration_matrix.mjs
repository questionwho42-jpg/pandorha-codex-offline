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
	"validate_save_migration_matrix.mjs",
);

test("save migration matrix passes a complete version chain", async () => {
	const root = await createSaveFixtureRoot();

	try {
		const result = runValidator(root, ["--format", "json"]);
		const report = JSON.parse(result.stdout);

		assert.equal(result.status, 0, result.stderr);
		assert.equal(report.currentSaveVersion, 9);
		assert.equal(report.summary.issueCount, 0);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("save migration matrix detects a missing legacy schema", async () => {
	const root = await createSaveFixtureRoot({ omittedSchemaVersion: 8 });

	try {
		const result = runValidator(root, ["--format", "json"]);
		const report = JSON.parse(result.stdout);

		assert.notEqual(result.status, 0);
		assert.ok(report.issues.some((issue) => issue.type === "missing-schema"));
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("save migration matrix detects a missing legacy test", async () => {
	const root = await createSaveFixtureRoot({ omittedTestVersion: 7 });

	try {
		const result = runValidator(root, ["--format", "json"]);
		const report = JSON.parse(result.stdout);

		assert.notEqual(result.status, 0);
		assert.ok(report.issues.some((issue) => issue.type === "missing-test"));
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("save migration matrix detects outdated fixtures", async () => {
	const root = await createSaveFixtureRoot({ fixtureVersion: 8 });

	try {
		const result = runValidator(root, ["--format", "json"]);
		const report = JSON.parse(result.stdout);

		assert.notEqual(result.status, 0);
		assert.ok(report.issues.some((issue) => issue.type === "outdated-fixture"));
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createSaveFixtureRoot(options = {}) {
	const root = await mkdtemp(path.join(os.tmpdir(), "pandorha-save-matrix-"));
	const schemaVersions = range(1, 9).filter(
		(version) => version !== options.omittedSchemaVersion,
	);
	const testVersions = range(1, 8).filter(
		(version) => version !== options.omittedTestVersion,
	);
	const fixtureVersion = options.fixtureVersion ?? 9;
	const fixtureVersionExpression =
		fixtureVersion === 9 ? "CURRENT_SAVE_VERSION" : String(fixtureVersion);
	const files = {
		"src/features/save-load/model/saveLoadSchemas.ts": [
			"export const CURRENT_SAVE_VERSION = 9;",
			...schemaVersions.map(
				(version) => `const v${version} = z.literal(${version});`,
			),
			...range(1, 8).map(
				(version) =>
					`if (snapshot.version === ${version}) return { ...snapshot, version: ${version + 1} };`,
			),
			`const fixture = { version: ${fixtureVersionExpression}, savedAt: "2026-01-01T00:00:00.000Z" };`,
		].join("\n"),
		"src/features/save-load/__tests__/SaveLoadService.spec.ts": testVersions
			.map(
				(version) =>
					`it("migrates v${version}", () => ({ version: ${version} }));`,
			)
			.join("\n"),
		"src/features/save-load/__tests__/SqliteSaveSnapshotService.spec.ts":
			testVersions
				.map(
					(version) =>
						`it("loads sqlite v${version}", () => JSON.stringify({ version: ${version} }));`,
				)
				.join("\n"),
	};

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

function range(start, end) {
	return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
