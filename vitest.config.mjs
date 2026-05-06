import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	test: {
		environment: "node",
		include: ["src/**/*.spec.ts"],
		coverage: {
			include: [
				"src/entities/character/domain/CharacterService.ts",
				"src/entities/character/domain/CharacterDerivedStatsService.ts",
				"src/entities/character/model/characterRules.ts",
				"src/entities/character/model/characterSchema.ts",
				"src/entities/ancestry/domain/AncestryCatalogService.ts",
				"src/entities/ancestry/domain/AncestryTraitSelectionService.ts",
				"src/entities/character-class/domain/CharacterClassCatalogService.ts",
				"src/entities/background/domain/BackgroundCatalogService.ts",
				"src/shared/dice/domain/DiceService.ts",
				"src/shared/resolution/domain/ResolutionService.ts",
			],
			exclude: [
				"src/entities/character/testing/**/*.ts",
				"src/entities/character/__tests__/**/*.ts",
			],
			thresholds: {
				lines: 100,
				functions: 100,
				branches: 100,
				statements: 100,
			},
		},
	},
});
