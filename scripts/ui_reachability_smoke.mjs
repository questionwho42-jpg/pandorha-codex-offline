import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const parsedArgs = parseArgs(process.argv.slice(2));

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
		['rel="icon"', 'href="/favicon.svg"'],
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
		"src/app/App.svelte",
		[
			'activeView === "characters"',
			"CharacterCreateForm",
			"CharacterList",
			'activeView === "compendium"',
			"CompendiumBrowser",
			'activeView === "inventory"',
			"InventoryManagementPanel",
			"inventoryEvents: inventoryEventRecords",
			"equipmentLoadoutEvents: equipmentLoadoutEventRecords",
			"inventoryEventRecords = [...restoredInventory.data]",
			"equipmentLoadoutEventRecords = [...restoredLoadout.data]",
			"equipmentLoadoutEvents={equipmentLoadoutEventRecords}",
			"onLoadoutEventsChange",
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
			"resolvePersistentLoadout={resolveCombatPersistentLoadout}",
			"onOpenInventory",
			"activeItem.description",
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
		["personagem será perdido", "persistência real, banco SQLite/OPFS"],
		"documentação obsoleta",
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
		"docs/process/vertical-slice-qa.md",
		["qa:ui-reachability", "Browser do Codex"],
		errors,
	);

	await validateFileContains(
		root,
		"docs/user/camp-training.md",
		["## Limitações atuais", "A versão atual resolve apenas 1 hora."],
		errors,
	);

	await validateFileContains(
		root,
		"docs/process/vertical-slice-qa.md",
		[
			"O inventário editável pertence ao personagem, permite equipar/desequipar arma, escudo e armadura",
			"persiste inventário + loadout no save v7",
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
