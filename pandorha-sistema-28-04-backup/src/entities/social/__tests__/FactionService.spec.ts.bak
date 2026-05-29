import { describe, expect, it } from "vitest";
import { FactionService } from "../domain/FactionService";
import { InMemoryFactionRepository } from "../infrastructure/InMemoryFactionRepository";

const TEST_TIMESTAMP = "2026-05-23T14:30:00.000Z";

describe("FactionService", () => {
	it("inicializa o ledger social da campanha com valores iniciais padrão", async () => {
		const repository = new InMemoryFactionRepository();
		const service = new FactionService(repository);

		const res = await service.initializeSocialLedger(
			"campaign_default",
			TEST_TIMESTAMP,
		);
		expect(res.success).toBe(true);
		if (res.success) {
			const ledger = res.data;
			expect(ledger.id).toBe("campaign_default");
			expect(ledger.fameXp).toBe(0);
			expect(ledger.fameLevel).toBe(0);
			expect(ledger.favorPoints).toBe(0);
		}
	});

	it("recalcula o nível de fama ao acumular Fama XP nos patamares corretos", async () => {
		const repository = new InMemoryFactionRepository();
		const service = new FactionService(repository);

		await service.initializeSocialLedger("campaign_default", TEST_TIMESTAMP);

		// Ganha 50 XP (Nível 0)
		const res0 = await service.addFameXp(
			"campaign_default",
			50,
			TEST_TIMESTAMP,
		);
		expect(res0.success).toBe(true);
		if (res0.success) {
			expect(res0.data.fameXp).toBe(50);
			expect(res0.data.fameLevel).toBe(0);
		}

		// Ganha mais 80 XP (Total 130 XP => Nível 1)
		const res1 = await service.addFameXp(
			"campaign_default",
			80,
			TEST_TIMESTAMP,
		);
		expect(res1.success).toBe(true);
		if (res1.success) {
			expect(res1.data.fameXp).toBe(130);
			expect(res1.data.fameLevel).toBe(1);
		}

		// Ganha mais 150 XP (Total 280 XP => Nível 2)
		const res2 = await service.addFameXp(
			"campaign_default",
			150,
			TEST_TIMESTAMP,
		);
		expect(res2.success).toBe(true);
		if (res2.success) {
			expect(res2.data.fameXp).toBe(280);
			expect(res2.data.fameLevel).toBe(2);
		}

		// Ganha mais 300 XP (Total 580 XP => Nível 3)
		const res3 = await service.addFameXp(
			"campaign_default",
			300,
			TEST_TIMESTAMP,
		);
		expect(res3.success).toBe(true);
		if (res3.success) {
			expect(res3.data.fameXp).toBe(580);
			expect(res3.data.fameLevel).toBe(3);
		}

		// Ganha mais 500 XP (Total 1080 XP => Nível 4)
		const res4 = await service.addFameXp(
			"campaign_default",
			500,
			TEST_TIMESTAMP,
		);
		expect(res4.success).toBe(true);
		if (res4.success) {
			expect(res4.data.fameXp).toBe(1080);
			expect(res4.data.fameLevel).toBe(4);
		}
	});

	it("ajusta e recupera a reputação do herói com uma facção", async () => {
		const repository = new InMemoryFactionRepository();
		const service = new FactionService(repository);

		const res = await service.adjustReputation(
			"hero_val",
			"faction_rats",
			15,
			TEST_TIMESTAMP,
		);
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.characterId).toBe("hero_val");
			expect(res.data.factionId).toBe("faction_rats");
			expect(res.data.value).toBe(15);
		}

		// Ajusta novamente (adiciona +10 => 25)
		const res2 = await service.adjustReputation(
			"hero_val",
			"faction_rats",
			10,
			TEST_TIMESTAMP,
		);
		expect(res2.success).toBe(true);
		if (res2.success) {
			expect(res2.data.value).toBe(25);
		}
	});

	it("registra dívidas de sangue e calcula bloqueio de descanso por estouro de limite", async () => {
		const repository = new InMemoryFactionRepository();
		const service = new FactionService(repository);

		// Registra reputação (Nível de Fama do herói com a facção)
		// Fama Nível 1: Valor de 20 (Simulando conhecido local)
		await service.adjustReputation(
			"hero_val",
			"faction_rats",
			1,
			TEST_TIMESTAMP,
		);

		// Dívida de Sangue de valor 2 (limite seguro = Nível 1 * 3 = 3)
		const debtRes = await service.addBloodDebt(
			"hero_val",
			"Ratos do Esgoto",
			2,
			TEST_TIMESTAMP,
		);
		expect(debtRes.success).toBe(true);
		if (debtRes.success) {
			expect(debtRes.data.characterId).toBe("hero_val");
			expect(debtRes.data.debtValue).toBe(2);
			expect(debtRes.data.isPaid).toBe(false);
		}

		// Checa se o descanso está bloqueado: Dívida (2) <= Limite (3) => Não bloqueado
		const check1 = await service.checkRestBlock("hero_val", "faction_rats");
		expect(check1.success).toBe(true);
		if (check1.success) {
			expect(check1.data).toBe(false);
		}

		// Adiciona mais 2 de dívida (Total 4) => Ultrapassa limite de 3
		await service.addBloodDebt(
			"hero_val",
			"Ratos do Esgoto",
			2,
			TEST_TIMESTAMP,
		);

		// Checa novamente: Dívida (4) > Limite (3) => BLOQUEADO!
		const check2 = await service.checkRestBlock("hero_val", "faction_rats");
		expect(check2.success).toBe(true);
		if (check2.success) {
			expect(check2.data).toBe(true);
		}
	});

	it("abate pontos de dívida de sangue proporcionalmente pagando ouro", async () => {
		const repository = new InMemoryFactionRepository();
		const service = new FactionService(repository);

		const debtRes = await service.addBloodDebt(
			"hero_val",
			"Ratos do Esgoto",
			3,
			TEST_TIMESTAMP,
		);
		const debtId = debtRes.success ? debtRes.data.id : "";

		// Tentar pagar com ouro insuficiente (ex: 200 PO para quitar 1 ponto, exige 500)
		const payFail = await service.payBloodDebt(debtId, 200, TEST_TIMESTAMP);
		expect(payFail.success).toBe(false);
		if (!payFail.success) {
			expect(payFail.error.code).toBe("GOLD_INSUFFICIENT");
		}

		// Pagar 1000 PO para quitar 2 pontos de dívida
		const paySuccess = await service.payBloodDebt(debtId, 1000, TEST_TIMESTAMP);
		expect(paySuccess.success).toBe(true);
		if (paySuccess.success) {
			expect(paySuccess.data.debtValue).toBe(1); // 3 - 2 = 1
			expect(paySuccess.data.isPaid).toBe(false);
		}

		// Pagar mais 500 PO para quitar o último ponto restante (Total quitado)
		const payFinal = await service.payBloodDebt(debtId, 500, TEST_TIMESTAMP);
		expect(payFinal.success).toBe(true);
		if (payFinal.success) {
			expect(payFinal.data.debtValue).toBe(0);
			expect(payFinal.data.isPaid).toBe(true);
		}
	});
});
