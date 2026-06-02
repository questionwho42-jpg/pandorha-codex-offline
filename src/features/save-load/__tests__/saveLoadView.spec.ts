import { describe, expect, it } from "vitest";
import { createSaveLoadView } from "../model/saveLoadView";

describe("createSaveLoadView", () => {
	it("maps each non-error state to pt-BR labels and button availability", () => {
		expect(createSaveLoadView({ kind: "initializing" })).toMatchObject({
			statusLabel: "Preparando save local...",
			canSave: false,
			canLoad: false,
		});
		expect(createSaveLoadView({ kind: "ready" })).toMatchObject({
			statusLabel: "Save local pronto.",
			canSave: true,
			canLoad: true,
		});
		expect(createSaveLoadView({ kind: "saving" })).toMatchObject({
			statusLabel: "Salvando sessão...",
			canSave: false,
			canLoad: false,
		});
		expect(createSaveLoadView({ kind: "saved" })).toMatchObject({
			statusLabel: "Sessão salva neste navegador.",
			canSave: true,
			canLoad: true,
		});
		expect(createSaveLoadView({ kind: "loading" })).toMatchObject({
			statusLabel: "Carregando save...",
			canSave: false,
			canLoad: false,
		});
		expect(createSaveLoadView({ kind: "loaded" })).toMatchObject({
			statusLabel: "Save carregado.",
			canSave: true,
			canLoad: true,
		});
	});

	it("keeps user-facing errors in pt-BR without exposing technical codes", () => {
		expect(
			createSaveLoadView({
				kind: "error",
				message: "Não foi possível carregar o save local.",
			}),
		).toMatchObject({
			statusLabel: "Não foi possível carregar o save local.",
			canSave: true,
			canLoad: true,
		});
	});
});
