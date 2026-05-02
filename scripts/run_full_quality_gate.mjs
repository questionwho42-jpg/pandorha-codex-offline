import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const artifactDir = path.join(rootDir, "artifacts", "quality-gate");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const mcpPackages = [
	"mcp/pandorha-arch-guard",
	"mcp/pandorha-knowledge",
	"mcp/pandorha-memory-bridge",
	"mcp/pandorha-db-auditor",
];

const requiredSkillDirs = [
	".agents/skills/ai-docs-formatter",
	".agents/skills/api-contract-tester",
	".agents/skills/build-test-verify",
	".agents/skills/character-builder",
	".agents/skills/core-conventions",
	".agents/skills/crafting-engine",
	".agents/skills/create-pull-request",
	".agents/skills/dialogue-architect",
	".agents/skills/hexcrawl-generator",
	".agents/skills/magic-validator",
	".agents/skills/monster-factory",
	".agents/skills/pandorha-maintenance",
	".agents/skills/self-review-checklist",
	".agents/skills/skill-git-commit",
	".agents/skills/world-state-manager",
];

const startedAt = new Date().toISOString();
const results = [];
const argumentValidation = parseOnlyArgument(process.argv.slice(2));

if (argumentValidation.success) {
	await runSelectedGate(argumentValidation.value);
} else {
	results.push({
		label: "quality-gate:arguments",
		command: process.argv.slice(2).join(" "),
		status: "failed",
		exitCode: 1,
		startedAt,
		finishedAt: new Date().toISOString(),
		stdout: "",
		stderr: argumentValidation.error,
	});
}

await writeReports(
	argumentValidation.success ? argumentValidation.value : "invalid",
);
process.exitCode = results.some((result) => result.status === "failed") ? 1 : 0;

function parseOnlyArgument(args) {
	const onlyArg = args.find((arg) => arg.startsWith("--only="));
	if (!onlyArg) {
		return { success: true, value: "all" };
	}

	const value = onlyArg.slice("--only=".length);
	if (["all", "root", "mcp", "skills"].includes(value)) {
		return { success: true, value };
	}

	return { success: false, error: `Unsupported --only value: ${value}` };
}

async function runSelectedGate(selectedGate) {
	if (selectedGate === "all" || selectedGate === "root") {
		await runRootGate();
	}

	if (selectedGate === "all" || selectedGate === "mcp") {
		await runMcpGate();
	}

	if (selectedGate === "all" || selectedGate === "skills") {
		await runSkillGate();
	}
}

async function runRootGate() {
	await runStep("root:lint", npmCommand, ["run", "lint"]);
	await runStep("root:test", npmCommand, ["test"]);
	await runStep("root:coverage", npmCommand, ["run", "test:coverage"]);
	await runStep("root:audit", npmCommand, ["audit", "--audit-level=high"]);
}

async function runMcpGate() {
	for (const packagePath of mcpPackages) {
		await runStep(`${packagePath}:test`, npmCommand, [
			"test",
			"--prefix",
			packagePath,
		]);
		await runStep(`${packagePath}:validate:stdio`, npmCommand, [
			"run",
			"validate:stdio",
			"--prefix",
			packagePath,
		]);
	}
}

async function runSkillGate() {
	for (const skillPath of requiredSkillDirs) {
		await validateSkillMetadata(skillPath);
	}
}

async function validateSkillMetadata(skillPath) {
	const label = `${skillPath}:metadata`;
	const started = new Date().toISOString();
	const skillFile = path.join(rootDir, skillPath, "SKILL.md");
	const lowerSkillFile = path.join(rootDir, skillPath, "skill.md");
	const skillContent = await readFirstExistingFile([skillFile, lowerSkillFile]);

	if (!skillContent.success) {
		results.push({
			label,
			command: "metadata smoke",
			status: "failed",
			exitCode: 1,
			startedAt: started,
			finishedAt: new Date().toISOString(),
			stdout: "",
			stderr: skillContent.error,
		});
		return;
	}

	const missingFields = getMissingSkillMetadataFields(skillContent.content);
	if (missingFields.length > 0) {
		results.push({
			label,
			command: "metadata smoke",
			status: "failed",
			exitCode: 1,
			startedAt: started,
			finishedAt: new Date().toISOString(),
			stdout: "",
			stderr: `Missing required skill metadata: ${missingFields.join(", ")}`,
		});
		return;
	}

	results.push({
		label,
		command: "metadata smoke",
		status: "passed",
		exitCode: 0,
		startedAt: started,
		finishedAt: new Date().toISOString(),
		stdout: "Required metadata present.",
		stderr: "",
	});
}

