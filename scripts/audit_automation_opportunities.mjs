import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const supportedFormats = new Set(["json", "markdown"]);

export async function auditAutomationOpportunities(rootDir) {
	const root = path.resolve(rootDir);
	const packageJson = await readJsonIfExists(path.join(root, "package.json"));
	const scriptFiles = await listFiles(path.join(root, "scripts"));
	const packageScripts = packageJson?.scripts ?? {};
	const qualityAutomation = packageScripts["quality:automation"] ?? "";
	const opportunities = [
		...(await findScriptOpportunities(root, scriptFiles, qualityAutomation)),
		...(await findMcpOpportunities(root)),
		...(await findSkillOpportunities(root)),
	];

	opportunities.sort((left, right) => left.id.localeCompare(right.id));

	return {
		generatedAt: "deterministic",
		root: toPosix(path.relative(process.cwd(), root)) || ".",
		summary: {
			opportunityCount: opportunities.length,
			scriptCount: opportunities.filter((entry) => entry.kind === "script")
				.length,
			mcpCount: opportunities.filter((entry) => entry.kind === "mcp").length,
			skillCount: opportunities.filter((entry) => entry.kind === "skill")
				.length,
			pluginCount: 0,
		},
		opportunities,
		recommendations: {
			plugin: {
				decision: "do-not-create-plugin",
				reason:
					"Current automation is repo-specific. Keep scripts, skills, and MCP tools local until repeated cross-workspace use is proven.",
			},
		},
	};
}

async function findScriptOpportunities(root, scriptFiles, qualityAutomation) {
	const scriptNames = new Set(scriptFiles.map((file) => path.basename(file)));
	const opportunities = [];

	for (const scriptFile of scriptFiles) {
		const name = path.basename(scriptFile);
		if (!name.endsWith(".mjs") || name.startsWith("test_")) continue;

		const stem = name.replace(/\.mjs$/, "");
		const pairedTest = `test_${stem}.mjs`;
		if (!scriptNames.has(pairedTest)) {
			opportunities.push({
				id: `script:missing-test:${stem}`,
				kind: "script",
				severity: "warning",
				target: toPosix(path.relative(root, scriptFile)),
				message: `Script ${name} has no paired ${pairedTest}.`,
				recommendation:
					"Add a deterministic node:test file before expanding it.",
			});
			continue;
		}

		if (!qualityAutomation.includes(pairedTest)) {
			opportunities.push({
				id: `script:not-in-quality-automation:${stem}`,
				kind: "script",
				severity: "info",
				target: toPosix(path.relative(root, scriptFile)),
				message: `Paired test ${pairedTest} is not referenced by quality:automation.`,
				recommendation:
					"Wire recurring automation tests into quality:automation.",
			});
		}
	}

	return opportunities;
}

async function findMcpOpportunities(root) {
	const mcpRoot = path.join(root, "mcp");
	const entries = await listDirectories(mcpRoot);
	const opportunities = [];

	for (const entry of entries) {
		const packageJson = await readJsonIfExists(
			path.join(entry, "package.json"),
		);
		const scripts = packageJson?.scripts ?? {};
		const name = path.basename(entry);

		for (const requiredScript of ["test", "validate:stdio"]) {
			if (!scripts[requiredScript]) {
				opportunities.push({
					id: `mcp:missing-script:${name}:${requiredScript}`,
					kind: "mcp",
					severity: "error",
					target: toPosix(path.relative(root, entry)),
					message: `MCP ${name} is missing package script ${requiredScript}.`,
					recommendation:
						"Add the script before including this MCP in quality:mcp.",
				});
			}
		}
	}

	return opportunities;
}

async function findSkillOpportunities(root) {
	const skillRoot = path.join(root, ".agents", "skills");
	const entries = await listDirectories(skillRoot);
	const opportunities = [];

	for (const entry of entries) {
		const skillFile = path.join(entry, "SKILL.md");
		const content = await readTextIfExists(skillFile);
		if (content === null) continue;

		const missing = getMissingSkillMetadata(content);
		if (missing.length > 0) {
			opportunities.push({
				id: `skill:missing-metadata:${path.basename(entry)}`,
				kind: "skill",
				severity: "error",
				target: toPosix(path.relative(root, skillFile)),
				message: `Skill metadata is incomplete: ${missing.join(", ")}.`,
				recommendation: "Add frontmatter with name and description.",
			});
		}
	}

	return opportunities;
}

