import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const artifactDir = path.join(rootDir, "artifacts", "quality-gate");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const pythonCommand = process.platform === "win32" ? "python" : "python3";

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
	if (
		["all", "root", "mcp", "skills", "automation", "release"].includes(value)
	) {
		return { success: true, value };
	}

	return { success: false, error: `Unsupported --only value: ${value}` };
}

async function runSelectedGate(selectedGate) {
	if (selectedGate === "release") {
		await runRootGate();
		await runStep("root:build", npmCommand, ["run", "build"]);
		await runAutomationGate();
		await runMcpGate();
		await runSkillGate();
		return;
	}

	if (selectedGate === "all" || selectedGate === "root") {
		await runRootGate();
	}

	if (selectedGate === "all" || selectedGate === "automation") {
		await runAutomationGate();
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

async function runAutomationGate() {
	await runStep("automation:coverage-registration", "node", [
		"scripts/validate_coverage_registration.mjs",
	]);
	await runStep("automation:process-doctor", pythonCommand, [
		"scripts/pandorha_process_automation.py",
		"validate",
	]);
	await runStep("automation:mechanics-balance", pythonCommand, [
		".agents/skills/rpg-mechanics-validator/scripts/simulate_mechanics.py",
	]);
	await runBenchmarksStep();
	await runCombatSimulationAuditStep();
	await runSqliteStressAuditStep();
}

async function runBenchmarksStep() {
	const label = "automation:rpc-benchmarks";
	const started = new Date().toISOString();
	const benchmarkFile = path.join(rootDir, "artifacts", "benchmarks.json");

	try {
		const content = await readFile(benchmarkFile, "utf8");
		const data = JSON.parse(content);
		const stdout = [
			"SQLite & RPC Benchmark Summary:",
			`- Timestamp: ${data.timestamp}`,
			`- Database Init (Migrations): ${data.database_init_ms} ms`,
			`- Game Snapshot Save: ${data.snapshot_save_ms} ms`,
			`- Game Snapshot Load: ${data.snapshot_load_ms} ms`,
		].join("\n");

		results.push({
			label,
			command: "read benchmarks.json",
			status: "passed",
			exitCode: 0,
			startedAt: started,
			finishedAt: new Date().toISOString(),
			stdout,
			stderr: "",
		});
	} catch (error) {
		results.push({
			label,
			command: "read benchmarks.json",
			status: "failed",
			exitCode: 1,
			startedAt: started,
			finishedAt: new Date().toISOString(),
			stdout: "",
			stderr: `Failed to read or parse benchmarks.json: ${error instanceof Error ? error.message : String(error)}`,
		});
	}
}

async function runCombatSimulationAuditStep() {
	const label = "automation:combat-montecarlo-audit";
	const started = new Date().toISOString();
	const reportFile = path.join(
		rootDir,
		"artifacts",
		"combat_simulation_report.json",
	);

	try {
		const content = await readFile(reportFile, "utf8");
		const data = JSON.parse(content);

		const stdout = [
			"Combat Simulation Monte Carlo Audit Summary:",
			`- Mode: ${data.mode}`,
			`- Iterations: ${data.iterations}`,
			`- Win Rate: ${data.win_rate.toFixed(2)}% (Min: 70%)`,
			`- Average Turns: ${data.avg_turns_per_combat.toFixed(2)} turns (Max: 15)`,
			`- Stalemates/Infinite Loops: ${data.stalemates}`,
		].join("\n");

		if (data.win_rate < 70) {
			throw new Error(
				`Andarilhos win rate is too low: ${data.win_rate.toFixed(2)}% (requires >= 70%)`,
			);
		}
		if (data.avg_turns_per_combat > 15) {
			throw new Error(
				`Average combat duration is too long: ${data.avg_turns_per_combat.toFixed(2)} turns (requires <= 15)`,
			);
		}
		if (data.stalemates > 0) {
			throw new Error(
				`Combat got stuck in infinite loops: ${data.stalemates} stalemate(s) detected.`,
			);
		}

		results.push({
			label,
			command: "read combat_simulation_report.json",
			status: "passed",
			exitCode: 0,
			startedAt: started,
			finishedAt: new Date().toISOString(),
			stdout,
			stderr: "",
		});
	} catch (error) {
		results.push({
			label,
			command: "read combat_simulation_report.json",
			status: "failed",
			exitCode: 1,
			startedAt: started,
			finishedAt: new Date().toISOString(),
			stdout: "",
			stderr: `Combat simulation audit failed: ${error instanceof Error ? error.message : String(error)}`,
		});
	}
}

async function runSqliteStressAuditStep() {
	const label = "automation:sqlite-stress-audit";
	const started = new Date().toISOString();
	const reportFile = path.join(
		rootDir,
		"artifacts",
		"sqlite_stress_report.json",
	);

	try {
		const content = await readFile(reportFile, "utf8");
		const data = JSON.parse(content);

		const stdout = [
			"SQLite Persistence & Stress Audit Summary:",
			`- Concurrency Writes tested: ${data.concurrency_writes_tested}`,
			`- Writes status: ${data.writes_status}`,
			`- Cascade deletion integrity: ${data.cascade_delete_integrity}`,
			`- Rollback RPC transationality: ${data.rollback_transationality}`,
			`- Table scans detected: ${data.table_scans_detected} (Max: 0)`,
			`- Missing foreign key indices: ${data.missing_indices_detected} (Max: 0)`,
		].join("\n");

		if (
			data.writes_status !== "passed" ||
			data.cascade_delete_integrity !== "passed" ||
			data.rollback_transationality !== "passed"
		) {
			throw new Error("One or more sqlite integrity validations failed.");
		}
		if (data.table_scans_detected > 0) {
			throw new Error(
				`SQLite Table Scans (SCAN TABLE) detected: ${data.table_scans_detected} queries lack index optimization.`,
			);
		}
		if (data.missing_indices_detected > 0) {
			throw new Error(
				`Migration foreign keys lack indices: ${data.missing_indices_detected} missing indices.`,
			);
		}

		results.push({
			label,
			command: "read sqlite_stress_report.json",
			status: "passed",
			exitCode: 0,
			startedAt: started,
			finishedAt: new Date().toISOString(),
			stdout,
			stderr: "",
		});
	} catch (error) {
		results.push({
			label,
			command: "read sqlite_stress_report.json",
			status: "failed",
			exitCode: 1,
			startedAt: started,
			finishedAt: new Date().toISOString(),
			stdout: "",
			stderr: `SQLite stress audit failed: ${error instanceof Error ? error.message : String(error)}`,
		});
	}
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
	await runStep("skills:validator-fixtures", "node", [
		"scripts/test_skill_validators.mjs",
	]);
	await runStep("skills:core-conventions", "node", [
		".agents/skills/core-conventions/scripts/validate.mjs",
		"src",
	]);
	await runStep("skills:self-review-hard-stop", "node", [
		".agents/skills/self-review-checklist/scripts/hard_stop.mjs",
		"src",
	]);
	await runStep("skills:json-validator", "node", [
		".agents/skills/self-review-checklist/scripts/run_json_tests.mjs",
		".agents/skills",
	]);

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
