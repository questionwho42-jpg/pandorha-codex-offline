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
			"SpellCastPanel",
			"InventoryReadOnlyPanel",
			"CompendiumBrowser",
			'data-testid="pwa-status"',
		],
		errors,
	);

	await validateFileContains(
		root,
		"public/pandorha-sw.js",
		["CACHE_NAME", "install", "activate", "fetch", "handleNavigationRequest"],
		errors,
	);

	for (const docPath of [
		"docs/user/character-creation.md",
		"docs/user/combat-training.md",
		"docs/user/camp-training.md",
		"docs/user/social-relations.md",
		"docs/user/offline-smoke.md",
	]) {
		await validateFileContainsAny(
			root,
			docPath,
			["http://127.0.0.1:5173/", "http://localhost:5173/"],
			errors,
		);
	}

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
