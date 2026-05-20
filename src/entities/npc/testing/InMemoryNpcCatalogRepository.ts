import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { NpcCatalogRepository } from "../domain/NpcCatalogRepository";
import { NPC_CATALOG } from "../model/npcCatalog";
import type { NpcFactionId, NpcId, NpcRecord } from "../model/npcSchema";
import type { NpcFailure } from "../model/npcTypes";

export class InMemoryNpcCatalogRepository implements NpcCatalogRepository {
	private readonly records: readonly NpcRecord[];
	private shouldFail = false;
	private calls = 0;

	public constructor(records: readonly NpcRecord[] = NPC_CATALOG) {
		this.records = [...records];
	}

	public getCallCount(): number {
		return this.calls;
	}

	public failNextCall(): void {
		this.shouldFail = true;
	}

	public async listNpcs(): Promise<Result<readonly NpcRecord[], NpcFailure>> {
		this.calls += 1;
		if (this.consumeFailure()) {
			return repositoryFailure();
		}

		return ok(this.records);
	}

	public async findNpcById(id: NpcId): Promise<Result<NpcRecord, NpcFailure>> {
		this.calls += 1;
		if (this.consumeFailure()) {
			return repositoryFailure();
		}

		const record = this.records.find((candidate) => candidate.id === id);
		if (!record) {
			return fail({
				code: "MISSING_NPC",
				message: "Npc record was not found.",
				details: { id },
			});
		}

		return ok(record);
	}

	public async listNpcsByFactionId(
		factionId: NpcFactionId,
	): Promise<Result<readonly NpcRecord[], NpcFailure>> {
		this.calls += 1;
		if (this.consumeFailure()) {
			return repositoryFailure();
		}

		return ok(
			this.records.filter((candidate) => candidate.factionId === factionId),
		);
	}

	private consumeFailure(): boolean {
		if (!this.shouldFail) {
			return false;
		}

		this.shouldFail = false;
		return true;
	}
}

function repositoryFailure(): Result<never, NpcFailure> {
	return fail({
		code: "REPOSITORY_FAILURE",
		message: "Npc repository failed.",
	});
}
