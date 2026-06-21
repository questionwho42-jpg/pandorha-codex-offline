import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(repoRoot, "scripts", "install_process_hooks.mjs");

test("install process hooks writes deterministic post-commit and post-merge hooks", async () => {
	const source = await readFile(scriptPath, "utf8");
	assert.match(source, /export async function installProcessHooks/);
	assert.match(source, /export function renderHook/);
	assert.match(source, /export function normalizeForShell/);

	const module = await import(pathToFileURL(scriptPath).href);
	const root = await mkdtemp(path.join(os.tmpdir(), "pandorha-hooks-"));
	const runnerPath = path.join(root, "scripts", "process_hook_runner.mjs");

	try {
		await module.installProcessHooks({ rootDir: root, runnerPath });

		const postCommit = await readFile(
			path.join(root, ".git", "hooks", "post-commit"),
			"utf8",
		);
		const postMerge = await readFile(
			path.join(root, ".git", "hooks", "post-merge"),
			"utf8",
		);

		assert.equal(postCommit, module.renderHook("post-commit", runnerPath));
		assert.equal(postMerge, module.renderHook("post-merge", runnerPath));
		assert.match(postCommit, /^#!\/bin\/sh\n/);
		assert.match(postCommit, /process_hook_runner\.mjs" post-commit/);
		assert.match(postMerge, /process_hook_runner\.mjs" post-merge/);
		assert.doesNotMatch(postCommit, /\\/);

		if (process.platform !== "win32") {
			const hookStats = await stat(
				path.join(root, ".git", "hooks", "post-commit"),
			);
			assert.ok((hookStats.mode & 0o111) !== 0);
		}
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("normalizeForShell escapes double quotes and normalizes separators", async () => {
	const source = await readFile(scriptPath, "utf8");
	assert.match(source, /export function normalizeForShell/);

	const module = await import(pathToFileURL(scriptPath).href);

	assert.equal(
		module.normalizeForShell('C:\\Pandorha\\quoted "runner".mjs'),
		'C:/Pandorha/quoted \\"runner\\".mjs',
	);
});
