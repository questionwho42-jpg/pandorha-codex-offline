import type { BargainOffer, SocialAttitude } from "../model-api";

/**
 * Retorna o modificador de preço comercial baseado na atitude do alvo.
 */
export function calculateMarketModifier(attitude: SocialAttitude): number {
	switch (attitude) {
		case "friendly":
			return 0.9; // 10% de desconto
		case "neutral":
		case "skeptical":
			return 1.0; // Preço base
		case "hostile":
			return 1.2; // 20% mais caro
		case "declared_enemy":
			return 2.0; // Dobro do preço
	}
}

/**
 * Converte qualquer oferta (ouro, item, favor) no seu valor equivalente em Ouro (narrativo).
 */
export function evaluateOfferValue(offer: BargainOffer): number {
	if (offer.type === "favor") {
		// Regras de Negociação: 1 Favor Menor = 100 Ouro, 1 Favor Maior = 500 Ouro
		return offer.favorType === "major" ? 500 : 100;
	}
	return offer.valueInGold;
}

/**
 * Calcula o valor total de múltiplas ofertas na mesa de negociação.
 */
export function calculateTotalOfferValue(offers: BargainOffer[]): number {
	return offers.reduce((total, offer) => total + evaluateOfferValue(offer), 0);
}

/**
 * Traduz o valor em ouro investido em um bônus direto na Margem de Sucesso.
 * (Ex: a cada 100 de ouro oferecidos em suborno/barganha, ganha +1 de margem).
 */
export function calculateOfferMarginBonus(offers: BargainOffer[]): number {
	const totalValue = calculateTotalOfferValue(offers);
	return Math.floor(totalValue / 100);
}
