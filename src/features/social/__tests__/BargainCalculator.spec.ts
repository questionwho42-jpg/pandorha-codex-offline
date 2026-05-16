import { describe, expect, it } from "vitest";
import {
	calculateMarketModifier,
	calculateOfferMarginBonus,
	calculateTotalOfferValue,
	evaluateOfferValue,
} from "../domain/BargainCalculator";
import type { BargainOffer } from "../model-api";

describe("BargainCalculator", () => {
	describe("calculateMarketModifier", () => {
		it("should give 10% discount to friendly attitude", () => {
			expect(calculateMarketModifier("friendly")).toBe(0.9);
		});

		it("should give standard price to neutral or skeptical", () => {
			expect(calculateMarketModifier("neutral")).toBe(1.0);
			expect(calculateMarketModifier("skeptical")).toBe(1.0);
		});

		it("should give 20% surcharge to hostile", () => {
			expect(calculateMarketModifier("hostile")).toBe(1.2);
		});

		it("should double the price for declared_enemy", () => {
			expect(calculateMarketModifier("declared_enemy")).toBe(2.0);
		});
	});

	describe("evaluateOfferValue", () => {
		it("should return the gold value for gold, item, and information", () => {
			const offerGold: BargainOffer = {
				id: "1",
				type: "gold",
				valueInGold: 150,
				description: "Bolsa de ouro",
			};
			expect(evaluateOfferValue(offerGold)).toBe(150);
		});

		it("should evaluate a minor favor at 100 gold", () => {
			const offerFavor: BargainOffer = {
				id: "2",
				type: "favor",
				valueInGold: 0,
				favorType: "minor",
				description: "Devo uma",
			};
			expect(evaluateOfferValue(offerFavor)).toBe(100);
		});

		it("should evaluate a major favor at 500 gold", () => {
			const offerFavor: BargainOffer = {
				id: "3",
				type: "favor",
				valueInGold: 0,
				favorType: "major",
				description: "Dívida de sangue",
			};
			expect(evaluateOfferValue(offerFavor)).toBe(500);
		});
	});

	describe("calculateTotalOfferValue", () => {
		it("should sum multiple offers correctly", () => {
			const offers: BargainOffer[] = [
				{ id: "1", type: "gold", valueInGold: 50, description: "Moedas" },
				{
					id: "2",
					type: "favor",
					valueInGold: 0,
					favorType: "minor",
					description: "Favor",
				},
			];
			expect(calculateTotalOfferValue(offers)).toBe(150);
		});
	});

	describe("calculateOfferMarginBonus", () => {
		it("should grant +1 margin for every 100 gold in value", () => {
			const offers: BargainOffer[] = [
				{ id: "1", type: "gold", valueInGold: 250, description: "Joias" },
			];
			expect(calculateOfferMarginBonus(offers)).toBe(2);
		});
	});
});
