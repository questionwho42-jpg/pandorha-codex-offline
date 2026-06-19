// @vitest-environment happy-dom

import { mount, unmount } from "svelte";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import CampaignTimelinePanel from "../CampaignTimelinePanel.svelte";

class FakeWorker implements Worker {
	public postMessage = vi.fn();
	public addEventListener = vi.fn();
	public removeEventListener = vi.fn();
	public terminate = vi.fn();

	// Para uso em testes
	public listeners: Record<string, Function[]> = {};

	constructor() {
		this.addEventListener.mockImplementation(
			(type: string, listener: Function) => {
				if (!this.listeners[type]) {
					this.listeners[type] = [];
				}
				this.listeners[type].push(listener);
			},
		);

		this.removeEventListener.mockImplementation(
			(type: string, listener: Function) => {
				if (this.listeners[type]) {
					this.listeners[type] = this.listeners[type].filter(
						(l) => l !== listener,
					);
				}
			},
		);
	}

	public simulateResponse(data: any) {
		const messageEvent = new MessageEvent("message", { data });
		if (this.listeners["message"]) {
			for (const listener of this.listeners["message"]) {
				listener(messageEvent);
			}
		}
	}

	public onmessage: ((this: Worker, ev: MessageEvent) => any) | null = null;
	public onmessageerror: ((this: Worker, ev: MessageEvent) => any) | null =
		null;
	public onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null = null;
	public dispatchEvent(event: Event): boolean {
		return false;
	}
}

beforeAll(() => {
	// Mock do Worker do banco SQLite
	globalThis.Worker = FakeWorker as any;
});

