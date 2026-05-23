import type { Result } from "$lib/shared/lib/result";
import type {
	CampaignCohesionRecord,
	RegisteredSignatureRecord,
} from "../model/synergySchema";

export interface SynergyRepositoryFailure {
	readonly code:
		| "SYNERGY_REPOSITORY_WRITE_FAILED"
		| "SYNERGY_REPOSITORY_READ_FAILED"
		| "COHESION_STATE_NOT_FOUND"
		| "SIGNATURE_NOT_FOUND";
	readonly message: string;
	readonly details?: unknown;
}

export interface SynergyRepository {
	getCohesion(
		id: string,
	): Promise<Result<CampaignCohesionRecord | null, SynergyRepositoryFailure>>;
	saveCohesion(
		cohesion: CampaignCohesionRecord,
	): Promise<Result<CampaignCohesionRecord, SynergyRepositoryFailure>>;
	saveSignature(
		signature: RegisteredSignatureRecord,
	): Promise<Result<RegisteredSignatureRecord, SynergyRepositoryFailure>>;
	findSignatureById(
		id: string,
	): Promise<
		Result<RegisteredSignatureRecord | null, SynergyRepositoryFailure>
	>;
	findAllSignatures(): Promise<
		Result<RegisteredSignatureRecord[], SynergyRepositoryFailure>
	>;
	deleteSignature(id: string): Promise<Result<void, SynergyRepositoryFailure>>;
}
