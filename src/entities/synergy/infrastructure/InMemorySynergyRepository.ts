import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	SynergyRepository,
	SynergyRepositoryFailure,
} from "../domain/SynergyRepository";
import type {
	CampaignCohesionRecord,
	RegisteredSignatureRecord,
} from "../model/synergySchema";

export class InMemorySynergyRepository implements SynergyRepository {
	private cohesionState: CampaignCohesionRecord | null = null;
	private signatures: RegisteredSignatureRecord[] = [];

	public async getCohesion(
		id: string,
	): Promise<Result<CampaignCohesionRecord | null, SynergyRepositoryFailure>> {
		if (this.cohesionState && this.cohesionState.id === id) {
			return ok(this.cohesionState);
		}
		return ok(null);
	}

	public async saveCohesion(
		cohesion: CampaignCohesionRecord,
	): Promise<Result<CampaignCohesionRecord, SynergyRepositoryFailure>> {
		this.cohesionState = cohesion;
		return ok(cohesion);
	}

	public async saveSignature(
		signature: RegisteredSignatureRecord,
	): Promise<Result<RegisteredSignatureRecord, SynergyRepositoryFailure>> {
		const idx = this.signatures.findIndex((s) => s.id === signature.id);
		if (idx >= 0) {
			this.signatures[idx] = signature;
		} else {
			this.signatures.push(signature);
		}
		return ok(signature);
	}

	public async findSignatureById(
		id: string,
	): Promise<
		Result<RegisteredSignatureRecord | null, SynergyRepositoryFailure>
	> {
		const sig = this.signatures.find((s) => s.id === id);
		return ok(sig || null);
	}

	public async findAllSignatures(): Promise<
		Result<RegisteredSignatureRecord[], SynergyRepositoryFailure>
	> {
		return ok([...this.signatures]);
	}

	public async deleteSignature(
		id: string,
	): Promise<Result<void, SynergyRepositoryFailure>> {
		const idx = this.signatures.findIndex((s) => s.id === id);
		if (idx < 0) {
			return fail({
				code: "SIGNATURE_NOT_FOUND",
				message: `Assinatura de ID ${id} não encontrada.`,
			});
		}
		this.signatures.splice(idx, 1);
		return ok(undefined);
	}
}
