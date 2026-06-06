import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const severityOrder = {
	low: 1,
	moderate: 2,
	high: 3,
	critical: 4,
};

const parsedArgs = parseArgs(process.argv.slice(2));

if (!parsedArgs.success) {
	writeFailure(parsedArgs.error);
} else {
	const result = await runDependencySecurityGate(parsedArgs.value);
	if (parsedArgs.value.format === "json") {
		console.log(`${JSON.stringify(result, null, 2)}`);
	} else if (result.success) {
		console.log(renderSuccess(result));
	} else {
		writeFailure(renderFailure(result));
	}
}

export async function runDependencySecurityGate(input) {
	const lockfilePath = path.join(input.root, "package-lock.json");
	const advisoriesPath =
		input.advisoriesPath ??
		path.join(input.root, "security", "npm-advisories.json");
	const errors = [];
	const warnings = [];
	const lockfileResult = await readJson(lockfilePath);
	const advisoriesResult = await readJson(advisoriesPath);

	if (!lockfileResult.success) {
		errors.push(lockfileResult.error);
	}
	if (!advisoriesResult.success) {
		errors.push(advisoriesResult.error);
	}
	if (errors.length > 0) {
		return createGateResult(input, {
			advisoryCount: 0,
			errors,
			findings: [],
			scannedPackageCount: 0,
			warnings,
		});
	}

	const lockfileValidation = validateLockfile(lockfileResult.data);
	if (!lockfileValidation.success) {
		errors.push(...lockfileValidation.errors);
	}

	const advisoryValidation = validateAdvisoryDatabase(advisoriesResult.data);
	if (!advisoryValidation.success) {
		errors.push(...advisoryValidation.errors);
	}

	if (errors.length > 0) {
		return createGateResult(input, {
			advisoryCount: advisoryValidation.advisories?.length ?? 0,
			errors,
			findings: [],
			scannedPackageCount: 0,
			warnings,
		});
	}

	const installedPackages = collectInstalledPackages(lockfileResult.data);
	const advisoryDatabase = advisoryValidation.database;
	warnings.push(...getDatabaseWarnings(advisoryDatabase, input.now));

	const findings = findVulnerablePackages({
		advisories: advisoryDatabase.advisories,
		auditLevel: input.auditLevel,
		installedPackages,
	});

	return createGateResult(input, {
		advisoryCount: advisoryDatabase.advisories.length,
		errors,
		findings,
		scannedPackageCount: installedPackages.length,
		warnings,
	});
}

function parseArgs(args) {
	const options = {
		auditLevel: "high",
		format: "text",
		root: repoRoot,
	};

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		const equalsArg = parseEqualsArg(arg);
		if (equalsArg) {
			const applied = applyOption(options, equalsArg.name, equalsArg.value);
			if (!applied.success) {
				return applied;
			}
			continue;
		}
		if (arg === "--root") {
			index += 1;
			options.root = path.resolve(args[index] ?? "");
			continue;
		}
		if (arg === "--advisories") {
			index += 1;
			options.advisoriesPath = path.resolve(args[index] ?? "");
			continue;
		}
		if (arg === "--audit-level") {
			index += 1;
			options.auditLevel = args[index];
			continue;
		}
		if (arg === "--format") {
			index += 1;
			options.format = args[index];
			continue;
		}

		return { success: false, error: `Unsupported argument: ${arg}` };
	}

	if (!isSeverity(options.auditLevel)) {
		return {
			success: false,
			error: `Unsupported --audit-level value: ${options.auditLevel}`,
		};
	}
	if (!["json", "text"].includes(options.format)) {
		return {
			success: false,
			error: `Unsupported --format value: ${options.format}`,
		};
	}

	return { success: true, value: options };
}

function parseEqualsArg(arg) {
	const match = /^(--[a-z-]+)=(.*)$/.exec(arg);
	if (!match) {
		return null;
	}

	return { name: match[1], value: match[2] };
}

function applyOption(options, name, value) {
	if (name === "--root") {
		options.root = path.resolve(value);
		return { success: true };
	}
	if (name === "--advisories") {
		options.advisoriesPath = path.resolve(value);
		return { success: true };
	}
	if (name === "--audit-level") {
		options.auditLevel = value;
		return { success: true };
	}
	if (name === "--format") {
		options.format = value;
		return { success: true };
	}

	return { success: false, error: `Unsupported argument: ${name}` };
}

async function readJson(filePath) {
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
					? `Could not read ${filePath}: ${error.message}`
					: `Could not read ${filePath}: ${String(error)}`,
		};
	}
}

function validateLockfile(lockfile) {
	const errors = [];
	if (!isRecord(lockfile)) {
		errors.push("package-lock.json must be a JSON object.");
		return { success: false, errors };
	}
	if (lockfile.lockfileVersion !== 3) {
		errors.push("package-lock.json must use lockfileVersion 3.");
	}
	if (!isRecord(lockfile.packages)) {
		errors.push("package-lock.json must include a packages object.");
	}

	return errors.length === 0 ? { success: true } : { success: false, errors };
}

