import type { Result } from "$lib/shared/lib/result";
import type {
	EquipmentLoadoutEventRecord,
	NewEquipmentLoadoutEventRecord,
} from "../model/equipmentLoadoutEventSchema";
import type { EquipmentLoadoutRepositoryFailure } from "../model/equipmentLoadoutTypes";

export interface EquipmentLoadoutEventRepository {
	append(
		records: readonly NewEquipmentLoadoutEventRecord[],
	): Promise<
		Result<
			readonly EquipmentLoadoutEventRecord[],
			EquipmentLoadoutRepositoryFailure
		>
	>;
	listByCharacterId(
		characterId: string,
	): Promise<
		Result<
			readonly EquipmentLoadoutEventRecord[],
			EquipmentLoadoutRepositoryFailure
		>
	>;
}
