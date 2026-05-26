import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const requiredPackageScripts = [
	"lint",
	"test",
	"test:coverage",
	"build",
	"quality:gate",
	"qa:vertical-slice",
	"qa:social-browser-smoke",
	"qa:dialogue-seeds",
	"qa:next-phase-readiness",
	"automation:doctor",
];
const requiredFiles = ["scripts/dialogue_seed_smoke.mjs"];

const parsedArgs = parseArgs(process.argv.slice(2));

if (!parsedArgs.success) {
	exitWithError(parsedArgs.error);
} else {
	const result = await runNextPhaseReadiness(parsedArgs.value);
	if (!result.success) {
		exitWithError(result.errors.join("\n"));
	} else {
		console.log("next phase readiness is valid");
	}
}

async function runNextPhaseReadiness(input) {
	const errors = [];
	const statusResult = await readGitStatus(input);
	if (!statusResult.success) {
		errors.push(statusResult.error);
	} else {
		validateGitStatus(statusResult.status, errors);
	}

	const packageResult = await readJson(path.join(input.root, "package.json"));
	if (!packageResult.success) {
		errors.push(packageResult.error);
	} else {
		validatePackageScripts(packageResult.data, errors);
	}

	const ledgerResult = await readText(
		path.join(input.root, "docs", "process", "task-ledger.md"),
	);
	if (!ledgerResult.success) {
		errors.push(ledgerResult.error);
	} else {
		validateTaskLedger(ledgerResult.content, errors);
	}

	for (const relativePath of requiredFiles) {
		const fileResult = await readText(path.join(input.root, relativePath));
		if (!fileResult.success) {
			errors.push(`${relativePath} is required for next phase readiness.`);
		}
	}

	return errors.length === 0 ? { success: true } : { success: false, errors };
}

async function readGitStatus(input) {
	if (input.gitStatusFixture) {
		const fixture = await readText(input.gitStatusFixture);
		return fixture.success
			? { success: true, status: fixture.content }
			: { success: false, error: fixture.error };
	}

	const result = spawnSync("git", ["status", "--porcelain=v1"], {
		cwd: input.root,
		encoding: "utf8",
		shell: process.platform === "win32",
		windowsHide: true,
	});

	if (result.status !== 0) {
		return {
			success: false,
			error:
				result.stderr.trim() ||
				result.stdout.trim() ||
				"git status failed for next phase readiness.",
		};
	}

	return { success: true, status: result.stdout };
}

function validateGitStatus(status, errors) {
	const lines = status
		.split(/\r?\n/)
		.map((line) => line.trimEnd())
		.filter((line) => line.length > 0);

	for (const line of lines) {
		if (line.startsWith("?? output/")) {
			continue;
		}

		errors.push(
			`Git status must be clean except untracked output/. Found: ${line}`,
		);
	}
}

function validatePackageScripts(packageJson, errors) {
	const scripts = isRecord(packageJson.scripts) ? packageJson.scripts : {};
	for (const scriptName of requiredPackageScripts) {
		if (typeof scripts[scriptName] !== "string" || !scripts[scriptName]) {
			errors.push(`package.json is missing required script ${scriptName}.`);
		}
	}
}

function validateTaskLedger(content, errors) {
	const inProgressSection = extractSection(
		content,
		"<!-- pandorha-ledger:in-progress -->",
		"<!-- /pandorha-ledger:in-progress -->",
	);
	if (!inProgressSection.success) {
		errors.push(inProgressSection.error);
		return;
	}

	if (/- status: in-progress\b/.test(inProgressSection.content)) {
		errors.push("task-ledger.md still has an in-progress task.");
	}
}

function extractSection(content, startMarker, endMarker) {
	const start = content.indexOf(startMarker);
	const end = content.indexOf(endMarker);
	if (start === -1 || end === -1 || end < start) {
		return {
			success: false,
			error: `Could not find ledger section ${startMarker}.`,
		};
	}

	return {
		success: true,
		content: content.slice(start + startMarker.length, end),
	};
}

async function readJson(filePath) {
	const text = await readText(filePath);
	if (!text.success) {
		return text;
	}

	try {
		return { success: true, data: JSON.parse(text.content) };
	} catch (error) {
		return {
			success: false,
			error: `Could not parse ${filePath}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		};
	}
}

async function readText(filePath) {
	try {
		return { success: true, content: await readFile(filePath, "utf8") };
	} catch (error) {
		return {
			success: false,
			error: `Could not read ${filePath}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		};
	}
}

function parseArgs(args) {
	const value = { root: repoRoot, gitStatusFixture: null };

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg !== "--root" && arg !== "--git-status-fixture") {
			return { success: false, error: `Unsupported option: ${arg}` };
		}

		const next = args[index + 1];
		if (!next) {
			return { success: false, error: `${arg} requires a path.` };
		}

		if (arg === "--root") {
			value.root = path.resolve(next);
		} else {
			value.gitStatusFixture = path.resolve(next);
		}
		index += 1;
	}

	return { success: true, value };
}

function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exitWithError(message) {
	console.error(message);
	process.exitCode = 1;
}
