import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Mapeamento de camadas permitidas e suas hierarquias
const LAYERS = ["shared", "entities", "features", "app"] as const;
type Layer = (typeof LAYERS)[number];

const LAYER_ORDER: Record<Layer, number> = {
	shared: 0,
	entities: 1,
	features: 2,
	app: 3,
};

const FEATURE_PRIVATE_SEGMENTS = new Set([
	"api",
	"components",
	"internal",
	"lib",
	"model",
	"private",
	"services",
	"stores",
	"ui",
	"utils",
	"domain",
	"infrastructure",
]);

// Exceções permitidas por arquivo/diretório para viabilizar o bootstrap local-first de banco de dados e contratos RPC
const ALLOWED_LAYER_EXCEPTIONS = [
	{
		importerPrefix: "shared/persistence",
		allowedTargetLayers: ["entities"],
		reason:
			"SQLite/Drizzle bootstrap requires importing all entity schemas and concrete repositories.",
	},
	{
		importerPrefix: "shared/rpc",
		allowedTargetLayers: ["entities", "features"],
		reason:
			"RPC bridge schemas and type providers require mapping entity/feature types for cross-worker messaging.",
	},
];

// Baseline de violações arquiteturais legadas existentes no repositório.
// Bloqueia novas regressões arquiteturais de FSD sem forçar refatoração massiva de código de produção pré-existente.
const LEGACY_VIOLATIONS = new Set([
	"entities/companions/domain/CompanionService.ts -> entities/character/model/characterSchema",
	"entities/companions/model/companionSchema.ts -> entities/character/model/characterSchema",
	"entities/equipment/domain/InventoryService.ts -> entities/character/domain/ArmorStatsDecorator",
	"entities/equipment/domain/InventoryService.ts -> entities/character/domain/StatusEffectDecorator",
	"entities/equipment/domain/RepairService.ts -> entities/character/domain/StatusEffectDecorator",
	"entities/equipment/model/craftingSchema.ts -> entities/character/model/characterSchema",
	"entities/espionage/domain/EspionageService.ts -> entities/character/domain/CharacterRepository",
	"entities/espionage/domain/EspionageService.ts -> entities/companions/domain/CompanionRepository",
	"entities/espionage/domain/EspionageService.ts -> entities/social/domain/FactionRepository",
	"entities/espionage/model/espionageSchema.ts -> entities/companions/model/companionSchema",
	"entities/espionage/model/espionageSchema.ts -> entities/social/model/socialSchema",
	"entities/lore/domain/LoreService.ts -> entities/social/domain/SocialRepository",
	"entities/lore/model/loreSchema.ts -> entities/social/model/socialSchema",
	"entities/lore/model/loreSchema.ts -> entities/world-tile/model/worldTileSchema",
	"entities/siege/model/siegeSchema.ts -> entities/bastion/model/bastionSchema",
	"entities/siege/model/siegeSchema.ts -> entities/social/model/socialSchema",
	"entities/social/model/socialSchema.ts -> entities/character/model/characterSchema",
	"entities/traps/domain/TrapDecorators.ts -> entities/character/model/characterSchema",
	"entities/traps/domain/TrapService.ts -> entities/character/model/characterSchema",
	"entities/world-tile/domain/EncounterService.ts -> entities/character/domain/StatusEffectDecorator",
	"entities/world-tile/domain/TravelRoleService.ts -> entities/world-state/domain/WorldStateService",
	"features/character-list/ui/CharacterList.svelte -> features/chat/model/chatState.svelte",
	"features/combat-encounter/ui/CombatEncounterPanel.svelte -> features/crafting/model/craftingSchema",
	"features/social/ui/DialogueWindow.svelte -> app/model/socialSession",
	"features/social/ui/SocialDemo.svelte -> app/model/socialSession",
]);

