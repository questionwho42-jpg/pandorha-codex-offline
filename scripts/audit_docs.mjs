import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const supportedFormats = new Set(["json", "markdown"]);
const supportedScopes = new Set([
	"all",
	"architecture",
	"process",
	"system",
	"user",
	"conventions",
]);
const ignoredDirectoryNames = new Set([
	".git",
	"coverage",
	"dist",
	"node_modules",
	"output",
]);
const knownFileExtensions = new Set([
	".json",
	".md",
	".mjs",
	".py",
	".svelte",
	".ts",
	".txt",
]);
const rootEntrypoints = new Set([
	"AGENTS.md",
	"llms.txt",
	"docs/adr/README.md",
	"docs/changelog.md",
	"docs/process/change-inbox.md",
	"docs/process/task-ledger.md",
]);

const options = parseArgs(process.argv.slice(2));
const auditResult = await auditDocumentation(options);
const rendered =
	options.format === "json"
		? `${JSON.stringify(auditResult, null, 2)}\n`
		: renderMarkdownReport(auditResult);

if (options.output) {
	const outputPath = resolveRepoPath(options.output);
	assertInsideRoot(outputPath, "output");
	await mkdir(path.dirname(outputPath), { recursive: true });
	await writeFile(outputPath, rendered, "utf8");
} else {
	process.stdout.write(rendered);
}

export async function auditDocumentation({
	format = "markdown",
	scope = "all",
	root = repoRoot,
} = {}) {
	const startedAt = new Date().toISOString();
	const markdownFiles = await collectMarkdownFiles(root, scope);
	const allScannedFiles = markdownFiles.map((filePath) =>
		toRepoPath(root, filePath),
	);
	const fileRecords = await Promise.all(
		markdownFiles.map((filePath) => readMarkdownRecord(root, filePath)),
	);
	const links = [];
	const missingLinks = [];
	const missingPathReferences = [];
	const inboundLinks = new Map();

	for (const record of fileRecords) {
		for (const link of extractMarkdownLinks(record.content)) {
			const resolved = resolveDocumentationTarget(
				root,
				record.path,
				link.target,
			);
			if (!resolved.shouldCheck) {
				continue;
			}

			const normalizedTarget = toRepoPath(root, resolved.path);
			links.push({
				source: record.relativePath,
				line: link.line,
				target: link.target,
				resolvedPath: normalizedTarget,
			});

			if (existsSync(resolved.path)) {
				inboundLinks.set(normalizedTarget, [
					...(inboundLinks.get(normalizedTarget) ?? []),
					record.relativePath,
				]);
			} else {
				missingLinks.push({
					source: record.relativePath,
					line: link.line,
					target: link.target,
					resolvedPath: normalizedTarget,
				});
			}
		}

		for (const reference of extractPathReferences(record.content)) {
			const resolved = resolvePathReference(root, record.path, reference.value);
			if (!resolved.shouldCheck || existsSync(resolved.path)) {
				continue;
			}

			missingPathReferences.push({
				source: record.relativePath,
				line: reference.line,
				reference: reference.value,
				resolvedPath: toRepoPath(root, resolved.path),
			});
		}
	}

	const areas = summarizeAreas(fileRecords);
	const missingH1 = fileRecords
		.filter((record) => !record.hasH1)
		.map((record) => record.relativePath);
	const potentialOrphans = fileRecords
		.map((record) => record.relativePath)
		.filter((relativePath) => isPotentialOrphan(relativePath, inboundLinks));
	const inbox = await analyzeChangeInbox(root);
	const contracts = await analyzeContracts(root);

	return {
		startedAt,
		format,
		scope,
		root: toRepoPath(path.dirname(root), root),
		summary: {
			scannedMarkdownFiles: fileRecords.length,
			areas,
			missingH1Count: missingH1.length,
			missingLinkCount: missingLinks.length,
			missingPathReferenceCount: missingPathReferences.length,
			potentialOrphanCount: potentialOrphans.length,
			openPromotionCount: inbox.openEntries.length,
		},
		files: allScannedFiles,
		findings: {
			missingH1,
			missingLinks,
			missingPathReferences,
			potentialOrphans,
			contractWarnings: contracts.warnings,
			contractErrors: contracts.errors,
		},
		promotionInbox: inbox,
	};
}

