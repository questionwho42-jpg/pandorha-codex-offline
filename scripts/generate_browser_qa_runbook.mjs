import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const tabs = [
	"Inicio",
	"Personagens",
	"Compendio",
	"Inventario",
	"Exploracao",
	"Acampamento",
	"Relacoes",
	"Magia",
	"Combate",
];

export async function generateBrowserQaRunbook(rootDir = repoRoot) {
	const root = path.resolve(rootDir);
	const verticalSlicePath = path.join(
		root,
		"docs",
		"process",
		"vertical-slice-qa.md",
	);
	const packageJsonPath = path.join(root, "package.json");
	const verticalSlice = await readFile(verticalSlicePath, "utf8");
	const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
	const hasReachabilityGate = Boolean(
		packageJson.scripts?.["qa:ui-reachability"],
	);
	const visibleFlows = extractBrowserFlow(verticalSlice);

	return renderRunbook({ hasReachabilityGate, visibleFlows });
}

export function renderRunbook({ hasReachabilityGate, visibleFlows }) {
	const lines = [
		"# Runbook Deterministico Do Browser",
		"",
		"Este runbook transforma o roteiro humano atual em checklist repetivel para o Browser do Codex. Ele nao substitui validacao renderizada; ele define a ordem minima que deve ser executada quando a UI mudar.",
		"",
		"## Nove abas",
		"",
		...tabs.map((tab, index) => `${index + 1}. ${tab}`),
		"",
		"## Gates Antes Do Browser",
		"",
		`- qa:ui-reachability: ${hasReachabilityGate ? "registrado" : "ausente"}`,
		"- npm.cmd run docs:audit",
		"",
		"## Fluxos Visiveis Atuais",
		"",
	];

	for (const flow of visibleFlows) {
		lines.push(`- ${flow}`);
	}

	lines.push(
		"",
		"## Save E Load",
		"",
		"- Criar ou alterar dados visiveis.",
		"- Acionar Salvar sessao.",
		"- Recarregar a pagina de verdade.",
		"- Acionar Carregar save.",
		"- Confirmar que personagens, inventario, loadout, durabilidade, relacoes e clocks voltaram quando aplicavel.",
		"",
		"## Inspecao de console",
		"",
		"- Abrir o console do navegador antes do fluxo.",
		"- Executar as nove abas sem erros ou warnings novos.",
		"- Registrar qualquer erro com tela, acao e texto exato.",
		"",
		"## Criterios De Aceite Por Tela",
		"",
		"- Cada aba monta o painel esperado sem placeholder obsoleto.",
		"- A copia visivel permanece em pt-BR.",
		"- Save/load so e exigido nas telas que alteram estado persistido.",
		"- Scripts apontam evidencias estruturais; regras de RPG continuam soberanas em docs/system.",
		"",
	);

	return lines.join("\n");
}

export function extractBrowserFlow(markdown) {
	const lines = markdown.split(/\r?\n/);
	const flows = lines
		.map((line) => line.trim())
		.filter((line) => /^\d+\.\s+/.test(line))
		.map((line) => line.replace(/^\d+\.\s+/, "").replace(/`/g, ""));

	return flows.length > 0
		? flows
		: ["Abrir as nove abas e confirmar que cada painel monta sem erro."];
}

function parseArgs(args) {
	const options = {
		root: repoRoot,
		output: null,
		check: false,
	};

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg === "--check") {
			options.check = true;
			continue;
		}

		const value = args[index + 1];
		if (arg === "--root" || arg === "--output") {
			if (!value || value.startsWith("--")) {
				return { success: false, error: `Missing value for ${arg}` };
			}
			options[arg.slice(2)] = value;
			index += 1;
			continue;
		}

		return { success: false, error: `Unsupported option: ${arg}` };
	}

	if (options.check && !options.output) {
		options.output = path.join(
			options.root,
			"docs",
			"process",
			"browser-qa-runbook.md",
		);
	}

	return { success: true, options };
}

async function main() {
	const parsed = parseArgs(process.argv.slice(2));
	if (!parsed.success) {
		console.error(parsed.error);
		process.exitCode = 1;
		return;
	}

	const rendered = await generateBrowserQaRunbook(parsed.options.root);
	if (parsed.options.check) {
		const current = await readFile(path.resolve(parsed.options.output), "utf8");
		if (current !== rendered) {
			console.error("Browser QA runbook is out of date.");
			process.exitCode = 1;
		}
		return;
	}

	if (parsed.options.output) {
		const outputPath = path.resolve(parsed.options.output);
		await mkdir(path.dirname(outputPath), { recursive: true });
		await writeFile(outputPath, rendered, "utf8");
		console.log(`Wrote browser QA runbook to ${outputPath}`);
		return;
	}

	process.stdout.write(rendered);
}

if (
	process.argv[1] &&
	pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
	main().catch((error) => {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	});
}