describe("FSD Architecture Integrity Tests", () => {
	const projectRoot = path.resolve(
		path.dirname(fileURLToPath(import.meta.url)),
		"../../../../",
	);
	const srcRoot = path.join(projectRoot, "src");

	it("should respect FSD unidirectional layer dependency boundaries", () => {
		const sourceFiles = listSourceFiles(srcRoot);
		const violations: string[] = [];

		for (const file of sourceFiles) {
			const relativePath = path.relative(srcRoot, file).replace(/\\/g, "/");
			const sourceLayer = getLayerFromPath(relativePath);
			if (!sourceLayer) continue;

			const content = readFileSync(file, "utf8");
			const imports = extractImports(content);

			for (const imp of imports) {
				const resolvedPath = resolveImport(imp, relativePath);
				if (!resolvedPath) continue;

				const targetLayer = getLayerFromPath(resolvedPath);
				if (!targetLayer) continue;

				const isLegacy = isLegacyViolation(relativePath, resolvedPath);
				if (isLegacy) continue; // Ignora violação legada cadastrada no baseline

				// Verificar se há uma exceção de infraestrutura permitida
				const hasException = ALLOWED_LAYER_EXCEPTIONS.some(
					(exc) =>
						relativePath.startsWith(exc.importerPrefix) &&
						exc.allowedTargetLayers.includes(targetLayer),
				);

				// 1. Regra Unidirecional: Camada inferior não pode importar de camada superior
				if (
					!hasException &&
					LAYER_ORDER[sourceLayer] < LAYER_ORDER[targetLayer]
				) {
					violations.push(
						`Layer Violation in [src/${relativePath}]: Cannot import from upper layer "${targetLayer}" [import "${imp}" -> resolved to "src/${resolvedPath}"]`,
					);
				}

				// 2. Regra de Limite de Feature (Cross-slice private import)
				if (sourceLayer === "features" && targetLayer === "features") {
					const sourceSlice = getSliceFromPath(relativePath, "features");
					const targetSlice = getSliceFromPath(resolvedPath, "features");

					if (sourceSlice && targetSlice && sourceSlice !== targetSlice) {
						if (isPrivateFeatureImport(resolvedPath)) {
							violations.push(
								`FSD Private Slice Import in [src/${relativePath}]: Directly importing private member of feature "${targetSlice}". Use its public API instead. [import "${imp}" -> resolved to "src/${resolvedPath}"]`,
							);
						}
					}
				}

				// 3. Regra de Limite de Entity (Cross-slice private import)
				if (sourceLayer === "entities" && targetLayer === "entities") {
					const sourceSlice = getSliceFromPath(relativePath, "entities");
					const targetSlice = getSliceFromPath(resolvedPath, "entities");

					if (sourceSlice && targetSlice && sourceSlice !== targetSlice) {
						if (isPrivateFeatureImport(resolvedPath)) {
							violations.push(
								`FSD Private Slice Import in [src/${relativePath}]: Directly importing private member of entity "${targetSlice}". Use its public API instead. [import "${imp}" -> resolved to "src/${resolvedPath}"]`,
							);
						}
					}
				}
			}
		}

		expect(violations, violations.join("\n")).toEqual([]);
	}, 30000);
});

// Helpers
function listSourceFiles(dir: string): string[] {
	const entries = readdirSync(dir);
	const files: string[] = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry);
		const stats = statSync(fullPath);

		if (stats.isDirectory()) {
			if (entry !== "__tests__" && entry !== "testing") {
				files.push(...listSourceFiles(fullPath));
			}
		} else if (stats.isFile()) {
			if (
				(entry.endsWith(".ts") || entry.endsWith(".svelte")) &&
				!entry.endsWith(".spec.ts") &&
				!entry.endsWith(".test.ts")
			) {
				files.push(fullPath);
			}
		}
	}

	return files;
}

function getLayerFromPath(relPath: string): Layer | null {
	const parts = relPath.split("/");
	const layer = parts[0];
	if (layer && LAYERS.includes(layer as Layer)) {
		return layer as Layer;
	}
	return null;
}

function getSliceFromPath(relPath: string, layer: Layer): string | null {
	const parts = relPath.split("/");
	if (parts[0] === layer && parts[1]) {
		return parts[1];
	}
	return null;
}

function extractImports(content: string): string[] {
	const imports: string[] = [];
	const IMPORT_PATTERN =
		/\b(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s*)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)/g;

	let match = IMPORT_PATTERN.exec(content);
	while (match !== null) {
		const specifier = match[1] || match[2];
		if (specifier) {
			imports.push(specifier);
		}
		match = IMPORT_PATTERN.exec(content);
	}
	return imports;
}

function resolveImport(
	specifier: string,
	importerRelPath: string,
): string | null {
	if (
		!specifier.startsWith(".") &&
		!specifier.startsWith("$lib") &&
		!specifier.startsWith("@/")
	) {
		return null;
	}

	let resolved = specifier;

	if (specifier.startsWith("$lib/")) {
		resolved = specifier.slice("$lib/".length);
	} else if (specifier.startsWith("@/")) {
		resolved = specifier.slice("@/".length);
	} else if (specifier.startsWith(".")) {
		const importerDir = path.posix.dirname(importerRelPath);
		resolved = path.posix.normalize(path.posix.join(importerDir, specifier));
	}

	resolved = resolved.replace(/\\/g, "/");
	if (resolved.startsWith("../")) {
		return null;
	}

	if (resolved.startsWith("/")) {
		resolved = resolved.slice(1);
	}

	return resolved;
}

function isPrivateFeatureImport(resolvedPath: string): boolean {
	const parts = resolvedPath.split("/");
	if (parts.length <= 2) {
		return false;
	}

	const segment = parts[2];
	if (!segment) return false;

	const cleanSegment = segment.replace(/\.(?:ts|svelte|js|mjs)$/, "");
	return FEATURE_PRIVATE_SEGMENTS.has(cleanSegment);
}

function isLegacyViolation(importerPath: string, targetPath: string): boolean {
	// Remove extensões (.ts, .svelte, etc) para normalizar a comparação do baseline
	const cleanImporter = importerPath.replace(/\.(?:ts|svelte)$/, "");
	const cleanTarget = targetPath.replace(/\.(?:ts|svelte)$/, "");

	// Tenta checar com e sem extensão
	const keyWithExt = `${importerPath} -> ${targetPath}`;
	const keyClean = `${cleanImporter} -> ${cleanTarget}`;

	return LEGACY_VIOLATIONS.has(keyWithExt) || LEGACY_VIOLATIONS.has(keyClean);
}
