import type { Result } from "$lib/shared/lib/result";
import type {
	EquipmentDurabilityEventRecord,
	NewEquipmentDurabilityEventRecord,
} from "../model/equipmentDurabilityEventSchema";
import type { EquipmentDurabilityRepositoryFailure } from "../model/equipmentDurabilityTypes";

export interface EquipmentDurabilityEventRepository {
	append(
		records: readonly NewEquipmentDurabilityEventRecord[],
	): Promise<
		Result<
			readonly EquipmentDurabilityEventRecord[],
			EquipmentDurabilityRepositoryFailure
		>
	>;
	listByCharacterId(
		characterId: string,
	): Promise<
		Result<
			readonly EquipmentDurabilityEventRecord[],
			EquipmentDurabilityRepositoryFailure
		>
	>;
}
