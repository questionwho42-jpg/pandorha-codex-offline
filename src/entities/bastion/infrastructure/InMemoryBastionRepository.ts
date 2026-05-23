import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	BastionRepository,
	BastionRepositoryFailure,
} from "../domain/BastionRepository";
import type {
	BastionModuleRecord,
	BastionRecord,
} from "../model/bastionSchema";

export class InMemoryBastionRepository implements BastionRepository {
	public bastions: BastionRecord[] = [];
	public modules: BastionModuleRecord[] = [];

	public async save(
		bastion: BastionRecord,
	): Promise<Result<BastionRecord, BastionRepositoryFailure>> {
		const idx = this.bastions.findIndex((b) => b.id === bastion.id);
		if (idx >= 0) {
			this.bastions[idx] = bastion;
		} else {
			this.bastions.push(bastion);
		}
		return ok(bastion);
	}

	public async findById(
		id: string,
	): Promise<Result<BastionRecord, BastionRepositoryFailure>> {
		const b = this.bastions.find((b) => b.id === id);
		if (!b) {
			return fail({
				code: "BASTION_NOT_FOUND",
				message: `Bastião com o ID ${id} não encontrado.`,
			});
		}
		return ok(b);
	}

	public async saveModule(
		module: BastionModuleRecord,
	): Promise<Result<BastionModuleRecord, BastionRepositoryFailure>> {
		const idx = this.modules.findIndex((m) => m.id === module.id);
		if (idx >= 0) {
			this.modules[idx] = module;
		} else {
			this.modules.push(module);
		}
		return ok(module);
	}

	public async findModuleById(
		id: string,
	): Promise<Result<BastionModuleRecord, BastionRepositoryFailure>> {
		const m = this.modules.find((m) => m.id === id);
		if (!m) {
			return fail({
				code: "BASTION_MODULE_NOT_FOUND",
				message: `Módulo do Bastião com o ID ${id} não encontrado.`,
			});
		}
		return ok(m);
	}

	public async findModulesByBastionId(
		bastionId: string,
	): Promise<Result<readonly BastionModuleRecord[], BastionRepositoryFailure>> {
		const list = this.modules.filter((m) => m.bastionId === bastionId);
		return ok(list);
	}

	public async deleteModule(
		id: string,
	): Promise<Result<void, BastionRepositoryFailure>> {
		const idx = this.modules.findIndex((m) => m.id === id);
		if (idx < 0) {
			return fail({
				code: "BASTION_MODULE_NOT_FOUND",
				message: `Módulo do Bastião com o ID ${id} não encontrado.`,
			});
		}
		this.modules.splice(idx, 1);
		return ok(undefined);
	}
}