function getMissingSkillMetadata(content) {
	const missing = [];
	if (!/^---\s*[\s\S]*?^---/m.test(content)) missing.push("frontmatter");
	if (!/^name:/m.test(content)) missing.push("name");
	if (!/^description:/m.test(content)) missing.push("description");
	return missing;
}

export function renderAutomationAuditMarkdown(report) {
	const lines = [
		"# Auditoria De Oportunidades De Automacao",
		"",
		`- Oportunidades: ${report.summary.opportunityCount}`,
		`- Scripts: ${report.summary.scriptCount}`,
		`- MCPs: ${report.summary.mcpCount}`,
		`- Skills: ${report.summary.skillCount}`,
		`- Decisao sobre plugin: ${report.recommendations.plugin.decision}`,
		"",
		"## Achados",
		"",
	];

	if (report.opportunities.length === 0) {
		lines.push("Nenhum achado.");
	} else {
		for (const entry of report.opportunities) {
			lines.push(
				`- ${entry.id}: ${entry.message} Recomendacao: ${entry.recommendation}`,
			);
		}
	}

	lines.push(
		"",
		"## Recomendacao Sobre Plugin",
		"",
		report.recommendations.plugin.reason,
		"",
	);

	return `${lines.join("\n")}`;
}

async function listFiles(dir) {
	try {
		const entries = await readdir(dir, { withFileTypes: true });
		return entries
			.filter((entry) => entry.isFile())
			.map((entry) => path.join(dir, entry.name))
			.sort();
	} catch (error) {
		if (error?.code === "ENOENT") return [];
		throw error;
	}
}

async function listDirectories(dir) {
	try {
		const entries = await readdir(dir, { withFileTypes: true });
		return entries
			.filter((entry) => entry.isDirectory())
			.map((entry) => path.join(dir, entry.name))
			.sort();
	} catch (error) {
		if (error?.code === "ENOENT") return [];
		throw error;
	}
}

async function readJsonIfExists(filePath) {
	const content = await readTextIfExists(filePath);
	return content === null ? null : JSON.parse(content);
}

async function readTextIfExists(filePath) {
	try {
		return await readFile(filePath, "utf8");
	} catch (error) {
		if (error?.code === "ENOENT") return null;
		throw error;
	}
}

function parseArgs(args) {
	const options = {
		format: "json",
		root: repoRoot,
		output: null,
	};

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		const value = args[index + 1];

		if (arg === "--root" || arg === "--format" || arg === "--output") {
			if (!value || value.startsWith("--")) {
				return { success: false, error: `Missing value for ${arg}` };
			}

			options[arg.slice(2)] = value;
			index += 1;
			continue;
		}

		return { success: false, error: `Unsupported option: ${arg}` };
	}

	if (!supportedFormats.has(options.format)) {
		return { success: false, error: `Unsupported format: ${options.format}` };
	}

	return { success: true, options };
}

async function main() {
	const parsed = parseArgs(process.argv.slice(2));
	if (!parsed.success) {
		console.error(parsed.error);
		process.exitCode = 1;
		return;
	}

	const report = await auditAutomationOpportunities(parsed.options.root);
	const rendered =
		parsed.options.format === "json"
			? `${JSON.stringify(report, null, 2)}\n`
			: renderAutomationAuditMarkdown(report);

	if (parsed.options.output) {
		const outputPath = path.resolve(parsed.options.output);
		await mkdir(path.dirname(outputPath), { recursive: true });
		await writeFile(outputPath, rendered, "utf8");
		console.log(`Wrote automation opportunity report to ${outputPath}`);
		return;
	}

	process.stdout.write(rendered);
}

function toPosix(value) {
	return value.split(path.sep).join("/");
}

if (
	process.argv[1] &&
	pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
	main().catch((error) => {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	});
}
