import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	rm,
	writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(
	repoRoot,
	"scripts",
	"generate_browser_qa_runbook.mjs",
);

test("browser QA runbook generator renders a deterministic nine-tab checklist", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runGenerator(root, []);

		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /# Runbook Deterministico Do Browser/);
		assert.match(result.stdout, /Nove abas/);
		assert.match(result.stdout, /Personagens/);
		assert.match(result.stdout, /Compendio/);
		assert.match(result.stdout, /Salvar sessao/);
		assert.match(result.stdout, /Inspecao de console/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("browser QA runbook generator is read-only unless output is explicit", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runGenerator(root, []);
		const processFiles = await readdir(path.join(root, "docs", "process"));

		assert.equal(result.status, 0, result.stderr);
		assert.doesNotMatch(processFiles.join("\n"), /browser-qa-runbook\.md/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("browser QA runbook generator writes and checks the versioned report", async () => {
	const root = await createFixtureRoot();
	const output = path.join(root, "docs", "process", "browser-qa-runbook.md");

	try {
		const writeResult = runGenerator(root, ["--output", output]);
		const checkResult = runGenerator(root, ["--check", "--output", output]);
		const content = await readFile(output, "utf8");

		assert.equal(writeResult.status, 0, writeResult.stderr);
		assert.equal(checkResult.status, 0, checkResult.stderr);
		assert.match(content, /qa:ui-reachability/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createFixtureRoot() {
	const root = await mkdtemp(
		path.join(os.tmpdir(), "pandorha-browser-runbook-"),
	);
	const files = {
		"package.json": JSON.stringify(
			{
				scripts: {
					"qa:ui-reachability": "node scripts/ui_reachability_smoke.mjs",
				},
			},
			null,
			2,
		),
		"docs/process/vertical-slice-qa.md": [
			"# QA Da Vertical Slice Do MVP",
			"",
			"## Fluxo Principal No Navegador",
			"",
			"1. Entre em `Personagens`, crie um personagem valido.",
			"2. Entre em `Compendio`, busque Vanguarda.",
			"3. Clique em `Salvar sessao`, recarregue e clique em `Carregar save`.",
			"4. Entre em `Inventario`, equipe arma.",
			"5. Entre em `Combate`, ataque alvo de treino.",
			"6. Entre em `Exploracao`, mova para hex adjacente.",
			"7. Entre em `Acampamento`, resolva 1 hora.",
			"8. Entre em `Relacoes`, faca apelo social.",
			"9. Entre em `Magia`, prepare comando.",
			"",
			"## Automacao De Alcance Da UI",
			"Use `npm.cmd run qa:ui-reachability`.",
		].join("\n"),
	};

	for (const [relativePath, content] of Object.entries(files)) {
		const filePath = path.join(root, relativePath);
		await mkdir(path.dirname(filePath), { recursive: true });
		await writeFile(filePath, content, "utf8");
	}

	return root;
}

function runGenerator(root, args) {
	return spawnSync(process.execPath, [scriptPath, "--root", root, ...args], {
		cwd: repoRoot,
		encoding: "utf8",
	});
}
