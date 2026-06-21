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

if (isMainModule()) {
	process.exitCode = await runQualityGate(process.argv.slice(2));
}

export async function runQualityGate(args) {
	const startedAt = new Date().toISOString();
	const results = [];
	const argumentValidation = parseOnlyArgument(args);

	if (argumentValidation.success) {
		await runSelectedGate(argumentValidation.value, results);
	} else {
		results.push({
			label: "quality-gate:arguments",
			command: args.join(" "),
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
		startedAt,
		results,
	);

	return results.some((result) => result.status === "failed") ? 1 : 0;
}

export function parseOnlyArgument(args) {
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

export function createGatePlan(selectedGate) {
	if (selectedGate === "root") {
		return createRootGatePlan();
	}
	if (selectedGate === "automation") {
		return createAutomationGatePlan();
	}
	if (selectedGate === "mcp") {
		return createMcpGatePlan();
	}
	if (selectedGate === "skills") {
		return createSkillGatePlan();
	}
	if (selectedGate === "release") {
		return [
			...createRootGatePlan(),
			{ label: "root:build", command: npmCommand, args: ["run", "build"] },
			...createAutomationGatePlan(),
			...createMcpGatePlan(),
			...createSkillGatePlan(),
		];
	}
	if (selectedGate === "all") {
		return [
			...createRootGatePlan(),
			...createAutomationGatePlan(),
			...createMcpGatePlan(),
			...createSkillGatePlan(),
		];
	}

	return [];
}

async function runSelectedGate(selectedGate, results) {
	if (selectedGate === "release") {
		await runStepPlan(createGatePlan("root"), results);
		await runStep("root:build", npmCommand, ["run", "build"], results);
		await runAutomationGate(results);
		await runMcpGate(results);
		await runSkillGate(results);
		return;
	}

	if (selectedGate === "all" || selectedGate === "root") {
		await runStepPlan(createGatePlan("root"), results);
	}

	if (selectedGate === "all" || selectedGate === "automation") {
		await runAutomationGate(results);
	}

	if (selectedGate === "all" || selectedGate === "mcp") {
		await runMcpGate(results);
	}

	if (selectedGate === "all" || selectedGate === "skills") {
		await runSkillGate(results);
	}
}

async function runAutomationGate(results) {
	await runStepPlan(createGatePlan("automation"), results);
}

async function runMcpGate(results) {
	await runStepPlan(createGatePlan("mcp"), results);
}

async function runSkillGate(results) {
	await runStepPlan(createGatePlan("skills"), results);

	for (const skillPath of requiredSkillDirs) {
		await validateSkillMetadata(skillPath, results);
	}
}

function createRootGatePlan() {
	return [
		{ label: "root:lint", command: npmCommand, args: ["run", "lint"] },
		{ label: "root:test", command: npmCommand, args: ["test"] },
		{
			label: "root:coverage",
			command: npmCommand,
			args: ["run", "test:coverage"],
		},
		{
			label: "root:dependency-security",
			command: "node",
			args: ["scripts/dependency_security_gate.mjs", "--audit-level=high"],
		},
	];
}

function createAutomationGatePlan() {
	return [
		{
			label: "automation:dependency-security-tests",
			command: "node",
			args: ["scripts/test_dependency_security_gate.mjs"],
		},
		{
			label: "automation:dependency-advisory-refresh-tests",
			command: "node",
			args: ["scripts/test_refresh_dependency_advisories.mjs"],
		},
		{
			label: "automation:dependency-security",
			command: "node",
			args: ["scripts/dependency_security_gate.mjs", "--audit-level=high"],
		},
		{
			label: "automation:install-process-hooks-tests",
			command: "node",
			args: ["scripts/test_install_process_hooks.mjs"],
		},
		{
			label: "automation:process-hook-runner-tests",
			command: "node",
			args: ["scripts/test_process_hook_runner.mjs"],
		},
		{
			label: "automation:quality-gate-tests",
			command: "node",
			args: ["scripts/test_run_full_quality_gate.mjs"],
		},
		{
			label: "automation:documentation-audit-tests",
			command: "node",
			args: ["scripts/test_audit_docs.mjs"],
		},
		{
			label: "automation:documentation-audit",
			command: "node",
			args: ["scripts/audit_docs.mjs", "--format", "json", "--scope", "all"],
		},
		{
			label: "automation:opportunity-audit-tests",
			command: "node",
			args: ["scripts/test_audit_automation_opportunities.mjs"],
		},
		{
			label: "automation:opportunity-audit",
			command: "node",
			args: ["scripts/audit_automation_opportunities.mjs", "--format", "json"],
		},
		{
			label: "automation:context-triplet-tests",
			command: "node",
			args: ["scripts/test_validate_context_triplets.mjs"],
		},
		{
			label: "automation:context-triplets",
			command: "node",
			args: ["scripts/validate_context_triplets.mjs", "--format", "json"],
		},
		{
			label: "automation:browser-runbook-tests",
			command: "node",
			args: ["scripts/test_generate_browser_qa_runbook.mjs"],
		},
		{
			label: "automation:browser-runbook-check",
			command: "node",
			args: ["scripts/generate_browser_qa_runbook.mjs", "--check"],
		},
		{
			label: "automation:save-migration-matrix-tests",
			command: "node",
			args: ["scripts/test_validate_save_migration_matrix.mjs"],
		},
		{
			label: "automation:save-migration-matrix",
			command: "node",
			args: ["scripts/validate_save_migration_matrix.mjs", "--format", "json"],
		},
		{
			label: "automation:compendium-generation-tests",
			command: "node",
			args: ["scripts/test_generate_compendium_catalog.mjs"],
		},
		{
			label: "automation:compendium-generation-check",
			command: "node",
			args: ["scripts/generate_compendium_catalog.mjs", "--check"],
		},
		{
			label: "automation:vertical-slice-smoke-tests",
			command: "node",
			args: ["scripts/test_vertical_slice_smoke.mjs"],
		},
		{
			label: "automation:vertical-slice-smoke",
			command: "node",
			args: ["scripts/vertical_slice_smoke.mjs"],
		},
		{
			label: "automation:ui-reachability-smoke-tests",
			command: "node",
			args: ["scripts/test_ui_reachability_smoke.mjs"],
		},
		{
			label: "automation:ui-reachability-smoke",
			command: "node",
			args: ["scripts/ui_reachability_smoke.mjs"],
		},
		{
			label: "automation:social-browser-smoke-tests",
			command: "node",
			args: ["scripts/test_social_browser_smoke.mjs"],
		},
		{
			label: "automation:social-browser-smoke",
			command: "node",
			args: ["scripts/social_browser_smoke.mjs"],
		},
		{
			label: "automation:dialogue-seed-smoke-tests",
			command: "node",
			args: ["scripts/test_dialogue_seed_smoke.mjs"],
		},
		{
			label: "automation:dialogue-seed-smoke",
			command: "node",
			args: ["scripts/dialogue_seed_smoke.mjs"],
		},
		{
			label: "automation:next-phase-readiness-tests",
			command: "node",
			args: ["scripts/test_next_phase_readiness.mjs"],
		},
		{
			label: "automation:coverage-registration-tests",
			command: "node",
			args: ["scripts/test_validate_coverage_registration.mjs"],
		},
		{
			label: "automation:coverage-registration",
			command: "node",
			args: ["scripts/validate_coverage_registration.mjs"],
		},
		{
			label: "automation:catalog-entity-scaffold-tests",
			command: "node",
			args: ["scripts/test_scaffold_catalog_entity.mjs"],
		},
		{
			label: "automation:domain-service-scaffold-tests",
			command: "node",
			args: ["scripts/test_scaffold_domain_service.mjs"],
		},
		{
			label: "automation:event-ledger-scaffold-tests",
			command: "node",
			args: ["scripts/test_scaffold_event_ledger.mjs"],
		},
		{
			label: "automation:process-doctor",
			command: pythonCommand,
			args: ["scripts/pandorha_process_automation.py", "validate"],
		},
	];
}

function createMcpGatePlan() {
	return mcpPackages.flatMap((packagePath) => [
		{
			label: `${packagePath}:test`,
			command: npmCommand,
			args: ["test", "--prefix", packagePath],
		},
		{
			label: `${packagePath}:validate:stdio`,
			command: npmCommand,
			args: ["run", "validate:stdio", "--prefix", packagePath],
		},
	]);
}

function createSkillGatePlan() {
	return [
		{
			label: "skills:validator-fixtures",
			command: "node",
			args: ["scripts/test_skill_validators.mjs"],
		},
		{
			label: "skills:core-conventions",
			command: "node",
			args: [".agents/skills/core-conventions/scripts/validate.mjs", "src"],
		},
		{
			label: "skills:self-review-hard-stop",
			command: "node",
			args: [
				".agents/skills/self-review-checklist/scripts/hard_stop.mjs",
				"src",
			],
		},
		{
			label: "skills:json-validator",
			command: "node",
			args: [
				".agents/skills/self-review-checklist/scripts/run_json_tests.mjs",
				".agents/skills",
			],
		},
	];
}

async function validateSkillMetadata(skillPath, results) {
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

async function runStepPlan(steps, results) {
	for (const step of steps) {
		await runStep(step.label, step.command, step.args, results);
	}
}

async function runStep(label, command, args, results) {
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

async function writeReports(selectedGate, startedAt, results) {
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

export function renderMarkdownReport(summary) {
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

function isMainModule() {
	return process.argv[1]
		? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
		: false;
}
