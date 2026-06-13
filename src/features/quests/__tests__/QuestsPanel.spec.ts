// @vitest-environment happy-dom

import { mount, unmount } from "svelte";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { QuestService } from "$lib/entities/quest/domain/QuestService";
import { InMemoryQuestRepository } from "$lib/entities/quest/infrastructure/InMemoryQuestRepository";
import { fail } from "$lib/shared/lib/result";
import QuestsPanel from "../ui/QuestsPanel.svelte";

beforeAll(() => {
	// Mock do Worker do banco SQLite para evitar quebras no import/default props
	globalThis.Worker = class {
		public postMessage = vi.fn();
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

describe("QuestsPanel (UI Reativa Svelte 5)", () => {
	let repository: InMemoryQuestRepository;
	let service: QuestService;

	beforeEach(() => {
		repository = new InMemoryQuestRepository();
		service = new QuestService(repository);
	});

	it("deve montar o painel e exibir estado vazio inicial", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(QuestsPanel, {
			target: container,
			props: {
				repository,
				service,
			},
		});

		// Aguarda o onMount carregar do repositório
		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Diário de Missões");
			expect(container.innerHTML).toContain("Nenhuma missão ativa no diário.");
		});

		unmount(component);
		container.remove();
	});

	it("deve alternar entre abas do diário", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(QuestsPanel, {
			target: container,
			props: {
				repository,
				service,
			},
		});

		// Clica na aba de Boatos & Rumores
		const rumorsTab = container.querySelector(
			'[data-testid="tab-rumors"]',
		) as HTMLButtonElement;
		expect(rumorsTab).toBeTruthy();
		rumorsTab.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Silas o Mercador");
			expect(container.innerHTML).toContain("Flor de Eter");
		});

		unmount(component);
		container.remove();
	});

	it("deve adicionar uma missão de teste através do botão de depuração e listá-la", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(QuestsPanel, {
			target: container,
			props: {
				repository,
				service,
			},
		});

		// Clica no botão de adicionar missão de teste
		const testQuestBtn = container.querySelector(
			'[data-testid="add-test-quest-btn"]',
		) as HTMLButtonElement;
		expect(testQuestBtn).toBeTruthy();
		testQuestBtn.click();

		await vi.waitFor(() => {
			// Deve conter o título da missão criada por handleCreateTestQuest
			expect(container.innerHTML).toContain("Investigar o Bastião Caído");
			expect(container.innerHTML).toContain("Ruínas Baixas no Hexcrawl");
			expect(container.innerHTML).toContain("Guardião Mecânico no Bastião");
		});

		unmount(component);
		container.remove();
	});

	it("deve atualizar o progresso de um objetivo e concluir a quest se todos forem concluídos", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(QuestsPanel, {
			target: container,
			props: {
				repository,
				service,
			},
		});

		// Adiciona a missão de teste primeiro
		const testQuestBtn = container.querySelector(
			'[data-testid="add-test-quest-btn"]',
		) as HTMLButtonElement;
		testQuestBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Investigar o Bastião Caído");
		});

		// Busca a quest salva no repositório para obter os IDs reais dos objetivos
		const quests = repository.quests;
		expect(quests.length).toBe(1);
		const questId = quests[0]?.id;
		const objectives = repository.objectives.filter(
			(o) => o.questId === questId,
		);
		expect(objectives.length).toBe(2);

		const obj1Id = objectives[0]?.id;
		const obj2Id = objectives[1]?.id;

		// Conclui o primeiro objetivo clicando no botão na UI
		const completeObj1Btn = container.querySelector(
			`[data-testid="complete-obj-${obj1Id}"]`,
		) as HTMLButtonElement;
		expect(completeObj1Btn).toBeTruthy();
		completeObj1Btn.click();

		await vi.waitFor(() => {
			// A notificação de sucesso deve aparecer
			expect(container.innerHTML).toContain("Objetivo atualizado/concluído!");
		});

		// O primeiro objetivo agora deve constar como concluído (marcado com tick ✔️)
		// Vamos marcar o segundo objetivo
		const completeObj2Btn = container.querySelector(
			`[data-testid="complete-obj-${obj2Id}"]`,
		) as HTMLButtonElement;
		expect(completeObj2Btn).toBeTruthy();
		completeObj2Btn.click();

		await vi.waitFor(() => {
			// Quando todos os objetivos são concluídos, o service.updateObjectiveProgress
			// chama internamente service.completeQuest(questId), concluindo a missão.
			// O painel atualiza e a missão ativa some da lista
			expect(container.innerHTML).toContain("Nenhuma missão ativa no diário.");
		});

		// Clica na aba de histórico para verificar que a quest está concluída
		const completedTab = container.querySelector(
			'[data-testid="tab-completed"]',
		) as HTMLButtonElement;
		completedTab.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Investigar o Bastião Caído");
			expect(container.innerHTML).toContain("COMPLETED");
		});

		unmount(component);
		container.remove();
	});

	it("deve permitir concluir ou falhar uma missão diretamente através dos botões de ação", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(QuestsPanel, {
			target: container,
			props: {
				repository,
				service,
			},
		});

		// Adiciona a missão de teste
		const testQuestBtn = container.querySelector(
			'[data-testid="add-test-quest-btn"]',
		) as HTMLButtonElement;
		testQuestBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Investigar o Bastião Caído");
		});

		const questId = repository.quests[0]?.id;

		// Clica no botão Falhar
		const failBtn = container.querySelector(
			`[data-testid="fail-quest-${questId}"]`,
		) as HTMLButtonElement;
		expect(failBtn).toBeTruthy();
		failBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Missão marcada como fracassada no diário de campanha.",
			);
			expect(container.innerHTML).toContain("Nenhuma missão ativa no diário.");
		});

		// Clica na aba de histórico para verificar que está como FAILED
		const completedTab = container.querySelector(
			'[data-testid="tab-completed"]',
		) as HTMLButtonElement;
		completedTab.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Investigar o Bastião Caído");
			expect(container.innerHTML).toContain("FAILED");
		});

		unmount(component);
		container.remove();
	});

	it("deve tratar erros no carregamento inicial de missões", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const consoleWarnSpy = vi
			.spyOn(console, "warn")
			.mockImplementation(() => {});

		vi.spyOn(service, "listQuests").mockResolvedValueOnce(
			fail({
				code: "QUEST_REPOSITORY_READ_FAILED",
				message: "Erro ao ler banco de dados",
			}),
		);

		const component = mount(QuestsPanel, {
			target: container,
			props: {
				repository,
				service,
			},
		});

		await vi.waitFor(() => {
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				"Falha ao ler diário de missões do worker.",
			);
		});

		consoleWarnSpy.mockRestore();
		unmount(component);
		container.remove();
	});

	it("deve exibir notificação de erro caso a aceitação de missão falhe", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		vi.spyOn(service, "acceptQuest").mockResolvedValueOnce(
			fail({
				code: "QUEST_REPOSITORY_WRITE_FAILED",
				message: "Erro simulado de gravação de missão",
			}),
		);

		const component = mount(QuestsPanel, {
			target: container,
			props: {
				repository,
				service,
			},
		});

		const testQuestBtn = container.querySelector(
			'[data-testid="add-test-quest-btn"]',
		) as HTMLButtonElement;
		testQuestBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Erro simulado de gravação de missão",
			);
		});

		unmount(component);
		container.remove();
	});

	it("deve exibir notificação de erro se a conclusão de missão falhe", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(QuestsPanel, {
			target: container,
			props: {
				repository,
				service,
			},
		});

		// Adiciona a missão
		const testQuestBtn = container.querySelector(
			'[data-testid="add-test-quest-btn"]',
		) as HTMLButtonElement;
		testQuestBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Investigar o Bastião Caído");
		});

		const questId = repository.quests[0]?.id;

		// Stub completeQuest para retornar erro
		vi.spyOn(service, "completeQuest").mockResolvedValueOnce(
			fail({
				code: "QUEST_REPOSITORY_WRITE_FAILED",
				message: "Erro simulado ao concluir missão",
			}),
		);

		const completeBtn = container.querySelector(
			`[data-testid="complete-quest-${questId}"]`,
		) as HTMLButtonElement;
		completeBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Erro simulado ao concluir missão");
		});

		unmount(component);
		container.remove();
	});

	it("deve exibir notificação de erro se a marcação de falha da missão falhar", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(QuestsPanel, {
			target: container,
			props: {
				repository,
				service,
			},
		});

		const testQuestBtn = container.querySelector(
			'[data-testid="add-test-quest-btn"]',
		) as HTMLButtonElement;
		testQuestBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Investigar o Bastião Caído");
		});

		const questId = repository.quests[0]?.id;

		vi.spyOn(service, "failQuest").mockResolvedValueOnce(
			fail({
				code: "QUEST_REPOSITORY_WRITE_FAILED",
				message: "Erro simulado ao marcar falha",
			}),
		);

		const failBtn = container.querySelector(
			`[data-testid="fail-quest-${questId}"]`,
		) as HTMLButtonElement;
		failBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Erro simulado ao marcar falha");
		});

		unmount(component);
		container.remove();
	});

	it("deve exibir erro se a atualização de progresso do objetivo falhar", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(QuestsPanel, {
			target: container,
			props: {
				repository,
				service,
			},
		});

		const testQuestBtn = container.querySelector(
			'[data-testid="add-test-quest-btn"]',
		) as HTMLButtonElement;
		testQuestBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Investigar o Bastião Caído");
		});

		const questId = repository.quests[0]?.id;
		const objectives = repository.objectives.filter(
			(o) => o.questId === questId,
		);
		const objId = objectives[0]?.id;

		vi.spyOn(service, "updateObjectiveProgress").mockResolvedValueOnce(
			fail({
				code: "QUEST_REPOSITORY_WRITE_FAILED",
				message: "Erro simulado ao atualizar progresso",
			}),
		);

		const completeObjBtn = container.querySelector(
			`[data-testid="complete-obj-${objId}"]`,
		) as HTMLButtonElement;
		completeObjBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain(
				"Erro simulado ao atualizar progresso",
			);
		});

		unmount(component);
		container.remove();
	});

	it("deve lidar com JSON mal formatado em recompensas e requisitos", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const testId = "bad_json_quest";
		// Forçar gravação de quest com JSONs corrompidos diretamente no repository
		await repository.save({
			id: testId,
			title: "Missão Corrompida",
			description: "Missão com JSON inválido para recompensas",
			status: "active",
			scope: "campaign",
			requirementsJson: "{invalid-json-req}",
			rewardsJson: "{invalid-json-rew}",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		const component = mount(QuestsPanel, {
			target: container,
			props: {
				repository,
				service,
			},
		});

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("Missão Corrompida");
		});

		// Não deve haver erro de quebra e a renderização deve tolerar o JSON inválido
		unmount(component);
		container.remove();
	});
});
