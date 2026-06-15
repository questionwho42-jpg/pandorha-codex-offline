import type { Result } from "$lib/shared/lib/result";
import type {
	InventoryEventRecord,
	NewInventoryEventRecord,
} from "../model/inventoryEventSchema";
import type { InventoryRepositoryFailure } from "../model/inventoryTypes";

export interface InventoryEventRepository {
	append(
		records: readonly NewInventoryEventRecord[],
	): Promise<
		Result<readonly InventoryEventRecord[], InventoryRepositoryFailure>
	>;
	listByCharacterId(
		characterId: string,
	): Promise<
		Result<readonly InventoryEventRecord[], InventoryRepositoryFailure>
	>;
}
