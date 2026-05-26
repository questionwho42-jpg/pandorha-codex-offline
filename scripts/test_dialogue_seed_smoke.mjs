import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(repoRoot, "scripts", "dialogue_seed_smoke.mjs");

test("dialogue seed smoke passes with required training NPC contracts", async () => {
	const root = await createFixtureRoot();

	try {
		const result = runSmoke(root);

		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /dialogue seed smoke is valid/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("dialogue seed smoke fails when a training NPC has no tree", async () => {
	const root = await createFixtureRoot({
		dialogueTreeText: renderDialogueTreeCatalog({ omitCaptainTree: true }),
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /training-captain/);
		assert.match(result.stderr, /expected 4 dialogue nodes/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("dialogue seed smoke fails when a required option is missing", async () => {
	const root = await createFixtureRoot({
		dialogueTreeText: renderDialogueTreeCatalog({ omitCaptainThreaten: true }),
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /training-captain/);
		assert.match(result.stderr, /expected 3 dialogue options/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("dialogue seed smoke fails when an option target is broken", async () => {
	const root = await createFixtureRoot({
		dialogueTreeText: renderDialogueTreeCatalog({
			brokenCaptainBargainTarget: true,
		}),
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /missing-captain-node/);
		assert.match(result.stderr, /nextNodeId/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("dialogue seed smoke fails when source files diverge", async () => {
	const root = await createFixtureRoot({
		dialogueTreeText: renderDialogueTreeCatalog({
			divergentCaptainSourceFile: true,
		}),
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /training-captain/);
		assert.match(result.stderr, /sourceFile/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("dialogue seed smoke fails when a gated option has no blocked reason", async () => {
	const root = await createFixtureRoot({
		dialogueTreeText: renderDialogueTreeCatalog({
			omitCaptainBlockedReason: true,
		}),
	});

	try {
		const result = runSmoke(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /training-captain-option-threaten/);
		assert.match(result.stderr, /blockedReason/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createFixtureRoot({
	npcCatalogText = renderNpcCatalog(),
	dialogueTreeText = renderDialogueTreeCatalog(),
} = {}) {
	const root = await mkdtemp(path.join(os.tmpdir(), "pandorha-dialogue-seed-"));
	const files = {
		"src/entities/npc/model/npcCatalog.ts": npcCatalogText,
		"src/entities/dialogue-tree/model/dialogueTreeCatalog.ts": dialogueTreeText,
	};

	for (const [relativePath, content] of Object.entries(files)) {
		const fullPath = path.join(root, relativePath);
		await mkdir(path.dirname(fullPath), { recursive: true });
		await writeFile(fullPath, content);
	}

	return root;
}

function renderNpcCatalog() {
	return `
const SOURCE_FILE = "docs/system/survival/regras-negociacao.md";
const CAPTAIN_SOURCE_FILE = "docs/system/survival/06-npcs-e-aliados.md";

export const NPC_CATALOG = [
  {
    id: "training-broker",
    label: "Corretora de Treino",
    sourceFile: SOURCE_FILE,
  },
  {
    id: "training-captain",
    label: "Capitão de Treino",
    sourceFile: CAPTAIN_SOURCE_FILE,
  },
  {
    id: "training-informant",
    label: "Informante de Treino",
    sourceFile: SOURCE_FILE,
  },
] as const;
`;
}

function renderDialogueTreeCatalog({
	omitCaptainTree = false,
	omitCaptainThreaten = false,
	brokenCaptainBargainTarget = false,
	divergentCaptainSourceFile = false,
	omitCaptainBlockedReason = false,
} = {}) {
	const captainSource = divergentCaptainSourceFile
		? '"docs/system/survival/regras-negociacao.md"'
		: "CAPTAIN_SOURCE_FILE";
	const captainNodes = omitCaptainTree
		? ""
		: renderSeedNodes("training-captain", "CAPTAIN_SOURCE_FILE");
	const captainOptions = omitCaptainTree
		? ""
		: renderSeedOptions("training-captain", captainSource, {
				omitThreaten: omitCaptainThreaten,
				brokenBargainTarget: brokenCaptainBargainTarget,
				omitBlockedReason: omitCaptainBlockedReason,
			});

	return `
const SOURCE_FILE = "docs/system/survival/regras-negociacao.md";
const CAPTAIN_SOURCE_FILE = "docs/system/survival/06-npcs-e-aliados.md";

const rawDialogueNodeCatalog = [
${renderSeedNodes("training-broker", "SOURCE_FILE")}
${captainNodes}
${renderSeedNodes("training-informant", "SOURCE_FILE")}
];

const rawDialogueOptionCatalog = [
${renderSeedOptions("training-broker", "SOURCE_FILE")}
${captainOptions}
${renderSeedOptions("training-informant", "SOURCE_FILE")}
];
`;
}

function renderSeedNodes(npcId, sourceFileExpression) {
	return `
  {
    id: "${npcId}-opening",
    npcId: "${npcId}",
    kind: "start",
    sourceFile: ${sourceFileExpression},
  },
  {
    id: "${npcId}-persuade-response",
    npcId: "${npcId}",
    kind: "response",
    sourceFile: ${sourceFileExpression},
  },
  {
    id: "${npcId}-bargain-response",
    npcId: "${npcId}",
    kind: "response",
    sourceFile: ${sourceFileExpression},
  },
  {
    id: "${npcId}-threaten-response",
    npcId: "${npcId}",
    kind: "response",
    sourceFile: ${sourceFileExpression},
  },
`;
}

function renderSeedOptions(
	npcId,
	sourceFileExpression,
	{
		omitThreaten = false,
		brokenBargainTarget = false,
		omitBlockedReason = false,
	} = {},
) {
	const bargainTarget = brokenBargainTarget
		? "missing-captain-node"
		: `${npcId}-bargain-response`;
	const blockedReason = omitBlockedReason
		? ""
		: `blockedReason: "Exige HP mental 8 ou maior para pressionar sem quebrar a cena.",`;
	const threatenOption = omitThreaten
		? ""
		: `
  {
    id: "${npcId}-option-threaten",
    nodeId: "${npcId}-opening",
    choiceId: "threaten",
    nextNodeId: "${npcId}-threaten-response",
    minimumMentalHp: 8,
    ${blockedReason}
    sortOrder: 2,
    sourceFile: ${sourceFileExpression},
  },
`;

	return `
  {
    id: "${npcId}-option-persuade",
    nodeId: "${npcId}-opening",
    choiceId: "persuade",
    nextNodeId: "${npcId}-persuade-response",
    sortOrder: 0,
    sourceFile: ${sourceFileExpression},
  },
  {
    id: "${npcId}-option-bargain",
    nodeId: "${npcId}-opening",
    choiceId: "bargain",
    nextNodeId: "${bargainTarget}",
    sortOrder: 1,
    sourceFile: ${sourceFileExpression},
  },
${threatenOption}
`;
}

function runSmoke(root) {
	return spawnSync(process.execPath, [scriptPath, "--root", root], {
		cwd: repoRoot,
		encoding: "utf8",
	});
}
