import { describe, expect, it } from "vitest";
import { OFFICIAL_COMPENDIUM_ENTRIES } from "$lib/entities/compendium";
import {
	createCompendiumBrowserView,
	mapCompendiumCategoryLabel,
	mapCompendiumFailure,
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

	it("uses singular result label when one entry is selected", () => {
		const view = createCompendiumBrowserView([OFFICIAL_COMPENDIUM_ENTRIES[3]], {
			query: "Vanguarda",
			selectedEntryId: "class-vanguard",
		});

		expect(view.countLabel).toBe("1 resultado");
		expect(view.selectedEntry?.title).toBe("Vanguarda");
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