function getMissingSkillMetadataFields(content) {
	const missingFields = [];

	if (!/^---\s*[\s\S]*?^---/m.test(content)) {
		missingFields.push("frontmatter");
	}

	if (!/^name:/m.test(content)) {
		missingFields.push("name");
	}

	if (!/^description:/m.test(content)) {
		missingFields.push("description");
	}

	return missingFields;
}

async function readFirstExistingFile(files) {
	for (const file of files) {
		try {
			return { success: true, content: await readFile(file, "utf8") };
		} catch (error) {
			if (getErrorCode(error) !== "ENOENT") {
				return {
					success: false,
					error: error instanceof Error ? error.message : String(error),
				};
			}
		}
	}

	return {
		success: false,
		error: `No skill file found in ${files.map((file) => path.dirname(file))[0]}`,
	};
}

function getErrorCode(error) {
	if (typeof error === "object" && error !== null && "code" in error) {
		return error.code;
	}

	return null;
}

async function runStep(label, command, args) {
	const started = new Date().toISOString();
	const output = await spawnCommand(command, args);

	results.push({
		label,
		command: [command, ...args].join(" "),
		status: output.exitCode === 0 ? "passed" : "failed",
		exitCode: output.exitCode,
		startedAt: started,
		finishedAt: new Date().toISOString(),
		stdout: output.stdout,
		stderr: output.stderr,
	});
}

function spawnCommand(command, args) {
	return new Promise((resolve) => {
		let stdout = "";
		let stderr = "";
		let child = null;

		try {
			child = spawn(command, args, {
				cwd: rootDir,
				env: process.env,
				shell: process.platform === "win32",
				windowsHide: true,
			});
		} catch (error) {
			resolve({
				exitCode: 1,
				stdout,
				stderr: error instanceof Error ? error.message : String(error),
			});
			return;
		}

		child.stdout.on("data", (chunk) => {
			stdout += chunk.toString();
		});

		child.stderr.on("data", (chunk) => {
			stderr += chunk.toString();
		});

		child.on("error", (error) => {
			resolve({
				exitCode: 1,
				stdout,
				stderr: `${stderr}${error.message}`,
			});
		});

		child.on("close", (code) => {
			resolve({
				exitCode: code ?? 1,
				stdout,
				stderr,
			});
		});
	});
}

async function writeReports(selectedGate) {
	await mkdir(artifactDir, { recursive: true });

	const finishedAt = new Date().toISOString();
	const summary = {
		startedAt,
		finishedAt,
		selectedGate,
		status: results.every((result) => result.status === "passed")
			? "passed"
			: "failed",
		results,
	};

	await writeFile(
		path.join(artifactDir, "summary.json"),
		`${JSON.stringify(summary, null, 2)}\n`,
		"utf8",
	);

	await writeFile(
		path.join(artifactDir, "report.md"),
		renderMarkdownReport(summary),
		"utf8",
	);
}

function renderMarkdownReport(summary) {
	const lines = [
		"# Pandorha Quality Gate Report",
		"",
		`- Started: ${summary.startedAt}`,
		`- Finished: ${summary.finishedAt}`,
		`- Gate: ${summary.selectedGate}`,
		`- Status: ${summary.status}`,
		"",
		"## Results",
		"",
		"| Step | Status | Exit Code |",
		"| --- | --- | --- |",
	];

	for (const result of summary.results) {
		lines.push(`| ${result.label} | ${result.status} | ${result.exitCode} |`);
	}

	lines.push("", "## Failed Output", "");

	const failures = summary.results.filter(
		(result) => result.status === "failed",
	);
	if (failures.length === 0) {
		lines.push("No failures.");
	} else {
		for (const failure of failures) {
			lines.push(
				`### ${failure.label}`,
				"",
				"```text",
				failure.stderr || failure.stdout,
				"```",
				"",
			);
		}
	}

	return `${lines.join("\n")}\n`;
}
