import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(repoRoot, "scripts", "process_hook_runner.mjs");

test("process hook runner resolves supported hook commands", async () => {
	const source = await readFile(scriptPath, "utf8");
	assert.match(source, /export function getHookCommand/);

	const module = await import(pathToFileURL(scriptPath).href);

	assert.deepEqual(module.getHookCommand("post-commit"), [
		"scripts/pandorha_process_automation.py",
		"snapshot",
		"--reason",
		"post-commit",
		"--skip-clean",
	]);
	assert.deepEqual(module.getHookCommand("post-merge"), [
		"scripts/pandorha_process_automation.py",
		"post-merge",
	]);
	assert.equal(module.getHookCommand("pre-push"), null);
	assert.equal(module.getHookCommand(undefined), null);
});

test("process hook runner delegates to an injected command runner", async () => {
	const source = await readFile(scriptPath, "utf8");
	assert.match(source, /export async function runHook/);

	const module = await import(pathToFileURL(scriptPath).href);
	const calls = [];

	const exitCode = await module.runHook({
		hookName: "post-merge",
		pythonCommand: "python-test",
		runCommand: async (command, args) => {
			calls.push({ command, args });
			return 0;
		},
		writeError: () => assert.fail("supported hooks must not write errors"),
	});

	assert.equal(exitCode, 0);
	assert.deepEqual(calls, [
		{
			command: "python-test",
			args: ["scripts/pandorha_process_automation.py", "post-merge"],
		},
	]);
});

test("process hook runner rejects missing and unsupported hooks without spawning", async () => {
	const source = await readFile(scriptPath, "utf8");
	assert.match(source, /export async function runHook/);

	const module = await import(pathToFileURL(scriptPath).href);
	const errors = [];

	const missingExitCode = await module.runHook({
		hookName: undefined,
		runCommand: () => assert.fail("missing hook must not spawn"),
		writeError: (message) => errors.push(message),
	});
	const unsupportedExitCode = await module.runHook({
		hookName: "pre-push",
		runCommand: () => assert.fail("unsupported hook must not spawn"),
		writeError: (message) => errors.push(message),
	});

	assert.equal(missingExitCode, 1);
	assert.equal(unsupportedExitCode, 1);
	assert.deepEqual(errors, [
		"Unsupported hook: missing",
		"Unsupported hook: pre-push",
	]);
});
