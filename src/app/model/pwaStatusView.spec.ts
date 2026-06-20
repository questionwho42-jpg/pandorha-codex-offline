import { describe, expect, it } from "vitest";
import {
	createPwaInstallView,
	createPwaStatusView,
	createPwaUpdateView,
} from "./pwaStatusView";

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
	it("shows the install action only after the browser exposes the prompt", () => {
		expect(createPwaInstallView({ kind: "unavailable" })).toMatchObject({
			isVisible: false,
			canInstall: false,
			buttonLabel: "Instalar app",
		});
		expect(createPwaInstallView({ kind: "available" })).toMatchObject({
			isVisible: true,
			canInstall: true,
			label: "Instalação disponível neste navegador.",
			buttonLabel: "Instalar app",
		});
		expect(createPwaInstallView({ kind: "installing" })).toMatchObject({
			isVisible: true,
			canInstall: false,
			label: "Abrindo instalação do app...",
		});
	});

	it("maps completed install prompt outcomes without enabling the action again", () => {
		expect(createPwaInstallView({ kind: "accepted" })).toMatchObject({
			isVisible: true,
			canInstall: false,
			tone: "ready",
			label: "Instalação aceita pelo navegador.",
		});
		expect(createPwaInstallView({ kind: "dismissed" })).toMatchObject({
			isVisible: true,
			canInstall: false,
			tone: "warning",
			label: "Instalação dispensada neste momento.",
		});
		expect(createPwaInstallView({ kind: "failed" })).toMatchObject({
			isVisible: true,
			canInstall: false,
			tone: "warning",
			label: "Não foi possível iniciar a instalação.",
		});
	});

	it("keeps the update action locked until a waiting worker exists", () => {
		expect(createPwaUpdateView({ kind: "idle" })).toMatchObject({
			isVisible: false,
			canApply: false,
			buttonLabel: "Atualizar agora",
		});
		expect(createPwaUpdateView({ kind: "available" })).toMatchObject({
			isVisible: true,
			canApply: true,
			label: "Atualização disponível.",
			buttonLabel: "Atualizar agora",
		});
		expect(createPwaUpdateView({ kind: "applying" })).toMatchObject({
			isVisible: true,
			canApply: false,
			label: "Aplicando atualização...",
		});
		expect(createPwaUpdateView({ kind: "failed" })).toMatchObject({
			isVisible: true,
			canApply: false,
			tone: "warning",
			label: "Não foi possível aplicar a atualização.",
		});
	});
});
