// @vitest-environment happy-dom

import { mount, unmount } from "svelte";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { CharacterRecord } from "$lib/entities/character/model/characterSchema";
import DowntimePanel from "../ui/DowntimePanel.svelte";

interface FakeWorkerRequest {
	messageId: string;
	type: string;
	payload: Record<string, any>;
}

interface WorkerResponse {
	messageId: string;
	success: boolean;
	data: any;
	error: { code: string; message: string } | null;
}

let mockRecessDays = 7;
let mockCurrentDateDays = 0;
const mockDowntimeLogs: any[] = [];

beforeAll(() => {
	// Mock do Element.animate para transições
	if (typeof Element !== "undefined") {
		Element.prototype.animate = vi.fn().mockReturnValue({
			finished: Promise.resolve(),
			cancel: vi.fn(),
			play: vi.fn(),
			pause: vi.fn(),
		});
	}
	if (typeof HTMLElement !== "undefined") {
		HTMLElement.prototype.animate = vi.fn().mockReturnValue({
			finished: Promise.resolve(),
			cancel: vi.fn(),
			play: vi.fn(),
			pause: vi.fn(),
		});
	}

	// Mock do Worker
	globalThis.Worker = class {
		public onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null =
			null;

		public postMessage = (request: FakeWorkerRequest) => {
			setTimeout(() => {
				if (!this.onmessage) return;

				let data: any = null;
				let success = true;
				let error: { code: string; message: string } | null = null;

				try {
					switch (request.type) {
						case "INIT_DATABASE":
							success = true;
							data = {};
							break;

						case "GET_CAMPAIGN_RECESS":
							success = true;
							data = {
								recessDays: mockRecessDays,
								currentDateDays: mockCurrentDateDays,
							};
							break;

						case "ADD_RECESS_DAYS":
							success = true;
							mockRecessDays += request.payload.days;
							data = {
								recessDays: mockRecessDays,
								currentDateDays: mockCurrentDateDays,
							};
							break;

						case "RESOLVE_DOWNTIME_WEEK":
							if (mockRecessDays < 7) {
								success = false;
								error = {
									code: "INSUFFICIENT_RECESS_DAYS",
									message:
										"Saldo de recesso insuficiente para resolver semana.",
								};
							} else {
								mockRecessDays -= 7;
								mockCurrentDateDays += 7;
								success = true;
								data = {
									recessDays: mockRecessDays,
									currentDateDays: mockCurrentDateDays,
									logs: request.payload.allocations.map((alloc: any) => ({
										characterId: alloc.characterId,
										actionTag: alloc.actionTag,
										rollResult: 15,
										outcomeDetails: `Resolveu com sucesso a Tag ${alloc.actionTag} de recesso.`,
									})),
									clocksAdvanced: [],
									siegeTriggered: false,
								};
							}
							break;

						default:
							success = false;
							error = {
								code: "UNKNOWN_REQUEST",
								message: `Unknown request type: ${request.type}`,
							};
					}
				} catch (err: any) {
					success = false;
					error = {
						code: "INTERNAL_ERROR",
						message: err.message || String(err),
					};
				}

				const response: WorkerResponse = {
					messageId: request.messageId,
					success,
					data,
					error,
				};

				this.onmessage({ data: response } as MessageEvent<WorkerResponse>);
			}, 1);
		};

		public addEventListener = vi.fn();
		public removeEventListener = vi.fn();
		public terminate = vi.fn();
	} as any;
});

describe("DowntimePanel (UI Svelte 5 Happy-DOM)", () => {
	const mockCharacters: CharacterRecord[] = [
		{
			id: "char-eldrin",
			name: "Eldrin",
			concept: "Mago",
			ancestryId: "elf",
			classId: "wizard",
			backgroundId: "scholar",
			level: 3,
			experiencePoints: 1000,
			tensionMeter: 10,
			physical: 1,
			mental: 4,
			social: 2,
			conflict: 1,
			interaction: 3,
			resistance: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
		{
			id: "char-silas",
			name: "Silas",
			concept: "Guerreiro",
			ancestryId: "human",
			classId: "fighter",
			backgroundId: "noble",
			level: 2,
			experiencePoints: 500,
			tensionMeter: 5,
			physical: 3,
			mental: 2,
			social: 3,
			conflict: 2,
			interaction: 2,
			resistance: 2,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
	];

	beforeEach(() => {
		mockRecessDays = 7;
		mockCurrentDateDays = 0;
	});

	it("deve montar o painel e exibir o status de recesso e personagens", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(DowntimePanel, {
			target: container,
			props: {
				characters: mockCharacters,
			},
		});

		// Aguarda o onMount carregar do repositório
		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Downtime e Recesso dos Andarilhos",
			);
			expect(container.innerHTML).toContain("Eldrin");
			expect(container.innerHTML).toContain("Silas");
			expect(container.innerHTML).toContain("Semana 1");
		});

		unmount(component);
		container.remove();
	});

	it("deve simular +7 dias de recesso global ao clicar no botão correspondente", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(DowntimePanel, {
			target: container,
			props: {
				characters: mockCharacters,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Downtime e Recesso dos Andarilhos",
			);
		});

		const buttons = container.querySelectorAll("button");
		const addDaysBtn = Array.from(buttons).find((b) =>
			b.innerHTML.includes("Simular +7 Dias"),
		);
		expect(addDaysBtn).toBeTruthy();

		addDaysBtn!.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("14 dias");
		});

		unmount(component);
		container.remove();
	});

	it("deve resolver recesso semanal enviando dados ao worker", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(DowntimePanel, {
			target: container,
			props: {
				characters: mockCharacters,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("7 dias");
		});

		const buttons = container.querySelectorAll("button");
		const resolveBtn = Array.from(buttons).find((b) =>
			b.innerHTML.includes("Resolver Recesso Semanal"),
		);
		expect(resolveBtn).toBeTruthy();
		expect(resolveBtn!.disabled).toBe(false);

		resolveBtn!.click();

		await vi.waitFor(() => {
			// Saldo deve cair para 0 dias
			expect(container.innerHTML).toContain("0 dias");
			// Semana deve avançar para semana 2 (7 dias no calendário)
			expect(container.innerHTML).toContain("Semana 2");
			// Deve listar os logs no histórico
			expect(container.innerHTML).toContain(
				"Resolveu com sucesso a Tag A de recesso.",
			);
		});

		unmount(component);
		container.remove();
	});
});
