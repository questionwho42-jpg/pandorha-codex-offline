import { describe, expect, it } from "vitest";
import type { CombatEncounterActorRef, CombatEncounterState } from "../index";
import {
	type CombatEncounterViewInput,
	createCombatEncounterView,
} from "../model/combatEncounterView";

describe("createCombatEncounterView", () => {
	it("shows the initial encounter as ready", () => {
		const view = createCombatEncounterView(createViewInput());

		expect(view.attackerLabel).toBe("Aria");
		expect(view.targetLabel).toBe("Guarda de Treino");
		expect(view.targetArmorClassLabel).toBe("CA 15");
		expect(view.targetHitPointsLabel).toBe("HP 18");
		expect(view.statusLabel).toBe("Encontro pronto");
		expect(view.resultSummary).toBe("Nenhum ataque resolvido ainda.");
		expect(view.canAttack).toBe(true);
	});

	it("uses an empty log instruction before the first attack", () => {
		const view = createCombatEncounterView(createViewInput());

		expect(view.logItems).toEqual([
			"Clique em Atacar para registrar a primeira ação do encontro.",
		]);
	});

	it("shows damage and remaining HP after a hit", () => {
		const view = createCombatEncounterView(
			createViewInput({
				targetHitPoints: 9,
				lastState: createState({ targetHitPoints: 9, finalDamage: 9 }),
				log: [
					"Aria preparou um ataque contra Guarda de Treino.",
					"Guarda de Treino sofreu 9 de dano. HP restante: 9.",
				],
			}),
		);

		expect(view.statusLabel).toBe("Guarda de Treino está ferido");
		expect(view.targetHitPointsLabel).toBe("HP 9");
		expect(view.resultSummary).toBe(
			"Último ataque: sucesso. Dano final: 9. HP restante: 9.",
		);
		expect(view.logItems).toEqual([
			"Aria preparou um ataque contra Guarda de Treino.",
			"Guarda de Treino sofreu 9 de dano. HP restante: 9.",
		]);
	});

	it("marks the target as defeated when HP reaches zero", () => {
		const view = createCombatEncounterView(
			createViewInput({
				targetHitPoints: 0,
				lastState: createState({ targetHitPoints: 0, finalDamage: 18 }),
			}),
		);

		expect(view.statusLabel).toBe("Guarda de Treino foi derrotado");
		expect(view.resultSummary).toBe(
			"Último ataque: sucesso. Dano final: 18. HP restante: 0.",
		);
		expect(view.canAttack).toBe(false);
		expect(view.isTargetDefeated).toBe(true);
	});

	it("surfaces a pt-BR error message", () => {
		const view = createCombatEncounterView(
			createViewInput({
				errorMessage: "Não foi possível resolver o ataque.",
			}),
		);

		expect(view.errorMessage).toBe("Não foi possível resolver o ataque.");
	});
});

function createViewInput(
	overrides: Partial<CombatEncounterViewInput> = {},
): CombatEncounterViewInput {
	return {
		attacker: { id: "aria", label: "Aria" },
		target: {
			id: "training-guard",
			label: "Guarda de Treino",
			currentHitPoints: 18,
			armorClass: 15,
		},
		targetHitPoints: 18,
		lastState: null,
		log: [],
		errorMessage: null,
		...overrides,
	};
}

function createState(input: {
	readonly targetHitPoints: number;
	readonly finalDamage: number;
}): CombatEncounterState {
	const attacker: CombatEncounterActorRef = { id: "aria", label: "Aria" };
	const target = {
		id: "training-guard",
		label: "Guarda de Treino",
		currentHitPoints: input.targetHitPoints,
		armorClass: 15,
	};

	return {
		attacker,
		target,
		wasHit: true,
		resolution: {
			degree: "success",
			total: 18,
			margin: 3,
			dc: 15,
			level: 2,
			axisValue: 3,
			applicationValue: 2,
			itemBonus: 1,
			isNaturalSuccess: false,
			isNaturalFailure: false,
			dice: {
				naturalRoll: 10,
				sides: 20,
				isNaturalCritical: false,
				isNaturalFailure: false,
				auditEntry: {
					rollId: "combat-roll-1",
					reason: "Ataque corpo a corpo",
					sides: 20,
					naturalRoll: 10,
					createdAt: "2026-05-06T12:30:00.000Z",
				},
			},
			breakdown: {
				naturalRoll: 10,
				level: 2,
				axisValue: 3,
				applicationValue: 2,
				itemBonus: 1,
			},
		},
		damage: {
			damageType: "physical",
			baseDamage: input.finalDamage,
			afterCritical: input.finalDamage,
			afterReduction: input.finalDamage,
			finalDamage: input.finalDamage,
			appliedAffinities: [],
			breakdown: {
				baseDiceTotal: 4,
				matrixValue: 2,
				extraModifierTotal: 3,
				criticalMultiplier: 1,
				damageReduction: 0,
				vulnerabilityBonusDamage: 0,
			},
		},
		events: [],
		log: [],
		processedCommand: {
			commandId: "attack-1",
			commandType: "attack",
			processedAt: "2026-05-06T12:30:01.000Z",
		},
	};
}
