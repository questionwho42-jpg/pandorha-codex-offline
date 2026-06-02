import { SaveLoadService } from "$lib/features/save-load";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { BrowserWorkerBridge } from "$lib/shared/rpc";

export interface SaveLoadSession {
	readonly service: SaveLoadService;
	initializeDatabase(): Promise<Result<void, SaveLoadSessionFailure>>;
}

export interface SaveLoadSessionFailure {
	readonly code: "SAVE_LOAD_INIT_FAILED";
	readonly message: string;
	readonly details?: unknown;
}

export function createSaveLoadSession(): SaveLoadSession {
	const worker = new Worker(
		new URL("../workers/pandorhaDatabase.worker.ts", import.meta.url),
		{
			type: "module",
		},
	);
	const bridge = new BrowserWorkerBridge(worker);
	const messageIdProvider = {
		generate: () => crypto.randomUUID(),
	};

	return {
		service: new SaveLoadService(bridge, messageIdProvider),
		initializeDatabase: async () => {
			const response = await bridge.send({
				messageId: messageIdProvider.generate(),
				type: "INIT_DATABASE",
				payload: { requestedAt: new Date().toISOString() },
			});
			if (!response.success) {
				return fail({
					code: "SAVE_LOAD_INIT_FAILED",
					message: "Worker bridge could not initialize the local database.",
					details: { bridgeCode: response.error.code },
				});
			}

			if (!response.data.success) {
				return fail({
					code: "SAVE_LOAD_INIT_FAILED",
					message: "Worker rejected local database initialization.",
					details: { workerCode: response.data.error.code },
				});
			}

			return ok(undefined);
		},
	};
}
