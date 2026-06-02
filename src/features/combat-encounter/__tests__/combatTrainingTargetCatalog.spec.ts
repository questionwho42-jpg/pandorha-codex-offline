import { describe, expect, it } from "vitest";
import {
	DEFAULT_TRAINING_TARGET,
	findTrainingTargetById,
	TRAINING_TARGETS,
	toCombatEncounterTargetState,
} from "../model/combatTrainingTargetCatalog";

describe("combatTrainingTargetCatalog", () => {
	it("keeps the default training guard without defensive modifiers", () => {
		expect(DEFAULT_TRAINING_TARGET).toMatchObject({
			affinities: [],
			damageReduction: 0,
			id: "training-guard",
		});
	});

	it("exposes lightweight defenses for the duelist target", () => {
		const duelist = findTrainingTargetById("training-duelist");

		expect(duelist).toBeDefined();
		if (!duelist) {
			return;
		}
		expect(duelist.damageReduction).toBe(1);
		expect(duelist.affinities).toEqual([
			{ damageType: "physical", kind: "resistance" },
		]);
	});

	it("does not leak training defenses into the encounter target identity", () => {
		const duelist = TRAINING_TARGETS.find(
			(target) => target.id === "training-duelist",
		);

		expect(duelist).toBeDefined();
		if (!duelist) {
			return;
		}
		expect(toCombatEncounterTargetState(duelist)).toEqual({
			armorClass: 17,
			currentHitPoints: 14,
			id: "training-duelist",
			label: "Duelista de Treino",
		});
	});
});
