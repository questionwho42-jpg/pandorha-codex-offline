import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const hooksDir = path.join(rootDir, ".git", "hooks");
const runnerPath = normalizeForShell(
	path.join(rootDir, "scripts", "process_hook_runner.mjs"),
);

const hookBodies = {
	"post-commit": renderHook("post-commit"),
	"post-merge": renderHook("post-merge"),
};

await mkdir(hooksDir, { recursive: true });
for (const [name, body] of Object.entries(hookBodies)) {
	await writeFile(path.join(hooksDir, name), body, {
		encoding: "utf8",
		mode: 0o755,
	});
}

console.log(`Installed ${Object.keys(hookBodies).length} process hooks.`);

function renderHook(hookName) {
	return `#!/bin/sh
node "${runnerPath}" ${hookName} >/dev/null 2>&1 || true
`;
}

function normalizeForShell(value) {
	return value.replaceAll("\\", "/").replaceAll('"', '\\"');
}
