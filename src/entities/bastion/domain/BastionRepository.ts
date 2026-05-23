import type { Result } from "$lib/shared/lib/result";
import type {
	BastionModuleRecord,
	BastionRecord,
} from "../model/bastionSchema";

export interface BastionRepositoryFailure {
	readonly code:
		| "BASTION_REPOSITORY_WRITE_FAILED"
		| "BASTION_REPOSITORY_READ_FAILED"
		| "BASTION_NOT_FOUND"
		| "BASTION_MODULE_NOT_FOUND";
	readonly message: string;
	readonly details?: unknown;
}

export interface BastionRepository {
	save(
		bastion: BastionRecord,
	): Promise<Result<BastionRecord, BastionRepositoryFailure>>;
	findById(
		id: string,
	): Promise<Result<BastionRecord, BastionRepositoryFailure>>;
	saveModule(
		module: BastionModuleRecord,
	): Promise<Result<BastionModuleRecord, BastionRepositoryFailure>>;
	findModuleById(
		id: string,
	): Promise<Result<BastionModuleRecord, BastionRepositoryFailure>>;
	findModulesByBastionId(
		bastionId: string,
	): Promise<Result<readonly BastionModuleRecord[], BastionRepositoryFailure>>;
	deleteModule(id: string): Promise<Result<void, BastionRepositoryFailure>>;
}