describe("CampaignTimelinePanel (UI Svelte 5)", () => {
	let fakeWorker: FakeWorker;

	beforeEach(() => {
		fakeWorker = new FakeWorker();
	});

	it("deve montar o painel com sucesso e exibir o cabecalho", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(CampaignTimelinePanel, {
			target: container,
			props: {
				campaignId: "test-campaign",
				worker: fakeWorker,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Crônica da Campanha");
			expect(container.innerHTML).toContain("ID: test-campaign");
			expect(container.innerHTML).toContain("Registro Histórico");
			expect(container.innerHTML).toContain("Regras Toggleable");
		});

		unmount(component);
		container.remove();
	});

	it("deve listar eventos do timeline recebidos do worker", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(CampaignTimelinePanel, {
			target: container,
			props: {
				campaignId: "test-campaign",
				worker: fakeWorker,
			},
		});

		// Aguarda o onMount ser executado e postMessage ser enviado
		await vi.waitFor(() => {
			expect(fakeWorker.postMessage).toHaveBeenCalled();
		});

		const calls = fakeWorker.postMessage.mock.calls;
		const timelineCall = calls.find(
			(call) => call[0].type === "GET_CAMPAIGN_TIMELINE",
		);
		expect(timelineCall).toBeTruthy();

		const messageId = timelineCall![0].messageId;

		// Simula resposta com dados
		const testEvents = [
			{
				id: "ev-1",
				campaignId: "test-campaign",
				eventType: "siege_start",
				description: "O exército de Orcs montou cerco no Bastião Caído.",
				createdAt: "2026-06-13T10:00:00.000Z",
			},
			{
				id: "ev-2",
				campaignId: "test-campaign",
				eventType: "weather_shift",
				description: "Uma forte Nevasca congelou a região das montanhas.",
				createdAt: "2026-06-13T10:30:00.000Z",
			},
		];

		fakeWorker.simulateResponse({
			messageId,
			success: true,
			type: "GET_CAMPAIGN_TIMELINE",
			data: testEvents,
		});

		// Aguarda a renderizacao reativa
		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Cerco Iniciado");
			expect(container.innerHTML).toContain("O exército de Orcs montou cerco");
			expect(container.innerHTML).toContain("Clima Alterado");
			expect(container.innerHTML).toContain("Uma forte Nevasca congelou");
		});

		unmount(component);
		container.remove();
	});

	it("deve filtrar eventos de acordo com o botao de filtro clicado", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(CampaignTimelinePanel, {
			target: container,
			props: {
				campaignId: "test-campaign",
				worker: fakeWorker,
			},
		});

		// Aguarda o onMount ser executado
		await vi.waitFor(() => {
			expect(fakeWorker.postMessage).toHaveBeenCalled();
		});

		const calls = fakeWorker.postMessage.mock.calls;
		const timelineCall = calls.find(
			(call) => call[0].type === "GET_CAMPAIGN_TIMELINE",
		);
		expect(timelineCall).toBeTruthy();
		const messageId = timelineCall![0].messageId;

		// Simula resposta com dados
		const testEvents = [
			{
				id: "ev-1",
				campaignId: "test-campaign",
				eventType: "siege_start",
				description: "O exército de Orcs montou cerco.",
				createdAt: "2026-06-13T10:00:00.000Z",
			},
			{
				id: "ev-2",
				campaignId: "test-campaign",
				eventType: "weather_shift",
				description: "Uma forte Nevasca congelou.",
				createdAt: "2026-06-13T10:30:00.000Z",
			},
		];

		fakeWorker.simulateResponse({
			messageId,
			success: true,
			type: "GET_CAMPAIGN_TIMELINE",
			data: testEvents,
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("O exército de Orcs montou cerco");
			expect(container.innerHTML).toContain("Uma forte Nevasca congelou");
		});

		// Clica no filtro de clima
		const filterButtons = container.querySelectorAll(".filter-btn");
		const weatherFilterBtn = Array.from(filterButtons).find(
			(btn) => btn.textContent?.trim() === "Clima",
		) as HTMLButtonElement;

		expect(weatherFilterBtn).toBeTruthy();
		weatherFilterBtn.click();

		// Apenas o evento de clima deve ser exibido
		await vi.waitFor(() => {
			expect(container.innerHTML).not.toContain(
				"O exército de Orcs montou cerco",
			);
			expect(container.innerHTML).toContain("Uma forte Nevasca congelou");
		});

		unmount(component);
		container.remove();
	});

	it("deve permitir alterar uma regra e enviar o comando SET_WORLD_STATE_FLAG correspondente", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(CampaignTimelinePanel, {
			target: container,
			props: {
				campaignId: "test-campaign",
				worker: fakeWorker,
			},
		});

		// Aguarda o onMount ser executado
		await vi.waitFor(() => {
			expect(fakeWorker.postMessage).toHaveBeenCalled();
		});

		const calls = fakeWorker.postMessage.mock.calls;
		const listCall = calls.find(
			(call) => call[0].type === "LIST_WORLD_STATE_FLAGS",
		);
		expect(listCall).toBeTruthy();
		const listMessageId = listCall![0].messageId;

		fakeWorker.simulateResponse({
			messageId: listMessageId,
			success: true,
			type: "LIST_WORLD_STATE_FLAGS",
			data: [
				{ key: "system:rules:siege_on_extreme_infamy", value: true },
				{ key: "system:rules:block_rest_on_debt_marked", value: false },
			],
		});

		// Aguarda o fim do loading
		await vi.waitFor(() => {
			expect(container.querySelector(".loading-state")).toBeFalsy();
			expect(container.innerHTML).toContain("Cerco por Infâmia Extrema");
		});

		// Clica no switch da regra "Cerco por Infâmia Extrema"
		const toggleBtn = container.querySelector(
			'[data-testid="rule-toggle-siege_on_extreme_infamy"]',
		) as HTMLButtonElement;

		expect(toggleBtn).toBeTruthy();

		// Reseta mocks para verificar chamadas subsequentes
		fakeWorker.postMessage.mockClear();

		toggleBtn.click();

		// Deve enviar SET_WORLD_STATE_FLAG com a chave e o novo valor (false, ja que era true)
		await vi.waitFor(() => {
			expect(fakeWorker.postMessage).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "SET_WORLD_STATE_FLAG",
					payload: {
						key: "system:rules:siege_on_extreme_infamy",
						value: false,
					},
				}),
			);
		});

		unmount(component);
		container.remove();
	});
});
