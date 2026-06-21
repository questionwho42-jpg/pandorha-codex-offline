import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

export async function validateSaveMigrationMatrix(rootDir = repoRoot) {
	const root = path.resolve(rootDir);
	const schemaPath = path.join(
		root,
		"src",
		"features",
		"save-load",
		"model",
		"saveLoadSchemas.ts",
	);
	const saveServiceSpecPath = path.join(
		root,
		"src",
		"features",
		"save-load",
		"__tests__",
		"SaveLoadService.spec.ts",
	);
	const sqliteSpecPath = path.join(
		root,
		"src",
		"features",
		"save-load",
		"__tests__",
		"SqliteSaveSnapshotService.spec.ts",
	);
	const schema = await readFile(schemaPath, "utf8");
	const serviceSpec = await readFile(saveServiceSpecPath, "utf8");
	const sqliteSpec = await readFile(sqliteSpecPath, "utf8");
	const currentSaveVersion = extractCurrentSaveVersion(schema);
	const issues = [];

	if (currentSaveVersion === null) {
		issues.push({
			type: "missing-current-version",
			file: toPosix(path.relative(root, schemaPath)),
			message: "CURRENT_SAVE_VERSION was not found.",
		});
	}

	const current = currentSaveVersion ?? 0;
	for (let version = 1; version <= current; version += 1) {
		if (!hasLiteralVersion(schema, version, current)) {
			issues.push({
				type: "missing-schema",
				version,
				file: toPosix(path.relative(root, schemaPath)),
				message: `Save schema version ${version} is not represented.`,
			});
		}
	}

	for (let version = 1; version < current; version += 1) {
		if (!hasMigrationStep(schema, version)) {
			issues.push({
				type: "missing-migration",
				version,
				file: toPosix(path.relative(root, schemaPath)),
				message: `Migration step from v${version} is not represented.`,
			});
		}

		if (!hasVersionTest(serviceSpec, sqliteSpec, version)) {
			issues.push({
				type: "missing-test",
				version,
				file: toPosix(path.relative(root, saveServiceSpecPath)),
				message: `Legacy save version ${version} has no visible test coverage.`,
			});
		}
	}

	if (current > 0 && !hasCurrentFixture(schema, current)) {
		issues.push({
			type: "outdated-fixture",
			version: current,
			file: toPosix(path.relative(root, schemaPath)),
			message: `No current v${current} fixture or snapshot shape was found.`,
		});
	}

	return {
		currentSaveVersion,
		summary: {
			issueCount: issues.length,
			status: issues.length === 0 ? "passed" : "failed",
		},
		issues,
	};
}

export function extractCurrentSaveVersion(source) {
	const match = source.match(/CURRENT_SAVE_VERSION\s*=\s*(\d+)/);
	return match ? Number(match[1]) : null;
}

function hasLiteralVersion(source, version, currentVersion) {
	if (
		version === currentVersion &&
		/z\.literal\(\s*CURRENT_SAVE_VERSION\s*\)/.test(source)
	) {
		return true;
	}

	const literal = String.raw`z\.literal\(\s*${version}\s*\)`;
	return new RegExp(literal).test(source);
}

function hasMigrationStep(source, version) {
	return new RegExp(String.raw`version\s*===\s*${version}\b`).test(source);
}

function hasVersionTest(left, right, version) {
	const pattern = new RegExp(String.raw`version:\s*${version}\b|v${version}\b`);
	return pattern.test(left) || pattern.test(right);
}

function hasCurrentFixture(source, version) {
	return new RegExp(
		String.raw`version:\s*CURRENT_SAVE_VERSION\b|CURRENT_SAVE_VERSION\s*=\s*${version}\b[\s\S]*version:\s*CURRENT_SAVE_VERSION\b`,
	).test(source);
}

export function renderSaveMigrationMatrixMarkdown(report) {
	const lines = [
		"# Matriz De Save E Migration",
		"",
		`- Versao atual: ${report.currentSaveVersion ?? "desconhecida"}`,
		`- Problemas: ${report.summary.issueCount}`,
		`- Status: ${report.summary.status}`,
		"",
		"## Problemas",
		"",
	];

	if (report.issues.length === 0) {
		lines.push("Nenhum problema encontrado.");
	} else {
		for (const issue of report.issues) {
			lines.push(`- ${issue.type} v${issue.version ?? "-"}: ${issue.message}`);
		}
	}

	return `${lines.join("\n")}\n`;
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

	const report = await validateSaveMigrationMatrix(parsed.options.root);
	const rendered =
		parsed.options.format === "markdown"
			? renderSaveMigrationMatrixMarkdown(report)
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
