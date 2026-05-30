import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: [
		"./src/entities/character/model/characterSchema.ts",
		"./src/entities/world-state/model/worldStateSchema.ts",
		"./src/entities/clock/model/clockSchema.ts",
		"./src/entities/camp-session/model/campSessionSchema.ts",
		"./src/entities/faction/model/factionSchema.ts",
		"./src/entities/social-encounter/model/socialEncounterPersistenceSchema.ts",
		"./src/entities/npc-relationship/model/npcRelationshipSchema.ts",
	],
	out: "./drizzle",
	dialect: "sqlite",
	breakpoints: true,
});
