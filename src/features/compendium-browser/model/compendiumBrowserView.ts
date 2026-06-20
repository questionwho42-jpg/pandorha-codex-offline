import type {
	CompendiumCategory,
	CompendiumEntry,
	CompendiumFailure,
} from "$lib/entities/compendium";

export type CompendiumBrowserOptions = Readonly<{
	query: string;
	selectedEntryId: string | null;
}>;

export type CompendiumBrowserEntryItem = Readonly<{
	categoryLabel: string;
	id: string;
	isSelected: boolean;
	sourceFile: string;
	summary: string;
	title: string;
}>;

export type CompendiumBrowserEmptyState = Readonly<{
	description: string;
	title: string;
}>;

export type CompendiumBrowserView = Readonly<{
	countLabel: string;
	detailInstruction?: string;
	emptyState?: CompendiumBrowserEmptyState;
	items: readonly CompendiumBrowserEntryItem[];
	selectedEntry?: CompendiumBrowserEntryItem;
}>;

export function createCompendiumBrowserView(
	entries: readonly CompendiumEntry[],
	options: CompendiumBrowserOptions,
): CompendiumBrowserView {
	const items = entries.map((entry) =>
		toCompendiumBrowserEntryItem(entry, options.selectedEntryId),
	);
	const selectedEntry = items.find((item) => item.isSelected);

	if (items.length === 0) {
		return {
			countLabel: "Nenhum resultado",
			emptyState: {
				title: "Nenhuma entrada encontrada",
				description:
					"Tente buscar por criação de ficha, ancestralidade, classe ou antecedente.",
			},
			items,
		};
	}

	if (selectedEntry) {
		return {
			countLabel: `${items.length} ${items.length === 1 ? "resultado" : "resultados"}`,
			items,
			selectedEntry,
		};
	}

	return {
		countLabel: `${items.length} ${items.length === 1 ? "resultado" : "resultados"}`,
		detailInstruction:
			"Selecione uma entrada para ler o resumo e a fonte da regra.",
		items,
	};
}

export function mapCompendiumCategoryLabel(
	category: CompendiumCategory,
): string {
	switch (category) {
		case "ancestry":
			return "Ancestralidade";
		case "background":
			return "Antecedente";
		case "character-creation":
			return "Criação de ficha";
		case "class":
			return "Classe";
		case "system-combat":
			return "Sistema: Combate";
		case "system-magic":
			return "Sistema: Magia";
		case "system-survival":
			return "Sistema: Sobrevivência";
	}
}

export function mapCompendiumFailure(failure: CompendiumFailure): string {
	switch (failure.code) {
		case "INVALID_COMPENDIUM_SEARCH_INPUT":
			return "A busca do compêndio está inválida. Revise o termo pesquisado.";
		case "COMPENDIUM_REPOSITORY_READ_FAILED":
			return "Não foi possível consultar o compêndio nesta sessão.";
		case "CORRUPTED_COMPENDIUM_ENTRY":
			return "Uma entrada do compêndio está inválida. Recarregue a página e tente novamente.";
		case "COMPENDIUM_ENTRY_NOT_FOUND":
			return "A entrada do compêndio não foi encontrada.";
		case "INVALID_COMPENDIUM_ENTRY_ID":
			return "A entrada selecionada não é válida.";
	}
}

function toCompendiumBrowserEntryItem(
	entry: CompendiumEntry,
	selectedEntryId: string | null,
): CompendiumBrowserEntryItem {
	return {
		categoryLabel: mapCompendiumCategoryLabel(entry.category),
		id: entry.id,
		isSelected: entry.id === selectedEntryId,
		sourceFile: entry.sourceFile,
		summary: entry.summary,
		title: entry.title,
	};
}
