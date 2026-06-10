import { ok, type Result } from "$lib/shared/lib/result";
import type { CombatRepository } from "../domain/CombatRepository";
import type {
	ActiveSessionRecord,
	CombatEncounterRecord,
	CombatMonsterRecord,
	NewActiveSessionRecord,
	NewCombatEncounterRecord,
	NewCombatMonsterRecord,
} from "../model/combatSchema";

export class InMemoryCombatRepository implements CombatRepository {
	private encounters = new Map<string, CombatEncounterRecord>();
	private monsters = new Map<string, CombatMonsterRecord>();
	private sessions = new Map<string, ActiveSessionRecord>();

	public constructor(initialData?: {
		readonly encounters?: readonly CombatEncounterRecord[];
		readonly monsters?: readonly CombatMonsterRecord[];
		readonly sessions?: readonly ActiveSessionRecord[];
	}) {
		if (initialData?.encounters) {
			for (const item of initialData.encounters) {
				this.encounters.set(item.id, item);
			}
		}
		if (initialData?.monsters) {
			for (const item of initialData.monsters) {
				this.monsters.set(item.id, item);
			}
		}
		if (initialData?.sessions) {
			for (const item of initialData.sessions) {
				this.sessions.set(item.id, item);
			}
		}
	}

	public async saveEncounter(
		encounter: NewCombatEncounterRecord,
	): Promise<Result<CombatEncounterRecord, { code: string; message: string }>> {
		const record: CombatEncounterRecord = {
			...encounter,
		};
		this.encounters.set(record.id, record);
		return ok(record);
	}

	public async findEncounterById(
		id: string,
	): Promise<
		Result<CombatEncounterRecord | null, { code: string; message: string }>
	> {
		return ok(this.encounters.get(id) ?? null);
	}

	public async saveMonster(
		monster: NewCombatMonsterRecord,
	): Promise<Result<CombatMonsterRecord, { code: string; message: string }>> {
		const record: CombatMonsterRecord = {
			...monster,
		};
		this.monsters.set(record.id, record);
		return ok(record);
	}

	public async findMonstersByEncounterId(
		encounterId: string,
	): Promise<
		Result<readonly CombatMonsterRecord[], { code: string; message: string }>
	> {
		const list = Array.from(this.monsters.values()).filter(
			(m) => m.combatEncounterId === encounterId,
		);
		return ok(list);
	}

	public async saveActiveSession(
		session: NewActiveSessionRecord,
	): Promise<Result<ActiveSessionRecord, { code: string; message: string }>> {
		const record: ActiveSessionRecord = {
			id: session.id,
			combatEncounterId: session.combatEncounterId ?? null,
			updatedAt: session.updatedAt,
		};
		this.sessions.set(record.id, record);
		return ok(record);
	}

	public async findActiveSessionById(
		id: string,
	): Promise<
		Result<ActiveSessionRecord | null, { code: string; message: string }>
	> {
		return ok(this.sessions.get(id) ?? null);
	}
}
