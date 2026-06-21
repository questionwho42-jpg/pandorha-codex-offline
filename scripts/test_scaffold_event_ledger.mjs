import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(repoRoot, "scripts", "scaffold_event_ledger.mjs");

test("event ledger scaffold creates schema, repository, fake, replay service, spec, and context", async () => {
	const root = await createTemporaryRoot();

	try {
		const result = runScaffold(root, [
			"--layer",
			"features",
			"--slice",
			"reputation-ledger",
			"--service",
			"ReputationLedgerReplayService",
		]);

		assert.equal(result.status, 0, result.stderr);
		const expectedFiles = [
			"src/features/reputation-ledger/index.ts",
			"src/features/reputation-ledger/model/reputationLedgerEventSchema.ts",
			"src/features/reputation-ledger/model/reputationLedgerEventTypes.ts",
			"src/features/reputation-ledger/domain/ReputationLedgerRepository.ts",
			"src/features/reputation-ledger/domain/ReputationLedgerReplayService.ts",
			"src/features/reputation-ledger/testing/InMemoryReputationLedgerRepository.ts",
			"src/features/reputation-ledger/__tests__/ReputationLedgerReplayService.spec.ts",
			"src/features/reputation-ledger/.context/tech-memory.md",
			"src/features/reputation-ledger/.context/scaling-roadmap.md",
			"src/features/reputation-ledger/.context/plain-english.md",
		];

		for (const expectedFile of expectedFiles) {
			await assertFileExists(path.join(root, expectedFile));
		}

		const service = await readFile(
			path.join(
				root,
				"src/features/reputation-ledger/domain/ReputationLedgerReplayService.ts",
			),
			"utf8",
		);
		assert.match(service, /Result</);
		assert.doesNotMatch(service, /throw new Error/);
		assert.doesNotMatch(service, /export default/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("event ledger scaffold refuses to overwrite existing targets", async () => {
	const root = await createTemporaryRoot();
	const args = [
		"--layer",
		"entities",
		"--slice",
		"quest-ledger",
		"--service",
		"QuestLedgerReplayService",
	];

	try {
		assert.equal(runScaffold(root, args).status, 0);
		const secondRun = runScaffold(root, args);

		assert.notEqual(secondRun.status, 0);
		assert.match(secondRun.stderr, /already exists/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("event ledger scaffold rejects invalid names and path traversal", async () => {
	const root = await createTemporaryRoot();

	try {
		const invalidSlice = runScaffold(root, [
			"--layer",
			"features",
			"--slice",
			"..\\outside",
			"--service",
			"QuestLedgerReplayService",
		]);
		const invalidService = runScaffold(root, [
			"--layer",
			"features",
			"--slice",
			"quest-ledger",
			"--service",
			"questService",
		]);

		assert.notEqual(invalidSlice.status, 0);
		assert.match(invalidSlice.stderr, /Invalid slice/i);
		assert.notEqual(invalidService.status, 0);
		assert.match(invalidService.stderr, /Invalid service/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createTemporaryRoot() {
	return mkdtemp(path.join(os.tmpdir(), "pandorha-event-ledger-"));
}

function runScaffold(root, args) {
	return spawnSync(process.execPath, [scriptPath, "--root", root, ...args], {
		cwd: repoRoot,
		encoding: "utf8",
	});
}

async function assertFileExists(filePath) {
	const fileStat = await stat(filePath);
	assert.equal(fileStat.isFile(), true);
}
