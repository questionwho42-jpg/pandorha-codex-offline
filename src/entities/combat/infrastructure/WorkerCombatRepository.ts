import { fail, ok, type Result } from "$lib/shared/lib/result";
import { type RpcResponse, rpcCache } from "$lib/shared/rpc";
import type { CombatRepository } from "../domain/CombatRepository";
import type {
	ActiveSessionRecord,
	CombatEncounterRecord,
	CombatMonsterRecord,
	NewActiveSessionRecord,
	NewCombatEncounterRecord,
	NewCombatMonsterRecord,
} from "../model/combatSchema";

export class WorkerCombatRepository implements CombatRepository {
	private readonly worker: Worker;
	private readonly pendingRequests = new Map<
		string,
		{
			resolve: (
				value: Result<unknown, { code: string; message: string }>,
			) => void;
			reject: (reason: unknown) => void;
		}
	>();

	public constructor() {
		this.worker = new Worker(
			new URL(
				"../../../shared/persistence/worker/pandorhaDatabase.worker.ts",
				import.meta.url,
			),
			{ type: "module" },
		);

		this.worker.onmessage = (event: MessageEvent<RpcResponse>) => {
			const response = event.data;
			const pending = this.pendingRequests.get(response.messageId);
			if (pending) {
				this.pendingRequests.delete(response.messageId);
				if (response.success) {
					pending.resolve(ok(response.data));
				} else {
					pending.resolve(
						fail({
							code: response.error.code,
							message: response.error.message,
						}),
					);
				}
			}
		};

		void this.sendRequest("INIT_DATABASE", {
			requestedAt: new Date().toISOString(),
		});
	}

	private async sendRequest(
		type: string,
		payload: unknown,
	): Promise<Result<unknown, { code: string; message: string }>> {
		rpcCache.invalidate(type);

		const isMutation =
			!type.startsWith("LOAD_") &&
			!type.startsWith("FIND_") &&
			!type.startsWith("LIST_") &&
			type !== "INIT_DATABASE";

		if (!isMutation) {
			const cached = rpcCache.get(type, payload);
			if (cached !== null) {
				return ok(cached);
			}
		}

		const messageId = crypto.randomUUID();
		const request = {
			messageId,
			type,
			payload,
		};

		const startTime = performance.now();

		const result = await new Promise<
			Result<unknown, { code: string; message: string }>
		>((resolve, reject) => {
			this.pendingRequests.set(messageId, { resolve, reject });
			this.worker.postMessage(request);
		});

		const latency = performance.now() - startTime;
		if (latency > 16) {
			console.warn(
				`[RPC Latency Warning] Request ${type} took ${latency.toFixed(2)}ms (budget exceeded)`,
			);
		} else {
			console.log(`[RPC Latency] Request ${type} took ${latency.toFixed(2)}ms`);
		}

		if (result.success && !isMutation) {
			rpcCache.set(type, payload, result.data);
		}

		return result;
	}

	public async saveEncounter(
		encounter: NewCombatEncounterRecord,
	): Promise<Result<CombatEncounterRecord, { code: string; message: string }>> {
		const res = await this.sendRequest("SAVE_COMBAT_ENCOUNTER", {
			combatEncounter: encounter,
		});
		if (!res.success) {
			return fail({
				code: "COMBAT_ENCOUNTER_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as CombatEncounterRecord);
	}

	public async findEncounterById(
		id: string,
	): Promise<
		Result<CombatEncounterRecord | null, { code: string; message: string }>
	> {
		const res = await this.sendRequest("FIND_COMBAT_ENCOUNTER", { id });
		if (!res.success) {
			return fail({
				code: "COMBAT_ENCOUNTER_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as CombatEncounterRecord | null);
	}

	public async saveMonster(
		monster: NewCombatMonsterRecord,
	): Promise<Result<CombatMonsterRecord, { code: string; message: string }>> {
		const res = await this.sendRequest("SAVE_COMBAT_MONSTER", {
			combatMonster: monster,
		});
		if (!res.success) {
			return fail({
				code: "COMBAT_MONSTER_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as CombatMonsterRecord);
	}

	public async findMonstersByEncounterId(
		encounterId: string,
	): Promise<
		Result<readonly CombatMonsterRecord[], { code: string; message: string }>
	> {
		const res = await this.sendRequest("FIND_COMBAT_MONSTERS_BY_ENCOUNTER", {
			combatEncounterId: encounterId,
		});
		if (!res.success) {
			return fail({
				code: "COMBAT_MONSTERS_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as readonly CombatMonsterRecord[]);
	}

	public async saveActiveSession(
		session: NewActiveSessionRecord,
	): Promise<Result<ActiveSessionRecord, { code: string; message: string }>> {
		const res = await this.sendRequest("SAVE_ACTIVE_SESSION", {
			activeSession: session,
		});
		if (!res.success) {
			return fail({
				code: "ACTIVE_SESSION_WRITE_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as ActiveSessionRecord);
	}

	public async findActiveSessionById(
		id: string,
	): Promise<
		Result<ActiveSessionRecord | null, { code: string; message: string }>
	> {
		const res = await this.sendRequest("FIND_ACTIVE_SESSION", { id });
		if (!res.success) {
			return fail({
				code: "ACTIVE_SESSION_READ_FAILED",
				message: res.error.message,
			});
		}
		return ok(res.data as ActiveSessionRecord | null);
	}
}
