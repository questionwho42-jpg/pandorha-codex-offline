import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import { test } from "node:test";
import path from "node:path";
import {
	appendMemoryEntry,
	auditModuleContext,
	commitModuleContext,
	createTempProjectRoot,
  normalizeContextLayer,
  normalizeModuleName,
  readOptionalText,
  renderPlainEnglishEntry,
  renderScalingRoadmapEntry,
  renderTechMemoryEntry,
  resolveContextDir,
  resolveProjectRoot
} from "../src/server.js";

const fixedDate = new Date("2026-05-01T12:00:00.000Z");

function sampleInput(overrides = {}) {
  return {
    module_name: "Combat Engine",
    error_log: "Falha de teste corrigida com parser deterministico.",
    technical_summary: "Service writes context files with atomic updates.",
    plain_english: "O modulo guarda memoria local sobre decisoes e erros.",
    ...overrides
  };
}

test("normalizeModuleName creates safe feature slugs", () => {
  assert.equal(normalizeModuleName("Combat Engine"), "combat-engine");
  assert.equal(normalizeModuleName("Módulo 3x3"), "modulo-3x3");
  assert.throws(() => normalizeModuleName("../evil"), /not a path/);
  assert.throws(() => normalizeModuleName(""), /empty/);
  assert.throws(() => normalizeModuleName("!!!"), /letters or numbers/);
  assert.throws(() => normalizeModuleName(42), /string/);
});

test("resolveContextDir stays under src/features", () => {
  const projectRoot = path.join(os.tmpdir(), "pandorha-project");
  const result = resolveContextDir(projectRoot, "Social Layer");

  assert.equal(result.moduleSlug, "social-layer");
  assert.equal(result.layer, "features");
  assert.equal(result.contextDir, path.join(projectRoot, "src", "features", "social-layer", ".context"));
});

test("resolveContextDir can target src/entities explicitly", () => {
  const projectRoot = path.join(os.tmpdir(), "pandorha-project");
  const result = resolveContextDir(projectRoot, "Ancestry", "entities");

  assert.equal(result.moduleSlug, "ancestry");
  assert.equal(result.layer, "entities");
  assert.equal(result.contextDir, path.join(projectRoot, "src", "entities", "ancestry", ".context"));
});

test("normalizeContextLayer defaults to features and rejects unsupported layers", () => {
  assert.equal(normalizeContextLayer(), "features");
  assert.equal(normalizeContextLayer("entities"), "entities");
  assert.throws(() => normalizeContextLayer("shared"), /features or entities/);
});

test("commitModuleContext creates the three context files", async () => {
  const projectRoot = await createTempProjectRoot();
  const result = await commitModuleContext(sampleInput(), { projectRoot, now: fixedDate });
  const contextDir = path.join(projectRoot, "src", "features", "combat-engine", ".context");

  assert.equal(result.module, "combat-engine");
  assert.equal(result.files.length, 3);
  assert.equal(result.files.every((file) => file.operation === "created"), true);

  const tech = await fs.readFile(path.join(contextDir, "tech-memory.md"), "utf8");
  const scaling = await fs.readFile(path.join(contextDir, "scaling-roadmap.md"), "utf8");
  const plain = await fs.readFile(path.join(contextDir, "plain-english.md"), "utf8");

  assert.match(tech, /Falha de teste/);
  assert.match(scaling, /Review this module/);
  assert.match(plain, /memoria local/);
});

test("commitModuleContext creates entity context files when layer is entities", async () => {
  const projectRoot = await createTempProjectRoot();
  const result = await commitModuleContext(sampleInput({ module_name: "Equipment", layer: "entities" }), {
    projectRoot,
    now: fixedDate
  });
  const contextDir = path.join(projectRoot, "src", "entities", "equipment", ".context");

  assert.equal(result.module, "equipment");
  assert.equal(result.contextDir, "src/entities/equipment/.context");
  assert.equal(result.files.length, 3);
  assert.match(await fs.readFile(path.join(contextDir, "tech-memory.md"), "utf8"), /Service writes context files/);
});

