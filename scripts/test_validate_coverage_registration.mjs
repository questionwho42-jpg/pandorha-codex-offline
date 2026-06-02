import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const scriptPath = path.join(
	repoRoot,
	"scripts",
	"validate_coverage_registration.mjs",
);

test("coverage registration validator passes when service and view model are included", async () => {
	const root = await createFixtureRoot({
		coverageEntries: [
			"src/shared/inventory/domain/InventoryCapacityService.ts",
			"src/features/combat/model/combatView.ts",
		],
	});

	try {
		const result = runValidator(root);

		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /coverage registration is valid/i);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("coverage registration validator fails when a service is missing", async () => {
	const root = await createFixtureRoot({
		coverageEntries: ["src/features/combat/model/combatView.ts"],
	});

	try {
		const result = runValidator(root);

		assert.notEqual(result.status, 0);
		assert.match(
			result.stderr,
			/src\/shared\/inventory\/domain\/InventoryCapacityService\.ts/,
		);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test("coverage registration validator fails when a view model is missing", async () => {
	const root = await createFixtureRoot({
		coverageEntries: [
			"src/shared/inventory/domain/InventoryCapacityService.ts",
		],
	});

	try {
		const result = runValidator(root);

		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /src\/features\/combat\/model\/combatView\.ts/);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

async function createFixtureRoot({ coverageEntries }) {
	const root = await mkdtemp(path.join(os.tmpdir(), "pandorha-coverage-"));
	const servicePath = path.join(
		root,
		"src/shared/inventory/domain/InventoryCapacityService.ts",
	);
	const viewPath = path.join(root, "src/features/combat/model/combatView.ts");
	await mkdir(path.dirname(servicePath), { recursive: true });
	await mkdir(path.dirname(viewPath), { recursive: true });
	await writeFile(servicePath, "export class InventoryCapacityService {}\n");
	await writeFile(viewPath, "export function createCombatView() {}\n");
	await writeFile(
		path.join(root, "vitest.config.mjs"),
		renderVitestConfig(coverageEntries),
	);

	return root;
}

function renderVitestConfig(coverageEntries) {
	const includeLines = coverageEntries
		.map((entry) => `\t\t\t\t"${entry}",`)
		.join("\n");

	return `export default {
\ttest: {
\t\tcoverage: {
\t\t\tinclude: [
${includeLines}
\t\t\t],
\t\t},
\t},
};
`;
}

function runValidator(root) {
	return spawnSync(process.execPath, [scriptPath, "--root", root], {
		cwd: repoRoot,
		encoding: "utf8",
	});
}
