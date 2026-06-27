import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(repoRoot, "scripts", "ui_reachability_smoke.mjs");
const compendiumSearchServicePath = [
	"src/entities/compendium/domain",
	"CompendiumSearchService.ts",
].join("/");

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

test("ui reachability smoke fails when the static favicon is removed", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"index.html": renderIndex().replace(
				'<link rel="icon" href="/favicon.svg" />',
				"",
			),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /rel="icon"/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("ui reachability smoke fails when the web app manifest is not linked", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"index.html": renderIndex().replace(
				'<link rel="manifest" href="/manifest.webmanifest" />',
				"",
			),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /manifest\.webmanifest/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("ui reachability smoke fails when the PWA install action is unreachable", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/app/App.svelte": renderApp().replace(
				'data-testid="pwa-install-button"',
				'data-testid="pwa-install-missing"',
			),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /pwa-install-button/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("ui reachability smoke fails when the PWA update action is unreachable", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/app/App.svelte": renderApp().replace(
				'data-testid="pwa-update-button"',
				'data-testid="pwa-update-missing"',
			),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /pwa-update-button/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("ui reachability smoke fails when the compendium category filter is unreachable", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/features/compendium-browser/ui/CompendiumBrowser.svelte":
				renderCompendiumBrowser().replace(
					'data-testid="compendium-category-filter"',
					'data-testid="compendium-category-missing"',
				),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /compendium-category-filter/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("ui reachability smoke fails when the service worker cannot skip waiting", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"public/pandorha-sw.js": renderServiceWorker().replace(
				'"SKIP_WAITING"',
				'"IGNORE_WAITING"',
			),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /SKIP_WAITING/);
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

test("ui reachability smoke fails when combat cannot open inventory for loadout", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/features/combat-encounter/ui/CombatEncounterPanel.svelte":
				renderCombatPanel().replace(
					'data-testid="combat-open-inventory-button"',
					'data-testid="combat-open-inventory-missing"',
				),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /combat-open-inventory-button/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("ui reachability smoke fails when combat potion belt use is unreachable", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/features/combat-encounter/ui/CombatEncounterPanel.svelte":
				renderCombatPanel().replace(
					'data-testid="combat-use-potion-belt-button"',
					'data-testid="combat-use-potion-belt-unreachable"',
				),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /combat-use-potion-belt-button/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("ui reachability smoke fails when persisted character traits are unreachable", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/features/character-list/ui/CharacterList.svelte":
				renderCharacterList().replace(
					'data-testid="character-trait-selection-list"',
					'data-testid="character-trait-selection-missing"',
				),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /character-trait-selection-list/);
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
		"index.html": renderIndex(),
		"public/manifest.webmanifest": renderManifest(),
		"public/pandorha-sw.js": renderServiceWorker(),
		"public/favicon.svg": renderFavicon(),
		"src/app/App.svelte": renderApp(),
		"src/app/model/navigation.ts": renderNavigation(),
		"src/entities/equipment/model/equipmentCatalog.ts":
			renderEquipmentCatalog(),
		"src/features/camp-hour/ui/CampHourPanel.svelte": renderCampPanel(),
		"src/features/character-starting-equipment/model/startingEquipmentKit.ts":
			renderStartingEquipmentKit(),
		"src/features/character-list/ui/CharacterList.svelte":
			renderCharacterList(),
		[compendiumSearchServicePath]: renderCompendiumSearchService(),
		"src/features/compendium-browser/ui/CompendiumBrowser.svelte":
			renderCompendiumBrowser(),
		"src/features/combat-encounter/ui/CombatEncounterPanel.svelte":
			renderCombatPanel(),
		"src/features/inventory-management/model/inventoryManagementView.ts":
			renderInventoryManagementView(),
		"src/features/inventory-management/ui/InventoryManagementPanel.svelte":
			renderInventoryPanel(),
		"docs/user/character-creation.md": renderCharacterGuide(),
		"docs/user/camp-training.md": renderCampGuide(),
		"docs/user/compendium-browser.md": renderCompendiumGuide(),
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

function renderFavicon() {
	return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
	<rect width="64" height="64" fill="#1c1917" />
	<path fill="#dab973" />
</svg>
`;
}

function renderIndex() {
	return `
<!doctype html>
<html lang="pt-BR">
	<head>
		<link rel="icon" href="/favicon.svg" />
		<link rel="manifest" href="/manifest.webmanifest" />
		<title>Pandorha Engine</title>
	</head>
</html>
`;
}

function renderManifest() {
	return `
{
	"name": "Pandorha Engine",
	"short_name": "Pandorha",
	"start_url": "/",
	"display": "standalone",
	"icons": [{ "src": "/favicon.svg", "sizes": "any", "type": "image/svg+xml" }]
}
`;
}

function renderServiceWorker() {
	return `
self.addEventListener("message", (event) => {
	const message = event.data;
	if (message?.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});
`;
}

function renderApp() {
	return `
<p data-testid="pwa-install-status">Instalação disponível neste navegador.</p>
<button data-testid="pwa-install-button">Instalar app</button>
<p data-testid="pwa-update-status">Atualização disponível.</p>
<button data-testid="pwa-update-button">Atualizar agora</button>
inventoryEvents: inventoryEventRecords;
equipmentLoadoutEvents: equipmentLoadoutEventRecords;
equipmentDurabilityEvents: equipmentDurabilityEventRecords;
inventoryEventRecords = [...restoredInventory.data];
equipmentLoadoutEventRecords = [...restoredLoadout.data];
equipmentDurabilityEventRecords = [...restoredDurability.data];
equipmentLoadoutEvents={equipmentLoadoutEventRecords};
equipmentDurabilityEvents={equipmentDurabilityEventRecords};
const characterAncestryTraits = [];
ancestryTraits={characterAncestryTraits};
traitSelections={characterTraitSelectionRecords};
onLoadoutEventsChange;
onDurabilityEventsChange;
createCombatPersistentLoadoutResolver;
createCombatPotionBeltConsumer;
createCombatPotionBeltResolver;
grantStartingEquipment;
const startingEquipment = await grantStartingEquipment({
	characterId: result.data.id,
	classId: input.classId,
});
inventoryEventRecords = [
	...inventoryEventRecords,
	...startingEquipment.data.appendedEvents,
];
resolvePersistentLoadout={resolveCombatPersistentLoadout};
resolvePotionBelt={resolveCombatPotionBelt};
consumePotionBelt={consumeCombatPotionBelt};
onOpenInventory;
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

function renderEquipmentCatalog() {
	return `
const OFFICIAL_EQUIPMENT = [
	{ id: "chainmail" },
	{ id: "shortbow" },
	{ id: "staff" },
	{ id: "rapier" },
	{ id: "luxury-padded-armor" },
];
const OFFICIAL_CONSUMABLES = [
	{ id: "adventurer-kit-stack" },
	{ id: "grimoire-stack" },
	{ id: "nobility-letter-stack" },
];
const OFFICIAL_LOADOUT_SUPPORTED_EQUIPMENT_IDS = ["longsword"];
function isOfficialLoadoutSupportedEquipmentId(id) {
	return OFFICIAL_LOADOUT_SUPPORTED_EQUIPMENT_IDS.includes(id);
}
`;
}

function renderStartingEquipmentKit() {
	return `
export function resolveStartingEquipmentKit() {
	return {
		success: true,
		data: {
			classId: "vanguard",
			items: [
				{ catalogKind: "equipment", catalogItemId: "chainmail", count: 1 },
				{ catalogKind: "consumable", catalogItemId: "adventurer-kit-stack", quantity: 1 },
				{ catalogKind: "equipment", catalogItemId: "dagger", count: 2 },
			],
		},
	};
}
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

function renderCharacterList() {
	return `
<section data-testid="character-list">
	<div data-testid="character-trait-selection-list">
		<p>Traços de ancestralidade</p>
		<div data-testid="character-trait-selection-item">Diligência Erudita</div>
	</div>
</section>
`;
}

function renderCompendiumSearchService() {
	return `
import { compendiumCategorySchema } from "../model/compendiumSchema";

const input = {
	category: z.union([compendiumCategorySchema, z.literal("all")]).optional().default("all"),
	limit: z.number().int().min(1).max(200).optional().default(20),
};

const categoryEntries =
	category === "all"
		? validated
		: validated.filter((entry) => entry.category === category);
`;
}

function renderCompendiumBrowser() {
	return `
let selectedCategory = $state("all");
function selectCategory(category) {
	selectedCategory = category;
}

void searchEntries({
	category: selectedCategory,
	limit: 200,
	query,
});

<input placeholder="Ex.: Vanguarda, contramagia ou descanso" />
<div data-testid="compendium-category-filter">
	<button data-testid="compendium-category-option">Sistema: Magia</button>
</div>
<nav data-testid="compendium-pagination">
	<button data-testid="compendium-previous-page">Anterior</button>
	<button data-testid="compendium-next-page">Proxima</button>
</nav>
<button data-testid="compendium-clear-filters">Limpar busca e filtros</button>
<span>{item.sourceLabel}</span>
<p>{view.selectedEntry.sourceLabel}</p>
`;
}

function renderCombatPanel() {
	return `
export let resolvePersistentLoadout = () => undefined;
export let resolvePotionBelt = () => undefined;
export let consumePotionBelt = () => undefined;
<section data-testid="combat-persistent-loadout">
	<p data-testid="combat-persistent-loadout-weapon">Arma equipada: Espada Longa.</p>
	<p data-testid="combat-persistent-loadout-shield">Escudo equipado: Escudo Redondo.</p>
	<p data-testid="combat-persistent-loadout-armor">Armadura equipada: Armadura de Couro.</p>
	<button data-testid="combat-open-inventory-button">Abrir Inventario</button>
</section>
<section data-testid="combat-potion-belt">
	<p data-testid="combat-potion-belt-summary">Cinto de poções: 5/5</p>
	<button data-testid="combat-use-potion-belt-button">Usar poção do cinto</button>
	<p>Uso de treino: não altera HP real, HP de treino ou estados oficiais.</p>
</section>
`;
}

function renderInventoryPanel() {
	return `
<select data-testid="inventory-character-select"></select>
<button data-testid="inventory-open-characters">Abrir Personagens</button>
<ul data-testid="inventory-catalog-list"></ul>
<button data-testid="inventory-add-equipment">Carregar</button>
<button data-testid="inventory-add-consumable">Carregar 1</button>
<section data-testid="inventory-equipped-loadout"></section>
<button data-testid="inventory-equip-entry">Equipar arma</button>
<button data-testid="inventory-unequip-entry">Desequipar</button>
<button data-testid="inventory-increment-consumable">+1</button>
<button data-testid="inventory-consume-consumable">Consumir 1</button>
<button data-testid="inventory-remove-entry">Remover</button>
<button data-testid="inventory-mark-damaged">Marcar danificado</button>
<button data-testid="inventory-mark-broken">Marcar quebrado</button>
<button data-testid="inventory-repair-equipment">Reparar</button>
`;
}

function renderInventoryManagementView() {
	return `
if (isOfficialLoadoutSupportedEquipmentId(entry.catalogItemId)) {
	return "equip-action";
}
function mapDurabilityLabel() {}
const message = "Repare antes de equipar";
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
- Os controles preservam personagens e traços escolhidos.
- Recarregue e confirme a listagem com os mesmos 3 traços.
- Confirme o kit inicial da classe no Inventario.
- Os efeitos mecânicos dos traços ainda não são aplicados.

Use Salvar sessão, recarregue a página e use Carregar save para restaurar o personagem.
`;
}

function renderCompendiumGuide() {
	return `
# Guia De Usuário: Compêndio

Abra http://localhost:5173/ e entre em Compêndio.
Busque Vanguarda, contramagia e descanso.
Use os filtros Sistema: Magia, Sistema: Combate e Sistema: Sobrevivência.
Confirme ranking textual e navegacao por pagina.
Selecione uma entrada e confirme fonte por arquivo e linha.
`;
}

function renderQaGuide() {
	return `
# QA

Execute npm.cmd run qa:ui-reachability.
Mudanças visuais exigem validação renderizada pelo Browser do Codex.
No Compêndio, busque Vanguarda, contramagia e descanso, filtre por Magia, Combate e Sobrevivência e confirme fonte por arquivo e linha.
 O inventário editável pertence ao personagem, permite equipar/desequipar arma, escudo e armadura, bloqueia remoção de item equipado e persiste inventário + loadout + durabilidade no save v9.
O cinto de poções consome 1 unidade pelo inventário persistido sem alterar HP real.
Magia e exploração ainda usam dados de treino; combate ainda usa alvos de treino e HP de treino local.
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
