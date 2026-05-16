import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: [
		"./src/entities/character/model/characterSchema.ts",
		"./src/entities/world-state/model/worldStateSchema.ts",
		"./src/entities/social/model/socialSchema.ts",
	],
	out: "./drizzle",
	dialect: "sqlite",
	breakpoints: true,
});
