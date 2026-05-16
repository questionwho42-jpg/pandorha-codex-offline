#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(sourceDir, "..");
const defaultProjectRoot = path.resolve(packageRoot, "..", "..");

const ALLOWED_EXTENSIONS = new Set([".svelte", ".ts"]);
const FEATURE_PRIVATE_SEGMENTS = new Set([
	"api",
	"components",
	"internal",
	"lib",
	"model",
	"private",
	"services",
	"stores",
	"ui",
	"utils",
]);
const TAILWIND_COLORS = [
	"slate",
	"gray",
	"zinc",
	"neutral",
	"stone",
	"red",
	"orange",
	"amber",
	"yellow",
	"lime",
	"green",
	"emerald",
	"teal",
	"cyan",
	"sky",
	"blue",
	"indigo",
	"violet",
	"purple",
	"fuchsia",
	"pink",
	"rose",
].join("|");
const TAILWIND_STEPS = "50|100|200|300|400|500|600|700|800|900|950";
const TAILWIND_UTILITY =
	"bg|text|border|ring|from|to|via|fill|stroke|outline|decoration|accent|caret";
const RUNE_PATTERN = /\$(state|derived|effect)\b/g;
const IMPORT_PATTERN =
	/\b(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s*)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;
const TAILWIND_PATTERN = new RegExp(
	`${String.raw`(?:^|[\s"'`}\`${String.raw`{])((?:(?:hover|focus|active|disabled|dark|sm|md|lg|xl|2xl|group-hover|peer-checked|motion-safe|motion-reduce|aria-\[[^\]]+\]|data-\[[^\]]+\]):)*(?:${TAILWIND_UTILITY})-(?:${TAILWIND_COLORS})-(?:${TAILWIND_STEPS})(?:\/\d{1,3})?)(?=$|[\s"'`}\`${String.raw`};])`}`,
	"g",
);

export function resolveProjectRoot(env = process.env) {
	return path.resolve(env.PANDORHA_PROJECT_ROOT || defaultProjectRoot);
}

export function resolveTargetFile(projectRoot, filePath) {
	if (typeof filePath !== "string" || !filePath.trim()) {
		throw new Error("file_path must be a non-empty string");
	}

	const root = path.resolve(projectRoot);
	const absolutePath = path.isAbsolute(filePath)
		? path.resolve(filePath)
		: path.resolve(root, filePath);
	const relativePath = path.relative(root, absolutePath);

	if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
		throw new Error("file_path must stay inside PANDORHA_PROJECT_ROOT");
	}

	const extension = path.extname(absolutePath).toLowerCase();
	if (!ALLOWED_EXTENSIONS.has(extension)) {
		throw new Error("file_path must point to a .svelte or .ts file");
	}

	return {
		absolutePath,
		relativePath: toPosix(relativePath),
	};
}

export async function validateImplementation(input, options = {}) {
	const projectRoot = path.resolve(options.projectRoot || resolveProjectRoot());
	const target = resolveTargetFile(projectRoot, input.file_path);
	const source = await fs.readFile(target.absolutePath, "utf8");

	return analyzeSource(source, target.relativePath);
}

export function analyzeSource(source, relativePath) {
	const lines = source.split(/\r?\n/);
	const currentFeature = findFeatureName(relativePath);
	const runes = findRunes(lines);
	const violations = [
		...findFsdImportViolations(lines, relativePath, currentFeature),
		...findTailwindDefaultColorViolations(lines),
	];

	return {
		is_valid: violations.length === 0,
		file: relativePath,
		checks: {
			svelte_runes: {
				uses_state: runes.state.length > 0,
				uses_derived: runes.derived.length > 0,
				uses_effect: runes.effect.length > 0,
				occurrences: runes,
			},
			feature: currentFeature,
		},
		violations,
	};
}

export function findRunes(lines) {
	const result = {
		state: [],
		derived: [],
		effect: [],
	};

	lines.forEach((line, index) => {
		for (const match of line.matchAll(RUNE_PATTERN)) {
			result[match[1]].push({
				line: index + 1,
				match: match[0],
			});
		}
	});

	return result;
}

export function findFsdImportViolations(lines, relativePath, currentFeature) {
	const violations = [];

	lines.forEach((line, index) => {
		for (const match of line.matchAll(IMPORT_PATTERN)) {
			const specifier = match[1] || match[2];
			const resolved = resolveFeatureImport(specifier, relativePath);
			if (!resolved?.feature || !resolved.privateSegment) continue;
			if (currentFeature && resolved.feature === currentFeature) continue;

			violations.push({
				type: "fsd-private-import",
				severity: "error",
				line: index + 1,
				match: specifier,
				message: `Import direto da pasta privada "${resolved.privateSegment}" de outra feature: ${resolved.feature}. Use a API publica da feature.`,
			});
		}
	});

	return violations;
}

export function findTailwindDefaultColorViolations(lines) {
	const violations = [];

	lines.forEach((line, index) => {
		for (const match of line.matchAll(TAILWIND_PATTERN)) {
			violations.push({
				type: "tailwind-default-color",
				severity: "warning",
				line: index + 1,
				match: match[1],
				message:
					"Cor padrao do Tailwind detectada. Use tokens definidos no styleguide.md.",
			});
		}
	});

	return violations;
}

export function resolveFeatureImport(specifier, importerRelativePath) {
	const normalized = normalizeSpecifier(specifier, importerRelativePath);
	if (!normalized) return null;

	const parts = normalized.split("/").filter(Boolean);
	const srcIndex = parts.findIndex(
		(part, index) => part === "src" && parts[index + 1] === "features",
	);
	if (srcIndex === -1) return null;

	const feature = parts[srcIndex + 2];
	if (!feature) return null;

	const rest = parts.slice(srcIndex + 3);
	const privateSegment = rest.find((segment) =>
		FEATURE_PRIVATE_SEGMENTS.has(stripExtension(segment)),
	);

	return {
		feature,
		privateSegment: privateSegment ? stripExtension(privateSegment) : null,
		normalized,
	};
}

export function normalizeSpecifier(specifier, importerRelativePath) {
	if (specifier.startsWith("@/features/")) {
		return `src/features/${specifier.slice("@/features/".length)}`;
	}

	if (specifier.startsWith("$lib/features/")) {
		return `src/features/${specifier.slice("$lib/features/".length)}`;
	}

	if (specifier.startsWith("src/features/")) {
		return specifier;
	}

	if (specifier.startsWith("/src/features/")) {
		return specifier.slice(1);
	}

	if (specifier.startsWith(".")) {
		const importerDir = path.posix.dirname(toPosix(importerRelativePath));
		return path.posix.normalize(path.posix.join(importerDir, specifier));
	}

	return null;
}

export function findFeatureName(relativePath) {
	const parts = toPosix(relativePath).split("/");
	const srcIndex = parts.findIndex(
		(part, index) => part === "src" && parts[index + 1] === "features",
	);
	return srcIndex === -1 ? null : parts[srcIndex + 2] || null;
}

function stripExtension(value) {
	return value.replace(/\.(?:svelte|ts|js|mjs|cjs)$/, "");
}

function toPosix(value) {
	return value.split(path.sep).join("/");
}

/* node:coverage disable */
function jsonText(value) {
	return {
		content: [
			{
				type: "text",
				text: JSON.stringify(value, null, 2),
			},
		],
	};
}

export function createServer(projectRoot = resolveProjectRoot()) {
	const server = new McpServer({
		name: "pandorha-arch-guard",
		version: "0.1.0",
	});

	server.tool(
		"validate_implementation",
		{
			file_path: z
				.string()
				.min(1)
				.describe(
					"Arquivo .svelte ou .ts a validar dentro do projeto Pandorha.",
				),
		},
		async (input) =>
			jsonText(await validateImplementation(input, { projectRoot })),
	);

	return server;
}

export async function main() {
	const transport = new StdioServerTransport();
	await createServer().connect(transport);
}

const isCliEntrypoint =
	process.argv[1] &&
	pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isCliEntrypoint) {
	main().catch((error) => {
		console.error("pandorha-arch-guard failed to start", error);
		process.exit(1);
	});
}
/* node:coverage enable */
