// @vitest-environment happy-dom

import { mount, unmount } from "svelte";
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import type { CharacterRecord } from "../../../entities/character";
import type { CompanionRecord } from "../../../entities/companions";
import type { EspionageCellRecord } from "../../../entities/espionage";
import type {
	CampaignSocialLedgerRecord,
	FactionRecord,
} from "../../../entities/social";
import { rpcCache } from "../../../shared/rpc";
import EspionageTestWrapper from "./EspionageTestWrapper.svelte";

interface FakeWorldStateFlag {
	key: string;
	valueJson: string;
	updatedAt: string;
}

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

const TEST_TIMESTAMP = "2026-06-12T12:00:00.000Z";

let mockDatabase: {
	cells: EspionageCellRecord[];
	factions: FactionRecord[];
	companions: CompanionRecord[];
	worldState: FakeWorldStateFlag[];
	ledger: CampaignSocialLedgerRecord;
};

const mockCharacters: CharacterRecord[] = [
	{
		id: "char-eldrin",
		name: "Eldrin",
		concept: "Mago de Batalha",
		ancestryId: "elf",
		classId: "wizard",
		backgroundId: "scholar",
		level: 3,
		experiencePoints: 1000,
		tensionMeter: 10,
		physical: 2,
		mental: 4,
		social: 3,
		conflict: 2,
		interaction: 3,
		resistance: 2,
		createdAt: TEST_TIMESTAMP,
		updatedAt: TEST_TIMESTAMP,
	},
];

class FakeCharacterRepository {
	public async findById(id: string) {
		const char = mockCharacters.find((c) => c.id === id);
		if (char) {
			return { success: true, data: char };
		}
		return {
			success: false,
			error: { code: "NOT_FOUND", message: "Not found" },
		};
	}
	public async save(char: CharacterRecord) {
		const idx = mockCharacters.findIndex((c) => c.id === char.id);
		if (idx >= 0) {
			mockCharacters[idx] = char;
		}
		return { success: true, data: char };
	}
}

