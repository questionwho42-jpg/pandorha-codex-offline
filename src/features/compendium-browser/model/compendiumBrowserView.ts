import type {
	CompendiumCategory,
	CompendiumEntry,
	CompendiumFailure,
} from "$lib/entities/compendium";

export type CompendiumBrowserOptions = Readonly<{
	query: string;
	selectedCategory: CompendiumCategoryFilter;
	selectedEntryId: string | null;
}>;

export type CompendiumCategoryFilter = CompendiumCategory | "all";

export type CompendiumCategoryFilterOption = Readonly<{
	id: CompendiumCategoryFilter;
	isSelected: boolean;
	label: string;
}>;

export type CompendiumBrowserEntryItem = Readonly<{
	categoryLabel: string;
	id: string;
	isSelected: boolean;
	sourceFile: string;
	sourceLabel: string;
	summary: string;
	title: string;
}>;

export type CompendiumBrowserEmptyState = Readonly<{
	description: string;
	title: string;
}>;

export type CompendiumBrowserView = Readonly<{
	categoryOptions: readonly CompendiumCategoryFilterOption[];
	countLabel: string;
	detailInstruction?: string;
	emptyState?: CompendiumBrowserEmptyState;
	items: readonly CompendiumBrowserEntryItem[];
	selectedEntry?: CompendiumBrowserEntryItem;
}>;

export const COMPENDIUM_CATEGORY_FILTER_OPTIONS = [
	{ id: "all", label: "Todas" },
	{ id: "character-creation", label: "Criação de ficha" },
	{ id: "ancestry", label: "Ancestralidade" },
	{ id: "class", label: "Classe" },
	{ id: "background", label: "Antecedente" },
	{ id: "system-survival", label: "Sistema: Sobrevivência" },
	{ id: "system-combat", label: "Sistema: Combate" },
	{ id: "system-magic", label: "Sistema: Magia" },
] as const satisfies readonly Readonly<{
	id: CompendiumCategoryFilter;
	label: string;
}>[];

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
			categoryOptions: toCategoryOptions(options.selectedCategory),
			countLabel: "Nenhum resultado",
			emptyState: {
				title: "Nenhuma entrada encontrada",
				description:
					"Tente buscar por criação de ficha, magia, combate ou sobrevivência.",
			},
			items,
		};
	}

	if (selectedEntry) {
		return {
			categoryOptions: toCategoryOptions(options.selectedCategory),
			countLabel: `${items.length} ${items.length === 1 ? "resultado" : "resultados"}`,
			items,
			selectedEntry,
		};
	}

	return {
		categoryOptions: toCategoryOptions(options.selectedCategory),
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
		sourceLabel: `${entry.sourceFile}:${entry.sourceLine}`,
		summary: entry.summary,
		title: entry.title,
	};
}

function toCategoryOptions(
	selectedCategory: CompendiumCategoryFilter,
): readonly CompendiumCategoryFilterOption[] {
	return COMPENDIUM_CATEGORY_FILTER_OPTIONS.map((option) => ({
		...option,
		isSelected: option.id === selectedCategory,
	}));
}
