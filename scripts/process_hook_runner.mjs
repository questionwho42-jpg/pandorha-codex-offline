import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const pythonCommand = process.platform === "win32" ? "python" : "python3";

const hookCommands = {
	"post-commit": [
		"scripts/pandorha_process_automation.py",
		"snapshot",
		"--reason",
		"post-commit",
		"--skip-clean",
	],
	"post-merge": ["scripts/pandorha_process_automation.py", "post-merge"],
};

if (isMainModule()) {
	process.exitCode = await runHook({
		hookName: process.argv[2],
		pythonCommand,
		runCommand,
		writeError: (message) => console.error(message),
	});
}

export function getHookCommand(hookName) {
	if (!hookName || !(hookName in hookCommands)) {
		return null;
	}

	return [...hookCommands[hookName]];
}

export async function runHook({
	hookName,
	pythonCommand: command = pythonCommand,
	runCommand: runner = runCommand,
	writeError = console.error,
}) {
	const hookCommand = getHookCommand(hookName);
	if (!hookCommand) {
		writeError(`Unsupported hook: ${hookName ?? "missing"}`);
		return 1;
	}

	return runner(command, hookCommand);
}

function runCommand(command, args) {
	return new Promise((resolve) => {
		const child = spawn(command, args, {
			cwd: rootDir,
			env: process.env,
			shell: process.platform === "win32",
			windowsHide: true,
			stdio: "ignore",
		});

		child.on("error", () => resolve(1));
		child.on("close", (code) => resolve(code ?? 1));
	});
}

function isMainModule() {
	return process.argv[1]
		? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
		: false;
}
