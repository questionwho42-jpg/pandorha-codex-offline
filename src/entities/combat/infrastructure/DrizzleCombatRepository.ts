import { eq } from "drizzle-orm";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CombatRepository } from "../domain/CombatRepository";
import {
	type ActiveSessionRecord,
	activeSessionSelectSchema,
	activeSessions,
	type CombatEncounterRecord,
	type CombatMonsterRecord,
	combatEncounterSelectSchema,
	combatEncounters,
	combatMonsterSelectSchema,
	combatMonsters,
	type NewActiveSessionRecord,
	type NewCombatEncounterRecord,
	type NewCombatMonsterRecord,
} from "../model/combatSchema";

export class DrizzleCombatRepository implements CombatRepository {
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle database instance
	public constructor(private readonly db: any) {}

	public async saveEncounter(
		encounter: NewCombatEncounterRecord,
	): Promise<Result<CombatEncounterRecord, { code: string; message: string }>> {
		try {
			await this.db
				.insert(combatEncounters)
				.values(encounter)
				.onConflictDoUpdate({
					target: combatEncounters.id,
					set: {
						turn: encounter.turn,
						round: encounter.round,
						initiativeOrderJson: encounter.initiativeOrderJson,
						status: encounter.status,
						updatedAt: encounter.updatedAt,
					},
				})
				.run();

			const result = await this.findEncounterById(encounter.id);
			if (!result.success || !result.data) {
				return fail({
					code: "COMBAT_ENCOUNTER_SAVE_FAILED",
					message: "Failed to load encounter after save.",
				});
			}
			return ok(result.data);
		} catch (error: unknown) {
			return fail({
				code: "COMBAT_ENCOUNTER_WRITE_FAILED",
				message: "Could not save combat encounter.",
				details: { cause: String(error) },
			});
		}
	}

	public async findEncounterById(
		id: string,
	): Promise<
		Result<CombatEncounterRecord | null, { code: string; message: string }>
	> {
		try {
			const rows = await this.db
				.select()
				.from(combatEncounters)
				.where(eq(combatEncounters.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return ok(null);
			}
			return ok(combatEncounterSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "COMBAT_ENCOUNTER_READ_FAILED",
				message: "Could not load combat encounter.",
				details: { cause: String(error) },
			});
		}
	}

	public async saveMonster(
		monster: NewCombatMonsterRecord,
	): Promise<Result<CombatMonsterRecord, { code: string; message: string }>> {
		try {
			await this.db
				.insert(combatMonsters)
				.values(monster)
				.onConflictDoUpdate({
					target: combatMonsters.id,
					set: {
						monsterId: monster.monsterId,
						name: monster.name,
						hpCurrent: monster.hpCurrent,
						hpMax: monster.hpMax,
						eeCurrent: monster.eeCurrent,
						eeMax: monster.eeMax,
						tacticalRole: monster.tacticalRole,
						updatedAt: monster.updatedAt,
					},
				})
				.run();

			const rows = await this.db
				.select()
				.from(combatMonsters)
				.where(eq(combatMonsters.id, monster.id))
				.all();
			const row = rows[0];
			if (!row) {
				return fail({
					code: "COMBAT_MONSTER_SAVE_FAILED",
					message: "Failed to load monster after save.",
				});
			}
			return ok(combatMonsterSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "COMBAT_MONSTER_WRITE_FAILED",
				message: "Could not save combat monster.",
				details: { cause: String(error) },
			});
		}
	}

	public async findMonstersByEncounterId(
		encounterId: string,
	): Promise<
		Result<readonly CombatMonsterRecord[], { code: string; message: string }>
	> {
		try {
			const rows = await this.db
				.select()
				.from(combatMonsters)
				.where(eq(combatMonsters.combatEncounterId, encounterId))
				.all();
			const list = rows.map((r: unknown) => combatMonsterSelectSchema.parse(r));
			return ok(list);
		} catch (error: unknown) {
			return fail({
				code: "COMBAT_MONSTERS_READ_FAILED",
				message: "Could not load combat monsters.",
				details: { cause: String(error) },
			});
		}
	}

	public async saveActiveSession(
		session: NewActiveSessionRecord,
	): Promise<Result<ActiveSessionRecord, { code: string; message: string }>> {
		try {
			await this.db
				.insert(activeSessions)
				.values(session)
				.onConflictDoUpdate({
					target: activeSessions.id,
					set: {
						combatEncounterId: session.combatEncounterId,
						updatedAt: session.updatedAt,
					},
				})
				.run();

			const result = await this.findActiveSessionById(session.id);
			if (!result.success || !result.data) {
				return fail({
					code: "ACTIVE_SESSION_SAVE_FAILED",
					message: "Failed to load active session after save.",
				});
			}
			return ok(result.data);
		} catch (error: unknown) {
			return fail({
				code: "ACTIVE_SESSION_WRITE_FAILED",
				message: "Could not save active session.",
				details: { cause: String(error) },
			});
		}
	}

	public async findActiveSessionById(
		id: string,
	): Promise<
		Result<ActiveSessionRecord | null, { code: string; message: string }>
	> {
		try {
			const rows = await this.db
				.select()
				.from(activeSessions)
				.where(eq(activeSessions.id, id))
				.all();
			const row = rows[0];
			if (!row) {
				return ok(null);
			}
			return ok(activeSessionSelectSchema.parse(row));
		} catch (error: unknown) {
			return fail({
				code: "ACTIVE_SESSION_READ_FAILED",
				message: "Could not load active session.",
				details: { cause: String(error) },
			});
		}
	}
}
