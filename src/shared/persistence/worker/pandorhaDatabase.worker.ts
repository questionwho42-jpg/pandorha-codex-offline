import initSqlJs from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { SqliteOpfsBootstrapService } from "../domain/SqliteOpfsBootstrapService";
import { BrowserOpfsDatabaseStorage } from "../infrastructure/BrowserOpfsDatabaseStorage";
import { handleDatabaseWorkerRequest } from "./databaseWorkerHandler";

const bootstrapService = new SqliteOpfsBootstrapService({
	storage: new BrowserOpfsDatabaseStorage(),
	createSqlite: () =>
		initSqlJs({
			locateFile: () => sqlWasmUrl,
		}),
});

self.onmessage = (event: MessageEvent<unknown>): void => {
	void handleDatabaseWorkerRequest(event.data, { bootstrapService }).then(
		(response) => {
			self.postMessage(response);
		},
	);
};
