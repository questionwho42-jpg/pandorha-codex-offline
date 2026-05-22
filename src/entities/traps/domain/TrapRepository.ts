import type { Result } from "$lib/shared/lib/result";
import type { NewTrapRecord, TrapRecord } from "../model/trapSchema";

export type TrapRepositoryFailure = {
	code:
		| "TRAP_NOT_FOUND"
		| "TRAP_REPOSITORY_WRITE_FAILED"
		| "CORRUPTED_TRAP_RECORD";
	message: string;
	details?: unknown;
};

export interface TrapRepository {
	save(
		record: NewTrapRecord,
	): Promise<Result<TrapRecord, TrapRepositoryFailure>>;
	findById(id: string): Promise<Result<TrapRecord, TrapRepositoryFailure>>;
	findByTileId(
		tileId: string,
	): Promise<Result<TrapRecord[], TrapRepositoryFailure>>;
	delete(id: string): Promise<Result<void, TrapRepositoryFailure>>;
}
