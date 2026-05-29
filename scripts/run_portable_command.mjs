import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
if (args.length === 0) {
	console.log("Usage: node run_portable_command.mjs <command_string>");
	process.exit(0);
}

const fullCommand = args.join(" ").trim();

function runCommand(cmd) {
	// Tradução de "rm -rf <dir>"
	if (cmd.startsWith("rm -rf ")) {
		const target = cmd.substring(7).trim();
		if (!target) {
			console.error("Error: No target specified for rm -rf");
			process.exit(1);
		}
		const absoluteTarget = path.resolve(target);
		// Garantir que não estamos apagando nada fora do workspace por segurança
		if (!absoluteTarget.startsWith(path.resolve("."))) {
			console.error(
				`Security Error: Cannot delete outside workspace: ${absoluteTarget}`,
			);
			process.exit(1);
		}
		try {
			if (fs.existsSync(absoluteTarget)) {
				fs.rmSync(absoluteTarget, { recursive: true, force: true });
				console.log(`Successfully removed: ${target}`);
			} else {
				console.log(`Target does not exist (skipped): ${target}`);
			}
			process.exit(0);
		} catch (err) {
			console.error(`Error removing ${target}:`, err.message);
			process.exit(1);
		}
	}

	// Tradução de "cat <file>"
	if (cmd.startsWith("cat ")) {
		const target = cmd.substring(4).trim();
		if (!target) {
			console.error("Error: No target specified for cat");
			process.exit(1);
		}
		try {
			const content = fs.readFileSync(target, "utf-8");
			process.stdout.write(content);
			process.exit(0);
		} catch (err) {
			console.error(`Error reading ${target}:`, err.message);
			process.exit(1);
		}
	}

	// Fallback: Executar o comando original usando o shell padrão (PowerShell no Windows)
	try {
		execSync(cmd, { stdio: "inherit" });
	} catch (err) {
		console.error(`Command failed: ${cmd}`);
		process.exit(err.status || 1);
	}
}

runCommand(fullCommand);
