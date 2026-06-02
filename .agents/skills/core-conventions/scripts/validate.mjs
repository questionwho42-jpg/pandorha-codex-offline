import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ignoredDirectories = new Set([
	".git",
	"artifacts",
	"coverage",
	"dist",
	"node_modules",
]);

const tailwindDefaultColorPattern =
	/\b(?:bg|text|border|ring|outline|from|via|to|decoration|accent|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;

const forbiddenPatterns = [
	{
		label: "throw new Error",
		pattern: /throw\s+new\s+Error\s*\(/,
		extensions: new Set([".ts", ".tsx", ".svelte"]),
	},
	{
		label: "jest.mock",
		pattern: /\bjest\.mock\s*\(/,
		extensions: new Set([".ts", ".tsx"]),
	},
	{
		label: "vi.mock",
		pattern: /\bvi\.mock\s*\(/,
		extensions: new Set([".ts", ".tsx"]),
	},
	{
		label: "export default",
		pattern: /\bexport\s+default\b/,
		extensions: new Set([".ts", ".tsx"]),
	},
	{
		label: "<style>",
		pattern: /<style\b/i,
		extensions: new Set([".svelte"]),
	},
	{
		label: "Tailwind default color",
		pattern: tailwindDefaultColorPattern,
		extensions: new Set([".svelte"]),
	},
];

if (isCliEntrypoint()) {
	const result = await validateTargets(process.argv.slice(2));
	if (result.success) {
		console.log("core conventions validation passed");
	} else {
		console.error(result.error);
		process.exit(1);
	}
}

export async function validateTargets(targets) {
	if (targets.length === 0) {
		return {
			success: false,
			error: "Provide at least one file or directory to validate.",
		};
	}

	const files = [];
	for (const target of targets) {
		const resolved = path.resolve(target);
		files.push(...(await collectFiles(resolved)));
	}

	const violations = [];
	for (const file of files) {
		const extension = path.extname(file);
		if (![".ts", ".tsx", ".svelte"].includes(extension)) {
			continue;
		}

		const contentResult = await readText(file);
		if (!contentResult.success) {
			violations.push(`${file}: ${contentResult.error}`);
			continue;
		}

		for (const rule of forbiddenPatterns) {
			if (!rule.extensions.has(extension)) {
				continue;
			}

			if (rule.pattern.test(contentResult.content)) {
				violations.push(`${file}: ${rule.label}`);
			}
		}
	}

	if (violations.length > 0) {
		return {
			success: false,
			error: `Core convention violations:\n${violations.join("\n")}`,
		};
	}

	return { success: true };
}

async function collectFiles(target) {
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
		files.push(...(await collectFiles(path.join(target, entry.name))));
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
