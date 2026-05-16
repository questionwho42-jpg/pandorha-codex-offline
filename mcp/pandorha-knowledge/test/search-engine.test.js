import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { readUtf8File, walkMarkdownFiles } from "../src/file-system.js";
import { buildMarkdownSegments } from "../src/markdown-segments.js";
import {
	createSearchEngine,
	loadKnowledgeIndex,
} from "../src/search-engine.js";

const projectRoot = path.resolve("C:/pandorha-test");
const filePath = path.join(
	projectRoot,
	"docs",
	"system",
	"combat",
	"damage.md",
);
const markdown = `---
sourceFile: "damage.md"
---

# Codex de Combate

<ai_context>

Texto introdutorio.

| Tipo | Regra |
| --- | --- |
| Dano Cortante | Aplica RD antes de afinidades. |

## Critico

20 natural dobra o dano final antes da reducao.
`;

test("buildMarkdownSegments extracts headings and tables", () => {
	const segments = buildMarkdownSegments(filePath, markdown, { projectRoot });
	const heading = segments.find(
		(segment) =>
			segment.kind === "heading" && segment.title === "Codex de Combate",
	);

	assert.ok(heading);
	assert.equal(heading.content.includes("<ai_context>"), false);
	assert.equal(
		segments.some((segment) => segment.content.includes("sourceFile")),
		false,
	);
	assert.ok(
		segments.some(
			(segment) =>
				segment.kind === "table" && segment.content.includes("Dano Cortante"),
		),
	);
});

test("searchRpgRule prioritizes table matches", () => {
	const segments = buildMarkdownSegments(filePath, markdown, { projectRoot });
	const engine = createSearchEngine(segments, {
		stats: {
			files: 1,
			segments: segments.length,
			roots: [path.join(projectRoot, "docs")],
		},
	});

	const result = engine.searchRpgRule("dano cortante", { limit: 1 });

	assert.equal(result.count, 1);
	assert.equal(result.matches[0].kind, "table");
	assert.match(result.matches[0].snippet, /Dano Cortante/);
});

test("golden rule queries find deterministic damage, character creation, and action fixtures", () => {
	const fixtures = [
		{
			relativePath: "docs/system/combat/18-tratado-de-dano.md",
			markdown: [
				"# Tratado de Dano",
				"",
				"## Dano Cortante",
				"",
				"Dano cortante aplica reducao de dano antes de afinidades.",
			].join("\n"),
		},
		{
			relativePath: "docs/system/survival/guia-criacao-de-ficha.md",
			markdown: [
				"# Guia de Criacao de Ficha",
				"",
				"A criacao de ficha distribui eixos e aplicacoes pela regra dos 6/6.",
			].join("\n"),
		},
		{
			relativePath: "docs/system/survival/00-mecanicas-fundamentais.md",
			markdown: [
				"# Mecanicas Fundamentais",
				"",
				"## Acoes",
				"",
				"Cada turno usa tres acoes para atacar, mover ou sustentar efeitos.",
			].join("\n"),
		},
	];
	const segments = fixtures.flatMap((fixture) =>
		buildMarkdownSegments(
			path.join(projectRoot, fixture.relativePath),
			fixture.markdown,
			{ projectRoot },
		),
	);
	const engine = createSearchEngine(segments);

	assert.equal(
		engine.searchRpgRule("dano cortante reducao", { limit: 1 }).matches[0].file,
		fixtures[0].relativePath,
	);
	assert.equal(
		engine.searchRpgRule("criacao ficha eixos", { limit: 1 }).matches[0].file,
		fixtures[1].relativePath,
	);
	assert.equal(
		engine.searchRpgRule("tres acoes turno", { limit: 1 }).matches[0].file,
		fixtures[2].relativePath,
	);
});

test("searchRpgRule handles empty terms without scanning", () => {
	const engine = createSearchEngine([]);
	const result = engine.searchRpgRule(" ", { limit: 3 });

	assert.equal(result.count, 0);
	assert.match(result.warning, /term must contain/);
});

test("walkMarkdownFiles reads markdown recursively and ignores missing roots", async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "pandorha-knowledge-"));
	const docs = path.join(root, "docs");
	const nested = path.join(docs, "nested");

	await fs.mkdir(nested, { recursive: true });
	await fs.writeFile(path.join(docs, "b.txt"), "ignore", "utf8");
	await fs.writeFile(path.join(nested, "a.md"), "# A", "utf8");

	const files = await walkMarkdownFiles([docs, path.join(root, "missing")]);

	assert.deepEqual(
		files.map((file) => path.basename(file)),
		["a.md"],
	);
	assert.equal(await readUtf8File(files[0]), "# A");
});

