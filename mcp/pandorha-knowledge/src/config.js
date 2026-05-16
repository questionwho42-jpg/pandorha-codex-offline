import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(sourceDir, "..");
const defaultProjectRoot = path.resolve(packageRoot, "..", "..");

export function resolveConfig(env = process.env) {
	const projectRoot = path.resolve(
		env.PANDORHA_PROJECT_ROOT || defaultProjectRoot,
	);
	const roots = parseRoots(env.PANDORHA_KNOWLEDGE_ROOTS, projectRoot);

	return {
		packageRoot,
		projectRoot,
		roots,
		maxSegmentChars: Number(env.PANDORHA_KNOWLEDGE_MAX_SEGMENT_CHARS || 2800),
		maxSnippetChars: Number(env.PANDORHA_KNOWLEDGE_MAX_SNIPPET_CHARS || 1400),
	};
}

function parseRoots(rawRoots, projectRoot) {
	if (!rawRoots) {
		return [path.join(projectRoot, "docs"), path.join(projectRoot, "lore")];
	}

	return rawRoots
		.split(path.delimiter)
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((entry) => path.resolve(projectRoot, entry));
}
