import type { Result } from "$lib/shared/lib/result";
import type {
	ActiveSessionRecord,
	CombatEncounterRecord,
	CombatMonsterRecord,
	NewActiveSessionRecord,
	NewCombatEncounterRecord,
	NewCombatMonsterRecord,
} from "../model/combatSchema";

export interface CombatRepository {
	saveEncounter(
		encounter: NewCombatEncounterRecord,
	): Promise<Result<CombatEncounterRecord, { code: string; message: string }>>;

	findEncounterById(
		id: string,
	): Promise<
		Result<CombatEncounterRecord | null, { code: string; message: string }>
	>;

	saveMonster(
		monster: NewCombatMonsterRecord,
	): Promise<Result<CombatMonsterRecord, { code: string; message: string }>>;

	findMonstersByEncounterId(
		encounterId: string,
	): Promise<
		Result<readonly CombatMonsterRecord[], { code: string; message: string }>
	>;

	saveActiveSession(
		session: NewActiveSessionRecord,
	): Promise<Result<ActiveSessionRecord, { code: string; message: string }>>;

	findActiveSessionById(
		id: string,
	): Promise<
		Result<ActiveSessionRecord | null, { code: string; message: string }>
	>;
}
