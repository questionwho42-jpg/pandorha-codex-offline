import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { FactionCatalogRepository } from "../domain/FactionCatalogRepository";
import type {
	FactionId,
	FactionRecord,
	FactionStandingRecord,
} from "../model/factionSchema";
import {
	factionSelectSchema,
	factionStandingSelectSchema,
} from "../model/factionSchema";
import type { FactionRepositoryFailure } from "../model/factionTypes";

interface InMemoryFactionCatalogInput {
	readonly factions: readonly FactionRecord[];
	readonly standings: readonly FactionStandingRecord[];
}

export class InMemoryFactionCatalogRepository
	implements FactionCatalogRepository
{
	private readonly factionRecords = new Map<FactionId, FactionRecord>();
	private readonly standingRecords = new Map<
		FactionId,
		FactionStandingRecord
	>();
	private nextFactionListFailure: FactionRepositoryFailure | null = null;
	private nextFactionFindFailure: FactionRepositoryFailure | null = null;
	private nextStandingListFailure: FactionRepositoryFailure | null = null;
	private nextStandingFindFailure: FactionRepositoryFailure | null = null;
	public factionLookupCount = 0;
	public standingLookupCount = 0;

	public constructor(input: InMemoryFactionCatalogInput) {
		for (const record of input.factions) {
			const parsed = factionSelectSchema.safeParse(record);
			if (parsed.success) {
				this.factionRecords.set(parsed.data.id, parsed.data);
			}
		}

		for (const record of input.standings) {
			const parsed = factionStandingSelectSchema.safeParse(record);
			if (parsed.success) {
				this.standingRecords.set(parsed.data.factionId, parsed.data);
			}
		}
	}

	public async listFactions(): Promise<
		Result<readonly FactionRecord[], FactionRepositoryFailure>
	> {
		if (this.nextFactionListFailure) {
			const failure = this.nextFactionListFailure;
			this.nextFactionListFailure = null;
			return fail(failure);
		}

		return ok(Array.from(this.factionRecords.values()));
	}

	public async findFactionById(
		id: FactionId,
	): Promise<Result<FactionRecord, FactionRepositoryFailure>> {
		this.factionLookupCount += 1;

		if (this.nextFactionFindFailure) {
			const failure = this.nextFactionFindFailure;
			this.nextFactionFindFailure = null;
			return fail(failure);
		}

		const record = this.factionRecords.get(id);
		if (!record) {
			return fail({
				code: "FACTION_NOT_FOUND",
				message: "Faction record was not found in memory.",
				details: { id },
			});
		}

		return ok(record);
	}

	public async listFactionStandings(): Promise<
		Result<readonly FactionStandingRecord[], FactionRepositoryFailure>
	> {
		if (this.nextStandingListFailure) {
			const failure = this.nextStandingListFailure;
			this.nextStandingListFailure = null;
			return fail(failure);
		}

		return ok(Array.from(this.standingRecords.values()));
	}

	public async findFactionStandingByFactionId(
		id: FactionId,
	): Promise<Result<FactionStandingRecord, FactionRepositoryFailure>> {
		this.standingLookupCount += 1;

		if (this.nextStandingFindFailure) {
			const failure = this.nextStandingFindFailure;
			this.nextStandingFindFailure = null;
			return fail(failure);
		}

		const record = this.standingRecords.get(id);
		if (!record) {
			return fail({
				code: "FACTION_STANDING_NOT_FOUND",
				message: "Faction standing was not found in memory.",
				details: { id },
			});
		}

		return ok(record);
	}

	public failNextFactionList(failure: FactionRepositoryFailure): void {
		this.nextFactionListFailure = failure;
	}

	public failNextFactionFind(failure: FactionRepositoryFailure): void {
		this.nextFactionFindFailure = failure;
	}

	public failNextStandingList(failure: FactionRepositoryFailure): void {
		this.nextStandingListFailure = failure;
	}

	public failNextStandingFind(failure: FactionRepositoryFailure): void {
		this.nextStandingFindFailure = failure;
	}
}
