import { describe, expect, it } from "vitest";
import { PatronageService } from "../domain/PatronageService";
import { InMemoryFactionRepository } from "../infrastructure/InMemoryFactionRepository";

describe("PatronageService", () => {
	it("deve criar ou recuperar um registro de patrocínio com valores padrão", async () => {
		const repository = new InMemoryFactionRepository();
		const service = new PatronageService(repository);

		const res = await service.getOrCreatePatronage("faction_a");
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.factionId).toBe("faction_a");
			expect(res.data.famaLevel).toBe(1);
			expect(res.data.bloodDebt).toBe(0);
			expect(res.data.isAlmaPledged).toBe(false);
		}

		// Garante que a segunda chamada retorna o mesmo patrocínio
		const res2 = await service.getOrCreatePatronage("faction_a");
		expect(res2.success).toBe(true);
		if (res2.success && res.success) {
			expect(res2.data.id).toBe(res.data.id);
		}
	});

	it("deve acumular dívida e disparar Ultimato/Favor Impossível ao estourar o limite de Fama x 3", async () => {
		const repository = new InMemoryFactionRepository();
		const service = new PatronageService(repository);

		// Limite inicial: famaLevel 1 * 3 = 3.
		// Solicita favor de custo 2 -> Dívida = 2 <= 3. Não dispara.
		const res1 = await service.requestFavor("faction_a", 2);
		expect(res1.success).toBe(true);
		if (res1.success) {
			expect(res1.data.patronage.bloodDebt).toBe(2);
			expect(res1.data.favorTriggered).toBe(false);
			expect(res1.data.patronage.ultimatumWeeksRemaining).toBeNull();
		}

		// Solicita mais 2 (Total = 4 > 3) -> Dispara Ultimato de 3 semanas!
		const res2 = await service.requestFavor("faction_a", 2);
		expect(res2.success).toBe(true);
		if (res2.success) {
			expect(res2.data.patronage.bloodDebt).toBe(4);
			expect(res2.data.favorTriggered).toBe(true);
			expect(res2.data.patronage.ultimatumWeeksRemaining).toBe(3);
		}
	});

	it("deve decrementar o Ultimato a cada semana e penhorar almas ao zerar o tempo", async () => {
		const repository = new InMemoryFactionRepository();
		const service = new PatronageService(repository);

		await service.requestFavor("faction_a", 5); // Dispara Ultimato: 3 semanas

		// Semana 1 -> 2 semanas restantes
		const w1 = await service.processWeeklyPatronageUpdate();
		expect(w1.success).toBe(true);

		const pat1 = await service.getOrCreatePatronage("faction_a");
		expect(pat1.success).toBe(true);
		if (pat1.success) {
			expect(pat1.data.ultimatumWeeksRemaining).toBe(2);
			expect(pat1.data.isAlmaPledged).toBe(false);
		}

		// Semana 2 -> 1 semana restante
		await service.processWeeklyPatronageUpdate();

		// Semana 3 -> 0 semanas restantes e almas penhoradas!
		await service.processWeeklyPatronageUpdate();

		const pat3 = await service.getOrCreatePatronage("faction_a");
		expect(pat3.success).toBe(true);
		if (pat3.success) {
			expect(pat3.data.ultimatumWeeksRemaining).toBe(0);
			expect(pat3.data.isAlmaPledged).toBe(true);
		}
	});

	it("deve bloquear ressurreição se as almas estiverem penhoradas e a dívida estiver ativa", async () => {
		const repository = new InMemoryFactionRepository();
		const service = new PatronageService(repository);

		// Inicialmente ressurreição liberada
		const check1 = await service.isResurrectionBlocked();
		expect(check1.success).toBe(true);
		if (check1.success) {
			expect(check1.data).toBe(false);
		}

		// Provoca o Ultimato e processa 3 semanas para penhorar almas
		await service.requestFavor("faction_a", 5);
		await service.processWeeklyPatronageUpdate(); // 2
		await service.processWeeklyPatronageUpdate(); // 1
		await service.processWeeklyPatronageUpdate(); // 0 -> Penhor de Alma!

		// Bloqueia ressurreição por dívida ativa (>0) com almas penhoradas
		const check2 = await service.isResurrectionBlocked();
		expect(check2.success).toBe(true);
		if (check2.success) {
			expect(check2.data).toBe(true);
		}

		// Pagando a dívida totalmente, desbloqueia e limpa o penhor
		const payRes = await service.payFactionDebt("faction_a", 5);
		expect(payRes.success).toBe(true);
		if (payRes.success) {
			expect(payRes.data.bloodDebt).toBe(0);
			expect(payRes.data.isAlmaPledged).toBe(false);
			expect(payRes.data.ultimatumWeeksRemaining).toBeNull();
		}

		const check3 = await service.isResurrectionBlocked();
		expect(check3.success).toBe(true);
		if (check3.success) {
			expect(check3.data).toBe(false);
		}
	});

	it("deve assinar um patrocínio e aplicar bônus e mutações de relógio de ameaça rivais", async () => {
		const repository = new InMemoryFactionRepository();
		const service = new PatronageService(repository);

		// Pacto com Guardiões do Ether (fac-ether)
		const res1 = await service.pledgePatronage("fac-ether", "economic");
		expect(res1.success).toBe(true);
		if (res1.success) {
			expect(res1.data.patronage.activeBonus).toBe("economic");
			const mutations = res1.data.clockMutations;
			expect(mutations).toHaveLength(1);
			if (mutations[0]) {
				expect(mutations[0].name).toBe("Ameaça: Sectários da Ruína");
				expect(mutations[0].segments).toBe(2);
			}
		}

		// Pacto com Sindicato de Bronze (fac-bronze)
		const res2 = await service.pledgePatronage("fac-bronze", "military");
		expect(res2.success).toBe(true);
		if (res2.success) {
			expect(res2.data.patronage.activeBonus).toBe("military");
			expect(res2.data.clockMutations).toHaveLength(2);
			expect(res2.data.clockMutations.map((m) => m.name)).toContain(
				"Ameaça: Guardiões do Ether",
			);
			expect(res2.data.clockMutations.map((m) => m.name)).toContain(
				"Ameaça: Sectários da Ruína",
			);
		}
	});

	it("deve permitir revogar um patrocínio contratado", async () => {
		const repository = new InMemoryFactionRepository();
		const service = new PatronageService(repository);

		// Pactua
		await service.pledgePatronage("fac-ether", "economic");

		// Revoga
		const revokeRes = await service.revokePatronage("fac-ether");
		expect(revokeRes.success).toBe(true);
		if (revokeRes.success) {
			expect(revokeRes.data.activeBonus).toBeNull();
		}
	});
});
