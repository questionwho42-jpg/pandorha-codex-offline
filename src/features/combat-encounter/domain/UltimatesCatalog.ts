export interface UltimateAbility {
	readonly id: string;
	readonly name: string;
	readonly classId: string;
	readonly statusEffectType: string;
	readonly description: string;
	readonly effects: readonly string[];
}

export const ULTIMATES_CATALOG: readonly UltimateAbility[] = [
	{
		id: "avatar_guerra",
		name: "Avatar da Guerra",
		classId: "vanguarda",
		statusEffectType: "avatar_guerra",
		description:
			"Vanguarda cresce para tamanho Grande, recebe +20 HP temporários, +2 de bônus de dano com armas e atinge múltiplos inimigos em arco.",
		effects: [
			"Tamanho: Grande",
			"HP Máximo: +20",
			"Bônus de Dano de Arma: +2",
			"Ataques atingem em arco",
		],
	},
	{
		id: "surto_tempo",
		name: "Surto de Tempo",
		classId: "weaver",
		statusEffectType: "surto_tempo",
		description:
			"Tecelão ganha +1 Ação adicional por turno (apenas para Ataque/Truque) e +2 de Resistência Física.",
		effects: [
			"Ação Adicional por Turno (Ataque/Truque)",
			"Resistência Física: +2",
		],
	},
	{
		id: "cacada_selvagem",
		name: "Caçada Selvagem",
		classId: "hunter",
		statusEffectType: "cacada_selvagem",
		description:
			"Caçador ganha +5 de bônus em jogadas de ataque e ignora terreno difícil por todo o combate.",
		effects: ["Bônus de Ataque: +5", "Ignora terreno difícil"],
	},
	{
		id: "rede_intrigas",
		name: "Rede de Intrigas",
		classId: "emissary",
		statusEffectType: "rede_intrigas",
		description:
			"Emissário declara uma preparação retrospectiva plausível (e.g. contatos na área, rota de fuga ou favorecimento social).",
		effects: ["Preparação Retrospectiva Plausível"],
	},
];

export function findUltimateByClass(
	classId: string,
): UltimateAbility | undefined {
	const normalized = classId.toLowerCase().trim();
	return ULTIMATES_CATALOG.find(
		(u) =>
			u.classId === normalized ||
			(u.classId === "vanguarda" && normalized === "vanguard") ||
			(u.classId === "vanguarda" && normalized === "vanguarda"),
	);
}
