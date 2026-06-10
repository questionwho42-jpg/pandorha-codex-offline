// @vitest-environment happy-dom

import { mount, unmount } from "svelte";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { CharacterRecord } from "$lib/entities/character";
import type { CharacterClassRecord } from "$lib/entities/character-class";
import { ok } from "$lib/shared/lib/result";
import type {
	CombatEncounterInput,
	CombatEncounterState,
} from "../model/combatEncounterTypes";
import { DEFAULT_COMBAT_TRAINING_ATTACKER } from "../model/combatSessionAttacker";
import { TRAINING_TARGETS } from "../model/combatTrainingTargetCatalog";
import CombatEncounterPanel from "../ui/CombatEncounterPanel.svelte";

// Mock das dependências de browser globais no ambiente Node/Happy-DOM
beforeAll(() => {
	// Mock do Worker do banco SQLite
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

describe("CombatEncounterPanel (UI Reativa Svelte 5)", () => {
	const mockCharacter: CharacterRecord = {
		id: "aria",
		name: "Aria",
		concept: "Sentinela de teste",
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

	const mockClass: CharacterClassRecord = {
		id: "vanguard",
		label: "Vanguarda",
		epithet: "O escudo da party",
		sourceFile: "vanguard.json",
		primaryAttributesText: "Físico",
		baseHp: 10,
		resourceText: "Vontade",
		equipmentText: "Armadura Pesada",
		passiveAbilityName: "Baluarte",
		passiveAbilityDescription: "Reduz dano",
		initialTalentChoiceCount: 1,
		initialTalentOptionsText: "Opções",
	};

	const createMockState = (targetHp: number): CombatEncounterState => {
		return {
			attacker: { id: "aria", label: "Aria" },
			target: {
				id: "training-guard",
				label: "Guarda de Treino",
				currentHitPoints: targetHp,
				armorClass: 15,
			},
			wasHit: true,
			resolution: {
				degree: "success",
				total: 18,
				margin: 3,
				dc: 15,
				level: 1,
				axisValue: 2,
				applicationValue: 2,
				itemBonus: 0,
				isNaturalSuccess: false,
				isNaturalFailure: false,
				dice: {
					naturalRoll: 10,
					sides: 20,
					isNaturalCritical: false,
					isNaturalFailure: false,
					auditEntry: {
						rollId: "roll-1",
						reason: "Ataque",
						sides: 20,
						naturalRoll: 10,
						createdAt: new Date().toISOString(),
					},
				},
				breakdown: {
					naturalRoll: 10,
					level: 1,
					axisValue: 2,
					applicationValue: 2,
					itemBonus: 0,
				},
			},
			damage: {
				damageType: "physical",
				baseDamage: 5,
				afterCritical: 5,
				afterReduction: 5,
				finalDamage: 5,
				appliedAffinities: [],
				breakdown: {
					baseDiceTotal: 3,
					matrixValue: 2,
					extraModifierTotal: 0,
					criticalMultiplier: 1,
					damageReduction: 0,
					vulnerabilityBonusDamage: 0,
				},
			},
			events: [],
			log: ["Aria atacou Guarda de Treino causando 5 de dano."],
			processedCommand: {
				commandId: "cmd-1",
				commandType: "attack",
				processedAt: new Date().toISOString(),
			},
		};
	};

	it("deve montar e renderizar os nomes dos personagens de teste no DOM", () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		const props = {
			attacker: DEFAULT_COMBAT_TRAINING_ATTACKER,
			characterClasses: [mockClass],
			characters: [mockCharacter],
			companions: [],
			initialTarget: TRAINING_TARGETS[0],
			trainingTargets: TRAINING_TARGETS,
			resolveAttack: vi.fn().mockReturnValue(ok(createMockState(13))),
			createAttackInput: (
				a: { id: string; label: string },
				t: { id: string; label: string; armorClass: number },
				hp: number,
				_p: unknown,
			): CombatEncounterInput => ({
				command: { id: "cmd", type: "attack" },
				attacker: a,
				target: { ...t, currentHitPoints: hp },
				attack: {
					reason: "test",
					level: 1,
					axisValue: 2,
					applicationValue: 2,
					itemBonus: 0,
				},
				damage: {
					damageType: "physical",
					baseDiceTotal: 4,
					matrixValue: 2,
					extraModifierTotal: 0,
					damageReduction: 0,
					vulnerabilityBonusDamage: 0,
					affinities: [],
				},
			}),
		};

		const component = mount(CombatEncounterPanel, {
			target: container,
			props,
		});

		expect(container.innerHTML).toContain("Guarda de Treino");
		expect(container.innerHTML).toContain("Aria");
		expect(container.innerHTML).toContain("Rodada 1");

		unmount(component);
		container.remove();
	});

	it("deve atualizar reativamente a UI e o HP do alvo após o clique no botão de ataque", async () => {
		const container = document.createElement("div");
		document.body.appendChild(container);

		// O alvo começa com 18 HP, e o mock resolve em sucesso reduzindo para 13 HP
		const resolveAttackSpy = vi.fn().mockReturnValue(ok(createMockState(13)));

		const props = {
			attacker: DEFAULT_COMBAT_TRAINING_ATTACKER,
			characterClasses: [mockClass],
			characters: [mockCharacter],
			companions: [],
			initialTarget: TRAINING_TARGETS[0],
			trainingTargets: TRAINING_TARGETS,
			resolveAttack: resolveAttackSpy,
			createAttackInput: (
				a: { id: string; label: string },
				t: { id: string; label: string; armorClass: number },
				hp: number,
				_p: unknown,
			): CombatEncounterInput => ({
				command: { id: "cmd", type: "attack" },
				attacker: a,
				target: { ...t, currentHitPoints: hp },
				attack: {
					reason: "test",
					level: 1,
					axisValue: 2,
					applicationValue: 2,
					itemBonus: 0,
				},
				damage: {
					damageType: "physical",
					baseDiceTotal: 4,
					matrixValue: 2,
					extraModifierTotal: 0,
					damageReduction: 0,
					vulnerabilityBonusDamage: 0,
					affinities: [],
				},
			}),
		};

		const component = mount(CombatEncounterPanel, {
			target: container,
			props,
		});

		// Encontra o botão de ataque
		const attackButton = container.querySelector(
			'[data-testid="combat-attack-button"]',
		) as HTMLButtonElement;

		expect(attackButton).toBeDefined();
		expect(attackButton.disabled).toBe(false);

		// Simula o clique no botão de ataque
		attackButton.click();

		// Aguarda o ciclo de atualização reativa do microtask queue do DOM
		await vi.waitFor(() => {
			expect(resolveAttackSpy).toHaveBeenCalled();
			expect(container.innerHTML).toContain("HP 13");
			expect(container.innerHTML).toContain(
				"Aria atacou Guarda de Treino causando 5 de dano.",
			);
		});

		unmount(component);
		container.remove();
	});
});
