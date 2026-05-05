import { describe, expect, it } from "vitest";
import { OFFICIAL_COMPENDIUM_ENTRIES } from "$lib/entities/compendium";
import {
	createCompendiumBrowserView,
	mapCompendiumCategoryLabel,
} from "../model/compendiumBrowserView";

describe("createCompendiumBrowserView", () => {
	it("uses a zero-results label and empty state", () => {
		const view = createCompendiumBrowserView([], {
			query: "inexistente",
			selectedEntryId: null,
		});

		expect(view.countLabel).toBe("Nenhum resultado");
		expect(view.emptyState).toEqual({
			title: "Nenhuma entrada encontrada",
			description:
				"Tente buscar por criação de ficha, ancestralidade, classe ou antecedente.",
		});
		expect(view.selectedEntry).toBeUndefined();
	});

	it("uses singular and plural result labels", () => {
		const oneResult = createCompendiumBrowserView(
			[OFFICIAL_COMPENDIUM_ENTRIES[3]],
			{ query: "Vanguarda", selectedEntryId: null },
		);
		const manyResults = createCompendiumBrowserView(
			OFFICIAL_COMPENDIUM_ENTRIES,
			{ query: "", selectedEntryId: null },
		);

		expect(oneResult.countLabel).toBe("1 resultado");
		expect(manyResults.countLabel).toBe("8 resultados");
	});

	it("maps class category to pt-BR", () => {
		expect(mapCompendiumCategoryLabel("class")).toBe("Classe");
	});

	it("marks the selected entry and exposes readable detail", () => {
		const view = createCompendiumBrowserView(OFFICIAL_COMPENDIUM_ENTRIES, {
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
			title: "Vanguarda",
		});
	});

	it("uses an instruction when no entry is selected", () => {
		const view = createCompendiumBrowserView(OFFICIAL_COMPENDIUM_ENTRIES, {
			query: "",
			selectedEntryId: null,
		});

		expect(view.selectedEntry).toBeUndefined();
		expect(view.detailInstruction).toBe(
			"Selecione uma entrada para ler o resumo e a fonte da regra.",
		);
	});
});
