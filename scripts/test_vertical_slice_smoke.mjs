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

test("vertical slice smoke fails when the camp guide loses the next-hour flow", async () => {
	const root = await createFixtureRoot({
		docOverrides: {
			"docs/user/camp-training.md": renderDoc("Acampamento"),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /Preparar próxima hora/);
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

test("vertical slice smoke fails when combat persistent loadout contract is missing", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/features/combat-encounter/ui/CombatEncounterPanel.svelte":
				renderCombatEncounterPanel().replace(
					'data-testid="combat-persistent-loadout"',
					'data-testid="combat-target-select"',
				),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(
			result.stderr,
			/src\/features\/combat-encounter\/ui\/CombatEncounterPanel\.svelte/,
		);
		assert.match(result.stderr, /combat-persistent-loadout/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("vertical slice smoke fails when combat potion belt access is missing", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/features/combat-encounter/ui/CombatEncounterPanel.svelte":
				renderCombatEncounterPanel().replace(
					'data-testid="combat-use-potion-belt-button"',
					'data-testid="combat-use-potion-belt-missing"',
				),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(
			result.stderr,
			/src\/features\/combat-encounter\/ui\/CombatEncounterPanel\.svelte/,
		);
		assert.match(result.stderr, /combat-use-potion-belt-button/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("vertical slice smoke fails when compendium category filters are missing", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/features/compendium-browser/ui/CompendiumBrowser.svelte":
				renderCompendiumBrowser().replace(
					'data-testid="compendium-category-filter"',
					'data-testid="compendium-filter-missing"',
				),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(
			result.stderr,
			/src\/features\/compendium-browser\/ui\/CompendiumBrowser\.svelte/,
		);
		assert.match(result.stderr, /compendium-category-filter/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("vertical slice smoke fails when PWA install and update controls are missing", async () => {
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

test("vertical slice smoke fails when obsolete combat loadout selectors remain", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/features/combat-encounter/ui/CombatEncounterPanel.svelte": `${renderCombatEncounterPanel()}\n<select data-testid="combat-weapon-select"></select>`,
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(
			result.stderr,
			/src\/features\/combat-encounter\/ui\/CombatEncounterPanel\.svelte/,
		);
		assert.match(result.stderr, /seletor local de loadout de combate/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("vertical slice smoke fails when combat training defender terminal contract is missing", async () => {
	const root = await createFixtureRoot({
		fileOverrides: {
			"src/features/combat-encounter/ui/CombatEncounterPanel.svelte":
				renderCombatEncounterPanel().replace(
					'data-testid="combat-training-defender-terminal"',
					'data-testid="combat-training-defender-hp"',
				),
		},
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(
			result.stderr,
			/src\/features\/combat-encounter\/ui\/CombatEncounterPanel\.svelte/,
		);
		assert.match(result.stderr, /combat-training-defender-terminal/);
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
		"src/app/model/combatEncounterSession.ts": renderCombatEncounterSession(),
		"src/app/model/combatPotionBeltBridge.ts": renderCombatPotionBeltBridge(),
		"src/app/model/combatPersistentLoadoutResolver.ts":
			renderCombatPersistentLoadoutResolver(),
		"src/features/character-starting-equipment/model/startingEquipmentKit.ts":
			renderStartingEquipmentKit(),
		"src/features/compendium-browser/model/compendiumBrowserView.ts":
			renderCompendiumBrowserView(),
		"src/features/compendium-browser/ui/CompendiumBrowser.svelte":
			renderCompendiumBrowser(),
		"src/features/combat-encounter/ui/CombatEncounterPanel.svelte":
			renderCombatEncounterPanel(),
		"src/features/combat-encounter/model/combatPotionBelt.ts":
			renderCombatPotionBeltModel(),
		"src/features/combat-encounter/model/combatTrainingDefenderHitPoints.ts":
			renderCombatTrainingDefenderHitPoints(),
		"src/features/inventory-management/model/inventoryManagementView.ts":
			renderInventoryManagementView(),
		"src/features/character-list/ui/CharacterList.svelte":
			renderCharacterList(),
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
		"docs/user/compendium-browser.md": renderCompendiumDoc(),
		"docs/user/inventory-management.md": renderInventoryDoc(),
		"docs/user/combat-training.md": renderCombatTrainingDoc(),
		"docs/user/camp-training.md": renderCampDoc(),
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
CharacterList;
const characterAncestryTraits = [];
traitSelections={characterTraitSelectionRecords};
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
npcRelationshipRecords = [...result.data.npcRelationships];
npcRelationships={npcRelationshipRecords};
SpellCastPanel;
InventoryManagementPanel;
inventoryEvents: inventoryEventRecords;
equipmentLoadoutEvents: equipmentLoadoutEventRecords;
equipmentDurabilityEvents: equipmentDurabilityEventRecords;
inventoryEventRecords = [...restoredInventory.data];
equipmentLoadoutEventRecords = [...restoredLoadout.data];
equipmentDurabilityEventRecords = [...restoredDurability.data];
grantStartingEquipment;
const startingEquipment = await grantStartingEquipment({
	characterId: result.data.id,
	classId: input.classId,
});
inventoryEventRecords = [
	...inventoryEventRecords,
	...startingEquipment.data.appendedEvents,
];
CompendiumBrowser;
createCombatPersistentLoadoutResolver;
createCombatPotionBeltConsumer;
createCombatPotionBeltResolver;
const resolveCombatPersistentLoadout = createCombatPersistentLoadoutResolver({
  buildEquipmentLoadout: combatEncounterSession.buildEquipmentLoadout,
  inventoryService: inventorySession.service,
});
const resolveCombatPotionBelt = createCombatPotionBeltResolver({
  inventoryService: inventorySession.service,
});
const consumeCombatPotionBelt = createCombatPotionBeltConsumer({
  getInventoryEvents: () => inventoryEventRecords,
  inventoryService: inventorySession.service,
  onInventoryEventsChange: (records) => {
    inventoryEventRecords = [...records];
  },
});
onOpenInventory={() => { activeView = "inventory"; }};
resolvePersistentLoadout={resolveCombatPersistentLoadout};
resolvePotionBelt={resolveCombatPotionBelt};
consumePotionBelt={consumeCombatPotionBelt};
resolveTrainingEnemyAttack={(input) => combatEncounterSession.trainingEnemyAttackService.resolveTrainingEnemyAttack(input)};
</script>
<p data-testid="pwa-status">Offline disponível neste navegador.</p>
<p data-testid="pwa-install-status">Instalação disponível neste navegador.</p>
<button data-testid="pwa-install-button">Instalar app</button>
<p data-testid="pwa-update-status">Atualização disponível.</p>
<button data-testid="pwa-update-button">Atualizar agora</button>
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
				{ catalogKind: "equipment", catalogItemId: "dagger", count: 2 },
			],
		},
	};
}
`;
}

function renderCompendiumBrowserView() {
	return `
export const COMPENDIUM_CATEGORY_FILTER_OPTIONS = [
	{ id: "all", label: "Todas" },
	{ id: "system-survival", label: "Sistema: Sobrevivência" },
	{ id: "system-combat", label: "Sistema: Combate" },
	{ id: "system-magic", label: "Sistema: Magia" },
];
const sourceLabel = "docs/system/magic/12-00-codex-de-magia.md:1";
`;
}

function renderCompendiumBrowser() {
	return `
let selectedCategory = $state("all");
function selectCategory(category) {
	selectedCategory = category;
}
runSearch(query, selectedCategory);
searchEntries({ category: selectedCategory, limit: 200, query });
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

function renderCombatEncounterSession() {
	return `
import { EquipmentLoadoutService } from "$lib/entities/equipment";
import { CombatTrainingEnemyAttackService } from "$lib/features/combat-encounter";
const session = {
  buildEquipmentLoadout: () => new EquipmentLoadoutService().buildLoadout(),
  trainingEnemyAttackService: new CombatTrainingEnemyAttackService(),
};
`;
}

function renderCombatPersistentLoadoutResolver() {
	return `
import type { InventoryManagementService } from "$lib/features/inventory-management";
function toEquipmentLoadoutInput(inventory) {
  return {
    mainHandWeaponId: inventory.loadout.mainHand?.catalogItemId,
    offHandShieldId: inventory.loadout.offHand?.catalogItemId,
    armorId: inventory.loadout.armor?.catalogItemId,
  };
}
const inventoryFailure = "COMBAT_LOADOUT_INVENTORY_UNAVAILABLE";
const equipmentFailure = "COMBAT_LOADOUT_EQUIPMENT_INVALID";
function findBrokenLoadoutEntry() {}
const brokenMessage = "Combat cannot use broken equipment from inventory.";
`;
}

function renderCombatPotionBeltBridge() {
	return `
const POTION_BELT_CATALOG_ITEM_ID = "potion-belt-stack";
const POTION_BELT_CAPACITY = PANDORHA_RULES.LOGISTICS.POTION_BELT_CAPACITY;
const log = "Po\\u00e7\\u00e3o do cinto usada em treino. HP real n\\u00e3o foi alterado.";
function consume(input) {
  input.inventoryService.consumeConsumable({ entryId: input.entryId, quantity: 1 });
  input.onInventoryEventsChange([]);
}
`;
}

function renderCombatEncounterPanel() {
	return `
<script>
export let resolvePersistentLoadout = () => undefined;
export let resolvePotionBelt = () => undefined;
export let consumePotionBelt = () => undefined;
export let resolveTrainingEnemyAttack = () => undefined;
const failure = "CombatPersistentLoadoutFailure";
const potionFailure = "CombatPotionBeltFailure";
const activeWeaponProfile = {};
const activeDefenseProfile = {};
refreshPersistentLoadout();
refreshPotionBelt();
usePotionBelt();
createCombatTrainingEnemyDefenseProfile();
createCombatTrainingDefenderHitPoints();
createCombatTrainingDefenderHitPointsView();
applyCombatTrainingDefenderDamage();
</script>
<section data-testid="combat-persistent-loadout">
  <p>Loadout do Inventário</p>
  <p data-testid="combat-persistent-loadout-weapon">Arma equipada: Espada Longa.</p>
  <p data-testid="combat-persistent-loadout-shield">Escudo equipado: Escudo Redondo.</p>
  <p data-testid="combat-persistent-loadout-armor">Armadura equipada: Armadura de Couro.</p>
  <button data-testid="combat-open-inventory-button">Abrir Inventário</button>
</section>
<section data-testid="combat-potion-belt">
  <p>Cinto de po&ccedil;&otilde;es</p>
  <p data-testid="combat-potion-belt-summary">Cinto de po&ccedil;&otilde;es: 5/5</p>
  <button data-testid="combat-use-potion-belt-button">Usar poção do cinto</button>
  <p>Uso de treino: não altera HP real, HP de treino ou estados oficiais.</p>
</section>
<p data-testid="combat-equipped-weapon-helper">
  Aria usa perfil fixo de treino.
  Arma ativa: Espada Longa.
  Equipe uma arma no Invent\\u00e1rio antes de atacar.
  Repare ou desequipe o item quebrado no Invent\\u00e1rio antes de usar no combate.
</p>
<p data-testid="combat-equipped-defense-profile">Defesa equipada</p>
<p data-testid="combat-training-enemy-defense-summary">CA contra treino</p>
<p data-testid="combat-training-defender-hp">HP de treino de Lia: 14/14</p>
<div data-testid="combat-training-defender-terminal">
  <p>Teste recebido encerrado</p>
  <p>Reinicie o encontro para testar outro dano recebido.</p>
</div>
`;
}

function renderCombatPotionBeltModel() {
	return `
export type CombatPotionBeltResolver = unknown;
export type CombatPotionBeltConsumer = unknown;
export type CombatPotionBeltSnapshot = unknown;
const code = "COMBAT_POTION_BELT_INVENTORY_UNAVAILABLE";
`;
}

function renderInventoryManagementView() {
	return `
function mapCategoryLabel(entry) {
  if (entry.catalogItemId === "potion-belt-stack") {
    return "Cinto de Po\\u00e7\\u00f5es";
  }
  return "Consumivel";
}
function mapDurabilityLabel() {}
const message = "Repare antes de equipar";
`;
}

function renderCombatTrainingDefenderHitPoints() {
	return `
export function createCombatTrainingDefenderHitPointsView() {
  return {
    canReceiveTrainingDamage: false,
    terminalLabel: "Teste recebido encerrado",
    terminalDescription: "Reinicie o encontro para testar outro dano recebido.",
  };
}
const repeatedDamageLog = "nenhum novo dano de treino foi calculado";
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
self.addEventListener("message", (event) => {
	if (event.data?.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});
function handleNavigationRequest() {}
function handleRuntimeRequest() {}
`;
}

function renderSaveSchemas() {
	return `
export const CURRENT_SAVE_VERSION = 9;
const save = {
  clocks: [],
  socialEncounters: [],
  socialEncounterEvents: [],
  npcRelationships: [],
  inventoryEvents: [],
  equipmentLoadoutEvents: [],
  equipmentDurabilityEvents: [],
  characterTraitSelections: [],
};
`;
}

function renderDoc(title) {
	return `# ${title}\n\nAbra http://127.0.0.1:5173/ para testar.\n`;
}

function renderCompendiumDoc() {
	return `# Compendio

Abra http://127.0.0.1:5173/ para testar.

Busque Vanguarda, contramagia e descanso.
Filtre por Sistema: Magia, Sistema: Combate e Sistema: Sobrevivencia.
Confirme ranking textual e navegacao por pagina.
Selecione uma entrada e confirme fonte por arquivo e linha.
`;
}

function renderCampDoc() {
	return `# Acampamento

Abra http://127.0.0.1:5173/ para testar.

Resolva a hora 1 e confirme o log.
Clique em Preparar próxima hora e confirme a hora 2.
O save continua na versão 9.
Ainda nao existe noite completa.
`;
}

function renderInventoryDoc() {
	return `# Inventario

Abra http://127.0.0.1:5173/ para testar.

Personagens novos recebem o kit inicial da classe.
Equipar arma
Equipar escudo
Vestir armadura
Desequipe antes de remover
Marcar danificado
Marcar quebrado
Reparar
Cinto de Poções
save local
`;
}

function renderCombatTrainingDoc() {
	return `# Combate

Abra http://127.0.0.1:5173/ para testar.

Arma equipada aparece para personagens da sessao.
Espada Longa e a arma padrao.
Armadura equipada aparece para personagens da sessao.
Escudo equipado aparece para personagens da sessao.
Defesa equipada mostra CA equipada +3.
CA contra treino aparece para ataque recebido.
HP de treino aparece como medidor local.
HP real permanece intacto.
Cinto de poções: 5/5.
Poção do cinto usada em treino. HP real não foi alterado.
item quebrado
Inventário
O uso de treino não altera HP real, HP de treino ou estados oficiais.
Teste recebido encerrado aparece quando o HP de treino chega a 0.
Reinicie o encontro para testar outro dano recebido.
Aria usa perfil fixo de treino.
`;
}

function renderSocialEncounterDoc() {
	return `# Negociação Social

Abra http://127.0.0.1:5173/ para testar.

Escolha o campo Argumento, selecione Barganhar e confirme Modificador do argumento: +1.
Leia Fala do NPC, escolha Barganhar, confirme a troca proposta e o log Opção de diálogo escolhida: Barganhar.
Selecione Informante de Treino, confirme HP mental 6/6 e a opção bloqueada: Exige HP mental 7 ou maior para pressionar o informante sem quebrar a cena.
Selecione Capitão de Treino, confirme moral da tropa, escolha Barganhar e confirme custo da escolta. Pressionar exige: Exige HP mental 8 ou maior para pressionar o capitão sem quebrar a moral da tropa.
Confirme Fama 1, Infâmia e Retaliação.
Confirme Relações por NPC.
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