function validateAdvisoryDatabase(database) {
	const errors = [];
	if (!isRecord(database)) {
		return {
			success: false,
			errors: ["Advisory database must be a JSON object."],
		};
	}
	if (
		typeof database.generatedAt !== "string" ||
		Number.isNaN(Date.parse(database.generatedAt))
	) {
		errors.push("Advisory database generatedAt must be an ISO date string.");
	}
	if (
		typeof database.source !== "string" ||
		database.source.trim().length === 0
	) {
		errors.push("Advisory database source must be a non-empty string.");
	}
	if (
		!Number.isInteger(database.staleAfterDays) ||
		database.staleAfterDays < 1
	) {
		errors.push("Advisory database staleAfterDays must be a positive integer.");
	}
	if (!Array.isArray(database.advisories)) {
		errors.push("Advisory database advisories must be an array.");
		return { success: false, errors };
	}

	for (const [index, advisory] of database.advisories.entries()) {
		errors.push(...validateAdvisory(advisory, index));
	}

	return errors.length === 0
		? { success: true, database }
		: { success: false, errors, advisories: database.advisories };
}

function validateAdvisory(advisory, index) {
	const prefix = `advisories[${index}]`;
	const errors = [];
	if (!isRecord(advisory)) {
		return [`${prefix} must be an object.`];
	}

	for (const field of [
		"id",
		"packageName",
		"vulnerableRange",
		"severity",
		"title",
		"recommendation",
	]) {
		if (
			typeof advisory[field] !== "string" ||
			advisory[field].trim().length === 0
		) {
			errors.push(`${prefix}.${field} must be a non-empty string.`);
		}
	}

	if (typeof advisory.severity === "string" && !isSeverity(advisory.severity)) {
		errors.push(`${prefix}.severity is unsupported: ${advisory.severity}`);
	}
	if (
		typeof advisory.vulnerableRange === "string" &&
		!parseRange(advisory.vulnerableRange).success
	) {
		errors.push(
			`${prefix}.vulnerableRange has unsupported vulnerableRange: ${advisory.vulnerableRange}`,
		);
	}

	return errors;
}

function collectInstalledPackages(lockfile) {
	const installed = [];
	for (const [lockPath, packageEntry] of Object.entries(lockfile.packages)) {
		if (lockPath === "" || !isRecord(packageEntry)) {
			continue;
		}

		const packageName = getPackageNameFromLockPath(lockPath);
		if (!packageName || typeof packageEntry.version !== "string") {
			continue;
		}

		installed.push({
			lockPath,
			name: packageName,
			version: packageEntry.version,
		});
	}

	return installed;
}

function getPackageNameFromLockPath(lockPath) {
	const marker = "node_modules/";
	const markerIndex = lockPath.lastIndexOf(marker);
	if (markerIndex < 0) {
		return null;
	}

	const packagePath = lockPath.slice(markerIndex + marker.length);
	const parts = packagePath.split(/[\\/]/).filter(Boolean);
	if (parts.length === 0) {
		return null;
	}
	if (parts[0].startsWith("@")) {
		return parts.length > 1 ? `${parts[0]}/${parts[1]}` : null;
	}

	return parts[0];
}

function getDatabaseWarnings(database, now = new Date()) {
	const generatedAt = new Date(database.generatedAt);
	const ageMs = now.getTime() - generatedAt.getTime();
	const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
	if (ageDays <= database.staleAfterDays) {
		return [];
	}

	return [
		`Advisory database is stale: ${ageDays} days old; refresh target is ${database.staleAfterDays} days.`,
	];
}

function findVulnerablePackages({ advisories, auditLevel, installedPackages }) {
	const minimumSeverity = severityOrder[auditLevel];
	const installedByName = groupInstalledPackagesByName(installedPackages);
	const findings = [];

	for (const advisory of advisories) {
		if (severityOrder[advisory.severity] < minimumSeverity) {
			continue;
		}

		const installedEntries = installedByName.get(advisory.packageName) ?? [];
		for (const installed of installedEntries) {
			if (satisfiesRange(installed.version, advisory.vulnerableRange)) {
				findings.push({
					advisoryId: advisory.id,
					lockPath: installed.lockPath,
					packageName: installed.name,
					recommendation: advisory.recommendation,
					severity: advisory.severity,
					title: advisory.title,
					version: installed.version,
					vulnerableRange: advisory.vulnerableRange,
				});
			}
		}
	}

	return findings;
}

function groupInstalledPackagesByName(installedPackages) {
	const grouped = new Map();
	for (const installed of installedPackages) {
		const entries = grouped.get(installed.name) ?? [];
		entries.push(installed);
		grouped.set(installed.name, entries);
	}

	return grouped;
}

function parseRange(range) {
	if (typeof range !== "string" || range.trim().length === 0) {
		return { success: false };
	}

	const alternatives = range
		.split("||")
		.map((alternative) => alternative.trim());
	if (alternatives.some((alternative) => alternative.length === 0)) {
		return { success: false };
	}

	const parsedAlternatives = [];
	for (const alternative of alternatives) {
		const normalized = alternative.replace(/(<=|>=|<|>|=)\s+/g, "$1");
		const terms = normalized.split(/\s+/).filter(Boolean);
		if (terms.length === 0) {
			return { success: false };
		}

		const parsedTerms = [];
		for (const term of terms) {
			const parsed = parseRangeTerm(term);
			if (!parsed.success) {
				return { success: false };
			}
			parsedTerms.push(parsed.term);
		}
		parsedAlternatives.push(parsedTerms);
	}

	return { success: true, alternatives: parsedAlternatives };
}

