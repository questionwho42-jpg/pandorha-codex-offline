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
			"InventoryReadOnlyPanel",
			"CompendiumBrowser",
			"buildEquipmentLoadout={combatEncounterSession.buildEquipmentLoadout}",
			"defaultWeaponId={combatEncounterSession.defaultWeaponId}",
			"defaultArmorId={combatEncounterSession.defaultArmorId}",
			"defaultShieldId={combatEncounterSession.defaultShieldId}",
			"equipmentWeapons={combatEncounterSession.equipmentWeapons}",
			"equipmentArmors={combatEncounterSession.equipmentArmors}",
			"equipmentShields={combatEncounterSession.equipmentShields}",
			"resolveTrainingEnemyAttack",
			"trainingEnemyAttackService.resolveTrainingEnemyAttack",
			'data-testid="pwa-status"',
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/app/model/combatEncounterSession.ts",
		[
			"EquipmentLoadoutService",
			'const DEFAULT_COMBAT_WEAPON_ID = "longsword"',
			'const DEFAULT_COMBAT_ARMOR_ID = "leather-armor"',
			'const DEFAULT_COMBAT_SHIELD_ID = "round-shield"',
			"buildEquipmentLoadout",
			"defaultWeaponId",
			"defaultArmorId",
			"defaultShieldId",
			"equipmentWeapons",
			"equipmentArmors",
			"equipmentShields",
			"CombatTrainingEnemyAttackService",
			"trainingEnemyAttackService",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/combat-encounter/ui/CombatEncounterPanel.svelte",
		[
			"buildEquipmentLoadout",
			"activeWeaponProfile",
			"activeDefenseProfile",
			"createCombatTrainingEnemyDefenseProfile",
			"createCombatTrainingDefenderHitPoints",
			"createCombatTrainingDefenderHitPointsView",
			"applyCombatTrainingDefenderDamage",
			"resolveTrainingEnemyAttack",
			'data-testid="combat-weapon-select"',
			'data-testid="combat-armor-select"',
			'data-testid="combat-shield-select"',
			'data-testid="combat-equipped-weapon-helper"',
			'data-testid="combat-equipped-defense-profile"',
			'data-testid="combat-training-enemy-defense-summary"',
			'data-testid="combat-training-defender-hp"',
			'data-testid="combat-training-defender-terminal"',
			"Aria usa perfil fixo de treino.",
			"HP de treino",
			"Arma ativa:",
			"Defesa equipada",
		],
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
			"handleNavigationRequest",
			"handleRuntimeRequest",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/save-load/model/saveLoadSchemas.ts",
		[
			"CURRENT_SAVE_VERSION = 5",
			"clocks",
			"socialEncounters",
			"socialEncounterEvents",
			"npcRelationships",
		],
		errors,
	);

	for (const docPath of [
		"docs/user/character-creation.md",
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
