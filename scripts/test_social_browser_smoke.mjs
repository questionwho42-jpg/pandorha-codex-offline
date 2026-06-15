import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(repoRoot, "scripts", "social_browser_smoke.mjs");

test("social browser smoke passes with the Barganhar save/load contract", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runSmoke(root);

		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /social browser smoke is valid/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("social browser smoke fails when App stops saving social encounters", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/app/App.svelte": renderApp().replace(
				"socialEncounterEvents: socialEncounterEventRecords",
				"socialEncounterEvents: []",
			),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /src\/app\/App\.svelte/);
		assert.match(result.stderr, /socialEncounterEvents/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("social browser smoke fails when the guide drops the save/load restoration path", async () => {
	const root = await createFixtureRoot({
		docOverrides: {
			"docs/user/social-encounter.md": `
# Negociacao Social

Escolha Barganhar, clique em Fazer apelo e confirme WorldState.
Confirme Infâmia e Retaliação.
`,
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /docs\/user\/social-encounter\.md/);
		assert.match(result.stderr, /Relações por NPC|Salvar sessao/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("social browser smoke fails when Barganhar metadata is no longer tested", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/features/social-encounter/__tests__/socialEncounterConsequences.spec.ts":
				"const summary = 'generic consequence';",
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(
			result.stderr,
			/src\/features\/social-encounter\/__tests__\/socialEncounterConsequences\.spec\.ts/,
		);
		assert.match(result.stderr, /stores bargain metadata/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("social browser smoke fails when the pressure infamy clock contract is not tested", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/app/model/socialPressurePenaltySession.spec.ts":
				renderSocialPressurePenaltySessionSpec().replace(
					'source: "social-pressure"',
					'source: "manual"',
				),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(
			result.stderr,
			/src\/app\/model\/socialPressurePenaltySession\.spec\.ts/,
		);
		assert.match(result.stderr, /source: "social-pressure"/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createFixtureRoot({
	fileOverrides = {},
	docOverrides = {},
} = {}) {
	const root = await mkdtemp(path.join(os.tmpdir(), "pandorha-social-qa-"));
	const files = {
		"src/app/App.svelte": renderApp(),
		"src/features/social-encounter/ui/SocialEncounterPanel.svelte":
			renderSocialEncounterPanel(),
		"src/features/social-encounter/model/socialEncounterConsequences.ts":
			renderSocialEncounterConsequences(),
		"src/features/social-relations/ui/SocialRelationsPanel.svelte":
			renderSocialRelationsPanel(),
		"src/features/social-encounter/__tests__/socialEncounterConsequences.spec.ts":
			renderSocialEncounterConsequencesSpec(),
		"src/app/model/socialPressurePenaltySession.spec.ts":
			renderSocialPressurePenaltySessionSpec(),
		"src/features/save-load/model/saveLoadSchemas.ts": renderSaveSchemas(),
		"docs/process/vertical-slice-qa.md": renderVerticalSliceQa(),
		"docs/process/t84-social-rendered-browser-automation-evaluation.md":
			renderT84BrowserAutomationEvaluation(),
		"docs/user/social-encounter.md": renderSocialEncounterGuide(),
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

function renderApp() {
	return `
<SaveLoadControls onLoad={loadSession} onSave={saveSession} />
<SocialRelationsPanel
  clocks={clockRecords}
  npcRelationships={npcRelationshipRecords}
  npcs={socialEncounterSession.npcs}
/>
<SocialEncounterPanel
  factionFameLevelsByNpcId={factionFameLevelsByNpcId}
  onSocialPressurePenalty={applySocialPressurePenalty}
/>
import { applySocialPressurePenaltyIntent } from "./model/socialPressurePenaltySession";
const input = {
  gainInfamy: socialRelationsSession.gainInfamy,
  loseFame: socialRelationsSession.loseFame,
  npcRelationships: npcRelationshipRecords,
};
async function applySocialPressurePenalty() {}
clockRecords = [...result.data.clocks];
const snapshot = {
  worldState: worldStateRecords,
  socialEncounters: socialEncounterRecords,
  socialEncounterEvents: socialEncounterEventRecords,
  npcRelationships: npcRelationshipRecords,
};
worldStateRecords = [...result.data.worldState];
socialEncounterRecords = [...result.data.socialEncounters];
socialEncounterEventRecords = [...result.data.socialEncounterEvents];
npcRelationshipRecords = [...result.data.npcRelationships];
`;
}

function renderSocialEncounterPanel() {
	return `
<select data-testid="social-npc-select"></select>
<button data-testid="social-start-encounter">Iniciar negociacao</button>
<button data-testid="social-dialogue-option">Barganhar</button>
<button data-testid="social-resolve-appeal">Fazer apelo</button>
<div data-testid="social-worldstate-consequence"></div>
const fame = factionFameLevelsByNpcId;
createSocialEncounterConsequenceFlag({
  dialogueOptions,
});
createSocialPressurePenaltyIntent({
  dialogueOptions,
});
onSocialPressurePenalty();
upsertSocialEncounterConsequenceFlag(worldState, consequence);
`;
}

function renderSocialEncounterConsequences() {
	return `
const dialogueOptionId = "training-broker-option-bargain";
const dialogueChoiceId = "bargain";
const dialogueChoiceLabel = "Barganhar";
function findLatestSelectedDialogueOption() {}
const summary = "O NPC aceitou a troca proposta";
const kind = "social-pressure-fame-penalty";
const infamy = "social-pressure-infamy";
function createSocialPressureInfamyFlag() {}
const pressure = "Pressionar este NPC aplicou perda de 1 nível de Fama";
`;
}

function renderSocialEncounterConsequencesSpec() {
	return `
it("stores bargain metadata", () => {
  expect(value).toMatchObject({
    dialogueChoiceLabel: "Barganhar",
  });
});
it("creates a pressure penalty intent", () => {});
createSocialEncounterConsequenceView();
`;
}

function renderSocialPressurePenaltySessionSpec() {
	return `
it("applies Infamia and creates a retaliation clock when Fame is already zero", async () => {
  expect(result.data.infamyApplied).toBe(true);
  expect(result.data.npcRelationshipApplied).toBe(true);
  expect(result.data.retaliationClockAdvanced).toBe(true);
  expect(result.data.retaliationClockCreated).toBe(true);
  expect(result.data.npcRelationships[0].appliedPressureKeysJson).toContain("social-pressure-social-encounter-primary");
  expect(result.data.clocks).toEqual([
    expect.objectContaining({
      id: "retaliation-training-merchant-league-social-encounter-primary",
      source: "social-pressure",
    }),
  ]);
  expect(fakeGainInfamy.calls).toBe(1);
});
`;
}

function renderSocialRelationsPanel() {
	return `
const clocks = [];
const npcRelationshipFilter = "all";
const npcRelationships = [];
<div data-testid="npc-relationship-list">Relações por NPC</div>
<div data-testid="npc-relationship-filter">Todos</div>
<button data-testid="npc-relationship-filter-option">Atenção</button>
<section data-testid="npc-relationship-group">Liga Mercante de Treino</section>
<div data-testid="npc-relationship-row">Corretora de Treino</div>
const empty = view.npcFilterEmptyStateLabel;
<p data-testid="social-retaliation-clock">Retaliação: Liga Mercante de Treino - 0/4 fatias</p>
`;
}

function renderSaveSchemas() {
	return `
export const CURRENT_SAVE_VERSION = 6;
const fields = ["clocks", "socialEncounters", "socialEncounterEvents", "npcRelationships", "inventoryEvents"];
`;
}

function renderVerticalSliceQa() {
	return `
Corretora de Treino
Barganhar
Fazer apelo
WorldState
Infâmia
Retaliação
Relações por NPC
Salvar sessao
recarregue
Carregar save
restaurados
`;
}

function renderT84BrowserAutomationEvaluation() {
	return `
Decision: keep qa:social-browser-smoke contractual.
Browser Use remains mandatory for social UI changes.
Do not add Playwright dependency until rendered browser checks are stable.
`;
}

function renderSocialEncounterGuide() {
	return `
Barganhar
Fazer apelo
WorldState
Infâmia
Retaliação
Relações por NPC
Salvar sessao
recarregue
Carregar save
`;
}

function runSmoke(root) {
	return spawnSync(process.execPath, [scriptPath, "--root", root], {
		cwd: repoRoot,
		encoding: "utf8",
	});
}
