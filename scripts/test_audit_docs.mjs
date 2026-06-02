import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(repoRoot, "scripts", "audit_docs.mjs");

test("documentation audit detects broken local links and missing H1", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runAudit(root, ["--format", "json", "--scope", "all"]);
		const audit = parseAuditResult(result);

		assert.equal(result.status, 0, result.stderr);
		assert.equal(audit.summary.missingLinkCount, 1);
		assert.equal(audit.findings.missingLinks[0].target, "missing.md");
		assert.match(
			audit.findings.missingH1.join("\n"),
			/docs\/architecture\/feature_state_machines\.md/,
		);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("documentation audit ignores non-official generated directories", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runAudit(root, ["--format", "json", "--scope", "all"]);
		const audit = parseAuditResult(result);

		assert.equal(result.status, 0, result.stderr);
		assert.doesNotMatch(audit.files.join("\n"), /output\/bad\.md/);
		assert.doesNotMatch(audit.files.join("\n"), /coverage\/bad\.md/);
		assert.doesNotMatch(audit.files.join("\n"), /dist\/bad\.md/);
		assert.doesNotMatch(audit.files.join("\n"), /node_modules\/bad\.md/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("documentation audit counts files by documentation area", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runAudit(root, ["--format", "json", "--scope", "all"]);
		const audit = parseAuditResult(result);

		assert.equal(result.status, 0, result.stderr);
		assert.equal(audit.summary.areas.architecture, 1);
		assert.equal(audit.summary.areas.process, 2);
		assert.equal(audit.summary.areas.system, 1);
		assert.equal(audit.summary.areas.user, 1);
		assert.equal(audit.summary.areas.root, 2);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("documentation audit finds open change inbox promotion entries", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runAudit(root, ["--format", "json", "--scope", "all"]);
		const audit = parseAuditResult(result);

		assert.equal(result.status, 0, result.stderr);
		assert.equal(audit.summary.openPromotionCount, 2);
		assert.deepEqual(
			audit.promotionInbox.openEntries.map((entry) => entry.id),
			["t01", "t02"],
		);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("documentation audit is read-only by default", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runAudit(root, ["--format", "markdown", "--scope", "all"]);
		const processFiles = await readdir(path.join(root, "docs", "process"));

		assert.equal(result.status, 0, result.stderr);
		assert.doesNotMatch(processFiles.join("\n"), /documentation-audit\.md/);
		assert.match(result.stdout, /Auditoria De Documentação/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createFixtureRoot() {
	const root = await mkdtemp(path.join(os.tmpdir(), "pandorha-doc-audit-"));
	const files = {
		"AGENTS.md":
			"# AGENTS\n\n[Architecture](docs/architecture/feature_state_machines.md)\n",
		"llms.txt": "# Context Map\n\n[System](./docs/system/combat.md)\n",
		"docs/architecture/feature_state_machines.md":
			"Feature state machines\n\n[Broken](missing.md)\n",
		"docs/process/change-inbox.md": renderInbox(),
		"docs/process/task-ledger.md": "# Task Ledger\n",
		"docs/system/combat.md": "# Combat\n",
		"docs/user/guide.md": "# Guia\n",
		"output/bad.md": "Generated bad file\n",
		"coverage/bad.md": "Generated bad file\n",
		"dist/bad.md": "Generated bad file\n",
		"node_modules/bad.md": "Generated bad file\n",
		"package.json": JSON.stringify(
			{
				scripts: {
					"automation:doctor": "echo doctor",
					"docs:audit": "echo docs",
					lint: "echo lint",
					"quality:automation": "echo quality",
					test: "echo test",
				},
			},
			null,
			2,
		),
	};

	for (const [relativePath, content] of Object.entries(files)) {
		const fullPath = path.join(root, relativePath);
		await mkdir(path.dirname(fullPath), { recursive: true });
		await writeFile(fullPath, content);
	}

	return root;
}

function renderInbox() {
	return `# Change Inbox

## Open
<!-- pandorha-inbox:open -->
<!-- pandorha-inbox:t01 -->
### T01 Combat UI
- id: t01
- status: open
- summary: Criar UI de combate para teste no navegador.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:t01 -->
<!-- pandorha-inbox:t02 -->
### T02 Worker RPC Save
- id: t02
- status: open
- summary: Criar contrato Worker RPC para save.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:t02 -->
<!-- /pandorha-inbox:open -->
`;
}

function runAudit(root, args) {
	return spawnSync(process.execPath, [scriptPath, "--root", root, ...args], {
		cwd: repoRoot,
		encoding: "utf8",
	});
}

function parseAuditResult(result) {
	assert.equal(result.status, 0, result.stderr);
	return JSON.parse(result.stdout);
}
