import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const hookName = process.argv[2];
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

if (!hookName || !(hookName in hookCommands)) {
	console.error(`Unsupported hook: ${hookName ?? "missing"}`);
	process.exitCode = 1;
} else {
	const exitCode = await run(pythonCommand, hookCommands[hookName]);
	process.exitCode = exitCode;
}

function run(command, args) {
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
