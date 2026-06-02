import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const parsedArgs = parseArgs(process.argv.slice(2));

if (!parsedArgs.success) {
	exitWithError(parsedArgs.error);
}

const result = await runSocialBrowserSmoke(parsedArgs.root);
if (!result.success) {
	exitWithError(result.errors.join("\n"));
}

console.log("social browser smoke is valid");

async function runSocialBrowserSmoke(root) {
	const errors = [];

	await validateFileContains(
		root,
		"src/app/App.svelte",
		[
			"<SaveLoadControls",
			"onLoad={loadSession}",
			"onSave={saveSession}",
			"<SocialEncounterPanel",
			"applySocialPressurePenalty",
			"applySocialPressurePenaltyIntent",
			"clockRecords = [...result.data.clocks]",
			"clocks={clockRecords}",
			"factionFameLevelsByNpcId",
			"gainInfamy: socialRelationsSession.gainInfamy",
			"loseFame: socialRelationsSession.loseFame",
			"npcRelationships: npcRelationshipRecords",
			"npcRelationshipRecords = [...result.data.npcRelationships]",
			"npcRelationships={npcRelationshipRecords}",
			"npcs={socialEncounterSession.npcs}",
			"onSocialPressurePenalty={applySocialPressurePenalty}",
			"worldState: worldStateRecords",
			"socialEncounters: socialEncounterRecords",
			"socialEncounterEvents: socialEncounterEventRecords",
			"worldStateRecords = [...result.data.worldState]",
			"socialEncounterRecords = [...result.data.socialEncounters]",
			"socialEncounterEventRecords = [...result.data.socialEncounterEvents]",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/social-encounter/ui/SocialEncounterPanel.svelte",
		[
			'data-testid="social-npc-select"',
			'data-testid="social-start-encounter"',
			'data-testid="social-dialogue-option"',
			'data-testid="social-resolve-appeal"',
			'data-testid="social-worldstate-consequence"',
			"factionFameLevelsByNpcId",
			"createSocialEncounterConsequenceFlag({",
			"createSocialPressurePenaltyIntent({",
			"dialogueOptions,",
			"onSocialPressurePenalty",
			"upsertSocialEncounterConsequenceFlag(worldState, consequence)",
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
			"social-pressure-fame-penalty",
			"social-pressure-infamy",
			"createSocialPressureInfamyFlag",
			"Pressionar este NPC aplicou perda de 1 nível de Fama",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/social-relations/ui/SocialRelationsPanel.svelte",
		[
			'data-testid="social-retaliation-clock"',
			'data-testid="npc-relationship-list"',
			'data-testid="npc-relationship-filter"',
			'data-testid="npc-relationship-filter-option"',
			'data-testid="npc-relationship-group"',
			'data-testid="npc-relationship-row"',
			"npcRelationshipFilter",
			"npcFilterEmptyStateLabel",
			"npcRelationships",
			"Relações por NPC",
			"clocks",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/features/social-encounter/__tests__/socialEncounterConsequences.spec.ts",
		[
			"stores bargain metadata",
			"creates a pressure penalty intent",
			'dialogueChoiceLabel: "Barganhar"',
			"createSocialEncounterConsequenceView",
		],
		errors,
	);

	await validateFileContains(
		root,
		"src/app/model/socialPressurePenaltySession.spec.ts",
		[
			"creates a retaliation clock when Fame is already zero",
			"infamyApplied",
			"npcRelationshipApplied",
			"retaliationClockAdvanced",
			"retaliationClockCreated",
			"social-pressure-social-encounter-primary",
			"retaliation-training-merchant-league-social-encounter-primary",
			'source: "social-pressure"',
			"expect(fakeGainInfamy.calls).toBe(1)",
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

	await validateFileContainsInOrder(
		root,
		"docs/process/vertical-slice-qa.md",
		[
			"Corretora de Treino",
			"Barganhar",
			"Fazer apelo",
			"WorldState",
			"Infâmia",
			"Retaliação",
			"Relações por NPC",
			"Salvar sessao",
			"recarregue",
			"Carregar save",
			"restaurados",
		],
		errors,
	);

	await validateFileContainsInOrder(
		root,
		"docs/user/social-encounter.md",
		[
			"Barganhar",
			"Fazer apelo",
			"WorldState",
			"Infâmia",
			"Retaliação",
			"Relações por NPC",
			"Salvar sessao",
			"recarregue",
			"Carregar save",
		],
		errors,
	);

	await validateFileContains(
		root,
		"docs/process/t84-social-rendered-browser-automation-evaluation.md",
		[
			"Decision: keep qa:social-browser-smoke contractual.",
			"Browser Use remains mandatory for social UI changes.",
			"Do not add Playwright dependency until rendered browser checks are stable",
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

	const normalizedContent = removeDiacritics(contentResult.content);
	let cursor = 0;
	for (const snippet of requiredSnippets) {
		const normalizedSnippet = removeDiacritics(snippet);
		const index = normalizedContent.indexOf(normalizedSnippet, cursor);
		if (index < 0) {
			errors.push(
				`${relativePath} is missing ordered text after offset ${cursor}: ${snippet}`,
			);
			return;
		}

		cursor = index + normalizedSnippet.length;
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

function removeDiacritics(value) {
	return value
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase();
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
