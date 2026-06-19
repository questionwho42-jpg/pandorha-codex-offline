import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
	analyzeSource,
	findFeatureName,
	findEntityName,
	normalizeSpecifier,
	resolveFeatureImport,
	resolveProjectRoot,
	resolveTargetFile,
	validateImplementation,
} from "../src/server.js";

test("detects Svelte runes without treating them as violations", () => {
	const result = analyzeSource(
		[
			"const hp = $state(10);",
			"const maxHp = $derived(hp + 2);",
			"$effect(() => console.log(maxHp));",
		].join("\n"),
		"src/features/combat/ui/panel.svelte",
	);

	assert.equal(result.is_valid, true);
	assert.equal(result.checks.svelte_runes.uses_state, true);
	assert.equal(result.checks.svelte_runes.uses_derived, true);
	assert.equal(result.checks.svelte_runes.uses_effect, true);
	assert.deepEqual(result.checks.svelte_runes.occurrences.state, [
		{ line: 1, match: "$state" },
	]);
});

test("blocks direct private imports from other features", () => {
	const result = analyzeSource(
		"import { bag } from '@/features/inventory/model/bag';",
		"src/features/combat/ui/panel.svelte",
	);

	assert.equal(result.is_valid, false);
	assert.equal(result.violations.length, 1);
	assert.equal(result.violations[0].type, "fsd-private-import");
	assert.equal(result.violations[0].severity, "error");
	assert.equal(result.violations[0].line, 1);
});

test("allows same-feature private imports and public imports from other features", () => {
	const result = analyzeSource(
		[
			"import { local } from '../model/local';",
			"import { inventoryApi } from '@/features/inventory';",
		].join("\n"),
		"src/features/combat/ui/panel.svelte",
	);

	assert.equal(result.is_valid, true);
	assert.deepEqual(result.violations, []);
});

test("detects default Tailwind colors including variants", () => {
	const result = analyzeSource(
		'<div class="hover:bg-red-500 text-gray-100 border-brand-primary"></div>',
		"src/features/combat/ui/panel.svelte",
	);

	assert.equal(result.is_valid, false);
	assert.equal(result.violations.length, 2);
	assert.deepEqual(
		result.violations.map((violation) => violation.match),
		["hover:bg-red-500", "text-gray-100"],
	);
});

test("normalizes supported import specifiers", () => {
	assert.equal(
		normalizeSpecifier("@/features/combat/model/hp", "src/features/ui/x.ts"),
		"src/features/combat/model/hp",
	);
	assert.equal(
		normalizeSpecifier("$lib/features/combat/model/hp", "src/features/ui/x.ts"),
		"src/features/combat/model/hp",
	);
	assert.equal(
		normalizeSpecifier("src/features/combat/model/hp", "src/features/ui/x.ts"),
		"src/features/combat/model/hp",
	);
	assert.equal(
		normalizeSpecifier("/src/features/combat/model/hp", "src/features/ui/x.ts"),
		"src/features/combat/model/hp",
	);
	assert.equal(
		normalizeSpecifier("../model/hp", "src/features/combat/ui/x.svelte"),
		"src/features/combat/model/hp",
	);
	assert.equal(
		normalizeSpecifier("svelte", "src/features/combat/ui/x.svelte"),
		null,
	);
});

test("resolves feature import metadata", () => {
	assert.deepEqual(
		resolveFeatureImport(
			"@/features/lore/private/note",
			"src/features/combat/ui/x.svelte",
		),
		{
			feature: "lore",
			privateSegment: "private",
			normalized: "src/features/lore/private/note",
		},
	);
	assert.equal(
		resolveFeatureImport(
			"@/shared/lib/date",
			"src/features/combat/ui/x.svelte",
		),
		null,
	);
});

test("finds feature names only inside src/features", () => {
	assert.equal(findFeatureName("src/features/combat/ui/x.svelte"), "combat");
	assert.equal(findFeatureName("src/lib/x.ts"), null);
});

test("finds entity names inside src/entities", () => {
	assert.equal(findEntityName("src/entities/character/model/schema.ts"), "character");
	assert.equal(findEntityName("src/features/combat/ui/x.svelte"), null);
});

test("blocks entity imports from features/upper layers", () => {
	const result = analyzeSource(
		"import { combat } from '@/features/combat';",
		"src/entities/character/domain/Service.ts",
	);

	assert.equal(result.is_valid, false);
	assert.equal(result.violations.length, 1);
	assert.equal(result.violations[0].type, "fsd-layer-violation");
});

test("blocks entity cross-imports of non-schema files", () => {
	const result = analyzeSource(
		"import { otherService } from '@/entities/siege/domain/SiegeService';",
		"src/entities/character/domain/Service.ts",
	);

	assert.equal(result.is_valid, false);
	assert.equal(result.violations.length, 1);
	assert.equal(result.violations[0].type, "fsd-entity-cross-import");
});

test("allows entity cross-imports of schema files", () => {
	const result = analyzeSource(
		"import { siegeSchema } from '@/entities/siege/model/siegeSchema';",
		"src/entities/character/domain/Service.ts",
	);

	assert.equal(result.is_valid, true);
	assert.deepEqual(result.violations, []);
});

test("rejects files outside the project root or with unsupported extensions", () => {
	const root = path.join(os.tmpdir(), "pandorha-arch-guard-root");

	assert.throws(() => resolveTargetFile(root, ""), /non-empty string/);
	assert.throws(
		() => resolveTargetFile(root, "../outside.ts"),
		/inside PANDORHA_PROJECT_ROOT/,
	);
	assert.throws(
		() => resolveTargetFile(root, "src/features/combat/readme.md"),
		/.svelte or .ts/,
	);
});

test("resolves project root from environment", () => {
	const root = path.join(os.tmpdir(), "pandorha-env-root");
	assert.equal(
		resolveProjectRoot({ PANDORHA_PROJECT_ROOT: root }),
		path.resolve(root),
	);
});

test("validates a real project file", async () => {
	const projectRoot = await fs.mkdtemp(
		path.join(os.tmpdir(), "pandorha-arch-guard-"),
	);
	const filePath = path.join(
		projectRoot,
		"src",
		"features",
		"combat",
		"ui",
		"panel.svelte",
	);
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(
		filePath,
		[
			'<script lang="ts">',
			"  import { item } from '@/features/inventory/model/item';",
			"  let hp = $state(1);",
			"</script>",
			'<div class="bg-blue-500">{hp}</div>',
		].join("\n"),
		"utf8",
	);

	const result = await validateImplementation(
		{ file_path: "src/features/combat/ui/panel.svelte" },
		{ projectRoot },
	);

	assert.equal(result.file, "src/features/combat/ui/panel.svelte");
	assert.equal(result.is_valid, false);
	assert.equal(result.checks.svelte_runes.uses_state, true);
	assert.deepEqual(
		result.violations.map((violation) => violation.type),
		["fsd-private-import", "tailwind-default-color"],
	);
});
