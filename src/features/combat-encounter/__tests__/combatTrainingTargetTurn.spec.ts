import { describe, expect, it } from "vitest";
import { DEFAULT_TRAINING_TARGET } from "../model/combatTrainingTargetCatalog";
import { createCombatTrainingTargetTurnLog } from "../model/combatTrainingTargetTurn";

describe("createCombatTrainingTargetTurnLog", () => {
	it("records that the training target holds position on its turn", () => {
		const log = createCombatTrainingTargetTurnLog({
			activeActorId: "training-guard",
			target: DEFAULT_TRAINING_TARGET,
		});

		expect(log).toBe(
			"Guarda de Treino mantém posição. O alvo de treino ainda não possui IA nesta versão.",
		);
	});

	it("does not record a target action during the attacker turn", () => {
		const log = createCombatTrainingTargetTurnLog({
			activeActorId: "aria",
			target: DEFAULT_TRAINING_TARGET,
		});

		expect(log).toBeNull();
	});
});
