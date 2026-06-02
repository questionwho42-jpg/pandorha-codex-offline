import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const parsedArgs = parseArgs(process.argv.slice(2));

if (!parsedArgs.success) {
	exitWithError(parsedArgs.error);
}

const result = await validateCoverageRegistration(parsedArgs.root);
if (!result.success) {
	exitWithError(result.error);
}

console.log("coverage registration is valid");

function parseArgs(args) {
	let root = repoRoot;

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg !== "--root") {
			return { success: false, error: `Unsupported option: ${arg}` };
		}

		const value = args[index + 1];
		if (!value || value.startsWith("--")) {
			return { success: false, error: "Missing value for --root" };
		}

		root = path.resolve(value);
		index += 1;
	}

	return { success: true, root };
}

async function validateCoverageRegistration(root) {
	const srcDir = path.join(root, "src");
	const configPath = path.join(root, "vitest.config.mjs");
	const configContentResult = await readText(configPath);
	if (!configContentResult.success) {
		return configContentResult;
	}

	const files = await listFiles(srcDir);
	const requiredFiles = files
		.map((file) => normalizePath(path.relative(root, file)))
		.filter(isCoverageRequired)
		.sort((left, right) => left.localeCompare(right));

	const missing = requiredFiles.filter(
		(file) => !configContentResult.content.includes(file),
	);
	if (missing.length > 0) {
		return {
			success: false,
			error: `Missing coverage include entries:\n${missing.join("\n")}`,
		};
	}

	return { success: true };
}

async function listFiles(rootDir) {
	const entries = await readDirectory(rootDir);
	if (!entries.success) {
		return [];
	}

	const files = [];
	for (const entry of entries.entries) {
		const fullPath = path.join(rootDir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await listFiles(fullPath)));
		} else if (entry.isFile()) {
			files.push(fullPath);
		}
	}

	return files;
}

async function readDirectory(rootDir) {
	try {
		return {
			success: true,
			entries: await readdir(rootDir, { withFileTypes: true }),
		};
	} catch (error) {
		if (getErrorCode(error) === "ENOENT") {
			return { success: false, entries: [] };
		}

		return { success: false, entries: [] };
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

function isCoverageRequired(file) {
	if (!file.endsWith(".ts")) {
		return false;
	}

	if (file.includes("/__tests__/") || file.includes("/testing/")) {
		return false;
	}

	if (file.includes("/domain/") && file.endsWith("Service.ts")) {
		return true;
	}

	if (!file.startsWith("src/features/") || !file.includes("/model/")) {
		return false;
	}

	return (
		file.endsWith("View.ts") ||
		file.endsWith("Profile.ts") ||
		file.endsWith("Turn.ts")
	);
}

function normalizePath(filePath) {
	return filePath.replaceAll(path.sep, "/");
}

function getErrorCode(error) {
	if (typeof error === "object" && error !== null && "code" in error) {
		return error.code;
	}

	return null;
}

function exitWithError(message) {
	console.error(message);
	process.exit(1);
}
