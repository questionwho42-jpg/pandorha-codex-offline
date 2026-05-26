import { describe, expect, it } from "vitest";
import type {
	ClockData,
	IClockRepository,
} from "../../../entities/clocks/model-api";
import { fail, ok, type Result } from "../../../shared/lib/result";
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

	describe("Métodos de Instância e Persistência", () => {
		class FakeClockRepository implements IClockRepository {
			public clocks = new Map<string, ClockData>();
			public shouldFail = false;

			public async findById(
				id: string,
			): Promise<Result<ClockData | null, Error>> {
				if (this.shouldFail) return fail(new Error("Erro de BD simulado"));
				const clk = this.clocks.get(id);
				return ok(clk ?? null);
			}

			public async save(clock: ClockData): Promise<Result<ClockData, Error>> {
				if (this.shouldFail) return fail(new Error("Erro de BD simulado"));
				this.clocks.set(clock.id, clock);
				return ok(clock);
			}

			public async findAll(): Promise<Result<ClockData[], Error>> {
				if (this.shouldFail) return fail(new Error("Erro de BD simulado"));
				return ok(Array.from(this.clocks.values()));
			}

			public async delete(id: string): Promise<Result<void, Error>> {
				if (this.shouldFail) return fail(new Error("Erro de BD simulado"));
				this.clocks.delete(id);
				return ok(undefined);
			}
		}

		it("deve falhar se o repositorio nao for configurado", async () => {
			const service = new ClockService(); // sem repo

			const resCreate = await service.create("Teste", 4);
			expect(resCreate.success).toBe(false);

			const resAdvance = await service.advance("id", 2);
			expect(resAdvance.success).toBe(false);

			const resReduce = await service.reduce("id", 2);
			expect(resReduce.success).toBe(false);

			const resList = await service.list();
			expect(resList.success).toBe(false);

			const resDelete = await service.delete("id");
			expect(resDelete.success).toBe(false);
		});

		it("deve criar, listar, avançar, reduzir e deletar clocks usando a instancia e o repositorio", async () => {
			const repo = new FakeClockRepository();
			const service = new ClockService(repo);

			// 1. Criar
			const createRes = await service.create(
				"Fuga do Castelo",
				6,
				"PORTA_FECHADA",
			);
			expect(createRes.success).toBe(true);
			const clk = createRes.success ? createRes.data : ({} as ClockData);
			expect(clk.name).toBe("Fuga do Castelo");
			expect(clk.totalSegments).toBe(6);
			expect(clk.filledSegments).toBe(0);

			// 2. Listar
			const listRes = await service.list();
			expect(listRes.success).toBe(true);
			if (listRes.success) {
				expect(listRes.data.length).toBe(1);
				expect(listRes.data[0]?.id).toBe(clk.id);
			}

			// 3. Avançar
			const advRes = await service.advance(clk.id, 3);
			expect(advRes.success).toBe(true);
			if (advRes.success) {
				expect(advRes.data.clock.filledSegments).toBe(3);
				expect(advRes.data.eventTriggered).toBeUndefined();
			}

			// 4. Reduzir
			const redRes = await service.reduce(clk.id, 2);
			expect(redRes.success).toBe(true);
			if (redRes.success) {
				expect(redRes.data.filledSegments).toBe(1);
			}

			// Avança até completar
			const completeRes = await service.advance(clk.id, 5); // 1 + 5 = 6
			expect(completeRes.success).toBe(true);
			if (completeRes.success) {
				expect(completeRes.data.clock.isCompleted).toBe(true);
				expect(completeRes.data.eventTriggered).toBe("PORTA_FECHADA");
			}

			// 5. Deletar
			const delRes = await service.delete(clk.id);
			expect(delRes.success).toBe(true);

			const listRes2 = await service.list();
			expect(listRes2.success).toBe(true);
			if (listRes2.success) {
				expect(listRes2.data.length).toBe(0);
			}
		});

		it("deve lidar com erros de validacao ao criar, avançar ou reduzir na instancia", async () => {
			const repo = new FakeClockRepository();
			const service = new ClockService(repo);

			// Criar inválido (1 segmento)
			const resCreate = await service.create("Invalido", 1);
			expect(resCreate.success).toBe(false);

			// Avançar inválido ou reduzir inválido
			const createRes = await service.create("Valido", 4);
			const clk = createRes.success ? createRes.data : ({} as ClockData);

			// Avançar 0 (inválido)
			const resAdv = await service.advance(clk.id, 0);
			expect(resAdv.success).toBe(false);

			// Reduzir 0 (inválido)
			const resRed = await service.reduce(clk.id, 0);
			expect(resRed.success).toBe(false);
		});

		it("deve falhar se o clock nao for encontrado ao avançar ou reduzir", async () => {
			const repo = new FakeClockRepository();
			const service = new ClockService(repo);

			const resAdv = await service.advance("id_inexistente", 2);
			expect(resAdv.success).toBe(false);

			const resRed = await service.reduce("id_inexistente", 2);
			expect(resRed.success).toBe(false);
		});

		it("deve falhar se o repositorio retornar erro no findById ou save", async () => {
			const repo = new FakeClockRepository();
			const service = new ClockService(repo);

			// 1. Falha de save ao criar
			repo.shouldFail = true;
			const resCreateFail = await service.create("Valido", 4);
			expect(resCreateFail.success).toBe(false);
			repo.shouldFail = false;

			const createRes = await service.create("Valido", 4);
			const clk = createRes.success ? createRes.data : ({} as ClockData);

			repo.shouldFail = true;

			// falha no findById ao avançar
			const resAdv = await service.advance(clk.id, 2);
			expect(resAdv.success).toBe(false);

			// falha no findById ao reduzir
			const resRed = await service.reduce(clk.id, 2);
			expect(resRed.success).toBe(false);

			// Restaura shouldFail para o findById passar
			repo.shouldFail = false;

			// 2. Falha de save ao avançar
			const originalSave = repo.save.bind(repo);
			repo.save = async () => fail(new Error("Erro save"));
			const resAdvSave = await service.advance(clk.id, 2);
			expect(resAdvSave.success).toBe(false);

			// Restaura save para avançar o clock e preenchê-lo com segmentos
			repo.save = originalSave;
			await service.advance(clk.id, 2); // preenche com 2 segmentos

			// 3. Falha de save ao reduzir
			repo.save = async () => fail(new Error("Erro save"));
			const resRedSave = await service.reduce(clk.id, 2); // reduz 2 (redução válida de 2 para 0)
			expect(resRedSave.success).toBe(false);
		});
	});
});
