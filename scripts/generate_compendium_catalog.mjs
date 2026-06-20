import { spawnSync } from "node:child_process";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const defaultOutputPath = path.join(
	repoRoot,
	"src",
	"entities",
	"compendium",
	"model",
	"generatedCompendiumCatalog.ts",
);

const sourceRoots = [
	{
		category: "system-survival",
		relativePath: "docs/system/survival",
		tag: "survival",
	},
	{
		category: "system-combat",
		relativePath: "docs/system/combat",
		tag: "combat",
	},
	{
		category: "system-magic",
		relativePath: "docs/system/magic",
		tag: "magic",
	},
];

const excludedRelativePaths = new Set([
	"docs/system/survival/pandorha-sistema-compilado.md",
]);

const parsedArgs = parseArgs(process.argv.slice(2));
if (!parsedArgs.success) {
	console.error(parsedArgs.error);
	process.exitCode = 1;
} else {
	const result = await runGenerator(parsedArgs.value);
	if (!result.success) {
		console.error(result.error);
		process.exitCode = 1;
	}
}

async function runGenerator(options) {
	const entriesResult = await collectEntries(options.root);
	if (!entriesResult.success) {
		return entriesResult;
	}

	const formattedContent = formatGeneratedCatalog(
		renderGeneratedCatalog(entriesResult.data),
		options.output,
	);
	if (!formattedContent.success) {
		return formattedContent;
	}

	const content = formattedContent.data;
	if (options.check) {
		const current = await readOptionalFile(options.output);
		if (current !== content) {
			return {
				success: false,
				error:
					"Generated Compendium catalog is out of date. Run npm.cmd run compendium:generate.",
			};
		}

		console.log("generated Compendium catalog is up to date");
		return { success: true };
	}

	await mkdir(path.dirname(options.output), { recursive: true });
	await writeFile(options.output, content, "utf8");
	console.log(`generated ${entriesResult.data.length} Compendium entries`);
	return { success: true };
}

function parseArgs(args) {
	let check = false;
	let root = repoRoot;
	let output = defaultOutputPath;

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg === "--check") {
			check = true;
			continue;
		}

		if (arg === "--root") {
			const value = args[index + 1];
			if (!value) {
				return { success: false, error: "--root requires a value" };
			}
			root = path.resolve(value);
			index += 1;
			continue;
		}

		if (arg === "--output") {
			const value = args[index + 1];
			if (!value) {
				return { success: false, error: "--output requires a value" };
			}
			output = path.resolve(value);
			index += 1;
			continue;
		}

		return { success: false, error: `Unsupported argument: ${arg}` };
	}

	return {
		success: true,
		value: {
			check,
			output,
			root,
		},
	};
}

async function collectEntries(root) {
	const entries = [];
	for (const sourceRoot of sourceRoots) {
		const absoluteRoot = path.join(root, ...sourceRoot.relativePath.split("/"));
		const files = await listMarkdownFiles(absoluteRoot);
		for (const file of files) {
			const relativePath = normalizeRelativePath(path.relative(root, file));
			if (excludedRelativePaths.has(relativePath)) {
				continue;
			}

			const content = await readFile(file, "utf8");
			const entry = createEntry(sourceRoot, relativePath, content);
			entries.push(entry);
		}
	}

	entries.sort((left, right) => left.id.localeCompare(right.id, "en"));
	const duplicateIds = findDuplicateIds(entries);
	if (duplicateIds.length > 0) {
		return {
			success: false,
			error: `Generated Compendium catalog has duplicate ids: ${duplicateIds.join(", ")}`,
		};
	}

	return { success: true, data: entries };
}

async function listMarkdownFiles(root) {
	const files = [];
	const stack = [root];

	while (stack.length > 0) {
		const current = stack.pop();
		let entries;
		try {
			entries = await readdir(current, { withFileTypes: true });
		} catch (error) {
			if (error?.code === "ENOENT") {
				continue;
			}
			throw error;
		}

		for (const entry of entries) {
			const absolutePath = path.join(current, entry.name);
			if (entry.isDirectory()) {
				stack.push(absolutePath);
				continue;
			}

			if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
				files.push(absolutePath);
			}
		}
	}

	return files.sort((left, right) => left.localeCompare(right, "en"));
}

function createEntry(sourceRoot, relativePath, content) {
	const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);
	const heading = findFirstHeading(lines);
	const fallbackTitle = titleFromPath(relativePath);
	const title =
		heading && !isOpaqueDisplayText(heading.title)
			? heading.title
			: fallbackTitle;
	const sourceLine = heading?.lineNumber ?? 1;
	const rawSummary = createSummary(lines, heading?.lineIndex ?? -1);
	const summary = isOpaqueDisplayText(rawSummary)
		? defaultSummary()
		: rawSummary;
	const fileSlug = slugify(
		relativePath
			.slice(sourceRoot.relativePath.length + 1)
			.replace(/\.md$/i, ""),
	);
	const tags = unique([
		sourceRoot.tag,
		sourceRoot.category,
		...fileSlug.split("-").filter(Boolean).slice(0, 6).map(toValidTag),
	]);

	return {
		category: sourceRoot.category,
		id: `${sourceRoot.category}-${fileSlug}`,
		searchText: unique([title, summary, relativePath, ...tags]).join(" "),
		sourceFile: relativePath,
		sourceLine,
		summary,
		tags,
		title,
	};
}

function defaultSummary() {
	return "Entrada de referencia do sistema Pandorha para consulta no Compendio.";
}

