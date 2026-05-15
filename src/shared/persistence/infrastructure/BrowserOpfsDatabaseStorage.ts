import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	DatabaseFileFailure,
	DatabaseFileStorage,
} from "../model/sqliteOpfsTypes";

export class BrowserOpfsDatabaseStorage implements DatabaseFileStorage {
	public constructor(private readonly fileName = "pandorha.sqlite3") {}

	public async readDatabaseFile(): Promise<
		Result<Uint8Array | null, DatabaseFileFailure>
	> {
		const root = await getOpfsRoot();
		if (!root.success) {
			return fail(root.error);
		}

		try {
			const fileHandle = await root.data.getFileHandle(this.fileName);
			const file = await fileHandle.getFile();
			return ok(new Uint8Array(await file.arrayBuffer()));
		} catch (error: unknown) {
			if (isNotFoundError(error)) {
				return ok(null);
			}

			return fail({
				code: "DATABASE_FILE_READ_FAILED",
				message: "Could not read SQLite database file from OPFS.",
				details: { cause: stringifyCause(error) },
			});
		}
	}

	public async writeDatabaseFile(
		bytes: Uint8Array,
	): Promise<Result<void, DatabaseFileFailure>> {
		const root = await getOpfsRoot();
		if (!root.success) {
			return fail(root.error);
		}

		try {
			const fileHandle = await root.data.getFileHandle(this.fileName, {
				create: true,
			});
			const writable = await fileHandle.createWritable();
			const writableBytes: Uint8Array<ArrayBuffer> = new Uint8Array(
				bytes.byteLength,
			);
			writableBytes.set(bytes);
			await writable.write(writableBytes);
			await writable.close();
			return ok(undefined);
		} catch (error: unknown) {
			return fail({
				code: "DATABASE_FILE_WRITE_FAILED",
				message: "Could not write SQLite database file to OPFS.",
				details: { cause: stringifyCause(error) },
			});
		}
	}
}

async function getOpfsRoot(): Promise<
	Result<FileSystemDirectoryHandle, DatabaseFileFailure>
> {
	if (!globalThis.navigator?.storage?.getDirectory) {
		return fail({
			code: "OPFS_UNAVAILABLE",
			message: "OPFS is not available in this browser context.",
		});
	}

	try {
		return ok(await globalThis.navigator.storage.getDirectory());
	} catch (error: unknown) {
		return fail({
			code: "OPFS_UNAVAILABLE",
			message: "OPFS root directory could not be opened.",
			details: { cause: stringifyCause(error) },
		});
	}
}

function isNotFoundError(error: unknown): boolean {
	return error instanceof DOMException && error.name === "NotFoundError";
}

function stringifyCause(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
