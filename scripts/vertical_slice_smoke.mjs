import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const parsedArgs = parseArgs(process.argv.slice(2));

if (!parsedArgs.success) {
	exitWithError(parsedArgs.error);
}

const result = await runVerticalSliceSmoke(parsedArgs.root);
if (!result.success) {
	exitWithError(result.errors.join("\n"));
}

console.log("vertical slice smoke is valid");

async function runVerticalSliceSmoke(root) {
	const errors = [];

	await validateFileContains(
		root,
		"src/app/model/navigation.ts",
		[
			'id: "characters"',
			'label: "Personagens"',
			'id: "compendium"',
			'label: "Compêndio"',
			'id: "inventory"',
			'label: "Inventário"',
			'id: "exploration"',
			'label: "Exploração"',
			'id: "camp"',
			'label: "Acampamento"',
			'id: "relations"',
			'label: "Relações"',
			'id: "magic"',
			'label: "Magia"',
			'id: "combat"',
			'label: "Combate"',
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/app/App.svelte",
		[
			"CharacterCreateForm",
			"CharacterList",
			"characterAncestryTraits",
			"traitSelections={characterTraitSelectionRecords}",
			"grantStartingEquipment",
			"const startingEquipment = await grantStartingEquipment({",
			"...startingEquipment.data.appendedEvents",
			"SaveLoadControls",
			"CombatEncounterPanel",
			"HexcrawlMapPanel",
			"CampHourPanel",
			"SocialRelationsPanel",
			"SocialEncounterPanel",
			"applySocialPressurePenaltyIntent",
			"applySocialPressurePenalty",
			"clockRecords = [...result.data.clocks]",
			"gainInfamy: socialRelationsSession.gainInfamy",
			"npcRelationshipRecords = [...result.data.npcRelationships]",
			"npcRelationships={npcRelationshipRecords}",
			"SpellCastPanel",
			"InventoryManagementPanel",
			"inventoryEvents: inventoryEventRecords",
			"equipmentLoadoutEvents: equipmentLoadoutEventRecords",
			"equipmentDurabilityEvents: equipmentDurabilityEventRecords",
			"inventoryEventRecords = [...restoredInventory.data]",
			"equipmentLoadoutEventRecords = [...restoredLoadout.data]",
			"equipmentDurabilityEventRecords = [...restoredDurability.data]",
			"CompendiumBrowser",
			"createCombatPersistentLoadoutResolver",
			"createCombatPotionBeltConsumer",
			"createCombatPotionBeltResolver",
			"resolveCombatPersistentLoadout",
			"resolveCombatPotionBelt",
			"consumeCombatPotionBelt",
			"buildEquipmentLoadout: combatEncounterSession.buildEquipmentLoadout",
			"inventoryService: inventorySession.service",
			"resolvePersistentLoadout={resolveCombatPersistentLoadout}",
			"resolvePotionBelt={resolveCombatPotionBelt}",
			"consumePotionBelt={consumeCombatPotionBelt}",
			"onOpenInventory",
			"resolveTrainingEnemyAttack",
			"trainingEnemyAttackService.resolveTrainingEnemyAttack",
			'data-testid="pwa-status"',
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
		"src/features/compendium-browser/model/compendiumBrowserView.ts",
		[
			"COMPENDIUM_CATEGORY_FILTER_OPTIONS",
			"Sistema: Sobreviv",
			"Sistema: Combate",
			"Sistema: Magia",
			"sourceLabel",
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
		"src/app/model/combatEncounterSession.ts",
		[
			"EquipmentLoadoutService",
			"buildEquipmentLoadout",
			"CombatTrainingEnemyAttackService",
			"trainingEnemyAttackService",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/app/model/combatPersistentLoadoutResolver.ts",
		[
			"InventoryManagementService",
			"toEquipmentLoadoutInput",
			"inventory.loadout.mainHand?.catalogItemId",
			"COMBAT_LOADOUT_INVENTORY_UNAVAILABLE",
			"COMBAT_LOADOUT_EQUIPMENT_INVALID",
			"findBrokenLoadoutEntry",
			"Combat cannot use broken equipment from inventory.",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/combat-encounter/ui/CombatEncounterPanel.svelte",
		[
			"resolvePersistentLoadout",
			"resolvePotionBelt",
			"consumePotionBelt",
			"refreshPersistentLoadout",
			"refreshPotionBelt",
			"usePotionBelt",
			"CombatPersistentLoadoutFailure",
			"CombatPotionBeltFailure",
			"activeWeaponProfile",
			"activeDefenseProfile",
			"createCombatTrainingEnemyDefenseProfile",
			"createCombatTrainingDefenderHitPoints",
			"createCombatTrainingDefenderHitPointsView",
			"applyCombatTrainingDefenderDamage",
			"resolveTrainingEnemyAttack",
			'data-testid="combat-persistent-loadout"',
			'data-testid="combat-persistent-loadout-weapon"',
			'data-testid="combat-persistent-loadout-shield"',
			'data-testid="combat-persistent-loadout-armor"',
			'data-testid="combat-open-inventory-button"',
			'data-testid="combat-equipped-weapon-helper"',
			'data-testid="combat-equipped-defense-profile"',
			'data-testid="combat-training-enemy-defense-summary"',
			'data-testid="combat-training-defender-hp"',
			'data-testid="combat-training-defender-terminal"',
			'data-testid="combat-potion-belt"',
			'data-testid="combat-potion-belt-summary"',
			'data-testid="combat-use-potion-belt-button"',
			"Loadout do Inventário",
			"Cinto de po&ccedil;&otilde;es",
			"Equipe uma arma no Invent\\u00e1rio antes de atacar.",
			"Repare ou desequipe o item quebrado no Invent\\u00e1rio antes de usar no combate.",
			"Aria usa perfil fixo de treino.",
			"HP de treino",
			"HP real",
			"Arma ativa:",
			"Defesa equipada",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/app/model/combatPotionBeltBridge.ts",
		[
			'POTION_BELT_CATALOG_ITEM_ID = "potion-belt-stack"',
			"PANDORHA_RULES.LOGISTICS.POTION_BELT_CAPACITY",
			"consumeConsumable",
			"onInventoryEventsChange",
			"Po\\u00e7\\u00e3o do cinto usada em treino. HP real n\\u00e3o foi alterado.",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/combat-encounter/model/combatPotionBelt.ts",
		[
			"CombatPotionBeltResolver",
			"CombatPotionBeltConsumer",
			"CombatPotionBeltSnapshot",
			"COMBAT_POTION_BELT_INVENTORY_UNAVAILABLE",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/inventory-management/model/inventoryManagementView.ts",
		[
			'entry.catalogItemId === "potion-belt-stack"',
			"Cinto de Po\\u00e7\\u00f5es",
			"mapDurabilityLabel",
			"Repare antes de equipar",
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
			'catalogItemId: "dagger", count: 2',
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
		"src/features/combat-encounter/model/combatTrainingDefenderHitPoints.ts",
		[
			"createCombatTrainingDefenderHitPointsView",
			"canReceiveTrainingDamage",
			"Teste recebido encerrado",
			"Reinicie o encontro para testar outro dano recebido",
			"nenhum novo dano de treino foi calculado",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/social-encounter/ui/SocialEncounterPanel.svelte",
		[
			"dialogueChoices",
			"dialogueNodes",
			"dialogueOptions",
			"factionFameLevelsByNpcId",
			"selectDialogueTreeOption",
			"chooseDialogueOption",
			"createSocialEncounterConsequenceFlag({",
			"createSocialPressurePenaltyIntent({",
			"dialogueOptions,",
			"onSocialPressurePenalty",
			'data-testid="social-choice-select"',
			'data-testid="social-choice-summary"',
			'data-testid="social-dialogue-tree"',
			'data-testid="social-dialogue-current-text"',
			'data-testid="social-dialogue-option"',
			"option.isAvailable",
			"option.blockedReason",
			"Fala do NPC",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/social-encounter/model/socialEncounterConsequences.ts",
		[
			"dialogueOptionId",
			"dialogueChoiceId",
			"dialogueChoiceLabel",
			"findLatestSelectedDialogueOption",
			"O NPC aceitou a troca proposta",
			"O NPC cedeu à pressão social",
			"social-pressure-fame-penalty",
			"social-pressure-infamy",
			"Pressionar este NPC aplicou perda de 1 nível de Fama",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/entities/dialogue-tree/model/dialogueTreeCatalog.ts",
		[
			"training-informant",
			"training-informant-option-threaten",
			"minimumMentalHp: 7",
			"blockedReason",
			"Exige HP mental 7 ou maior para pressionar o informante sem quebrar a cena.",
			"training-captain",
			"training-captain-option-bargain",
			"minimumFactionFame: 1",
			"training-captain-option-threaten",
			"minimumMentalHp: 8",
			"Exige HP mental 8 ou maior para pressionar o capitão sem quebrar a moral da tropa.",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/social-encounter/model/socialDialogueTreeView.ts",
		["isAvailable", "blockedReason", "evaluateDialogueOptionAvailability"],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/social-encounter/domain/DialogueTraversalService.ts",
		[
			"dialogue-option-selected",
			"Opção de diálogo escolhida",
			"nextNode",
			"DIALOGUE_OPTION_BLOCKED",
			"mentalHpCurrent",
			"evaluateDialogueOptionAvailability",
			"blockedReason",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/social-encounter/domain/SocialEncounterService.ts",
		["choiceLabel", "Apelo social com", "Apelo social entrou na fila oficial."],
		errors,
	);

	await validateFileContains(
		root,
		"public/pandorha-sw.js",
		[
			"CACHE_NAME",
			"install",
			"activate",
			"fetch",
			"message",
			"SKIP_WAITING",
			"handleNavigationRequest",
			"handleRuntimeRequest",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/save-load/model/saveLoadSchemas.ts",
		[
			"CURRENT_SAVE_VERSION = 9",
			"clocks",
			"socialEncounters",
			"socialEncounterEvents",
			"npcRelationships",
			"inventoryEvents",
			"equipmentLoadoutEvents",
			"equipmentDurabilityEvents",
			"characterTraitSelections",
		],
		errors,
	);

	for (const docPath of [
		"docs/user/character-creation.md",
		"docs/user/compendium-browser.md",
		"docs/user/inventory-management.md",
		"docs/user/combat-training.md",
		"docs/user/camp-training.md",
		"docs/user/social-relations.md",
		"docs/user/social-encounter.md",
		"docs/user/offline-smoke.md",
	]) {
		await validateFileContainsAny(
			root,
			docPath,
			["http://127.0.0.1:5173/", "http://localhost:5173/"],
			errors,
		);
	}

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

	await validateFileContains(
		root,
		"docs/user/inventory-management.md",
		[
			"kit inicial da classe",
			"Equipar arma",
			"Equipar escudo",
			"Vestir armadura",
			"Desequipe antes de remover",
			"Marcar danificado",
			"Marcar quebrado",
			"Reparar",
			"Cinto de Poções",
			"save local",
		],
		errors,
	);

	await validateFileContains(
		root,
		"docs/user/social-encounter.md",
		[
			"Fala do NPC",
			"Argumento",
			"Informante de Treino",
			"HP mental 6/6",
			"Barganhar",
			"troca proposta",
			"Exige HP mental 7 ou maior para pressionar o informante sem quebrar a cena.",
			"Capitão de Treino",
			"moral da tropa",
			"custo da escolta",
			"Fama 1",
			"Exige HP mental 8 ou maior para pressionar o capitão sem quebrar a moral da tropa.",
			"Modificador do argumento: +1",
			"Opção de diálogo escolhida: Barganhar",
			"WorldState",
			"Pressionar",
			"perda de 1 nível de Fama",
			"Infâmia",
			"Retaliação",
			"Relações por NPC",
		],
		errors,
	);

	await validateFileContains(
		root,
		"docs/user/combat-training.md",
		[
			"Arma equipada",
			"Espada Longa",
			"Armadura equipada",
			"Escudo equipado",
			"Defesa equipada",
			"CA equipada +3",
			"CA contra treino",
			"HP de treino",
			"HP real permanece intacto",
			"Teste recebido encerrado",
			"Reinicie o encontro para testar outro dano recebido",
			"Aria usa perfil fixo de treino",
			"Cinto de poções: 5/5",
			"Poção do cinto usada em treino. HP real não foi alterado.",
			"item quebrado",
			"Inventário",
			"não altera HP real, HP de treino ou estados oficiais",
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

async function validateFileContainsAny(root, relativePath, snippets, errors) {
	const contentResult = await readText(path.join(root, relativePath));
	if (!contentResult.success) {
		errors.push(contentResult.error);
		return;
	}

	if (!snippets.some((snippet) => contentResult.content.includes(snippet))) {
		errors.push(`${relativePath} is missing one of: ${snippets.join(" | ")}`);
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
