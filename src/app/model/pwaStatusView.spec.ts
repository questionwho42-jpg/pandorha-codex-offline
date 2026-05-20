import { describe, expect, it } from "vitest";
import { createPwaStatusView } from "./pwaStatusView";

describe("createPwaStatusView", () => {
	it("maps service worker lifecycle states to pt-BR labels", () => {
		expect(createPwaStatusView({ kind: "checking" })).toMatchObject({
			label: "Preparando modo offline...",
			tone: "pending",
		});
		expect(createPwaStatusView({ kind: "ready" })).toMatchObject({
			label: "Offline disponível neste navegador.",
			tone: "ready",
		});
		expect(createPwaStatusView({ kind: "unsupported" })).toMatchObject({
			label: "Modo offline indisponível neste navegador.",
			tone: "warning",
		});
	});

	it("keeps failure copy in pt-BR without exposing service worker internals", () => {
		expect(createPwaStatusView({ kind: "failed" })).toMatchObject({
			label: "Não foi possível preparar o modo offline.",
			tone: "warning",
		});
	});
});
