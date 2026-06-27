import type {
	CompendiumCategory,
	CompendiumEntry,
	CompendiumFailure,
} from "$lib/entities/compendium";

export type CompendiumBrowserOptions = Readonly<{
	currentPage?: number;
	pageSize?: number;
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
	canClearFilters: boolean;
	description: string;
	title: string;
}>;

export type CompendiumBrowserPagination = Readonly<{
	currentPage: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	label: string;
	nextPage: number;
	pageSize: number;
	previousPage: number;
	totalItems: number;
	totalPages: number;
}>;

export type CompendiumBrowserView = Readonly<{
	categoryOptions: readonly CompendiumCategoryFilterOption[];
	countLabel: string;
	detailInstruction?: string;
	emptyState?: CompendiumBrowserEmptyState;
	items: readonly CompendiumBrowserEntryItem[];
	pagination?: CompendiumBrowserPagination;
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
	const allItems = entries.map((entry) =>
		toCompendiumBrowserEntryItem(entry, options.selectedEntryId),
	);
	const pagination = createPagination(
		allItems.length,
		options.currentPage,
		options.pageSize,
	);
	const pageStart = (pagination.currentPage - 1) * pagination.pageSize;
	const items = allItems.slice(pageStart, pageStart + pagination.pageSize);
	const selectedEntry = items.find((item) => item.isSelected);

	if (items.length === 0) {
		return {
			categoryOptions: toCategoryOptions(options.selectedCategory),
			countLabel: "Nenhum resultado",
			emptyState: createEmptyState(options),
			items,
		};
	}

	if (selectedEntry) {
		return {
			categoryOptions: toCategoryOptions(options.selectedCategory),
			countLabel: `${allItems.length} ${
				allItems.length === 1 ? "resultado" : "resultados"
			}`,
			items,
			pagination,
			selectedEntry,
		};
	}

	return {
		categoryOptions: toCategoryOptions(options.selectedCategory),
		countLabel: `${allItems.length} ${
			allItems.length === 1 ? "resultado" : "resultados"
		}`,
		detailInstruction:
			"Selecione uma entrada para ler o resumo e a fonte da regra.",
		items,
		pagination,
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

function createPagination(
	totalItems: number,
	currentPage = 1,
	pageSize = 20,
): CompendiumBrowserPagination {
	const normalizedPageSize =
		Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 20;
	const totalPages = Math.max(1, Math.ceil(totalItems / normalizedPageSize));
	const requestedPage =
		Number.isInteger(currentPage) && currentPage > 0 ? currentPage : 1;
	const normalizedCurrentPage = Math.min(requestedPage, totalPages);

	return {
		currentPage: normalizedCurrentPage,
		hasNextPage: normalizedCurrentPage < totalPages,
		hasPreviousPage: normalizedCurrentPage > 1,
		label: `Página ${normalizedCurrentPage} de ${totalPages}`,
		nextPage: Math.min(normalizedCurrentPage + 1, totalPages),
		pageSize: normalizedPageSize,
		previousPage: Math.max(normalizedCurrentPage - 1, 1),
		totalItems,
		totalPages,
	};
}

function createEmptyState(
	options: CompendiumBrowserOptions,
): CompendiumBrowserEmptyState {
	const query = options.query.trim();
	const categoryLabel =
		options.selectedCategory === "all"
			? null
			: mapCompendiumCategoryLabel(options.selectedCategory);

	if (query.length > 0 && categoryLabel) {
		return {
			title: `Nenhum resultado para "${query}" em ${categoryLabel}`,
			description:
				"Limpe a busca, remova o filtro de categoria ou tente outro termo.",
			canClearFilters: true,
		};
	}

	if (query.length > 0) {
		return {
			title: `Nenhum resultado para "${query}"`,
			description:
				"Limpe a busca ou tente outro termo mantendo todas as categorias.",
			canClearFilters: true,
		};
	}

	if (categoryLabel) {
		return {
			title: `Nenhuma entrada em ${categoryLabel}`,
			description:
				"Limpe o filtro de categoria ou volte para Todas para ampliar a consulta.",
			canClearFilters: true,
		};
	}

	return {
		title: "Nenhuma entrada cadastrada",
		description: "O índice do Compêndio não retornou entradas nesta sessão.",
		canClearFilters: false,
	};
}