test("commitModuleContext appends without deleting previous entries", async () => {
  const projectRoot = await createTempProjectRoot();
  await commitModuleContext(sampleInput({ error_log: "Primeira entrada." }), { projectRoot, now: fixedDate });
  const result = await commitModuleContext(sampleInput({ error_log: "Segunda entrada." }), { projectRoot, now: fixedDate });

  const techPath = path.join(projectRoot, "src", "features", "combat-engine", ".context", "tech-memory.md");
  const tech = await fs.readFile(techPath, "utf8");

  assert.equal(result.files.every((file) => file.operation === "updated"), true);
  assert.match(tech, /Primeira entrada/);
  assert.match(tech, /Segunda entrada/);
});

test("commitModuleContext uses explicit scaling notes when provided", async () => {
  const projectRoot = await createTempProjectRoot();
  await commitModuleContext(sampleInput({ scaling_notes: "Criar cache por modulo." }), { projectRoot, now: fixedDate });

  const scaling = await fs.readFile(
    path.join(projectRoot, "src", "features", "combat-engine", ".context", "scaling-roadmap.md"),
    "utf8"
  );

  assert.match(scaling, /Criar cache por modulo/);
});

test("appendMemoryEntry adds a header to legacy files", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "pandorha-memory-legacy-"));
  const filePath = path.join(dir, "tech-memory.md");

  await fs.writeFile(filePath, "legacy entry", "utf8");
  const operation = await appendMemoryEntry(filePath, "Technical Memory", "## New\nbody");
  const content = await fs.readFile(filePath, "utf8");

  assert.equal(operation, "updated");
  assert.match(content, /^# Technical Memory/);
  assert.match(content, /legacy entry/);
  assert.match(content, /## New/);
});

test("readOptionalText returns null for missing files and throws other errors", async () => {
  const missing = path.join(os.tmpdir(), "missing-pandorha-memory-file.md");
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "pandorha-memory-dir-"));

  assert.equal(await readOptionalText(missing), null);
  await assert.rejects(() => readOptionalText(dir));
});

test("renderers provide defaults for empty optional content", () => {
  const empty = sampleInput({
    error_log: "",
    technical_summary: "",
    plain_english: "",
    scaling_notes: ""
  });

  assert.match(renderTechMemoryEntry(fixedDate.toISOString(), empty), /No details provided/);
  assert.match(renderPlainEnglishEntry(fixedDate.toISOString(), empty), /No details provided/);
  assert.match(renderScalingRoadmapEntry(fixedDate.toISOString(), empty), /Review this module/);
});

test("resolveProjectRoot honors env override", () => {
	assert.equal(resolveProjectRoot({ PANDORHA_PROJECT_ROOT: "C:/tmp/pandorha" }), path.resolve("C:/tmp/pandorha"));
});

test("auditModuleContext reports complete and incomplete context triplets without writing", async () => {
  const projectRoot = await createTempProjectRoot();
  const contextDir = path.join(projectRoot, "src", "features", "combat", ".context");
  await fs.mkdir(contextDir, { recursive: true });
  await fs.writeFile(path.join(contextDir, "tech-memory.md"), "# Combat Tech\n", "utf8");
  await fs.writeFile(path.join(contextDir, "scaling-roadmap.md"), "# Combat Scaling\n", "utf8");
  await fs.writeFile(path.join(contextDir, "plain-english.md"), "# Combat Plain\n", "utf8");

  const complete = await auditModuleContext({ module_name: "combat" }, { projectRoot });
  assert.equal(complete.status, "passed");
  assert.equal(complete.issues.length, 0);

  await fs.writeFile(path.join(contextDir, "plain-english.md"), "No heading\n", "utf8");
  const incomplete = await auditModuleContext({ module_name: "combat" }, { projectRoot });
  assert.equal(incomplete.status, "failed");
  assert.equal(incomplete.issues[0].type, "missing-h1");
});
