import { describe, expect, it } from "vitest";
import { fail, ok } from "$lib/shared/lib/result";
import { BastionService } from "../domain/BastionService";
import { InMemoryBastionRepository } from "../infrastructure/InMemoryBastionRepository";
import type { BastionRecord } from "../model/bastionSchema";

describe("BastionService", () => {
	it("deve fundar um bastião corretamente com bônus de chassi", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const result = await service.foundBastion(
			"Muralha de Ferro",
			"fortaleza_pedra",
		);
		expect(result.success).toBe(true);
		if (result.success) {
			const record = result.data;
			expect(record.name).toBe("Muralha de Ferro");
			expect(record.chassisId).toBe("fortaleza_pedra");
			// Base (1) + Fortaleza de Pedra (+2 Estrutura) = 3 Estrutura
			expect(record.structure).toBe(3);
			expect(record.vigilance).toBe(1);
			expect(record.logistics).toBe(1);
			expect(record.integrityCurrent).toBe(3 * 10 + 0 * 20); // (Estrutura * 10) + (Tier * 20)
			expect(record.threatCurrent).toBe(0);
			expect(record.vaultGold).toBe(0);
		}
	});

	it("deve iniciar a construção de um módulo respeitando custos", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const foundResult = await service.foundBastion("Guarida", "taverna_guilda");
		expect(foundResult.success).toBe(true);
		const bId = foundResult.success ? foundResult.data.id : "";

		// Iniciar módulo de Tier 1: Horta de Alquimia (Custo: 500 PO, Barra: 10 Pontos)
		const startResult = await service.startModule(bId, "horta_alquimia", 1);
		expect(startResult.success).toBe(true);

		const modulesResult = await repository.findModulesByBastionId(bId);
		expect(modulesResult.success).toBe(true);
		if (modulesResult.success) {
			expect(modulesResult.data.length).toBe(1);
			const m = modulesResult.data[0]!;
			expect(m.moduleId).toBe("horta_alquimia");
			expect(m.tier).toBe(1);
			expect(m.progressCurrent).toBe(0);
			expect(m.progressMax).toBe(10);
			expect(m.isBroken).toBe(false);
		}
	});

	it("deve avançar o progresso da obra do módulo baseado nas rolagens do Andarilho", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const foundResult = await service.foundBastion("Guarida", "taverna_guilda");
		const bId = foundResult.success ? foundResult.data.id : "";

		await service.startModule(bId, "horta_alquimia", 1);
		const modules = await repository.findModulesByBastionId(bId);
		const mId = modules.success ? modules.data[0]!.id : "";

		// Rolagem que falha contra DC 15 (Mental: 2, Dado: 8 => Total 10 vs 15)
		const failProgress = await service.advanceModuleObra(mId, 2, 8, 15);
		expect(failProgress.success).toBe(true);
		if (failProgress.success) {
			expect(failProgress.data.progressAdded).toBe(0);
			expect(failProgress.data.completed).toBe(false);
		}

		// Rolagem que tem Sucesso (Mental: 3, Dado: 13 => Total 16 vs 15)
		const successProgress = await service.advanceModuleObra(mId, 3, 13, 15);
		expect(successProgress.success).toBe(true);
		if (successProgress.success) {
			expect(successProgress.data.progressAdded).toBe(1);
			expect(successProgress.data.completed).toBe(false);
		}

		// Rolagem com Sucesso Crítico (Mental: 3, Dado: 20 => Dado natural 20)
		const critProgress = await service.advanceModuleObra(mId, 3, 20, 15);
		expect(critProgress.success).toBe(true);
		if (critProgress.success) {
			expect(critProgress.data.progressAdded).toBe(3);
			expect(critProgress.data.completed).toBe(false);
		}
	});

	it("deve calcular a manutenção descontada por Logística usando Decorator", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		// Galeão Marítimo: +2 Logística. Base: 1 + 2 = 3 Logística (-30% manutenção)
		const foundResult = await service.foundBastion("Navio do Céu", "galeao");
		const bId = foundResult.success ? foundResult.data.id : "";

		// Adiciona 2 módulos ativos completos para cobrar manutenção
		// Módulos Tier 1: Manutenção = 50 PO cada. Bastião Tier 0 = 0 PO. Total Base = 100 PO
		await service.startModule(bId, "posto_vigia", 1);
		await service.startModule(bId, "dormitorio_comum", 1);

		const modules = await repository.findModulesByBastionId(bId);
		if (modules.success) {
			for (const m of modules.data) {
				m.progressCurrent = m.progressMax; // completa a obra
				await repository.saveModule(m);
			}
		}

		// Taxa com -30% desconto: 100 PO - 30 PO = 70 PO
		const maintenanceResult = await service.calculateCurrentMaintenance(bId);
		expect(maintenanceResult.success).toBe(true);
		if (maintenanceResult.success) {
			expect(maintenanceResult.data).toBe(70);
		}
	});

	it("deve cobrar a manutenção do cofre e lidar com falta de fundos", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const foundResult = await service.foundBastion("Base Logística", "galeao");
		const b = foundResult.success ? foundResult.data : ({} as BastionRecord);

		// Constrói 1 módulo
		await service.startModule(b.id, "dormitorio_comum", 1);
		const modules = await repository.findModulesByBastionId(b.id);
		if (modules.success && modules.data[0]) {
			const mod = modules.data[0];
			mod.progressCurrent = mod.progressMax;
			await repository.saveModule(mod);
		}

		// Adiciona 200 PO no cofre
		b.vaultGold = 200;
		await repository.save(b);

		// Manutenção calculada: Galeão (3 Logística = -30%). Módulo T1 (50 PO). Manutenção = 35 PO
		const payResult = await service.processRecessEnd(b.id);
		expect(payResult.success).toBe(true);
		if (payResult.success) {
			expect(payResult.data.maintenanceCost).toBe(35);
			expect(payResult.data.threatGained).toBe(0);
		}

		const updatedBastion = await repository.findById(b.id);
		expect(updatedBastion.success).toBe(true);
		if (updatedBastion.success) {
			expect(updatedBastion.data.vaultGold).toBe(165); // 200 - 35
		}
	});

	it("deve acumular ameaça passiva se o cofre exceder o limite seguro", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		// Taverna: +2 Vigilância. Base: 1 + 2 = 3 Vigilância
		// Limite seguro: Vigilância * 1000 PO = 3000 PO
		const foundResult = await service.foundBastion(
			"Taverna Secreta",
			"taverna_guilda",
		);
		const b = foundResult.success ? foundResult.data : ({} as BastionRecord);

		// Deposita 4000 PO no cofre (1000 PO acima do limite)
		// Excesso: 1000 PO. Ameaça passiva gerada por semana: 1 ponto a cada 500 PO excedentes = +2 ameaça
		b.vaultGold = 4000;
		await repository.save(b);

		const processResult = await service.processRecessEnd(b.id);
		expect(processResult.success).toBe(true);
		if (processResult.success) {
			expect(processResult.data.threatGained).toBe(2);
		}
	});
});