beforeAll(() => {
	// Mock de alertas para evitar travamentos
	globalThis.alert = vi.fn();

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

	globalThis.Worker = class {
		public onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null =
			null;

		public postMessage = (request: FakeWorkerRequest) => {
			queueMicrotask(() => {
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

						case "LIST_ESPIONAGE_CELLS":
							success = true;
							data = mockDatabase.cells.filter(
								(c) => c.campaignId === request.payload.campaignId,
							);
							break;

						case "SAVE_ESPIONAGE_CELL": {
							success = true;
							const cell = request.payload.cell;
							const existingIndex = mockDatabase.cells.findIndex(
								(c) => c.id === cell.id,
							);
							const cellToSave = {
								...cell,
								isLockdown: !!cell.isLockdown,
								lockdownWeeksRemaining: Number(
									cell.lockdownWeeksRemaining ?? 0,
								),
								vigilanceHeat: Number(cell.vigilanceHeat ?? 0),
								tier: Number(cell.tier ?? 1),
								updatedAt: new Date().toISOString(),
							};
							if (existingIndex >= 0) {
								mockDatabase.cells[existingIndex] = cellToSave;
							} else {
								mockDatabase.cells.push(cellToSave);
							}
							data = cellToSave;
							break;
						}

						case "FIND_ESPIONAGE_CELL": {
							const found = mockDatabase.cells.find(
								(c) => c.id === request.payload.id,
							);
							if (found) {
								success = true;
								data = found;
							} else {
								success = false;
								error = { code: "CELL_NOT_FOUND", message: "Cell not found" };
							}
							break;
						}

						case "DELETE_ESPIONAGE_CELL":
							success = true;
							mockDatabase.cells = mockDatabase.cells.filter(
								(c) => c.id !== request.payload.id,
							);
							data = {};
							break;

						case "LIST_FACTIONS":
							success = true;
							data = mockDatabase.factions;
							break;

						case "FIND_FACTION":
							success = true;
							data = mockDatabase.factions.find(
								(f) => f.id === request.payload.id,
							);
							break;

						case "SAVE_FACTION": {
							success = true;
							const faction = request.payload.faction;
							const existingIdx = mockDatabase.factions.findIndex(
								(f) => f.id === faction.id,
							);
							if (existingIdx >= 0) {
								mockDatabase.factions[existingIdx] = faction;
							} else {
								mockDatabase.factions.push(faction);
							}
							data = faction;
							break;
						}

						case "FIND_SOCIAL_LEDGER":
							success = true;
							data = mockDatabase.ledger;
							break;

						case "SAVE_SOCIAL_LEDGER":
							success = true;
							mockDatabase.ledger = request.payload.ledger;
							data = request.payload.ledger;
							break;

						case "LIST_COMPANIONS":
							success = true;
							data = mockDatabase.companions.filter(
								(c) => c.characterId === request.payload.characterId,
							);
							break;

						case "FIND_COMPANION":
							success = true;
							data = mockDatabase.companions.find(
								(c) => c.id === request.payload.id,
							);
							break;

						case "SAVE_COMPANION": {
							success = true;
							const companion = request.payload.companion;
							const existingIdx = mockDatabase.companions.findIndex(
								(c) => c.id === companion.id,
							);
							if (existingIdx >= 0) {
								mockDatabase.companions[existingIdx] = companion;
							} else {
								mockDatabase.companions.push(companion);
							}
							data = companion;
							break;
						}

						case "GET_WORLD_STATE_FLAG": {
							const entry = mockDatabase.worldState.find(
								(w) => w.key === request.payload.key,
							);
							if (entry) {
								success = true;
								data = entry;
							} else {
								success = false;
								error = { code: "NOT_FOUND", message: "Flag not found" };
							}
							break;
						}

						case "SET_WORLD_STATE_FLAG": {
							success = true;
							const flag = request.payload as FakeWorldStateFlag;
							const existingIdx = mockDatabase.worldState.findIndex(
								(w) => w.key === flag.key,
							);
							if (existingIdx >= 0) {
								mockDatabase.worldState[existingIdx] = flag;
							} else {
								mockDatabase.worldState.push(flag);
							}
							data = flag;
							break;
						}

						case "LIST_WORLD_STATE_FLAGS": {
							const prefix = request.payload.prefix;
							data = mockDatabase.worldState.filter((w) =>
								w.key.startsWith(prefix),
							);
							success = true;
							break;
						}

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
			});
		};

		public addEventListener = vi.fn();
		public removeEventListener = vi.fn();
		public terminate = vi.fn();
	} as unknown as new () => Worker;

	// Mock do localStorage
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

describe("EspionageManagementPanel (UI Reativa Svelte 5)", () => {
	beforeEach(() => {
		(globalThis as any).isVitestTestEnvironment = true;
		mockDatabase = {
			cells: [],
			factions: [
				{
					id: "faction_1",
					name: "Guilda dos Ladrões",
					description: "Guilda dos Ladrões",
					alignment: "chaos",
				},
				{
					id: "faction_2",
					name: "Nobres Sombrios",
					description: "Nobres Sombrios",
					alignment: "neutral",
				},
			],
			companions: [
				{
					id: "tenente_1",
					characterId: "char-eldrin",
					name: "Bob",
					type: "scout",
					subModel: "Furtivo",
					tier: 2,
					hpCurrent: 15,
					hpMax: 15,
					isShareSensory: false,
					isDissipated: false,
					selectedTraitsJson: "[]",
					createdAt: TEST_TIMESTAMP,
					updatedAt: TEST_TIMESTAMP,
				},
			],
			worldState: [
				{
					key: "location:current_time",
					valueJson: JSON.stringify({ day: 1, turn: 1, phase: "manha" }),
					updatedAt: TEST_TIMESTAMP,
				},
				{
					key: "location:espionage_last_recess_day",
					valueJson: JSON.stringify(1),
					updatedAt: TEST_TIMESTAMP,
				},
			],
			ledger: {
				id: "campaign_default",
				fameXp: 100,
				fameLevel: 1,
				favorPoints: 5,
				updatedAt: TEST_TIMESTAMP,
			},
		};

		localStorage.clear();
		rpcCache.invalidate("CLEAR_CACHE_FOR_TESTS");
		vi.clearAllMocks();
	});

	it("deve montar o painel e exibir estado inicial vazio sem celulas", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(EspionageTestWrapper, {
			target: container,
			props: {
				initialGold: 1000,
				characters: mockCharacters,
				characterSession: { repository: new FakeCharacterRepository() },
				isTest: true,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("CÓDICE DE ESPIONAGEM: A TEIA");
			expect(container.innerHTML).toContain(
				"Nenhuma célula fundada nesta campanha.",
			);
			expect(container.innerHTML).toContain("1000 PO"); // ouro total
			expect(container.innerHTML).toContain("5F"); // 5 favores
		});

		unmount(component);
		container.remove();
	});

	it("deve fundar celula com sucesso deduzindo gold e favores", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(EspionageTestWrapper, {
			target: container,
			props: {
				initialGold: 1000,
				characters: mockCharacters,
				characterSession: { repository: new FakeCharacterRepository() },
				isTest: true,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Nenhuma célula fundada nesta campanha.",
			);
		});

		// Abre o form
		const buttons = Array.from(container.querySelectorAll("button"));
		const toggleFormBtn = buttons.find((b) =>
			b.textContent?.includes("Fundar Nova Célula"),
		);
		expect(toggleFormBtn).toBeTruthy();
		toggleFormBtn?.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Fundar Nova Célula de Espionagem");
			const factionSelect = container.querySelector(
				"#faction-select",
			) as HTMLSelectElement;
			const tenenteSelect = container.querySelector(
				"#tenente-select",
			) as HTMLSelectElement;
			expect(factionSelect?.options.length).toBeGreaterThan(1);
			expect(tenenteSelect?.options.length).toBeGreaterThan(1);
		});

		// Preenche formulário
		const factionSelect = container.querySelector(
			"#faction-select",
		) as HTMLSelectElement;
		const regionInput = container.querySelector(
			"#region-input",
		) as HTMLInputElement;
		const tenenteSelect = container.querySelector(
			"#tenente-select",
		) as HTMLSelectElement;
		const axisSelect = container.querySelector(
			"#axis-select",
		) as HTMLSelectElement;
		const tierSelect = container.querySelector(
			'select[aria-label="Tier da Região"]',
		) as HTMLSelectElement;

		expect(factionSelect).toBeTruthy();
		expect(regionInput).toBeTruthy();
		expect(tenenteSelect).toBeTruthy();
		expect(axisSelect).toBeTruthy();
		expect(tierSelect).toBeTruthy();

		const selectOption = (select: HTMLSelectElement, val: string) => {
			console.log(
				"[DEBUG TEST HELPER] selectOption chamado para",
				select.id || select.getAttribute("aria-label"),
				"com valor",
				val,
			);
			console.log(
				"[DEBUG TEST HELPER] options disponíveis:",
				Array.from(select.options).map((o) => o.value),
			);
			const idx = Array.from(select.options).findIndex(
				(opt) => opt.value === val,
			);
			console.log("[DEBUG TEST HELPER] index encontrado:", idx);
			if (idx >= 0) {
				select.selectedIndex = idx;
				const option = select.options[idx];
				if (option) {
					option.selected = true;
				}
				select.value = val;
				console.log(
					"[DEBUG TEST HELPER] valor atribuído com sucesso. Novo select.value:",
					select.value,
				);
			} else {
				console.log("[DEBUG TEST HELPER] falha ao encontrar valor no select!");
			}
			select.dispatchEvent(new Event("change", { bubbles: true }));
		};

		// Seta valores
		selectOption(factionSelect, "faction_1");

		regionInput.value = "Distrito Leste";
		regionInput.dispatchEvent(new Event("input", { bubbles: true }));

		selectOption(tenenteSelect, "tenente_1");
		selectOption(axisSelect, "mental");
		selectOption(tierSelect, "tier-2");

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				'Custo de Fundação: <span class="text-[#fbbf24] font-semibold">200 PO</span> e <span class="text-[#22d3ee] font-semibold">3 Favores</span>.',
			);
		});

		// Clica em confirmar fundação
		const confirmBtn = Array.from(container.querySelectorAll("button")).find(
			(b) => b.textContent?.includes("Confirmar Fundação"),
		);
		expect(confirmBtn).toBeTruthy();
		confirmBtn?.click();

		await vi.waitFor(() => {
			// A célula foi criada e exibida na teia
			expect(container.innerHTML).toContain(
				"Região de Distrito Leste (Tier 2)",
			);
			expect(container.innerHTML).toContain("Guilda dos Ladrões");
			// Gold decrementado: 1000 - (100 * tier 2) = 800 PO
			expect(container.innerHTML).toContain("800 PO");
			// Favores decrementados: 5 - 3 = 2
			expect(container.innerHTML).toContain("2F");
		});

		unmount(component);
		container.remove();
	});

	it("deve rodar missao autonoma com sucesso e sem suborno", async () => {
		mockDatabase.cells.push({
			id: "cell_1",
			campaignId: "campaign_default",
			factionId: "faction_1",
			regionId: "Distrito Leste",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "mental",
			tier: 2,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(EspionageTestWrapper, {
			target: container,
			props: {
				initialGold: 1000,
				characters: mockCharacters,
				characterSession: { repository: new FakeCharacterRepository() },
				isTest: true,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Região de Distrito Leste (Tier 2)",
			);
		});

		// Acha o card da célula e o botão Rodar Missão
		const cellCards = Array.from(container.querySelectorAll(".grid > div"));
		const cellCard = cellCards.find((card) =>
			card.innerHTML.includes("Região de Distrito Leste"),
		);
		expect(cellCard).toBeTruthy();

		const runBtn = Array.from(cellCard!.querySelectorAll("button")).find((b) =>
			b.textContent?.includes("Rodar Missão"),
		);
		expect(runBtn).toBeTruthy();
		runBtn?.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Preparar Operação");
		});

		vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
			if (array instanceof Uint32Array) {
				array[0] = 17; // 17 % 20 + 1 = 18
			}
			return array;
		});

		const autonomousBtn = Array.from(container.querySelectorAll("button")).find(
			(b) => b.textContent?.includes("Autônoma"),
		);
		expect(autonomousBtn).toBeTruthy();
		autonomousBtn?.click();

		await vi.waitFor(() => {
			expect(container.textContent).toContain("MISSÃO CONCLUÍDA!");
			expect(container.textContent).toContain("d20 (18)");
			expect(container.textContent).toContain("Total com Bônus: 20");
		});

		const closeReportBtn = Array.from(
			container.querySelectorAll("button"),
		).find((b) => b.textContent?.includes("Fechar Relatório"));
		expect(closeReportBtn).toBeTruthy();
		closeReportBtn?.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).not.toContain("MISSÃO CONCLUÍDA!");
		});

		unmount(component);
		container.remove();
	});

	it("deve rodar missao autonoma resultando em falha critica e dissipando tenente", async () => {
		mockDatabase.cells.push({
			id: "cell_1",
			campaignId: "campaign_default",
			factionId: "faction_1",
			regionId: "Distrito Leste",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "mental",
			tier: 2,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(EspionageTestWrapper, {
			target: container,
			props: {
				initialGold: 1000,
				characters: mockCharacters,
				characterSession: { repository: new FakeCharacterRepository() },
				isTest: true,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Região de Distrito Leste (Tier 2)",
			);
		});

		const cellCards = Array.from(container.querySelectorAll(".grid > div"));
		const cellCard = cellCards.find((card) =>
			card.innerHTML.includes("Região de Distrito Leste"),
		);
		const runBtn = Array.from(cellCard!.querySelectorAll("button")).find((b) =>
			b.textContent?.includes("Rodar Missão"),
		);
		runBtn?.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Preparar Operação");
		});

		vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
			if (array instanceof Uint32Array) {
				array[0] = 0; // d20 = 1
			}
			return array;
		});

		const autonomousBtn = Array.from(container.querySelectorAll("button")).find(
			(b) => b.textContent?.includes("Autônoma"),
		);
		autonomousBtn?.click();

		await vi.waitFor(() => {
			expect(container.textContent).toContain("FALHA OPERACIONAL");
			expect(container.textContent).toContain("d20 (1)");
		});

		const closeReportBtn = Array.from(
			container.querySelectorAll("button"),
		).find((b) => b.textContent?.includes("Fechar Relatório"));
		closeReportBtn?.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Nenhuma célula fundada nesta campanha.",
			);
			expect(mockDatabase.companions[0]?.isDissipated).toBe(true);
		});

		unmount(component);
		container.remove();
	});

	it("deve rodar missao coordenada com sucesso", async () => {
		mockDatabase.cells.push({
			id: "cell_1",
			campaignId: "campaign_default",
			factionId: "faction_1",
			regionId: "Distrito Leste",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "social",
			tier: 2,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(EspionageTestWrapper, {
			target: container,
			props: {
				initialGold: 1000,
				characters: mockCharacters,
				characterSession: { repository: new FakeCharacterRepository() },
				isTest: true,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Região de Distrito Leste (Tier 2)",
			);
		});

		const cellCards = Array.from(container.querySelectorAll(".grid > div"));
		const cellCard = cellCards.find((card) =>
			card.innerHTML.includes("Região de Distrito Leste"),
		);
		const runBtn = Array.from(cellCard!.querySelectorAll("button")).find((b) =>
			b.textContent?.includes("Rodar Missão"),
		);
		runBtn?.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Preparar Operação");
		});

		vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
			if (array instanceof Uint32Array) {
				array[0] = 9; // d20 = 10
			}
			return array;
		});

		const coordinatedBtn = Array.from(
			container.querySelectorAll("button"),
		).find((b) => b.textContent?.includes("Coordenada"));
		coordinatedBtn?.click();

		await vi.waitFor(() => {
			expect(container.textContent).toContain("MISSÃO CONCLUÍDA!");
			expect(container.textContent).toContain("d20 (10)");
			expect(container.textContent).toContain("Total com Bônus: 18");
		});

		unmount(component);
		container.remove();
	});

	it("deve resfriar a celula colocando em lockdown e reduzindo heat", async () => {
		mockDatabase.cells.push({
			id: "cell_1",
			campaignId: "campaign_default",
			factionId: "faction_1",
			regionId: "Distrito Leste",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 1,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 2,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(EspionageTestWrapper, {
			target: container,
			props: {
				initialGold: 1000,
				characters: mockCharacters,
				characterSession: { repository: new FakeCharacterRepository() },
				isTest: true,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Região de Distrito Leste (Tier 1)",
			);
		});

		const cellCards = Array.from(container.querySelectorAll(".grid > div"));
		const cellCard = cellCards.find((card) =>
			card.innerHTML.includes("Região de Distrito Leste"),
		);
		const coolDownBtn = Array.from(cellCard!.querySelectorAll("button")).find(
			(b) => b.textContent?.includes("Resfriar"),
		);
		expect(coolDownBtn).toBeTruthy();
		coolDownBtn?.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Lockdown: 1 sem.");
			expect(container.innerHTML).toContain("H1");
		});

		unmount(component);
		container.remove();
	});

	it("deve limpar heat gastando ouro e depois favores", async () => {
		mockDatabase.cells.push({
			id: "cell_1",
			campaignId: "campaign_default",
			factionId: "faction_1",
			regionId: "Distrito Leste",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 2,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 3,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(EspionageTestWrapper, {
			target: container,
			props: {
				initialGold: 1000,
				characters: mockCharacters,
				characterSession: { repository: new FakeCharacterRepository() },
				isTest: true,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Região de Distrito Leste (Tier 2)",
			);
		});

		// 1. Limpar com Ouro
		const cellCards = Array.from(container.querySelectorAll(".grid > div"));
		let cellCard = cellCards.find((card) =>
			card.innerHTML.includes("Região de Distrito Leste"),
		);
		const clearGoldBtn = Array.from(cellCard!.querySelectorAll("button")).find(
			(b) => b.textContent?.includes("🧹 Limpar"),
		);
		expect(clearGoldBtn).toBeTruthy();
		clearGoldBtn?.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("800 PO");
			expect(container.innerHTML).toContain("H1");
		});

		// 2. Limpar com Favor
		cellCard = Array.from(container.querySelectorAll(".grid > div")).find(
			(card) => card.innerHTML.includes("Região de Distrito Leste"),
		)!;
		const clearFavorBtn = Array.from(cellCard.querySelectorAll("button")).find(
			(b) => b.textContent?.includes("🗣️ Limpar"),
		);
		expect(clearFavorBtn).toBeTruthy();
		clearFavorBtn?.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("4F");
			expect(container.innerHTML).toContain("H0");
		});

		unmount(component);
		container.remove();
	});
});
