import type { Result } from "$lib/shared/lib/result";
import type {
	NewWorldStateEntryRecord,
	WorldStateEntryRecord,
	WorldStateKey,
	WorldStateListPrefix,
} from "../model/worldStateSchema";
import type { WorldStateRepositoryFailure } from "../model/worldStateTypes";

export interface WorldStateRepository {
	setFlag(
		record: NewWorldStateEntryRecord,
	): Promise<Result<WorldStateEntryRecord, WorldStateRepositoryFailure>>;
	getFlag(
		key: WorldStateKey,
	): Promise<Result<WorldStateEntryRecord, WorldStateRepositoryFailure>>;
	listFlagsByPrefix(
		prefix: WorldStateListPrefix,
	): Promise<
		Result<readonly WorldStateEntryRecord[], WorldStateRepositoryFailure>
	>;
}
