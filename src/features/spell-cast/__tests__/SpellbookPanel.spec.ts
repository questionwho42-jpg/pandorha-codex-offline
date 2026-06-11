// @vitest-environment happy-dom

import { mount, unmount } from "svelte";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { OFFICIAL_SPELLS } from "$lib/entities/spell";
import { ok } from "$lib/shared/lib/result";
import SpellbookPanel from "../ui/SpellbookPanel.svelte";

beforeAll(() => {
	// Mock element.animate to avoid Svelte transition errors under Happy-DOM
	Element.prototype.animate = vi.fn().mockReturnValue({
		finished: Promise.resolve(),
		cancel: vi.fn(),
		pause: vi.fn(),
		play: vi.fn(),
		reverse: vi.fn(),
	});
});

describe("SpellbookPanel (UI Rúnica Svelte 5)", () => {
	const mockCaster = {
		id: "elara",
		label: "Elara",
		availableEther: 10,
	};

	const mockTargets = [{ id: "goblin", label: "Goblin Recruta" }];

	it("deve montar e renderizar o grimório no estado Draft", () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const component = mount(SpellbookPanel, {
			target: container,
			props: {
				caster: mockCaster,
				spells: OFFICIAL_SPELLS.slice(0, 3),
				targets: mockTargets,
				onCastSpell: vi.fn(),
				buildCastCommand: vi.fn(),
			},
		});

		expect(container.innerHTML).toContain("Elara");
		expect(container.innerHTML).toContain("1. DRAFT");
		expect(container.innerHTML).toContain("Goblin Recruta");

		unmount(component);
		container.remove();
	});

	it("deve avançar no fluxo Draft -> Weaving -> Audit -> Commit ao clicar nos botões", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const onCastSpellSpy = vi.fn().mockResolvedValue(ok({}));
		const buildCastCommandSpy = vi.fn().mockResolvedValue(
			ok({
				draft: {
					casterId: "elara",
					spellId: OFFICIAL_SPELLS[0]?.id ?? "",
					spellLabel: OFFICIAL_SPELLS[0]?.label ?? "",
					targetId: "goblin",
					flow: "Commit",
				},
				audit: {
					baseEtherCost: OFFICIAL_SPELLS[0]?.etherCost ?? 0,
					metamagicEtherCost: 1,
					totalEtherCost: (OFFICIAL_SPELLS[0]?.etherCost ?? 0) + 1,
					availableEther: 10,
				},
				command: {
					id: "cmd-1",
					type: "cast-spell",
					source: "SpellCastBuilderService",
					createdAt: new Date().toISOString(),
					payload: {},
				},
			}),
		);

		const component = mount(SpellbookPanel, {
			target: container,
			props: {
				caster: mockCaster,
				spells: OFFICIAL_SPELLS.slice(0, 3),
				targets: mockTargets,
				onCastSpell: onCastSpellSpy,
				buildCastCommand: buildCastCommandSpy,
			},
		});

		// 1. Passo Draft: Seleciona e clica no botão "Iniciar Tecitura"
		const startWeavingBtn = container.querySelector(
			'[data-testid="start-weaving-button"]',
		) as HTMLButtonElement;
		expect(startWeavingBtn).toBeDefined();
		startWeavingBtn.click();

		await vi.waitFor(() => {
			expect(container.innerHTML).toContain("2. WEAVING");
		});

		// 2. Passo Weaving: Seleciona uma metamagia e clica em "Auditar Feitiço"
		const distantMetamagicInput = container.querySelector(
			'[data-testid="metamagic-checkbox-distant-spell"]',
		) as HTMLInputElement;
		expect(distantMetamagicInput).toBeDefined();
		distantMetamagicInput.click();

		const runAuditBtn = container.querySelector(
			'[data-testid="run-audit-button"]',
		) as HTMLButtonElement;
		expect(runAuditBtn).toBeDefined();
		runAuditBtn.click();

		await vi.waitFor(() => {
			expect(buildCastCommandSpy).toHaveBeenCalled();
			expect(container.innerHTML).toContain("3. AUDIT");
		});

		// 3. Passo Audit: Confirma a conjuração
		const confirmCastBtn = container.querySelector(
			'[data-testid="confirm-cast-button"]',
		) as HTMLButtonElement;
		expect(confirmCastBtn).toBeDefined();
		confirmCastBtn.click();

		await vi.waitFor(() => {
			expect(onCastSpellSpy).toHaveBeenCalled();
			expect(container.innerHTML).toContain("4. COMMIT");
			expect(container.innerHTML).toContain("sucesso");
		});

		unmount(component);
		container.remove();
	});
});
