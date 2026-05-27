import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const technicalId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);
const pressureKey = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9:-]*$/)
	.max(180);
const isoTimestamp = z.string().trim().datetime({ offset: true });
const pressureDamage = z.number().int().min(0).max(999);

export const npcRelationshipAttitudeSchema = z.enum([
	"friendly",
	"neutral",
	"skeptical",
	"hostile",
]);

export const npcRelationshipStatusSchema = z.enum([
	"stable",
	"strained",
	"ally",
	"enemy",
]);

export const npcRelationshipPressureSeveritySchema = z.enum([
	"pressure",
	"mental-break",
]);

export const appliedPressureKeysJsonSchema = z
	.string()
	.trim()
	.min(2)
	.max(4000)
	.refine(isPressureKeyArrayJson, {
		message: "appliedPressureKeysJson must be a JSON array of pressure keys.",
	});

export const npcRelationships = sqliteTable("npc_relationships", {
	npcId: text("npc_id").primaryKey(),
	attitude: text("attitude").notNull(),
	status: text("status").notNull(),
	pressureDamage: integer("pressure_damage").notNull(),
	appliedPressureKeysJson: text("applied_pressure_keys_json").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const npcRelationshipInsertSchema = createInsertSchema(
	npcRelationships,
).extend({
	npcId: technicalId,
	attitude: npcRelationshipAttitudeSchema,
	status: npcRelationshipStatusSchema,
	pressureDamage,
	appliedPressureKeysJson: appliedPressureKeysJsonSchema,
	updatedAt: isoTimestamp,
});

export const npcRelationshipSelectSchema = createSelectSchema(
	npcRelationships,
).extend({
	npcId: technicalId,
	attitude: npcRelationshipAttitudeSchema,
	status: npcRelationshipStatusSchema,
	pressureDamage,
	appliedPressureKeysJson: appliedPressureKeysJsonSchema,
	updatedAt: isoTimestamp,
});

export const npcRelationshipRawRecordInputSchema = createSelectSchema(
	npcRelationships,
).extend({
	npcId: technicalId,
	attitude: npcRelationshipAttitudeSchema,
	status: npcRelationshipStatusSchema,
	pressureDamage,
	appliedPressureKeysJson: z.string().trim().min(1).max(4000),
	updatedAt: isoTimestamp,
});

export const npcRelationshipCreateInputSchema = z.object({
	npcId: technicalId,
	initialAttitude: npcRelationshipAttitudeSchema.default("neutral"),
	updatedAt: isoTimestamp,
});

export const npcRelationshipPressureInputSchema = z.object({
	pressureKey,
	relationship: npcRelationshipRawRecordInputSchema,
	severity: npcRelationshipPressureSeveritySchema.default("pressure"),
	updatedAt: isoTimestamp,
});

export const npcRelationshipNpcIdSchema = technicalId;
export const npcRelationshipPressureKeySchema = pressureKey;

export type NpcRelationshipRecord = z.infer<typeof npcRelationshipSelectSchema>;
export type NewNpcRelationshipRecord = z.infer<
	typeof npcRelationshipInsertSchema
>;
export type NpcRelationshipNpcId = z.infer<typeof npcRelationshipNpcIdSchema>;
export type ParsedNpcRelationshipCreateInput = z.infer<
	typeof npcRelationshipCreateInputSchema
>;
export type ParsedNpcRelationshipPressureInput = z.infer<
	typeof npcRelationshipPressureInputSchema
>;

function isPressureKeyArrayJson(value: string): boolean {
	try {
		const parsed = JSON.parse(value) as unknown;
		return (
			Array.isArray(parsed) &&
			parsed.every(
				(item) => npcRelationshipPressureKeySchema.safeParse(item).success,
			)
		);
	} catch {
		return false;
	}
}
