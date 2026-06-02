import type { Result } from "$lib/shared/lib/result";
import type {
	ConsumableId,
	ConsumableRecord,
	EquipmentId,
	EquipmentRecord,
} from "../model/equipmentSchema";
import type { EquipmentRepositoryFailure } from "../model/equipmentTypes";

export interface EquipmentCatalogRepository {
	listEquipment(): Promise<
		Result<readonly EquipmentRecord[], EquipmentRepositoryFailure>
	>;
	findEquipmentById(
		id: EquipmentId,
	): Promise<Result<EquipmentRecord, EquipmentRepositoryFailure>>;
	listConsumables(): Promise<
		Result<readonly ConsumableRecord[], EquipmentRepositoryFailure>
	>;
	findConsumableById(
		id: ConsumableId,
	): Promise<Result<ConsumableRecord, EquipmentRepositoryFailure>>;
}
