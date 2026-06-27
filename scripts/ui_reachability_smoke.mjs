import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const parsedArgs = parseArgs(process.argv.slice(2));
const compendiumSearchServicePath = [
	"src/entities/compendium/domain",
	"CompendiumSearchService.ts",
].join("/");

if (!parsedArgs.success) {
	exitWithError(parsedArgs.error);
}

const result = await runUiReachabilitySmoke(parsedArgs.root);
if (!result.success) {
	exitWithError(result.errors.join("\n"));
}

console.log("ui reachability smoke is valid");

async function runUiReachabilitySmoke(root) {
	const errors = [];

	await validateFileContains(
		root,
		"index.html",
		[
			'rel="icon"',
			'href="/favicon.svg"',
			'rel="manifest"',
			'href="/manifest.webmanifest"',
		],
		errors,
	);

	await validateFileContains(
		root,
		"public/favicon.svg",
		["<svg", "#1c1917", "#dab973"],
		errors,
	);

	await validateFileContains(
		root,
		"public/manifest.webmanifest",
		[
			'"name": "Pandorha Engine"',
			'"short_name": "Pandorha"',
			'"display": "standalone"',
			'"/favicon.svg"',
		],
		errors,
	);

	await validateFileContains(
		root,
		"public/pandorha-sw.js",
		['addEventListener("message"', '"SKIP_WAITING"', "self.skipWaiting()"],
		errors,
	);

	await validateFileContains(
		root,
		"src/app/App.svelte",
		[
			'activeView === "characters"',
			"CharacterCreateForm",
			"CharacterList",
			"characterAncestryTraits",
			"ancestryTraits={characterAncestryTraits}",
			"traitSelections={characterTraitSelectionRecords}",
			"grantStartingEquipment",
			"const startingEquipment = await grantStartingEquipment({",
			"inventoryEventRecords = [",
			"...startingEquipment.data.appendedEvents",
			'activeView === "compendium"',
			"CompendiumBrowser",
			'activeView === "inventory"',
			"InventoryManagementPanel",
			"inventoryEvents: inventoryEventRecords",
			"equipmentLoadoutEvents: equipmentLoadoutEventRecords",
			"equipmentDurabilityEvents: equipmentDurabilityEventRecords",
			"inventoryEventRecords = [...restoredInventory.data]",
			"equipmentLoadoutEventRecords = [...restoredLoadout.data]",
			"equipmentDurabilityEventRecords = [...restoredDurability.data]",
			"equipmentLoadoutEvents={equipmentLoadoutEventRecords}",
			"equipmentDurabilityEvents={equipmentDurabilityEventRecords}",
			"onLoadoutEventsChange",
			"onDurabilityEventsChange",
			'activeView === "exploration"',
			"HexcrawlMapPanel",
			'activeView === "camp"',
			"CampHourPanel",
			'activeView === "relations"',
			"SocialRelationsPanel",
			"SocialEncounterPanel",
			'activeView === "magic"',
			"SpellCastPanel",
			'activeView === "combat"',
			"CombatEncounterPanel",
			"createCombatPersistentLoadoutResolver",
			"createCombatPotionBeltConsumer",
			"createCombatPotionBeltResolver",
			"resolvePersistentLoadout={resolveCombatPersistentLoadout}",
			"resolvePotionBelt={resolveCombatPotionBelt}",
			"consumePotionBelt={consumeCombatPotionBelt}",
			"onOpenInventory",
			"activeItem.description",
			'data-testid="pwa-install-status"',
			'data-testid="pwa-install-button"',
			'data-testid="pwa-update-status"',
			'data-testid="pwa-update-button"',
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/character-list/ui/CharacterList.svelte",
		[
			'data-testid="character-trait-selection-list"',
			'data-testid="character-trait-selection-item"',
			"Traços de ancestralidade",
		],
		errors,
	);

	await validateFileContains(
		root,
		compendiumSearchServicePath,
		[
			"compendiumCategorySchema",
			"category:",
			'z.literal("all")',
			"max(200)",
			"entry.category === category",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/compendium-browser/ui/CompendiumBrowser.svelte",
		[
			"selectedCategory",
			"selectCategory",
			"limit: 200",
			'data-testid="compendium-category-filter"',
			'data-testid="compendium-category-option"',
			'data-testid="compendium-pagination"',
			'data-testid="compendium-previous-page"',
			'data-testid="compendium-next-page"',
			'data-testid="compendium-clear-filters"',
			"Vanguarda, contramagia ou descanso",
			"sourceLabel",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/combat-encounter/ui/CombatEncounterPanel.svelte",
		[
			'data-testid="combat-persistent-loadout"',
			'data-testid="combat-persistent-loadout-weapon"',
			'data-testid="combat-persistent-loadout-shield"',
			'data-testid="combat-persistent-loadout-armor"',
			'data-testid="combat-open-inventory-button"',
			"resolvePersistentLoadout",
			"resolvePotionBelt",
			"consumePotionBelt",
			'data-testid="combat-potion-belt"',
			'data-testid="combat-potion-belt-summary"',
			'data-testid="combat-use-potion-belt-button"',
			"HP real",
		],
		errors,
	);

	await validateFileDoesNotContain(
		root,
		"src/features/combat-encounter/ui/CombatEncounterPanel.svelte",
		[
			'data-testid="combat-weapon-select"',
			'data-testid="combat-armor-select"',
			'data-testid="combat-shield-select"',
		],
		"seletor local de loadout de combate",
		errors,
	);

	await validateFileContains(
		root,
		"src/features/inventory-management/ui/InventoryManagementPanel.svelte",
		[
			'data-testid="inventory-character-select"',
			'data-testid="inventory-open-characters"',
			'data-testid="inventory-catalog-list"',
			'data-testid="inventory-add-equipment"',
			'data-testid="inventory-add-consumable"',
			'data-testid="inventory-equipped-loadout"',
			'data-testid="inventory-equip-entry"',
			'data-testid="inventory-unequip-entry"',
			'data-testid="inventory-increment-consumable"',
			'data-testid="inventory-consume-consumable"',
			'data-testid="inventory-remove-entry"',
			'data-testid="inventory-mark-damaged"',
			'data-testid="inventory-mark-broken"',
			'data-testid="inventory-repair-equipment"',
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/entities/equipment/model/equipmentCatalog.ts",
		[
			'id: "chainmail"',
			'id: "shortbow"',
			'id: "staff"',
			'id: "rapier"',
			'id: "luxury-padded-armor"',
			'id: "adventurer-kit-stack"',
			'id: "grimoire-stack"',
			'id: "nobility-letter-stack"',
			"OFFICIAL_LOADOUT_SUPPORTED_EQUIPMENT_IDS",
			"isOfficialLoadoutSupportedEquipmentId",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/character-starting-equipment/model/startingEquipmentKit.ts",
		[
			"resolveStartingEquipmentKit",
			'classId: "vanguard"',
			'catalogItemId: "chainmail"',
			'catalogItemId: "adventurer-kit-stack"',
			'catalogItemId: "dagger", count: 2',
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/inventory-management/model/inventoryManagementView.ts",
		[
			"isOfficialLoadoutSupportedEquipmentId(entry.catalogItemId)",
			"mapDurabilityLabel",
			"Repare antes de equipar",
		],
		errors,
	);

	await validateFileDoesNotContain(
		root,
		"src/app/model/navigation.ts",
		[
			"pronto para receber as próximas telas",
			"será implementada",
			"serão implementadas",
		],
		"placeholder obsoleto",
		errors,
	);

	await validateFileDoesNotContain(
		root,
		"docs/user/character-creation.md",
		[
			"personagem será perdido",
			"persistência real, banco SQLite/OPFS",
			"ainda não aparecem na listagem",
			"não são persistidos na ficha salva",
		],
		"documentação obsoleta",
		errors,
	);

	await validateFileContains(
		root,
		"docs/user/character-creation.md",
		[
			"preservam personagens e traços escolhidos",
			"com os mesmos 3 traços",
			"kit inicial da classe",
		],
		errors,
	);

	await validateFileContains(
		root,
		"docs/user/compendium-browser.md",
		[
			"Vanguarda",
			"contramagia",
			"descanso",
			"Sistema: Magia",
			"Sistema: Combate",
			"Sistema: Sobreviv",
			"ranking",
			"pagina",
			"arquivo e linha",
		],
		errors,
	);

	await validateFileContainsInOrder(
		root,
		"src/features/camp-hour/ui/CampHourPanel.svelte",
		[
			"events = [...result.data.events]",
			"hydratedKey = createHydrationKey({",
			"onStateChange({",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/camp-hour/ui/CampHourPanel.svelte",
		[
			"prepareNextHour",
			"lifecycleState",
			'data-testid="camp-prepare-next-hour"',
			"Preparar próxima hora",
			"mapCampHourTransitionFailureToMessage",
			'"next-hour-ready"',
		],
		errors,
	);

	await validateFileContains(
		root,
		"docs/process/vertical-slice-qa.md",
		[
			"qa:ui-reachability",
			"Browser do Codex",
			"Vanguarda",
			"contramagia",
			"descanso",
			"arquivo e linha",
		],
		errors,
	);

	await validateFileContains(
		root,
		"docs/user/camp-training.md",
		[
			"## Limitações atuais",
			"Preparar próxima hora",
			"Não existe comando de noite completa",
			"save continua na versão 9",
		],
		errors,
	);

	await validateFileContains(
		root,
		"docs/process/vertical-slice-qa.md",
		[
			"O inventário editável pertence ao personagem, permite equipar/desequipar arma, escudo e armadura",
			"persiste inventário + loadout + durabilidade no save v9",
			"cinto de poções consome 1 unidade pelo inventário persistido sem alterar HP real",
			"combate ainda usa alvos de treino e HP de treino local",
		],
		errors,
	);

	return errors.length === 0 ? { success: true } : { success: false, errors };
}

async function validateFileContains(
	root,
	relativePath,
	requiredSnippets,
	errors,
) {
	const contentResult = await readText(path.join(root, relativePath));
	if (!contentResult.success) {
		errors.push(contentResult.error);
		return;
	}

	for (const snippet of requiredSnippets) {
		if (!contentResult.content.includes(snippet)) {
			errors.push(`${relativePath} is missing required text: ${snippet}`);
		}
	}
}

async function validateFileDoesNotContain(
	root,
	relativePath,
	forbiddenSnippets,
	label,
	errors,
) {
	const contentResult = await readText(path.join(root, relativePath));
	if (!contentResult.success) {
		errors.push(contentResult.error);
		return;
	}

	for (const snippet of forbiddenSnippets) {
		if (contentResult.content.includes(snippet)) {
			errors.push(`${relativePath} contains ${label}: ${snippet}`);
		}
	}
}

async function validateFileContainsInOrder(
	root,
	relativePath,
	requiredSnippets,
	errors,
) {
	const contentResult = await readText(path.join(root, relativePath));
	if (!contentResult.success) {
		errors.push(contentResult.error);
		return;
	}

	let cursor = 0;
	for (const snippet of requiredSnippets) {
		const index = contentResult.content.indexOf(snippet, cursor);
		if (index < 0) {
			errors.push(
				`${relativePath} is missing ordered text after offset ${cursor}: ${snippet}`,
			);
			return;
		}

		cursor = index + snippet.length;
	}
}

async function readText(filePath) {
	try {
		return { success: true, content: await readFile(filePath, "utf8") };
	} catch (error) {
		return {
			success: false,
			error: `Could not read ${filePath}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		};
	}
}

function parseArgs(args) {
	let root = repoRoot;

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg !== "--root") {
			return { success: false, error: `Unsupported option: ${arg}` };
		}

		const value = args[index + 1];
		if (!value || value.startsWith("--")) {
			return { success: false, error: "Missing value for --root" };
		}

		root = path.resolve(value);
		index += 1;
	}

	return { success: true, root };
}

function exitWithError(message) {
	console.error(message);
	process.exit(1);
}
