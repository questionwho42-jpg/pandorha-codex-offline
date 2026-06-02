import { describe, expect, it } from "vitest";
import type { CharacterRecord } from "$lib/entities/character";
import {
	createCombatAttackerOptions,
	createCombatTrainingAttackProfile,
} from "$lib/features/combat-encounter/model-api";
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
				createCombatTrainingAttackProfile({
					attacker,
					characters: [createCharacterRecord()],
				}),
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

	it("uses the training attack profile damage matrix in the combat input", () => {
		const session = createCombatEncounterSession();
		const attacker = createCombatAttackerOptions([
			createCharacterRecord({ physical: 3 }),
		])[1];

		expect(attacker).toBeDefined();
		if (!attacker) {
			return;
		}

		const input = session.createAttackInput(
			attacker,
			session.initialTarget,
			session.initialTarget.currentHitPoints,
			createCombatTrainingAttackProfile({
				attacker,
				characters: [createCharacterRecord({ physical: 3 })],
			}),
		);

		expect(input.damage.matrixValue).toBe(3);
		expect(input.damage.baseDiceTotal).toBe(4);
		expect(input.damage.extraModifierTotal).toBe(3);
	});

	it("builds the default weapon loadout for session-character combat", async () => {
		const session = createCombatEncounterSession();
		const attacker = createCombatAttackerOptions([
			createCharacterRecord({ physical: 3 }),
		])[1];

		expect(attacker).toBeDefined();
		if (!attacker) {
			return;
		}

		expect(session.defaultWeaponId).toBe("longsword");
		expect(session.equipmentWeapons.map((weapon) => weapon.id)).toEqual([
			"longsword",
			"dagger",
			"longbow",
		]);

		const loadout = await session.buildEquipmentLoadout({
			mainHandWeaponId: session.defaultWeaponId,
		});

		expect(loadout.success).toBe(true);
		if (!loadout.success) {
			return;
		}
		expect(loadout.data.activeWeaponProfile).toMatchObject({
			diceExpression: "1d8",
			id: "longsword",
			label: "Espada Longa",
		});
		const activeWeaponProfile = loadout.data.activeWeaponProfile;
		expect(activeWeaponProfile).not.toBeNull();
		if (!activeWeaponProfile) {
			return;
		}

		const profile = createCombatTrainingAttackProfile({
			attacker,
			characters: [createCharacterRecord({ physical: 3 })],
			equippedWeapon: activeWeaponProfile,
		});

		expect(profile).toMatchObject({
			extraModifierTotal: 0,
			source: "equipmentWeapon",
			summaryLabel: "Espada Longa: 1d8 (rolado no ataque) + F\u00edsico 3",
			weaponLabel: "Espada Longa",
		});
		const attackInput = session.createAttackInput(
			attacker,
			session.initialTarget,
			session.initialTarget.currentHitPoints,
			profile,
		);

		expect(attackInput.damage.weaponDice).toEqual({
			expression: "1d8",
			label: "Espada Longa",
		});
		const state = session.service.resolveAttack(attackInput);

		expect(state.success).toBe(true);
		if (!state.success) {
			return;
		}
		expect(state.data.damage?.breakdown.baseDiceTotal).toBe(4);
		expect(state.data.weaponDamageRoll?.auditEntry).toMatchObject({
			reason: "Dano de arma: Espada Longa (1d8)",
			rollId: "combat-roll-2",
			sides: 8,
		});
	});

	it("feeds selected training target defenses into the damage pipeline", async () => {
		const session = createCombatEncounterSession();
		const attacker = createCombatAttackerOptions([
			createCharacterRecord({ physical: 3 }),
		])[1];
		const target = session.trainingTargets.find(
			(trainingTarget) => trainingTarget.id === "training-duelist",
		);

		expect(attacker).toBeDefined();
		expect(target).toBeDefined();
		if (!attacker || !target) {
			return;
		}

		const loadout = await session.buildEquipmentLoadout({
			mainHandWeaponId: session.defaultWeaponId,
		});

		expect(loadout.success).toBe(true);
		if (!loadout.success || loadout.data.activeWeaponProfile === null) {
			return;
		}

		const profile = createCombatTrainingAttackProfile({
			attacker,
			characters: [createCharacterRecord({ physical: 3 })],
			equippedWeapon: loadout.data.activeWeaponProfile,
		});
		const attackInput = session.createAttackInput(
			attacker,
			target,
			target.currentHitPoints,
			profile,
		);

		expect(attackInput.damage.damageReduction).toBe(1);
		expect(attackInput.damage.affinities).toEqual([
			{ damageType: "physical", kind: "resistance" },
		]);

		const state = session.service.resolveAttack(attackInput);

		expect(state.success).toBe(true);
		if (!state.success) {
			return;
		}
		expect(state.data.damage?.breakdown).toMatchObject({
			baseDiceTotal: 4,
			damageReduction: 1,
			matrixValue: 3,
		});
		expect(state.data.damage?.afterReduction).toBe(6);
		expect(state.data.damage?.appliedAffinities).toEqual(["resistance"]);
		expect(state.data.damage?.finalDamage).toBe(3);
		expect(state.data.target.currentHitPoints).toBe(11);
	});
});

function createCharacterRecord(
	patch: Partial<CharacterRecord> = {},
): CharacterRecord {
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
		...patch,
	};
}
