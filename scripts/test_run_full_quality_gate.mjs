import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(repoRoot, "scripts", "run_full_quality_gate.mjs");

test("quality gate parses supported and unsupported --only arguments", async () => {
	const module = await importQualityGateModule();

	assert.deepEqual(module.parseOnlyArgument([]), {
		success: true,
		value: "all",
	});
	assert.deepEqual(module.parseOnlyArgument(["--only=automation"]), {
		success: true,
		value: "automation",
	});
	assert.deepEqual(module.parseOnlyArgument(["--only=invalid"]), {
		success: false,
		error: "Unsupported --only value: invalid",
	});
});

test("quality gate automation plan includes every paired automation test", async () => {
	const module = await importQualityGateModule();
	const commands = module
		.createGatePlan("automation")
		.map((step) => [step.command, ...step.args].join(" "));

	assert.ok(commands.includes("node scripts/test_install_process_hooks.mjs"));
	assert.ok(commands.includes("node scripts/test_process_hook_runner.mjs"));
	assert.ok(
		commands.includes("node scripts/test_refresh_dependency_advisories.mjs"),
	);
	assert.ok(commands.includes("node scripts/test_run_full_quality_gate.mjs"));
});

test("quality gate release plan includes production build", async () => {
	const module = await importQualityGateModule();
	const releasePlan = module.createGatePlan("release");

	assert.ok(
		releasePlan.some(
			(step) =>
				step.label === "root:build" &&
				step.command.endsWith("npm.cmd") &&
				step.args.join(" ") === "run build",
		),
	);
});

test("quality gate markdown report renders failures explicitly", async () => {
	const module = await importQualityGateModule();

	const report = module.renderMarkdownReport({
		startedAt: "2026-06-21T00:00:00.000Z",
		finishedAt: "2026-06-21T00:00:01.000Z",
		selectedGate: "automation",
		status: "failed",
		results: [
			{
				label: "automation:example",
				status: "failed",
				exitCode: 1,
				stderr: "example failure",
				stdout: "",
			},
		],
	});

	assert.match(report, /# Pandorha Quality Gate Report/);
	assert.match(report, /\| automation:example \| failed \| 1 \|/);
	assert.match(report, /### automation:example/);
	assert.match(report, /example failure/);
});

async function importQualityGateModule() {
	const source = await readFile(scriptPath, "utf8");
	assert.match(source, /export function parseOnlyArgument/);
	assert.match(source, /export function createGatePlan/);
	assert.match(source, /export function renderMarkdownReport/);

	return import(pathToFileURL(scriptPath).href);
}
