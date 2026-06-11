// @vitest-environment happy-dom

import { mount, unmount } from "svelte";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { CharacterRecord } from "$lib/entities/character/model/characterSchema";
import InventoryPanel from "../ui/InventoryPanel.svelte";

beforeAll(() => {
	// Mock do localStorage e Worker caso necessário
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

describe("InventoryPanel (UI Reativa Svelte 5)", () => {
	const mockCharacter: CharacterRecord = {
		id: "darian",
		name: "Darian",
		concept: "Guerreiro de teste",
		ancestryId: "human",
		classId: "vanguard",
		backgroundId: "acolyte",
		level: 1,
		experiencePoints: 0,
		tensionMeter: 0,
		physical: 2,
		mental: 2,
		social: 2,
		conflict: 2,
		interaction: 2,
		resistance: 2,
		createdAt: "2026-05-06T18:19:31.000Z",
		updatedAt: "2026-05-06T18:19:31.000Z",
	};

	it("deve montar e renderizar os nomes dos personagens de teste e itens na mochila", () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(InventoryPanel, {
			target: container,
			props: {
				characters: [mockCharacter],
				activeStatusEffects: [],
			},
		});

		expect(container.innerHTML).toContain("Darian");
		expect(container.innerHTML).toContain("Mochila Ativa");
		expect(container.innerHTML).toContain("Espada Longa");

		unmount(component);
		container.remove();
	});

	it("deve alternar reativamente o equipamento do herói após duplo clique", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(InventoryPanel, {
			target: container,
			props: {
				characters: [mockCharacter],
				activeStatusEffects: [],
			},
		});

		// Encontra a Adaga (está na mochila inicialmente por ser omitida do pré-equipamento)
		const daggerElement = container.querySelector(
			'[data-testid="item-dagger"]',
		) as HTMLElement;
		expect(daggerElement).toBeDefined();

		// Simula duplo clique para equipar a adaga
		daggerElement.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));

		// Aguarda o ciclo de renderização reativa
		await vi.waitFor(() => {
			// A adaga deve agora ser exibida no slot de mão
			const mainHandSlot = container.querySelector(
				'[data-testid="slot-mainhand"]',
			) as HTMLElement;
			expect(mainHandSlot.innerHTML).toContain("Adaga");
		});

		unmount(component);
		container.remove();
	});

	it("deve recalcular a capacidade e o peso total ao desequipar um item", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(InventoryPanel, {
			target: container,
			props: {
				characters: [mockCharacter],
				activeStatusEffects: [],
			},
		});

		// O componente começa com Longsword equipada na Mão Principal
		const mainHandSlot = container.querySelector(
			'[data-testid="slot-mainhand"]',
		) as HTMLElement;
		expect(mainHandSlot.innerHTML).toContain("Espada Longa");

		// Verifica exibição de capacidade inicial (com espada, armadura, escudo, ração)
		const capacityDisplay = container.querySelector(
			'[data-testid="capacity-display"]',
		) as HTMLElement;
		expect(capacityDisplay.innerHTML).toContain("5 / 10 Slots");

		// Desequipa a espada longa dando duplo clique nela
		const swordElement = mainHandSlot.querySelector("div") as HTMLElement;
		swordElement.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));

		await vi.waitFor(() => {
			// Espada deve sair do slot da mão
			expect(mainHandSlot.innerHTML).not.toContain("Espada Longa");
			// Capacidade total deve continuar sendo 5 (todos os itens continuam carregados, na mochila)
			expect(capacityDisplay.innerHTML).toContain("5 / 10 Slots");
		});

		unmount(component);
		container.remove();
	});
});
