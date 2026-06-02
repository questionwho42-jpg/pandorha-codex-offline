import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import type { WorldStateValue } from "./worldStateTypes";

const isoTimestamp = z.string().trim().datetime({ offset: true });
const worldStateKeyPattern =
	/^(location|npc|plot|system|engine):[a-z0-9][a-z0-9:_-]*$/;
const worldStatePrefixPattern =
	/^(location|npc|plot|system|engine):([a-z0-9][a-z0-9:_-]*)?$/;

export const worldStateKeyPrefixSchema = z.enum([
	"location",
	"npc",
	"plot",
	"system",
	"engine",
]);
export const worldStateWritablePrefixSchema = z.enum([
	"location",
	"npc",
	"plot",
]);

export const worldStateKeySchema = z
	.string()
	.trim()
	.max(180)
	.regex(worldStateKeyPattern);

export const worldStateListPrefixSchema = z
	.string()
	.trim()
	.max(180)
	.regex(worldStatePrefixPattern);

export const worldStateValueSchema: z.ZodType<WorldStateValue> = z.lazy(() =>
	z.union([
		z.string(),
		z.number().finite(),
		z.boolean(),
		z.null(),
		z.array(worldStateValueSchema),
		z.record(z.string(), worldStateValueSchema),
	]),
);

export const worldStateValueJsonSchema = z
	.string()
	.trim()
	.min(1)
	.max(8000)
	.refine((value) => {
		try {
			const parsed: unknown = JSON.parse(value);
			return worldStateValueSchema.safeParse(parsed).success;
		} catch {
			return false;
		}
	});

export const worldStateEntries = sqliteTable("world_state_entries", {
	key: text("key").primaryKey(),
	valueJson: text("value_json").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const worldStateEntryInsertSchema = createInsertSchema(
	worldStateEntries,
).extend({
	key: worldStateKeySchema,
	valueJson: worldStateValueJsonSchema,
	updatedAt: isoTimestamp,
});

export const worldStateEntrySelectSchema = createSelectSchema(
	worldStateEntries,
).extend({
	key: worldStateKeySchema,
	valueJson: worldStateValueJsonSchema,
	updatedAt: isoTimestamp,
});

export const worldStateSetInputSchema = z.object({
	key: worldStateKeySchema,
	value: worldStateValueSchema,
	updatedAt: isoTimestamp,
});

export type WorldStateEntryRecord = z.infer<typeof worldStateEntrySelectSchema>;
export type NewWorldStateEntryRecord = z.infer<
	typeof worldStateEntryInsertSchema
>;
export type WorldStateKey = z.infer<typeof worldStateKeySchema>;
export type WorldStateListPrefix = z.infer<typeof worldStateListPrefixSchema>;
export type WorldStateSetInput = z.infer<typeof worldStateSetInputSchema>;
