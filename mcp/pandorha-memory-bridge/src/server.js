#!/usr/bin/env node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(sourceDir, "..");
const defaultProjectRoot = path.resolve(packageRoot, "..", "..");

const FILES = {
  tech: "tech-memory.md",
  scaling: "scaling-roadmap.md",
  plain: "plain-english.md"
};

export function resolveProjectRoot(env = process.env) {
  return path.resolve(env.PANDORHA_PROJECT_ROOT || defaultProjectRoot);
}

export function normalizeModuleName(moduleName) {
  if (typeof moduleName !== "string") {
    throw new Error("module_name must be a string");
  }

  const raw = moduleName.trim();
  if (!raw) {
    throw new Error("module_name cannot be empty");
  }

  if (path.isAbsolute(raw) || raw.includes("..") || /[\\/]/.test(raw)) {
    throw new Error("module_name must be a feature name, not a path");
  }

  const slug = raw
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  if (!slug) {
    throw new Error("module_name must contain letters or numbers");
  }

  return slug;
}

export function resolveContextDir(projectRoot, moduleName) {
  const moduleSlug = normalizeModuleName(moduleName);
  const featuresRoot = path.join(path.resolve(projectRoot), "src", "features");
  const contextDir = path.join(featuresRoot, moduleSlug, ".context");
  const relative = path.relative(featuresRoot, contextDir);

  /* node:coverage disable */
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("resolved context directory escaped src/features");
  }
  /* node:coverage enable */

  return {
    moduleSlug,
    featuresRoot,
    contextDir
  };
}

export async function commitModuleContext(input, options = {}) {
  const projectRoot = path.resolve(options.projectRoot || resolveProjectRoot());
  const now = options.now || new Date();
  const timestamp = now.toISOString();
  const { moduleSlug, contextDir } = resolveContextDir(projectRoot, input.module_name);

  await fs.mkdir(contextDir, { recursive: true });

  const entries = [
    {
      file: FILES.tech,
      title: "Technical Memory",
      body: renderTechMemoryEntry(timestamp, input)
    },
    {
      file: FILES.scaling,
      title: "Scaling Roadmap",
      body: renderScalingRoadmapEntry(timestamp, input)
    },
    {
      file: FILES.plain,
      title: "Plain English",
      body: renderPlainEnglishEntry(timestamp, input)
    }
  ];

  const touched = [];

  for (const entry of entries) {
    const filePath = path.join(contextDir, entry.file);
    const operation = await appendMemoryEntry(filePath, entry.title, entry.body);
    touched.push({
      file: toPosix(path.relative(projectRoot, filePath)),
      operation
    });
  }

  return {
    module: moduleSlug,
    contextDir: toPosix(path.relative(projectRoot, contextDir)),
    timestamp,
    files: touched
  };
}

export async function appendMemoryEntry(filePath, title, entryBody) {
  const current = await readOptionalText(filePath);
  const created = current === null;
  const header = `# ${title}\n`;
  const base = created ? header : ensureHeader(current, title);
  const next = `${base.trimEnd()}\n\n${entryBody.trim()}\n`;

  await writeFileAtomic(filePath, next);
  return created ? "created" : "updated";
}

export function renderTechMemoryEntry(timestamp, input) {
  return [
    `## ${timestamp}`,
    "",
    "### Error Log",
    safeBlock(input.error_log),
    "",
    "### Technical Summary",
    safeBlock(input.technical_summary),
    "",
    "### Patterns And Decisions",
    "- Keep implementation details tied to local module boundaries.",
    "- Preserve previous entries and append new findings instead of overwriting memory."
  ].join("\n");
}

export function renderScalingRoadmapEntry(timestamp, input) {
  const scalingNotes = input.scaling_notes || [
    "Review this module when repeated edits expose stable extension points.",
    "Promote repeated manual steps into scripts, skills, or MCP tools.",
    "Track performance, schema, and API risks before expanding the feature."
  ].join("\n");

  return [
    `## ${timestamp}`,
    "",
    "### Scaling Notes",
    safeBlock(scalingNotes),
    "",
    "### Follow-Up",
    "- Revisit after the next feature change or failed validation run.",
    "- Convert durable lessons into tests or automation where practical."
  ].join("\n");
}

export function renderPlainEnglishEntry(timestamp, input) {
  return [
    `## ${timestamp}`,
    "",
    "### What This Module Does",
    safeBlock(input.plain_english),
    "",
    "### Alternatives",
    "- Keep notes manually: lower setup cost, higher chance of drift.",
    "- Store notes centrally: easier search, weaker module ownership.",
    "- Use this bridge: consistent local memory with controlled write scope."
  ].join("\n");
}

export async function readOptionalText(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function ensureHeader(content, title) {
  if (content.trimStart().startsWith(`# ${title}`)) {
    return content;
  }

  return `# ${title}\n\n${content.trim()}`;
}

async function writeFileAtomic(filePath, content) {
  const tmpPath = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
  await fs.writeFile(tmpPath, content, "utf8");
  await fs.rename(tmpPath, filePath);
}

function safeBlock(value) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || "- No details provided.";
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
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}

export function createServer(projectRoot = resolveProjectRoot()) {
  const server = new McpServer({
    name: "pandorha-memory-bridge",
    version: "0.1.0"
  });

  server.tool(
    "commit_module_context",
    {
      module_name: z.string().min(1).describe("Feature/module name under src/features."),
      error_log: z.string().describe("Errors found and fixes applied."),
      technical_summary: z.string().describe("Technical decisions, APIs, and conventions."),
      plain_english: z.string().describe("Plain-language explanation for non-technical readers."),
      scaling_notes: z.string().optional().describe("Optional scalability notes and future work.")
    },
    async (input) => jsonText(await commitModuleContext(input, { projectRoot }))
  );

  return server;
}

export async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

const isCliEntrypoint = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isCliEntrypoint) {
  main().catch((error) => {
    console.error("pandorha-memory-bridge failed to start", error);
    process.exit(1);
  });
}
/* node:coverage enable */

export function createTempProjectRoot(prefix = "pandorha-memory-bridge-") {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}
