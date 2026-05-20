import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(repoRoot, "scripts", "vertical_slice_smoke.mjs");

test("vertical slice smoke passes with required MVP contracts", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runSmoke(root);

		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /vertical slice smoke is valid/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("vertical slice smoke fails when navigation misses a required tab", async () => {
	const root = await createFixtureRoot({
		navigationText: renderNavigation().replace('id: "combat"', 'id: "duel"'),
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /src\/app\/model\/navigation\.ts/);
		assert.match(result.stderr, /id: "combat"/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("vertical slice smoke fails when a user guide is missing localhost steps", async () => {
	const root = await createFixtureRoot({
		docOverrides: {
			"docs/user/social-relations.md": "# Relações\n\nSem URL.\n",
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /docs\/user\/social-relations\.md/);
		assert.match(result.stderr, /localhost:5173/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createFixtureRoot({
	navigationText = renderNavigation(),
	docOverrides = {},
} = {}) {
	const root = await mkdtemp(path.join(os.tmpdir(), "pandorha-vertical-qa-"));
	const files = {
		"src/app/model/navigation.ts": navigationText,
		"src/app/App.svelte": renderApp(),
		"public/pandorha-sw.js": renderServiceWorker(),
		"docs/user/character-creation.md": renderDoc("Personagens"),
		"docs/user/combat-training.md": renderDoc("Combate"),
		"docs/user/camp-training.md": renderDoc("Acampamento"),
		"docs/user/social-relations.md": renderDoc("Relações"),
		"docs/user/offline-smoke.md": renderDoc("Offline"),
		...docOverrides,
	};

	for (const [relativePath, content] of Object.entries(files)) {
		const fullPath = path.join(root, relativePath);
		await mkdir(path.dirname(fullPath), { recursive: true });
		await writeFile(fullPath, content);
	}

	return root;
}

function renderNavigation() {
	return `
export const APP_NAVIGATION_ITEMS = [
  { id: "characters", label: "Personagens" },
  { id: "compendium", label: "Compêndio" },
  { id: "inventory", label: "Inventário" },
  { id: "exploration", label: "Exploração" },
  { id: "camp", label: "Acampamento" },
  { id: "relations", label: "Relações" },
  { id: "magic", label: "Magia" },
  { id: "combat", label: "Combate" },
];
`;
}

function renderApp() {
	return `
<script>
CharacterCreateForm;
SaveLoadControls;
CombatEncounterPanel;
HexcrawlMapPanel;
CampHourPanel;
SocialRelationsPanel;
SpellCastPanel;
InventoryReadOnlyPanel;
CompendiumBrowser;
</script>
<p data-testid="pwa-status">Offline disponível neste navegador.</p>
`;
}

function renderServiceWorker() {
	return `
const CACHE_NAME = "fixture";
self.addEventListener("install", () => undefined);
self.addEventListener("activate", () => undefined);
self.addEventListener("fetch", () => handleNavigationRequest());
function handleNavigationRequest() {}
`;
}

function renderDoc(title) {
	return `# ${title}\n\nAbra http://127.0.0.1:5173/ para testar.\n`;
}

function runSmoke(root) {
	return spawnSync(process.execPath, [scriptPath, "--root", root], {
		cwd: repoRoot,
		encoding: "utf8",
	});
}
