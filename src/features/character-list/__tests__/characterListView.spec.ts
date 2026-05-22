import { describe, expect, it } from "vitest";
import type { AncestryRecord } from "$lib/entities/ancestry";
import type { BackgroundRecord } from "$lib/entities/background";
import type { CharacterRecord } from "$lib/entities/character";
import type { CharacterClassRecord } from "$lib/entities/character-class";
import { createCharacterListView } from "../model/characterListView";

const character: CharacterRecord = {
	id: "character-kael",
	name: "Kael de Almar",
	concept: "Vanguarda protetor da caravana",
	ancestryId: "human",
	classId: "vanguard",
	backgroundId: "acolyte",
	level: 1,
	physical: 3,
	mental: 1,
	social: 2,
	conflict: 2,
	interaction: 1,
	resistance: 3,
	createdAt: "2026-05-03T13:14:25.000Z",
	updatedAt: "2026-05-03T13:14:25.000Z",
};

describe("createCharacterListView", () => {
	it("returns an empty state when there are no characters", () => {
		const view = createCharacterListView([]);

		expect(view).toEqual({
			countLabel: "Nenhum personagem",
			emptyState: {
				title: "Nenhum personagem criado ainda",
				description:
					"Use o formulário de criação para adicionar o primeiro personagem desta sessão.",
			},
			items: [],
		});
	});

	it("maps character records to readable list items", () => {
		const view = createCharacterListView([character], {
			ancestries: [{ id: "human", label: "Humano" } as AncestryRecord],
			backgrounds: [{ id: "acolyte", label: "Acólito" } as BackgroundRecord],
			characterClasses: [
				{ id: "vanguard", label: "Vanguarda" } as CharacterClassRecord,
			],
		});

		expect(view.emptyState).toBeUndefined();
		expect(view.countLabel).toBe("1 personagem");
		expect(view.items).toEqual([
			{
				id: "character-kael",
				name: "Kael de Almar",
				concept: "Vanguarda protetor da caravana",
				levelLabel: "Nível 1",
				identityLabel: "Humano · Vanguarda · Acólito",
				axes: [
					{ label: "Físico", value: 3 },
					{ label: "Mental", value: 1 },
					{ label: "Social", value: 2 },
				],
				applications: [
					{ label: "Conflito", value: 2 },
					{ label: "Interação", value: 1 },
					{ label: "Resistência", value: 3 },
				],
				statusEffects: [],
				allowsNaturalRecovery: true,
			},
		]);
	});

	it("falls back to raw ids when catalog labels are missing", () => {
		const view = createCharacterListView([character]);

		expect(view.items[0]?.identityLabel).toBe("human · vanguard · acolyte");
	});

	it("uses plural count copy for multiple characters", () => {
		const view = createCharacterListView([
			character,
			{ ...character, id: "character-mira", name: "Mira de Umbra" },
		]);

		expect(view.countLabel).toBe("2 personagens");
	});

	it("applies status effect decorators (Eter Fever) and recalculates stats dynamically", () => {
		const view = createCharacterListView([character], {
			ancestries: [{ id: "human", label: "Humano" } as AncestryRecord],
			backgrounds: [{ id: "acolyte", label: "Acólito" } as BackgroundRecord],
			characterClasses: [
				{
					id: "vanguard",
					label: "Vanguarda",
					baseHp: 10,
				} as unknown as CharacterClassRecord,
			],
			statusEffects: [
				{
					id: "effect-fever",
					characterId: "character-kael",
					type: "eter_fever",
					severity: 2,
					severityMax: 4,
					isAggravated: false,
					createdAt: "2026-05-03T13:14:25.000Z",
					// biome-ignore lint/suspicious/noExplicitAny: test fixtures dynamic mapping
				} as any,
			],
		});

		const item = view.items[0];
		expect(item).toBeDefined();
		if (!item) return;
		expect(item.statusEffects).toEqual([
			{
				id: "effect-fever",
				type: "eter_fever",
				label: "Febre de Éter",
				severity: 2,
				isAggravated: false,
			},
		]);

		// Mental caiu de 1 para 0
		const mentalStat = item.axes.find((s) => s.label === "Mental");
		expect(mentalStat).toEqual({ label: "Mental", value: 0, baseValue: 1 });

		// Resistência (aplicações) caiu de 3 para 2
		const resistanceStat = item.applications.find(
			(s) => s.label === "Resistência",
		);
		expect(resistanceStat).toEqual({
			label: "Resistência",
			value: 2,
			baseValue: 3,
		});

		// Outros eixos intactos e sem baseValue exposto por não terem sido penalizados!
		const physicalStat = item.axes.find((s) => s.label === "Físico");
		expect(physicalStat).toEqual({ label: "Físico", value: 3 });
	});

	it("applies multiple decorators (Wound Infection + Eter Fever) in onion pattern", () => {
		const view = createCharacterListView([character], {
			ancestries: [{ id: "human", label: "Humano" } as AncestryRecord],
			backgrounds: [{ id: "acolyte", label: "Acólito" } as BackgroundRecord],
			characterClasses: [
				{
					id: "vanguard",
					label: "Vanguarda",
					baseHp: 10,
				} as unknown as CharacterClassRecord,
			],
			statusEffects: [
				{
					id: "effect-inf",
					characterId: "character-kael",
					type: "wound_infection",
					severity: 1,
					severityMax: 3,
					isAggravated: false,
					createdAt: "2026-05-03T13:14:25.000Z",
					// biome-ignore lint/suspicious/noExplicitAny: test fixtures dynamic mapping
				} as any,
				{
					id: "effect-fever",
					characterId: "character-kael",
					type: "eter_fever",
					severity: 2,
					severityMax: 4,
					isAggravated: false,
					createdAt: "2026-05-03T13:14:25.000Z",
					// biome-ignore lint/suspicious/noExplicitAny: test fixtures dynamic mapping
				} as any,
			],
		});

		const item = view.items[0];
		expect(item).toBeDefined();
		if (!item) return;
		expect(item.allowsNaturalRecovery).toBe(false); // Infecção de ferida impede cura natural
		expect(item.statusEffects.length).toBe(2);

		// Físico caiu de 3 para 2 por conta de Wound Infection
		const physicalStat = item.axes.find((s) => s.label === "Físico");
		expect(physicalStat).toEqual({ label: "Físico", value: 2, baseValue: 3 });

		// Mental caiu de 1 para 0 por conta de Eter Fever
		const mentalStat = item.axes.find((s) => s.label === "Mental");
		expect(mentalStat).toEqual({ label: "Mental", value: 0, baseValue: 1 });

		// Resistência caiu de 3 para 2 por conta de Eter Fever
		const resistanceStat = item.applications.find(
			(s) => s.label === "Resistência",
		);
		expect(resistanceStat).toEqual({
			label: "Resistência",
			value: 2,
			baseValue: 3,
		});
	});

	it("applies Viper Poison and Hungry decorators, handles unknown effects, and fallback classes", () => {
		const view = createCharacterListView([character], {
			ancestries: [{ id: "human", label: "Humano" } as AncestryRecord],
			backgrounds: [{ id: "acolyte", label: "Acólito" } as BackgroundRecord],
			characterClasses: [], // força classe vazia para usar o fallback
			statusEffects: [
				{
					id: "effect-poison",
					characterId: "character-kael",
					type: "viper_poison",
					severity: 1,
					severityMax: 3,
					isAggravated: false,
					createdAt: "2026-05-03T13:14:25.000Z",
				} as any,
				{
					id: "effect-hungry",
					characterId: "character-kael",
					type: "hungry",
					severity: 1,
					severityMax: 3,
					isAggravated: false,
					createdAt: "2026-05-03T13:14:25.000Z",
				} as any,
				{
					id: "effect-unknown",
					characterId: "character-kael",
					type: "unknown_effect",
					severity: 1,
					severityMax: 3,
					isAggravated: false,
					createdAt: "2026-05-03T13:14:25.000Z",
				} as any,
			],
		});

		const item = view.items[0];
		expect(item).toBeDefined();
		if (!item) return;

		// Verifica o fallback de classe ausente
		expect(item.identityLabel).toBe("Humano · vanguard · Acólito");

		// Verifica se o efeito desconhecido usa o tipo bruto como label
		const unknownEffect = item.statusEffects.find(
			(e) => e.type === "unknown_effect",
		);
		expect(unknownEffect?.label).toBe("unknown_effect");

		// Físico caiu de 3 para 0 por conta de Viper Poison (-2) e Hungry (-1)
		const physicalStat = item.axes.find((s) => s.label === "Físico");
		expect(physicalStat).toEqual({ label: "Físico", value: 0, baseValue: 3 });

		// Mental caiu de 1 para 0 por conta de Hungry (-1)
		const mentalStat = item.axes.find((s) => s.label === "Mental");
		expect(mentalStat).toEqual({ label: "Mental", value: 0, baseValue: 1 });

		// Social permaneceu intacto (2)
		const socialStat = item.axes.find((s) => s.label === "Social");
		expect(socialStat).toEqual({ label: "Social", value: 2 });
	});
});
