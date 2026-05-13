import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ignoredDirectories = new Set([".git", "node_modules"]);
const targets =
	process.argv.length > 2
		? process.argv.slice(2)
		: [path.resolve(".agents/skills")];

const result = await validateJsonTargets(targets);
if (result.success) {
	console.log(
		`json validation passed (${result.checked} file${result.checked === 1 ? "" : "s"})`,
	);
} else {
	console.error(result.error);
	process.exit(1);
}

async function validateJsonTargets(targetList) {
	const files = [];
	for (const target of targetList) {
		files.push(...(await collectJsonFiles(path.resolve(target))));
	}

	const failures = [];
	for (const file of files) {
		const content = await readText(file);
		if (!content.success) {
			failures.push(`${file}: ${content.error}`);
			continue;
		}

		try {
			JSON.parse(content.value);
		} catch (error) {
			failures.push(
				`${file}: Invalid JSON - ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}

	if (failures.length > 0) {
		return { success: false, error: failures.join("\n") };
	}

	return { success: true, checked: files.length };
}

async function collectJsonFiles(target) {
	const targetStat = await readStat(target);
	if (!targetStat.success) {
		return [];
	}

	if (targetStat.value.isFile()) {
		return target.endsWith(".json") ? [target] : [];
	}

	if (!targetStat.value.isDirectory()) {
		return [];
	}

	if (ignoredDirectories.has(path.basename(target))) {
		return [];
	}

	const entries = await readDirectory(target);
	if (!entries.success) {
		return [];
	}

	const files = [];
	for (const entry of entries.entries) {
		files.push(...(await collectJsonFiles(path.join(target, entry.name))));
	}

	return files;
}

async function readStat(target) {
	try {
		return { success: true, value: await stat(target) };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

async function readDirectory(target) {
	try {
		return {
			success: true,
			entries: await readdir(target, { withFileTypes: true }),
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

async function readText(file) {
	try {
		return { success: true, value: await readFile(file, "utf8") };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
