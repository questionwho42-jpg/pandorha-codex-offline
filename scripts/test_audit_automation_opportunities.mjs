import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(
	repoRoot,
	"scripts",
	"audit_automation_opportunities.mjs",
);

test("automation audit detects unpaired scripts, weak MCP gates, and weak skill metadata", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runAudit(root, ["--format", "json"]);
		const audit = parseJson(result);
		const findingIds = audit.opportunities.map((entry) => entry.id);

		assert.equal(result.status, 0, result.stderr);
		assert.ok(findingIds.includes("script:missing-test:lonely"));
		assert.ok(findingIds.includes("mcp:missing-script:pandorha-empty:test"));
		assert.ok(
			findingIds.includes("mcp:missing-script:pandorha-empty:validate:stdio"),
		);
		assert.ok(findingIds.includes("skill:missing-metadata:thin-skill"));
		assert.equal(audit.recommendations.plugin.decision, "do-not-create-plugin");
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("automation audit renders markdown and stays read-only without output", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runAudit(root, ["--format", "markdown"]);
		const processFiles = await readdir(path.join(root, "docs", "process"));

		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /Auditoria De Oportunidades De Automacao/);
		assert.doesNotMatch(
			processFiles.join("\n"),
			/automation-opportunities\.md/,
		);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("automation audit writes an explicit output report", async () => {
	const root = await createFixtureRoot();
	const output = path.join(
		root,
		"docs",
		"process",
		"automation-opportunities.md",
	);

	try {
		const result = runAudit(root, ["--format", "markdown", "--output", output]);

		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /Wrote automation opportunity report/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createFixtureRoot() {
	const root = await mkdtemp(path.join(os.tmpdir(), "pandorha-auto-audit-"));
	const files = {
		"package.json": JSON.stringify(
			{
				scripts: {
					"quality:automation": "node scripts/test_tested.mjs",
				},
			},
			null,
			2,
		),
		"scripts/lonely.mjs": "console.log('lonely');\n",
		"scripts/tested.mjs": "console.log('tested');\n",
		"scripts/test_tested.mjs": "console.log('tested tests');\n",
		"mcp/pandorha-empty/package.json": JSON.stringify(
			{
				name: "pandorha-empty",
				scripts: {},
			},
			null,
			2,
		),
		".agents/skills/thin-skill/SKILL.md": "# Thin Skill\n",
		"docs/process/automation-spec.md": "# Automation Spec\n",
	};

	for (const [relativePath, content] of Object.entries(files)) {
		const filePath = path.join(root, relativePath);
		await mkdir(path.dirname(filePath), { recursive: true });
		await writeFile(filePath, content, "utf8");
	}

	return root;
}

function runAudit(root, args) {
	return spawnSync(process.execPath, [scriptPath, "--root", root, ...args], {
		cwd: repoRoot,
		encoding: "utf8",
	});
}

function parseJson(result) {
	assert.equal(result.status, 0, result.stderr);
	return JSON.parse(result.stdout);
}
