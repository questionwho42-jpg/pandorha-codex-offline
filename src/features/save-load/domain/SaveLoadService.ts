import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { SaveGameSnapshot, WorkerBridge } from "$lib/shared/rpc";
import {
	CURRENT_SAVE_VERSION,
	loadedSessionStateSchema,
	migrateLoadedSessionToCurrent,
	saveSessionInputSchema,
} from "../model/saveLoadSchemas";
import type {
	LoadedSessionState,
	SaveLoadFailure,
	SaveLoadMessageIdProvider,
	SaveSessionResult,
} from "../model/saveLoadTypes";

/**
 * @description Coordinates validated save/load snapshots over the WorkerBridge without owning Worker transport, OPFS, or UI concerns.
 * @rule docs/architecture/feature_state_machines.md - save persists serialized ledger/state snapshots.
 * @rule docs/architecture/worker_rpc_spec.md - Main Thread talks to persistence through typed RPC commands.
 */
export class SaveLoadService {
	public constructor(
		private readonly workerBridge: WorkerBridge,
		private readonly messageIdProvider: SaveLoadMessageIdProvider,
	) {}

	public async saveSession(
		input: unknown,
	): Promise<Result<SaveSessionResult, SaveLoadFailure>> {
		const parsedInput = saveSessionInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return fail({
				code: "INVALID_SAVE_SESSION_INPUT",
				message: "Save session input failed validation.",
				details: { issues: formatIssues(parsedInput.error.issues) },
			});
		}

		const snapshot: SaveGameSnapshot = {
			version: CURRENT_SAVE_VERSION,
			savedAt: parsedInput.data.savedAt,
			characters: parsedInput.data.characters,
			worldState: parsedInput.data.worldState,
			clocks: parsedInput.data.clocks,
			campSessions: parsedInput.data.campSessions,
			campAssignments: parsedInput.data.campAssignments,
		};

		const response = await this.workerBridge.send({
			messageId: this.messageIdProvider.generate(),
			type: "SAVE_GAME_SNAPSHOT",
			payload: {
				saveId: "primary",
				snapshot,
			},
		});
		if (!response.success) {
			return fail({
				code: "SAVE_WORKER_FAILED",
				message: "Worker bridge could not save the session snapshot.",
				details: { bridgeCode: response.error.code },
			});
		}

		if (!response.data.success) {
			return fail({
				code: "SAVE_WORKER_FAILED",
				message: "Worker rejected the save session request.",
				details: { workerCode: response.data.error.code },
			});
		}

		return ok({
			saveId: "primary",
			version: CURRENT_SAVE_VERSION,
			savedAt: parsedInput.data.savedAt,
			characterCount: parsedInput.data.characters.length,
			worldStateCount: parsedInput.data.worldState.length,
			clockCount: parsedInput.data.clocks.length,
			campSessionCount: parsedInput.data.campSessions.length,
			campAssignmentCount: parsedInput.data.campAssignments.length,
		});
	}

	public async loadSession(): Promise<
		Result<LoadedSessionState, SaveLoadFailure>
	> {
		const response = await this.workerBridge.send({
			messageId: this.messageIdProvider.generate(),
			type: "LOAD_GAME_SNAPSHOT",
			payload: { saveId: "primary" },
		});
		if (!response.success) {
			return fail({
				code: "LOAD_WORKER_FAILED",
				message: "Worker bridge could not load the session snapshot.",
				details: { bridgeCode: response.error.code },
			});
		}

		if (!response.data.success) {
			return fail({
				code: "LOAD_WORKER_FAILED",
				message: "Worker rejected the load session request.",
				details: { workerCode: response.data.error.code },
			});
		}

		if (!isPlainObject(response.data.data)) {
			return fail({
				code: "INVALID_SAVE_WORKER_RESPONSE",
				message: "Worker returned a non-snapshot success payload.",
			});
		}

		const candidate = response.data.data;
		if (
			typeof candidate.version === "number" &&
			candidate.version > CURRENT_SAVE_VERSION
		) {
			return fail({
				code: "PENDING_SAVE_MIGRATION",
				message: "Loaded save uses a future schema version.",
				details: { receivedVersion: candidate.version },
			});
		}

		const parsedLoaded = loadedSessionStateSchema.safeParse(candidate);
		if (!parsedLoaded.success) {
			return fail({
				code: "CORRUPTED_SAVE_SNAPSHOT",
				message: "Loaded save snapshot failed validation.",
				details: { issues: formatIssues(parsedLoaded.error.issues) },
			});
		}
		const currentSnapshot = migrateLoadedSessionToCurrent(parsedLoaded.data);

		return ok({
			version: currentSnapshot.version,
			savedAt: currentSnapshot.savedAt,
			characters: currentSnapshot.characters,
			worldState: currentSnapshot.worldState,
			clocks: currentSnapshot.clocks,
			campSessions: currentSnapshot.campSessions,
			campAssignments: currentSnapshot.campAssignments,
		});
	}
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatIssues(
	issues: readonly {
		readonly path: readonly PropertyKey[];
		readonly message: string;
	}[],
): readonly string[] {
	return issues.map(
		(issue) =>
			`${issue.path.map(String).join(".") || "root"}: ${issue.message}`,
	);
}
