import { describe, expect, it } from "vitest";
import type { ClockData } from "../../../entities/clocks/model-api";
import { ClockService } from "../domain/ClockService";

describe("ClockService", () => {
	it("deve criar um relógio válido e não concluído", () => {
		const clockResult = ClockService.createClock("Alerta da Guarda", 4);

		expect(clockResult.success).toBe(true);
		if (clockResult.success) {
			expect(clockResult.data.name).toBe("Alerta da Guarda");
			expect(clockResult.data.totalSegments).toBe(4);
			expect(clockResult.data.filledSegments).toBe(0);
			expect(clockResult.data.isCompleted).toBe(false);
		}
	});

	it("deve falhar ao tentar criar relógio com menos de 2 segmentos", () => {
		const clockResult = ClockService.createClock("Relógio Bugado", 1);
		expect(clockResult.success).toBe(false);
		if (!clockResult.success) {
			expect(clockResult.error.message).toContain("no mínimo 2 segmentos");
		}
	});

	it("deve avançar o relógio corretamente sem estourar o limite", () => {
		const clockResult = ClockService.createClock("Alerta da Guarda", 4);
		if (!clockResult.success) return expect.fail("Falhou no setup");

		const clock = clockResult.data;
		const advanceResult = ClockService.advanceClock(clock, 2);

		expect(advanceResult.success).toBe(true);
		if (advanceResult.success) {
			expect(advanceResult.data.clock.filledSegments).toBe(2);
			expect(advanceResult.data.clock.isCompleted).toBe(false);
			expect(advanceResult.data.eventTriggered).toBeUndefined();
		}
	});

	it("deve completar o relógio e retornar o evento de gatilho se atingir o máximo", () => {
		const clockResult = ClockService.createClock(
			"Alerta da Guarda",
			4,
			"ALERTA_DISPARADO",
		);
		if (!clockResult.success) return expect.fail("Falhou no setup");

		const clock = clockResult.data;
		const advanceResult = ClockService.advanceClock(clock, 4);

		expect(advanceResult.success).toBe(true);
		if (advanceResult.success) {
			expect(advanceResult.data.clock.filledSegments).toBe(4);
			expect(advanceResult.data.clock.isCompleted).toBe(true);
			expect(advanceResult.data.eventTriggered).toBe("ALERTA_DISPARADO");
		}
	});

	it("deve barrar avanço se tentar ultrapassar o número de segmentos do relógio (Overflow error)", () => {
		const clockResult = ClockService.createClock("Alerta da Guarda", 4);
		if (!clockResult.success) return expect.fail("Falhou no setup");

		const clock = clockResult.data;
		const advanceResult = ClockService.advanceClock(clock, 5);

		expect(advanceResult.success).toBe(false);
		if (!advanceResult.success) {
			expect(advanceResult.error.message).toContain("Overflow");
		}
	});

	it("deve permitir retroceder o relógio corretamente (cura/redução de ameaça)", () => {
		const clockResult = ClockService.createClock("Ameaça Constante", 6);
		if (!clockResult.success) return expect.fail("Falhou no setup");

		let clock = clockResult.data;

		// Avança 4
		const advanceResult = ClockService.advanceClock(clock, 4);
		if (!advanceResult.success) return expect.fail("Falhou no setup avanço");
		clock = advanceResult.data.clock;

		// Retrocede 2
		const reduceResult = ClockService.reduceClock(clock, 2);
		expect(reduceResult.success).toBe(true);
		if (reduceResult.success) {
			expect(reduceResult.data.filledSegments).toBe(2);
			expect(reduceResult.data.isCompleted).toBe(false);
		}
	});

	it("deve barrar recuo de relógio abaixo de zero", () => {
		const clockResult = ClockService.createClock("Ameaça Constante", 6);
		if (!clockResult.success) return expect.fail("Falhou no setup");

		const clock = clockResult.data;

		// Retrocede 2 em um relógio vazio
		const reduceResult = ClockService.reduceClock(clock, 2);
		expect(reduceResult.success).toBe(false);
		if (!reduceResult.success) {
			expect(reduceResult.error.message).toContain("abaixo de zero");
		}
	});

	it("deve falhar na validação ao avançar relógio corrompido", () => {
		const corruptedClock = {
			id: "invalid-uuid",
			name: "Corrompido",
			totalSegments: 4,
			filledSegments: 0,
			isCompleted: false,
		} as unknown as ClockData;

		const result = ClockService.advanceClock(corruptedClock, 1);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.message).toContain("Erro de integridade");
		} else {
			expect.fail("Deveria ter falhado");
		}
	});

	it("deve falhar ao avançar valor menor ou igual a zero", () => {
		const clockResult = ClockService.createClock("Teste", 4);
		if (!clockResult.success) return expect.fail("Falhou no setup");

		const result = ClockService.advanceClock(clockResult.data, 0);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.message).toBe("O avanço deve ser maior que zero");
		}
	});

	it("deve falhar ao avançar relógio já completo", () => {
		const clockResult = ClockService.createClock("Teste", 4);
		if (!clockResult.success) return expect.fail("Falhou no setup");

		const result1 = ClockService.advanceClock(clockResult.data, 4);
		expect(result1.success).toBe(true);

		if (result1.success) {
			const result2 = ClockService.advanceClock(result1.data.clock, 1);
			expect(result2.success).toBe(false);
			if (!result2.success) {
				expect(result2.error.message).toBe("O relógio já está completo");
			}
		}
	});

	it("deve falhar na validação ao reduzir relógio corrompido", () => {
		const corruptedClock = {
			id: "invalid-uuid",
			name: "Corrompido",
			totalSegments: 4,
			filledSegments: 2,
			isCompleted: false,
		} as unknown as ClockData;

		const result = ClockService.reduceClock(corruptedClock, 1);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.message).toContain("Erro de integridade");
		}
	});

	it("deve falhar ao reduzir valor menor ou igual a zero", () => {
		const clockResult = ClockService.createClock("Teste", 4);
		if (!clockResult.success) return expect.fail("Falhou no setup");

		const result = ClockService.reduceClock(clockResult.data, 0);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.message).toBe("A redução deve ser maior que zero");
		}
	});
});
