import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: [
		"./src/entities/character/model/characterSchema.ts",
		"./src/entities/world-state/model/worldStateSchema.ts",
		"./src/entities/social/model/socialSchema.ts",
		"./src/entities/equipment/model/craftingSchema.ts",
		"./src/entities/traps/model/trapSchema.ts",
	],
	out: "./drizzle",
	dialect: "sqlite",
	breakpoints: true,
});
