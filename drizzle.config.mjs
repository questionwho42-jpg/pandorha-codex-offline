import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/entities/character/model/characterSchema.ts",
	out: "./drizzle",
	dialect: "sqlite",
	breakpoints: true,
});
