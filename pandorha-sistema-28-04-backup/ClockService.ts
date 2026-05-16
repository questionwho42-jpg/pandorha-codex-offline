import { clockSchema } from "../../../entities/clocks/model/clockSchema";
import type { ClockData } from "../../../entities/clocks/model-api";
import { fail, ok, type Result } from "../../../shared/lib/result";

export type AdvanceClockResult = {
	clock: ClockData;
	eventTriggered?: string | undefined;
};

// biome-ignore lint/complexity/noStaticOnlyClass: Domain Service encapsulate static domain logic for now
export class ClockService {
	/**
	 * Cria um novo relógio limpo, validado pelo schema
	 */
	static createClock(
		name: string,
		totalSegments: number,
		triggerEvent?: string,
	): Result<ClockData, Error> {
		const clockData = {
			id: crypto.randomUUID(),
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
			eventTriggered: validation.data.isCompleted
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
