import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(
	repoRoot,
	"scripts",
	"refresh_dependency_advisories.mjs",
);

test("refresh dependency advisories normalizes local npm audit JSON", async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), "pandorha-advisories-"));
	const auditJsonPath = path.join(root, "audit.json");
	const outputPath = path.join(root, "security", "npm-advisories.json");

	await writeFile(
		auditJsonPath,
		JSON.stringify({
			vulnerabilities: {
				zeta: {
					name: "zeta",
					range: "<1.0.0",
					severity: "high",
					via: [
						{
							source: 200,
							title: "Zeta vulnerability",
							url: "https://example.test/zeta",
							range: "<1.0.0",
							severity: "high",
						},
					],
					fixAvailable: false,
				},
				alpha: {
					name: "alpha",
					range: "<2.0.0",
					severity: "critical",
					via: [
						{
							source: 100,
							title: "Alpha vulnerability",
							range: "<2.0.0",
							severity: "critical",
						},
					],
					fixAvailable: {
						name: "alpha",
						version: "2.0.0",
					},
				},
				ignored: {
					name: "ignored",
					severity: "low",
					via: [],
					fixAvailable: true,
				},
			},
		}),
	);

	try {
		const result = runRefresh([
			"--audit-json",
			auditJsonPath,
			"--output",
			outputPath,
			"--stale-after-days",
			"14",
		]);

		assert.equal(result.status, 0, result.stderr);
		assert.match(
			result.stdout,
			/dependency advisories refreshed: 2 advisories/,
		);

		const database = JSON.parse(await readFile(outputPath, "utf8"));
		assert.equal(database.source, "npm audit --json");
		assert.equal(database.staleAfterDays, 14);
		assert.equal(typeof database.generatedAt, "string");
		assert.deepEqual(database.advisories, [
			{
				id: "npm:100",
				packageName: "alpha",
				vulnerableRange: "<2.0.0",
				severity: "critical",
				title: "Alpha vulnerability",
				recommendation:
					"Upgrade alpha@2.0.0 in an approved dependency refresh.",
			},
			{
				id: "https://example.test/zeta",
				packageName: "zeta",
				vulnerableRange: "<1.0.0",
				severity: "high",
				title: "Zeta vulnerability",
				recommendation:
					"Review manually; npm audit did not report an automatic fix.",
			},
		]);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("refresh dependency advisories reports invalid local audit JSON", async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), "pandorha-advisories-"));
	const auditJsonPath = path.join(root, "audit.json");

	await writeFile(auditJsonPath, "{");

	try {
		const result = runRefresh(["--audit-json", auditJsonPath]);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /Could not read audit JSON/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("refresh dependency advisories rejects invalid stale window", () => {
	const result = runRefresh(["--stale-after-days", "0"]);

	assert.notEqual(result.status, 0);
	assert.match(result.stderr, /--stale-after-days must be a positive integer/);
});

function runRefresh(args) {
	return spawnSync("node", [scriptPath, ...args], {
		cwd: repoRoot,
		encoding: "utf8",
	});
}