test("walkMarkdownFiles rethrows non-missing filesystem errors", async () => {
	const root = await fs.mkdtemp(
		path.join(os.tmpdir(), "pandorha-invalid-root-"),
	);
	const notDirectory = path.join(root, "file.md");

	await fs.writeFile(notDirectory, "# not a directory", "utf8");

	await assert.rejects(
		() => walkMarkdownFiles([notDirectory]),
		/ENOTDIR|not a directory|readdir/,
	);
});

test("loadKnowledgeIndex builds a searchable index from disk", async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "pandorha-index-"));
	const docs = path.join(root, "docs");

	await fs.mkdir(docs, { recursive: true });
	await fs.writeFile(
		path.join(docs, "rules.md"),
		[
			"# Regras de Acao",
			"",
			"Ação livre nao consome token principal.",
			"Ação de ataque consome um token.",
		].join("\n"),
		"utf8",
	);

	const engine = await loadKnowledgeIndex({
		roots: [docs],
		projectRoot: root,
		maxSegmentChars: 128,
		maxSnippetChars: 80,
	});
	const result = engine.searchRpgRule("acao livre");

	assert.equal(result.index.files, 1);
	assert.equal(result.index.segments > 0, true);
	assert.match(result.matches[0].snippet, /Ação liv/);
});

test("section snippets choose the strongest local line and clamp limits", () => {
	const segments = [
		{
			id: "section",
			kind: "section",
			filePath,
			relativePath: "docs/system/combat/damage.md",
			rootKind: "docs",
			lineStart: 10,
			title: "Manobras",
			headings: ["Manobras"],
			headingsText: "Manobras",
			content: [
				"Linha neutra.",
				"Outra linha.",
				"| coluna | valor |",
				"# marcador local",
				"Ação livre permite sacar item do cinto.",
				"Depois continua.",
			].join("\n"),
		},
	];

	const engine = createSearchEngine(segments, {
		maxSnippetChars: 60,
		stats: { files: 1, segments: 1, roots: [] },
	});
	const result = engine.searchRpgRule("acao livre", { limit: 99 });

	assert.equal(result.matches.length, 1);
	assert.match(result.matches[0].snippet, /Ação liv/);
	assert.equal(result.matches[0].snippet.endsWith("..."), true);
});

test("custom segment kinds use neutral priority", () => {
	const engine = createSearchEngine([
		{
			id: "note",
			kind: "note",
			filePath,
			relativePath: "lore/morden/note.md",
			rootKind: "lore",
			lineStart: 1,
			title: "Nota",
			headings: ["Nota"],
			headingsText: "Nota",
			content: "Favor impossivel em Morden.",
		},
	]);

	const result = engine.searchRpgRule("favor impossivel", { limit: 1 });

	assert.equal(result.matches[0].kind, "note");
});

test("searchRpgRule removes duplicate results from the same source line", () => {
	const shared = {
		filePath,
		relativePath: "docs/system/combat/damage.md",
		rootKind: "docs",
		lineStart: 1,
		title: "Dano",
		headings: ["Dano"],
		headingsText: "Dano",
	};
	const engine = createSearchEngine([
		{
			...shared,
			id: "heading",
			kind: "heading",
			content: "# Dano\nRegra de dano.",
		},
		{
			...shared,
			id: "section",
			kind: "section",
			content: "# Dano\nRegra de dano detalhada.",
		},
	]);

	const result = engine.searchRpgRule("dano", { limit: 5 });

	assert.equal(result.matches.length, 1);
	assert.equal(result.matches[0].kind, "heading");
});

test("short single-token searches reject substring-only fuzzy matches", () => {
	const engine = createSearchEngine([
		{
			id: "mundano",
			kind: "heading",
			filePath,
			relativePath: "docs/system/survival/enfermidades.md",
			rootKind: "docs",
			lineStart: 1,
			title: "Tier 1 Mundano",
			headings: ["Tier 1 Mundano"],
			headingsText: "Tier 1 Mundano",
			content: "#### Tier 1 Mundano",
		},
	]);

	const result = engine.searchRpgRule("dano", { limit: 5 });

	assert.equal(result.count, 0);
});

test("non-string terms are rejected without Fuse lookup", () => {
	const engine = createSearchEngine([]);
	const result = engine.searchRpgRule(null);

	assert.equal(result.count, 0);
	assert.equal(result.query, null);
});

test("large sections are split into bounded chunks", () => {
	const longParagraph = "x".repeat(300);
	const markdownWithLargeSection = [
		"# Longo",
		"",
		longParagraph,
		"",
		"paragrafo alvo",
		"",
		longParagraph,
	].join("\n");

	const segments = buildMarkdownSegments(filePath, markdownWithLargeSection, {
		projectRoot,
		maxSegmentChars: 80,
	});

	assert.ok(
		segments.filter((segment) => segment.kind === "section").length > 1,
	);
	assert.ok(segments.some((segment) => segment.content.length <= 80));
});
