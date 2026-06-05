import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const parsedArgs = parseArgs(process.argv.slice(2));

if (!parsedArgs.success) {
	exitWithError(parsedArgs.error);
} else {
	const result = await refreshDependencyAdvisories(parsedArgs.value);
	if (!result.success) {
		exitWithError(result.error);
	} else {
		console.log(
			`dependency advisories refreshed: ${result.advisoryCount} advisories written to ${result.outputPath}`,
		);
	}
}

export async function refreshDependencyAdvisories(input) {
	const auditJsonResult = input.auditJsonPath
		? await readAuditJson(input.auditJsonPath)
		: runNpmAudit(input.root);

	if (!auditJsonResult.success) {
		return auditJsonResult;
	}

	const normalized = normalizeNpmAuditReport({
		report: auditJsonResult.data,
		staleAfterDays: input.staleAfterDays,
	});

	await mkdir(path.dirname(input.outputPath), { recursive: true });
	await writeFile(
		input.outputPath,
		`${JSON.stringify(normalized, null, "\t")}\n`,
		"utf8",
	);

	return {
		success: true,
		advisoryCount: normalized.advisories.length,
		outputPath: input.outputPath,
	};
}

function parseArgs(args) {
	const options = {
		outputPath: path.join(repoRoot, "security", "npm-advisories.json"),
		root: repoRoot,
		staleAfterDays: 30,
	};

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg === "--root") {
			index += 1;
			options.root = path.resolve(args[index] ?? "");
			continue;
		}
		if (arg === "--output") {
			index += 1;
			options.outputPath = path.resolve(args[index] ?? "");
			continue;
		}
		if (arg === "--audit-json") {
			index += 1;
			options.auditJsonPath = path.resolve(args[index] ?? "");
			continue;
		}
		if (arg === "--stale-after-days") {
			index += 1;
			options.staleAfterDays = Number(args[index]);
			continue;
		}

		return { success: false, error: `Unsupported argument: ${arg}` };
	}

	if (!Number.isInteger(options.staleAfterDays) || options.staleAfterDays < 1) {
		return {
			success: false,
			error: "--stale-after-days must be a positive integer.",
		};
	}

	return { success: true, value: options };
}

async function readAuditJson(filePath) {
	try {
		return {
			success: true,
			data: JSON.parse(await readFile(filePath, "utf8")),
		};
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? `Could not read audit JSON: ${error.message}`
					: `Could not read audit JSON: ${String(error)}`,
		};
	}
}

function runNpmAudit(root) {
	const result = spawnSync(npmCommand, ["audit", "--json"], {
		cwd: root,
		encoding: "utf8",
		shell: process.platform === "win32",
		windowsHide: true,
	});

	if (!result.stdout.trim()) {
		return {
			success: false,
			error:
				result.stderr.trim() ||
				"npm audit did not produce JSON output. Run this refresh only with explicit network approval.",
		};
	}

	try {
		return { success: true, data: JSON.parse(result.stdout) };
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? `npm audit output was not valid JSON: ${error.message}`
					: `npm audit output was not valid JSON: ${String(error)}`,
		};
	}
}

function normalizeNpmAuditReport({ report, staleAfterDays }) {
	const vulnerabilities = isRecord(report.vulnerabilities)
		? Object.values(report.vulnerabilities)
		: [];
	const advisories = vulnerabilities
		.map(normalizeVulnerability)
		.filter((advisory) => advisory !== null)
		.sort((left, right) =>
			`${left.packageName}:${left.id}`.localeCompare(
				`${right.packageName}:${right.id}`,
			),
		);

	return {
		generatedAt: new Date().toISOString(),
		source: "npm audit --json",
		staleAfterDays,
		advisories,
	};
}

function normalizeVulnerability(vulnerability) {
	if (!isRecord(vulnerability) || typeof vulnerability.name !== "string") {
		return null;
	}

	const viaAdvisory = Array.isArray(vulnerability.via)
		? vulnerability.via.find(isRecord)
		: null;
	const vulnerableRange =
		typeof vulnerability.range === "string"
			? vulnerability.range
			: typeof viaAdvisory?.range === "string"
				? viaAdvisory.range
				: null;
	const severity = normalizeSeverity(
		typeof vulnerability.severity === "string"
			? vulnerability.severity
			: viaAdvisory?.severity,
	);

	if (!vulnerableRange || !severity) {
		return null;
	}

	return {
		id: createAdvisoryId(vulnerability, viaAdvisory),
		packageName: vulnerability.name,
		vulnerableRange,
		severity,
		title:
			typeof viaAdvisory?.title === "string"
				? viaAdvisory.title
				: `npm audit advisory for ${vulnerability.name}`,
		recommendation: createRecommendation(vulnerability.fixAvailable),
	};
}

function createAdvisoryId(vulnerability, viaAdvisory) {
	if (typeof viaAdvisory?.url === "string" && viaAdvisory.url.trim()) {
		return viaAdvisory.url;
	}
	if (typeof viaAdvisory?.source === "number") {
		return `npm:${viaAdvisory.source}`;
	}

	return `npm:${vulnerability.name}:${vulnerability.range ?? "unknown"}`;
}

function createRecommendation(fixAvailable) {
	if (fixAvailable === false) {
		return "Review manually; npm audit did not report an automatic fix.";
	}
	if (fixAvailable === true) {
		return "Run an approved dependency refresh and review the resulting lockfile.";
	}
	if (isRecord(fixAvailable) && typeof fixAvailable.name === "string") {
		const version =
			typeof fixAvailable.version === "string"
				? `@${fixAvailable.version}`
				: "";
		return `Upgrade ${fixAvailable.name}${version} in an approved dependency refresh.`;
	}

	return "Review the dependency and update the local advisory database after remediation.";
}

function normalizeSeverity(value) {
	return ["low", "moderate", "high", "critical"].includes(value) ? value : null;
}

function exitWithError(message) {
	console.error(message);
	process.exitCode = 1;
}

function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
