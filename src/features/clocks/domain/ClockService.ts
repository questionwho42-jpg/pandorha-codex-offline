import { clockSelectSchema as clockSchema } from "../../../entities/clocks/model/clockSchema";
import type {
	ClockData,
	IClockRepository,
} from "../../../entities/clocks/model-api";
import { generateId } from "../../../shared/lib/id";
import { fail, ok, type Result } from "../../../shared/lib/result";

export type AdvanceClockResult = {
	clock: ClockData;
	eventTriggered?: string | undefined;
};

export class ClockService {
	public constructor(private readonly repository?: IClockRepository) {}

	/**
	 * Métodos de instância persistentes assíncronos
	 */
	public async create(
		name: string,
		totalSegments: number,
		triggerEvent?: string,
	): Promise<Result<ClockData, Error>> {
		if (!this.repository) {
			return fail(new Error("Repository not configured in ClockService"));
		}

		const result = ClockService.createClock(name, totalSegments, triggerEvent);
		if (!result.success) {
			return fail(result.error);
		}

		const saveRes = await this.repository.save(result.data);
		if (!saveRes.success) {
			return fail(saveRes.error);
		}

		return ok(saveRes.data);
	}

	public async advance(
		id: string,
		amount: number,
	): Promise<Result<AdvanceClockResult, Error>> {
		if (!this.repository) {
			return fail(new Error("Repository not configured in ClockService"));
		}

		const findRes = await this.repository.findById(id);
		if (!findRes.success) {
			return fail(findRes.error);
		}
		if (!findRes.data) {
			return fail(new Error(`Clock com ID ${id} não encontrado`));
		}

		const advanceRes = ClockService.advanceClock(findRes.data, amount);
		if (!advanceRes.success) {
			return fail(advanceRes.error);
		}

		const saveRes = await this.repository.save(advanceRes.data.clock);
		if (!saveRes.success) {
			return fail(saveRes.error);
		}

		return ok({
			clock: saveRes.data,
			eventTriggered: advanceRes.data.eventTriggered,
		});
	}

	public async reduce(
		id: string,
		amount: number,
	): Promise<Result<ClockData, Error>> {
		if (!this.repository) {
			return fail(new Error("Repository not configured in ClockService"));
		}

		const findRes = await this.repository.findById(id);
		if (!findRes.success) {
			return fail(findRes.error);
		}
		if (!findRes.data) {
			return fail(new Error(`Clock com ID ${id} não encontrado`));
		}

		const reduceRes = ClockService.reduceClock(findRes.data, amount);
		if (!reduceRes.success) {
			return fail(reduceRes.error);
		}

		const saveRes = await this.repository.save(reduceRes.data);
		if (!saveRes.success) {
			return fail(saveRes.error);
		}

		return ok(saveRes.data);
	}

	public async list(): Promise<Result<ClockData[], Error>> {
		if (!this.repository) {
			return fail(new Error("Repository not configured in ClockService"));
		}
		return this.repository.findAll();
	}

	public async delete(id: string): Promise<Result<void, Error>> {
		if (!this.repository) {
			return fail(new Error("Repository not configured in ClockService"));
		}
		return this.repository.delete(id);
	}

	/**
	 * Cria um novo relógio limpo, validado pelo schema
	 */
	static createClock(
		name: string,
		totalSegments: number,
		triggerEvent?: string,
	): Result<ClockData, Error> {
		const clockData = {
			id: generateId("clk"),
			name,
			totalSegments,
			filledSegments: 0,
			isCompleted: false,
			triggerEvent,
		};

		const validation = clockSchema.safeParse(clockData);
		if (!validation.success) {
			return fail(
				new Error(`Dados do clock inválidos: ${validation.error.message}`),
			);
		}

		return ok(validation.data);
	}

	/**
	 * Avança o relógio. Retorna erro se tentar ultrapassar o limite.
	 */
	static advanceClock(
		clock: ClockData,
		amount: number,
	): Result<AdvanceClockResult, Error> {
		if (amount <= 0) return fail(new Error("O avanço deve ser maior que zero"));
		if (clock.isCompleted) return fail(new Error("O relógio já está completo"));

		const newFilled = clock.filledSegments + amount;

		if (newFilled > clock.totalSegments) {
			return fail(
				new Error(
					"Overflow: Ação excede a quantidade de segmentos restantes do relógio.",
				),
			);
		}

		const updatedClock: ClockData = {
			...clock,
			filledSegments: newFilled,
			isCompleted: newFilled === clock.totalSegments,
		};

		const validation = clockSchema.safeParse(updatedClock);
		if (!validation.success) {
			return fail(
				new Error(
					`Erro de integridade ao atualizar clock: ${validation.error.message}`,
				),
			);
		}

		return ok<AdvanceClockResult>({
			clock: validation.data,
			eventTriggered:
				validation.data.isCompleted && validation.data.triggerEvent
					? validation.data.triggerEvent
					: undefined,
		});
	}

	/**
	 * Reduz os pontos do relógio, sem deixar ir abaixo de zero.
	 */
	static reduceClock(
		clock: ClockData,
		amount: number,
	): Result<ClockData, Error> {
		if (amount <= 0)
			return fail(new Error("A redução deve ser maior que zero"));

		const newFilled = clock.filledSegments - amount;

		if (newFilled < 0) {
			return fail(
				new Error(
					"Não é possível reduzir os segmentos preenchidos abaixo de zero.",
				),
			);
		}

		const updatedClock: ClockData = {
			...clock,
			filledSegments: newFilled,
			isCompleted: false, // Se reduziu, definitivamente não está completo
		};

		const validation = clockSchema.safeParse(updatedClock);
		if (!validation.success) {
			return fail(
				new Error(
					`Erro de integridade ao atualizar clock: ${validation.error.message}`,
				),
			);
		}

		return ok(validation.data);
	}
}
