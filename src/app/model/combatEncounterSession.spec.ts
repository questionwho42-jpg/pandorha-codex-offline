import { describe, expect, it } from "vitest";
import type { CharacterRecord } from "$lib/entities/character";
import { createCombatAttackerOptions } from "$lib/features/combat-encounter/model-api";
import { createCombatEncounterSession } from "./combatEncounterSession";

describe("createCombatEncounterSession", () => {
	it("uses a session character attacker without leaking UI metadata into combat input", () => {
		const session = createCombatEncounterSession();
		const attacker = createCombatAttackerOptions([createCharacterRecord()])[1];

		expect(attacker).toBeDefined();
		if (!attacker) {
			return;
		}
		const result = session.service.resolveAttack(
			session.createAttackInput(
				attacker,
				session.initialTarget,
				session.initialTarget.currentHitPoints,
			),
		);

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(result.data.attacker).toEqual({
			id: "session-character-1",
			label: "Lia",
		});
		expect(result.data.log[0]).toBe(
			"Lia preparou um ataque contra Guarda de Treino.",
		);
	});
});

function createCharacterRecord(): CharacterRecord {
	return {
		id: "session-character-1",
		name: "Lia",
		concept: "Sentinela de teste",
		ancestryId: "human",
		classId: "vanguard",
		backgroundId: "acolyte",
		level: 1,
		physical: 2,
		mental: 2,
		social: 2,
		conflict: 2,
		interaction: 2,
		resistance: 2,
		createdAt: "2026-05-06T18:19:31.000Z",
		updatedAt: "2026-05-06T18:19:31.000Z",
	};
}
