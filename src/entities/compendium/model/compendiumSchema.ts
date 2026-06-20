import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const notBlankText = z.string().trim().min(1);
const compendiumEntryId = notBlankText.regex(/^[a-z][a-z0-9-]*$/).max(80);
const compendiumTitle = notBlankText.max(140);
const compendiumSummary = notBlankText.max(700);
const compendiumSourceFile = notBlankText.max(180);
const compendiumSourceLine = z.number().int().min(1).max(50_000);
const compendiumSearchText = notBlankText.max(2_500);
const compendiumTag = notBlankText.regex(/^[a-z][a-z0-9-]*$/).max(60);
const compendiumTags = z.array(compendiumTag).min(1).max(12).readonly();

export const compendiumCategorySchema = z.enum([
	"character-creation",
	"ancestry",
	"class",
	"background",
	"system-survival",
	"system-combat",
	"system-magic",
]);

export const compendiumEntries = sqliteTable("compendium_entries", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	category: text("category").notNull(),
	summary: text("summary").notNull(),
	sourceFile: text("source_file").notNull(),
	sourceLine: integer("source_line").notNull(),
	searchText: text("search_text").notNull(),
	tags: text("tags", { mode: "json" }).$type<readonly string[]>().notNull(),
});

export const compendiumEntryInsertSchema = createInsertSchema(
	compendiumEntries,
).extend({
	id: compendiumEntryId,
	title: compendiumTitle,
	category: compendiumCategorySchema,
	summary: compendiumSummary,
	sourceFile: compendiumSourceFile,
	sourceLine: compendiumSourceLine,
	searchText: compendiumSearchText,
	tags: compendiumTags,
});

export const compendiumEntrySelectSchema = createSelectSchema(
	compendiumEntries,
).extend({
	id: compendiumEntryId,
	title: compendiumTitle,
	category: compendiumCategorySchema,
	summary: compendiumSummary,
	sourceFile: compendiumSourceFile,
	sourceLine: compendiumSourceLine,
	searchText: compendiumSearchText,
	tags: compendiumTags,
});

export const compendiumEntryIdSchema = compendiumEntrySelectSchema.shape.id;

export type CompendiumEntry = z.infer<typeof compendiumEntrySelectSchema>;
export type NewCompendiumEntry = z.infer<typeof compendiumEntryInsertSchema>;
export type CompendiumEntryId = z.infer<typeof compendiumEntryIdSchema>;
export type CompendiumCategory = z.infer<typeof compendiumCategorySchema>;
