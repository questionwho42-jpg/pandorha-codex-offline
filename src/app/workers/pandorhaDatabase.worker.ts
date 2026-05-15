import initSqlJs from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { SqliteSaveSnapshotService } from "$lib/features/save-load/domain/SqliteSaveSnapshotService";
import { ok } from "$lib/shared/lib/result";
import {
	BrowserOpfsDatabaseStorage,
	handleDatabaseWorkerRequest,
	SqliteOpfsBootstrapService,
} from "$lib/shared/persistence";

const storage = new BrowserOpfsDatabaseStorage();
const createSqlite = () =>
	initSqlJs({
		locateFile: () => sqlWasmUrl,
	});
const bootstrapService = new SqliteOpfsBootstrapService({
	storage,
	createSqlite,
});
const snapshotService = new SqliteSaveSnapshotService({
	storage,
	createSqlite,
});
const snapshotWorkerPort = {
	saveSnapshot: async (input: unknown) => {
		const saved = await snapshotService.saveSnapshot(input);
		if (!saved.success) {
			return saved;
		}

		return ok({
			saveId: saved.data.saveId,
			version: saved.data.version,
			savedAt: saved.data.savedAt,
			characterCount: saved.data.characterCount,
			worldStateCount: saved.data.worldStateCount,
		});
	},
	loadSnapshot: async () => {
		const loaded = await snapshotService.loadSnapshot();
		if (!loaded.success) {
			return loaded;
		}

		return ok({
			version: loaded.data.version,
			savedAt: loaded.data.savedAt,
			characters: loaded.data.characters.map((character) => ({
				...character,
			})),
			worldState: loaded.data.worldState.map((flag) => ({
				key: flag.key,
				value: flag.value,
				updatedAt: flag.updatedAt,
			})),
		});
	},
};

self.onmessage = (event: MessageEvent<unknown>): void => {
	void handleDatabaseWorkerRequest(event.data, {
		bootstrapService,
		snapshotService: snapshotWorkerPort,
	}).then((response) => {
		self.postMessage(response);
	});
};
