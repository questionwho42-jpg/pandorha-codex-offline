import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ignoredDirectories = new Set([
	".git",
	"artifacts",
	"coverage",
	"dist",
	"node_modules",
]);

const svelteRules = [
	{
		id: "svelte4-export-let",
		label:
			"Legacy Svelte 4 props syntax ('export let') is forbidden. Use Svelte 5 '$props()' instead.",
		pattern: /\bexport\s+let\b/,
	},
	{
		id: "svelte4-reactive-label",
		label:
			"Legacy Svelte 4 reactive label ('$:') is forbidden. Use Svelte 5 '$derived()' or '$effect()' instead.",
		pattern: /^\s*\$:\s+/m,
	},
	{
		id: "svelte-internal-import",
		label:
			"Importing from 'svelte/internal' is an AI hallucination and is strictly forbidden.",
		pattern: /from\s+['"]svelte\/internal['"]/,
	},
	{
		id: "svelte-legacy-component-tag",
		label:
			"Legacy '<svelte:component>' tag is deprecated in Svelte 5. Render components dynamically using their capitalised variable name directly (e.g. <Component />) or use '<svelte:element>'.",
		pattern: /<svelte:component\b/,
	},
];

if (isCliEntrypoint()) {
	const targets = process.argv.slice(2);
	const result = await validateSvelteTargets(
		targets.length > 0 ? targets : ["src"],
	);
	if (result.success) {
		console.log("Svelte 5 syntax validation passed.");
		process.exit(0);
	} else {
		console.error(result.error);
		process.exit(1);
	}
}

export async function validateSvelteTargets(targets) {
	const files = [];
	for (const target of targets) {
		const resolved = path.resolve(target);
		files.push(...(await collectSvelteFiles(resolved)));
	}

	const violations = [];
	for (const file of files) {
		const extension = path.extname(file);
		if (extension !== ".svelte") {
			continue;
		}

		const contentResult = await readTextFile(file);
		if (!contentResult.success) {
			violations.push(`${file}: ${contentResult.error}`);
			continue;
		}

		const relativePath = path.relative(process.cwd(), file).replace(/\\/g, "/");

		for (const rule of svelteRules) {
			if (rule.pattern.test(contentResult.content)) {
				violations.push(`[${rule.id}] ${relativePath}: ${rule.label}`);
			}
		}
	}

	if (violations.length > 0) {
		return {
			success: false,
			error: `Svelte 5 Syntax Violations found:\n${violations.join("\n")}`,
		};
	}

	return { success: true };
}

async function collectSvelteFiles(target) {
	const targetStat = await readStat(target);
	if (!targetStat.success) {
		return [];
	}

	if (targetStat.value.isFile()) {
		return [target];
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
		files.push(...(await collectSvelteFiles(path.join(target, entry.name))));
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

async function readTextFile(file) {
	try {
		return { success: true, content: await readFile(file, "utf8") };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

function isCliEntrypoint() {
	return (
		process.argv[1] &&
		path.resolve(process.argv[1]) === path.resolve(import.meta.filename)
	);
}
