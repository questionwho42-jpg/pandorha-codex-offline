import type { Result } from "$lib/shared/lib/result";
import type { NpcFactionId, NpcId, NpcRecord } from "../model/npcSchema";
import type { NpcFailure } from "../model/npcTypes";

export type NpcCatalogRepository = {
	readonly listNpcs: () => Promise<Result<readonly NpcRecord[], NpcFailure>>;
	readonly findNpcById: (id: NpcId) => Promise<Result<NpcRecord, NpcFailure>>;
	readonly listNpcsByFactionId: (
		factionId: NpcFactionId,
	) => Promise<Result<readonly NpcRecord[], NpcFailure>>;
};