function findFirstHeading(lines) {
	let inFrontmatter = false;
	for (let index = 0; index < lines.length; index += 1) {
		const trimmed = lines[index].trim();
		if (index === 0 && trimmed === "---") {
			inFrontmatter = true;
			continue;
		}
		if (inFrontmatter) {
			if (trimmed === "---") {
				inFrontmatter = false;
			}
			continue;
		}

		if (trimmed.startsWith("# ")) {
			return {
				lineIndex: index,
				lineNumber: index + 1,
				title: cleanInlineMarkdown(trimmed.replace(/^#\s+/, "")),
			};
		}
	}

	return null;
}

function createSummary(lines, headingIndex) {
	const readableLines = [];
	let inFrontmatter = false;
	let inIgnoredBlock = false;
	let paragraphStarted = false;

	for (
		let index = Math.max(0, headingIndex + 1);
		index < lines.length;
		index += 1
	) {
		let line = lines[index].trim();
		if (index === 0 && line === "---") {
			inFrontmatter = true;
			continue;
		}
		if (inFrontmatter) {
			if (line === "---") {
				inFrontmatter = false;
			}
			continue;
		}
		if (line.includes("<ai_ignore>")) {
			inIgnoredBlock = true;
			continue;
		}
		if (line.includes("</ai_ignore>")) {
			inIgnoredBlock = false;
			continue;
		}
		if (inIgnoredBlock) {
			continue;
		}

		line = line.replace(/<\/?ai_context>/g, "").trim();
		if (!isReadableSummaryLine(line)) {
			if (paragraphStarted) {
				break;
			}
			continue;
		}

		readableLines.push(cleanInlineMarkdown(line));
		paragraphStarted = true;
	}

	const summary = readableLines.join(" ").replace(/\s+/g, " ").trim();
	if (summary.length === 0) {
		return defaultSummary();
	}

	return truncateText(summary, 700);
}

function isReadableSummaryLine(line) {
	if (line.length === 0) {
		return false;
	}
	if (line.startsWith("#") || line.startsWith("```") || line.startsWith("|")) {
		return false;
	}
	if (line.startsWith("![") || /^<\/?[a-z][^>]*>$/i.test(line)) {
		return false;
	}
	return true;
}

function cleanInlineMarkdown(value) {
	return value
		.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/[*_`>#]/g, "")
		.replace(/^\s*[-*]\s+/, "")
		.replace(/\s+/g, " ")
		.trim();
}

function titleFromPath(relativePath) {
	const basename = path.basename(relativePath, ".md");
	return basename
		.split(/[-_]+/)
		.filter(Boolean)
		.map(
			(part) => `${part.charAt(0).toLocaleUpperCase("pt-BR")}${part.slice(1)}`,
		)
		.join(" ");
}

function slugify(value) {
	const normalized = value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return normalized || "entry";
}

function truncateText(value, maxLength) {
	if (value.length <= maxLength) {
		return value;
	}

	return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function isOpaqueDisplayText(value) {
	return /\.md$/i.test(value.trim()) || /[A-Za-z0-9+/]{40,}/.test(value);
}

function unique(values) {
	return [...new Set(values.filter((value) => value.length > 0))];
}

function toValidTag(value) {
	if (/^[a-z]/.test(value)) {
		return value;
	}

	return `ref-${value}`;
}

function findDuplicateIds(entries) {
	const seen = new Set();
	const duplicates = new Set();
	for (const entry of entries) {
		if (seen.has(entry.id)) {
			duplicates.add(entry.id);
		}
		seen.add(entry.id);
	}
	return [...duplicates].sort();
}

function normalizeRelativePath(value) {
	return value.split(path.sep).join("/");
}

function renderGeneratedCatalog(entries) {
	const renderedEntries = entries.map(renderEntry).join(",\n");
	return [
		"// AUTO-GENERATED by scripts/generate_compendium_catalog.mjs",
		"// Do not edit manually. Update docs/system and rerun the generator.",
		'import type { CompendiumEntry } from "./compendiumSchema";',
		"",
		"export const GENERATED_COMPENDIUM_ENTRIES = [",
		renderedEntries,
		"] as const satisfies readonly CompendiumEntry[];",
		"",
	].join("\n");
}

function renderEntry(entry) {
	return [
		"\t{",
		`\t\tid: ${toTsString(entry.id)},`,
		`\t\ttitle: ${toTsString(entry.title)},`,
		`\t\tcategory: ${toTsString(entry.category)},`,
		`\t\tsummary: ${toTsString(entry.summary)},`,
		`\t\tsourceFile: ${toTsString(entry.sourceFile)},`,
		`\t\tsourceLine: ${entry.sourceLine},`,
		`\t\tsearchText: ${toTsString(entry.searchText)},`,
		`\t\ttags: ${renderTsStringArray(entry.tags)},`,
		"\t}",
	].join("\n");
}

function toTsString(value) {
	return JSON.stringify(value);
}

function renderTsStringArray(values) {
	return `[${values.map(toTsString).join(", ")}]`;
}

function formatGeneratedCatalog(content, outputPath) {
	const biomeScript = path.join(
		repoRoot,
		"node_modules",
		"@biomejs",
		"biome",
		"bin",
		"biome",
	);
	const formatted = spawnSync(
		process.execPath,
		[biomeScript, "format", "--stdin-file-path", outputPath],
		{
			cwd: repoRoot,
			encoding: "utf8",
			input: content,
		},
	);

	if (formatted.status !== 0 || formatted.error) {
		return {
			success: false,
			error:
				formatted.error?.message ||
				formatted.stderr ||
				"Biome failed to format the generated Compendium catalog.",
		};
	}

	return { success: true, data: formatted.stdout };
}

async function readOptionalFile(filePath) {
	try {
		return await readFile(filePath, "utf8");
	} catch (error) {
		if (error?.code === "ENOENT") {
			return null;
		}
		throw error;
	}
}
