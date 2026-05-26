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

test("vertical slice smoke fails when social choice UI contract is missing", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/features/social-encounter/ui/SocialEncounterPanel.svelte":
				"<script>SocialEncounterPanel;</script>",
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(
			result.stderr,
			/src\/features\/social-encounter\/ui\/SocialEncounterPanel\.svelte/,
		);
		assert.match(result.stderr, /social-choice-select/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("vertical slice smoke fails when dialogue tree UI contract is missing", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/features/social-encounter/ui/SocialEncounterPanel.svelte": `
<script>
export let dialogueChoices = [];
</script>
<select data-testid="social-choice-select"></select>
<div data-testid="social-choice-summary"></div>
`,
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(
			result.stderr,
			/src\/features\/social-encounter\/ui\/SocialEncounterPanel\.svelte/,
		);
		assert.match(result.stderr, /social-dialogue-tree/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("vertical slice smoke fails when informant gated option contract is missing", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/entities/dialogue-tree/model/dialogueTreeCatalog.ts":
				renderDialogueTreeCatalog().replace(
					"minimumMentalHp: 7",
					"minimumMentalHp: 6",
				),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(
			result.stderr,
			/src\/entities\/dialogue-tree\/model\/dialogueTreeCatalog\.ts/,
		);
		assert.match(result.stderr, /minimumMentalHp: 7/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("vertical slice smoke fails when captain official tree contract is missing", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/entities/dialogue-tree/model/dialogueTreeCatalog.ts":
				renderDialogueTreeCatalog().replace(
					"training-captain-option-threaten",
					"training-captain-option-pressure",
				),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(
			result.stderr,
			/src\/entities\/dialogue-tree\/model\/dialogueTreeCatalog\.ts/,
		);
		assert.match(result.stderr, /training-captain-option-threaten/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("vertical slice smoke fails when social consequence metadata contract is missing", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/features/social-encounter/model/socialEncounterConsequences.ts":
				"const summary = 'generic consequence';",
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(
			result.stderr,
			/src\/features\/social-encounter\/model\/socialEncounterConsequences\.ts/,
		);
		assert.match(result.stderr, /dialogueChoiceLabel/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createFixtureRoot({
	navigationText = renderNavigation(),
	docOverrides = {},
	fileOverrides = {},
} = {}) {
	const root = await mkdtemp(path.join(os.tmpdir(), "pandorha-vertical-qa-"));
	const files = {
		"src/app/model/navigation.ts": navigationText,
		"src/app/App.svelte": renderApp(),
		"src/features/social-encounter/ui/SocialEncounterPanel.svelte":
			renderSocialEncounterPanel(),
		"src/entities/dialogue-tree/model/dialogueTreeCatalog.ts":
			renderDialogueTreeCatalog(),
		"src/features/social-encounter/domain/DialogueTraversalService.ts":
			renderDialogueTraversalService(),
		"src/features/social-encounter/model/socialDialogueTreeView.ts":
			renderSocialDialogueTreeView(),
		"src/features/social-encounter/model/socialEncounterConsequences.ts":
			renderSocialEncounterConsequences(),
		"src/features/social-encounter/domain/SocialEncounterService.ts":
			renderSocialEncounterService(),
		"public/pandorha-sw.js": renderServiceWorker(),
		"src/features/save-load/model/saveLoadSchemas.ts": renderSaveSchemas(),
		"docs/user/character-creation.md": renderDoc("Personagens"),
		"docs/user/combat-training.md": renderDoc("Combate"),
		"docs/user/camp-training.md": renderDoc("Acampamento"),
		"docs/user/social-relations.md": renderDoc("Relações"),
		"docs/user/social-encounter.md": renderSocialEncounterDoc(),
		"docs/user/offline-smoke.md": renderDoc("Offline"),
		...fileOverrides,
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
SocialEncounterPanel;
applySocialPressurePenaltyIntent;
applySocialPressurePenalty;
clockRecords = [...result.data.clocks];
gainInfamy: socialRelationsSession.gainInfamy;
SpellCastPanel;
InventoryReadOnlyPanel;
CompendiumBrowser;
</script>
<p data-testid="pwa-status">Offline disponível neste navegador.</p>
`;
}

function renderSocialEncounterPanel() {
	return `
<script>
export let dialogueChoices = [];
export let dialogueNodes = [];
export let dialogueOptions = [];
export let factionFameLevelsByNpcId = {};
export let selectDialogueTreeOption = () => undefined;
function chooseDialogueOption() {}
function createSocialEncounterConsequenceFlag() {}
function createSocialPressurePenaltyIntent() {}
createSocialEncounterConsequenceFlag({
  dialogueOptions,
});
createSocialPressurePenaltyIntent({
  dialogueOptions,
});
onSocialPressurePenalty();
const disabled = !option.isAvailable;
const reason = option.blockedReason;
</script>
<select data-testid="social-choice-select"></select>
<div data-testid="social-choice-summary"></div>
<div data-testid="social-dialogue-tree">
  <p>Fala do NPC</p>
  <p data-testid="social-dialogue-current-text">A corretora pede uma proposta concreta.</p>
  <button data-testid="social-dialogue-option">Barganhar</button>
</div>
`;
}

function renderSocialEncounterConsequences() {
	return `
const dialogueOptionId = "training-broker-option-bargain";
const dialogueChoiceId = "bargain";
const dialogueChoiceLabel = "Barganhar";
const summary = "O NPC aceitou a troca proposta e esta consequência foi registrada no estado do mundo.";
const pressure = "O NPC cedeu à pressão social e esta consequência foi registrada no estado do mundo.";
const kind = "social-pressure-fame-penalty";
const infamy = "social-pressure-infamy";
const penalty = "Pressionar este NPC aplicou perda de 1 nível de Fama";
function findLatestSelectedDialogueOption() {}
`;
}

function renderDialogueTreeCatalog() {
	return `
export const DIALOGUE_OPTION_CATALOG = [
  {
    id: "training-informant-option-threaten",
    nodeId: "training-informant-opening",
    choiceId: "threaten",
    minimumMentalHp: 7,
    blockedReason: "Exige HP mental 7 ou maior para pressionar o informante sem quebrar a cena.",
  },
  {
    id: "training-captain-option-bargain",
    nodeId: "training-captain-opening",
    choiceId: "bargain",
    minimumFactionFame: 1,
  },
  {
    id: "training-captain-option-threaten",
    nodeId: "training-captain-opening",
    choiceId: "threaten",
    minimumMentalHp: 8,
    blockedReason: "Exige HP mental 8 ou maior para pressionar o capitão sem quebrar a moral da tropa.",
  },
];
`;
}

function renderDialogueTraversalService() {
	return `
const type = "dialogue-option-selected";
const message = "Opção de diálogo escolhida: Barganhar.";
const nextNode = "training-broker-bargain-response";
const failureCode = "DIALOGUE_OPTION_BLOCKED";
const mentalHpCurrent = 6;
const availability = evaluateDialogueOptionAvailability();
const blockedReason = "Exige HP mental 7 ou maior para pressionar o informante sem quebrar a cena.";
`;
}

function renderSocialDialogueTreeView() {
	return `
const option = {
  isAvailable: false,
  blockedReason: "Exige HP mental 7 ou maior para pressionar o informante sem quebrar a cena.",
};
evaluateDialogueOptionAvailability(option);
`;
}

function renderSocialEncounterService() {
	return `
const choiceLabel = "Barganhar";
const success = "Apelo social com Barganhar foi bem-sucedido.";
const fallback = "Apelo social entrou na fila oficial.";
`;
}

function renderServiceWorker() {
	return `
const CACHE_NAME = "fixture";
self.addEventListener("install", () => undefined);
self.addEventListener("activate", () => undefined);
self.addEventListener("fetch", () => handleNavigationRequest());
function handleNavigationRequest() {}
function handleRuntimeRequest() {}
`;
}

function renderSaveSchemas() {
	return `
export const CURRENT_SAVE_VERSION = 4;
const save = {
  clocks: [],
  socialEncounters: [],
  socialEncounterEvents: [],
};
`;
}

function renderDoc(title) {
	return `# ${title}\n\nAbra http://127.0.0.1:5173/ para testar.\n`;
}

function renderSocialEncounterDoc() {
	return `# Negociação Social

Abra http://127.0.0.1:5173/ para testar.

Escolha o campo Argumento, selecione Barganhar e confirme Modificador do argumento: +1.
Leia Fala do NPC, escolha Barganhar, confirme a troca proposta e o log Opção de diálogo escolhida: Barganhar.
Selecione Informante de Treino, confirme HP mental 6/6 e a opção bloqueada: Exige HP mental 7 ou maior para pressionar o informante sem quebrar a cena.
Selecione Capitão de Treino, confirme moral da tropa, escolha Barganhar e confirme custo da escolta. Pressionar exige: Exige HP mental 8 ou maior para pressionar o capitão sem quebrar a moral da tropa.
Confirme Fama 1, Infâmia e Retaliação.
Depois valide WorldState ao encerrar a negociação.
Ao escolher Pressionar, confirme a perda de 1 nível de Fama.
`;
}

function runSmoke(root) {
	return spawnSync(process.execPath, [scriptPath, "--root", root], {
		cwd: repoRoot,
		encoding: "utf8",
	});
}
