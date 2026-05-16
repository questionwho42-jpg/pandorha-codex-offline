import { fail, ok, type Result } from "../../../shared/lib/result";
import type { ClockData, IClockRepository } from "../model-api";

export class FakeClockRepository implements IClockRepository {
	private readonly clocks = new Map<string, ClockData>();

	async save(clock: ClockData): Promise<Result<ClockData, Error>> {
		try {
			// Simula deep clone para evitar mutação indesejada em memória
			const data = JSON.parse(JSON.stringify(clock));
			this.clocks.set(clock.id, data);
			return ok(data);
		} catch (error) {
			return fail(
				error instanceof Error
					? error
					: new Error("Erro ao salvar clock no fake"),
			);
		}
	}

	async findById(id: string): Promise<Result<ClockData | null, Error>> {
		const clock = this.clocks.get(id);
		return ok(clock ? JSON.parse(JSON.stringify(clock)) : null);
	}

	async findAll(): Promise<Result<ClockData[], Error>> {
		const all = Array.from(this.clocks.values()).map((c) =>
			JSON.parse(JSON.stringify(c)),
		);
		return ok(all);
	}

	async delete(id: string): Promise<Result<void, Error>> {
		this.clocks.delete(id);
		return ok(undefined);
	}

	// Helper function for tests to clear the DB
	clear() {
		this.clocks.clear();
	}
}