function parseArgs(args) {
	const parsed = {
		format: "markdown",
		scope: "all",
		root: repoRoot,
		output: null,
	};

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		const nextValue = args[index + 1];

		if (arg === "--format") {
			parsed.format = readRequiredValue(arg, nextValue);
			index += 1;
			continue;
		}
		if (arg.startsWith("--format=")) {
			parsed.format = arg.slice("--format=".length);
			continue;
		}
		if (arg === "--scope") {
			parsed.scope = readRequiredValue(arg, nextValue);
			index += 1;
			continue;
		}
		if (arg.startsWith("--scope=")) {
			parsed.scope = arg.slice("--scope=".length);
			continue;
		}
		if (arg === "--root") {
			parsed.root = path.resolve(readRequiredValue(arg, nextValue));
			index += 1;
			continue;
		}
		if (arg.startsWith("--root=")) {
			parsed.root = path.resolve(arg.slice("--root=".length));
			continue;
		}
		if (arg === "--output") {
			parsed.output = readRequiredValue(arg, nextValue);
			index += 1;
			continue;
		}
		if (arg.startsWith("--output=")) {
			parsed.output = arg.slice("--output=".length);
			continue;
		}

		throw new Error(`Unsupported argument: ${arg}`);
	}

	if (!supportedFormats.has(parsed.format)) {
		throw new Error(`Unsupported --format value: ${parsed.format}`);
	}
	if (!supportedScopes.has(parsed.scope)) {
		throw new Error(`Unsupported --scope value: ${parsed.scope}`);
	}

	return parsed;
}

function readRequiredValue(flag, value) {
	if (!value || value.startsWith("--")) {
		throw new Error(`Missing value for ${flag}`);
	}
	return value;
}

async function collectMarkdownFiles(root, scope) {
	const candidates =
		scope === "all"
			? [
					path.join(root, "AGENTS.md"),
					path.join(root, "llms.txt"),
					path.join(root, "docs"),
				]
			: getScopeDirectories(root, scope);
	const files = [];

	for (const candidate of candidates) {
		if (!existsSync(candidate)) {
			continue;
		}

		const candidateStat = await stat(candidate);
		if (candidateStat.isFile()) {
			if (isMarkdownLike(candidate)) {
				files.push(candidate);
			}
			continue;
		}

		files.push(...(await walkMarkdownFiles(candidate)));
	}

	return [...new Set(files)].sort((left, right) =>
		toRepoPath(root, left).localeCompare(toRepoPath(root, right)),
	);
}

function getScopeDirectories(root, scope) {
	if (scope === "architecture") {
		return [path.join(root, "docs", "architecture")];
	}
	if (scope === "process") {
		return [
			path.join(root, "docs", "process"),
			path.join(root, "docs", "changelog.md"),
		];
	}
	if (scope === "system") {
		return [path.join(root, "docs", "system")];
	}
	if (scope === "user") {
		return [
			path.join(root, "docs", "user"),
			path.join(root, "docs", "ferramentas do usuario"),
		];
	}
	if (scope === "conventions") {
		return [path.join(root, "docs", "conventions")];
	}
	return [path.join(root, "docs")];
}

async function walkMarkdownFiles(startPath) {
	const entries = await readdir(startPath, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		if (ignoredDirectoryNames.has(entry.name)) {
			continue;
		}

		const fullPath = path.join(startPath, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walkMarkdownFiles(fullPath)));
			continue;
		}

		if (entry.isFile() && isMarkdownLike(fullPath)) {
			files.push(fullPath);
		}
	}

	return files;
}

function isMarkdownLike(filePath) {
	return [".md", ".txt"].includes(path.extname(filePath).toLowerCase());
}

async function readMarkdownRecord(root, filePath) {
	const content = await readFile(filePath, "utf8");
	return {
		path: filePath,
		relativePath: toRepoPath(root, filePath),
		content,
		hasH1: /^#\s+\S/m.test(content),
	};
}

function extractMarkdownLinks(content) {
	const links = [];
	const linkPattern = /!?\[[^\]]*]\(([^)]+)\)/g;
	const lines = content.split(/\r?\n/);

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
		const line = lines[lineIndex];
		for (const match of line.matchAll(linkPattern)) {
			links.push({
				line: lineIndex + 1,
				target: normalizeLinkTarget(match[1]),
			});
		}
	}

	return links;
}

