import type { Result } from "$lib/shared/lib/result";
import type { SpellCircle, SpellId, SpellRecord } from "../model/spellSchema";
import type { SpellRepositoryFailure } from "../model/spellTypes";

export interface SpellCatalogRepository {
	listSpells(): Promise<Result<readonly SpellRecord[], SpellRepositoryFailure>>;
	findSpellById(
		id: SpellId,
	): Promise<Result<SpellRecord, SpellRepositoryFailure>>;
	listSpellsByCircle(
		circle: SpellCircle,
	): Promise<Result<readonly SpellRecord[], SpellRepositoryFailure>>;
}
