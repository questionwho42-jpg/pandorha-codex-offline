import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { SpellCatalogRepository } from "../domain/SpellCatalogRepository";
import { OFFICIAL_SPELLS } from "../model/spellCatalog";
import type { SpellCircle, SpellId, SpellRecord } from "../model/spellSchema";
import { spellSelectSchema } from "../model/spellSchema";
import type { SpellRepositoryFailure } from "../model/spellTypes";

interface InMemorySpellCatalogInput {
	readonly spells: readonly SpellRecord[];
}

export class InMemorySpellCatalogRepository implements SpellCatalogRepository {
	private readonly spellRecords = new Map<SpellId, SpellRecord>();
	private nextSpellListFailure: SpellRepositoryFailure | null = null;
	private nextSpellFindFailure: SpellRepositoryFailure | null = null;
	private nextCircleListFailure: SpellRepositoryFailure | null = null;
	public spellLookupCount = 0;
	public circleLookupCount = 0;

	public constructor(
		input: InMemorySpellCatalogInput = { spells: OFFICIAL_SPELLS },
	) {
		for (const record of input.spells) {
			const parsed = spellSelectSchema.safeParse(record);
			if (parsed.success) {
				this.spellRecords.set(parsed.data.id, parsed.data);
			}
		}
	}

	public async listSpells(): Promise<
		Result<readonly SpellRecord[], SpellRepositoryFailure>
	> {
		if (this.nextSpellListFailure) {
			const failure = this.nextSpellListFailure;
			this.nextSpellListFailure = null;
			return fail(failure);
		}

		return ok(Array.from(this.spellRecords.values()));
	}

	public async findSpellById(
		id: SpellId,
	): Promise<Result<SpellRecord, SpellRepositoryFailure>> {
		this.spellLookupCount += 1;

		if (this.nextSpellFindFailure) {
			const failure = this.nextSpellFindFailure;
			this.nextSpellFindFailure = null;
			return fail(failure);
		}

		const record = this.spellRecords.get(id);
		if (!record) {
			return fail({
				code: "SPELL_NOT_FOUND",
				message: "Spell record was not found in memory.",
				details: { id },
			});
		}

		return ok(record);
	}

	public async listSpellsByCircle(
		circle: SpellCircle,
	): Promise<Result<readonly SpellRecord[], SpellRepositoryFailure>> {
		this.circleLookupCount += 1;

		if (this.nextCircleListFailure) {
			const failure = this.nextCircleListFailure;
			this.nextCircleListFailure = null;
			return fail(failure);
		}

		return ok(
			Array.from(this.spellRecords.values()).filter(
				(record) => record.circle === circle,
			),
		);
	}

	public failNextSpellList(failure: SpellRepositoryFailure): void {
		this.nextSpellListFailure = failure;
	}

	public failNextSpellFind(failure: SpellRepositoryFailure): void {
		this.nextSpellFindFailure = failure;
	}

	public failNextCircleList(failure: SpellRepositoryFailure): void {
		this.nextCircleListFailure = failure;
	}
}
