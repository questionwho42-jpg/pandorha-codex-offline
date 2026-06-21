import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

if (isMainModule()) {
	const installed = await installProcessHooks({
		rootDir,
		runnerPath: path.join(rootDir, "scripts", "process_hook_runner.mjs"),
	});
	console.log(`Installed ${installed.length} process hooks.`);
}

export async function installProcessHooks({ rootDir: targetRoot, runnerPath }) {
	const hooksDir = path.join(targetRoot, ".git", "hooks");
	const hookBodies = {
		"post-commit": renderHook("post-commit", runnerPath),
		"post-merge": renderHook("post-merge", runnerPath),
	};

	await mkdir(hooksDir, { recursive: true });
	for (const [name, body] of Object.entries(hookBodies)) {
		await writeFile(path.join(hooksDir, name), body, {
			encoding: "utf8",
			mode: 0o755,
		});
	}

	return Object.keys(hookBodies);
}

export function renderHook(hookName, runnerPath) {
	return `#!/bin/sh
node "${normalizeForShell(runnerPath)}" ${hookName} >/dev/null 2>&1 || true
`;
}

export function normalizeForShell(value) {
	return value.replaceAll("\\", "/").replaceAll('"', '\\"');
}

function isMainModule() {
	return process.argv[1]
		? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
		: false;
}
