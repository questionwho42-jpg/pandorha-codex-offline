// @vitest-environment happy-dom

import { mount, unmount } from "svelte";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { ClockData } from "$lib/entities/clocks/model/clockSchema";
import type {
	MercenaryCompanyRecord,
	MercenarySquadRecord,
} from "$lib/entities/mercenary/model/mercenarySchema";
import { rpcCache } from "$lib/shared/rpc";
import MercenaryCompanyPanel from "../ui/MercenaryCompanyPanel.svelte";

interface FakeWorkerRequest {
	messageId: string;
	type: string;
	payload: Record<string, unknown>;
}

interface WorkerResponse {
	messageId: string;
	success: boolean;
	data: unknown;
	error: { code: string; message: string } | null;
}

let mockDatabase: {
	companies: MercenaryCompanyRecord[];
	squads: MercenarySquadRecord[];
	clocks: ClockData[];
};
let mockIdCounter = 0;

beforeAll(() => {
	// Mock do Element.animate para satisfazer transições Svelte no Happy-DOM
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

	if (typeof HTMLSelectElement !== "undefined") {
		const originalQuerySelector = HTMLSelectElement.prototype.querySelector;
		HTMLSelectElement.prototype.querySelector = function (
			this: HTMLSelectElement,
			selector: string,
		) {
			if (selector === ":checked" || selector === "[selected]") {
				return Array.from(this.options).find((opt) => opt.selected) || null;
			}
			return originalQuerySelector.call(this, selector);
		} as unknown as typeof HTMLSelectElement.prototype.querySelector;

		const originalQuerySelectorAll =
			HTMLSelectElement.prototype.querySelectorAll;
		HTMLSelectElement.prototype.querySelectorAll = function (
			this: HTMLSelectElement,
			selector: string,
		) {
			if (selector === ":checked" || selector === "[selected]") {
				const filtered = Array.from(this.options).filter((opt) => opt.selected);
				return filtered as unknown as NodeListOf<Element>;
			}
			return originalQuerySelectorAll.call(this, selector);
		} as unknown as typeof HTMLSelectElement.prototype.querySelectorAll;
	}

	// Mock do Worker para simular o banco SQLite em memória
	globalThis.Worker = class {
		public onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null =
			null;

		public postMessage = (request: FakeWorkerRequest) => {
			setTimeout(() => {
				if (!this.onmessage) return;

				let data: unknown = null;
				let success = true;
				let error: { code: string; message: string } | null = null;

				try {
					switch (request.type) {
						case "INIT_DATABASE":
							success = true;
							data = {};
							break;

						case "LIST_MERCENARY_COMPANIES":
							success = true;
							data = mockDatabase.companies;
							break;

						case "FIND_MERCENARY_COMPANY": {
							const searchId = (request.payload as { id: string }).id;
							const company = mockDatabase.companies.find(
								(x) => x.id === searchId,
							);
							if (company) {
								success = true;
								data = company;
							} else {
								success = false;
								error = {
									code: "MERCENARY_COMPANY_NOT_FOUND",
									message: "Company not found",
								};
							}
							break;
						}

						case "SAVE_MERCENARY_COMPANY": {
							success = true;
							const record = (
								request.payload as { company: Partial<MercenaryCompanyRecord> }
							).company;
							const idx = mockDatabase.companies.findIndex(
								(x) => x.id === record.id,
							);
							if (idx >= 0) {
								mockDatabase.companies[idx] = {
									...mockDatabase.companies[idx],
									...record,
									updatedAt: new Date().toISOString(),
								} as MercenaryCompanyRecord;
								data = mockDatabase.companies[idx];
							} else {
								const newRecord: MercenaryCompanyRecord = {
									id: record.id || `comp-${++mockIdCounter}`,
									hqName: record.hqName || "",
									bastionId: record.bastionId || null,
									tier: record.tier || 1,
									reputation: record.reputation || 0,
									createdAt: record.createdAt || new Date().toISOString(),
									updatedAt: record.updatedAt || new Date().toISOString(),
								};
								mockDatabase.companies.push(newRecord);
								data = newRecord;
							}
							break;
						}

						case "LIST_MERCENARY_SQUADS_BY_COMPANY": {
							const companyId = (request.payload as { companyId: string })
								.companyId;
							success = true;
							data = mockDatabase.squads.filter(
								(s) => s.companyId === companyId,
							);
							break;
						}

						case "FIND_MERCENARY_SQUAD": {
							const searchId = (request.payload as { id: string }).id;
							const squad = mockDatabase.squads.find((x) => x.id === searchId);
							if (squad) {
								success = true;
								data = squad;
							} else {
								success = false;
								error = {
									code: "MERCENARY_SQUAD_NOT_FOUND",
									message: "Squad not found",
								};
							}
							break;
						}

						case "SAVE_MERCENARY_SQUAD": {
							success = true;
							const record = (
								request.payload as { squad: Partial<MercenarySquadRecord> }
							).squad;
							const idx = mockDatabase.squads.findIndex(
								(x) => x.id === record.id,
							);
							if (idx >= 0) {
								mockDatabase.squads[idx] = {
									...mockDatabase.squads[idx],
									...record,
									updatedAt: new Date().toISOString(),
								} as MercenarySquadRecord;
								data = mockDatabase.squads[idx];
							} else {
								const newRecord: MercenarySquadRecord = {
									id: record.id || `squad-${++mockIdCounter}`,
									companyId: record.companyId || "",
									name: record.name || "",
									physical: record.physical || 0,
									mental: record.mental || 0,
									social: record.social || 0,
									cohesionMax: record.cohesionMax || 10,
									cohesionCurrent: record.cohesionCurrent || 10,
									tagsJson: record.tagsJson || "[]",
									commandTactic: record.commandTactic || "honorable",
									status: record.status || "available",
									assignedMissionId: record.assignedMissionId || null,
									createdAt: record.createdAt || new Date().toISOString(),
									updatedAt: record.updatedAt || new Date().toISOString(),
								};
								mockDatabase.squads.push(newRecord);
								data = newRecord;
							}
							break;
						}

						case "SAVE_CLOCK": {
							success = true;
							const record = (request.payload as { clock: ClockData }).clock;
							const idx = mockDatabase.clocks.findIndex(
								(x) => x.id === record.id,
							);
							if (idx >= 0) {
								mockDatabase.clocks[idx] = {
									...mockDatabase.clocks[idx],
									...record,
								};
								data = mockDatabase.clocks[idx];
							} else {
								mockDatabase.clocks.push(record);
								data = record;
							}
							break;
						}

						case "FIND_CLOCK": {
							const searchId = (request.payload as { id: string }).id;
							const clock = mockDatabase.clocks.find((x) => x.id === searchId);
							success = true;
							data = clock || null;
							break;
						}

						case "LIST_CLOCKS": {
							success = true;
							data = mockDatabase.clocks;
							break;
						}

						case "DELETE_CLOCK": {
							const searchId = (request.payload as { id: string }).id;
							mockDatabase.clocks = mockDatabase.clocks.filter(
								(x) => x.id !== searchId,
							);
							success = true;
							data = {};
							break;
						}

						default:
							success = false;
							error = {
								code: "UNKNOWN_REQUEST",
								message: `Unknown request type: ${request.type}`,
							};
					}
				} catch (err: unknown) {
					success = false;
					error = {
						code: "INTERNAL_ERROR",
						message: err instanceof Error ? err.message : String(err),
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
	} as unknown as new () => Worker;

	// Mock do localStorage para rodar no ambiente Happy-DOM
	let store: Record<string, string> = {};
	globalThis.localStorage = {
		getItem: (key) => store[key] || null,
		setItem: (key, value) => {
			store[key] = String(value);
		},
		removeItem: (key) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		},
		length: 0,
		key: () => null,
	};
});

describe("MercenaryCompanyPanel (UI Reativa Svelte 5)", () => {
	beforeEach(() => {
		mockDatabase = {
			companies: [],
			squads: [],
			clocks: [],
		};
		localStorage.clear();
		rpcCache.invalidate("CLEAR_CACHE_FOR_TESTS");
	});

	it("deve fundar HQ com sucesso deduzindo gold da guilda", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		let updatedGold: number | null = null;
		const component = mount(MercenaryCompanyPanel, {
			target: container,
			props: {
				guildGold: 500,
				onUpdateGuildGold: (gold: number) => {
					updatedGold = gold;
				},
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Companhias Mercenárias");
			expect(container.innerHTML).toContain("Nenhuma guarnição fundada");
		});

		// Clica no botão de fundar guarnição
		const fundarBtn = Array.from(container.querySelectorAll("button")).find(
			(b) => b.textContent?.includes("Fundar Guarnição"),
		);
		expect(fundarBtn).toBeTruthy();
		fundarBtn?.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Nome da HQ");
		});

		// Altera o nome da HQ
		const input = container.querySelector(
			"input[placeholder='Nome da HQ']",
		) as HTMLInputElement;
		expect(input).toBeTruthy();
		input.value = "Minha Guarnição";
		input.dispatchEvent(new Event("input", { bubbles: true }));

		// Clica em "Furar" (o botão de confirmação da UI)
		const confirmBtn = Array.from(container.querySelectorAll("button")).find(
			(b) => b.textContent?.includes("Furar"),
		);
		expect(confirmBtn).toBeTruthy();
		confirmBtn?.click();

		await vi.waitFor(() => {
			expect(mockDatabase.companies.length).toBe(1);
			expect(mockDatabase.companies[0]?.hqName).toBe("Minha Guarnição");
			expect(updatedGold).toBe(300); // 500 - 200 (Tier 1 cost)
		});

		unmount(component);
		container.remove();
	});

	it("deve recrutar esquadrão com sucesso deduzindo gold da guilda", async () => {
		mockDatabase.companies.push({
			id: "comp-active",
			bastionId: "bastion-1",
			tier: 1,
			reputation: 0,
			hqName: "Guarnição Alpha",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		const container = document.createElement("div");
		document.body.appendChild(container);

		let updatedGold: number | null = null;
		const component = mount(MercenaryCompanyPanel, {
			target: container,
			props: {
				guildGold: 500,
				onUpdateGuildGold: (gold: number) => {
					updatedGold = gold;
				},
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Guarnição Alpha");
		});

		// Clica no botão "Recrutar Esquadrão"
		const recruitToggleBtn = Array.from(
			container.querySelectorAll("button"),
		).find((b) => b.textContent?.includes("Recrutar Esquadrão"));
		expect(recruitToggleBtn).toBeTruthy();
		recruitToggleBtn?.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Nome do Esquadrão");
		});

		// Altera o nome do esquadrão
		const input = Array.from(container.querySelectorAll("input")).find(
			(i) =>
				i.value === "Pioneiros do Vácuo" || i.value === "Recrutas de Pandorha",
		) as HTMLInputElement;
		expect(input).toBeTruthy();
		input.value = "Guerreiros de Ferro";
		input.dispatchEvent(new Event("input", { bubbles: true }));

		// Clica no botão de confirmar recrutamento
		const confirmBtn = Array.from(container.querySelectorAll("button")).find(
			(b) => b.textContent?.includes("Assinar Contrato"),
		);
		expect(confirmBtn).toBeTruthy();
		confirmBtn?.click();

		await vi.waitFor(() => {
			expect(mockDatabase.squads.length).toBe(1);
			expect(mockDatabase.squads[0]?.name).toBe("Guerreiros de Ferro");
			expect(updatedGold).toBe(400); // 500 - 100 (Recruitment cost)
		});

		unmount(component);
		container.remove();
	});

	it("deve mudar tática de comando do esquadrão", async () => {
		mockDatabase.companies.push({
			id: "comp-active",
			bastionId: "bastion-1",
			tier: 1,
			reputation: 0,
			hqName: "Guarnição Alpha",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		mockDatabase.squads.push({
			id: "squad-1",
			companyId: "comp-active",
			name: "Expedicionários",
			physical: 4,
			mental: 2,
			social: 1,
			cohesionMax: 14,
			cohesionCurrent: 14,
			tagsJson: '["stealth"]',
			commandTactic: "honorable",
			status: "available",
			assignedMissionId: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(MercenaryCompanyPanel, {
			target: container,
			props: {
				guildGold: 500,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Expedicionários");
		});

		// Clica na tática Cruel
		const cruelBtn = Array.from(container.querySelectorAll("button")).find(
			(b) => b.textContent?.includes("Cruel"),
		);
		expect(cruelBtn).toBeTruthy();
		cruelBtn?.click();

		await vi.waitFor(() => {
			expect(mockDatabase.squads[0]?.commandTactic).toBe("cruel");
		});

		unmount(component);
		container.remove();
	});

	it("deve despachar esquadrão em missão com clock e resolver com sucesso", async () => {
		mockDatabase.companies.push({
			id: "comp-active",
			bastionId: "bastion-1",
			tier: 1,
			reputation: 0,
			hqName: "Guarnição Alpha",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		mockDatabase.squads.push({
			id: "squad-1",
			companyId: "comp-active",
			name: "Expedicionários",
			physical: 4,
			mental: 2,
			social: 1,
			cohesionMax: 14,
			cohesionCurrent: 14,
			tagsJson: '["stealth"]',
			commandTactic: "honorable",
			status: "available",
			assignedMissionId: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		const container = document.createElement("div");
		document.body.appendChild(container);

		let updatedGold: number | null = null;
		const component = mount(MercenaryCompanyPanel, {
			target: container,
			props: {
				guildGold: 500,
				onUpdateGuildGold: (gold: number) => {
					updatedGold = gold;
				},
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Expedicionários");
		});

		// Selecionar esquadrão no dropdown
		const selects = container.querySelectorAll("select");
		const squadSelect = selects[1] as HTMLSelectElement;
		squadSelect.selectedIndex = 1;
		squadSelect.value = "squad-1";
		if (squadSelect.options[1]) squadSelect.options[1].selected = true;
		squadSelect.dispatchEvent(new Event("change", { bubbles: true }));

		// Clica em "Enviar Esquadrão"
		const sendBtn = Array.from(container.querySelectorAll("button")).find((b) =>
			b.textContent?.includes("Enviar Esquadrão"),
		) as HTMLButtonElement;
		expect(sendBtn).toBeTruthy();

		await vi.waitFor(() => {
			expect(sendBtn.disabled).toBe(false);
		});
		sendBtn.click();

		// Espera a missão entrar em andamento no banco e na UI
		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Missão em Andamento");
			expect(mockDatabase.clocks.length).toBe(1);
			expect(mockDatabase.squads[0]?.status).toBe("on_mission");
		});

		// Conclui o clock no banco
		const clock = mockDatabase.clocks[0];
		if (clock) {
			clock.isCompleted = true;
			clock.filledSegments = 4;
		}

		// Força a recarga para atualizar o estado do relógio na UI
		// Em ambiente real o componente lê do repositório reativo.
		// Para o teste do Happy-DOM, chamamos loadData para re-ler o relógio do banco
		await (
			component as unknown as { loadData?: () => Promise<void> }
		).loadData?.();

		const resolveBtn = Array.from(container.querySelectorAll("button")).find(
			(b) => b.textContent?.includes("Resolver Missão"),
		) as HTMLButtonElement;
		expect(resolveBtn).toBeTruthy();

		// Força o d20Roll no input para garantir sucesso absoluto
		const d20Input = container.querySelector(
			"input[type='number']",
		) as HTMLInputElement;
		if (d20Input) {
			d20Input.value = "20";
			d20Input.dispatchEvent(new Event("input", { bubbles: true }));
		}

		await vi.waitFor(() => {
			expect(resolveBtn.disabled).toBe(false);
		});
		resolveBtn.click();

		await vi.waitFor(() => {
			expect(updatedGold).toBe(700); // 500 + 200 (recompensa)
			expect(mockDatabase.squads[0]?.status).not.toBe("on_mission");
			expect(container.innerHTML).toContain("Missão concluída com sucesso");
		});

		unmount(component);
		container.remove();
	});

	it("deve despachar esquadrão em missão com clock e resolver com falha/morte", async () => {
		mockDatabase.companies.push({
			id: "comp-active",
			bastionId: "bastion-1",
			tier: 1,
			reputation: 0,
			hqName: "Guarnição Alpha",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		mockDatabase.squads.push({
			id: "squad-1",
			companyId: "comp-active",
			name: "Expedicionários",
			physical: 1,
			mental: 1,
			social: 1,
			cohesionMax: 4,
			cohesionCurrent: 1, // Coesão baixa para forçar morte em falha catastrófica (tática cruel causa 1 de dano)
			tagsJson: "[]",
			commandTactic: "cruel",
			status: "available",
			assignedMissionId: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(MercenaryCompanyPanel, {
			target: container,
			props: {
				guildGold: 500,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Expedicionários");
		});

		// Selecionar esquadrão no dropdown
		const selects = container.querySelectorAll("select");
		const squadSelect = selects[1] as HTMLSelectElement;
		squadSelect.selectedIndex = 1;
		squadSelect.value = "squad-1";
		if (squadSelect.options[1]) squadSelect.options[1].selected = true;
		squadSelect.dispatchEvent(new Event("change", { bubbles: true }));

		// Clica em "Enviar Esquadrão"
		const sendBtn = Array.from(container.querySelectorAll("button")).find((b) =>
			b.textContent?.includes("Enviar Esquadrão"),
		) as HTMLButtonElement;
		expect(sendBtn).toBeTruthy();

		await vi.waitFor(() => {
			expect(sendBtn.disabled).toBe(false);
		});
		sendBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Missão em Andamento");
		});

		// Conclui o clock no banco
		const failClock = mockDatabase.clocks[0];
		if (failClock) {
			failClock.isCompleted = true;
			failClock.filledSegments = 4;
		}

		// Atualiza o relógio na UI chamando loadData do componente
		await (
			component as unknown as { loadData?: () => Promise<void> }
		).loadData?.();

		// Força rolagem d20 muito baixa (ex: 1) para falha catastrófica
		const d20Input = container.querySelector(
			"input[type='number']",
		) as HTMLInputElement;
		if (d20Input) {
			d20Input.value = "1";
			d20Input.dispatchEvent(new Event("input", { bubbles: true }));
		}

		const resolveBtn = Array.from(container.querySelectorAll("button")).find(
			(b) => b.textContent?.includes("Resolver Missão"),
		) as HTMLButtonElement;
		expect(resolveBtn).toBeTruthy();

		await vi.waitFor(() => {
			expect(resolveBtn.disabled).toBe(false);
		});
		resolveBtn.click();

		await vi.waitFor(() => {
			expect(mockDatabase.squads[0]?.status).toBe("dead");
			expect(container.innerHTML).toContain("falhou na missão");
			expect(container.innerHTML).toContain("DESTRUÍDO");
		});

		unmount(component);
		container.remove();
	});
});
