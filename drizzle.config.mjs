import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: [
		"./src/entities/character/model/characterSchema.ts",
		"./src/entities/world-state/model/worldStateSchema.ts",
		"./src/entities/social/model/socialSchema.ts",
		"./src/entities/equipment/model/craftingSchema.ts",
		"./src/entities/traps/model/trapSchema.ts",
		"./src/entities/bastion/model/bastionSchema.ts",
		"./src/entities/clocks/model/clockSchema.ts",
		"./src/entities/dialogue/model/dialogueSchema.ts",
		"./src/entities/quest/model/questSchema.ts",
		"./src/entities/synergy/model/synergySchema.ts",
		"./src/entities/companions/model/companionSchema.ts",
		"./src/entities/investigation/model/investigationSchema.ts",
		"./src/entities/domain-regional/model/regionalDomainSchema.ts",
		"./src/entities/camp/model/campSchema.ts",
		"./src/entities/mercenary/model/mercenarySchema.ts",
		"./src/entities/espionage/model/espionageSchema.ts",
		"./src/entities/dungeon/model/dungeonSchema.ts",
		"./src/entities/siege/model/siegeSchema.ts",
	],
	out: "./drizzle",
	dialect: "sqlite",
	breakpoints: true,
});
