import { z } from "zod/v4";

const technicalId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(120);
const quantity = z.number().int().min(1).max(999);

export const inventoryCharacterInputSchema = z.object({
	characterId: technicalId,
});

export const inventoryAddCatalogItemInputSchema =
	inventoryCharacterInputSchema.extend({
		catalogItemId: technicalId,
	});

export const inventoryAddConsumableInputSchema =
	inventoryAddCatalogItemInputSchema.extend({
		quantity,
	});

export const inventoryEntryMutationInputSchema =
	inventoryCharacterInputSchema.extend({
		entryId: technicalId,
	});

export const inventoryConsumeInputSchema =
	inventoryEntryMutationInputSchema.extend({
		quantity,
	});