function normalizeLinkTarget(rawTarget) {
	let target = rawTarget.trim();
	if (target.startsWith("<") && target.endsWith(">")) {
		target = target.slice(1, -1);
	}

	const titleStart = target.search(/\s+["']/);
	if (titleStart !== -1) {
		target = target.slice(0, titleStart);
	}

	return safeDecodeUri(target);
}

function resolveDocumentationTarget(root, sourcePath, rawTarget) {
	if (shouldIgnoreTarget(rawTarget)) {
		return { shouldCheck: false, path: rawTarget };
	}

	const withoutAnchor = rawTarget.split("#")[0];
	if (!withoutAnchor) {
		return { shouldCheck: false, path: rawTarget };
	}

	const resolvedPath = withoutAnchor.startsWith("/")
		? path.join(root, withoutAnchor)
		: path.resolve(path.dirname(sourcePath), withoutAnchor);

	return { shouldCheck: true, path: resolvedPath };
}

function shouldIgnoreTarget(target) {
	return (
		target.startsWith("#") ||
		/^[a-z][a-z0-9+.-]*:/i.test(target) ||
		target.startsWith("app://")
	);
}

function extractPathReferences(content) {
	const references = [];
	const lines = content.split(/\r?\n/);

	for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
		const line = lines[lineIndex];
		for (const match of line.matchAll(/`([^`]+)`/g)) {
			const value = normalizePathReference(match[1]);
			if (isPathReferenceCandidate(value)) {
				references.push({ line: lineIndex + 1, value });
			}
		}
	}

	return references;
}

function normalizePathReference(value) {
	return value.trim().replace(/^[([<{]+|[)\]>.,:;]+$/g, "");
}

function isPathReferenceCandidate(value) {
	if (
		!value ||
		value.includes("\n") ||
		value.includes("$") ||
		value.includes("<") ||
		value.includes(">") ||
		value.includes("*") ||
		/^[a-z][a-z0-9+.-]*:/i.test(value)
	) {
		return false;
	}

	const normalized = value.replaceAll("\\", "/");
	const hasKnownRoot =
		/^(AGENTS\.md|llms\.txt|docs\/|src\/|scripts\/|\.agents\/|mcp\/)/.test(
			normalized,
		);
	const extension = path.extname(normalized).toLowerCase();
	const hasKnownExtension = knownFileExtensions.has(extension);
	const looksLikeCommand =
		/\s/.test(normalized) && !normalized.startsWith("docs/");

	return !looksLikeCommand && (hasKnownRoot || hasKnownExtension);
}

function resolvePathReference(root, sourcePath, reference) {
	const normalized = reference.replaceAll("\\", "/");
	if (shouldIgnoreTarget(normalized)) {
		return { shouldCheck: false, path: normalized };
	}
	if (normalized.startsWith("./") || normalized.startsWith("../")) {
		return {
			shouldCheck: true,
			path: path.resolve(path.dirname(sourcePath), normalized),
		};
	}
	if (normalized.startsWith("/")) {
		return { shouldCheck: true, path: path.join(root, normalized) };
	}
	return { shouldCheck: true, path: path.resolve(root, normalized) };
}

function summarizeAreas(fileRecords) {
	const areas = {};
	for (const record of fileRecords) {
		const area = getArea(record.relativePath);
		areas[area] = (areas[area] ?? 0) + 1;
	}
	return Object.fromEntries(
		Object.entries(areas).sort(([left], [right]) => left.localeCompare(right)),
	);
}

function getArea(relativePath) {
	const normalized = relativePath.replaceAll("\\", "/");
	if (normalized === "AGENTS.md" || normalized === "llms.txt") {
		return "root";
	}
	if (normalized === "docs/changelog.md") {
		return "process";
	}
	if (normalized.startsWith("docs/architecture/")) {
		return "architecture";
	}
	if (normalized.startsWith("docs/conventions/")) {
		return "conventions";
	}
	if (normalized.startsWith("docs/process/")) {
		return "process";
	}
	if (normalized.startsWith("docs/system/")) {
		return "system";
	}
	if (
		normalized.startsWith("docs/user/") ||
		normalized.startsWith("docs/ferramentas do usuario/")
	) {
		return "user";
	}
	if (normalized.startsWith("docs/adr/")) {
		return "adr";
	}
	return "docs-root";
}

function isPotentialOrphan(relativePath, inboundLinks) {
	if (rootEntrypoints.has(relativePath)) {
		return false;
	}
	if (relativePath.startsWith("docs/process/task-ledger.md")) {
		return false;
	}
	if (relativePath.startsWith("docs/process/change-inbox.md")) {
		return false;
	}
	return !inboundLinks.has(relativePath);
}

async function analyzeChangeInbox(root) {
	const inboxPath = path.join(root, "docs", "process", "change-inbox.md");
	if (!existsSync(inboxPath)) {
		return {
			openEntries: [],
			classificationCounts: {},
			warnings: ["docs/process/change-inbox.md not found"],
		};
	}

	const content = await readFile(inboxPath, "utf8");
	const openSection = extractMarkedSection(content, "pandorha-inbox:open");
	const entries = [
		...openSection.matchAll(/###\s+(.+?)\r?\n([\s\S]*?)(?=\r?\n###\s+|$)/g),
	].map((match) => {
		const title = match[1].trim();
		const body = match[2];
		const id = readRecordField(body, "id");
		const summary = readRecordField(body, "summary");
		const expectedPromotion = readRecordField(body, "expected_promotion");
		const classification = classifyPromotionEntry({ title, summary });
		return {
			id,
			title,
			summary,
			expectedPromotion,
			recommendedDestination: classification.destination,
			reason: classification.reason,
		};
	});

	const classificationCounts = entries.reduce((counts, entry) => {
		counts[entry.recommendedDestination] =
			(counts[entry.recommendedDestination] ?? 0) + 1;
		return counts;
	}, {});

	return {
		openEntries: entries,
		classificationCounts: Object.fromEntries(
			Object.entries(classificationCounts).sort(([left], [right]) =>
				left.localeCompare(right),
			),
		),
		warnings: [],
	};
}

function extractMarkedSection(content, marker) {
	const start = `<!-- ${marker} -->`;
	const end = `<!-- /${marker} -->`;
	const startIndex = content.indexOf(start);
	const endIndex = content.indexOf(end);
	if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
		return "";
	}
	return content.slice(startIndex + start.length, endIndex);
}

function readRecordField(body, field) {
	const pattern = new RegExp(`^- ${field}: (.*)$`, "m");
	return pattern.exec(body)?.[1]?.trim() ?? "";
}

function classifyPromotionEntry({ title, summary }) {
	const text = `${title} ${summary}`.toLowerCase();
	if (
		matchesAny(text, [
			"automation",
			"auditoria",
			"audit",
			"gate",
			"handoff",
			"qa",
			"quality",
			"roadmap",
			"snapshot",
			"task",
			"teste",
		])
	) {
		return {
			destination: "processo",
			reason:
				"A entrada descreve fluxo de entrega, validação, auditoria ou manutenção.",
		};
	}
	if (
		matchesAny(text, [
			"governanca",
			"governance",
			"idioma",
			"intake",
			"language",
			"planning",
			"skill",
			"tooling",
		])
	) {
		return {
			destination: "convenções",
			reason:
				"A entrada altera regras de trabalho para agentes, skills ou uso de ferramentas.",
		};
	}
	if (
		matchesAny(text, [
			"browser",
			"guia",
			"list",
			"read-only ui",
			"tela",
			"ui",
			"user",
			"usuário",
		])
	) {
		return {
			destination: "usuário",
			reason:
				"A entrada afeta fluxo visível, guia de teste ou documentação de uso.",
		};
	}
	if (
		matchesAny(text, [
			"drizzle",
			"migration",
			"opfs",
			"persist",
			"repository",
			"rpc",
			"save",
			"schema",
			"sqlite",
			"worker",
		])
	) {
		return {
			destination: "arquitetura",
			reason:
				"A entrada afeta contrato técnico, persistência, schema ou ponte RPC.",
		};
	}
	if (
		matchesAny(text, [
			"character",
			"combat",
			"damage",
			"dice",
			"equipment",
			"faction",
			"hexcrawl",
			"inventory",
			"magic",
			"npc",
			"social",
			"spell",
			"worldstate",
		])
	) {
		return {
			destination: "sistema",
			reason:
				"A entrada toca mecânica de RPG e deve ser cruzada com docs/system antes de promoção.",
		};
	}
	return {
		destination: "não promover ainda",
		reason:
			"A entrada precisa de revisão humana ou evidência adicional antes de virar documentação oficial.",
	};
}

function matchesAny(text, keywords) {
	return keywords.some((keyword) => matchesKeyword(text, keyword));
}

function matchesKeyword(text, keyword) {
	if (keyword.length <= 3) {
		const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		return new RegExp(`(^|[^a-z0-9])${escapedKeyword}([^a-z0-9]|$)`).test(text);
	}

	return text.includes(keyword);
}

async function analyzeContracts(root) {
	const warnings = [];
	const errors = [];
	const packagePath = path.join(root, "package.json");
	const expectedFiles = [
		"AGENTS.md",
		"llms.txt",
		"docs/architecture/blueprint.md",
		"docs/architecture/gdd.md",
		"docs/architecture/sdd.md",
		"docs/conventions/core-conventions.md",
		"docs/conventions/styleguide.md",
		"docs/process/automation-spec.md",
		"docs/process/change-inbox.md",
		"docs/process/task-ledger.md",
	];

	for (const relativePath of expectedFiles) {
		if (!existsSync(path.join(root, relativePath))) {
			errors.push(`Fonte esperada ausente: ${relativePath}`);
		}
	}

	if (existsSync(packagePath)) {
		const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
		for (const scriptName of [
			"lint",
			"test",
			"quality:automation",
			"automation:doctor",
		]) {
			if (!packageJson.scripts?.[scriptName]) {
				warnings.push(`Script esperado ausente em package.json: ${scriptName}`);
			}
		}
		if (!packageJson.scripts?.["docs:audit"]) {
			warnings.push("Script docs:audit ainda não registrado em package.json.");
		}
	}

	return { warnings, errors };
}

function renderMarkdownReport(result) {
	const lines = [
		"# Auditoria De Documentação Do Pandorha Engine",
		"",
		`Gerado em: ${result.startedAt}`,
		`Escopo: \`${result.scope}\``,
		"",
		"## Resumo",
		"",
		`- Arquivos Markdown analisados: ${result.summary.scannedMarkdownFiles}`,
		`- Documentos sem H1: ${result.summary.missingH1Count}`,
		`- Links locais quebrados: ${result.summary.missingLinkCount}`,
		`- Referências de caminho ausentes: ${result.summary.missingPathReferenceCount}`,
		`- Possíveis órfãos: ${result.summary.potentialOrphanCount}`,
		`- Entradas abertas de promoção: ${result.summary.openPromotionCount}`,
		"",
		"## Inventário Por Área",
		"",
		"| Área | Arquivos |",
		"| :--- | ---: |",
		...Object.entries(result.summary.areas).map(
			([area, count]) => `| ${area} | ${count} |`,
		),
		"",
		"## Problemas Estruturais",
		"",
		renderList("Documentos sem H1", result.findings.missingH1),
		renderObjectList(
			"Links locais quebrados",
			result.findings.missingLinks,
			(item) => `${item.source}:${item.line} -> ${item.target}`,
		),
		renderObjectList(
			"Referências de caminho ausentes",
			result.findings.missingPathReferences,
			(item) => `${item.source}:${item.line} -> ${item.reference}`,
		),
		renderList("Possíveis documentos órfãos", result.findings.potentialOrphans),
		"## Contratos Do Projeto",
		"",
		renderList("Erros", result.findings.contractErrors),
		renderList("Avisos", result.findings.contractWarnings),
		"## Classificação Do Change Inbox",
		"",
		"| Destino recomendado | Entradas |",
		"| :--- | ---: |",
		...Object.entries(result.promotionInbox.classificationCounts).map(
			([destination, count]) => `| ${destination} | ${count} |`,
		),
		"",
		"### Entradas Abertas",
		"",
		"| ID | Título | Destino | Motivo |",
		"| :--- | :--- | :--- | :--- |",
		...result.promotionInbox.openEntries.map(
			(entry) =>
				`| ${escapeTable(entry.id)} | ${escapeTable(entry.title)} | ${escapeTable(entry.recommendedDestination)} | ${escapeTable(entry.reason)} |`,
		),
		"",
		"## Regras De Promoção",
		"",
		"- Não mover entradas para `Promoted` fora da branch `main` sem aprovação explícita.",
		"- Não alterar `docs/system/` por inferência do código; regras de RPG continuam soberanas.",
		"- Usar este relatório como triagem. A promoção oficial exige revisão humana ou evidência de merge.",
		"",
	];

	return lines.join("\n");
}

function renderList(title, items) {
	if (items.length === 0) {
		return `### ${title}\n\n- Nenhum.\n`;
	}
	return `### ${title}\n\n${items.map((item) => `- \`${item}\``).join("\n")}\n`;
}

function renderObjectList(title, items, renderItem) {
	if (items.length === 0) {
		return `### ${title}\n\n- Nenhum.\n`;
	}
	return `### ${title}\n\n${items.map((item) => `- \`${renderItem(item)}\``).join("\n")}\n`;
}

function escapeTable(value) {
	return String(value || "")
		.replaceAll("|", "\\|")
		.replaceAll("\n", " ");
}

function resolveRepoPath(inputPath) {
	return path.isAbsolute(inputPath)
		? path.resolve(inputPath)
		: path.resolve(repoRoot, inputPath);
}

function assertInsideRoot(targetPath, label) {
	const relative = path.relative(repoRoot, targetPath);
	if (relative.startsWith("..") || path.isAbsolute(relative)) {
		throw new Error(
			`Refusing to write ${label} outside repository: ${targetPath}`,
		);
	}
}

function safeDecodeUri(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

function toRepoPath(root, filePath) {
	return path.relative(root, filePath).replaceAll("\\", "/");
}

export function getScriptUrl() {
	return pathToFileURL(fileURLToPath(import.meta.url)).href;
}
