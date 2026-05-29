import { describe, expect, it } from "vitest";
import { fail } from "$lib/shared/lib/result";
import {
	BaseBastionStats,
	BastionService,
	LogisticsDiscountDecorator,
	ReinforcedVaultDecorator,
	StoneWallDecorator,
	WatchPostDecorator,
	WoodenWallDecorator,
} from "../domain/BastionService";
import { InMemoryBastionRepository } from "../infrastructure/InMemoryBastionRepository";
import type { BastionRecord } from "../model/bastionSchema";

describe("BastionService", () => {
	it("deve fundar um bastiao corretamente com todos os chassis disponiveis e suas respectivas bonificacoes", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const chassisTestes = [
			{ id: "fortaleza_pedra", structure: 3, vigilance: 1, logistics: 1 },
			{ id: "taverna_guilda", structure: 1, vigilance: 3, logistics: 1 },
			{ id: "galeao", structure: 1, vigilance: 1, logistics: 3 },
			{ id: "torre_arcana", structure: 2, vigilance: 2, logistics: 1 },
			{ id: "masmorra_subterranea", structure: 3, vigilance: 1, logistics: 1 },
			{ id: "templo_arruinado", structure: 1, vigilance: 2, logistics: 2 },
			{ id: "caravana_nomade", structure: 1, vigilance: 1, logistics: 3 },
			{ id: "mansao_nobre", structure: 1, vigilance: 3, logistics: 1 },
			{ id: "mina_abandonada", structure: 2, vigilance: 1, logistics: 2 },
			{ id: "arvore_mae", structure: 2, vigilance: 2, logistics: 1 },
			{
				id: "outro_chassis_qualquer",
				structure: 1,
				vigilance: 1,
				logistics: 1,
			}, // default
		];

		for (const teste of chassisTestes) {
			const result = await service.foundBastion(
				`Nome Teste ${teste.id}`,
				teste.id,
			);
			expect(result.success).toBe(true);
			if (result.success) {
				const record = result.data;
				expect(record.chassisId).toBe(teste.id);
				expect(record.structure).toBe(teste.structure);
				expect(record.vigilance).toBe(teste.vigilance);
				expect(record.logistics).toBe(teste.logistics);
			}
		}
	});

	it("deve iniciar a construcao de modulos de diferentes tiers (1, 2, 3, 4) com progressMax correto", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const foundResult = await service.foundBastion("Guarida", "taverna_guilda");
		const bId = foundResult.success ? foundResult.data.id : "";

		const tiers = [
			{ tier: 1, max: 10 },
			{ tier: 2, max: 20 },
			{ tier: 3, max: 30 },
			{ tier: 4, max: 40 },
		];

		for (const t of tiers) {
			const startResult = await service.startModule(
				bId,
				`modulo_t_${t.tier}`,
				t.tier,
			);
			expect(startResult.success).toBe(true);
			if (startResult.success) {
				expect(startResult.data.progressMax).toBe(t.max);
			}
		}
	});

	it("deve retornar erro se tentar iniciar modulo para bastiao inexistente", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const result = await service.startModule(
			"id_inexistente",
			"modulo_teste",
			1,
		);
		expect(result.success).toBe(false);
	});

	it("deve avancar o progresso da obra do modulo baseado nas rolagens do Andarilho e retornar completed quando atingir progressMax", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const foundResult = await service.foundBastion("Guarida", "taverna_guilda");
		const bId = foundResult.success ? foundResult.data.id : "";

		await service.startModule(bId, "horta_alquimia", 1);
		const modules = await repository.findModulesByBastionId(bId);
		const mId = modules.success && modules.data[0] ? modules.data[0].id : "";

		// Avancando o progresso ate fechar o modulo. progressMax e 10.
		// Vamos dar sucessos criticos (soma +3 progressCurrent por critico)
		// 1 critico
		let progress = await service.advanceModuleObra(mId, 3, 20, 15);
		expect(progress.success).toBe(true);
		if (progress.success) {
			expect(progress.data.completed).toBe(false);
		}

		// 2 critico (total 6)
		progress = await service.advanceModuleObra(mId, 3, 20, 15);
		expect(progress.success).toBe(true);
		if (progress.success) {
			expect(progress.data.completed).toBe(false);
		}

		// 3 critico (total 9)
		progress = await service.advanceModuleObra(mId, 3, 20, 15);
		expect(progress.success).toBe(true);
		if (progress.success) {
			expect(progress.data.completed).toBe(false);
		}

		// 1 sucesso normal (total 10)
		progress = await service.advanceModuleObra(mId, 3, 13, 15);
		expect(progress.success).toBe(true);
		if (progress.success) {
			expect(progress.data.completed).toBe(true);
			expect(progress.data.progressAdded).toBe(1);
		}
	});

	it("deve falhar advanceModuleObra se modulo ou persistencia falharem", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const result = await service.advanceModuleObra(
			"modulo_inexistente",
			2,
			8,
			15,
		);
		expect(result.success).toBe(false);

		// Vamos simular falha no save do repository
		const originalSaveModule = repository.saveModule.bind(repository);
		repository.saveModule = async () =>
			fail({
				code: "BASTION_REPOSITORY_WRITE_FAILED",
				message: "Erro simulado",
			});

		const foundResult = await service.foundBastion("Guarida", "taverna_guilda");
		const bId = foundResult.success ? foundResult.data.id : "";

		// Restauramos saveModule para conseguir criar o modulo
		repository.saveModule = originalSaveModule;
		await service.startModule(bId, "horta_alquimia", 1);
		const modules = await repository.findModulesByBastionId(bId);
		const mId = modules.success && modules.data[0] ? modules.data[0].id : "";

		// Agora que o modulo existe, forçamos a falha no save
		repository.saveModule = async () =>
			fail({
				code: "BASTION_REPOSITORY_WRITE_FAILED",
				message: "Erro simulado",
			});
		const failSave = await service.advanceModuleObra(mId, 3, 13, 15);
		expect(failSave.success).toBe(false);
	});

	it("deve retornar erro em calculateCurrentMaintenance e processRecessEnd se bastiao ou modulos nao forem encontrados", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const maintErr1 = await service.calculateCurrentMaintenance("inexistente");
		expect(maintErr1.success).toBe(false);

		const recessErr1 = await service.processRecessEnd("inexistente");
		expect(recessErr1.success).toBe(false);

		// Simular falhas de consulta de modulos
		const foundResult = await service.foundBastion("Guarida", "taverna_guilda");
		const bId = foundResult.success ? foundResult.data.id : "";

		const originalFindModules =
			repository.findModulesByBastionId.bind(repository);
		repository.findModulesByBastionId = async () =>
			fail({ code: "BASTION_REPOSITORY_READ_FAILED", message: "Erro" });

		const maintErr2 = await service.calculateCurrentMaintenance(bId);
		expect(maintErr2.success).toBe(false);

		const recessErr2 = await service.processRecessEnd(bId);
		expect(recessErr2.success).toBe(false);

		// Restaurar original
		repository.findModulesByBastionId = originalFindModules;

		// Simular falha de save no processRecessEnd
		repository.save = async () =>
			fail({ code: "BASTION_REPOSITORY_WRITE_FAILED", message: "Erro" });
		const recessErr3 = await service.processRecessEnd(bId);
		expect(recessErr3.success).toBe(false);
	});

	it("deve exercitar e validar todos os decoradores concretos individualmente e em composicao (Cebola)", async () => {
		const bastion: BastionRecord = {
			id: "b-id",
			name: "Bastiao Cebola",
			chassisId: "fortaleza_pedra",
			tier: 1,
			structure: 3,
			vigilance: 2,
			logistics: 2,
			integrityCurrent: 30,
			threatCurrent: 0,
			vaultGold: 1000,
			createdAt: "",
			updatedAt: "",
		};

		// 1 modulo de cada tipo ativo/completo
		const modules = [
			{
				id: "1",
				bastionId: "b-id",
				moduleId: "cofre_reforcado",
				tier: 1,
				progressCurrent: 10,
				progressMax: 10,
				isBroken: false,
				createdAt: "",
				updatedAt: "",
			},
			{
				id: "2",
				bastionId: "b-id",
				moduleId: "posto_vigia",
				tier: 1,
				progressCurrent: 10,
				progressMax: 10,
				isBroken: false,
				createdAt: "",
				updatedAt: "",
			},
			{
				id: "3",
				bastionId: "b-id",
				moduleId: "muralha_madeira",
				tier: 1,
				progressCurrent: 10,
				progressMax: 10,
				isBroken: false,
				createdAt: "",
				updatedAt: "",
			},
			{
				id: "4",
				bastionId: "b-id",
				moduleId: "muralha_pedra",
				tier: 1,
				progressCurrent: 10,
				progressMax: 10,
				isBroken: false,
				createdAt: "",
				updatedAt: "",
			},
			// modulo inativo (obra incompleta) para testar filtro
			{
				id: "5",
				bastionId: "b-id",
				moduleId: "posto_vigia",
				tier: 1,
				progressCurrent: 5,
				progressMax: 10,
				isBroken: false,
				createdAt: "",
				updatedAt: "",
			},
			// modulo quebrado para testar filtro
			{
				id: "6",
				bastionId: "b-id",
				moduleId: "muralha_madeira",
				tier: 1,
				progressCurrent: 10,
				progressMax: 10,
				isBroken: true,
				createdAt: "",
				updatedAt: "",
			},
		];

		const baseStats = new BaseBastionStats(bastion, modules);

		// BaseBastionStats:
		// getMaintenanceCost() -> tier(1)*100 + activeModulesCount(4)*50 = 300 PO. (m5 incompleto e m6 quebrado nao contam)
		// getVaultCapacity() -> vigilance(2)*1000 = 2000
		// getStructure() -> 3
		// getVigilance() -> 2
		// getLogistics() -> 2
		expect(baseStats.getMaintenanceCost()).toBe(300);
		expect(baseStats.getVaultCapacity()).toBe(2000);
		expect(baseStats.getStructure()).toBe(3);
		expect(baseStats.getVigilance()).toBe(2);
		expect(baseStats.getLogistics()).toBe(2);

		// 1. LogisticsDiscountDecorator: 2 Logistics -> 20% desconto -> 300 - 60 = 240
		const dec1 = new LogisticsDiscountDecorator(baseStats);
		expect(dec1.getMaintenanceCost()).toBe(240);

		// Se logistica fosse 10 (limite 90% desconto)
		const highLogBastion = { ...bastion, logistics: 10 };
		const highLogStats = new BaseBastionStats(highLogBastion, modules);
		const decHigh = new LogisticsDiscountDecorator(highLogStats);
		expect(decHigh.getMaintenanceCost()).toBe(30); // 300 - 90% (270) = 30 PO

		// 2. ReinforcedVaultDecorator: cofre_reforcado completo -> +1000 cap
		const dec2 = new ReinforcedVaultDecorator(baseStats, modules);
		expect(dec2.getVaultCapacity()).toBe(3000);

		// 3. WatchPostDecorator: posto_vigia completo -> +2 Vigilance
		const dec3 = new WatchPostDecorator(baseStats, modules);
		expect(dec3.getVigilance()).toBe(4);

		// 4. WoodenWallDecorator: muralha_madeira completo -> +2 structure
		const dec4 = new WoodenWallDecorator(baseStats, modules);
		expect(dec4.getStructure()).toBe(5);

		// 5. StoneWallDecorator: muralha_pedra completo -> +4 structure
		const dec5 = new StoneWallDecorator(baseStats, modules);
		expect(dec5.getStructure()).toBe(7);

		// Composicao Cebola completa
		const cebola = new LogisticsDiscountDecorator(
			new ReinforcedVaultDecorator(
				new WatchPostDecorator(
					new WoodenWallDecorator(
						new StoneWallDecorator(baseStats, modules),
						modules,
					),
					modules,
				),
				modules,
			),
		);

		// Resultados compostos:
		expect(cebola.getMaintenanceCost()).toBe(240); // Base maintenance 300 com 20% desc = 240
		expect(cebola.getVaultCapacity()).toBe(3000); // 2000 base + 1000 de 1 cofre_reforcado
		expect(cebola.getVigilance()).toBe(4); // 2 base + 2 de 1 posto_vigia
		expect(cebola.getStructure()).toBe(9); // 3 base + 4 pedra + 2 madeira = 9
	});

	it("deve limitar a integridade atual ao maxHp no processRecessEnd se a integridade exceder o limite", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const foundResult = await service.foundBastion(
			"Mina do Ouro",
			"mina_abandonada",
		);
		const b = foundResult.success ? foundResult.data : ({} as BastionRecord);

		// Mina abandonada: base structure (1) + chassi bonus (1) = 2. Tier 0.
		// maxHp = structure(2) * 10 + tier(0) * 20 = 20.
		// Forçamos a integridade atual para 50 (excedendo o maxHp de 20)
		b.integrityCurrent = 50;
		await repository.save(b);

		const res = await service.processRecessEnd(b.id);
		expect(res.success).toBe(true);

		const updated = await repository.findById(b.id);
		expect(updated.success).toBe(true);
		if (updated.success) {
			expect(updated.data.integrityCurrent).toBe(20); // limitado para maxHp = 20
		}
	});

	it("deve calcular a manutencao corrente com sucesso", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const foundResult = await service.foundBastion(
			"Guarida",
			"fortaleza_pedra",
		);
		expect(foundResult.success).toBe(true);
		const bId = foundResult.success ? foundResult.data.id : "";

		// Calcular manutenção padrão: tier 0 fortaleza_pedra -> tier(0)*100 = 0.
		// Sem módulos concluídos, deve ser 0.
		const m1 = await service.calculateCurrentMaintenance(bId);
		expect(m1.success).toBe(true);
		if (m1.success) {
			expect(m1.data).toBe(0);
		}

		// Iniciar e concluir um módulo. progressMax = 10.
		await service.startModule(bId, "muralha_pedra", 1);
		const modules = await repository.findModulesByBastionId(bId);
		expect(modules.success).toBe(true);
		const mId = modules.success && modules.data[0] ? modules.data[0].id : "";

		// Avançar progresso até completar (10 de progresso)
		await service.advanceModuleObra(mId, 3, 20, 15); // +3
		await service.advanceModuleObra(mId, 3, 20, 15); // +3
		await service.advanceModuleObra(mId, 3, 20, 15); // +3
		await service.advanceModuleObra(mId, 3, 13, 15); // +1 (total 10)

		// Agora temos 1 módulo concluído. Custo base: tier(0)*100 + 1*50 = 50 PO.
		// Mas temos LogisticsDiscountDecorator ativo por padrão no service.
		// O chassi fortaleza_pedra tem structure=3, vigilance=1, logistics=1.
		// logistics=1 gera 10% de desconto.
		// Custo final: 50 - 10% = 45 PO.
		const m2 = await service.calculateCurrentMaintenance(bId);
		expect(m2.success).toBe(true);
		if (m2.success) {
			expect(m2.data).toBe(45);
		}
	});

	it("deve acumular ameaca passiva se o cofre exceder o limite seguro no processRecessEnd", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const foundResult = await service.foundBastion(
			"Guarida Alta",
			"taverna_guilda",
		);
		expect(foundResult.success).toBe(true);
		const b = foundResult.success ? foundResult.data : ({} as BastionRecord);

		// taverna_guilda: vigilance = 3.
		// vault capacity = vigilance (3) * 1000 = 3000 PO.
		// Definimos vaultGold para 4500 PO (excesso de 1500 PO).
		// Excesso de 1500 / 500 = 3 pontos de ameaça passiva.
		b.vaultGold = 4500;
		b.threatCurrent = 2;
		await repository.save(b);

		const res = await service.processRecessEnd(b.id);
		expect(res.success).toBe(true);

		const updated = await repository.findById(b.id);
		expect(updated.success).toBe(true);
		if (updated.success) {
			expect(updated.data.threatCurrent).toBe(5); // 2 base + 3 de ameaça por excesso
		}
	});

	it("deve repelir o cerco frontal se a rolagem de estrutura vencer a CD da horda", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const bRes = await service.foundBastion("Guarida", "fortaleza_pedra");
		expect(bRes.success).toBe(true);
		const b = bRes.success ? bRes.data : ({} as BastionRecord);

		b.threatCurrent = 10;
		await repository.save(b);

		// Horda CD = 12. fortaleza_pedra tem structure = 3.
		// Rola d20 = 10. Total = 10 + 3 = 13 >= 12. Sucesso!
		const cercoRes = await service.resolveCercoFrontal(b.id, 12, 10);
		expect(cercoRes.success).toBe(true);
		if (cercoRes.success) {
			expect(cercoRes.data.status).toBe("repelled");
			expect(cercoRes.data.integrityLost).toBe(0);
			expect(cercoRes.data.brokenModuleIds.length).toBe(0);
		}

		const updated = await repository.findById(b.id);
		expect(updated.success).toBe(true);
		if (updated.success) {
			expect(updated.data.threatCurrent).toBe(0);
		}
	});

	it("deve sofrer invasao (breached) e dano no cerco se a rolagem falhar", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const bRes = await service.foundBastion("Guarida", "fortaleza_pedra");
		expect(bRes.success).toBe(true);
		const b = bRes.success ? bRes.data : ({} as BastionRecord);

		// Horda CD = 15. fortaleza_pedra tem structure = 3.
		// Rola d20 = 5. Total = 5 + 3 = 8 < 15. Falha!
		// Dano = (15 - 8) * 5 = 35.
		const cercoRes = await service.resolveCercoFrontal(b.id, 15, 5);
		expect(cercoRes.success).toBe(true);
		if (cercoRes.success) {
			expect(cercoRes.data.status).toBe("breached");
			expect(cercoRes.data.integrityLost).toBe(35);
		}
	});

	it("deve quebrar um modulo completo se integridade cair abaixo de 50% e falhar no teste de vigilancia", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const bRes = await service.foundBastion("Guarida", "fortaleza_pedra");
		expect(bRes.success).toBe(true);
		const b = bRes.success ? bRes.data : ({} as BastionRecord);

		// Cria e completa um modulo
		const startMod = await service.startModule(b.id, "posto_vigia", 1);
		expect(startMod.success).toBe(true);
		const modId = startMod.success ? startMod.data.id : "";
		await service.advanceModuleObra(modId, 3, 20, 15);
		await service.advanceModuleObra(modId, 3, 20, 15);
		await service.advanceModuleObra(modId, 3, 20, 15);
		await service.advanceModuleObra(modId, 3, 13, 15);

		// Reduz integridade para que fique abaixo de 50% de HP Max (HP Max = 3*10 = 30)
		// Horda CD = 20. Total = 1 + 3 = 4. Dano = 16 * 5 = 80.
		// Vigilância total = 1 + 3 (watchpost) = 4 < 12. Modulo deve quebrar!
		const cercoRes = await service.resolveCercoFrontal(b.id, 20, 1, 1);
		expect(cercoRes.success).toBe(true);
		if (cercoRes.success) {
			expect(cercoRes.data.status).toBe("breached");
			expect(cercoRes.data.brokenModuleIds.length).toBe(1);
			expect(cercoRes.data.brokenModuleIds[0]).toBe(modId);
		}

		const modCheck = await repository.findModuleById(modId);
		expect(modCheck.success).toBe(true);
		if (modCheck.success) {
			expect(modCheck.data.isBroken).toBe(true);
		}
	});

	it("deve disparar cerco frontal automaticamente no processRecessEnd se a ameaca atingir 10", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const bRes = await service.foundBastion("Guarida", "fortaleza_pedra");
		expect(bRes.success).toBe(true);
		const b = bRes.success ? bRes.data : ({} as BastionRecord);

		// Configura ouro no cofre para estourar o limite e atingir ameaca 10
		b.threatCurrent = 9;
		b.vaultGold = 5000; // capacidade = 1 * 1000 = 1000. Excesso = 4000. Ameaca ganha = 8.
		await repository.save(b);

		const recessRes = await service.processRecessEnd(b.id);
		expect(recessRes.success).toBe(true);
		if (recessRes.success) {
			expect(recessRes.data.cercoResult).toBeDefined();
			expect(["repelled", "breached"]).toContain(
				recessRes.data.cercoResult?.status,
			);
		}
	});

	it("deve validar a evolucao de modulos com trofeus e ouro", async () => {
		const repository = new InMemoryBastionRepository();
		const service = new BastionService(repository);

		const bRes = await service.foundBastion("Guarida", "fortaleza_pedra");
		expect(bRes.success).toBe(true);
		const b = bRes.success ? bRes.data : ({} as BastionRecord);

		const startMod = await service.startModule(b.id, "horta_alquimia", 1);
		expect(startMod.success).toBe(true);
		const modId = startMod.success ? startMod.data.id : "";

		// 1. Falha por falta de ouro
		const upFail1 = await service.upgradeModuleWithTrophy(b.id, modId, 500);
		expect(upFail1.success).toBe(false);

		// Adiciona ouro ao cofre
		b.vaultGold = 1000;
		await repository.save(b);

		// 2. Up para Tier 2 (Não exige troféu)
		const upTier2 = await service.upgradeModuleWithTrophy(b.id, modId, 200);
		expect(upTier2.success).toBe(true);
		if (upTier2.success) {
			expect(upTier2.data.tier).toBe(2);
			expect(upTier2.data.progressMax).toBe(20);
		}

		// 3. Falha no Up para Tier 3 por falta de troféu
		const upFail2 = await service.upgradeModuleWithTrophy(b.id, modId, 300);
		expect(upFail2.success).toBe(false);

		// 4. Up para Tier 3 com troféu com sucesso
		const upTier3 = await service.upgradeModuleWithTrophy(
			b.id,
			modId,
			300,
			"trofeu_wyrm_id",
		);
		expect(upTier3.success).toBe(true);
		if (upTier3.success) {
			expect(upTier3.data.tier).toBe(3);
			expect(upTier3.data.progressMax).toBe(30);
		}
	});
});
