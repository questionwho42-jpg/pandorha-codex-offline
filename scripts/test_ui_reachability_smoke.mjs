import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(repoRoot, "scripts", "ui_reachability_smoke.mjs");

test("ui reachability smoke passes with the current navigable UI contract", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runSmoke(root);

		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /ui reachability smoke is valid/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("ui reachability smoke fails when a required tab is not mounted", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/app/App.svelte": renderApp().replace(
				"<InventoryManagementPanel />",
				"<p>Inventário indisponível</p>",
			),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /InventoryManagementPanel/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("ui reachability smoke fails when an editable inventory action is unreachable", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/features/inventory-management/ui/InventoryManagementPanel.svelte":
				renderInventoryPanel().replace(
					'data-testid="inventory-consume-consumable"',
					'data-testid="inventory-consume-unreachable"',
				),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /inventory-consume-consumable/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("ui reachability smoke fails when navigation returns to future placeholders", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/app/model/navigation.ts": renderNavigation().replace(
				"Crie personagens e gerencie o save local.",
				"A criação de personagens será implementada em uma tarefa futura.",
			),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /placeholder obsoleto/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("ui reachability smoke fails when character docs claim saved data is lost", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"docs/user/character-creation.md": renderCharacterGuide().replace(
				"O save usa um único slot local.",
				"Se você recarregar a página, o personagem será perdido.",
			),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /personagem será perdido/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("ui reachability smoke fails when camp state echo can erase resolved events", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/features/camp-hour/ui/CampHourPanel.svelte":
				renderCampPanel().replace(
					"hydratedKey = createHydrationKey({",
					"const ignoredKey = createHydrationKey({",
				),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /hydratedKey/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("ui reachability smoke fails when Browser do Codex validation is removed", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"docs/process/vertical-slice-qa.md":
				"# QA\n\nExecute npm.cmd run qa:ui-reachability.\n",
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /Browser do Codex/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("ui reachability smoke fails when known limitations lose their classification", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"docs/user/camp-training.md":
				"# Acampamento\n\nSem limitações conhecidas.\n",
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /resolve apenas 1 hora/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createFixtureRoot({ fileOverrides = {} } = {}) {
	const root = await mkdtemp(
		path.join(os.tmpdir(), "pandorha-ui-reachability-"),
	);
	const files = {
		"src/app/App.svelte": renderApp(),
		"src/app/model/navigation.ts": renderNavigation(),
		"src/features/camp-hour/ui/CampHourPanel.svelte": renderCampPanel(),
		"src/features/inventory-management/ui/InventoryManagementPanel.svelte":
			renderInventoryPanel(),
		"docs/user/character-creation.md": renderCharacterGuide(),
		"docs/user/camp-training.md": renderCampGuide(),
		"docs/process/vertical-slice-qa.md": renderQaGuide(),
		...fileOverrides,
	};

	for (const [relativePath, content] of Object.entries(files)) {
		const fullPath = path.join(root, relativePath);
		await mkdir(path.dirname(fullPath), { recursive: true });
		await writeFile(fullPath, content);
	}

	return root;
}

function renderApp() {
	return `
inventoryEvents: inventoryEventRecords;
inventoryEventRecords = [...restoredInventory.data];
{#if activeView === "characters"}<CharacterCreateForm /><CharacterList />
{:else if activeView === "compendium"}<CompendiumBrowser />
{:else if activeView === "inventory"}<InventoryManagementPanel />
{:else if activeView === "exploration"}<HexcrawlMapPanel />
{:else if activeView === "camp"}<CampHourPanel />
{:else if activeView === "relations"}<SocialRelationsPanel /><SocialEncounterPanel />
{:else if activeView === "magic"}<SpellCastPanel />
{:else if activeView === "combat"}<CombatEncounterPanel />
{:else}<p>{activeItem.description}</p>{/if}
`;
}

function renderNavigation() {
	return `
export const APP_NAVIGATION_ITEMS = [
	{ id: "home", description: "Explore as áreas jogáveis atuais do Pandorha Engine." },
	{ id: "characters", description: "Crie personagens e gerencie o save local." },
	{ id: "compendium", description: "Consulte o catálogo curado de regras e lore." },
	{ id: "inventory", description: "Carregue, consuma e remova itens pertencentes a cada personagem." },
	{ id: "exploration", description: "O mapa de treino permite mover o grupo entre hexes adjacentes." },
	{ id: "camp", description: "O descanso ativo permite planejar uma hora de ações do grupo." },
	{ id: "relations", description: "Facções de treino permitem testar fama, dívida e intriga." },
	{ id: "magic", description: "A conjuração de treino prepara comandos sem executar efeitos." },
	{ id: "combat", description: "O encontro de treino permite testar ataque, dano e log." },
];
`;
}

function renderInventoryPanel() {
	return `
<select data-testid="inventory-character-select"></select>
<button data-testid="inventory-open-characters">Abrir Personagens</button>
<ul data-testid="inventory-catalog-list"></ul>
<button data-testid="inventory-add-equipment">Carregar</button>
<button data-testid="inventory-add-consumable">Carregar 1</button>
<button data-testid="inventory-increment-consumable">+1</button>
<button data-testid="inventory-consume-consumable">Consumir 1</button>
<button data-testid="inventory-remove-entry">Remover</button>
`;
}

function renderCampPanel() {
	return `
events = [...result.data.events];
hydratedKey = createHydrationKey({
	assignments: localAssignments,
	characters,
	clocks: localClocks,
	sessions: localCampSessions,
});
onStateChange({
	clocks: localClocks,
	campSessions: localCampSessions,
	campAssignments: localAssignments,
});
`;
}

function renderCharacterGuide() {
	return `
# Criar Personagem

## Limites Desta Versão

- O save usa um único slot local.
- Os traços escolhidos ainda não aparecem na listagem e seus efeitos mecânicos ainda não são aplicados.

Use Salvar sessão, recarregue a página e use Carregar save para restaurar o personagem.
`;
}

function renderQaGuide() {
	return `
# QA

Execute npm.cmd run qa:ui-reachability.
Mudanças visuais exigem validação renderizada pelo Browser do Codex.
O inventário editável pertence ao personagem e persiste no save v6.
Magia, exploração e combate ainda usam dados de treino.
`;
}

function renderCampGuide() {
	return `
# Acampamento

## Limitações atuais

- A versão atual resolve apenas 1 hora.
`;
}

function runSmoke(root) {
	return spawnSync(process.execPath, [scriptPath, "--root", root], {
		cwd: repoRoot,
		encoding: "utf8",
	});
}