function parseRangeTerm(term) {
	const match =
		/^(<=|>=|<|>|=)?([0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?)$/.exec(
			term,
		);
	if (!match) {
		return { success: false };
	}

	const version = parseVersion(match[2]);
	if (!version.success) {
		return { success: false };
	}

	return {
		success: true,
		term: {
			operator: match[1] ?? "=",
			version: version.value,
		},
	};
}

function satisfiesRange(versionValue, range) {
	const version = parseVersion(versionValue);
	const parsedRange = parseRange(range);
	if (!version.success || !parsedRange.success) {
		return false;
	}

	return parsedRange.alternatives.some((terms) =>
		terms.every((term) => satisfiesTerm(version.value, term)),
	);
}

function satisfiesTerm(version, term) {
	const comparison = compareVersions(version, term.version);
	if (term.operator === "<") {
		return comparison < 0;
	}
	if (term.operator === "<=") {
		return comparison <= 0;
	}
	if (term.operator === ">") {
		return comparison > 0;
	}
	if (term.operator === ">=") {
		return comparison >= 0;
	}

	return comparison === 0;
}

function parseVersion(value) {
	const match =
		/^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(
			value,
		);
	if (!match) {
		return { success: false };
	}

	return {
		success: true,
		value: {
			major: Number(match[1]),
			minor: Number(match[2]),
			patch: Number(match[3]),
			prerelease: match[4]?.split(".") ?? [],
		},
	};
}

function compareVersions(left, right) {
	for (const field of ["major", "minor", "patch"]) {
		if (left[field] !== right[field]) {
			return left[field] > right[field] ? 1 : -1;
		}
	}

	return comparePrerelease(left.prerelease, right.prerelease);
}

function comparePrerelease(left, right) {
	if (left.length === 0 && right.length === 0) {
		return 0;
	}
	if (left.length === 0) {
		return 1;
	}
	if (right.length === 0) {
		return -1;
	}

	const maxLength = Math.max(left.length, right.length);
	for (let index = 0; index < maxLength; index += 1) {
		const leftPart = left[index];
		const rightPart = right[index];
		if (leftPart === undefined) {
			return -1;
		}
		if (rightPart === undefined) {
			return 1;
		}
		if (leftPart === rightPart) {
			continue;
		}

		const leftNumber = /^[0-9]+$/.test(leftPart) ? Number(leftPart) : null;
		const rightNumber = /^[0-9]+$/.test(rightPart) ? Number(rightPart) : null;
		if (leftNumber !== null && rightNumber !== null) {
			return leftNumber > rightNumber ? 1 : -1;
		}
		if (leftNumber !== null) {
			return -1;
		}
		if (rightNumber !== null) {
			return 1;
		}

		return leftPart > rightPart ? 1 : -1;
	}

	return 0;
}

function createGateResult(
	input,
	{ advisoryCount, errors, findings, scannedPackageCount, warnings },
) {
	return {
		advisoryCount,
		auditLevel: input.auditLevel,
		errors,
		findings,
		scannedPackageCount,
		status: errors.length === 0 && findings.length === 0 ? "passed" : "failed",
		success: errors.length === 0 && findings.length === 0,
		warnings,
	};
}

function renderSuccess(result) {
	const lines = [
		"dependency security gate passed",
		`scanned packages: ${result.scannedPackageCount}`,
		`advisories checked: ${result.advisoryCount}`,
		`audit level: ${result.auditLevel}`,
	];

	if (result.warnings.length > 0) {
		lines.push("", "Warnings:");
		for (const warning of result.warnings) {
			lines.push(`- ${warning}`);
		}
	}

	return `${lines.join("\n")}\n`;
}

function renderFailure(result) {
	const lines = ["dependency security gate failed"];

	if (result.errors.length > 0) {
		lines.push("", "Errors:");
		for (const error of result.errors) {
			lines.push(`- ${error}`);
		}
	}

	if (result.findings.length > 0) {
		lines.push("", "Vulnerabilities:");
		for (const finding of result.findings) {
			lines.push(
				[
					`- ${finding.packageName}@${finding.version}`,
					`matches ${finding.vulnerableRange}`,
					`(${finding.severity}, ${finding.advisoryId})`,
					`at ${finding.lockPath}.`,
					finding.recommendation,
				].join(" "),
			);
		}
	}

	if (result.warnings.length > 0) {
		lines.push("", "Warnings:");
		for (const warning of result.warnings) {
			lines.push(`- ${warning}`);
		}
	}

	return `${lines.join("\n")}\n`;
}

function writeFailure(message) {
	console.error(message);
	process.exitCode = 1;
}

function isSeverity(value) {
	return Object.hasOwn(severityOrder, value);
}

function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
