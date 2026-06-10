/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
	_comment: "Stryker configuration for Pandorha Engine focused on domain services",
	packageManager: "npm",
	reporters: ["html", "clear-text", "progress"],
	testRunner: "vitest",
	coverageAnalysis: "perTest",
	mutate: [
		"src/shared/dice/domain/**/*.ts",
		"src/shared/resolution/domain/**/*.ts",
		"src/entities/character/domain/**/*.ts",
	],
	thresholds: {
		high: 85,
		low: 60,
		break: 50,
	},
	vitest: {
		configFile: "vitest.config.mjs",
	},
};
