import { describe, expect, it } from "vitest";
import { EncounterGeneratorService } from "../domain/EncounterGeneratorService";

describe("EncounterGeneratorService", () => {
	const service = new EncounterGeneratorService();

	it("retorna falha se o regionTier for menor ou igual a 0", () => {
		const res = service.generateEncounter({
			q: 1,
			r: 1,
			regionTier: 0,
			averagePartyLevel: 1,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("INVALID_REGION_TIER");
		}
	});

	it("retorna falha se o averagePartyLevel for menor ou igual a 0", () => {
		const res = service.generateEncounter({
			q: 1,
			r: 1,
			regionTier: 1,
			averagePartyLevel: -5,
		});
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("INVALID_PARTY_LEVEL");
		}
	});

	it("gera encontros determinísticos e iguais para as mesmas coordenadas", () => {
		const res1 = service.generateEncounter({
			q: 2,
			r: 3,
			regionTier: 1,
			averagePartyLevel: 2,
		});
		const res2 = service.generateEncounter({
			q: 2,
			r: 3,
			regionTier: 1,
			averagePartyLevel: 2,
		});

		expect(res1.success).toBe(true);
		expect(res2.success).toBe(true);
		if (res1.success && res2.success) {
			expect(res1.data.encounterName).toBe(res2.data.encounterName);
			expect(res1.data.monsters).toEqual(res2.data.monsters);
		}
	});

	it("ajusta atributos dos monstros de acordo com o nível da equipe", () => {
		// Equipe nível 1 (mesmo nível do monstro base)
		const resLow = service.generateEncounter({
			q: 0,
			r: 0,
			regionTier: 1,
			averagePartyLevel: 1,
		});

		// Equipe nível 10 (muito mais forte que o monstro base)
		const resHigh = service.generateEncounter({
			q: 0,
			r: 0,
			regionTier: 1,
			averagePartyLevel: 10,
		});

		expect(resLow.success).toBe(true);
		expect(resHigh.success).toBe(true);

		if (resLow.success && resHigh.success) {
			const mLow = resLow.data.monsters[0]!;
			const mHigh = resHigh.data.monsters[0]!;

			// Os monstros da equipe nível 10 devem ter muito mais HP, bônus de ataque e dano
			expect(mHigh.maxHitPoints).toBeGreaterThan(mLow.maxHitPoints);
			expect(mHigh.attackBonus).toBeGreaterThan(mLow.attackBonus);
			expect(mHigh.damageBonus).toBeGreaterThan(mLow.damageBonus);
			expect(mHigh.xpValue).toBeGreaterThan(mLow.xpValue);
		}
	});

	it("limita o regionTier de forma robusta e segura", () => {
		// Tier muito alto
		const resHigh = service.generateEncounter({
			q: 1,
			r: 1,
			regionTier: 99,
			averagePartyLevel: 1,
		});
		expect(resHigh.success).toBe(true);
		if (resHigh.success) {
			// Deve cair na tabela do Tier 5
			expect([
				"Avatares de Deuses Mortos",
				"Devorador de Mundos Menor",
			]).toContain(resHigh.data.encounterName);
		}
	});
});
