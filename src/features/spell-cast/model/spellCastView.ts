import type { SpellRecord } from "$lib/entities/spell";
import type {
	SpellCastBuildResult,
	SpellCastFailure,
} from "./spellCastBuilderTypes";

export interface SpellCastOptionView {
	readonly id: string;
	readonly label: string;
}

export interface SpellCastPanelView {
	readonly canPrepare: boolean;
	readonly componentsLabel: string;
	readonly costLabel: string;
	readonly errorMessage: string | null;
	readonly initialInstruction: string;
	readonly resultDescription: string | null;
	readonly resultTitle: string | null;
	readonly resolutionLabel: string;
	readonly selectedSpellId: string;
	readonly selectedSpellLabel: string;
	readonly sourceLabel: string;
	readonly spellOptions: readonly SpellCastOptionView[];
	readonly summary: string;
	readonly targetLabel: string;
}

interface SpellCastPanelViewInput {
	readonly buildResult: SpellCastBuildResult | null;
	readonly errorMessage: string | null;
	readonly selectedSpellId: string;
	readonly spells: readonly SpellRecord[];
	readonly targetLabel: string;
}

export function createSpellCastPanelView(
	input: SpellCastPanelViewInput,
): SpellCastPanelView {
	const selectedSpell =
		input.spells.find((spell) => spell.id === input.selectedSpellId) ??
		input.spells[0] ??
		null;
	const spellOptions = input.spells.map((spell) => ({
		id: spell.id,
		label: spell.label,
	}));

	return {
		canPrepare: selectedSpell !== null,
		componentsLabel: selectedSpell
			? `Componentes: ${selectedSpell.components.join(", ")}`
			: "Componentes: nenhum",
		costLabel: selectedSpell ? `${selectedSpell.etherCost} EE` : "0 EE",
		errorMessage: input.errorMessage,
		initialInstruction: "Escolha uma magia e prepare a conjuração.",
		resultDescription:
			input.buildResult && selectedSpell
				? `Comando ${input.buildResult.command.type} pronto para ${selectedSpell.label} contra ${input.targetLabel}. Custo total: ${input.buildResult.audit.totalEtherCost} EE.`
				: null,
		resultTitle: input.buildResult ? "Conjuração preparada" : null,
		resolutionLabel: selectedSpell
			? mapSpellResolutionLabel(selectedSpell)
			: "Sem magia selecionada",
		selectedSpellId: selectedSpell?.id ?? "",
		selectedSpellLabel: selectedSpell?.label ?? "Nenhuma magia disponível",
		sourceLabel: selectedSpell
			? `Fonte: ${selectedSpell.sourceFile}`
			: "Fonte: -",
		spellOptions,
		summary: selectedSpell?.summary ?? "Nenhuma magia disponível.",
		targetLabel: `Alvo: ${input.targetLabel}`,
	};
}

export function mapSpellCastFailureToMessage(
	failure: SpellCastFailure,
): string {
	switch (failure.code) {
		case "INVALID_SPELL_CAST_INPUT":
			return "Confira conjurador, alvo e dados da conjuração antes de tentar novamente.";
		case "SPELL_LOOKUP_FAILED":
			return "A magia escolhida não foi encontrada no catálogo atual.";
		case "UNSUPPORTED_METAMAGIC":
			return "Metamagia ainda não está disponível nesta versão.";
		case "INSUFFICIENT_ETHER":
			return `EE insuficiente: você tem ${formatFailureNumber(failure.details?.availableEther)} EE e precisa de ${formatFailureNumber(failure.details?.requiredEther)} EE.`;
		case "INVALID_SPELL_COMMAND":
			return "Não foi possível preparar o comando técnico da conjuração.";
	}
}

function formatFailureNumber(value: unknown): string {
	return typeof value === "number" ? String(value) : "?";
}

function mapSpellResolutionLabel(spell: SpellRecord): string {
	const resolutionParts = [
		spell.requiresAttackRoll ? "Ataque mágico" : null,
		spell.requiresSavingThrow ? "Teste de resistência" : null,
	].filter((part): part is string => part !== null);

	return resolutionParts.length > 0
		? resolutionParts.join(" e ")
		: "Sem rolagem de ataque ou resistência";
}
