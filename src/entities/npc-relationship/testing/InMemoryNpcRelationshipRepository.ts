import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { NpcRelationshipRepository } from "../domain/NpcRelationshipRepository";
import {
	type NewNpcRelationshipRecord,
	type NpcRelationshipNpcId,
	type NpcRelationshipRecord,
	npcRelationshipSelectSchema,
} from "../model/npcRelationshipSchema";
import type { NpcRelationshipRepositoryFailure } from "../model/npcRelationshipTypes";

interface InMemoryNpcRelationshipRepositoryInput {
	readonly records?: readonly NpcRelationshipRecord[];
}

export class InMemoryNpcRelationshipRepository
	implements NpcRelationshipRepository
{
	private readonly recordsByNpcId = new Map<
		NpcRelationshipNpcId,
		NpcRelationshipRecord
	>();
	private nextSaveFailure: NpcRelationshipRepositoryFailure | null = null;
	private nextLookupFailure: NpcRelationshipRepositoryFailure | null = null;
	public writeCount = 0;
	public lookupCount = 0;

	public constructor(input: InMemoryNpcRelationshipRepositoryInput = {}) {
		for (const record of input.records ?? []) {
			const parsed = npcRelationshipSelectSchema.safeParse(record);
			if (parsed.success) {
				this.recordsByNpcId.set(parsed.data.npcId, parsed.data);
			}
		}
	}

	public async save(
		record: NewNpcRelationshipRecord,
	): Promise<Result<NpcRelationshipRecord, NpcRelationshipRepositoryFailure>> {
		this.writeCount += 1;

		if (this.nextSaveFailure) {
			const failure = this.nextSaveFailure;
			this.nextSaveFailure = null;
			return fail(failure);
		}

		const parsed = npcRelationshipSelectSchema.safeParse(record);
		if (!parsed.success) {
			return fail({
				code: "CORRUPTED_NPC_RELATIONSHIP_RECORD",
				message: "Fake repository received an invalid NPC relationship record.",
			});
		}

		this.recordsByNpcId.set(parsed.data.npcId, parsed.data);
		return ok({ ...parsed.data });
	}

	public async findByNpcId(
		npcId: NpcRelationshipNpcId,
	): Promise<Result<NpcRelationshipRecord, NpcRelationshipRepositoryFailure>> {
		this.lookupCount += 1;

		if (this.nextLookupFailure) {
			const failure = this.nextLookupFailure;
			this.nextLookupFailure = null;
			return fail(failure);
		}

		const record = this.recordsByNpcId.get(npcId);
		if (!record) {
			return fail({
				code: "NPC_RELATIONSHIP_NOT_FOUND",
				message: "NPC relationship was not found in memory.",
				details: { npcId },
			});
		}

		return ok({ ...record });
	}

	public all(): readonly NpcRelationshipRecord[] {
		return Array.from(this.recordsByNpcId.values()).map((record) => ({
			...record,
		}));
	}

	public failNextSave(failure: NpcRelationshipRepositoryFailure): void {
		this.nextSaveFailure = failure;
	}

	public failNextLookup(failure: NpcRelationshipRepositoryFailure): void {
		this.nextLookupFailure = failure;
	}
}
