import { describe, expect, it } from "vitest";
import { OFFICIAL_COMPENDIUM_ENTRIES } from "$lib/entities/compendium";
import {
	COMPENDIUM_CATEGORY_FILTER_OPTIONS,
	createCompendiumBrowserView,
	mapCompendiumCategoryLabel,
	mapCompendiumFailure,
} from "../model/compendiumBrowserView";

describe("createCompendiumBrowserView", () => {
	it("uses a zero-results label and empty state", () => {
		const view = createCompendiumBrowserView([], {
			query: "inexistente",
			selectedCategory: "all",
			selectedEntryId: null,
		});

		expect(view.countLabel).toBe("Nenhum resultado");
		expect(view.emptyState).toEqual({
			title: 'Nenhum resultado para "inexistente"',
			description:
				"Limpe a busca ou tente outro termo mantendo todas as categorias.",
			canClearFilters: true,
		});
		expect(view.selectedEntry).toBeUndefined();
	});

	it("uses category-aware empty copy when a category filter is active", () => {
		const view = createCompendiumBrowserView([], {
			query: "",
			selectedCategory: "system-magic",
			selectedEntryId: null,
		});

		expect(view.emptyState).toEqual({
			title: "Nenhuma entrada em Sistema: Magia",
			description:
				"Limpe o filtro de categoria ou volte para Todas para ampliar a consulta.",
			canClearFilters: true,
		});
	});

	it("uses query and category-aware empty copy when both filters are active", () => {
		const view = createCompendiumBrowserView([], {
			query: "ritual",
			selectedCategory: "system-magic",
			selectedEntryId: null,
		});

		expect(view.emptyState).toEqual({
			title: 'Nenhum resultado para "ritual" em Sistema: Magia',
			description:
				"Limpe a busca, remova o filtro de categoria ou tente outro termo.",
			canClearFilters: true,
		});
	});

	it("distinguishes an empty catalog from filtered empty results", () => {
		const view = createCompendiumBrowserView([], {
			query: "",
			selectedCategory: "all",
			selectedEntryId: null,
		});

		expect(view.emptyState).toEqual({
			title: "Nenhuma entrada cadastrada",
			description: "O índice do Compêndio não retornou entradas nesta sessão.",
			canClearFilters: false,
		});
	});

	it("exposes category filter options with the current selection", () => {
		const view = createCompendiumBrowserView(OFFICIAL_COMPENDIUM_ENTRIES, {
			query: "",
			selectedCategory: "system-magic",
			selectedEntryId: null,
		});

		expect(
			COMPENDIUM_CATEGORY_FILTER_OPTIONS.map((option) => option.id),
		).toEqual([
			"all",
			"character-creation",
			"ancestry",
			"class",
			"background",
			"system-survival",
			"system-combat",
			"system-magic",
		]);
		expect(view.categoryOptions).toContainEqual({
			id: "system-magic",
			isSelected: true,
			label: "Sistema: Magia",
		});
	});

	it("uses singular and plural result labels", () => {
		const oneResult = createCompendiumBrowserView(
			[OFFICIAL_COMPENDIUM_ENTRIES[3]],
			{ query: "Vanguarda", selectedCategory: "all", selectedEntryId: null },
		);
		const manyResults = createCompendiumBrowserView(
			OFFICIAL_COMPENDIUM_ENTRIES,
			{ query: "", selectedCategory: "all", selectedEntryId: null },
		);

		expect(oneResult.countLabel).toBe("1 resultado");
		expect(manyResults.countLabel).toBe(
			`${OFFICIAL_COMPENDIUM_ENTRIES.length} resultados`,
		);
	});

	it("maps class category to pt-BR", () => {
		expect(mapCompendiumCategoryLabel("class")).toBe("Classe");
	});

	it("maps every visible category to pt-BR", () => {
		expect(mapCompendiumCategoryLabel("ancestry")).toBe("Ancestralidade");
		expect(mapCompendiumCategoryLabel("background")).toBe("Antecedente");
		expect(mapCompendiumCategoryLabel("character-creation")).toContain("ficha");
		expect(mapCompendiumCategoryLabel("system-combat")).toBe(
			"Sistema: Combate",
		);
		expect(mapCompendiumCategoryLabel("system-magic")).toBe("Sistema: Magia");
		expect(mapCompendiumCategoryLabel("system-survival")).toBe(
			"Sistema: Sobrevivência",
		);
	});

	it("marks the selected entry and exposes readable detail", () => {
		const view = createCompendiumBrowserView(OFFICIAL_COMPENDIUM_ENTRIES, {
			selectedCategory: "all",
			query: "Vanguarda",
			selectedEntryId: "class-vanguard",
		});

		expect(
			view.items.find((item) => item.id === "class-vanguard"),
		).toMatchObject({
			categoryLabel: "Classe",
			isSelected: true,
			title: "Vanguarda",
		});
		expect(view.selectedEntry).toMatchObject({
			categoryLabel: "Classe",
			sourceFile: "docs/system/survival/05-01-vanguarda.md",
			sourceLabel: "docs/system/survival/05-01-vanguarda.md:20",
			title: "Vanguarda",
		});
	});

	it("uses singular result label when one entry is selected", () => {
		const view = createCompendiumBrowserView([OFFICIAL_COMPENDIUM_ENTRIES[3]], {
			query: "Vanguarda",
			selectedCategory: "all",
			selectedEntryId: "class-vanguard",
		});

		expect(view.countLabel).toBe("1 resultado");
		expect(view.selectedEntry?.title).toBe("Vanguarda");
	});

	it("paginates result items and exposes pt-BR navigation labels", () => {
		const view = createCompendiumBrowserView(OFFICIAL_COMPENDIUM_ENTRIES, {
			currentPage: 2,
			pageSize: 3,
			query: "",
			selectedCategory: "all",
			selectedEntryId: null,
		});

		expect(view.items.map((item) => item.id)).toEqual(
			OFFICIAL_COMPENDIUM_ENTRIES.slice(3, 6).map((entry) => entry.id),
		);
		expect(view.pagination).toEqual({
			currentPage: 2,
			hasNextPage: true,
			hasPreviousPage: true,
			label: `Página 2 de ${Math.ceil(OFFICIAL_COMPENDIUM_ENTRIES.length / 3)}`,
			nextPage: 3,
			pageSize: 3,
			previousPage: 1,
			totalItems: OFFICIAL_COMPENDIUM_ENTRIES.length,
			totalPages: Math.ceil(OFFICIAL_COMPENDIUM_ENTRIES.length / 3),
		});
	});

	it("normalizes an out-of-range current page to the last available page", () => {
		const view = createCompendiumBrowserView(OFFICIAL_COMPENDIUM_ENTRIES, {
			currentPage: 999,
			pageSize: 50,
			query: "",
			selectedCategory: "all",
			selectedEntryId: null,
		});

		expect(view.pagination?.currentPage).toBe(
			Math.ceil(OFFICIAL_COMPENDIUM_ENTRIES.length / 50),
		);
		expect(view.items).toHaveLength(OFFICIAL_COMPENDIUM_ENTRIES.length % 50);
	});

	it.each([
		{ currentPage: 0, pageSize: 0 },
		{ currentPage: 1.5, pageSize: 2.5 },
	])("normalizes invalid pagination values", ({ currentPage, pageSize }) => {
		const view = createCompendiumBrowserView(OFFICIAL_COMPENDIUM_ENTRIES, {
			currentPage,
			pageSize,
			query: "",
			selectedCategory: "all",
			selectedEntryId: null,
		});

		expect(view.pagination?.currentPage).toBe(1);
		expect(view.pagination?.pageSize).toBe(20);
	});

	it("only exposes selected entry detail when the selected item is visible", () => {
		const view = createCompendiumBrowserView(OFFICIAL_COMPENDIUM_ENTRIES, {
			currentPage: 2,
			pageSize: 3,
			query: "",
			selectedCategory: "all",
			selectedEntryId: OFFICIAL_COMPENDIUM_ENTRIES[0].id,
		});

		expect(view.selectedEntry).toBeUndefined();
		expect(view.items.some((item) => item.isSelected)).toBe(false);
	});

	it("uses an instruction when no entry is selected", () => {
		const view = createCompendiumBrowserView(OFFICIAL_COMPENDIUM_ENTRIES, {
			query: "",
			selectedCategory: "all",
			selectedEntryId: null,
		});

		expect(view.selectedEntry).toBeUndefined();
		expect(view.detailInstruction).toBe(
			"Selecione uma entrada para ler o resumo e a fonte da regra.",
		);
	});

	it("maps compendium failures to pt-BR copy", () => {
		expect(
			mapCompendiumFailure({
				code: "INVALID_COMPENDIUM_SEARCH_INPUT",
				message: "invalid",
			}),
		).toContain("busca");
		expect(
			mapCompendiumFailure({
				code: "COMPENDIUM_REPOSITORY_READ_FAILED",
				message: "failed",
			}),
		).toContain("consultar");
		expect(
			mapCompendiumFailure({
				code: "CORRUPTED_COMPENDIUM_ENTRY",
				message: "corrupted",
			}),
		).toContain("entrada");
		expect(
			mapCompendiumFailure({
				code: "COMPENDIUM_ENTRY_NOT_FOUND",
				message: "missing",
			}),
		).toContain("entrada");
		expect(
			mapCompendiumFailure({
				code: "INVALID_COMPENDIUM_ENTRY_ID",
				message: "invalid id",
			}),
		).toContain("selecionada");
	});
});
