// @vitest-environment happy-dom

import { mount, unmount } from "svelte";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { CharacterRecord } from "$lib/entities/character/model/characterSchema";
import type { InvestigationRecord } from "$lib/entities/investigation/model/investigationSchema";
import type { SaveGameSnapshot } from "$lib/shared/rpc";
import { rpcCache } from "$lib/shared/rpc";
import InvestigationPanel from "../ui/InvestigationPanel.svelte";

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
	activeInvestigations: InvestigationRecord[];
	gameSnapshot: SaveGameSnapshot;
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

						case "LIST_ACTIVE_INVESTIGATIONS":
							success = true;
							data = mockDatabase.activeInvestigations;
							break;

						case "LOAD_GAME_SNAPSHOT":
							success = true;
							data = { snapshot: mockDatabase.gameSnapshot };
							break;

						case "SAVE_GAME_SNAPSHOT":
							success = true;
							mockDatabase.gameSnapshot = (
								request.payload as unknown as { snapshot: SaveGameSnapshot }
							).snapshot;
							data = {};
							break;

						case "SAVE_INVESTIGATION": {
							success = true;
							const record = (
								request.payload as unknown as {
									investigation: Partial<InvestigationRecord>;
								}
							).investigation;
							const idx = mockDatabase.activeInvestigations.findIndex(
								(x) => x.id === record.id,
							);
							if (idx >= 0) {
								mockDatabase.activeInvestigations[idx] = {
									...mockDatabase.activeInvestigations[idx],
									...record,
									updatedAt: new Date().toISOString(),
								} as InvestigationRecord;
								data = mockDatabase.activeInvestigations[idx];
							} else {
								const newRecord: InvestigationRecord = {
									id: record.id || `inv-${++mockIdCounter}`,
									targetId: record.targetId || "",
									targetName: record.targetName || "",
									type: (record.type || "short_rest") as
										| "short_rest"
										| "weekly_metropolis",
									tier: record.tier || 1,
									dc: record.dc || 10,
									successesRequired: record.successesRequired || 3,
									successesAccumulated: record.successesAccumulated || 0,
									failuresMax: record.failuresMax || 1,
									failuresAccumulated: record.failuresAccumulated || 0,
									goldCostPerTest: record.goldCostPerTest || 0,
									translatedPercent: record.translatedPercent || 0,
									discoveredSecrets: record.discoveredSecrets || "",
									status: (record.status || "active") as
										| "active"
										| "completed_perfect"
										| "failed",
									createdAt: new Date().toISOString(),
									updatedAt: new Date().toISOString(),
								};
								mockDatabase.activeInvestigations.push(newRecord);
								data = newRecord;
							}
							break;
						}

						case "FIND_INVESTIGATION": {
							const searchId = (request.payload as { id: string }).id;
							const inv = mockDatabase.activeInvestigations.find(
								(x) => x.id === searchId,
							);
							if (inv) {
								success = true;
								data = inv;
							} else {
								success = false;
								error = {
									code: "NOT_FOUND",
									message: "Investigation not found",
								};
							}
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

describe("InvestigationPanel (UI Reativa Svelte 5)", () => {
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
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
		{
			id: "char-silas",
			name: "Silas",
			concept: "Mercador Ladino",
			ancestryId: "human",
			classId: "rogue",
			backgroundId: "merchant",
			level: 2,
			experiencePoints: 500,
			tensionMeter: 5,
			physical: 1,
			mental: 3,
			social: 4,
			conflict: 3,
			interaction: 4,
			resistance: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
	];

	beforeEach(() => {
		mockDatabase = {
			activeInvestigations: [],
			gameSnapshot: {
				version: 1,
				savedAt: new Date().toISOString(),
				characters: [],
				worldState: [],
			},
		};
		localStorage.clear();
		// Invalida e limpa o cache RPC global entre os testes
		rpcCache.invalidate("CLEAR_CACHE_FOR_TESTS");
	});

	it("deve montar o painel e exibir abas e estado inicial vazio", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(InvestigationPanel, {
			target: container,
			props: {
				characters: mockCharacters,
			},
		});

		// Aguarda o onMount carregar do repositório
		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Investigação &amp; Descoberta");
			expect(container.innerHTML).toContain("Reserva de Insight do Grupo");
			expect(container.innerHTML).toContain(
				"Nenhuma pesquisa sendo executada no momento.",
			);
		});

		unmount(component);
		container.remove();
	});

	it("deve alternar para a aba de pistas, adicionar pistas de demo e conectar com sucesso", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(InvestigationPanel, {
			target: container,
			props: {
				characters: mockCharacters,
			},
		});

		// Aguarda montar
		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Investigação &amp; Descoberta");
		});

		// Muda para aba de pistas
		const cluesTab = container.querySelector(
			'[data-testid="tab-clues"]',
		) as HTMLButtonElement;
		expect(cluesTab).toBeTruthy();
		cluesTab.click();

		// Aguarda a aba ser atualizada na UI e exibir o botão de adicionar pistas de demonstração
		await vi.waitFor(() => {
			expect(
				container.querySelector('[data-testid="add-demo-clues-btn"]'),
			).toBeTruthy();
		});

		// Adiciona pistas de demonstração
		const addDemoBtn = container.querySelector(
			'[data-testid="add-demo-clues-btn"]',
		) as HTMLButtonElement;
		addDemoBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Inventário Secreto do Silas");
			expect(container.innerHTML).toContain("Inscrição Rúnica do Amuleto");
			expect(container.innerHTML).toContain("Receita do Elixir das Névoas");
			expect(container.innerHTML).toContain("Localização do Bastião Antigo");
		});

		// Seleciona duas pistas: Amuleto e Localização do Bastião
		const amuletBtn = container.querySelector(
			'[data-testid="clue-item-clue-magic-amulet"]',
		) as HTMLButtonElement;
		const bastionBtn = container.querySelector(
			'[data-testid="clue-item-clue-bastion-location"]',
		) as HTMLButtonElement;
		expect(amuletBtn).toBeTruthy();
		expect(bastionBtn).toBeTruthy();

		amuletBtn.click();
		bastionBtn.click();

		// Aguarda a UI atualizar o estado habilitado do botão de conectar
		await vi.waitFor(() => {
			const connectBtn = container.querySelector(
				'[data-testid="connect-clues-btn"]',
			) as HTMLButtonElement;
			expect(connectBtn.disabled).toBe(false);
		});

		// Conecta as pistas
		const connectBtn = container.querySelector(
			'[data-testid="connect-clues-btn"]',
		) as HTMLButtonElement;
		connectBtn.click();

		// Deve concluir a dedução do Segredo de Selen-Ghar
		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Nova dedução concluída: Dedução: O Segredo de Selen-Ghar!",
			);
			expect(container.innerHTML).toContain(
				"A chave rúnica foi decifrada e o cofre do Bastião pode ser aberto.",
			);
		});

		unmount(component);
		container.remove();
	});

	it("deve permitir outra conexão bem-sucedida: Inventário Secreto + Receita de Elixir", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(InvestigationPanel, {
			target: container,
			props: {
				characters: mockCharacters,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Investigação &amp; Descoberta");
		});

		const cluesTab = container.querySelector(
			'[data-testid="tab-clues"]',
		) as HTMLButtonElement;
		cluesTab.click();

		// Aguarda transição da aba
		await vi.waitFor(() => {
			expect(
				container.querySelector('[data-testid="add-demo-clues-btn"]'),
			).toBeTruthy();
		});

		const addDemoBtn = container.querySelector(
			'[data-testid="add-demo-clues-btn"]',
		) as HTMLButtonElement;
		addDemoBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Inventário Secreto do Silas");
		});

		// Seleciona Inventário Secreto + Receita do Elixir
		const inventoryBtn = container.querySelector(
			'[data-testid="clue-item-clue-secret-inventory"]',
		) as HTMLButtonElement;
		const elixirBtn = container.querySelector(
			'[data-testid="clue-item-clue-elixir-mastery"]',
		) as HTMLButtonElement;
		inventoryBtn.click();
		elixirBtn.click();

		// Aguarda habilitar o botão
		await vi.waitFor(() => {
			const connectBtn = container.querySelector(
				'[data-testid="connect-clues-btn"]',
			) as HTMLButtonElement;
			expect(connectBtn.disabled).toBe(false);
		});

		// Conecta
		const connectBtn = container.querySelector(
			'[data-testid="connect-clues-btn"]',
		) as HTMLButtonElement;
		connectBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Dedução: Contrabando Alquímico");
			expect(container.innerHTML).toContain(
				"Eldrin foi exposto por contrabando de éter através da rede de Silas.",
			);
		});

		unmount(component);
		container.remove();
	});

	it("deve tratar falha na conexão de pistas incompatíveis", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(InvestigationPanel, {
			target: container,
			props: {
				characters: mockCharacters,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Investigação &amp; Descoberta");
		});

		const cluesTab = container.querySelector(
			'[data-testid="tab-clues"]',
		) as HTMLButtonElement;
		cluesTab.click();

		await vi.waitFor(() => {
			expect(
				container.querySelector('[data-testid="add-demo-clues-btn"]'),
			).toBeTruthy();
		});

		const addDemoBtn = container.querySelector(
			'[data-testid="add-demo-clues-btn"]',
		) as HTMLButtonElement;
		addDemoBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Inventário Secreto do Silas");
		});

		// Seleciona Inventário Secreto + Localização do Bastião (incompatíveis)
		const inventoryBtn = container.querySelector(
			'[data-testid="clue-item-clue-secret-inventory"]',
		) as HTMLButtonElement;
		const bastionBtn = container.querySelector(
			'[data-testid="clue-item-clue-bastion-location"]',
		) as HTMLButtonElement;
		inventoryBtn.click();
		bastionBtn.click();

		await vi.waitFor(() => {
			const connectBtn = container.querySelector(
				'[data-testid="connect-clues-btn"]',
			) as HTMLButtonElement;
			expect(connectBtn.disabled).toBe(false);
		});

		const connectBtn = container.querySelector(
			'[data-testid="connect-clues-btn"]',
		) as HTMLButtonElement;
		connectBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"As pistas selecionadas não parecem se encaixar de forma lógica na sua mente.",
			);
		});

		unmount(component);
		container.remove();
	});

	it("deve impedir conexão de deduções já concluídas anteriormente", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(InvestigationPanel, {
			target: container,
			props: {
				characters: mockCharacters,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Investigação &amp; Descoberta");
		});

		const cluesTab = container.querySelector(
			'[data-testid="tab-clues"]',
		) as HTMLButtonElement;
		cluesTab.click();

		await vi.waitFor(() => {
			expect(
				container.querySelector('[data-testid="add-demo-clues-btn"]'),
			).toBeTruthy();
		});

		const addDemoBtn = container.querySelector(
			'[data-testid="add-demo-clues-btn"]',
		) as HTMLButtonElement;
		addDemoBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Inventário Secreto do Silas");
		});

		// Conecta a primeira vez
		const amuletBtn = container.querySelector(
			'[data-testid="clue-item-clue-magic-amulet"]',
		) as HTMLButtonElement;
		const bastionBtn = container.querySelector(
			'[data-testid="clue-item-clue-bastion-location"]',
		) as HTMLButtonElement;
		amuletBtn.click();
		bastionBtn.click();

		await vi.waitFor(() => {
			const connectBtn = container.querySelector(
				'[data-testid="connect-clues-btn"]',
			) as HTMLButtonElement;
			expect(connectBtn.disabled).toBe(false);
		});

		const connectBtn = container.querySelector(
			'[data-testid="connect-clues-btn"]',
		) as HTMLButtonElement;
		connectBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Nova dedução concluída: Dedução: O Segredo de Selen-Ghar!",
			);
		});

		// Tenta conectar novamente
		amuletBtn.click();
		bastionBtn.click();

		await vi.waitFor(() => {
			const btn = container.querySelector(
				'[data-testid="connect-clues-btn"]',
			) as HTMLButtonElement;
			expect(btn.disabled).toBe(false);
		});

		const connectAgainBtn = container.querySelector(
			'[data-testid="connect-clues-btn"]',
		) as HTMLButtonElement;
		connectAgainBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Você já desvendou essa dedução anteriormente!",
			);
		});

		unmount(component);
		container.remove();
	});

	it("deve permitir deselecionar uma pista e limitar seleção a no máximo duas", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(InvestigationPanel, {
			target: container,
			props: {
				characters: mockCharacters,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Investigação &amp; Descoberta");
		});

		const cluesTab = container.querySelector(
			'[data-testid="tab-clues"]',
		) as HTMLButtonElement;
		cluesTab.click();

		await vi.waitFor(() => {
			expect(
				container.querySelector('[data-testid="add-demo-clues-btn"]'),
			).toBeTruthy();
		});

		const addDemoBtn = container.querySelector(
			'[data-testid="add-demo-clues-btn"]',
		) as HTMLButtonElement;
		addDemoBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Inventário Secreto do Silas");
		});

		const inventoryBtn = container.querySelector(
			'[data-testid="clue-item-clue-secret-inventory"]',
		) as HTMLButtonElement;
		const elixirBtn = container.querySelector(
			'[data-testid="clue-item-clue-elixir-mastery"]',
		) as HTMLButtonElement;
		const amuletBtn = container.querySelector(
			'[data-testid="clue-item-clue-magic-amulet"]',
		) as HTMLButtonElement;

		// Seleciona e deseleciona o inventário
		inventoryBtn.click();
		await vi.waitFor(() => {
			expect(inventoryBtn.innerHTML).toContain("✔️"); // Há elemento marcado
		});
		inventoryBtn.click();
		await vi.waitFor(() => {
			expect(inventoryBtn.innerHTML).not.toContain("✔️");
		});

		// Seleciona 3 seguidos. O primeiro deve cair fora, mantendo no máximo dois
		inventoryBtn.click();
		elixirBtn.click();
		amuletBtn.click(); // Deve derrubar inventoryBtn e manter elixirBtn + amuletBtn

		// Clica em conectar (deve falhar porque elixir + amuleto são incompatíveis)
		await vi.waitFor(() => {
			const connectBtn = container.querySelector(
				'[data-testid="connect-clues-btn"]',
			) as HTMLButtonElement;
			expect(connectBtn.disabled).toBe(false);
		});

		const connectBtn = container.querySelector(
			'[data-testid="connect-clues-btn"]',
		) as HTMLButtonElement;
		connectBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"As pistas selecionadas não parecem se encaixar de forma lógica na sua mente.",
			);
		});

		unmount(component);
		container.remove();
	});

	it("deve gerenciar projetos de pesquisa ativos", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(InvestigationPanel, {
			target: container,
			props: {
				characters: mockCharacters,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Investigação &amp; Descoberta");
		});

		// Seleciona monstro Serpente das Sombras e tipo de pesquisa
		const startBtn = container.querySelector(
			'[data-testid="start-project-btn"]',
		) as HTMLButtonElement;
		expect(startBtn).toBeTruthy();
		startBtn.click();

		// Deve aparecer a pesquisa ativa do monstro
		await vi.waitFor(() => {
			// Aguarda a renderização do relógio de progresso que é exclusivo do card ativo
			expect(container.innerHTML).toContain("Sucessos Requeridos:");
			expect(container.innerHTML).toContain("Serpente das Sombras (Tier 1)");
			expect(container.innerHTML).toContain("0 / 3"); // 0 de 3 sucessos requeridos
		});

		// Impede iniciar a mesma pesquisa novamente
		startBtn.click();
		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Já existe uma investigação em andamento para este monstro!",
			);
		});

		unmount(component);
		container.remove();
	});

	it("deve realizar rolagens de teste de pesquisa e atualizar progresso", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(InvestigationPanel, {
			target: container,
			props: {
				characters: mockCharacters,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Investigação &amp; Descoberta");
		});

		// Inicia projeto
		const startBtn = container.querySelector(
			'[data-testid="start-project-btn"]',
		) as HTMLButtonElement;
		startBtn.click();

		// Aguarda o card renderizar de verdade
		await vi.waitFor(() => {
			expect(container.querySelector(".btn-roll")).toBeTruthy();
		});

		// Realiza rolagem
		const rollBtn = container.querySelector(".btn-roll") as HTMLButtonElement;
		rollBtn.click();

		// Aguarda o término da animação física simulada (8 tiques de 100ms = ~800ms)
		// e a gravação de volta no repositório.
		await vi.waitFor(
			() => {
				// Como o dado final d20 é aleatório e mockado no getSecureRandom
				// que usa crypto.getRandomValues, deve conter a mensagem de log de pesquisa
				expect(container.innerHTML).toContain("[Pesquisa]");
			},
			{ timeout: 5000 },
		);

		unmount(component);
		container.remove();
	});

	it("deve permitir usar e limpar tokens de insight", async () => {
		// Inicializa o banco com tokens de insight ativos
		mockDatabase.gameSnapshot = {
			version: 1,
			savedAt: new Date().toISOString(),
			characters: [],
			worldState: [
				{
					key: "plot:insight_target_id",
					value: "serpente_sombras",
					updatedAt: new Date().toISOString(),
				},
				{
					key: "plot:insight_tokens_count",
					value: 2,
					updatedAt: new Date().toISOString(),
				},
			],
		};

		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(InvestigationPanel, {
			target: container,
			props: {
				characters: mockCharacters,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Serpente das Sombras (Tier 1)");
			expect(container.innerHTML).toContain("(2 / 3)");
		});

		// Consome um token
		const consumeBtn = container.querySelector(
			".insight-panel .btn-primary",
		) as HTMLButtonElement;
		expect(consumeBtn).toBeTruthy();
		consumeBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Token de Insight gasto!");
			expect(container.innerHTML).toContain("(1 / 3)");
		});

		// Limpa o foco
		const clearBtn = container.querySelector(
			".insight-panel .btn-outline",
		) as HTMLButtonElement;
		expect(clearBtn).toBeTruthy();
		clearBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Foco de Insight limpo!");
			expect(container.innerHTML).toContain(
				"Nenhuma reserva de insight ativa.",
			);
		});

		unmount(component);
		container.remove();
	});
});
