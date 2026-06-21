import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const requiredContextFiles = [
	"tech-memory.md",
	"scaling-roadmap.md",
	"plain-english.md",
];

export async function validateContextTriplets(rootDir = repoRoot) {
	const root = path.resolve(rootDir);
	const contextDirs = await findContextDirs(path.join(root, "src"));
	const modules = [];

	for (const contextDir of contextDirs) {
		const issues = [];
		for (const fileName of requiredContextFiles) {
			const filePath = path.join(contextDir, fileName);
			const content = await readOptionalText(filePath);

			if (content === null) {
				issues.push({
					type: "missing-file",
					file: toPosix(path.relative(root, filePath)),
					message: `${fileName} is required in every .context directory.`,
				});
				continue;
			}

			if (!hasH1(content)) {
				issues.push({
					type: "missing-h1",
					file: toPosix(path.relative(root, filePath)),
					message: `${fileName} must start with a Markdown H1 heading.`,
				});
			}
		}

		modules.push({
			module: toPosix(path.relative(root, path.dirname(contextDir))),
			contextDir: toPosix(path.relative(root, contextDir)),
			status: issues.length === 0 ? "passed" : "failed",
			issues,
		});
	}

	const issueCount = modules.reduce(
		(total, moduleReport) => total + moduleReport.issues.length,
		0,
	);

	return {
		root: toPosix(path.relative(process.cwd(), root)) || ".",
		summary: {
			checkedModules: modules.length,
			issueCount,
			status: issueCount === 0 ? "passed" : "failed",
		},
		modules,
	};
}

export async function findContextDirs(dir) {
	let result = [];
	const entries = await readDirIfExists(dir);

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (!entry.isDirectory()) continue;

		if (entry.name === ".context") {
			result.push(fullPath);
			continue;
		}

		result = [...result, ...(await findContextDirs(fullPath))];
	}

	return result.sort();
}

export function hasH1(content) {
	const firstNonEmpty = content.split(/\r?\n/).find((line) => line.trim());
	return /^#\s+\S/.test(firstNonEmpty ?? "");
}

export function renderContextTripletMarkdown(report) {
	const lines = [
		"# Validacao Da Memoria Tripla",
		"",
		`- Modulos verificados: ${report.summary.checkedModules}`,
		`- Problemas: ${report.summary.issueCount}`,
		`- Status: ${report.summary.status}`,
		"",
		"## Modulos",
		"",
	];

	for (const moduleReport of report.modules) {
		lines.push(`- ${moduleReport.module}: ${moduleReport.status}`);
		for (const issue of moduleReport.issues) {
			lines.push(`  - ${issue.type}: ${issue.file}`);
		}
	}

	return `${lines.join("\n")}\n`;
}

async function readDirIfExists(dir) {
	try {
		return await readdir(dir, { withFileTypes: true });
	} catch (error) {
		if (error?.code === "ENOENT") return [];
		throw error;
	}
}

async function readOptionalText(filePath) {
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
	};

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		const value = args[index + 1];
		if (arg === "--root" || arg === "--format") {
			if (!value || value.startsWith("--")) {
				return { success: false, error: `Missing value for ${arg}` };
			}
			options[arg.slice(2)] = value;
			index += 1;
			continue;
		}

		return { success: false, error: `Unsupported option: ${arg}` };
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

	const report = await validateContextTriplets(parsed.options.root);
	const rendered =
		parsed.options.format === "markdown"
			? renderContextTripletMarkdown(report)
			: `${JSON.stringify(report, null, 2)}\n`;

	process.stdout.write(rendered);
	process.exitCode = report.summary.issueCount === 0 ? 0 : 1;
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
